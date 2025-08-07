import csv
import pycountry

UNKNOWN_CODES_FILE = "air/data/unknown_codes.txt"
CURRENT_DB_FILE = "air/data/airports.csv"
LOOKUP_FILE = "ourairports.csv"  # downloaded during workflow
OUTPUT_FILE = CURRENT_DB_FILE

# Load a set of IATA codes from the current DB
def load_iata_set(csv_path):
    with open(csv_path, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f, delimiter=';')
        return set(row["iata_code"] for row in reader if row["iata_code"])

# Load full OurAirports lookup as dict keyed by IATA
def load_lookup_dict(csv_path):
    with open(csv_path, newline='', encoding='utf-8') as f:
        return {row["iata_code"]: row for row in csv.DictReader(f) if row["iata_code"]}

# Convert 2-letter to 3-letter ISO country code
def convert_to_alpha3(alpha2):
    try:
        return pycountry.countries.get(alpha_2=alpha2).alpha_3
    except:
        return alpha2  # fallback if conversion fails

# Format row to match your CSV structure
def map_to_custom_format(row):
    return {
        "country": convert_to_alpha3(row["iso_country"]),
        "iata_code": row["iata_code"],
        "name": row["name"],
        "latitude": row["latitude_deg"],
        "longitude": row["longitude_deg"],
        "alt_codes": ""  # add blank alt_codes field
    }

def main():
    unknown_codes = set()
    with open(UNKNOWN_CODES_FILE, encoding='utf-8') as f:
        for line in f:
            code = line.strip()
            if code:
                unknown_codes.add(code)

    current_iata = load_iata_set(CURRENT_DB_FILE)
    lookup = load_lookup_dict(LOOKUP_FILE)

    missing = sorted(unknown_codes - current_iata)
    print(f"Found {len(missing)} missing IATA codes.")

    new_rows = [map_to_custom_format(lookup[code]) for code in missing if code in lookup]

    if new_rows:
        with open(OUTPUT_FILE, "a", newline='', encoding='utf-8') as f:
            fieldnames = ["country", "iata_code", "name", "latitude", "longitude", "alt_codes"]
            writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter=';')
            for row in new_rows:
                writer.writerow(row)
        print(f"Appended {len(new_rows)} new airports to {OUTPUT_FILE}")
    else:
        print("No matching airports found in lookup file.")

if __name__ == "__main__":
    main()
