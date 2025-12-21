<#
.SYNOPSIS
  Sincroniza todas las ramas principales (development → main → preview → production)
  y sincroniza la rama de AI (perplexity/feat) después de main.
  Además, reinyecta commits adelantados desde ramas superiores si existen.

.DESCRIPTION
  Este script:
  - Actualiza referencias remotas.
  - Detecta commits adelantados en ramas superiores.
  - Ofrece integrarlos en development con rebase.
  - Fusiona jerárquicamente en orden: development → main → preview → production.
  - Sincroniza perplexity/feat con main (la rama de IA).
  - Hace rebase final para evitar desfases ("X commits behind").
  - Limpia logs antiguos automáticamente.
#>

# ==========================
# ⚠️ CONFIGURACIÓN INICIAL
# ==========================
$ErrorActionPreference = "Stop"
$repoRoot = (git rev-parse --show-toplevel)
Set-Location $repoRoot

$logDir = Join-Path $repoRoot "logs"
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }

# 🧹 Limpieza automática de logs antiguos (>24h)
Get-ChildItem $logDir -Filter "promote_*.txt" -ErrorAction SilentlyContinue |
  Where-Object { $_.LastWriteTime -lt (Get-Date).AddHours(-24) } |
  Remove-Item -Force -ErrorAction SilentlyContinue

# Crear nuevo log
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$logFile = Join-Path $logDir "promote_$timestamp.txt"
Start-Transcript -Path $logFile | Out-Null

Write-Host ""
Write-Host "⚣ ANCLORA DEV SHELL — PROMOTE FULL v3.0 (with AI Branch Support)" -ForegroundColor Cyan
Write-Host ""

# ==========================
# 🦭 DETECTAR RAMAS
# ==========================
$branches = git branch --format="%(refname:short)"
$mainBranch = if ($branches -match 'main') { 'main' } elseif ($branches -match 'master') { 'master' } else { 'main' }
$devBranch = if ($branches -match 'development') { 'development' } else { Read-Host "❓ Nombre de tu rama de desarrollo" }
$previewBranch = if ($branches -match 'preview') { 'preview' } else { '' }
$productionBranch = if ($branches -match 'production') { 'production' } else { '' }
$perplexityBranch = 'perplexity/feat'  # Rama de IA dedicada

Write-Host "📉 Ramas detectadas:"
Write-Host "   Dev: $devBranch"
Write-Host "   Main: $mainBranch"
if ($previewBranch) { Write-Host "   Preview: $previewBranch" }
if ($productionBranch) { Write-Host "   Production: $productionBranch" }
Write-Host "   AI Feature: $perplexityBranch"
Write-Host ""

# ==========================
# 🔄 ACTUALIZAR REMOTOS
# ==========================
Write-Host "🔄 Actualizando referencias remotas..." -ForegroundColor Yellow
git fetch --all | Out-Null

# ==========================
# 🧠 DETECTAR COMMITS ADELANTADOS
# ==========================
function Check-Divergence($source, $target) {
    $counts = git rev-list --left-right --count $source...$target | Out-String
    $split = $counts -split "\s+"
    $ahead = [int]($split[0].Trim())
    $behind = [int]($split[1].Trim())
    return @{ Ahead = $ahead; Behind = $behind }
}

Write-Host "🦭 Verificando si hay commits adelantados en ramas superiores..." -ForegroundColor Yellow
$upstreamBranches = @($mainBranch, $previewBranch, $productionBranch) | Where-Object { $_ -ne '' }
$rebased = $false

foreach ($up in $upstreamBranches) {
    $div = Check-Divergence "origin/$devBranch" "origin/$up"
    if ($div.Behind -gt 0) {
        Write-Host "⚠️  '$up' tiene $($div.Behind) commits no presentes en '$devBranch'." -ForegroundColor Yellow
        $choice = Read-Host "¿Deseas integrarlos en '$devBranch' antes de promover? (S/N)"
        if ($choice -match '^[sS]$') {
            Write-Host "🔁 Rebasando '$devBranch' con cambios de '$up'..." -ForegroundColor Green
            git checkout $devBranch
            git pull origin $up --rebase
            $rebased = $true
        }
    }
}

if (-not $rebased) {
    Write-Host "✅ No hay commits adelantados que integrar." -ForegroundColor Green
}
Write-Host ""

# ==========================
# 🚀 FUNCIÓN DE PROMOCIÓN
# ==========================
function Promote($source, $target) {
    Write-Host "🔁 Fusionando $source → $target..." -ForegroundColor Green
    git checkout $target
    git pull origin $target --rebase
    git merge $source -m "🔀 Promote $source → $target"
    git push origin $target
}

# ==========================
# 🔗 EJECUCIÓN PRINCIPAL
# ==========================
Write-Host "🚀 FASE 1: Promoción jerárquica de ramas" -ForegroundColor Cyan
Write-Host ""

Promote $devBranch $mainBranch

if ($previewBranch) { 
    Write-Host ""
    Promote $mainBranch $previewBranch 
}

if ($productionBranch) { 
    Write-Host ""
    Promote $previewBranch $productionBranch 
}

# ==========================
# 🤖 SINCRONIZAR RAMA DE IA (perplexity/feat)
# ==========================
Write-Host ""
Write-Host "🚀 FASE 2: Sincronizar rama de IA (perplexity/feat) con main" -ForegroundColor Cyan
Write-Host ""

# Verificar si la rama remota existe
$perplexityExists = git ls-remote --heads origin $perplexityBranch

if ($perplexityExists) {
    Write-Host "🔁 Sincronizando $perplexityBranch con $mainBranch..." -ForegroundColor Green
    git checkout $perplexityBranch
    git pull origin $perplexityBranch --rebase
    git merge $mainBranch -m "🔀 Sync $mainBranch into $perplexityBranch"
    git push origin $perplexityBranch
    Write-Host "✅ Rama $perplexityBranch sincronizada con $mainBranch." -ForegroundColor Green
} else {
    Write-Host "⚠️  La rama $perplexityBranch no existe en el remoto. Creando..." -ForegroundColor Yellow
    git checkout -b $perplexityBranch origin/main
    git push -u origin $perplexityBranch
    Write-Host "✅ Rama $perplexityBranch creada y sincronizada." -ForegroundColor Green
}

Write-Host ""

# ==========================
# 🧭 REBASE FINAL DE DEVELOPMENT
# ==========================
Write-Host "🚀 FASE 3: Rebase final de ramas" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔄 Realizando rebase final de '$devBranch'..." -ForegroundColor Yellow
git checkout $devBranch
git fetch origin $devBranch
git pull --rebase origin $devBranch
git push origin $devBranch

Write-Host "✅ '$devBranch' rebased y sincronizado." -ForegroundColor Green
Write-Host ""

# ==========================
# ✅ FINALIZACIÓN
# ==========================
Write-Host "🏁 Sincronización completa sin divergencias." -ForegroundColor Cyan
Write-Host ""
Write-Host "📉 Estado final de ramas:" -ForegroundColor Green
Write-Host "   ✅ $devBranch (development)"
Write-Host "   ✅ $mainBranch (main)"
if ($previewBranch) { Write-Host "   ✅ $previewBranch (preview)" }
if ($productionBranch) { Write-Host "   ✅ $productionBranch (production)" }
Write-Host "   ✅ $perplexityBranch (AI Feature)"
Write-Host ""

Stop-Transcript | Out-Null
