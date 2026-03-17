import openpyxl
wb=openpyxl.load_workbook('district_reports/FINAL_10_SHEETS_aligned.xlsx', read_only=True)
ws=wb['Received']
for r in range(2,6):
    print('row',r, ws.cell(row=r,column=67).value)
