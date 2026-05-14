// Run once: node seedClients.js
// Creates all real clients from Google Calendar
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const path = require('path');
const dbPath = process.env.DB_PATH || path.join(__dirname, 'brazilfit.db');
const db = new Database(dbPath);

const defaultPassword = bcrypt.hashSync('BrazilFit2026!', 10);

const clients = [
  { name: 'Sofia',            username: 'sofia',      email: 'sofia@brazilfit.app' },
  { name: 'Jaquetta',         username: 'jaquetta',   email: 'jaquetta@brazilfit.app' },
  { name: 'Chrissie',         username: 'chrissie',   email: 'chrissie@brazilfit.app' },
  { name: 'Clare',            username: 'clare',      email: 'clare@brazilfit.app' },
  { name: 'Andy',             username: 'andy',       email: 'andy@brazilfit.app' },
  { name: 'Sharon',           username: 'sharon',     email: 'sharon@brazilfit.app' },
  { name: 'Laura',            username: 'laura',      email: 'laura@brazilfit.app' },
  { name: 'James',            username: 'james',      email: 'james@brazilfit.app' },
  { name: 'Michelle',         username: 'michelle',   email: 'michelle@brazilfit.app' },
  { name: 'Louise',           username: 'louise',     email: 'louise@brazilfit.app' },
  { name: 'Noah',             username: 'noah',       email: 'noah@brazilfit.app' },
  { name: 'Puja',             username: 'puja',       email: 'puja@brazilfit.app' },
  { name: 'Lucy',             username: 'lucy',       email: 'lucy@brazilfit.app' },
  { name: 'Neil',             username: 'neil',       email: 'neil@brazilfit.app' },
  { name: 'Sue',              username: 'sue',        email: 'sue@brazilfit.app' },
  { name: 'Craig',            username: 'craig',      email: 'craig@brazilfit.app' },
  { name: 'Chris',            username: 'chris',      email: 'chris@brazilfit.app' },
  { name: 'Louisa',           username: 'louisa',     email: 'louisa@brazilfit.app' },
  { name: 'Filomena Saulino', username: 'filomena',   email: 'filomena@brazilfit.app' },
  { name: 'Michelle Pegg',    username: 'michelle.pegg', email: 'michelle.pegg@brazilfit.app' },
  { name: 'Lucy Clarke',      username: 'lucy.clarke',   email: 'lucy.clarke@brazilfit.app' },
  { name: 'Sharon Langridge', username: 'sharon.langridge', email: 'sharon.langridge@brazilfit.app' },
  { name: 'Chris Siddle',     username: 'chris.siddle',  email: 'chris.siddle@brazilfit.app' },
];

let created = 0, skipped = 0;

for (const client of clients) {
  try {
    // Check if user already exists
    const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(client.username);
    if (existing) { console.log(`⏭  Skipped: ${client.name} (already exists)`); skipped++; continue; }

    // Create user
    const userResult = db.prepare(`
      INSERT INTO users (email, username, password_hash, role, name)
      VALUES (?, ?, ?, 'client', ?)
    `).run(client.email, client.username, defaultPassword, client.name);

    // Create client profile
    db.prepare(`
      INSERT INTO clients (user_id, client_type, block_price, sessions_used, sessions_remaining, is_pro)
      VALUES (?, 'F2F', 500, 0, 0, 1)
    `).run(userResult.lastInsertRowid);

    console.log(`✅ Created: ${client.name} (${client.username})`);
    created++;
  } catch(e) {
    console.log(`❌ Error creating ${client.name}: ${e.message}`);
  }
}

console.log(`\nDone! Created: ${created}, Skipped: ${skipped}`);
db.close();
