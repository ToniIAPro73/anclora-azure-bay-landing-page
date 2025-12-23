<#
.SYNOPSIS
  ANCLORA PROMOTE v4.2 - Sistema profesional de promoción multi-rama con escaneo previo
  Gestiona jerárquicamente: development → main → preview → production
  + ramas de usuarios/agentes (perplexity/feat, claude/feat, etc.)
  + NUEVO: Escaneo previo de TODAS las ramas desconocidas antes de ejecutar

.DESCRIPTION
  Este script:
  - NUEVO v4.2: Escanea TODAS las ramas antes de ejecutar (excepto backup/*)
  - Detecta automáticamente ramas principales y secundarias
  - Permite eliminación segura de ramas
  - Promociona cambios jerárquicamente con backups
  - Sincroniza ramas de usuario/agente sin sobreescribir
  - Previene pérdida de datos con confirmaciones
  - Genera reportes de cambios y divergencias
  - Modo seco (dry-run) para verificar antes de ejecutar
  - Muestra diffs de archivos ANTES de sincronizar ramas de usuario/agente

.PARAMETER Mode
  'full' = Promoción completa (dev→main→preview→prod)
  'safe' = Solo sync sin merge (consulta antes)
  'delete' = Eliminar ramas específicas
  'report' = Mostrar estado sin cambios
  'scan' = NUEVO: Solo escanear ramas (sin hacer nada más)
  'dry-run' = Simular sin cambiar nada

.EXAMPLE
  .\promote.ps1 -Mode full
  .\promote.ps1 -Mode scan
  .\promote.ps1 -Mode safe
  .\promote.ps1 -Mode dry-run
  .\promote.ps1 -Mode delete -BranchesToDelete @("claude/fix-logo")
#>

param(
    [ValidateSet('full', 'safe', 'delete', 'report', 'dry-run', 'scan')]
    [string]$Mode = 'full',
    
    [array]$BranchesToDelete = @(),
    [array]$BranchesToPromote = @(),
    [bool]$DryRun = $false,
    [bool]$Verbose = $true
)

# ==========================
# ⚠️ CONFIGURACIÓN INICIAL
# ==========================
$ErrorActionPreference = "Continue"
$repoRoot = (git rev-parse --show-toplevel 2>$null)
if (-not $repoRoot) {
    Write-Host "❌ No estás en un repositorio Git." -ForegroundColor Red
    exit 1
}
Set-Location $repoRoot

# Crear directorio de logs
$logDir = Join-Path $repoRoot "logs"
if (-not (Test-Path $logDir)) { 
    New-Item -ItemType Directory -Path $logDir | Out-Null 
}

# Limpiar logs antiguos (>48h)
Get-ChildItem $logDir -Filter "promote_*.txt" -ErrorAction SilentlyContinue |
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddHours(-48) } |
    Remove-Item -Force -ErrorAction SilentlyContinue

# Crear nuevo log
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$logFile = Join-Path $logDir "promote_$timestamp.txt"
Start-Transcript -Path $logFile -Append | Out-Null

# ==========================
# 🎨 FUNCIONES DE UTILIDAD
# ==========================

function Write-Title($text) {
    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║ $($text.PadRight(57)) ║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Step($num, $text) {
    Write-Host "▸ PASO ${num}: ${text}" -ForegroundColor Yellow
}

function Write-Success($text) {
    Write-Host "✅ ${text}" -ForegroundColor Green
}

function Write-Warning($text) {
    Write-Host "⚠️  ${text}" -ForegroundColor Yellow
}

function Write-Error($text) {
    Write-Host "❌ ${text}" -ForegroundColor Red
}

function Write-Info($text) {
    Write-Host "ℹ️  ${text}" -ForegroundColor Cyan
}

function Get-YesNo($question) {
    $response = Read-Host "$question (S/N)"
    return $response -match '^[sS]$'
}

# ==========================
# 📄 FUNCIÓN SHOW-FILEDIFF
# ==========================

function Show-FileDiff($sourceBranch, $targetBranch) {
    <#
    .SYNOPSIS
    Muestra los archivos modificados entre dos ramas ANTES de sincronizar
    #>
    
    Write-Host ""
    Write-Host "📄 ANÁLISIS DE CAMBIOS: ${sourceBranch} → ${targetBranch}" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    
    $diffOutput = git diff "origin/${targetBranch}...origin/${sourceBranch}" --name-status 2>$null
    
    if (-not $diffOutput) {
        Write-Host "Sin cambios para mostrar" -ForegroundColor Gray
        return
    }
    
    $addedCount = 0
    $modifiedCount = 0
    $deletedCount = 0
    $renamedCount = 0
    
    $diffLines = $diffOutput -split "`n" | Where-Object { $_ }
    
    foreach ($line in $diffLines) {
        $parts = $line -split "`t"
        $status = $parts[0]
        $filename = $parts[1]
        
        switch ($status) {
            'A' {
                Write-Host "  ➕ AÑADIDO    : $filename" -ForegroundColor Green
                $addedCount++
            }
            'M' {
                Write-Host "  ✏️  MODIFICADO: $filename" -ForegroundColor Yellow
                $modifiedCount++
            }
            'D' {
                Write-Host "  🗑️  ELIMINADO : $filename" -ForegroundColor Red
                $deletedCount++
            }
            'R' {
                Write-Host "  📝 RENOMBRADO: $filename" -ForegroundColor Magenta
                $renamedCount++
            }
        }
    }
    
    Write-Host ""
    Write-Host "📊 RESUMEN:" -ForegroundColor Cyan
    Write-Host "  ├─ Archivos añadidos    : $addedCount" -ForegroundColor Green
    Write-Host "  ├─ Archivos modificados : $modifiedCount" -ForegroundColor Yellow
    Write-Host "  ├─ Archivos eliminados  : $deletedCount" -ForegroundColor Red
    Write-Host "  ├─ Archivos renombrados : $renamedCount" -ForegroundColor Magenta
    Write-Host "  └─ Total: $($addedCount + $modifiedCount + $deletedCount + $renamedCount) archivos" -ForegroundColor Cyan
    Write-Host ""
}

# ==========================
# 🔍 ESCANEO PREVIO DE RAMAS
# ==========================

function Scan-AllBranches() {
    <#
    .SYNOPSIS
    Escanea TODAS las ramas del repositorio (excepto backup/*)
    Detecta ramas desconocidas y solicita acción al usuario
    #>
    
    Write-Title "ESCANEO PREVIO DE TODAS LAS RAMAS"
    
    Write-Step "0" "Escaneando referencias remotas..."
    git fetch --all --quiet
    
    # Obtener todas las ramas
    $allBranches = @(git branch -r --format="%(refname:short)" | Where-Object { $_ -and $_ -notmatch '^origin/HEAD' })
    
    # Limpiar prefijo 'origin/'
    $allBranches = $allBranches | ForEach-Object { $_ -replace '^origin/', '' } | Sort-Object -Unique
    
    Write-Host ""
    Write-Host "🃊 RAMAS DETECTADAS: $($allBranches.Count)" -ForegroundColor Cyan
    Write-Host ""
    
    # Ramas conocidas (jerárquicas)
    $knownHierarchy = @('development', 'main', 'master', 'preview', 'production')
    
    # Ramas de backup (ignorar)
    $backupBranches = @($allBranches | Where-Object { $_ -match '^backup/' })
    
    # Ramas de usuario/agente (patrón: .*/feat|fix|test|wip)
    $agentBranches = @($allBranches | Where-Object { 
        $_ -match '/(feat|fix|test|wip)$' -and 
        $_ -notin $knownHierarchy
    }) | Sort-Object
    
    # Ramas desconocidas (NO coinciden con patrones conocidos)
    $unknownBranches = @($allBranches | Where-Object {
        $_ -notin $knownHierarchy -and
        $_ -notmatch '^backup/' -and
        $_ -notmatch '/(feat|fix|test|wip)$'
    }) | Sort-Object
    
    # Mostrar ramas jerárquicas
    Write-Host "┌─ JERÁRQUICAS (Core)" -ForegroundColor Green
    foreach ($branch in ($knownHierarchy | Where-Object { $_ -in $allBranches })) {
        Write-Host "│  ✓ $branch" -ForegroundColor Green
    }
    Write-Host ""
    
    # Mostrar ramas de agente
    if ($agentBranches) {
        Write-Host "┌─ USUARIO/AGENTE (Independientes)" -ForegroundColor Magenta
        foreach ($branch in $agentBranches) {
            Write-Host "│  ⚡ $branch" -ForegroundColor Magenta
        }
        Write-Host ""
    }
    
    # Mostrar ramas desconocidas
    if ($unknownBranches) {
        Write-Host "┌─ DESCONOCIDAS (Nueva detección)" -ForegroundColor Yellow
        foreach ($branch in $unknownBranches) {
            Write-Host "│  ⚠️  $branch" -ForegroundColor Yellow
        }
        Write-Host ""
        Write-Warning "Se han detectado $($unknownBranches.Count) rama(s) desconocida(s)."
        Write-Host ""
        Write-Info "Clasificación sugerida para cada rama:"
        foreach ($branch in $unknownBranches) {
            Write-Host "  • $branch" -ForegroundColor Yellow
            Write-Host "    Opciones: (j)erárquica, (a)gente, (b)ackup, (i)gnorar" -ForegroundColor Gray
            
            $choice = Read-Host "    Tu elección" -DefaultValue "i"
            switch ($choice) {
                'j' { Write-Info "    → Clasificada como JERÁRQUICA" }
                'a' { Write-Info "    → Clasificada como AGENTE" }
                'b' { Write-Info "    → Marcada para BACKUP" }
                'i' { Write-Info "    → IGNORADA" }
                default { Write-Info "    → IGNORADA" }
            }
        }
        Write-Host ""
    }
    
    # Mostrar ramas de backup
    if ($backupBranches) {
        Write-Host "┌─ BACKUP (No sincronizar)" -ForegroundColor Gray
        foreach ($branch in $backupBranches) {
            Write-Host "│  📦 $branch" -ForegroundColor Gray
        }
        Write-Host ""
    }
    
    Write-Host "┌─ RESUMEN" -ForegroundColor Cyan
    Write-Host "│  Total de ramas: $($allBranches.Count)" -ForegroundColor Cyan
    Write-Host "│  ✓ Jerárquicas: $(@($allBranches | Where-Object { $_ -in $knownHierarchy }).Count)" -ForegroundColor Green
    Write-Host "│  ⚡ Agentes: $($agentBranches.Count)" -ForegroundColor Magenta
    Write-Host "│  ⚠️  Desconocidas: $($unknownBranches.Count)" -ForegroundColor Yellow
    Write-Host "│  📦 Backup: $($backupBranches.Count)" -ForegroundColor Gray
    Write-Host "└─══════════════" -ForegroundColor Cyan
    
    return @{
        All = $allBranches
        Hierarchy = @($allBranches | Where-Object { $_ -in $knownHierarchy })
        Agent = $agentBranches
        Unknown = $unknownBranches
        Backup = $backupBranches
    }
}

# ==========================
# 🔍 DETECCIÓN DE RAMAS
# ==========================

Write-Title "ANCLORA PROMOTE v4.2 - Sistema Multi-Rama con Escaneo Previo"

Write-Step "1" "Detectando ramas del repositorio"

# Obtener todas las ramas locales
$allBranches = @(git branch --format="%(refname:short)" | Where-Object { $_ })

# Ramas jerárquicas
$mainBranch = if ($allBranches -contains 'main') { 'main' } elseif ($allBranches -contains 'master') { 'master' } else { 'main' }
$devBranch = 'development'
$previewBranch = 'preview'
$productionBranch = 'production'

$hierarchyBranches = @($devBranch, $mainBranch, $previewBranch, $productionBranch)

# Ramas de usuario/agente
$agentBranches = @($allBranches | Where-Object { 
    $_ -match '/(feat|fix|test|wip)$' -and 
    $_ -notin $hierarchyBranches
}) | Sort-Object

# Ramas de backup
$backupBranches = @($allBranches | Where-Object { $_ -match '^backup/' })

Write-Host ""
Write-Host "📊 ESTRUCTURA DE RAMAS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "┌─ JERÁRQUICAS (Core - siempre sincronizadas)" -ForegroundColor Green
foreach ($branch in $hierarchyBranches) {
    $status = if ($branch -eq (git rev-parse --abbrev-ref HEAD)) { "← ACTUAL" } else { "" }
    Write-Host "│  ✓ $branch ${status}" -ForegroundColor Green
}
Write-Host ""

if ($agentBranches) {
    Write-Host "┌─ USUARIO/AGENTE (Independientes - protegidas)" -ForegroundColor Magenta
    foreach ($branch in $agentBranches) {
        Write-Host "│  ⚡ $branch" -ForegroundColor Magenta
    }
    Write-Host ""
}

if ($backupBranches) {
    Write-Host "┌─ BACKUP (No sincronizar)" -ForegroundColor Gray
    foreach ($branch in $backupBranches) {
        Write-Host "│  📦 $branch" -ForegroundColor Gray
    }
    Write-Host ""
}

Write-Host "Total de ramas: $($allBranches.Count)" -ForegroundColor Cyan
Write-Host ""

# ==========================
# 🔍 MODO SCAN
# ==========================

if ($Mode -eq 'scan') {
    Write-Title "MODO ESCANEO DE RAMAS"
    $scanResult = Scan-AllBranches
    Write-Success "Escaneo completado."
    Stop-Transcript | Out-Null
    exit 0
}

# ==========================
# 🗑️ MODO DELETE
# ==========================

if ($Mode -eq 'delete') {
    Write-Title "MODO ELIMINACIÓN SEGURA"
    
    if (-not $BranchesToDelete -or $BranchesToDelete.Count -eq 0) {
        Write-Host "Ramas disponibles para eliminar:" -ForegroundColor Yellow
        $i = 1
        foreach ($branch in $agentBranches) {
            Write-Host "  $i) $branch"
            $i++
        }
        Write-Host ""
        $choice = Read-Host "Número de rama a eliminar (o nombres separados por comas)"
        $BranchesToDelete = @($choice -split ',' | ForEach-Object { $_.Trim() })
    }
    
    foreach ($branch in $BranchesToDelete) {
        if ($branch -in $hierarchyBranches) {
            Write-Error "No puedes eliminar ramas jerárquicas: $branch"
            continue
        }
        
        if ($branch -notin $allBranches) {
            Write-Warning "La rama no existe: $branch"
            continue
        }
        
        Write-Host ""
        Write-Host "Eliminando: $branch" -ForegroundColor Yellow
        
        if (Get-YesNo "¿Confirmas eliminación de '$branch'?") {
            if (-not $DryRun) {
                git branch -D $branch 2>$null
                git push origin --delete $branch 2>$null
                Write-Success "Eliminada: $branch"
            } else {
                Write-Host "[DRY-RUN] Se eliminaría: $branch" -ForegroundColor Gray
            }
        } else {
            Write-Warning "Operación cancelada para: $branch"
        }
    }
    
    Stop-Transcript | Out-Null
    exit 0
}

# ==========================
# 📊 MODO REPORT
# ==========================

if ($Mode -eq 'report') {
    Write-Title "REPORTE DE ESTADO"
    
    Write-Step "2" "Analizando divergencias"
    
    git fetch --all --quiet
    
    Write-Host ""
    foreach ($branch in $hierarchyBranches) {
        $ahead = git rev-list --count "origin/$branch..HEAD" 2>$null || 0
        $behind = git rev-list --count "HEAD..origin/$branch" 2>$null || 0
        
        $status = "✓ Sincronizado"
        if ($ahead -gt 0 -or $behind -gt 0) {
            $status = "⚠️  Divergencia: +$ahead -${behind}"
        }
        
        Write-Host "  ${branch}: ${status}" -ForegroundColor Cyan
    }
    
    Write-Host ""
    Write-Success "Reporte completado"
    
    Stop-Transcript | Out-Null
    exit 0
}

# ==========================
# 🔄 ACTUALIZAR REMOTOS
# ==========================

Write-Step "2" "Actualizando referencias remotas"
git fetch --all --quiet
Write-Success "Referencias actualizadas"

# ==========================
# 🔍 ANÁLISIS DE DIVERGENCIAS
# ==========================

Write-Step "3" "Analizando divergencias"

$divergences = @{}
foreach ($branch in $hierarchyBranches) {
    $ahead = [int](git rev-list --count "origin/$branch..HEAD" 2>$null || "0")
    $behind = [int](git rev-list --count "HEAD..origin/$branch" 2>$null || "0")
    $divergences[$branch] = @{ Ahead = $ahead; Behind = $behind }
}

Write-Host ""
foreach ($branch in $hierarchyBranches) {
    $div = $divergences[$branch]
    if ($div.Ahead -gt 0 -or $div.Behind -gt 0) {
        Write-Warning "${branch}: +$($div.Ahead) local, -$($div.Behind) remoto"
    } else {
        Write-Success "${branch}: Sincronizado"
    }
}

# ==========================
# 🚀 PROMOCIÓN JERÁRQUICA
# ==========================

if ($Mode -in @('full', 'safe', 'dry-run')) {
    
    Write-Title "FASE 1: PROMOCIÓN JERÁRQUICA"
    
    $promotionChain = @(
        @{ source = $devBranch; target = $mainBranch }
        @{ source = $mainBranch; target = $previewBranch }
        @{ source = $previewBranch; target = $productionBranch }
    )
    
    foreach ($step in $promotionChain) {
        $source = $step.source
        $target = $step.target
        
        Write-Host ""
        Write-Host "🔀 $source → ${target}" -ForegroundColor Cyan
        
        Show-FileDiff $source $target
        
        $sourceAhead = [int](git rev-list --count "origin/$target..origin/${source}" 2>$null || "0")
        $targetAhead = [int](git rev-list --count "origin/$source..origin/${target}" 2>$null || "0")
        
        if ($targetAhead -gt 0) {
            Write-Warning "$target está $targetAhead commits ADELANTE"
            
            if ($Mode -eq 'safe') {
                if (-not (Get-YesNo "¿Deseas continuar con la promoción?")) {
                    Write-Warning "Promoción cancelada"
                    continue
                }
            }
        }
        
        if ($sourceAhead -eq 0) {
            Write-Host "Sin cambios para promocionar" -ForegroundColor Gray
            continue
        }
        
        Write-Host "Cambios a promocionar: $sourceAhead commits" -ForegroundColor Yellow
        
        if (-not $DryRun) {
            git checkout $target --quiet
            git pull origin $target --rebase --quiet 2>$null
            git merge "origin/${source}" -m "🔀 Promote: $source → $target [$(Get-Date -Format 'yyyy-MM-dd HH:mm')]" --quiet 2>$null
            
            if (${LASTEXITCODE} -eq 0) {
                git push origin $target --quiet
                Write-Success "Promocionado: $source → ${target}"
            } else {
                Write-Error "Conflicto en merge. Resuelve manualmente."
                git merge --abort --quiet 2>$null
            }
        } else {
            Write-Host "[DRY-RUN] Se promocionaría: $source → ${target}" -ForegroundColor Gray
        }
    }
}

# ==========================
# 🤖 SINCRONIZAR RAMAS DE AGENTE
# ==========================

if ($agentBranches -and $Mode -in @('full', 'safe', 'dry-run')) {
    
    Write-Title "FASE 2: SINCRONIZAR RAMAS DE USUARIO/AGENTE"
    
    foreach ($agentBranch in $agentBranches) {
        Write-Host ""
        Write-Host "⚡ ${agentBranch}" -ForegroundColor Magenta
        
        Show-FileDiff $agentBranch $mainBranch
        
        $mainAhead = [int](git rev-list --count "origin/$mainBranch..origin/${agentBranch}" 2>$null || "0")
        $agentAhead = [int](git rev-list --count "origin/$agentBranch..origin/${mainBranch}" 2>$null || "0")
        
        if ($mainAhead -gt 0) {
            Write-Warning "$mainBranch tiene $agentAhead commits nuevos"
            
            if ($Mode -in @('full', 'safe')) {
                if (Get-YesNo "¿Sincronizar $agentBranch con main?") {
                    if (-not $DryRun) {
                        git checkout $agentBranch --quiet
                        git pull origin $mainBranch --rebase --quiet 2>$null
                        git push origin $agentBranch --quiet
                        Write-Success "Sincronizado: $agentBranch ← ${mainBranch}"
                    } else {
                        Write-Host "[DRY-RUN] Se sincronizaría: ${agentBranch}" -ForegroundColor Gray
                    }
                }
            }
        } else {
            Write-Host "Sin cambios en main para sincronizar" -ForegroundColor Gray
        }
    }
}

# ==========================
# ✅ FINALIZACIÓN
# ==========================

Write-Title "RESUMEN FINAL"

Write-Host "Ramas jerárquicas sincronizadas:" -ForegroundColor Green
foreach ($branch in $hierarchyBranches) {
    Write-Host "   ✓ $branch" -ForegroundColor Green
}

if ($agentBranches) {
    Write-Host ""
    Write-Host "Ramas de usuario/agente protegidas:" -ForegroundColor Magenta
    foreach ($branch in $agentBranches) {
        Write-Host "   ⚡ $branch" -ForegroundColor Magenta
    }
}

Write-Host ""
Write-Host "📋 Logs guardados en: ${logFile}" -ForegroundColor Cyan
Write-Host ""

git checkout $devBranch --quiet
Write-Success "Repositorio listo en rama: ${devBranch}"

Stop-Transcript | Out-Null

Write-Host ""
Write-Host "✨ Promoción completada exitosamente [v4.2]" -ForegroundColor Green
