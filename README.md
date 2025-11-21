# Fake App Detector (local dev)

This repository contains a small demo that scans an app metadata dataset for suspicious apps based on simple string-similarity heuristics.

Structure
- `backend/` — Node/Express server that serves the frontend and exposes `POST /api/scan`.
- `hackathon/front end/` — static frontend (HTML/CSS/JS). Note the space in the folder name is intentional in this workspace.

Quick start (macOS / zsh)

1. Install backend dependencies

```bash
cd backend
npm install
```


2. Start the server

```bash
cd backend
npm start
# server runs on http://localhost:3000
```

3. Visit the UI

Open `http://localhost:3000/scan.html` in your browser and run a scan (e.g. brand `PhonePe`).

Prepare for deployment

I moved the frontend into `backend/public` and updated `backend/server.js` to serve static files from that folder. This makes deployment easier — services like Render or Railway can use the `backend` folder as the service root and `npm start` will serve both API and static frontend.

Deploy to Render (recommended)

- Push your repo to GitHub (replace with your repo URL):

```bash
git remote add origin https://github.com/VikSage-0717/hackathon.git
git add .
git commit -m "Prepare for deploy: move frontend to backend/public"
git push -u origin main
```

- On Render: New → Web Service → Connect GitHub → select `hackathon` repo → set Root Directory to `backend` → Start Command `npm start` → Create Service.

Render will provide an HTTPS URL. Visit `https://<your-service>.onrender.com/scan.html` to use the app.

Converting an Excel dataset to JSON

Two helper scripts are included in `scripts/` to convert an XLS/XLSX file to a JSON array suitable for the app. See `scripts/README.md` for usage.

Push to GitHub

1. Initialize repo (if not already)

```bash
git init
git add .
git commit -m "Initial commit — Fake App Detector"
git remote add origin <your-repo-url>
git branch -M main
git push -u origin main
```

That's it — open an issue if anything behaves unexpectedly.
