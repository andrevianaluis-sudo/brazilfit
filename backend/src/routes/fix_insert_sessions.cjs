const fs = require('fs');
let c = fs.readFileSync('pt.js', 'utf8');

const old = `  const ins = db.prepare("INSERT INTO sessions (client_id, block_id, scheduled_date, scheduled_time, status, session_type) VALUES (?, ?, ?, ?, 'upcoming', 'PT')");
  for (const s of sessions) { ins.run(clientId, block.id, s.date, s.time); }`;

const newCode = `  const ins = db.prepare("INSERT INTO sessions (client_id, block_id, scheduled_date, scheduled_time, status, session_type) VALUES (?, ?, ?, ?, ?, 'PT')");
  for (const s of sessions) { ins.run(clientId, block.id, s.date, s.time, s.status || 'upcoming'); }
  // Update sessions_used count based on attended sessions
  const attendedCount = db.prepare("SELECT COUNT(*) as cnt FROM sessions WHERE client_id = ? AND status = 'attended'").get(clientId);
  db.prepare("UPDATE clients SET sessions_used = ? WHERE id = ?").run(attendedCount.cnt, clientId);`;

if (c.includes(old)) {
  c = c.replace(old, newCode);
  fs.writeFileSync('pt.js', c);
  console.log('Done');
} else {
  console.log('NOT FOUND');
}
