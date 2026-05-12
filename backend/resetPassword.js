// Run once on Railway terminal: node resetPassword.js
// Then delete this file
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const path = require('path');
const dbPath = process.env.DB_PATH || path.join(__dirname, 'brazilfit.db');
const db = new Database(dbPath);
const hash = bcrypt.hashSync('BrazilFit2026!', 10);
const r = db.prepare("UPDATE users SET password_hash = ? WHERE username = 'vivien'").run(hash);
console.log('Rows updated:', r.changes, '— vivien password reset to BrazilFit2026!');
db.close();
