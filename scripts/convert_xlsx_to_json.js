#!/usr/bin/env node
// Simple XLSX -> JSON converter using the 'xlsx' package.
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

function normalize(col){return String(col||'').trim().toLowerCase();}

function findHeaders(headers){
  const map = {};
  headers.forEach((h,i)=>{
    const n = normalize(h);
    if(['app_name','name','application'].includes(n)) map.app_name = i;
    if(['package','pkg','package_name'].includes(n)) map.package = i;
    if(['publisher','publisher_name','vendor'].includes(n)) map.publisher = i;
  });
  return map;
}

const argv = process.argv.slice(2);
if(argv.length < 2){
  console.error('Usage: node convert_xlsx_to_json.js input.xlsx output.json');
  process.exit(2);
}

const input = argv[0];
const output = argv[1];

if(!fs.existsSync(input)){ console.error('Input not found:', input); process.exit(2); }

const wb = xlsx.readFile(input, { cellDates: true });
const sheetName = wb.SheetNames[0];
const ws = wb.Sheets[sheetName];
const raw = xlsx.utils.sheet_to_json(ws, { header: 1 });
if(!raw || raw.length < 2){ console.error('No data found in sheet'); process.exit(1); }

const headers = raw[0];
const map = findHeaders(headers);
if(!map.app_name && headers.length>=1) map.app_name = 0;
if(!map.package && headers.length>=2) map.package = 1;
if(!map.publisher && headers.length>=3) map.publisher = 2;

const out = [];
for(let i=1;i<raw.length;i++){
  const row = raw[i];
  const name = String(row[map.app_name]||'').trim();
  const pkg = String(row[map.package]||'').trim();
  const pub = String(row[map.publisher]||'').trim();
  if(!name || !pkg) continue;
  out.push({ app_name: name, package: pkg, publisher: pub });
}

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(out, null, 2), 'utf8');
console.log('Wrote', out.length, 'records to', output);
