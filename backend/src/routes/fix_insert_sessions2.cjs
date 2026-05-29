const fs = require('fs');
let c = fs.readFileSync('pt.js', 'utf8');

const old = `router.post('/clients/:id/insert-sessions', authenticateToken, (req, res) => {
  const db = getDb();
  const clientId = parseInt(req.params.id);
  const { sessions, deleteFromDate } = req.body;
  if (!sessions || !Array.isArray(sessions)) return res.status(400).json({ error: 'sessions array required' });

  if (deleteFromDate) {
    db.prepare("DELETE FROM sessions WHERE client_id = ? AND status = 'upcoming' AND scheduled_date >= ?").run(clientId, deleteFromDate);
  }

  const block = db.prepare("SELECT id FROM blocks WHERE client_id = ? AND is_current = 1").get(clientId);
  if (!block) return res.status(404).json({ error: 'No current block found' });

  const ins = db.prepare("INSERT INTO sessions (client_id, block_id, scheduled_date, scheduled_time, status, session_type) VALUES (?, ?, ?, ?, 'upcoming', 'PT')");
  for (const s of sessions) {
    ins.run(clientId, block.id, s.date, s.time);
  }

  res.json({ inserted: sessions.length });
});`;

const newCode = `router.post('/clients/:id/insert-sessions', authenticateToken, (req, res) => {
  const db = getDb();
  const clientId = parseInt(req.params.id);
  const { sessions, deleteFromDate } = req.body;
  if (!sessions || !Array.isArray(sessions)) return res.status(400).json({ error: 'sessions array required' });

  if (deleteFromDate) {
    db.prepare("DELETE FROM sessions WHERE client_id = ? AND scheduled_date >= ?").run(clientId, deleteFromDate);
  }

  const block = db.prepare("SELECT id FROM blocks WHERE client_id = ? AND is_current = 1").get(clientId);
  if (!block) return res.status(404).json({ error: 'No current block found' });

  const ins = db.prepare("INSERT INTO sessions (client_id, block_id, scheduled_date, scheduled_time, status, session_type) VALUES (?, ?, ?, ?, ?, 'PT')");
  for (const s of sessions) {
    ins.run(clientId, block.id, s.date, s.time, s.status || 'upcoming');
  }

  // Update sessions_used count
  const attendedCount = db.prepare("SELECT COUNT(*) as cnt FROM sessions WHERE client_id = ? AND status = 'attended'").get(clientId);
  db.prepare("UPDATE clients SET sessions_used = ? WHERE id = ?").run(attendedCount.cnt, clientId);

  res.json({ inserted: sessions.length });
});`;

if (c.includes(old)) {
  c = c.replace(old, newCode);
  fs.writeFileSync('pt.js', c);
  console.log('Done');
} else {
  console.log('NOT FOUND');
}
