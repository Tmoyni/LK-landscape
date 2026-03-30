// Tiny dev server that saves zones.json from the admin interface
// Run alongside browser-sync: node save-server.js

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const ZONES_PATH = path.join(__dirname, 'zones.json');

http.createServer((req, res) => {
    // CORS headers for every response
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
    }

    if (req.method === 'POST' && req.url === '/save-zones') {
        const chunks = [];
        req.on('data', (chunk) => chunks.push(chunk));
        req.on('end', () => {
            try {
                const body = Buffer.concat(chunks).toString();
                const data = JSON.parse(body);
                fs.writeFileSync(ZONES_PATH, JSON.stringify(data, null, 4));
                const zoneCount = Object.keys(data.zones || {}).length;
                console.log(`Saved zones.json (${zoneCount} zones)`);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true, zones: zoneCount }));
            } catch (e) {
                console.error('Error saving:', e.message);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: e.message }));
            }
        });
        req.on('error', (e) => {
            console.error('Request error:', e.message);
            res.writeHead(500);
            res.end();
        });
        return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
}).listen(PORT, () => {
    console.log(`Save server running at http://localhost:${PORT}`);
});
