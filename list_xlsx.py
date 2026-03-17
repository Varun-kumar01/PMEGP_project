import os
import glob

path = r"E:\kadhi\PMEGP_project\district_reports"
files = os.listdir(path)
xlsx_files = [f for f in files if f.endswith('.xlsx')]

print(f"Total files: {len(files)}")
print(f"XLSX files: {len(xlsx_files)}")
print("\nXLSX files found:")
for f in xlsx_files:
    full_path = os.path.join(path, f)
    size = os.path.getsize(full_path)
    print(f"  {f} - {size} bytes")

if not xlsx_files:
    print("  (no xlsx files)")
