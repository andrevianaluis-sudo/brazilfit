const Database = require('better-sqlite3');
const db = new Database('/app/data/brazilfit.db');

const usernames = ['andy.devlin','chris.siddle','clare.moody','filomena','hilary','james','jaquetta','laura','louisa','louise','lucy','lucy.clarke','lynne','michelle.pegg','noah','puja','sharon.langridge','sharon','sue.crawley','andy','chris','chrissie','clare','craig','michelle','neil','sofia','sue'];

let deleted = 0;
for (const u of usernames) {
  const email = u + '@brazilfit.app';
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

db.prepare("UPDATE clients SET block_price = 400 WHERE client_type = 'F2F' AND block_price = 500").run();
db.prepare("UPDATE clients SET block_price = 350 WHERE client_type = 'Online'").run();
console.log('Done! Deleted ' + deleted);
db.close();