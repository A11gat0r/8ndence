// Simple mock dataset
const mockData = [
    { app_name: 'PhonePe', package: 'com.phonepe.app', publisher: 'PhonePe Pvt Ltd' },
    { app_name: 'PhonePe UPI Update', package: 'com.phonepe.update.upi', publisher: 'PhonePe Update Official' },
    { app_name: 'Phone Pay Wallet', package: 'com.phonepay.wallet.app', publisher: 'Pay Apps Ltd' }
];

// expose last results for modal access
let lastResults = [];

function similarity(a, b) {
    if (!a || !b) return 0;
    a = a.toLowerCase();
    b = b.toLowerCase();
    let matches = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
        if (a[i] === b[i]) matches++;
    }
    return Math.floor((matches / Math.max(a.length, b.length)) * 100);
}

function renderResults(results) {
    lastResults = results; // store for details
    const tbody = document.querySelector('#resultsTable tbody');
    tbody.innerHTML = '';
    if (!results.length) {
        tbody.innerHTML = '<tr><td colspan="5" style="color:var(--muted);padding:18px">No results</td></tr>';
        return;
    }

    results.forEach((r, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${r.app_name}</td>
            <td>${r.package}</td>
            <td>${r.publisher}</td>
            <td><span class="risk-badge ${r.risk > 60 ? 'risk-suspicious' : 'risk-safe'}">${r.risk}%</span></td>
            <td><button class="details-btn" data-idx="${idx}">Details</button></td>
        `;
        tbody.appendChild(tr);
    });

    // wire detail buttons
    document.querySelectorAll('.details-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const i = Number(btn.getAttribute('data-idx'));
            openModalWithResult(lastResults[i]);
        });
    });
}

async function runDetector() {
    const brandInputEl = document.getElementById('brandInput');
    const brand = brandInputEl ? brandInputEl.value.trim() : '';
    if (!brand) {
        alert('Please enter a brand name');
        return;
    }

    const scanBtn = document.getElementById('scanBtn');
    const prevText = scanBtn ? scanBtn.textContent : null;
    if (scanBtn) { scanBtn.disabled = true; scanBtn.textContent = 'Scanning...'; }

    try {
        // Try server-side scan
        const resp = await fetch('/api/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ brand })
        });

        if (!resp.ok) throw new Error('Server returned ' + resp.status);

        const data = await resp.json();
        if (data && Array.isArray(data.results)) {
            renderResults(data.results);
            return;
        }
        throw new Error('Unexpected API response');
    } catch (err) {
        // network or server error — fallback to local computation
        console.warn('Backend scan failed, falling back to local scan:', err.message);

        const results = mockData.map(app => {
            const nameScore = similarity(brand, app.app_name);
            const pkgScore = similarity('com.' + brand.toLowerCase(), app.package);
            const pubScore = similarity(brand, app.publisher);
            const avg = Math.floor((nameScore + pkgScore + pubScore) / 3);
            const risk = Math.max(0, 100 - avg);
            return { ...app, risk, nameScore, pkgScore, pubScore, avg };
        }).sort((a,b)=>b.risk-a.risk);

        renderResults(results);
        // non-blocking notification to user
        // eslint-disable-next-line no-alert
        alert('Could not reach backend; showing local fallback results.');
    } finally {
        if (scanBtn) { scanBtn.disabled = false; scanBtn.textContent = prevText || 'Scan'; }
    }
}

/* Modal helpers */
function openModalWithResult(res) {
    const modal = document.getElementById('detailModal');
    const body = document.getElementById('modalBody');
    modal.setAttribute('aria-hidden', 'false');
    body.innerHTML = '';

    const title = document.getElementById('modalTitle');
    title.textContent = `${res.app_name} — details`;

    const rows = document.createElement('div');
    rows.innerHTML = `
        <div class="meta-row"><div><strong>Package</strong></div><div><small>${res.package}</small></div></div>
        <div class="meta-row"><div><strong>Publisher</strong></div><div><small>${res.publisher}</small></div></div>
        <div class="meta-row"><div><strong>Name similarity</strong></div><div><small>${res.nameScore}%</small></div></div>
        <div class="meta-row"><div><strong>Package similarity</strong></div><div><small>${res.pkgScore}%</small></div></div>
        <div class="meta-row"><div><strong>Publisher similarity</strong></div><div><small>${res.pubScore}%</small></div></div>
        <div class="meta-row"><div><strong>Average similarity</strong></div><div><small>${res.avg}%</small></div></div>
        <div class="meta-row"><div><strong>Computed risk</strong></div><div><small>${res.risk}%</small></div></div>
    `;

    const recommend = document.createElement('div');
    recommend.className = 'recommend';
    recommend.innerHTML = `
        <strong>Recommendations</strong>
        <ul>
            <li>High risk (&gt;60): treat with caution and cross-check publisher/store listing.</li>
            <li>Medium risk (30–60): review app screenshots and reviews before installing.</li>
            <li>Low risk (&lt;=30): likely a close match but verify official sources when in doubt.</li>
        </ul>
    `;

    body.appendChild(rows);
    body.appendChild(recommend);

    // trap focus briefly (simple)
    document.getElementById('modalClose').focus();
}

function closeModal() {
    const modal = document.getElementById('detailModal');
    modal.setAttribute('aria-hidden', 'true');
}

document.addEventListener('DOMContentLoaded', () => {
    // wire buttons
        const scanBtn = document.getElementById('scanBtn');
        if (scanBtn) scanBtn.addEventListener('click', runDetector);

    // nav toggle for small screens
    const navToggle = document.getElementById('navToggle');
    const navList = document.getElementById('navList');
    navToggle && navToggle.addEventListener('click', () => navList.classList.toggle('show'));

    // current year in footer
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // keyboard: Enter in input triggers scan
        const brandInput = document.getElementById('brandInput');
        if (brandInput) brandInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') runDetector();
        });

    // modal close wiring
        const modalClose = document.getElementById('modalClose');
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalClose) modalClose.addEventListener('click', closeModal);
        if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
});


