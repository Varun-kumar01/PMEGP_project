import re
with open('sync_excel_with_db_columns.py','r',encoding='utf-8') as f:
    txt=f.read()
seg=re.search(r'DB_COLUMNS\s*=\s*\[(.*?)\]', txt, re.S)
cols=[item.strip().strip("'\"").strip() for item in seg.group(1).replace('\n',' ').split(',') if item.strip()]
print('len script', len(cols))
print('year count', cols.count('year'))
print('last 5', cols[-5:])
print('first 5', cols[:5])
