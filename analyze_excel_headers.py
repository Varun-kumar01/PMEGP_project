#!/usr/bin/env python3
"""Detailed Excel header analysis"""
import pandas as pd

file_path = r"E:\kadhi\PMEGP_project\district_reports\KVIB_TG_district_details_01APR2022_to_31MAR2023_FIXED.xlsx"

# Expected database columns (excluding id which is auto-increment)  
expected_columns = [
    "current_status", "under_process_agency_reason", "office_name", "agency_type", "state",
    "applicant_id", "applicant_name", "applicant_address", "applicant_mobile_no", "alternate_mobile_no",
    "email", "aadhar_no", "legal_status", "gender", "category", "special_category",
    "qualification", "date_of_birth", "age", "unit_location", "unit_address",
    "taluk_block", "unit_district", "industry_type", "product_desc_activity",
    "proposed_project_cost", "mm_involve", "financing_branch_ifsc_code", "financing_branch_address",
    "online_submission_date", "dltfec_meeting", "dltfec_meeting_place", "forwarding_date_to_bank",
    "bank_remarks", "date_of_documents_receiveda_at_bank",
    "project_cost_approved_ce", "project_cost_approved_wc", "project_cost_approved_total",
    "sanctioned_by_bank_date", "sanctioned_by_bank_ce", "sanctioned_by_bank_wc", "sanctioned_by_bank_total",
    "date_of_deposit_own_contribution", "own_contribution_amount_deposited",
    "covered_under_cgtsi", "date_of_loan_release", "loan_release_amount",
    "mm_claim_date", "mm_claim_amount", "remarks_for_mm_process_at_pmegp_co_mumbai",
    "mm_release_date", "mm_release_amount", "payment_status", "mm_disbursement_transaction_id", "fail_reason",
    "edp_training_center_name", "training_start_date", "training_end_date", "training_duration_days",
    "certificate_issue_date", "physical_verification_conducted_date", "physical_verification_status",
    "mm_final_adjustment_date", "mm_final_adjustment_amount",
    "tdr_account_no", "tdr_date", "year"
]

def normalize(s):
    if pd.isna(s):
        return None
    return str(s).strip().lower().replace(" ", "_").replace("-", "_")

try:
    # Read Excel file
    df = pd.read_excel(file_path, sheet_name=0, header=None)
    
    # Get first row as headers
    excel_headers_raw = df.iloc[0].tolist()
    excel_headers_normalized = [normalize(h) for h in excel_headers_raw]
    
    print("=" * 150)
    print("EXCEL FILE HEADER ANALYSIS")
    print("=" * 150)
    print()
    
    print(f"Excel file has {len(excel_headers_raw)} columns")
    print(f"Database expects {len(expected_columns)} columns")
    print()
    
    print("DETAILED COLUMN COMPARISON:")
    print("-" * 150)
    print(f"{'Pos':<5} {'Excel Header':<40} {'Normalized':<40} {'Expected':<40} {'Match':<8}")
    print("-" * 150)
    
    matches = 0
    mismatches = []
    
    for i in range(len(expected_columns)):
        excel_raw = excel_headers_raw[i] if i < len(excel_headers_raw) else "MISSING"
        excel_norm = excel_headers_normalized[i] if i < len(excel_headers_normalized) else None
        expected = expected_columns[i]
        
        is_match = excel_norm == expected
        if is_match:
            matches += 1
            status = "✓"
        else:
            mismatches.append((i+1, excel_raw, excel_norm, expected))
            status = "✗"
        
        print(f"{i+1:<5} {str(excel_raw):<40} {str(excel_norm):<40} {expected:<40} {status:<8}")
    
    print()
    print("=" * 150)
    print(f"Total matches: {matches}/{len(expected_columns)}")
    print(f"Total mismatches: {len(mismatches)}")
    
    if mismatches:
        print()
        print("MISMATCHED COLUMNS:")
        print("-" * 150)
        for pos, raw, norm, expected in mismatches:
            print(f"Position {pos}:")
            print(f"  Excel (raw):      '{raw}'")
            print(f"  Excel (norm):     '{norm}'")
            print(f"  Database expects: '{expected}'")
            print()
    else:
        print()
        print("✅ ALL COLUMNS MATCH!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
