#!/usr/bin/env python3
"""
Simple XLSX -> JSON converter. Expects columns named (case-insensitive) one of:
- app_name (or name)
- package (or pkg, package_name)
- publisher (or publisher_name)

Writes a JSON array to the specified output path.
"""
import sys
import json
from pathlib import Path

def normalize_col(name):
    return name.strip().lower()

def find_col_map(headers):
    h = [normalize_col(x) for x in headers]
    mapping = {}
    for i, val in enumerate(h):
        if val in ('app_name', 'name', 'application'):
            mapping['app_name'] = i
        if val in ('package', 'pkg', 'package_name'):
            mapping['package'] = i
        if val in ('publisher', 'publisher_name', 'vendor'):
            mapping['publisher'] = i
    return mapping

def main():
    if len(sys.argv) < 3:
        print('Usage: convert_xlsx_to_json.py input.xlsx output.json')
        sys.exit(2)

    import pandas as pd

    inp = Path(sys.argv[1])
    out = Path(sys.argv[2])

    if not inp.exists():
        print('Input file not found:', inp)
        sys.exit(2)

    # read with pandas — it can handle xls/xlsx/csv
    df = pd.read_excel(inp, dtype=str)
    if df.empty:
        print('No rows found in', inp)
        sys.exit(1)

    # normalize columns
    cols = list(df.columns)
    colmap = find_col_map(cols)
    # attempt fallback heuristics
    if 'app_name' not in colmap and len(cols) >= 1:
        colmap['app_name'] = 0
    if 'package' not in colmap and len(cols) >= 2:
        colmap['package'] = 1
    if 'publisher' not in colmap and len(cols) >= 3:
        colmap['publisher'] = 2

    out_list = []
    for _, row in df.iterrows():
        try:
            name = str(row.iloc[colmap['app_name']]) if 'app_name' in colmap else ''
            pkg = str(row.iloc[colmap['package']]) if 'package' in colmap else ''
            pub = str(row.iloc[colmap['publisher']]) if 'publisher' in colmap else ''
        except Exception:
            continue
        if not name or not pkg:
            continue
        out_list.append({'app_name': name.strip(), 'package': pkg.strip(), 'publisher': pub.strip()})

    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(out_list, indent=2), encoding='utf8')
    print('Wrote', len(out_list), 'records to', out)

if __name__ == '__main__':
    main()
