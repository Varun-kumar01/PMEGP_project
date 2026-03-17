#!/usr/bin/env python3
"""Compare Excel headers with database columns"""
import openpyxl
import os

file_path = r"E:\kadhi\PMEGP_project\district_reports\KVIB_TG_district_details_01APR2022_to_31MAR2023_FIXED.xlsx"

# Expected database columns (excluding id which is auto-increment)
db_columns = [
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

def normalize_header(header):
    """Same function as backend"""
    if not header:
        return None
    return str(header).strip().lower().replace(" ", "_").replace("-", "_")

if not os.path.exists(file_path):
    print(f"❌ File not found: {file_path}")
    exit(1)

try:
    wb = openpyxl.load_workbook(file_path)
    ws = wb.active
    
    print("=" * 120)
    print("EXCEL vs DATABASE COLUMN COMPARISON")
    print("=" * 120)
    print()
    
    # Get all headers from row 1
    excel_headers = []
    for col_num in range(1, 70):
        cell = ws.cell(row=1, column=col_num)
        if cell.value:
            normalized = normalize_header(cell.value)
            excel_headers.append((col_num, cell.value, normalized))
    
    print(f"Found {len(excel_headers)} columns in Excel row 1")
    print(f"Expected {len(db_columns)} columns in database")
    print()
    
    # Check matches
    matching = []
    mismatching = []
    
    print("COLUMN COMPARISON:")
    print("-" * 120)
    print(f"{'Col':<4} {'Excel Header':<35} {'Normalized':<35} {'Match':<10}")
    print("-" * 120)
    
    for col_num, raw_header, normalized in excel_headers:
        if col_num <= len(db_columns):
            expected = db_columns[col_num - 1]
            is_match = normalized == expected
            
            if is_match:
                matching.append(col_num)
                status = "✓ OK"
            else:
                mismatching.append((col_num, raw_header, normalized, expected))
                status = f"✗ MISMATCH"
            
            print(f"{col_num:<4} {raw_header:<35} {normalized:<35} {status:<10}")
    
    print()
    print("=" * 120)
    print(f"✓ Matching columns: {len(matching)}/{len(db_columns)}")
    print(f"✗ Mismatching columns: {len(mismatching)}")
    print()
    
    if mismatching:
        print("MISMATCHES FOUND:")
        print("-" * 120)
        for col_num, raw_header, normalized, expected in mismatching:
            print(f"Column {col_num}:")
            print(f"  Excel:    '{raw_header}' -> '{normalized}'")
            print(f"  Database: '{expected}'")
            print()
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
