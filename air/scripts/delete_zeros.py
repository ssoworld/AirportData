import os
import csv

# Path to the cloned repo's air/data folder
AIR_DATA_DIR = ./air/data

# Choose either airports.csv or airports-manifest.csv (change here)
AIRPORTS_CSV = os.path.join(AIR_DATA_DIR, 'airports.csv')
# AIRPORTS_CSV = os.path.join(AIR_DATA_DIR, 'airports-manifest.csv')

def load_airports(csv_file):
    airports = set()
    with open(csv_file, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f, delimiter=';')
        for row in reader:
            code = row.get('iata_code') or row.get('code') or row.get('iata') or row.get('code_iata')
            if not code:
                # fallback for airports.csv which has code in second column
                code = row.get('code') or list(row.values())[1]
            code = code.strip().upper()
            if code:
                airports.add(code)
    return airports

def find_airports_in_alist_files(data_dir):
    airports_in_alist = set()
    for filename in os.listdir(data_dir):
        if filename.endswith('.alist'):
            filepath = os.path.join(data_dir, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith('#'):
                        continue
                    parts = line.split()
                    if parts:
                        airports_in_alist.add(parts[0].upper())
    return airports_in_alist

def main():
    print("Loading airports from", AIRPORTS_CSV)
    airports = load_airports(AIRPORTS_CSV)
    print(f"Total airports in CSV: {len(airports)}")

    print("Scanning ALIST files for airports used...")
    airports_used = find_airports_in_alist_files(AIR_DATA_DIR)
    print(f"Total airports found in ALIST files: {len(airports_used)}")

    unused_airports = sorted(airports - airports_used)
    print(f"Airports NOT appearing in any ALIST file ({len(unused_airports)}):")
    for code in unused_airports:
        print(code)

if __name__ == '__main__':
    main()
