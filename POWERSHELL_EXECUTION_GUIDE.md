# 🚀 PowerShell Execution Guide

**Status**: Ready to Execute  
**Date**: 2025-12-20 04:38 CET  
**Method**: Windows PowerShell 7.0+

---

## 🎯 Pre-Execution Checklist

Before running, verify:

- [ ] You're on branch `perplexity/feat`
- [ ] Working directory is clean (`git status`)
- [ ] PowerShell 7.0+ installed (`$PSVersionTable.PSVersion`)
- [ ] Python 3.9+ available (`python --version`)
- [ ] Script is executable: `scripts/Execute-AzureBayMigration.ps1`

### Quick Verification

```powershell
# Check PowerShell version
$PSVersionTable.PSVersion

# Check Python
python --version

# Check Git
git branch
# Should show: * perplexity/feat

# Check Git status (should be clean)
git status
```

---

## 🚀 EXECUTION: Choose Your Step

### STEP 1: Dry-Run (Validate Without Changes)

```powershell
# Navigate to repo root
cd "path/to/v0-landing-page-real-state"

# Run dry-run validation
./scripts/Execute-AzureBayMigration.ps1 -FilePath ./app/page.tsx -DryRun
```

**Expected Output**:
```
✅ Azure Bay Migration Executor
================================================================================

[1/5] Checking environment...
      ✅ Python: Python 3.12.11
      ✅ File found: ./app/page.tsx
      ✅ Migration script available

[2/5] Running validation (dry-run mode)...

🔍 Validating all operations...

✅ Op2_es_wynn_description: ✅ Ready (1 match found)
✅ Op2_es_wynn_appreciation: ✅ Ready (1 match found)
✅ Op2_es_gallery_subtitle: ✅ Ready (1 match found)
✅ Op2_en_wynn_description: ✅ Ready (1 match found)
...

📋 Applied transformations: 10/12

[3/5] 🔄 DRY RUN MODE - Skipping execution

✅ Azure Bay Migration Complete!
```

**If validation passes**, proceed to Step 2.

**If validation fails**, check:
- Is file corrupted? (Check file size)
- Are patterns outdated? (Review `TRANSFORMATIONS_MANIFEST.json`)
- Do you need to reset? (Run: `git reset --hard 12903822b33f753979cf4d38142d158e8ba32900`)

---

### STEP 2: Execute With Auto-Commit

Once dry-run passes, execute the full migration:

```powershell
./scripts/Execute-AzureBayMigration.ps1 -FilePath ./app/page.tsx -CommitChanges
```

**Expected Output**:
```
✅ Azure Bay Migration Executor
================================================================================

[1/5] Checking environment...
      ✅ Python: Python 3.12.11
      ✅ File found: ./app/page.tsx
      ✅ Migration script available

[2/5] Running validation (dry-run mode)...
      ✅ Op2_es_wynn_description: Ready (1 match found)
      ✅ Op2_es_wynn_appreciation: Ready (1 match found)
      [... more validations ...]

[3/5] Applying transformations...
      ✅ Backup created: app/page.tsx.backup
      ✅ Op2_es_wynn_description: Applied 1 replacement(s)
      ✅ Op2_es_wynn_appreciation: Applied 1 replacement(s)
      [... more transformations ...]

[4/5] Verifying changes...
      Original size: 83091 bytes
      New size: 83045 bytes
      ✅ Git detected changes

[5/5] Creating Git commit...
      ✅ Committed: abc123def456...

Commit message:
[Azure Bay] Operations 2-5: Location, Pricing & Currency

Changes Applied:
- Op2: Location genericization (Al Marjan → Premium Beachfront Community)
- Op3: Price adjustments (EUR formatting)
- Op4: Currency formatting consistency
- Op5: Meta tags and SEO updates

Validation: All transformations pre-validated
Script: scripts/azure-bay-migration.py

✅ Azure Bay Migration Complete!
```

---

## 🐍 What Happens Behind the Scenes

### Phase 1: Environment Validation
1. ✅ Checks PowerShell version (5.1+)
2. ✅ Verifies Python installation
3. ✅ Confirms file exists
4. ✅ Locates migration script

### Phase 2: Dry-Run Validation
1. ✅ Runs migration script with `--dry-run` flag
2. ✅ Tests all transformation patterns
3. ✅ Reports success/failure for each operation
4. ✅ Shows total operations ready

### Phase 3: Execution (if -CommitChanges specified)
1. ✅ Creates backup: `app/page.tsx.backup`
2. ✅ Runs migration script (real execution)
3. ✅ Applies all Find & Replace operations
4. ✅ Generates detailed report

### Phase 4: Verification
1. ✅ Compares file sizes (before/after)
2. ✅ Checks Git status for changes
3. ✅ Verifies file integrity

### Phase 5: Commit
1. ✅ Stages `app/page.tsx` for commit
2. ✅ Creates commit with detailed message
3. ✅ Reports commit hash

---

## 🔍 Post-Execution Verification

After execution, verify the changes:

```powershell
# Show git commit
git show HEAD --stat

# Count key replacements
git show HEAD:app/page.tsx | Select-String -Pattern "Azure Bay Residences" | Measure-Object -Line
# Expected: 10+ matches

git show HEAD:app/page.tsx | Select-String -Pattern "Premium Beachfront Community" | Measure-Object -Line
# Expected: 4+ matches

# Verify Playa Viva is gone
git show HEAD:app/page.tsx | Select-String -Pattern "Playa Viva" | Measure-Object -Line
# Expected: 0 (or only in comments)

# Check prices updated
git show HEAD:app/page.tsx | Select-String -Pattern "162\" | head
# Should show updated prices
```

---

## 🧪 Testing After Execution

### 1. Local Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` and verify:
- [ ] Hero section displays "Azure Bay Residences"
- [ ] Subtitle shows "PREMIUM BEACHFRONT COMMUNITY"
- [ ] All prices display correctly
- [ ] Language toggle (ES/EN) works
- [ ] No console errors
- [ ] Menu items functional

### 2. Meta Tags Verification

```javascript
// In browser console (http://localhost:3000)
document.title
// Should contain "Azure Bay Residences"

document.querySelector('meta[name="description"]')?.content
// Should contain updated description

document.querySelector('meta[property="og:title"]')?.content
// Should contain "Azure Bay Residences"
```

### 3. Build Verification

```bash
npm run build
# Should complete without errors

npm start
# Production server should work
```

---

## ⚠️ Troubleshooting

### Issue: "PowerShell execution policy"

**Error**: "cannot be loaded because running scripts is disabled on this system"

**Solution**:
```powershell
# Temporarily allow for this session
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force

# Then re-run the script
./scripts/Execute-AzureBayMigration.ps1 -FilePath ./app/page.tsx -DryRun
```

### Issue: "Python not found"

**Error**: "python command not found"

**Solution**:
```powershell
# Check if python3 works
python3 --version

# If yes, create alias
Set-Alias -Name python -Value python3

# Re-run script
./scripts/Execute-AzureBayMigration.ps1 -FilePath ./app/page.tsx -DryRun
```

### Issue: "File corruption detected"

**Error**: "File size changed unexpectedly" or pattern not found

**Solution**:
```bash
# Reset to last known good commit
git reset --hard 12903822b33f753979cf4d38142d158e8ba32900

# Verify file size
git show HEAD:app/page.tsx | wc -c
# Should show ~83000 bytes

# Retry execution
```

---

## 📁 Rollback (If Needed)

If something goes wrong:

```bash
# Option 1: Restore from backup
cp app/page.tsx.backup app/page.tsx
git checkout -- app/page.tsx  # Reset to HEAD

# Option 2: Undo last commit
git reset --soft HEAD~1
git reset HEAD

# Option 3: Use git reflog
git reflog
# Find the desired state
git reset --hard <commit-hash>
```

---

## 🎬 Ready?

### Final Checklist Before Execution

- [ ] On correct branch (`perplexity/feat`)
- [ ] Working directory clean
- [ ] Python 3.9+ installed
- [ ] PowerShell 7.0+ ready
- [ ] Scripts downloaded and available
- [ ] You understand what will happen

### Execute Now!

**DRY RUN FIRST** (no changes, just validation):
```powershell
./scripts/Execute-AzureBayMigration.ps1 -FilePath ./app/page.tsx -DryRun
```

**THEN EXECUTE** (apply changes with auto-commit):
```powershell
./scripts/Execute-AzureBayMigration.ps1 -FilePath ./app/page.tsx -CommitChanges
```

---

**Status**: 🟢 READY FOR EXECUTION  
**Next Step**: Run PowerShell script above

---

*Created: 2025-12-20 04:38 CET*  
*Branch: perplexity/feat*  
*Repository: ToniIAPro73/v0-landing-page-real-state*
