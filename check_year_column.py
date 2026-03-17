#!/usr/bin/env python
import zipfile
import xml.etree.ElementTree as ET

fixed_file = r"district_reports\KVIB_TG_district_details_01APR2022_to_31MAR2023_FIXED.xlsx"

try:
    print("=" * 80)
    print("CHECKING FOR YEAR COLUMN")
    print("=" * 80)
    
    with zipfile.ZipFile(fixed_file, 'r') as zf:
        ws_data = zf.read('xl/worksheets/sheet1.xml')
        root = ET.fromstring(ws_data)
        
        ns = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
        sheet_data = root.find(f'.//{{{ns}}}sheetData')
        
        if sheet_data is not None:
            rows = sheet_data.findall(f'{{{ns}}}row')
            if rows:
                first_row = rows[0]
                cells = first_row.findall(f'{{{ns}}}c')
                
                # Extract all headers
                headers = []
                for cell in cells:
                    cell_ref = cell.get('r', '')
                    is_elem = cell.find(f'{{{ns}}}is')
                    if is_elem is not None:
                        t_elem = is_elem.find(f'{{{ns}}}t')
                        if t_elem is not None:
                            headers.append((cell_ref, t_elem.text))
                
                print(f"\nTotal columns found: {len(headers)}")
                print(f"\nALL COLUMNS IN ORDER:")
                for col_num, (cell_ref, header_name) in enumerate(headers, 1):
                    print(f"{col_num:2d}. Cell {cell_ref:4s}: {header_name}")
                
                # Check for year column
                print(f"\n{'='*80}")
                year_found = False
                for col_num, (cell_ref, header_name) in enumerate(headers, 1):
                    if header_name.lower() == 'year':
                        print(f"✓ FOUND: 'year' is in column {col_num} (Cell {cell_ref})")
                        year_found = True
                        break
                
                if not year_found:
                    print(f"✗ NOT FOUND: 'year' column is missing!")
                    print(f"\nLast 5 columns are:")
                    for col_num, (cell_ref, header_name) in enumerate(headers[-5:], len(headers)-4):
                        print(f"  {col_num}. {header_name}")
                
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
