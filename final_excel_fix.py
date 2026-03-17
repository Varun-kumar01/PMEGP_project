#!/usr/bin/env python
import zipfile
import xml.etree.ElementTree as ET
from xml.dom import minidom
import os

input_file = r"district_reports\KVIB_TG_district_details_01APR2022_to_31MAR2023.xlsx"
output_file = r"district_reports\KVIB_TG_district_details_01APR2022_to_31MAR2023_FIXED.xlsx"

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

try:
    print("=" * 80)
    print("FIXING EXCEL COLUMNS - FINAL SOLUTION")
    print("=" * 80)
    
    ns = {'': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    ET.register_namespace('', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main')
    ET.register_namespace('r', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships')
    ET.register_namespace('mc', 'http://schemas.openxmlformats.org/markup-compatibility/2006')
    ET.register_namespace('x14ac', 'http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac')
    
    print(f"\n1. Creating output file with fixed columns...")
    
    with zipfile.ZipFile(input_file, 'r') as zip_in:
        with zipfile.ZipFile(output_file, 'w', zipfile.ZIP_DEFLATED) as zip_out:
            for item in zip_in.infolist():
                data = zip_in.read(item.filename)
                
                # Only modify sheet1.xml
                if item.filename.endswith('/sheet1.xml') or item.filename == 'xl/worksheets/sheet1.xml':
                    print(f"\n2. Fixing header row in {item.filename}...")
                    
                    # Properly parse with declaration
                    root = ET.fromstring(data)
                    ns_url = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
                    
                    # Navigate to sheetData > row
                    sheet_data = root.find(f'.//{{{ns_url}}}sheetData')
                    if sheet_data is not None:
                        rows = sheet_data.findall(f'{{{ns_url}}}row')
                        if rows:
                            first_row = rows[0]
                            cells = first_row.findall(f'{{{ns_url}}}c')
                            
                            print(f"   Current cells in row 1: {len(cells)}")
                            
                            # Clear existing cells but keep the row
                            for cell in cells:
                                first_row.remove(cell)
                            
                            # Add all 68 columns with new headers
                            col_letters = []
                            # Generate column letters A-Z, AA-ZZ, AAA-AMJ (up to 68)
                            for i in range(68):
                                if i < 26:
                                    col_letters.append(chr(65 + i))  # A-Z
                                elif i < 702:  # 26^2 + 26 = 702
                                    first = chr(65 + (i - 26) // 26)
                                    second = chr(65 + (i - 26) % 26)
                                    col_letters.append(first + second)
                            
                            for idx, col_name in enumerate(db_columns):
                                col_letter = col_letters[idx]
                                cell_ref = f"{col_letter}1"
                                
                                # Create cell
                                cell = ET.Element(f'{{{ns_url}}}c')
                                cell.set('r', cell_ref)
                                cell.set('t', 'inlineStr')
                                
                                # Add inline string content
                                is_elem = ET.SubElement(cell, f'{{{ns_url}}}is')
                                t_elem = ET.SubElement(is_elem, f'{{{ns_url}}}t')
                                t_elem.text = col_name
                                
                                first_row.append(cell)
                            
                            print(f"   ✓ Set 68 column headers")
                    
                    # Convert back to string with proper XML declaration
                    xml_str = ET.tostring(root, encoding='unicode')
                    data = f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n{xml_str}'.encode('utf-8')
                
                # Write to output (preserve original compression)
                zip_out.writestr(item, data, compress_type=item.compress_type)
    
    print(f"\n3. Verification...")
    file_size = os.path.getsize(output_file) / (1024*1024)
    print(f"   ✓ Output file size: {file_size:.2f} MB")
    
    print(f"\n{'='*80}")
    print(f"✓✓✓ SUCCESS! Excel file fixed!")
    print(f"{'='*80}")
    print(f"\nOutput: {output_file}")
    print(f"Columns: 68 (all database columns)")
    print(f"Status: READY FOR UPLOAD")
    print(f"\nYou can now upload this file to your database.")
    
except Exception as e:
    print(f"\n✗ Error: {e}")
    import traceback
    traceback.print_exc()
