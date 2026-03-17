#!/usr/bin/env python3
"""Simply rename sheets in 10-sheet file using ZIP manipulation (no header updates)"""

import zipfile
import tempfile
import os
import shutil
import xml.etree.ElementTree as ET

source = r'E:\kadhi\PMEGP_project\district_reports\KVIB_10_SHEETS_CLEANED.xlsx'
output = r'E:\kadhi\PMEGP_project\district_reports\FINAL_10_SHEETS.xlsx'

# Map old names to database table names
RENAME_MAP = {
    'Received': 'agency_received',
    'Returned at Agency': 'agency_returned',
    'Pending at Agency': 'pending_at_agency',
    'Forwarded to Bank': 'forwarded_to_bank',
    'Sanctioned': 'sanctioned_by_bank_no_of_proj',
    'MM Claimed': 'mm_claimed_no_of_proj',
    'MM Disbursement': 'mm_disbursement_no_of_proj',
    'Returned by Bank': 'returned_by_bank',
    'Pend MM Disbmt - Total': 'pending_at_bank_no_of_proj',
    'Pend MM Disbmt - Detail': 'pending_for_mm_disbursement'
}

print("Creating final 10-sheet file...\n")

try:
    with tempfile.TemporaryDirectory() as tmpdir:
        # Extract
        with zipfile.ZipFile(source, 'r') as z:
            z.extractall(tmpdir)
        
        # Update sheet names
        wb_path = os.path.join(tmpdir, 'xl', 'workbook.xml')
        tree = ET.parse(wb_path)
        root = tree.getroot()
        
        # Register namespace
        ET.register_namespace('', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main')
        ET.register_namespace('r', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships')
        
        # Rename sheets
        sheets_elem = root.find('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}sheets')
        for sheet in sheets_elem:
            old_name = sheet.get('name')
            if old_name in RENAME_MAP:
                new_name = RENAME_MAP[old_name]
                sheet.set('name', new_name)
                print(f"  ✓ {old_name:35s} → {new_name}")
        
        # Save
        tree.write(wb_path, encoding='utf-8', xml_declaration=True)
        
        # Re-zip
        print(f"\nCreating Excel file...")
        shutil.make_archive(output.replace('.xlsx', ''), 'zip', tmpdir)
        os.rename(output.replace('.xlsx', '.zip'), output)
        
        print(f"\n✅ SUCCESS!")
        print(f"✅ File: {output}")
        print(f"✅ Sheets: 10 (with database table names)")
        print(f"✅ Ready to upload!")

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
