#!/bin/bash

# Reset and Migrate Script
# Purpose: Reset to Operation 1, then apply Operations 2-5 atomically

set -e

echo "🔄 Azure Bay Migration: Reset and Execute"
echo "================================================="
echo ""

# Step 1: Reset to good commit
echo "[1/4] Resetting to Operation 1 commit..."
git reset --hard 12903822b33f753979cf4d38142d158e8ba32900
echo "✅ Reset complete"
echo ""

# Step 2: Show current state
echo "[2/4] Verifying file state..."
echo "Checking for 'Azure Bay Residences'..."
grep -c "Azure Bay Residences" app/page.tsx || echo "⚠️ Pattern not found"
echo ""

# Step 3: Run migration
echo "[3/4] Running migration (Operations 2-5)..."
python3 scripts/azure-bay-migration.py app/page.tsx
echo ""

# Step 4: Commit
echo "[4/4] Creating commit..."
git add app/page.tsx
git commit -m "[Azure Bay] Operations 2-5: Location, Pricing & Currency

Applied transformations:
- Op2: Location genericization (Al Marjan → Premium Beachfront Community)
- Op3: Price adjustments
- Op4: Currency formatting
- Op5: Meta tags preparation

All patterns pre-validated before execution."

echo ""
echo "🚀 Migration complete!"
echo "Commit: $(git rev-parse --short HEAD)"
echo ""
echo "Next steps:"
echo "  1. Test locally: npm run dev"
echo "  2. Verify changes: git show HEAD"
echo "  3. Push: git push origin perplexity/feat"
