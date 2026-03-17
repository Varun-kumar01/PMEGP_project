import re
with open('backend/controllers/pmegController.js','r',encoding='utf-8') as f:
    txt=f.read()
seg=re.search(r'const dbColumns = \[(.*?)\];', txt, re.S)
if not seg:
    raise SystemExit('dbColumns not found')
raw=seg.group(1)
cols=[item.strip().strip("'\"").strip() for item in raw.replace('\n',' ').split(',') if item.strip()]
print('len backend', len(cols))
print('year count', cols.count('year'))
print('last 5', cols[-5:])
