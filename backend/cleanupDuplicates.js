const Database = require('better-sqlite3');
const path = require('path');
const dbPath = process.env.DB_PATH || path.join(__dirname, 'brazilfit.db');
const db = new Database(dbPath);

// Delete duplicate @brazilfit.app accounts where a real-email version exists
const duplicates = [
  'andy.devlin@brazilfit.app',
  'chris.siddle@brazilfit.app',
  'clare.moody@brazilfit.app',
  'filomena@brazilfit.app',
  'hilary@brazilfit.app',
  'james@brazilfit.app',
  'jaquetta@brazilfit.app',
  'laura@brazilfit.app',
  'louisa@brazilfit.app',
  'louise@brazilfit.app',
  'lucy@brazilfit.app',
  'lucy.clarke@brazilfit.app',
  'lynne@brazilfit.app',
  'michelle.pegg@brazilfit.app',
  'noah@brazilfit.app',
  'puja@brazilfit.app',
  'sharon.langridge@brazilfit.app',
  'sharon@brazilfit.app',
  'sue.crawley@brazilfit.app',
  'andy@brazilfit.app',
  'chris@brazilfit.app',
  'chrissie@brazilfit.app',
  'clare@brazilfit.app',
  'craig@brazilfit.app',
  'michelle@brazilfit.app',
  'neil@brazilfit.app',
  'sofia@brazilfit.app',
  'sue@brazilfit.app',
];

let deleted = 0;
for (const email of duplicates) {
  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (!user) { console.log('Not found: ' + email); continue; }
  const client = db.prepare('SELECT id FROM clients WHERE user_id = ?').get(user.id);
  if (client) {
    db.prepare('DELETE FROM blocks WHERE client_id = ?').run(client.id);
    db.prepare('DELETE FROM client_settings WHERE client_id = ?').run(client.id);
    db.prepare('DELETE FROM sessions WHERE client_id = ?').run(client.id);
    db.prepare('DELETE FROM clients WHERE id = ?').run(client.id);
  }
  db.prepare('DELETE FROM users WHERE id = ?').run(user.id);
  console.log('Deleted: ' + email);
  deleted++;
}

// Fix prices — F2F = 400, Online = 350
db.prepare("UPDATE clients SET block_price = 400 WHERE client_type = 'F2F' AND block_price = 500").run();
db.prepare("UPDATE clients SET block_price = 350 WHERE client_type = 'Online'").run();
console.log('Prices fixed');
console.log('Done! Deleted ' + deleted + ' duplicates');
db.close();
