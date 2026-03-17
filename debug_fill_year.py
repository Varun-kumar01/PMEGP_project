import pandas as pd

SOURCE_FILE='district_reports/KVIB_10_SHEETS_CLEANED.xlsx'
DB_COLUMNS = [
    'current_status', 'under_process_agency_reason', 'office_name', 'agency_type', 'state',
    'applicant_id', 'applicant_name', 'applicant_address', 'applicant_mobile_no', 'alternate_mobile_no',
    'email', 'aadhar_no', 'legal_status', 'gender', 'category', 'special_category',
    'qualification', 'date_of_birth', 'age', 'unit_location', 'unit_address',
    'taluk_block', 'unit_district', 'industry_type', 'product_desc_activity',
    'proposed_project_cost', 'mm_involve', 'financing_branch_ifsc_code', 'financing_branch_address',
    'online_submission_date', 'dltfec_meeting', 'dltfec_meeting_place', 'forwarding_date_to_bank',
    'bank_remarks', 'date_of_documents_receiveda_at_bank',
    'project_cost_approved_ce', 'project_cost_approved_wc', 'project_cost_approved_total',
    'sanctioned_by_bank_date', 'sanctioned_by_bank_ce', 'sanctioned_by_bank_wc', 'sanctioned_by_bank_total',
    'date_of_deposit_own_contribution', 'own_contribution_amount_deposited',
    'covered_under_cgtsi', 'date_of_loan_release', 'loan_release_amount',
    'mm_claim_date', 'mm_claim_amount', 'remarks_for_mm_process_at_pmegp_co_mumbai',
    'mm_release_date', 'mm_release_amount', 'payment_status', 'mm_disbursement_transaction_id', 'fail_reason',
    'edp_training_center_name', 'training_start_date', 'training_end_date', 'training_duration_days',
    'certificate_issue_date', 'physical_verification_conducted_date', 'physical_verification_status',
    'mm_final_adjustment_date', 'mm_final_adjustment_amount',
    'tdr_account_no', 'tdr_date', 'year'
]

num_cols = len(DB_COLUMNS)
year_index = DB_COLUMNS.index('year')

sheets=pd.read_excel(SOURCE_FILE,sheet_name=None,dtype=str)
for sheet_name, df in sheets.items():
    print('sheet',sheet_name,'shape',df.shape)
    for i,row in enumerate(df.itertuples(index=False,name=None)):
        if i>=5: break
        row_values=list(row)
        if len(row_values) > num_cols:
            row_values = row_values[-num_cols:]
        if len(row_values) < num_cols:
            row_values.extend([None]*(num_cols-len(row_values)))
        year_val = row_values[year_index]
        if year_val is None or (isinstance(year_val,float) and str(year_val).lower() == 'nan') or str(year_val).strip()=='':
            row_values[year_index]='2022-2023'
        print('row',i+1,'len',len(row_values),'year',row_values[year_index], 'first5', row_values[:5], 'last5', row_values[-5:])
    print('---')
