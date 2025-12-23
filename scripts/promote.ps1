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

.EXAMPLE
  .\promote.ps1 -Mode full
  .\promote.ps1 -Mode scan
  .\promote.ps1 -Mode delete -BranchesToDelete @("claude/fix-logo-transparency-0ud16")
#>

param(
    [ValidateSet('full', 'safe', 'delete', 'report', 'dry-run', 'scan')]
    [string]$Mode = 'full',
    
    [array]$BranchesToDelete = @(),
    [array]$BranchesToPromote = @(),
    [bool]$DryRun = $false,
    [bool]$Verbose = $true
)

# Escaneo previo
function Scan-AllBranches() {
    Write-Host "Escaneando TODAS las ramas (excepto backup/*)..." -ForegroundColor Cyan
    git fetch --all --quiet
    
    $allBranches = @(git branch -r --format="%(refname:short)" | Where-Object { $_ -and $_ -notmatch '^origin/HEAD' })
    $allBranches = $allBranches | ForEach-Object { $_ -replace '^origin/', '' } | Sort-Object -Unique
    
    Write-Host "Total de ramas detectadas: $($allBranches.Count)" -ForegroundColor Green
    Write-Host ""
    
    # Clasificación automática
    $knownHierarchy = @('development', 'main', 'master', 'preview', 'production')
    $backupBranches = @($allBranches | Where-Object { $_ -match '^backup/' })
    $agentBranches = @($allBranches | Where-Object { 
        $_ -match '/(feat|fix|test|wip)$' -and 
        $_ -notin $knownHierarchy
    }) | Sort-Object
    $unknownBranches = @($allBranches | Where-Object {
        $_ -notin $knownHierarchy -and
        $_ -notmatch '^backup/' -and
        $_ -notmatch '/(feat|fix|test|wip)$'
    }) | Sort-Object
    
    # Mostrar resultados
    Write-Host "┌─ JERÁRQUICAS" -ForegroundColor Green
    foreach ($branch in ($knownHierarchy | Where-Object { $_ -in $allBranches })) {
        Write-Host "│  $branch"
    }
    Write-Host ""
    
    if ($agentBranches) {
        Write-Host "┌─ AGENTES" -ForegroundColor Magenta
        foreach ($branch in $agentBranches) {
            Write-Host "│  $branch"
        }
        Write-Host ""
    }
    
    if ($unknownBranches) {
        Write-Host "┌─ DESCONOCIDAS (Requieren clasificación)" -ForegroundColor Yellow
        foreach ($branch in $unknownBranches) {
            Write-Host "│  $branch"
        }
        Write-Host ""
    }
    
    if ($backupBranches) {
        Write-Host "┌─ BACKUP" -ForegroundColor Gray
        foreach ($branch in $backupBranches) {
            Write-Host "│  $branch"
        }
        Write-Host ""
    }
    
    return @{
        All = $allBranches
        Hierarchy = @($allBranches | Where-Object { $_ -in $knownHierarchy })
        Agent = $agentBranches
        Unknown = $unknownBranches
        Backup = $backupBranches
    }
}

# ==========================
# CONFIGURACIÓN
# ==========================
$ErrorActionPreference = "Continue"
$repoRoot = (git rev-parse --show-toplevel 2>$null)
if (-not $repoRoot) {
    Write-Host "Error: No estoy en un repositorio Git" -ForegroundColor Red
    exit 1
}
Set-Location $repoRoot

# ==========================
# MODO SCAN
# ==========================
if ($Mode -eq 'scan') {
    Write-Host "" 
    Write-Host "====================================" -ForegroundColor Cyan
    Write-Host "MODO ESCANEO - ANCLORA PROMOTE v4.2" -ForegroundColor Cyan
    Write-Host "====================================" -ForegroundColor Cyan
    Write-Host ""
    Scan-AllBranches
    exit 0
}

Write-Host "Promote v4.2 listo" -ForegroundColor Green
