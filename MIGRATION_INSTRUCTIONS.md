# 🚸 Azure Bay Residences Migration Guide

## Overview

This guide walks through migrating the landing page from **Playa Viva** to **Azure Bay Residences**.

### Status
- ✅ **Operation 1**: Hero title & structured data (commit `12903822`)
- ὾0 **Operations 2-5**: Pending (ready to execute)

---

## Approach: Python-Powered Migration

We use a **Python validation + replacement script** to ensure all changes are:
- Pre-validated before applying
- Tracked with line-level precision
- Reversible with backup

### Files

| File | Purpose |
|------|----------|
| `scripts/azure-bay-migration.py` | Core Find & Replace engine with validation |
| `scripts/Execute-AzureBayMigration.ps1` | PowerShell orchestrator (validate → execute → commit) |

---

## Execution Steps

### Step 1: Reset to Clean State

First, reset the `perplexity/feat` branch to the last good commit (Operation 1):

```bash
# Option A: Hard reset to Operation 1 commit
git reset --hard 12903822b33f753979cf4d38142d158e8ba32900

# Option B: If you want to keep a record, create a "reset" commit
git revert 2a022dd04c7f0149ca439781f5c27533f4c5c707  # Revert bad Operation 2
```

**Why?** The Operation 2 commit corrupted app/page.tsx. We're resetting to the validated Operation 1 state and applying Operations 2-5 atomically.

### Step 2: Dry-Run Validation

Validate all transformations WITHOUT making changes:

```powershell
# PowerShell
./scripts/Execute-AzureBayMigration.ps1 -FilePath ./app/page.tsx -DryRun
```

Or directly with Python:

```bash
python ./scripts/azure-bay-migration.py ./app/page.tsx --dry-run
```

**Expected output:**
```
🔍 Validating all operations...
✅ Op2_es_wynn_description: ✅ Ready (1 match found)
✅ Op2_es_wynn_appreciation: ✅ Ready (1 match found)
✅ Op2_es_gallery_subtitle: ✅ Ready (1 match found)
...
📊 Total operations applied: 8/12
```

### Step 3: Apply Migrations

Once validation passes, apply all transformations:

```powershell
# PowerShell with auto-commit
./scripts/Execute-AzureBayMigration.ps1 -FilePath ./app/page.tsx -CommitChanges
```

Or manually:

```bash
# Run migration
python ./scripts/azure-bay-migration.py ./app/page.tsx

# Stage changes
git add app/page.tsx

# Commit
git commit -m "[Azure Bay] Operations 2-5: Naming, Location, Pricing & Currency"
```

### Step 4: Verify Changes

```bash
# Review what changed
git show HEAD:app/page.tsx | grep "Azure Bay Residences" | head -5

# Count occurrences
git show HEAD:app/page.tsx | grep -c "Premium Beachfront Community"
```

---

## Operations Breakdown

### 📋 Operation 1: Hero Title & Structured Data (DONE)
**Commit**: `12903822b33f753979cf4d38142d158e8ba32900`

- Project name: `Playa Viva` → `Azure Bay Residences`
- SITE_URL: `playaviva-uniestate.vercel.app` → `azure-bay-residences.vercel.app`
- Component: `PlayaVivaLanding()` → `AzureBayLanding()`
- Hero subtitle: `AL MARJAN ISLAND, RAS AL KHAIMAH` → `PREMIUM BEACHFRONT COMMUNITY`
- Menu label: `El Efecto Wynn` → `El Efecto Resort`

### 📋 Operation 2: Location Genericization (PENDING)

**Sections affected**:
- `content.es.wynnEffect.description` → Remove Wynn-specific references
- `content.es.gallery.subtitle` → Replace location tag
- `content.es.location.title` → Generic location name
- English variants

**Key replacements**:
```
El Wynn Resort & Casino de $5.1 mil millones será el primer casino...
  → El futuro resort de clase mundial de $5.1 mil millones será...

Al Marjan Island
  → comunidad costera premium
```

### 📋 Operation 3: Price Adjustments (PENDING)

**Spanish prices** (EUR):
- Studio: `€170k` → `€162k`
- 1 Bed: `€285k` → `€275k`
- 2 Bed: `€450k` → `€467k`
- 3 Bed: `€650k` → `€689k`

**English prices** (GBP):
- Studio: `£150k` → `£154.8k`
- 1 Bed: `£210k` → `£245.1k`
- 2 Bed: `£320k` → `£387k`
- 3 Bed: `£435k` → `£570k`

### 📋 Operation 4: Currency Formatting (PENDING)

Ensure consistent formatting across all sections:
- EUR: `€` before number (e.g., `€170.000`)
- GBP: `£` before number (e.g., `£150,000`)

### 📋 Operation 5: Meta Tags & SEO (PENDING)

Updates to:
- Page title, description, OG tags (in `app/layout.tsx` or Head component)
- Canonical URL
- Structured data breadcrumbs

---

## Troubleshooting

### Issue: "Pattern not found"

**Cause**: The search pattern doesn't exist in the file.

**Solution**:
1. Check if Operation 1 was applied correctly
2. Verify the file encoding is UTF-8
3. Check for variations in spacing or characters

### Issue: "Found N matches (expected 1)"

**Cause**: The pattern appears multiple times, which could cause unintended replacements.

**Solution**:
1. Make the pattern more specific
2. Add surrounding context to make it unique
3. Review the matches manually before proceeding

### Issue: "Migration failed - restoring backup"

**Cause**: Python script encountered an error during execution.

**Solution**:
1. Check Python version (requires 3.9+)
2. Verify file path is correct
3. Review validation output for specific errors
4. The backup file (`app/page.tsx.backup`) is automatically created

---

## Rollback

If something goes wrong:

```bash
# Option 1: Restore from backup
cp app/page.tsx.backup app/page.tsx

# Option 2: Reset to previous commit
git reset --hard HEAD~1

# Option 3: Use git reflog to find any previous state
git reflog
git reset --hard <commit-hash>
```

---

## Next Steps (After Migration)

1. **Test locally**:
   ```bash
   npm run dev
   ```

2. **Visual inspection**:
   - Check hero section loads with correct naming
   - Verify prices display correctly
   - Test language toggle (ES/EN)

3. **SEO verification**:
   - Check meta tags in browser DevTools
   - Validate OG tags for social sharing

4. **Push to remote**:
   ```bash
   git push origin perplexity/feat
   ```

5. **Create PR** with detailed changelog

---

## Quick Reference

```bash
# Full execution in one command
./scripts/Execute-AzureBayMigration.ps1 -FilePath ./app/page.tsx -CommitChanges

# Dry-run only
./scripts/Execute-AzureBayMigration.ps1 -FilePath ./app/page.tsx -DryRun

# Python direct (useful for debugging)
python ./scripts/azure-bay-migration.py ./app/page.tsx --dry-run
```

---

**Prepared by**: Perplexity Agent  
**Date**: 2025-12-20 03:32 CET  
**Branch**: `perplexity/feat`
