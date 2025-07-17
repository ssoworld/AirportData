import os
import csv

# Load known airport codes
known_codes = set()
with open("air/data/airports.csv", newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter=';')
    for row in reader:
        code = row["iata_code"].strip().upper()
        known_codes.add(code)

# Scan .alist files for unknown codes
alist_dir = "air/data"
found_codes = set()

for filename in os.listdir(alist_dir):
    if filename.endswith(".alist"):
        with open(os.path.join(alist_dir, filename), encoding='utf-8') as f:
            for line in f:
                code = line.strip().upper()
                if code:
                    found_codes.add(code)

# Compare and report
unknown_codes = sorted(found_codes - known_codes)

if unknown_codes:
    print("🚨 Unknown airport codes found in .alist files:")
    for code in unknown_codes:
        print(f"  - {code}")
else:
    print("✅ All airport codes in .alist files are known.")
