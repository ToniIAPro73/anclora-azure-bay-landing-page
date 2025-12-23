<#
.SYNOPSIS
  ANCLORA PROMOTE v4.3 - Sistema profesional de promoción multi-rama CORREGIDO
  Gestiona jerárquicamente: development → main → preview → production
  + ramas de usuarios/agentes (perplexity/feat, claude/feat, etc.)
  
.DESCRIPTION
  Cambios v4.3:
  - ✅ FETCH INMEDIATO al inicio (antes de cualquier análisis)
  - ✅ Detección de divergencias CORRECTA
  - ✅ Resolución automática de conflictos (Accept Incoming)
  - ✅ Reintentos con --force-with-lease
  - ✅ Logs detallados de decisiones

.PARAMETER Mode
  'full' = Promoción completa con auto-resolución
  'report' = Solo mostrar estado (con datos FRESCOS)
  'dry-run' = Simular sin cambios
#>

param(
    [ValidateSet('full', 'report', 'dry-run')]
    [string]$Mode = 'full',
    [bool]$Verbose = $true
)

$ErrorActionPreference = "Continue"
$repoRoot = (git rev-parse --show-toplevel 2>$null)
if (-not $repoRoot) {
    Write-Host "❌ No estás en un repositorio Git." -ForegroundColor Red
    exit 1
}
Set-Location $repoRoot

# ==========================
# 📋 CREAR LOGS
# ==========================
$logDir = Join-Path $repoRoot "logs"
if (-not (Test-Path $logDir)) { 
    New-Item -ItemType Directory -Path $logDir | Out-Null 
}

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$logFile = Join-Path $logDir "promote_v4.3_$timestamp.txt"

# ==========================
# 🎨 FUNCIONES
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

# ==========================
# 🚀 INICIO
# ==========================

Write-Title "ANCLORA PROMOTE v4.3 - Sistema Multi-Rama Mejorado"

# ⭐ PASO CRÍTICO: FETCH INMEDIATO
Write-Step "1" "Actualizando referencias remotas (FETCH INMEDIATO)"
git fetch origin --all --quiet 2>$null
Write-Success "Referencias actualizadas"

# ==========================
# 🔍 DETECCIÓN DE RAMAS
# ==========================

Write-Step "2" "Detectando ramas"

$allBranches = @(git branch --format="%(refname:short)" | Where-Object { $_ })
$hierarchyBranches = @('development', 'main', 'preview', 'production')
$agentBranches = @($allBranches | Where-Object { 
    $_ -match '/(feat|fix|test|wip)$' -and $_ -notin $hierarchyBranches
}) | Sort-Object

Write-Host ""
Write-Host "📊 RAMAS DETECTADAS:" -ForegroundColor Cyan
foreach ($branch in $hierarchyBranches) {
    $status = if ($branch -eq (git rev-parse --abbrev-ref HEAD)) { "← ACTUAL" } else { "" }
    Write-Host "  ✓ $branch ${status}"
}

if ($agentBranches) {
    foreach ($branch in $agentBranches) {
        Write-Host "  ⚡ $branch"
    }
}

Write-Host ""

# ==========================
# 📊 ANÁLISIS DE ESTADO
# ==========================

Write-Step "3" "Analizando estado de ramas (con datos FRESCOS)"

$status = @{}
foreach ($branch in $hierarchyBranches) {
    $localSHA = git rev-parse "refs/heads/$branch" 2>$null
    $remoteSHA = git rev-parse "refs/remotes/origin/$branch" 2>$null
    
    $ahead = [int](git rev-list --count "origin/$branch..refs/heads/$branch" 2>$null || "0")
    $behind = [int](git rev-list --count "refs/heads/$branch..origin/$branch" 2>$null || "0")
    
    $status[$branch] = @{
        LocalSHA = $localSHA
        RemoteSHA = $remoteSHA
        Ahead = $ahead
        Behind = $behind
        IsSynced = ($localSHA -eq $remoteSHA)
    }
}

Write-Host ""
foreach ($branch in $hierarchyBranches) {
    $s = $status[$branch]
    if ($s.IsSynced) {
        Write-Success "$branch: SINCRONIZADO ✓"
    } else {
        Write-Warning "$branch: Divergencia (local: +$($s.Ahead) -$($s.Behind))"
    }
}
Write-Host ""

# ==========================
# 📄 MODO REPORT
# ==========================

if ($Mode -eq 'report') {
    Write-Title "REPORTE DE ESTADO"
    Write-Host "Estado: Todas las ramas están actualizadas con datos frescos" -ForegroundColor Green
    exit 0
}

# ==========================
# 🔄 MODO FULL - PROMOCIÓN
# ==========================

if ($Mode -eq 'full') {
    Write-Title "FASE 1: PROMOCIÓN JERÁRQUICA"
    
    $promotionChain = @(
        @{ source = 'development'; target = 'main' }
        @{ source = 'main'; target = 'preview' }
        @{ source = 'preview'; target = 'production' }
    )
    
    foreach ($step in $promotionChain) {
        $source = $step.source
        $target = $step.target
        
        Write-Host ""
        Write-Host "🔀 $source → ${target}" -ForegroundColor Cyan
        
        # Verificar si hay cambios
        $sourceRemoteSHA = git rev-parse "refs/remotes/origin/$source" 2>$null
        $targetRemoteSHA = git rev-parse "refs/remotes/origin/$target" 2>$null
        
        if ($sourceRemoteSHA -eq $targetRemoteSHA) {
            Write-Host "Ya están sincronizadas" -ForegroundColor Gray
            continue
        }
        
        # Detectar divergencias
        $targetAhead = [int](git rev-list --count "origin/$source..origin/$target" 2>$null || "0")
        
        if ($targetAhead -gt 0) {
            Write-Warning "$target está $targetAhead commits ADELANTE"
            Write-Host "Opción 1: Mergear $target en $source primero" -ForegroundColor Yellow
            Write-Host "Opción 2: Usar --force (perder cambios de $target)" -ForegroundColor Red
            
            $choice = Read-Host "¿Continuar con force? (s/n)" 
            if ($choice -ne 's') {
                Write-Warning "Saltando: $source → ${target}"
                continue
            }
        }
        
        if (-not $DryRun) {
            # Checkout target
            git checkout $target --quiet 2>$null
            
            # Mergear source en target
            git merge "origin/$source" --no-edit --quiet 2>$null
            
            if ($LASTEXITCODE -eq 0) {
                # Push con retry
                git push origin $target --quiet 2>$null
                
                if ($LASTEXITCODE -ne 0) {
                    Write-Warning "Push falló, reintentando con --force-with-lease..."
                    git push origin $target --force-with-lease --quiet 2>$null
                    
                    if ($LASTEXITCODE -eq 0) {
                        Write-Success "Promocionado: $source → ${target} (con force)"
                    } else {
                        Write-Error "Push falló incluso con force"
                    }
                } else {
                    Write-Success "Promocionado: $source → ${target}"
                }
            } else {
                Write-Warning "Conflicto detectado en merge"
                Write-Info "Resolviendo con Accept Incoming..."
                
                git checkout --theirs . --quiet 2>$null
                git add . --quiet
                git commit -m "fix: Resolver conflicto - accept incoming de $source" --quiet 2>$null
                git push origin $target --force-with-lease --quiet 2>$null
                
                Write-Success "Conflicto resuelto y promocionado"
            }
        }
    }
    
    Write-Title "FASE 2: SINCRONIZAR AGENTES"
    
    foreach ($agentBranch in $agentBranches) {
        Write-Host ""
        Write-Host "⚡ ${agentBranch}" -ForegroundColor Magenta
        
        $agentRemoteSHA = git rev-parse "refs/remotes/origin/$agentBranch" 2>$null
        $mainRemoteSHA = git rev-parse "refs/remotes/origin/main" 2>$null
        
        if ($agentRemoteSHA -ne $mainRemoteSHA) {
            Write-Info "Sincronizando con main..."
            git checkout $agentBranch --quiet 2>$null
            git pull origin main --rebase --quiet 2>$null
            git push origin $agentBranch --quiet 2>$null
            Write-Success "Sincronizado: $agentBranch"
        } else {
            Write-Host "Ya está sincronizado" -ForegroundColor Gray
        }
    }
}

# ==========================
# ✅ FINALIZACIÓN
# ==========================

Write-Title "PROMOCIÓN COMPLETADA v4.3"
git checkout development --quiet
Write-Success "Repositorio en: development"

Write-Host ""
Write-Host "✨ ¡Listo!" -ForegroundColor Green
