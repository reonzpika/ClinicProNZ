# GP Clinic Scraper for Healthpoint.co.nz

Extracts GP clinic information from healthpoint.co.nz and exports to CSV format.

## Installation

```bash
pip install -r requirements.txt
```

## Usage

```bash
python gp_clinic_scraper.py
```

## Output

Creates `north_auckland_gp_clinics.csv` with columns:
- **name**: Clinic name
- **address**: Full clinic address  
- **phone**: Contact phone number
- **email**: Contact email address
- **doctors**: List of doctors (semicolon separated)
- **url**: Source URL

## Features

- ✅ Handles pagination automatically
- ✅ Extracts from individual clinic detail pages
- ✅ Rate limiting (1 second between requests)
- ✅ Comprehensive error handling
- ✅ Progress logging
- ✅ Deduplicates clinic URLs

## Sample Output

```csv
name,address,phone,email,doctors,url
Windsor Medical Centre,"B3, 51 Corinthian Drive, Albany, Auckland 0632",(09) 415 0888,admin@windsormedical.co.nz,"Dr Alan Lee; Dr Albert Lin; Dr Jessie Liu; Dr Keshan Xie",https://www.healthpoint.co.nz/gps-accident-urgent-medical-care/gp/windsor-medical-centre/
```

## Notes

- Script includes 1-second delays between requests to be respectful to the server
- Handles missing data gracefully with fallback values
- Logs progress and errors for debugging
- Designed specifically for healthpoint.co.nz HTML structure
