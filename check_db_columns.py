from sync_excel_with_db_columns import DB_COLUMNS
print('len', len(DB_COLUMNS))
print('last10:', DB_COLUMNS[-10:])
print('contains year count:', DB_COLUMNS.count('year'))
