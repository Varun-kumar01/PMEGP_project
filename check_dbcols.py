import re

with open('sync_excel_with_db_columns_final.py', 'r', encoding='utf-8') as f:
    txt = f.read()

m = re.search(r'DB_COLUMNS\s*=\s*\[(.*?)\]', txt, re.S)
if not m:
    raise SystemExit('DB_COLUMNS not found')
items = [s.strip().strip("'\"") for s in m.group(1).split(',') if s.strip()]
print('len', len(items), 'year_index', items.index('year'))
print('last3', items[-3:])
