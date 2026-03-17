import zipfile
import xml.etree.ElementTree as ET
import os
import shutil

fixed_file = r"district_reports\KVIB_TG_district_details_01APR2022_to_31MAR2023_FIXED.xlsx"
temp_dir = "_temp_fix_cols"

try:
    print("=" * 80)
    print("ADDING 6 MISSING COLUMNS TO EXCEL FILE")
    print("=" * 80)
    
    # Cleanup temp dir
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)
    os.makedirs(temp_dir)
    
    # Extract
    print(f"\n1. Extracting {os.path.basename(fixed_file)}...")
    with zipfile.ZipFile(fixed_file, 'r') as zf:
        zf.extractall(temp_dir)
        file_list = zf.namelist()  # Save file list order
    print(f"   ✓ Extracted {len(file_list)} files")
    
    # Register XML namespaces
    ET.register_namespace('', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main')
    ET.register_namespace('r', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships')
    ET.register_namespace('mc', 'http://schemas.openxmlformats.org/markup-compatibility/2006')
    
    # Modify worksheet
    ws_path = os.path.join(temp_dir, 'xl', 'worksheets', 'sheet1.xml')
    print(f"\n2. Adding 6 missing columns...")
   
    tree = ET.parse(ws_path)
    root = tree.getroot()
    
    ns_url = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
    sheet_data = root.find(f'.//{{{ns_url}}}sheetData')
    
    if sheet_data is not None:
        first_row = sheet_data.find(f'{{{ns_url}}}row')
        if first_row is not None:
            col_letters = ['BL', 'BM', 'BN', 'BO', 'BP', 'BQ']
            col_names = [
                'physical_verification_status',
                'mm_final_adjustment_date',
                'mm_final_adjustment_amount',
                'tdr_account_no',
                'tdr_date',
                'year'
            ]
            
            for letter, name in zip(col_letters, col_names):
                cell_ref = f"{letter}1"
                cell = ET.Element(f'{{{ns_url}}}c')
                cell.set('r', cell_ref)
                cell.set('t', 'inlineStr')
                
                is_elem = ET.SubElement(cell, f'{{{ns_url}}}is')
                t_elem = ET.SubElement(is_elem, f'{{{ns_url}}}t')
                t_elem.text = name
                
                first_row.append(cell)
                print(f"   ✓ {cell_ref}: {name}")
    
    # Save XML with declaration
    tree.write(ws_path, encoding='utf-8', xml_declaration=True)
    print(f"   ✓ Worksheet updated")
    
    # Repackage - use file list to preserve order
    print(f"\n3. Repackaging Excel file...")
    temp_xlsx = fixed_file + ".tmp"
    if os.path.exists(temp_xlsx):
        os.remove(temp_xlsx)
    
    with zipfile.ZipFile(temp_xlsx, 'w', zipfile.ZIP_DEFLATED) as zf_out:
        for file_in_archive in file_list:
            file_path = os.path.join(temp_dir, file_in_archive)
            if os.path.exists(file_path):
                zf_out.write(file_path, file_in_archive)
            else:
                # File might be in different path due to extraction
                for root_dir, dirs, files in os.walk(temp_dir):
                    if file_in_archive.replace('/', '\\') in file_path or file_in_archive in file_path:
                        zf_out.write(file_path, file_in_archive)
                        break
    
    # Replace original
    os.remove(fixed_file)
    os.rename(temp_xlsx, fixed_file)
    print(f"   ✓ File updated")
    
    # Cleanup
    shutil.rmtree(temp_dir)
    
    print(f"\n{'='*80}")
    print(f"✓ SUCCESS! File now has 68 columns")
    print(f"{'='*80}")
    print(f"\nFile: {fixed_file}")
    print(f"Size: {os.path.getsize(fixed_file) / (1024*1024):.2f} MB")
    print(f"\n✓ File is ready for database upload!")
    
except Exception as e:
    print(f"\n✗ Error: {e}")
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)
