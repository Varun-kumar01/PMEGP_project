import pandas as pd
sheets = pd.read_excel('district_reports/KVIB_10_SHEETS_CLEANED.xlsx', sheet_name=None, dtype=str)
ws = sheets['Received']
print('shape', ws.shape)
first = next(ws.itertuples(index=False, name=None))
print('len row', len(first))
print('last values', first[-5:])
