// backup.js - daily database backup to GitHub
const fs = require('fs');
const path = require('path');
const https = require('https');

const DB_PATH = process.env.DB_PATH || './brazilfit.db';
const dbPath = path.resolve(__dirname, '../', DB_PATH);

const TOKEN = process.env.GITHUB_BACKUP_TOKEN;
const REPO = process.env.GITHUB_BACKUP_REPO;   // e.g. andrevianaluis-sudo/brazilfit
const BRANCH = 'backups';

function ghRequest(method, apiPath, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'api.github.com',
      path: apiPath,
      method,
      headers: {
        'Authorization': 'Bearer ' + TOKEN,
        'User-Agent': 'brazilfit-backup',
        'Accept': 'application/vnd.github+json',
        ...(data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {})
      }
    };
    const req = https.request(opts, res => {
      let b = '';
      res.on('data', d => b += d);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(b || '{}') }); }
        catch { resolve({ status: res.statusCode, body: {} }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runBackup() {
  if (!TOKEN || !REPO) {
    console.log('[backup] Skipped — GITHUB_BACKUP_TOKEN or GITHUB_BACKUP_REPO not set');
    return;
  }
  try {
    if (!fs.existsSync(dbPath)) {
      console.log('[backup] DB file not found at', dbPath);
      return;
    }
    const content = fs.readFileSync(dbPath).toString('base64');
    const now = new Date();
    const stamp = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const filePath = `backups/brazilfit-${stamp}.db`;

    // Check if today's backup already exists (to get its SHA for update)
    let sha = undefined;
    const existing = await ghRequest('GET', `/repos/${REPO}/contents/${filePath}?ref=${BRANCH}`);
    if (existing.status === 200 && existing.body.sha) sha = existing.body.sha;

    const result = await ghRequest('PUT', `/repos/${REPO}/contents/${filePath}`, {
      message: `Automated DB backup ${now.toISOString()}`,
      content,
      branch: BRANCH,
      ...(sha ? { sha } : {})
    });

    if (result.status === 200 || result.status === 201) {
      console.log('[backup] ✅ Backed up to GitHub:', filePath);
    } else {
      console.log('[backup] ❌ Failed:', result.status, JSON.stringify(result.body).substring(0, 200));
    }
  } catch (e) {
    console.log('[backup] Error:', e.message);
  }
}

module.exports = { runBackup };
