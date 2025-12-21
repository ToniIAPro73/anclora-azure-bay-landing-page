#!/usr/bin/env python3
"""
Azure Bay Migration Script
Migrates content from Spanish to English in Playa Viva landing page
"""

import re
import sys
from pathlib import Path
from typing import Dict, Tuple

class MigrationError(Exception):
    """Custom exception for migration errors"""
    pass

def load_file(filepath: str) -> str:
    """Load file content"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        print(f"✅ Loaded {filepath} ({len(content)} bytes)")
        return content
    except FileNotFoundError:
        raise MigrationError(f"❌ File not found: {filepath}")
    except Exception as e:
        raise MigrationError(f"❌ Error loading file: {str(e)}")

def save_file(filepath: str, content: str) -> None:
    """Save file content"""
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Saved {filepath}")
    except Exception as e:
        raise MigrationError(f"❌ Error saving file: {str(e)}")

def validate_operation(content: str, old_pattern: str, operation_id: str) -> Tuple[bool, int]:
    """Validate if pattern exists in content"""
    matches = len(re.findall(re.escape(old_pattern), content))
    
    if matches == 0:
        print(f"❌ {operation_id}: Pattern not found")
        return False, 0
    elif matches == 1:
        print(f"✅ {operation_id}: ✅ Ready (1 match found)")
        return True, matches
    else:
        print(f"❌ {operation_id}: Found {matches} matches (expected 1)")
        return False, matches

def apply_migration(content: str, operations: Dict) -> str:
    """Apply all migration operations"""
    for op_id, op_data in operations.items():
        old = op_data['old']
        new = op_data['new']
        
        # Simple string replacement (not regex)
        if old in content:
            content = content.replace(old, new, 1)  # Replace only first occurrence
            print(f"✅ Applied {op_id}")
        else:
            print(f"❌ Failed {op_id}: Pattern not found")
    
    return content

def main():
    # Parse arguments
    filepath = sys.argv[1] if len(sys.argv) > 1 else "./app/page.tsx"
    dry_run = "--dry-run" in sys.argv
    
    try:
        # Load file
        content = load_file(filepath)
        
        # Define migration operations with CORRECTED patterns
        operations = {
            # Operation 2: English Wynn Effect descriptions
            "Op2_en_wynn_description": {
                "old": '"The $5.1 billion Wynn Resort & Casino will be the first casino in UAE history. Its 2027 opening is catalyzing historic appreciation in Al Marjan Island.",',
                "new": '"The $5.1 billion Wynn Resort & Casino will be the first casino in UAE history. Its 2027 opening is catalyzing historic appreciation in Al Marjan Island.",'
            },
            # More specific: include context before and after
            "Op2_en_wynn_appreciation": {
                "old": 'value: "+50%",\n            label: "Rental increase",\n            sublabel: "Q1 2023 - Q1 2025",',
                "new": 'value: "+50%",\n            label: "Rental increase",\n            sublabel: "Q1 2023 - Q1 2025",'
            },
            "Op2_en_location_title": {
                "old": 'title: "Al Marjan Island",\n        subtitle: "The future of luxury living in the UAE",',
                "new": 'title: "Al Marjan Island",\n        subtitle: "The future of luxury living in the UAE",'
            },
            
            # Operation 3: English prices
            "Op3_en_hero_price": {
                "old": 'price: "Starting from £150,000",',
                "new": 'price: "Starting from £150,000",'
            },
            "Op3_en_studio_price": {
                "old": 'price: "From £146,200",',
                "new": 'price: "From £146,200",'
            },
            "Op3_en_1bed_price": {
                "old": 'price: "From £245,100",',
                "new": 'price: "From £245,100",'
            },
            "Op3_en_2bed_price": {
                "old": 'price: "From £387,000",',
                "new": 'price: "From £387,000",'
            },
            "Op3_en_3bed_price": {
                "old": 'price: "From £559,000",',
                "new": 'price: "From £559,000",'
            },
            
            # Operation 3: Spanish prices (EUR format)
            "Op3_es_hero_price_format": {
                "old": 'price: "Desde €170.000",',
                "new": 'price: "Desde €192.000",'
            },
            "Op3_es_studio_price": {
                "old": 'price: "Desde 170.000€",',
                "new": 'price: "Desde 192.000€",'
            },
            "Op3_es_1bed_price": {
                "old": 'price: "Desde 285.000€",',
                "new": 'price: "Desde 325.000€",'
            },
            "Op3_es_2bed_price": {
                "old": 'price: "Desde 450.000€",',
                "new": 'price: "Desde 540.000€",'
            },
            "Op3_es_3bed_price": {
                "old": 'price: "Desde 650.000€",',
                "new": 'price: "Desde 740.000€",'
            },
            
            # Operation 2: Spanish gallery and location
            "Op2_es_gallery_subtitle": {
                "old": 'subtitle: "Diseño arquitectónico excepcional en Al Marjan Island",',
                "new": 'subtitle: "Diseño arquitectónico excepcional en Al Marjan Island",'
            },
            "Op2_es_wynn_description": {
                "old": '"El Wynn Resort & Casino de $5.1 mil millones será el primer casino en la historia de los EAU. Su apertura en 2027 está catalizando una revalorización histórica en Al Marjan Island.",',
                "new": '"El Wynn Resort & Casino de $5.1 mil millones será el primer casino en la historia de los EAU. Su apertura en 2027 está catalizando una revalorización histórica en Al Marjan Island.",'
            },
            # More specific: include context before and after
            "Op2_es_wynn_appreciation": {
                "old": 'value: "+50%",\n            label: "Incremento en alquileres",\n            sublabel: "Q1 2023 - Q1 2025",',
                "new": 'value: "+50%",\n            label: "Incremento en alquileres",\n            sublabel: "Q1 2023 - Q1 2025",'
            },
            "Op2_es_location_title": {
                "old": 'title: "Al Marjan Island",\n        subtitle: "El futuro de la vida de lujo en los EAU",',
                "new": 'title: "Al Marjan Island",\n        subtitle: "El futuro de la vida de lujo en los EAU",'
            },
        }
        
        # Validate all operations
        print("\n🔍 Validating all operations...\n")
        all_valid = True
        for op_id, op_data in operations.items():
            is_valid, matches = validate_operation(content, op_data['old'], op_id)
            if not is_valid:
                all_valid = False
        
        if not all_valid:
            print("\n❌ Validation failed")
            return 1
        
        print("\n✅ All validations passed!")
        
        # Apply operations (unless dry-run)
        if dry_run:
            print("\n🏃 DRY RUN MODE - No changes applied")
        else:
            print("\n🚀 Applying migrations...\n")
            content = apply_migration(content, operations)
            save_file(filepath, content)
            print("\n✅ Migration complete!")
        
        return 0
    
    except MigrationError as e:
        print(f"\n{str(e)}")
        return 1
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
