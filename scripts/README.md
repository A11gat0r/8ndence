Conversion helper scripts

This folder contains small scripts to convert an Excel file (XLS/XLSX) into a JSON array suitable for `front end/data.json` or `backend/data/apps.json`.

Python script requirements
- Python 3.8+
- pandas and openpyxl

Install and run (macOS / zsh):

```bash
pip3 install pandas openpyxl
python3 scripts/convert_xlsx_to_json.py input.xlsx ../hackathon/front\ end/data.json
```

Node script requirements
- Node 14+
- xlsx package

Install and run:

```bash
cd /Users/adithyan/hackathon
npm install xlsx
node scripts/convert_xlsx_to_json.js input.xlsx ../hackathon/front\ end/data.json
```

Both scripts will write an array of objects with these keys: `app_name`, `package`, `publisher`.
