#!/usr/bin/env python
import os
import sys

backup_file = r"district_reports\KVIB_TG_district_details_01APR2022_to_31MAR2023_FIXED_backup.xlsx"
fixed_file = r"district_reports\KVIB_TG_district_details_01APR2022_to_31MAR2023_FIXED.xlsx"

if os.path.exists(backup_file):
    if os.path.exists(fixed_file):
        os.remove(fixed_file)
    os.rename(backup_file, fixed_file)
    print(f"✓ Restored backup")
    sys.exit(0)
else:
    print("No backup found")
    sys.exit(1)
