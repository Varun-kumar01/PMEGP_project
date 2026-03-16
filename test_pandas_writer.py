#!/usr/bin/env python3
"""Test basic pandas ExcelWriter functionality."""
import pandas as pd
import os

outfile = r"E:\kadhi\PMEGP_project\district_reports\TEST_PANDAS_WRITER.xlsx"

print(f"Testing pandas ExcelWriter to: {outfile}")

# Create simple dataframes
df1 = pd.DataFrame({
    'A': list(range(100)),
    'B': ['Item ' + str(i) for i in range(100)],
    'C': [i*10 for i in range(100)]
})

df2 = pd.DataFrame({
    'X': ['Alpha', 'Beta', 'Gamma'],
    'Y': [1, 2, 3]
})

try:
    print("Writing DataFrame 1...")
    with pd.ExcelWriter(outfile, engine='openpyxl') as writer:
        df1.to_excel(writer, sheet_name='Data', index=False)
        df2.to_excel(writer, sheet_name='Summary', index=False)
    
    print("Write complete")
    
    if os.path.exists(outfile):
        size = os.path.getsize(outfile)
        print(f"SUCCESS: File created with {size} bytes")
    else:
        print(f"FAILURE: File not found after ExcelWriter.save()")
        
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
