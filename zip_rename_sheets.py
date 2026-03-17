#!/usr/bin/env python3
"""Update sheet names and headers using ZIP manipulation (no data loading)"""

import zipfile
import tempfile
import os
import shutil
import xml.etree.ElementTree as ET

source = r'E:\kadhi\PMEGP_project\district_reports\KVIB_10_SHEETS_CLEANED.xlsx'
output = r'E:\kadhi\PMEGP_project\district_reports\KVIB_TG_district_details_01APR2022_to_31MAR2023_FINAL_10.xlsx'

# Map old names to new database table names
SHEET_RENAME_MAP = {
    'Received': 'agency_received',
    'Returned at Agency': 'agency_returned',
    'Pending at Agency': 'pending_at_agency',
    'Forwarded to Bank': 'forwarded_to_bank',
    'Sanctioned': 'sanctioned_by_bank_no_of_proj',
    'MM Claimed': 'mm_claimed_no_of_proj',
    'MM Disbursement': 'mm_disbursement_no_of_proj',
    'Returned by Bank': 'returned_by_bank',
    'Pend MM Disbmt - Total': 'pending_at_bank_no_of_proj',
    'Pend MM Disbmt - Detail': 'pending_for_mm_disbursement'
}

CORRECT_HEADERS = ['id', 'current_status', 'under_process_agency_reason', 'office_name', 'agency_type',
    'state', 'applicant_id', 'applicant_name', 'applicant_address', 'applicant_mobile_no',
    'alternate_mobile_no', 'email', 'aadhar_no', 'legal_status', 'gender',
    'category', 'special_category', 'qualification', 'date_of_birth', 'age',
    'unit_location', 'unit_address', 'taluk_block', 'unit_district', 'industry_type',
    'product_desc_activity', 'proposed_project_cost', 'mm_involve', 'financing_branch_ifsc_code',
    'financing_branch_address', 'online_submission_date', 'dltfec_meeting', 'dltfec_meeting_place',
    'forwarding_date_to_bank', 'bank_remarks', 'date_of_documents_receiveda_at_bank',
    'project_cost_approved_ce', 'project_cost_approved_wc', 'project_cost_approved_total',
    'sanctioned_by_bank_date', 'sanctioned_by_bank_ce', 'sanctioned_by_bank_wc', 'sanctioned_by_bank_total',
    'date_of_deposit_own_contribution', 'own_contribution_amount_deposited', 'covered_under_cgtsi',
    'date_of_loan_release', 'loan_release_amount', 'mm_claim_date', 'mm_claim_amount',
    'remarks_for_mm_process_at_pmegp_co_mumbai', 'mm_release_date', 'mm_release_amount',
    'payment_status', 'mm_disbursement_transaction_id', 'fail_reason', 'edp_training_center_name',
    'training_start_date', 'training_end_date', 'training_duration_days', 'certificate_issue_date',
    'physical_verification_conducted_date', 'physical_verification_status', 'mm_final_adjustment_date',
    'mm_final_adjustment_amount', 'tdr_account_no', 'tdr_date', 'year']

print("Processing 10-sheet file...\n")

try:
    with tempfile.TemporaryDirectory() as tmpdir:
        # Extract
        print("Extracting...")
        with zipfile.ZipFile(source, 'r') as z:
            z.extractall(tmpdir)
        
        # Update sheet names in workbook.xml
        wb_path = os.path.join(tmpdir, 'xl', 'workbook.xml')
        tree = ET.parse(wb_path)
        root = tree.getroot()
        
        # Register namespace to preserve it
        ns = {'ss': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
              'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
        for prefix, uri in ns.items():
            ET.register_namespace(prefix, uri)
        
        # Find sheets
        sheets_elem = root.find('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}sheets')
        
        print("Renaming sheets:\n")
        for sheet in sheets_elem:
            old_name = sheet.get('name')
            if old_name in SHEET_RENAME_MAP:
                new_name = SHEET_RENAME_MAP[old_name]
                sheet.set('name', new_name)
                print(f"  ✓ {old_name:35s} → {new_name}")
        
        # Save workbook.xml
        tree.write(wb_path, encoding='utf-8', xml_declaration=True)
        
        # Now update each worksheet's first row with correct headers
        print(f"\nUpdating sheet headers...")
        worksheets_dir = os.path.join(tmpdir, 'xl', 'worksheets')
        
        for idx in range(1, 11):  # Sheets 1-10
            ws_file = os.path.join(worksheets_dir, f'sheet{idx}.xml')
            if os.path.exists(ws_file):
                ws_tree = ET.parse(ws_file)
                ws_root = ws_tree.getroot()
                
                # Get the first row (row 1)
                ns_ws = {'': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
                rows = ws_root.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row')
                
                if len(rows) > 0:
                    first_row = rows[0]
                    # Remove old cells from first row
                    for cell in list(first_row):
                        first_row.remove(cell)
                    
                    # Add correct header cells
                    for col_idx, header_text in enumerate(CORRECT_HEADERS, 1):
                        cell = ET.Element('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c')
                        cell.set('r', f'{chr(64+min(col_idx//26, 1)) if col_idx > 26 else ""}{chr(64+((col_idx-1)%26)+1)}1')
                        
                        v = ET.SubElement(cell, '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                        v.text = header_text
                        
                        first_row.append(cell)
                    
                    ws_tree.write(ws_file, encoding='utf-8', xml_declaration=True)
                    print(f"  ✓ Updated sheet{idx}.xml")
        
        # Re-create ZIP
        print(f"\nRe-creating XLSX...")
        shutil.make_archive(output.replace('.xlsx', ''), 'zip', tmpdir)
        os.rename(output.replace('.xlsx', '.zip'), output)
        
        print(f"\n✅ Created: {output}")
        print(f"✅ Ready to use!")

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
