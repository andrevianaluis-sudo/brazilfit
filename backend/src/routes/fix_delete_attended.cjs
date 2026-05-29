const fs = require('fs');
let c = fs.readFileSync('pt.js', 'utf8');

const old = `    db.prepare("DELETE FROM sessions WHERE client_id = ? AND status = 'upcoming' AND scheduled_date >= ?").run(clientId, deleteFromDate);`;

const newCode = `    db.prepare("DELETE FROM sessions WHERE client_id = ? AND scheduled_date >= ?").run(clientId, deleteFromDate);`;

if (c.includes(old)) {
  c = c.replace(old, newCode);
  fs.writeFileSync('pt.js', c);
  console.log('Done');
} else {
  console.log('NOT FOUND');
}
