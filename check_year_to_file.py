#!/usr/bin/env python
import zipfile
import xml.etree.ElementTree as ET

fixed_file = r"district_reports\KVIB_TG_district_details_01APR2022_to_31MAR2023_FIXED.xlsx"
output_file = "year_column_check.txt"

try:
    with open(output_file, 'w') as f:
        f.write("=" * 80 + "\n")
        f.write("CHECKING FOR YEAR COLUMN\n")
        f.write("=" * 80 + "\n\n")
        
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
                    
                    f.write(f"Total columns found: {len(headers)}\n\n")
                    f.write("ALL COLUMNS IN ORDER:\n")
                    for col_num, (cell_ref, header_name) in enumerate(headers, 1):
                        f.write(f"{col_num:2d}. Cell {cell_ref:4s}: {header_name}\n")
                    
                    # Check for year column
                    f.write(f"\n{'='*80}\n")
                    year_found = False
                    for col_num, (cell_ref, header_name) in enumerate(headers, 1):
                        if header_name.lower() == 'year':
                            f.write(f"✓ FOUND: 'year' is in column {col_num} (Cell {cell_ref})\n")
                            year_found = True
                            break
                    
                    if not year_found:
                        f.write(f"✗ NOT FOUND: 'year' column is missing!\n")
                        f.write(f"\nLast 5 columns are:\n")
                        for col_num, (cell_ref, header_name) in enumerate(headers[-5:], len(headers)-4):
                            f.write(f"  {col_num}. {header_name}\n")
        
        print(f"✓ Report written to {output_file}")

except Exception as e:
    with open(output_file, 'w') as f:
        f.write(f"Error: {e}\n")
        import traceback
        f.write(traceback.format_exc())
