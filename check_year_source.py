import pandas as pd
s = pd.read_excel('district_reports/KVIB_10_SHEETS_CLEANED.xlsx', sheet_name='Received', dtype=str)
print('shape', s.shape)
print('columns:', s.columns.tolist()[:10], '...', s.columns.tolist()[-5:])
print('year col name?', 'year' in s.columns)
if 'year' in s.columns:
    print('first rows year', s['year'].head(5).tolist())

print('first row whole', s.iloc[0].tolist()[-5:])
