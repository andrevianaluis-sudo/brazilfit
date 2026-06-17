const fs = require('fs');
let c = fs.readFileSync('backup.js', 'utf8');

// Add zlib import at the top
if (!c.includes("require('zlib')")) {
  c = c.replace(
    "const https = require('https');",
    "const https = require('https');\nconst zlib = require('zlib');"
  );
}

// Replace the content read + filePath with gzip version
const old = `    const content = fs.readFileSync(dbPath).toString('base64');
    const now = new Date();
    const stamp = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const filePath = \`backups/brazilfit-\${stamp}.db\`;`;

const newCode = `    const raw = fs.readFileSync(dbPath);
    const gzipped = zlib.gzipSync(raw);
    const content = gzipped.toString('base64');
    const now = new Date();
    const stamp = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const filePath = \`backups/brazilfit-\${stamp}.db.gz\`;
    console.log('[backup] DB size:', (raw.length/1024).toFixed(0)+'KB', '-> gzipped:', (gzipped.length/1024).toFixed(0)+'KB');`;

if (c.includes(old)) {
  c = c.replace(old, newCode);
  fs.writeFileSync('backup.js', c);
  console.log('Done - now compresses with gzip');
} else {
  console.log('NOT FOUND - structure differs');
}
