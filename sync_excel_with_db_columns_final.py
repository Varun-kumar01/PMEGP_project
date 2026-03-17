import os
import pandas as pd
from openpyxl import Workbook

SOURCE_FILE = "district_reports/KVIB_10_SHEETS_CLEANED.xlsx"
TARGET_FILE = "district_reports/FINAL_10_SHEETS_aligned.xlsx"

DB_COLUMNS = [
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

if not os.path.exists(SOURCE_FILE):
    raise FileNotFoundError(f"Source file not found: {SOURCE_FILE}")

# Read all sheets with pandas
sheets = pd.read_excel(SOURCE_FILE, sheet_name=None, dtype=str)
print(f"Loaded {len(sheets)} sheets")

wb = Workbook()
# remove default sheet
default_sheet = wb.active
wb.remove(default_sheet)

for sheet_name, df in sheets.items():
    ws = wb.create_sheet(sheet_name)
    ws.append(DB_COLUMNS)
    num_cols = len(DB_COLUMNS)

    year_index = DB_COLUMNS.index('year')

    for row in df.itertuples(index=False, name=None):
        row_values = list(row)

        # If source has extra columns (e.g., ID at beginning), trim to DB column count
        if len(row_values) > num_cols:
            row_values = row_values[-num_cols:]

        if len(row_values) < num_cols:
            row_values.extend([None] * (num_cols - len(row_values)))

        # ensure year column is always set (including NaN from float or 'nan' strings)
        year_val = row_values[year_index]
        year_val_str = str(year_val).strip().lower() if year_val is not None else ''
        if year_val is None or year_val_str in ('', 'nan', 'none'):
            row_values[year_index] = '2022-2023'

        ws.append(row_values)

    # if sheet had fewer columns than DB_COLUMNS (common), additional columns are already blank
    print(f"Sheet '{sheet_name}' written {len(df)} data rows with {num_cols} columns")

wb.save(TARGET_FILE)
print(f"Saved aligned workbook as {TARGET_FILE}")
