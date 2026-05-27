const fs = require('fs');
let c = fs.readFileSync('pt.js', 'utf8');

const code = `
router.post('/clients/:id/insert-sessions', authenticateToken, (req, res) => {
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
  for (const s of sessions) { ins.run(clientId, block.id, s.date, s.time); }
  res.json({ inserted: sessions.length });
});

`;

const target = "router.get('/client-notifications'";
const idx = c.indexOf(target);
if (idx === -1) { console.log('TARGET NOT FOUND'); process.exit(1); }
c = c.slice(0, idx) + code + c.slice(idx);
fs.writeFileSync('pt.js', c);
console.log('Done');
