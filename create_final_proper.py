#!/usr/bin/env python3
"""Create final file using proper ZIP writing"""

import zipfile
import tempfile
import os
import xml.etree.ElementTree as ET

source = r'E:\kadhi\PMEGP_project\district_reports\KVIB_10_SHEETS_CLEANED.xlsx'
output = r'E:\kadhi\PMEGP_project\district_reports\FINAL_10_SHEETS.xlsx'

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

print("Processing...\n")

try:
    with tempfile.TemporaryDirectory() as tmpdir:
        # Extract
        print("  Extracting...")
        with zipfile.ZipFile(source, 'r') as z:
            z.extractall(tmpdir)
        
        # Update workbook.xml
        wb_path = os.path.join(tmpdir, 'xl', 'workbook.xml')
        tree = ET.parse(wb_path)
        root = tree.getroot()
        
        ET.register_namespace('', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main')
        ET.register_namespace('r', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships')
        
        sheets = root.find('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}sheets')
        for sheet in sheets:
            old = sheet.get('name')
            if old in RENAME_MAP:
                sheet.set('name', RENAME_MAP[old])
                print(f"    {old:35s} → {RENAME_MAP[old]}")
        
        tree.write(wb_path, encoding='utf-8', xml_declaration=True)
        
        # Re-create ZIP
        print(f"\n  Creating ZIP...")
        if os.path.exists(output):
            os.remove(output)
        
        with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as zout:
            for root_dir, dirs, files in os.walk(tmpdir):
                for file in files:
                    file_path = os.path.join(root_dir, file)
                    arcname = os.path.relpath(file_path, tmpdir)
                    zout.write(file_path, arcname)
        
        print(f"\n✅ Created: {output}")
        
        # Verify
        import os
        size_mb = os.path.getsize(output) / (1024*1024)
        print(f"✅ Size: {size_mb:.1f} MB")
        print(f"✅ Ready for upload!")

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
