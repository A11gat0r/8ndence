Fake App Detector — Backend

What this provides
- Serves the static frontend located at ../hackathon/front end
- Provides POST /api/scan which accepts JSON { "brand": "PhonePe" } and returns scan results with similarity and risk scores

Run locally
1. From the backend folder install dependencies:

   npm install

2. Start the server:

   npm start

3. Open the frontend in your browser:

   http://localhost:3000/

API
- POST /api/scan
  - Request JSON: { "brand": "PhonePe" }
  - Response JSON: { brand, count, results: [ { app_name, package, publisher, nameScore, pkgScore, pubScore, avg, risk } ] }
