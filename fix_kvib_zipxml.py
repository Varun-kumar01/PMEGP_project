import zipfile
import xml.etree.ElementTree as ET
import shutil
import os

# Database schema - exactly 68 columns
db_columns = [
    'id', 'current_status', 'under_process_agency_reason', 'office_name', 'agency_type', 'state',
    'applicant_id', 'applicant_name', 'applicant_address', 'applicant_mobile_no', 'alternate_mobile_no',
    'email', 'aadhar_no', 'legal_status', 'gender', 'category', 'special_category', 'qualification',
    'date_of_birth', 'age', 'unit_location', 'unit_address', 'taluk_block', 'unit_district',
    'industry_type', 'product_desc_activity', 'proposed_project_cost', 'mm_involve',
    'financing_branch_ifsc_code', 'financing_branch_address', 'online_submission_date', 'dltfec_meeting',
    'dltfec_meeting_place', 'forwarding_date_to_bank', 'bank_remarks', 'date_of_documents_receiveda_at_bank',
    'project_cost_approved_ce', 'project_cost_approved_wc', 'project_cost_approved_total',
    'sanctioned_by_bank_date', 'sanctioned_by_bank_ce', 'sanctioned_by_bank_wc', 'sanctioned_by_bank_total',
    'date_of_deposit_own_contribution', 'own_contribution_amount_deposited', 'covered_under_cgtsi',
    'date_of_loan_release', 'loan_release_amount', 'mm_claim_date', 'mm_claim_amount',
    'remarks_for_mm_process_at_pmegp_co_mumbai', 'mm_release_date', 'mm_release_amount', 'payment_status',
    'mm_disbursement_transaction_id', 'fail_reason', 'edp_training_center_name', 'training_start_date',
    'training_end_date', 'training_duration_days', 'certificate_issue_date', 'physical_verification_conducted_date',
    'physical_verification_status', 'mm_final_adjustment_date', 'mm_final_adjustment_amount',
    'tdr_account_no', 'tdr_date', 'year'
]

input_file = r"district_reports\KVIB_TG_district_details_01APR2022_to_31MAR2023.xlsx"
output_file = r"district_reports\KVIB_TG_district_details_01APR2022_to_31MAR2023_FIXED.xlsx"
temp_dir = r"_xlsx_temp"

try:
    print("=" * 80)
    print("FIXING EXCEL FILE (ZIP-based approach)")
    print("=" * 80)
    
    # Create temp directory
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)
    os.makedirs(temp_dir)
    
    print(f"\n1. Extracting Excel archive...")
    with zipfile.ZipFile(input_file, 'r') as zip_ref:
        zip_ref.extractall(temp_dir)
    print(f"   ✓ Extracted")
    
    # Find the worksheet XML file
    ws_path = os.path.join(temp_dir, 'xl', 'worksheets', 'sheet1.xml')
    print(f"\n2. Modifying worksheet headers...")
    
    # Parse the XML
    tree = ET.parse(ws_path)
    root = tree.getroot()
    
    # Define namespace
    ns = {'': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    
    # Find the first row (sheetData/row[@r='1'])
    sheet_data = root.find('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}sheetData')
    
    if sheet_data is not None:
        first_row = sheet_data.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row')
        
        if first_row is not None:
            # Get all cells in first row
            cells = first_row.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c')
            
            # Replace cell values with new headers
            for idx, cell in enumerate(cells):
                if idx < len(db_columns):
                    # Find or create the value element (v)
                    value_elem = cell.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                    if value_elem is None:
                        value_elem = ET.SubElement(cell, '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                    value_elem.text = db_columns[idx]
                    
                    # Also update t (type) and remove f (formula) if present
                    cell.set('t', 'inlineStr')
                    formula = cell.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}f')
                    if formula is not None:
                        cell.remove(formula)
                    
                    # Create is (inline string) element
                    is_elem = cell.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}is')
                    if is_elem is None:
                        is_elem = ET.SubElement(cell, '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}is')
                    
                    t_elem = is_elem.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')
                    if t_elem is None:
                        t_elem = ET.SubElement(is_elem, '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')
                    t_elem.text = db_columns[idx]
                    
                    # Remove value element
                    value_elem_to_remove = cell.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                    if value_elem_to_remove is not None:
                        cell.remove(value_elem_to_remove)
            
            print(f"   ✓ Updated {len(cells)} header cells")
    
    # Save the modified XML
    tree.write(ws_path, encoding='utf-8', xml_declaration=True)
    print(f"   ✓ XML saved")
    
    # Repackage as Excel
    print(f"\n3. Creating new Excel file...")
    if os.path.exists(output_file):
        os.remove(output_file)
    
    with zipfile.ZipFile(output_file, 'w', zipfile.ZIP_DEFLATED) as zip_out:
        for root_dir, dirs, files in os.walk(temp_dir):
            for file in files:
                file_path = os.path.join(root_dir, file)
                arcname = os.path.relpath(file_path, temp_dir)
                zip_out.write(file_path, arcname)
    
    print(f"   ✓ Excel file created")
    size_mb = os.path.getsize(output_file) / (1024*1024)
    print(f"   Size: {size_mb:.2f} MB")
    
    # Cleanup
    shutil.rmtree(temp_dir)
    
    print(f"\n{'='*80}")
    print(f"✓ SUCCESS! Excel file headers fixed")
    print(f"{'='*80}")
    print(f"\nOutput: {output_file}")
    print(f"All {len(db_columns)} columns updated")
    
except Exception as e:
    print(f"\n✗ Error: {e}")
    import traceback
    traceback.print_exc()
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)
