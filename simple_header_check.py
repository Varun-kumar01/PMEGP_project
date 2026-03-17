#!/usr/bin/env python3
"""Simple Excel header check with openpyxl"""
import openpyxl
import sys

file_path = r"E:\kadhi\PMEGP_project\district_reports\KVIB_TG_district_details_01APR2022_to_31MAR2023_FIXED.xlsx"

expected = [
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

def norm(h):
    if not h:
        return None
    return str(h).strip().lower().replace(" ", "_").replace("-", "_")

try:
    wb = openpyxl.load_workbook(file_path)
    ws = wb.active
    
    print("EXCEL HEADERS VS DATABASE COLUMNS")
    print("=" * 100)
    
    mismatches = []
    for col_idx in range(1, 69):
        cell = ws.cell(1, col_idx)
        excel_raw = cell.value
        excel_norm = norm(excel_raw)
        expected_col = expected[col_idx - 1]
        
        match = "✓" if excel_norm == expected_col else "✗"
        
        if excel_norm != expected_col:
            mismatches.append((col_idx, excel_raw, excel_norm, expected_col))
        
        print(f"{col_idx:2d}: {match} Excel: '{excel_raw}' -> Expected: '{expected_col}'")
    
    print()
    print(f"Total mismatches: {len(mismatches)}")
    
    if mismatches:
        print("\nDETAILS OF MISMATCHES:")
        for col_idx, raw, norm, exp in mismatches:
            print(f"  Col {col_idx}: Excel='{raw}' Expected='{exp}'")
    
except Exception as e:
    print(f"ERROR: {e}")
    sys.exit(1)
