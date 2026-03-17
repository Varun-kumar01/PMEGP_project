import pandas as pd
import os
import sys

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

input_file = r"E:\kadhi\PMEGP_project\district_reports\KVIB_TG_district_details_01APR2022_to_31MAR2023.xlsx"
output_file = r"E:\kadhi\PMEGP_project\district_reports\KVIB_TG_district_details_01APR2022_to_31MAR2023_FIXED.xlsx"

try:
    print("=" * 80)
    print("FIXING EXCEL FILE HEADERS (Using Pandas) ")
    print("=" * 80)
    print(f"\nInput file:  {os.path.basename(input_file)}")
    
    # Read the Excel file with the existing headers
    print("\n1. Reading Excel file...")
    df = pd.read_excel(input_file)
    print(f"   ✓ Loaded: {df.shape[0]:,} rows × {df.shape[1]} columns")
    
    # Make sure we have exactly 68 columns
    print(f"\n2. Adjusting columns to match database schema ({len(db_columns)} columns)...")
    
    if df.shape[1] < len(db_columns):
        # Add missing columns
        missing_cols = len(db_columns) - df.shape[1]
        for i in range(missing_cols):
            df[f'col_{df.shape[1] + 1}'] = None
        print(f"    Added {missing_cols} missing columns")
    elif df.shape[1] > len(db_columns):
        # Remove extra columns
        extra_cols = df.shape[1] - len(db_columns)
        df = df.iloc[:, :len(db_columns)]
        print(f"    Removed {extra_cols} extra columns")
    
    # Replace column names with database schema
    print(f"   ✓ Setting column names to database schema")
    df.columns = db_columns
    
    # Save to Excel
    print(f"\n3. Saving fixed file...")
    df.to_excel(output_file, sheet_name='Received', index=False)
    print(f"   ✓ File saved: {os.path.basename(output_file)}")
    
    # File info
    file_size = os.path.getsize(output_file) / (1024*1024)
    print(f"   Size: {file_size:.2f} MB")
    
    # Verify
    print(f"\n4. Verifying...")
    df_verify = pd.read_excel(output_file)
    print(f"   ✓ Verified: {df_verify.shape[0]:,} rows × {df_verify.shape[1]} columns")
    print(f"   ✓ Column count: {len(df_verify.columns)} (Expected: {len(db_columns)})")
    
    # Check if all column names match
    all_match = all(col1 == col2 for col1, col2 in zip(df_verify.columns, db_columns))
    
    if all_match and df_verify.shape[1] == len(db_columns):
        print(f"\n{'='*80}")
        print(f"✓ SUCCESS! File fixed and ready for upload")
        print(f"{'='*80}")
        print(f"\nOutput: {output_file}")
        print(f"Rows:   {df_verify.shape[0]:,}")
        print(f"Cols:   {df_verify.shape[1]} (All correctly named)")
    else:
        print(f"\n⚠ Warning: Some columns may not match perfectly")
    
except Exception as e:
    print(f"\n✗ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
