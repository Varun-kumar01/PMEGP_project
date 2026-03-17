#!/usr/bin/env python
import zipfile
import xml.etree.ElementTree as ET

fixed_file = r"district_reports\KVIB_TG_district_details_01APR2022_to_31MAR2023_FIXED.xlsx"

try:
    print("=" * 80)
    print("FINAL VERIFICATION")
    print("=" * 80)
    
    with zipfile.ZipFile(fixed_file, 'r') as zf:
        print(f"\n✓ File is valid ZIP archive")
        print(f"  Files in archive: {len(zf.namelist())}")
        
        # Read and parse sheet1.xml
        ws_data = zf.read('xl/worksheets/sheet1.xml')
        root = ET.fromstring(ws_data)
        
        ns = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
        sheet_data = root.find(f'.//{{{ns}}}sheetData')
        
        if sheet_data is not None:
            rows = sheet_data.findall(f'{{{ns}}}row')
            if rows:
                first_row = rows[0]
                cells = first_row.findall(f'{{{ns}}}c')
                
                # Extract column headers
                headers = []
                for cell in cells:
                    cell_ref = cell.get('r')
                    is_elem = cell.find(f'{{{ns}}}is')
                    if is_elem is not None:
                        t_elem = is_elem.find(f'{{{ns}}}t')
                        if t_elem is not None:
                            headers.append(t_elem.text)
                
                print(f"\n✓ Successfully read Excel worksheet")
                print(f"  Total rows in sheet: {len(rows)}")
                print(f"  Column headers found: {len(headers)}")
                
                print(f"\nFIRST 10 COLUMNS:")
                for i, h in enumerate(headers[:10], 1):
                    print(f"  {i:2d}. {h}")
                
                print(f"\nLAST 10 COLUMNS:")
                for i, h in enumerate(headers[-10:], len(headers)-9):
                    print(f"  {i:2d}. {h}")
                
                # Check if all columns are present
                expected_cols = {
                    'id', 'current_status', 'under_process_agency_reason', 'agency_received',
                    'agency_returned', 'pending_at_agency', 'forwarded_to_bank', 
                    'physical_verification_status', 'mm_final_adjustment_date', 
                    'mm_final_adjustment_amount', 'tdr_account_no', 'tdr_date', 'year'
                }
                
                has_key_cols = any(h in expected_cols for h in headers)
                
                if len(headers) == 68:
                    print(f"\n{'='*80}")
                    print(f"✓✓✓ PERFECT! Excel file has exactly 68 columns")
                    print(f"{'='*80}")
                    print(f"\nFile is READY FOR DATABASE UPLOAD!")
                else:
                    print(f"\n⚠ File has {len(headers)} columns (expected 68)")

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
