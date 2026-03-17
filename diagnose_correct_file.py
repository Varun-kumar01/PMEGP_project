#!/usr/bin/env python
import zipfile
import xml.etree.ElementTree as ET
import os

correct_file = r"district_reports\KVIB_TG_district_details_01APR2022_to_31MAR2023_CORRECT.xlsx"

print("=" * 100)
print("ANALYZING EXCEL FILE FOR UPLOAD ISSUES")
print("=" * 100)

try:
    # Check file exists and size
    if not os.path.exists(correct_file):
        print(f"\nERROR: File not found: {correct_file}")
        exit(1)
    
    file_size_mb = os.path.getsize(correct_file) / (1024*1024)
    print(f"\nFile: {correct_file}")
    print(f"Size: {file_size_mb:.2f} MB")
    
    # Check if it's a valid ZIP/Excel file
    print("\n1. Checking file integrity...")
    try:
        with zipfile.ZipFile(correct_file, 'r') as zf:
            file_list = zf.namelist()
            print(f"   Status: VALID ZIP ARCHIVE")
            print(f"   Files in archive: {len(file_list)}")
            
            # Check critical files
            critical_files = [
                '[Content_Types].xml',
                '_rels/.rels',
                'xl/workbook.xml',
                'xl/worksheets/sheet1.xml',
                'xl/styles.xml'
            ]
            
            print("\n2. Checking required Excel files...")
            for critical_file in critical_files:
                if critical_file in file_list:
                    print(f"   OK: {critical_file}")
                else:
                    print(f"   MISSING: {critical_file} (CRITICAL!)")
    except zipfile.BadZipFile as e:
        print(f"   ERROR: Invalid ZIP file - {e}")
        exit(1)
    
    # Check worksheet structure
    print("\n3. Checking worksheet structure...")
    with zipfile.ZipFile(correct_file, 'r') as zf:
        ws_data = zf.read('xl/worksheets/sheet1.xml')
        root = ET.fromstring(ws_data)
        
        ns = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
        sheet_data = root.find(f'.//{{{ns}}}sheetData')
        
        if sheet_data is None:
            print("   ERROR: No sheetData found in worksheet")
            exit(1)
        
        rows = sheet_data.findall(f'{{{ns}}}row')
        print(f"   Rows: {len(rows):,}")
        
        if not rows:
            print("   ERROR: No rows found in worksheet")
            exit(1)
        
        # Check header row
        first_row = rows[0]
        cells = first_row.findall(f'{{{ns}}}c')
        print(f"   Header columns: {len(cells)}")
        
        # Extract headers
        headers = []
        for cell in cells:
            is_elem = cell.find(f'{{{ns}}}is')
            if is_elem is not None:
                t_elem = is_elem.find(f'{{{ns}}}t')
                if t_elem is not None:
                    headers.append(t_elem.text)
        
        print(f"\n4. Checking column headers...")
        print(f"   Headers extracted: {len(headers)}")
        
        if len(headers) == 0:
            print("   ERROR: Could not read any headers!")
            # Try alternative method
            print("   Trying alternative header detection...")
            for cell in cells:
                cell_ref = cell.get('r', '')
                v_elem = cell.find(f'{{{ns}}}v')
                if v_elem is not None and v_elem.text:
                    print(f"   Found value in {cell_ref}: {v_elem.text}")
        
        # Compare with database schema
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
        
        print(f"\n5. Column schema comparison...")
        print(f"   Expected: {len(db_columns)} columns")
        print(f"   Found: {len(headers)} columns")
        
        if len(headers) > 0:
            matches = sum(1 for h, db in zip(headers, db_columns) if h == db)
            print(f"   Matches: {matches}/{len(db_columns)}")
            
            if matches < len(db_columns):
                print(f"\n   MISMATCHES FOUND:")
                for i in range(min(len(headers), len(db_columns))):
                    if headers[i] != db_columns[i]:
                        print(f"   Col {i+1}: Expected '{db_columns[i]}' but got '{headers[i]}'")

except Exception as e:
    print(f"\nERROR: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 100)
