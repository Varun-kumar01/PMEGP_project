import re
with open('sync_excel_with_db_columns.py','r',encoding='utf-8') as f:
    txt=f.read()
seg=re.search(r'DB_COLUMNS\s*=\s*\[(.*?)\]', txt, re.S)
if not seg:
    raise SystemExit('DB_COLUMNS not found')
items=seg.group(1)
cols=[line.strip().strip("'\"").strip() for line in items.splitlines() if line.strip() and not line.strip().startswith('#')]
print('len', len(cols))
print('year count', cols.count('year'))
print('last 6', cols[-6:])
print('done')
