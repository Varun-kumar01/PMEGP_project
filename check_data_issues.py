#!/usr/bin/env python
import zipfile
import xml.etree.ElementTree as ET
import re

correct_file = r"district_reports\KVIB_TG_district_details_01APR2022_to_31MAR2023_CORRECT.xlsx"

print("\n" + "=" * 100)
print("CHECKING FOR DATA ISSUES THAT MIGHT PREVENT UPLOAD")
print("=" * 100)

try:
    with zipfile.ZipFile(correct_file, 'r') as zf:
        ws_data = zf.read('xl/worksheets/sheet1.xml')
        root = ET.fromstring(ws_data)
        
        ns = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
        sheet_data = root.find(f'.//{{{ns}}}sheetData')
        rows = sheet_data.findall(f'{{{ns}}}row')
        
        print(f"\nTotal rows: {len(rows):,}")
        header_row = rows[0]
        data_rows = rows[1:] if len(rows) > 1 else []
        
        print(f"Header row: 1")
        print(f"Data rows: {len(data_rows):,}")
        
        # Check for empty cells in ID column (primary key)
        print("\n1. Checking PRIMARY KEY column (id)...")
        id_cells = header_row.findall(f'{{{ns}}}c')
        id_col = None
        for i, cell in enumerate(id_cells):
            is_elem = cell.find(f'{{{ns}}}is')
            if is_elem is not None:
                t_elem = is_elem.find(f'{{{ns}}}t')
                if t_elem is not None and t_elem.text == 'id':
                    id_col = i
                    break
        
        if id_col is not None:
            empty_ids = 0
            for row in data_rows[:100]:  # Check first 100 rows
                cells = row.findall(f'{{{ns}}}c')
                if id_col < len(cells):
                    id_cell = cells[id_col]
                    # Try to get value
                    is_elem = id_cell.find(f'{{{ns}}}is')
                    v_elem = id_cell.find(f'{{{ns}}}v')
                    has_value = False
                    if is_elem is not None:
                        t_elem = is_elem.find(f'{{{ns}}}t')
                        has_value = t_elem is not None and t_elem.text
                    elif v_elem is not None:
                        has_value = v_elem.text and v_elem.text.strip() != ''
                    
                    if not has_value:
                        empty_ids += 1
            
            print(f"   Empty IDs in first 100 rows: {empty_ids}")
            if empty_ids > 0:
                print(f"   WARNING: Primary key column has empty values!")
        
        # Check row structure (all rows should have same columns)
        print("\n2. Checking row structure consistency...")
        row_lengths = set()
        for row in data_rows[:50]:  # Check first 50 rows
            cells = row.findall(f'{{{ns}}}c')
            row_lengths.add(len(cells))
        
        if len(row_lengths) > 1:
            print(f"   WARNING: Rows have inconsistent column counts: {sorted(row_lengths)}")
        else:
            print(f"   OK: All rows have consistent structure ({list(row_lengths)[0]} columns)")
        
        # Check for merged cells
        print("\n3. Checking for merged cells...")
        merged_cells = root.findall(f'.//{{{ns}}}mergedCells')
        if merged_cells:
            merged_ranges = merged_cells[0].findall(f'{{{ns}}}mergedCell')
            print(f"   WARNING: Found {len(merged_ranges)} merged cell ranges (may cause issues)")
            for merged_range in merged_ranges[:3]:
                print(f"     - {merged_range.get('ref')}")
        else:
            print(f"   OK: No merged cells found")
        
        # Check for comments
        print("\n4. Checking for row comments or notes...")
        comments = root.findall(f'.//{{{ns}}}comment')
        if comments:
            print(f"   WARNING: Found {len(comments)} comments in worksheet")
        else:
            print(f"   OK: No comments found")
        
        # Get actual data from first few rows
        print("\n5. Sampling data from first 3 rows...")
        for row_num, row in enumerate(data_rows[:3], 1):
            cells = row.findall(f'{{{ns}}}c')
            values = []
            for cell in cells[:5]:  # First 5 columns
                is_elem = cell.find(f'{{{ns}}}is')
                if is_elem is not None:
                    t_elem = is_elem.find(f'{{{ns}}}t')
                    if t_elem is not None:
                        values.append(t_elem.text)
                else:
                    v_elem = cell.find(f'{{{ns}}}v')
                    if v_elem is not None and v_elem.text:
                        values.append(v_elem.text)
                    else:
                        values.append("")
            
            print(f"   Row {row_num}: {values}")

except Exception as e:
    print(f"\nERROR: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 100)
print("\nPOSSIBLE UPLOAD ISSUES:")
print("=" * 100)
print("\nIf the file structure is correct but upload fails, check:")
print("  1. Database connection - Is the database accessible?")
print("  2. File size limits - Is there a max upload size restriction?")
print("  3. User permissions - Do you have INSERT permission on the tables?")
print("  4. Duplicate data - Does data already exist in the database?")
print("  5. Data constraints - Check for NULL in required fields")
print("  6. Application logs - Check backend/database logs for specific errors")
print("\n" + "=" * 100)
