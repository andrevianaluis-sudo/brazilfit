// Run once on Railway terminal: node resetVivien.js
// Wipes all demo data for Vivien but keeps her account
const Database = require('better-sqlite3');
const path = require('path');
const dbPath = process.env.DB_PATH || path.join(__dirname, 'brazilfit.db');
const db = new Database(dbPath);

// Get Vivien's client ID
const user = db.prepare("SELECT id FROM users WHERE username = 'vivien'").get();
if (!user) { console.log('Vivien not found'); process.exit(1); }

const clientRow = db.prepare("SELECT id FROM clients WHERE user_id = ?").get(user.id);
if (!clientRow) { console.log('Client record not found'); process.exit(1); }

const clientId = clientRow.id;
console.log(`Resetting data for client ID: ${clientId}`);

// Wipe all demo data
db.prepare("DELETE FROM sessions WHERE client_id = ?").run(clientId);
db.prepare("DELETE FROM weekly_checkins WHERE client_id = ?").run(clientId);
db.prepare("DELETE FROM habit_logs WHERE client_id = ?").run(clientId);
db.prepare("DELETE FROM progress_entries WHERE client_id = ?").run(clientId);
db.prepare("DELETE FROM progress_photos WHERE client_id = ?").run(clientId);
db.prepare("DELETE FROM messages WHERE client_id = ?").run(clientId);
db.prepare("DELETE FROM food_mood_entries WHERE client_id = ?").run(clientId);
db.prepare("DELETE FROM shopping_list_items WHERE client_id = ?").run(clientId);
db.prepare("DELETE FROM client_routines WHERE client_id = ?").run(clientId);
db.prepare("DELETE FROM notifications WHERE client_id = ?").run(clientId);
db.prepare("DELETE FROM blocks WHERE client_id = ?").run(clientId);

// Reset client stats
db.prepare(`UPDATE clients SET 
  sessions_used = 0,
  sessions_remaining = 0,
  current_block_number = 0,
  last_payment_date = NULL,
  block_start_date = NULL,
  ow_user_id = NULL
WHERE id = ?`).run(clientId);

console.log('✅ Vivien reset complete — account intact, all demo data wiped');
db.close();
