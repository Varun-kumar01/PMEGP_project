import zipfile
import xml.etree.ElementTree as ET
import shutil
import os

# The 6 missing columns that need to be added
missing_columns = [
    'physical_verification_status',
    'mm_final_adjustment_date', 
    'mm_final_adjustment_amount',
    'tdr_account_no',
    'tdr_date',
    'year'
]

input_file = r"district_reports\KVIB_TG_district_details_01APR2022_to_31MAR2023_FIXED.xlsx"
temp_dir = r"_xlsx_temp2"

try:
    print("=" * 80)
    print("ADDING MISSING COLUMNS TO EXCEL FILE")
    print("=" * 80)
    
    # Create temp directory
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)
    os.makedirs(temp_dir)
    
    print(f"\n1. Extracting Excel archive...")
    with zipfile.ZipFile(input_file, 'r') as zip_ref:
        zip_ref.extractall(temp_dir)
    print(f"   ✓ Extracted")
    
    # Find worksheet XML
    ws_path = os.path.join(temp_dir, 'xl', 'worksheets', 'sheet1.xml')
    
    print(f"\n2. Adding missing columns to headers...")
    
    # Parse XML
    tree = ET.parse(ws_path)
    root = tree.getroot()
    
    # Find first row
    sheet_data = root.find('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}sheetData')
    
    if sheet_data is not None:
        first_row = sheet_data.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row')
        
        if first_row is not None:
            cells = first_row.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c')
            next_col_idx = len(cells) + 1  # Next column after existing cells
            
            # Column letters mapping (63=BL, 64=BM, 65=BN, 66=BO, 67=BP, 68=BQ)
            col_letters = ['BL', 'BM', 'BN', 'BO', 'BP', 'BQ']
            
            for i, col_name in enumerate(missing_columns):
                cell_ref = f"{col_letters[i]}{1}"  # BL1, BM1, etc for row 1
                
                # Create new cell element
                new_cell = ET.Element('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c')
                new_cell.set('r', cell_ref)
                new_cell.set('t', 'inlineStr')
                
                # Create is (inline string) element
                is_elem = ET.SubElement(new_cell, '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}is')
                t_elem = ET.SubElement(is_elem, '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')
                t_elem.text = col_name
                
                # Append to first row
                first_row.append(new_cell)
                print(f"   Added: {cell_ref} = '{col_name}'")
    
    # Save modified XML
    tree.write(ws_path, encoding='utf-8', xml_declaration=True)
    print(f"   ✓ XML saved")
    
    # Create new Excel with all 68 columns
    print(f"\n3. Creating updated Excel file...")
    if os.path.exists(input_file):
        os.remove(input_file)
    
    with zipfile.ZipFile(input_file, 'w', zipfile.ZIP_DEFLATED) as zip_out:
        for root_dir, dirs, files in os.walk(temp_dir):
            for file in files:
                file_path = os.path.join(root_dir, file)
                arcname = os.path.relpath(file_path, temp_dir)
                zip_out.write(file_path, arcname)
    
    print(f"   ✓ Excel file updated")
    size_mb = os.path.getsize(input_file) / (1024*1024)
    print(f"   Size: {size_mb:.2f} MB")
    
    # Cleanup
    shutil.rmtree(temp_dir)
    
    print(f"\n{'='*80}")
    print(f"✓ SUCCESS! All 68 columns added")
    print(f"{'='*80}")
    print(f"\nFile: {input_file}")
    print(f"✓ File is now ready for database upload!")
    
except Exception as e:
    print(f"\n✗ Error: {e}")
    import traceback
    traceback.print_exc()
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)
