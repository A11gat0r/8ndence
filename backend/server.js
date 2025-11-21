const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve the frontend from the bundled `public` folder (placed inside backend/public)
const staticDir = path.join(__dirname, 'public');

app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(staticDir, { extensions: ['html'] }));

const fs = require('fs');

// Try to load dataset from a file. Priority:
// 1) backend/data/apps.json
// 2) front end/data.json (in the frontend folder)
// 3) fallback to built-in mockData
function loadData() {
  const candidates = [
    path.join(__dirname, 'data', 'apps.json'),
    path.join(__dirname, '..', 'hackathon', 'front end', 'data.json')
  ];

  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, 'utf8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          console.log(`Loaded dataset from ${p} (${parsed.length} records)`);
          return parsed;
        }
        if (parsed && Array.isArray(parsed.results)) {
          console.log(`Loaded dataset from ${p} (wrapped.results: ${parsed.results.length} records)`);
          return parsed.results;
        }
      }
    } catch (e) {
      console.warn('Failed to load dataset from', p, e.message);
    }
  }

  // fallback mock
  const fallback = [
    { app_name: 'PhonePe', package: 'com.phonepe.app', publisher: 'PhonePe Pvt Ltd' },
    { app_name: 'PhonePe UPI Update', package: 'com.phonepe.update.upi', publisher: 'PhonePe Update Official' },
    { app_name: 'Phone Pay Wallet', package: 'com.phonepay.wallet.app', publisher: 'Pay Apps Ltd' }
  ];
  console.log(`No dataset file found or parseable; using fallback (${fallback.length} records)`);
  return fallback;
}

// data will be loaded on each request (so updating the JSON file is picked up immediately)


function similarity(a, b) {
  if (!a || !b) return 0;
  a = String(a).toLowerCase();
  b = String(b).toLowerCase();
  let matches = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] === b[i]) matches++;
  }
  return Math.floor((matches / Math.max(a.length, b.length)) * 100);
}

// API: POST /api/scan  { brand: 'PhonePe' }
app.post('/api/scan', (req, res) => {
  const brand = (req.body && req.body.brand) ? String(req.body.brand).trim() : '';
  if (!brand) return res.status(400).json({ error: 'brand is required in JSON body' });

  const mockData = loadData();

  const results = mockData.map(app => {
    const nameScore = similarity(brand, app.app_name);
    const pkgScore = similarity('com.' + brand.toLowerCase(), app.package);
    const pubScore = similarity(brand, app.publisher);
    const avg = Math.floor((nameScore + pkgScore + pubScore) / 3);
    const risk = Math.max(0, 100 - avg);
    return { ...app, nameScore, pkgScore, pubScore, avg, risk };
  }).sort((a,b)=>b.risk-a.risk);

  return res.json({ brand, count: results.length, results });
});

// Health
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Fallback: serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT} — serving ${staticDir}`);
});
