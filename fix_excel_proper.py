import zipfile
import xml.etree.ElementTree as ET
import shutil
import os
import re

# The 6 missing columns
missing_columns = [
    'physical_verification_status',
    'mm_final_adjustment_date', 
    'mm_final_adjustment_amount',
    'tdr_account_no',
    'tdr_date',
    'year'
]

input_file = r"district_reports\KVIB_TG_district_details_01APR2022_to_31MAR2023_FIXED.xlsx"
backup_file = input_file.replace('.xlsx', '_backup.xlsx')
temp_dir = r"_xlsx_temp3"

try:
    print("=" * 80)
    print("FIXING EXCEL FILE - Adding Missing Columns (Preserved ZIP)")
    print("=" * 80)
    
    # Backup original
    if os.path.exists(backup_file):
        os.remove(backup_file)
    shutil.copy(input_file, backup_file)
    print(f"\n✓ Created backup: {backup_file}")
    
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
    
    print(f"\n2. Adding 6 missing columns to headers...")
    
    # Register namespace to avoid ns0 prefix issues
    ET.register_namespace('', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main')
    ET.register_namespace('r', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships')
    ET.register_namespace('mc', 'http://schemas.openxmlformats.org/markup-compatibility/2006')
    ET.register_namespace('x14ac', 'http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac')
    
    # Parse XML
    tree = ET.parse(ws_path)
    root = tree.getroot()
    
    # Define namespace
    ns = {'sml': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
          'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
    
    # Find first row
    sheet_data = root.find('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}sheetData')
    
    if sheet_data is not None:
        first_row = sheet_data.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row')
        
        if first_row is not None:
            # Column letters for cols 63-68
            col_letters = ['BL', 'BM', 'BN', 'BO', 'BP', 'BQ']
            
            for i, col_name in enumerate(missing_columns):
                cell_ref = f"{col_letters[i]}1"
               
                # Create cell
                new_cell = ET.Element('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c')
                new_cell.set('r', cell_ref)
                new_cell.set('t', 'inlineStr')
                
                # Create inline string
                is_elem = ET.SubElement(new_cell, '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}is')
                t_elem = ET.SubElement(is_elem, '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')
                t_elem.text = col_name
                
                first_row.append(new_cell)
                print(f"   ✓ {cell_ref}: {col_name}")
    
    # Write back with proper declaration
    tree.write(ws_path, encoding='utf-8', xml_declaration=True)
    print(f"   ✓ Saved")
    
    # Preserve file order and ZIP structure
    print(f"\n3. Creating updated Excel (preserving ZIP structure)...")
    temp_copy = input_file + '.temp'
    if os.path.exists(temp_copy):
        os.remove(temp_copy)
    
    # Create Zip with proper order:[Content_Types].xml first, then others
    with zipfile.ZipFile(temp_copy, 'w', zipfile.ZIP_DEFLATED) as zf:
        # Add [Content_Types].xml first
        content_types_path = os.path.join(temp_dir, '[Content_Types].xml')
        if os.path.exists(content_types_path):
            zf.write(content_types_path, '[Content_Types].xml')
        
        # Then walk and add everything else
        for root_dir, dirs, files in os.walk(temp_dir):
            # Skip _rels at root level (will be added with proper ordering)
            for file in files:
                if file == '[Content_Types].xml':
                    continue  # Already added
                
                file_path = os.path.join(root_dir, file)
                arcname = os.path.relpath(file_path, temp_dir)
                
                # Normalize path separators
                arcname = arcname.replace('\\', '/')
                
                zf.write(file_path, arcname)
    
    # Replace original with temp copy
    os.remove(input_file)
    os.rename(temp_copy, input_file)
    
    print(f"   ✓ Created")
    
    size_mb = os.path.getsize(input_file) / (1024*1024)
    print(f"   Size: {size_mb:.2f} MB")
    
    # Cleanup
    shutil.rmtree(temp_dir)
    
    print(f"\n{'='*80}")
    print(f"✓ SUCCESS! File updated with 6 missing columns")
    print(f"{'='*80}")
    print(f"\nFile: {input_file}")
    print(f"✓ Total columns: 68 (First 62 with data + 6 new empty)")
    
except Exception as e:
    print(f"\n✗ Error: {e}")
    import traceback
    traceback.print_exc()
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)
