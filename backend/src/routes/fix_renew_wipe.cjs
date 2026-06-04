const fs = require('fs');
let c = fs.readFileSync('pt.js', 'utf8');

const old = `  // Generate new sessions from schedule
  const schedule = db.prepare('SELECT day_of_week, session_time FROM client_schedules WHERE client_id = ?').all(clientId);
  const newBlock = db.prepare('SELECT id FROM blocks WHERE client_id = ? AND is_current = 1').get(clientId);`;

const newCode = `  // Wipe ALL existing upcoming sessions before generating new ones
  db.exec('PRAGMA foreign_keys = OFF');
  db.prepare("DELETE FROM sessions WHERE client_id = ? AND status = 'upcoming'").run(clientId);
  db.exec('PRAGMA foreign_keys = ON');

  // Generate new sessions from schedule
  const schedule = db.prepare('SELECT day_of_week, session_time FROM client_schedules WHERE client_id = ?').all(clientId);
  const newBlock = db.prepare('SELECT id FROM blocks WHERE client_id = ? AND is_current = 1').get(clientId);`;

if (c.includes(old)) {
  c = c.replace(old, newCode);
  fs.writeFileSync('pt.js', c);
  console.log('Done');
} else {
  console.log('NOT FOUND');
}
