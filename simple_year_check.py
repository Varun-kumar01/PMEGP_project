#!/usr/bin/env python
import zipfile
import xml.etree.ElementTree as ET

fixed_file = r"district_reports\KVIB_TG_district_details_01APR2022_to_31MAR2023_FIXED.xlsx"

try:
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
                
                headers = []
                for cell in cells:
                    cell_ref = cell.get('r', '')
                    is_elem = cell.find(f'{{{ns}}}is')
                    if is_elem is not None:
                        t_elem = is_elem.find(f'{{{ns}}}t')
                        if t_elem is not None:
                            headers.append((cell_ref, t_elem.text))
                
                # Check for year
                year_found = False
                year_col = 0
                for col_num, (cell_ref, header_name) in enumerate(headers, 1):
                    if header_name.lower() == 'year':
                        year_found = True
                        year_col = col_num
                        break
                
                if year_found:
                    print(f"YEAR COLUMN FOUND at position {year_col}")
                    print(f"Cell reference: {headers[year_col-1][0]}")
                else:
                    print(f"YEAR COLUMN NOT FOUND")
                    print(f"Total columns: {len(headers)}")
                    print(f"Last 10 columns:")
                    for col_num, (cell_ref, header_name) in enumerate(headers[-10:], len(headers)-9):
                        print(f"  {col_num}. {header_name}")

except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
