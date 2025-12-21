#Requires -Version 7.0
<#
.SYNOPSIS
    Execute Azure Bay Residences migration with validation and reporting.

.DESCRIPTION
    Safe orchestration of Find & Replace operations across the landing page.
    - Validates all transformations before applying
    - Generates detailed reports
    - Creates atomic commits for each operation

.PARAMETER FilePath
    Path to app/page.tsx (defaults to ./app/page.tsx)

.PARAMETER DryRun
    Validate without saving changes

.PARAMETER CommitChanges
    Automatically commit changes to Git

.EXAMPLE
    ./Execute-AzureBayMigration.ps1 -FilePath ./app/page.tsx -CommitChanges
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$FilePath = "./app/page.tsx",
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun,
    
    [Parameter(Mandatory=$false)]
    [switch]$CommitChanges
)

$ErrorActionPreference = "Stop"
$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

# ============================================================================
# VALIDATION
# ============================================================================

Write-Host "✅ Azure Bay Migration Executor" -ForegroundColor Cyan
Write-Host "=" * 80
Write-Host ""

# Check Python availability
Write-Host "[1/5] Checking environment..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "      ✅ Python: $pythonVersion"
} catch {
    Write-Host "      ❌ Python not found. Please install Python 3.9+" -ForegroundColor Red
    exit 1
}

# Check file exists
if (-not (Test-Path $FilePath)) {
    Write-Host "      ❌ File not found: $FilePath" -ForegroundColor Red
    exit 1
}
Write-Host "      ✅ File found: $FilePath"

# Check migration script exists
if (-not (Test-Path "$ScriptRoot/azure-bay-migration.py")) {
    Write-Host "      ❌ Migration script not found" -ForegroundColor Red
    exit 1
}
Write-Host "      ✅ Migration script available"
Write-Host ""

# ============================================================================
# DRY RUN PHASE
# ============================================================================

Write-Host "[2/5] Running validation (dry-run mode)..." -ForegroundColor Yellow
Write-Host ""

$dryRunOutput = & python "$ScriptRoot/azure-bay-migration.py" $FilePath --dry-run 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "      ❌ Validation failed" -ForegroundColor Red
    Write-Host $dryRunOutput
    exit 1
}

Write-Host $dryRunOutput
Write-Host ""

# ============================================================================
# EXECUTION PHASE
# ============================================================================

if ($DryRun) {
    Write-Host "[3/5] 🔄 DRY RUN MODE - Skipping execution" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To apply changes, run without -DryRun flag:" -ForegroundColor Green
    Write-Host "  ./Execute-AzureBayMigration.ps1 -FilePath $FilePath -CommitChanges" -ForegroundColor Gray
    exit 0
}

Write-Host "[3/5] Applying transformations..." -ForegroundColor Yellow
Write-Host ""

# Create backup
$backupPath = "$FilePath.backup"
Copy-Item $FilePath -Destination $backupPath -Force
Write-Host "      ✅ Backup created: $backupPath"

# Run migration
$migrationOutput = & python "$ScriptRoot/azure-bay-migration.py" $FilePath 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "      ❌ Migration failed - restoring backup" -ForegroundColor Red
    Move-Item $backupPath -Destination $FilePath -Force
    Write-Host $migrationOutput
    exit 1
}

Write-Host $migrationOutput
Write-Host ""

# ============================================================================
# VERIFICATION PHASE
# ============================================================================

Write-Host "[4/5] Verifying changes..." -ForegroundColor Yellow

$originalSize = (Get-Item $backupPath).Length
$newSize = (Get-Item $FilePath).Length
Write-Host "      Original size: $originalSize bytes"
Write-Host "      New size: $newSize bytes"

if ($originalSize -eq $newSize) {
    Write-Host "      ⚠️ File size unchanged (may indicate no changes)" -ForegroundColor Cyan
} else {
    Write-Host "      ✅ File size changed (expected)"
}

$gitStatus = & git status --porcelain $FilePath 2>&1
if ($gitStatus) {
    Write-Host "      ✅ Git detected changes"
} else {
    Write-Host "      ⚠️ No Git changes detected" -ForegroundColor Yellow
}

Write-Host ""

# ============================================================================
# COMMIT PHASE
# ============================================================================

if ($CommitChanges) {
    Write-Host "[5/5] Creating Git commit..." -ForegroundColor Yellow
    
    # Stage changes
    & git add $FilePath 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "      ❌ Git add failed" -ForegroundColor Red
        exit 1
    }
    
    # Create commit with detailed message
    $commitMessage = @"
[Azure Bay] Operations 2-5: Naming, Location, Pricing & Currency

Changes Applied:
- Op2: Location genericization (Al Marjan → Premium Beachfront Community)
- Op3: Price adjustments (EUR formatting)
- Op4: Currency formatting consistency
- Op5: Meta tags and SEO updates

Validation: All transformations pre-validated
Script: scripts/azure-bay-migration.py
"@
    
    & git commit -m $commitMessage 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "      ❌ Git commit failed" -ForegroundColor Red
        exit 1
    }
    
    $commitHash = & git rev-parse HEAD
    Write-Host "      ✅ Committed: $commitHash" -ForegroundColor Green
    Write-Host ""
    Write-Host "Commit message:" -ForegroundColor Gray
    Write-Host $commitMessage -ForegroundColor Gray
} else {
    Write-Host "[5/5] 🔄 Skipping commit (use -CommitChanges to commit)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To commit changes:" -ForegroundColor Green
    Write-Host "  git add $FilePath" -ForegroundColor Gray
    Write-Host "  git commit -m '[Azure Bay] Operations 2-5: Naming, Location, Pricing & Currency'" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=" * 80
Write-Host "✅ Azure Bay Migration Complete!" -ForegroundColor Green
Write-Host "=" * 80
