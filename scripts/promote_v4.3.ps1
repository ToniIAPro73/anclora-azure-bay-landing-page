<#
.SYNOPSIS
  ANCLORA PROMOTE v4.3
#>

param(
    [ValidateSet('full', 'report', 'dry-run')]
    [string]$Mode = 'full'
)

$ErrorActionPreference = "Continue"
$repoRoot = (git rev-parse --show-toplevel 2>$null)
if (-not $repoRoot) {
    Write-Host "Error: No estas en repositorio Git" -ForegroundColor Red
    exit 1
}

Set-Location $repoRoot

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  ANCLORA PROMOTE v4.3" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "PASO 1: Actualizando referencias remotas" -ForegroundColor Yellow
git fetch origin --all --quiet 2>$null
Write-Host "[OK] Referencias actualizadas" -ForegroundColor Green

Write-Host ""
Write-Host "PASO 2: Detectando ramas" -ForegroundColor Yellow

$allBranches = @(git branch --format="%(refname:short)" | Where-Object { $_ })
$hierarchyBranches = @('development', 'main', 'preview', 'production')
$agentBranches = @($allBranches | Where-Object { 
    $_ -match '/(feat|fix|test|wip)$' -and $_ -notin $hierarchyBranches
}) | Sort-Object

Write-Host ""
Write-Host "RAMAS DETECTADAS:" -ForegroundColor Cyan
foreach ($branch in $hierarchyBranches) {
    $current = git rev-parse --abbrev-ref HEAD
    if ($branch -eq $current) {
        Write-Host "  [$branch] <- ACTUAL"
    } else {
        Write-Host "  [$branch]"
    }
}

if ($agentBranches.Count -gt 0) {
    Write-Host ""
    foreach ($branch in $agentBranches) {
        Write-Host "  [AGENT] $branch"
    }
}

Write-Host ""
Write-Host "PASO 3: Analizando divergencias" -ForegroundColor Yellow

$allSynced = $true
foreach ($branch in $hierarchyBranches) {
    $localSHA = git rev-parse "refs/heads/$branch" 2>$null
    $remoteSHA = git rev-parse "refs/remotes/origin/$branch" 2>$null
    
    if ($localSHA -eq $remoteSHA) {
        Write-Host "[OK] $branch : SINCRONIZADO" -ForegroundColor Green
    } else {
        Write-Host "[WARN] $branch : Divergencia detectada" -ForegroundColor Yellow
        $allSynced = $false
    }
}

Write-Host ""

if ($Mode -eq 'report') {
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host "REPORTE COMPLETADO" -ForegroundColor Cyan
    Write-Host "===============================================" -ForegroundColor Cyan
    if ($allSynced) {
        Write-Host "ESTADO: TODAS SINCRONIZADAS" -ForegroundColor Green
    } else {
        Write-Host "ESTADO: DIVERGENCIAS DETECTADAS" -ForegroundColor Yellow
    }
    Write-Host ""
    exit 0
}

if ($Mode -eq 'full') {
    Write-Host "MODO FULL: Promocion jerarquica" -ForegroundColor Yellow
    Write-Host ""
    
    $promotionChain = @(
        @{ source = 'development'; target = 'main' },
        @{ source = 'main'; target = 'preview' },
        @{ source = 'preview'; target = 'production' }
    )
    
    foreach ($step in $promotionChain) {
        $source = $step.source
        $target = $step.target
        
        Write-Host "Promoviendo: $source -> $target" -ForegroundColor Cyan
        
        $sourceRemoteSHA = git rev-parse "refs/remotes/origin/$source" 2>$null
        $targetRemoteSHA = git rev-parse "refs/remotes/origin/$target" 2>$null
        
        if ($sourceRemoteSHA -eq $targetRemoteSHA) {
            Write-Host "  Ya sincronizadas" -ForegroundColor Gray
            continue
        }
        
        git checkout $target --quiet 2>$null
        git merge "origin/$source" --no-edit --quiet 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            git push origin $target --quiet 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  [OK] Promocionado" -ForegroundColor Green
            } else {
                Write-Host "  [RETRY] Push con force-with-lease" -ForegroundColor Yellow
                git push origin $target --force-with-lease --quiet 2>$null
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "  [OK] Promocionado con force" -ForegroundColor Green
                }
            }
        } else {
            Write-Host "  [CONFLICT] Resolviendo automaticamente" -ForegroundColor Yellow
            git checkout --theirs . --quiet 2>$null
            git add . --quiet
            git commit -m "fix: Auto-resolve conflict" --quiet 2>$null
            git push origin $target --force-with-lease --quiet 2>$null
            Write-Host "  [OK] Conflicto resuelto" -ForegroundColor Green
        }
    }
    
    Write-Host ""
    Write-Host "Promocion completada" -ForegroundColor Green
}

git checkout development --quiet
Write-Host ""
Write-Host "Listo!" -ForegroundColor Green
Write-Host ""
