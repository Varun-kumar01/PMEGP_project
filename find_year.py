import zipfile
import xml.etree.ElementTree as ET

fixed_file = r"district_reports\KVIB_TG_district_details_01APR2022_to_31MAR2023_FIXED.xlsx"

with zipfile.ZipFile(fixed_file, 'r') as zf:
    ws_data = zf.read('xl/worksheets/sheet1.xml')
    root = ET.fromstring(ws_data)
    
    ns = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
    sheet_data = root.find(f'.//{{{ns}}}sheetData')
    
    rows = sheet_data.findall(f'{{{ns}}}row')
    first_row = rows[0]
    cells = first_row.findall(f'{{{ns}}}c')
    
    headers = []
    for cell in cells:
        cell_ref = cell.get('r', '')
        is_elem = cell.find(f'{{{ns}}}is')
        if is_elem is not None:
            t_elem = is_elem.find(f'{{{ns}}}t')
            if t_elem is not None:
                headers.append(t_elem.text)
    
    # Find year
    if 'year' in headers:
        idx = headers.index('year') + 1
        print(f"FOUND: year is at column {idx}")
    else:
        print(f"MISSING: year column not found")
        print(f"Total: {len(headers)} columns")
        print(f"Last 5: {headers[-5:]}")
