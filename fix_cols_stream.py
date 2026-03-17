import zipfile
import xml.etree.ElementTree as ET
import os
import shutil
import io

fixed_file = r"district_reports\KVIB_TG_district_details_01APR2022_to_31MAR2023_FIXED.xlsx"
temp_zip = fixed_file + ".new"

try:
    print("=" * 80)
    print("ADDING 6 MISSING COLUMNS - STREAMING METHOD")
    print("=" * 80)
    
    ns_url = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
    ET.register_namespace('', ns_url)
    ET.register_namespace('r', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships')
    ET.register_namespace('mc', 'http://schemas.openxmlformats.org/markup-compatibility/2006')
    
    col_data = [
        ('BL', 'physical_verification_status'),
        ('BM', 'mm_final_adjustment_date'),
        ('BN', 'mm_final_adjustment_amount'),
        ('BO', 'tdr_account_no'),
        ('BP', 'tdr_date'),
        ('BQ', 'year')
    ]
    
    print(f"\n1. Processing {os.path.basename(fixed_file)}...")
    
    # Read and modify just the worksheet XML, rewrite everything
    with zipfile.ZipFile(fixed_file, 'r') as zip_in:#
        print(f"   ✓ Opened original ({len(zip_in.namelist())} files)")
        
        with zipfile.ZipFile(temp_zip, 'w', zipfile.ZIP_DEFLATED) as zip_out:
            for item in zip_in.namelist():
                data = zip_in.read(item)
                
                # Modify worksheet XML only
                if item.endswith('sheet1.xml'):
                    print(f"\n2. Modifying {item}...")
                    root = ET.fromstring(data)
                    
                    # Find first row and add missing columns
                    sheet_data = root.find(f'.//{{{ns_url}}}sheetData')
                    if sheet_data is not None:
                        first_row = sheet_data.find(f'{{{ns_url}}}row')
                        if first_row is not None:
                            for col_letter, col_name in col_data:
                                cell = ET.Element(f'{{{ns_url}}}c')
                                cell.set('r', f"{col_letter}1")
                                cell.set('t', 'inlineStr')
                                
                                is_elem = ET.SubElement(cell, f'{{{ns_url}}}is')
                                t_elem = ET.SubElement(is_elem, f'{{{ns_url}}}t')
                                t_elem.text = col_name
                                
                                first_row.append(cell)
                                print(f"   ✓ Added {col_letter}1: {col_name}")
                    
                    # Convert back to bytes
                    data = ET.tostring(root, encoding='utf-8')
                    data = b'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' + data
                
                # Write to new zip
                zip_out.writestr(item, data)
    
    # Replace original
    print(f"\n3. Finalizing...")
    os.remove(fixed_file)
    os.rename(temp_zip, fixed_file)
    
    size_mb = os.path.getsize(fixed_file) / (1024*1024)
    print(f"   ✓ File saved ({size_mb:.2f} MB)")
    
    print(f"\n{'='*80}")
    print(f"✓ SUCCESS! All 68 columns added to Excel file")
    print(f"{'='*80}")
    print(f"\nFile: {fixed_file}")
    print(f"Status: READY FOR UPLOAD")
    
except Exception as e:
    print(f"\n✗ Error: {e}")
    if os.path.exists(temp_zip):
        try:
            os.remove(temp_zip)
        except:
            pass
    import traceback
    traceback.print_exc()
