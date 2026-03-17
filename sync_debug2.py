import os
import pandas as pd
from openpyxl import Workbook

SOURCE_FILE = 'district_reports/KVIB_10_SHEETS_CLEANED.xlsx'
TARGET_FILE = 'district_reports/FINAL_10_SHEETS_aligned_debug.xlsx'

DB_COLUMNS = [
    'current_status','under_process_agency_reason','office_name','agency_type','state',
    'applicant_id','applicant_name','applicant_address','applicant_mobile_no','alternate_mobile_no',
    'email','aadhar_no','legal_status','gender','category','special_category',
    'qualification','date_of_birth','age','unit_location','unit_address',
    'taluk_block','unit_district','industry_type','product_desc_activity',
    'proposed_project_cost','mm_involve','financing_branch_ifsc_code','financing_branch_address',
    'online_submission_date','dltfec_meeting','dltfec_meeting_place','forwarding_date_to_bank',
    'bank_remarks','date_of_documents_receiveda_at_bank',
    'project_cost_approved_ce','project_cost_approved_wc','project_cost_approved_total',
    'sanctioned_by_bank_date','sanctioned_by_bank_ce','sanctioned_by_bank_wc','sanctioned_by_bank_total',
    'date_of_deposit_own_contribution','own_contribution_amount_deposited',
    'covered_under_cgtsi','date_of_loan_release','loan_release_amount',
    'mm_claim_date','mm_claim_amount','remarks_for_mm_process_at_pmegp_co_mumbai',
    'mm_release_date','mm_release_amount','payment_status','mm_disbursement_transaction_id','fail_reason',
    'edp_training_center_name','training_start_date','training_end_date','training_duration_days',
    'certificate_issue_date','physical_verification_conducted_date','physical_verification_status',
    'mm_final_adjustment_date','mm_final_adjustment_amount',
    'tdr_account_no','tdr_date','year'
]

num_cols = len(DB_COLUMNS)
year_index = DB_COLUMNS.index('year')

sheets = pd.read_excel(SOURCE_FILE, sheet_name=None, dtype=str)
wb = Workbook(); wb.remove(wb.active)

for sheet_name, df in sheets.items():
    ws = wb.create_sheet(sheet_name)
    ws.append(DB_COLUMNS)
    for i,row in enumerate(df.itertuples(index=False,name=None)):
        if i<3:
            print('sheet',sheet_name,'row',i+1,'source row year', row[-1])
        rv=list(row)
        if len(rv)>num_cols:
            rv = rv[-num_cols:]
        if len(rv)<num_cols:
            rv.extend([None]*(num_cols-len(rv)))
        year_val = rv[year_index]
        year_val_str=str(year_val).strip().lower() if year_val is not None else ''
        if year_val is None or year_val_str in ('', 'nan', 'none'):
            rv[year_index]='2022-2023'
        if i<3:
            print('row',i+1,'year out', rv[year_index], 'len', len(rv), 'last2', rv[-2:])
        ws.append(rv)

wb.save(TARGET_FILE)
print('saved', TARGET_FILE)
