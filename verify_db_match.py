#!/usr/bin/env python
import zipfile
import xml.etree.ElementTree as ET
import re

# All database column names from your SQL schema
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

fixed_file = r"district_reports\KVIB_TG_district_details_01APR2022_to_31MAR2023_FIXED.xlsx"

try:
    print("=" * 100)
    print("VERIFYING EXCEL MATCHES DATABASE SCHEMA")
    print("=" * 100)
    
    with zipfile.ZipFile(fixed_file, 'r') as zf:
        ws_data = zf.read('xl/worksheets/sheet1.xml')
        root = ET.fromstring(ws_data)
        
        ns = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
        sheet_data = root.find(f'.//{{{ns}}}sheetData')
        
        if sheet_data is not None:
            rows = sheet_data.findall(f'{{{ns}}}row')
            if rows:
                first_row = rows[0]
                cells = first_row.findall(f'{{{ns}}}c')
                
                # Extract headers from Excel
                excel_headers = []
                for cell in cells:
                    is_elem = cell.find(f'{{{ns}}}is')
                    if is_elem is not None:
                        t_elem = is_elem.find(f'{{{ns}}}t')
                        if t_elem is not None:
                            excel_headers.append(t_elem.text)
                
                print(f"\n✓ Database has {len(db_columns)} columns")
                print(f"✓ Excel file has {len(excel_headers)} columns")
                print(f"✓ Excel file has {len(rows):,} data rows\n")
                
                # Compare
                print("=" * 100)
                print("COLUMN COMPARISON")
                print("=" * 100)
                
                matches = 0
                mismatches = []
                
                for i, (excel_col, db_col) in enumerate(zip(excel_headers, db_columns), 1):
                    status = "✓ MATCH" if excel_col == db_col else "✗ MISMATCH"
                    if excel_col == db_col:
                        matches += 1
                    else:
                        mismatches.append((i, db_col, excel_col))
                
                # Show sample matches
                print("\nFIRST 10 COLUMNS:")
                for i in range(min(10, len(excel_headers))):
                    status = "✓" if excel_headers[i] == db_columns[i] else "✗"
                    print(f"{status} {i+1:2d}. DB: '{db_columns[i]:40s}' | Excel: '{excel_headers[i]}'")
                
                print("\nLAST 10 COLUMNS:")
                start = max(len(excel_headers) - 10, 0)
                for i in range(start, len(excel_headers)):
                    status = "✓" if i < len(db_columns) and excel_headers[i] == db_columns[i] else "✗"
                    expected = db_columns[i] if i < len(db_columns) else "N/A"
                    print(f"{status} {i+1:2d}. DB: '{expected:40s}' | Excel: '{excel_headers[i]}'")
                
                print(f"\n{'='*100}")
                print(f"RESULT: {matches}/{len(db_columns)} columns match perfectly")
                print(f"{'='*100}")
                
                if matches == len(db_columns) and len(excel_headers) == len(db_columns):
                    print(f"\n✓✓✓ PERFECT MATCH!")
                    print(f"\n✓ Excel file is 100% compatible with all database tables:")
                    print(f"   - agency_received")
                    print(f"   - agency_returned")
                    print(f"   - forwarded_to_bank")
                    print(f"   - mm_claimed_no_of_proj")
                    print(f"   - mm_disbursement_no_of_proj")
                    print(f"   - pending_at_bank_no_of_proj")
                    print(f"   - pending_for_mm_disbursement_no_of_proj")
                    print(f"   - And all other tables with same schema")
                else:
                    if mismatches:
                        print(f"\n⚠ Found {len(mismatches)} mismatches")
                        for col_idx, expected, actual in mismatches[:10]:
                            print(f"  Col {col_idx}: Expected '{expected}' but got '{actual}'")

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
