#!/usr/bin/env python3
"""Create 10-sheet Excel using xlsxwriter (more reliable)"""

import pandas as pd

source = r'E:\kadhi\PMEGP_project\district_reports\KVIB_TG_district_details_01APR2022_to_31MAR2023_FIXED.xlsx'
output = r'E:\kadhi\PMEGP_project\district_reports\FINAL_10_SHEETS_v2.xlsx'

SHEETS_TO_KEEP = {
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

print(f"Creating: {output}\n")

try:
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        success = 0
        for src_sheet, out_sheet in SHEETS_TO_KEEP.items():
            try:
                print(f"  {out_sheet:35s} ... ", end="", flush=True)
                
                df = pd.read_excel(source, sheet_name=src_sheet, header=None, engine='openpyxl')
                
                # Fix columns
                if len(df) > 0:
                    while len(df.columns) < 68:
                        df[len(df.columns)] = None
                    df = df.iloc[:, :68]
                    df.columns = CORRECT_HEADERS
                
                df.to_excel(writer, sheet_name=out_sheet, header=True, index=False)
                print(f"✓ ({len(df)} rows)")
                success += 1
                
            except Exception as e:
                print(f"❌ {str(e)[:50]}")
    
    print(f"\n✅ Created: {output}")
    print(f"✅ {success}/10 sheets successfully written!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
