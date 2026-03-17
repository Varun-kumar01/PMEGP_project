#!/usr/bin/env python3
"""Manipulate XLSX as ZIP file to remove unwanted sheets"""

import zipfile
import shutil
import os
import xml.etree.ElementTree as ET
import tempfile

source = r'E:\kadhi\PMEGP_project\district_reports\KVIB_BACKUP_17sheets.xlsx'
output = r'E:\kadhi\PMEGP_project\district_reports\KVIB_10_SHEETS_CLEANED.xlsx'

# Sheets to keep
SHEETS_TO_KEEP = [
    'Received', 'Returned at Agency', 'Forwarded to Bank', 'Sanctioned',
    'MM Claimed', 'MM Disbursement', 'Returned by Bank', 'Pending at Agency',
    'Pend MM Disbmt - Total', 'Pend MM Disbmt - Detail'
]

print(f"Processing XLSX file as ZIP...\n")

try:
    # Create temp directory
    with tempfile.TemporaryDirectory() as tmpdir:
        # Extract XLSX (it's a ZIP)
        print("Extracting...")
        with zipfile.ZipFile(source, 'r') as z:
            z.extractall(tmpdir)
        
        # Parse workbook.xml to find sheet IDs
        wb_path = os.path.join(tmpdir, 'xl', 'workbook.xml')
        tree = ET.parse(wb_path)
        root = tree.getroot()
        
        # Find namespace
        ns = {'': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
        
        # Get all sheets - try different namespace approaches
        sheets_elem = None
        try:
            sheets_elem = root.find('.//{{http://schemas.openxmlformats.org/spreadsheetml/2006/main}}sheets')
        except:
            pass
        
        if sheets_elem is None:
            # Try without namespace
            for child in root:
                if 'sheets' in child.tag:
                    sheets_elem = child
                    break
        
        print(f"Found sheets element")
        
        # Find and mark sheets to delete
        sheet_ids_to_delete = []
        for sheet in sheets_elem:
            sheet_name = sheet.get('name')
            sheet_id = sheet.get('sheetId')
            sheet_rel_id = sheet.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')
            
            print(f"  {sheet_name:40s} (id={sheet_id}, rel={sheet_rel_id[:3] if sheet_rel_id else 'N/A'})")
            
            if sheet_name not in SHEETS_TO_KEEP:
                sheet_ids_to_delete.append((sheet, sheet_name, sheet_id))
        
        # Remove sheets from workbook.xml
        for sheet_elem, sheet_name, sheet_id in sheet_ids_to_delete:
            sheets_elem.remove(sheet_elem)
        
        # Save modified workbook.xml
        tree.write(wb_path, encoding='utf-8', xml_declaration=True)
        
        print(f"\n✓ Removed {len(sheet_ids_to_delete)} sheets from workbook.xml")
        
        # Re-create ZIP
        print(f"Re-creating XLSX...")
        if os.path.exists(output):
            os.remove(output)
        
        shutil.make_archive(output.replace('.xlsx', ''), 'zip', tmpdir)
        os.rename(output.replace('.xlsx', '.zip'), output)
        
        print(f"✅ Created: {output}")

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
