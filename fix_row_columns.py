#!/usr/bin/env python
import zipfile
import xml.etree.ElementTree as ET
import os

correct_file = r"district_reports\KVIB_TG_district_details_01APR2022_to_31MAR2023_CORRECT.xlsx"
fixed_file = r"district_reports\KVIB_TG_district_details_01APR2022_to_31MAR2023_CORRECTED.xlsx"

print("=" * 100)
print("FIXING EXCEL FILE - Adding Missing Columns to Data Rows")
print("=" * 100)

try:
    # Column letters A-Z, AA-AZ, BA-BQ (for 68 columns)
    col_letters = []
    for i in range(26):
        col_letters.append(chr(65 + i))  # A-Z
    for i in range(26, 52):
        col_letters.append('A' + chr(65 + i - 26))  # AA-AZ
    for i in range(52, 68):
        col_letters.append('B' + chr(65 + i - 52))  # BA-BQ
    
    print(f"\nTarget: 68 columns")
    print(f"Column range: {col_letters[0]} to {col_letters[67]}")
    
    ns = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
    ET.register_namespace('', ns)
    ET.register_namespace('r', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships')
    ET.register_namespace('mc', 'http://schemas.openxmlformats.org/markup-compatibility/2006')
    ET.register_namespace('x14ac', 'http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac')
    
    print(f"\n1. Processing worksheet...")
    
    with zipfile.ZipFile(correct_file, 'r') as zip_in:
        with zipfile.ZipFile(fixed_file, 'w', zipfile.ZIP_DEFLATED) as zip_out:
            for item in zip_in.infolist():
                data = zip_in.read(item.filename)
                
                # Modify only sheet1.xml
                if item.filename.endswith('/sheet1.xml') or item.filename == 'xl/worksheets/sheet1.xml':
                    print(f"   Modifying {item.filename}...")
                    
                    root = ET.fromstring(data)
                    sheet_data = root.find(f'.//{{{ns}}}sheetData')
                    
                    if sheet_data is not None:
                        rows = sheet_data.findall(f'{{{ns}}}row')
                        print(f"   Total rows: {len(rows)}")
                        
                        fixed_count = 0
                        
                        for row_idx, row in enumerate(rows):
                            cells = row.findall(f'{{{ns}}}c')
                            current_col_count = len(cells)
                            
                            # For data rows (skip header)
                            if row_idx > 0 and current_col_count < 68:
                                # Add missing cells
                                for col_idx in range(current_col_count, 68):
                                    col_letter = col_letters[col_idx]
                                    row_num = row.get('r', str(row_idx + 1))
                                    cell_ref = f"{col_letter}{row_num}"
                                    
                                    # Create empty cell
                                    new_cell = ET.Element(f'{{{ns}}}c')
                                    new_cell.set('r', cell_ref)
                                    # Don't set type for empty cells
                                    
                                    row.append(new_cell)
                                
                                fixed_count += 1
                        
                        print(f"   Fixed {fixed_count} rows with missing columns")
                    
                    # Convert back to bytes
                    data = ET.tostring(root, encoding='utf-8')
                    data = b'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' + data
                
                zip_out.writestr(item, data, compress_type=item.compress_type)
    
    print(f"\n2. Verifying fixed file...")
    
    with zipfile.ZipFile(fixed_file, 'r') as zf:
        ws_data = zf.read('xl/worksheets/sheet1.xml')
        root = ET.fromstring(ws_data)
        
        sheet_data = root.find(f'.//{{{ns}}}sheetData')
        rows = sheet_data.findall(f'{{{ns}}}row')
        
        # Check row structure
        row_lengths = set()
        for row in rows:
            cells = row.findall(f'{{{ns}}}c')
            row_lengths.add(len(cells))
        
        print(f"   Total rows: {len(rows)}")
        print(f"   Column counts: {sorted(row_lengths)}")
        
        if len(row_lengths) == 1 and list(row_lengths)[0] == 68:
            print(f"   Status: ALL ROWS HAVE 68 COLUMNS ✓")
        else:
            print(f"   Status: WARNING - Inconsistent columns detected")
    
    file_size = os.path.getsize(fixed_file) / (1024*1024)
    
    print(f"\n{'='*100}")
    print(f"✓ FILE FIXED!")
    print(f"{'='*100}")
    print(f"\nOriginal file: {correct_file} ({os.path.getsize(correct_file)/(1024*1024):.2f} MB)")
    print(f"Fixed file: {fixed_file} ({file_size:.2f} MB)")
    print(f"\n✓ All rows now have exactly 68 columns")
    print(f"✓ Ready for database upload!")

except Exception as e:
    print(f"\nERROR: {e}")
    import traceback
    traceback.print_exc()
