const fs = require('fs');
let c = fs.readFileSync('pt.js', 'utf8');

// Insert the new route right before the insert-sessions route
const anchor = "router.post('/clients/:id/insert-sessions', authenticateToken, (req, res) => {";

const newRoute = `// POST /pt/clients/:id/add-oneoff — add a single one-off session, drop the last upcoming to keep block at 10
router.post('/clients/:id/add-oneoff', authenticateToken, (req, res) => {
  const db = getDb();
  const clientId = parseInt(req.params.id);
  const { date, time } = req.body;
  if (!date || !time) return res.status(400).json({ error: 'date and time required' });

  const block = db.prepare("SELECT id FROM blocks WHERE client_id = ? AND is_current = 1").get(clientId);
  if (!block) return res.status(404).json({ error: 'No current block found' });

  // Count current total (attended + upcoming) in this block
  const total = db.prepare("SELECT COUNT(*) as cnt FROM sessions WHERE client_id = ? AND status IN ('attended','upcoming')").get(clientId);

  // If already at 10 or more, remove the latest-dated upcoming session to make room
  if (total.cnt >= 10) {
    const last = db.prepare("SELECT id FROM sessions WHERE client_id = ? AND status = 'upcoming' ORDER BY scheduled_date DESC, scheduled_time DESC LIMIT 1").get(clientId);
    if (last) {
      db.prepare("DELETE FROM sessions WHERE id = ?").run(last.id);
    } else {
      return res.status(400).json({ error: 'Block is full of attended sessions, cannot add more' });
    }
  }

  // Insert the one-off session
  db.prepare("INSERT INTO sessions (client_id, block_id, scheduled_date, scheduled_time, status, session_type) VALUES (?, ?, ?, ?, 'upcoming', 'PT')").run(clientId, block.id, date, time);

  res.json({ message: 'One-off session added', date, time });
});

`;

if (c.includes(anchor) && !c.includes('add-oneoff')) {
  c = c.replace(anchor, newRoute + anchor);
  fs.writeFileSync('pt.js', c);
  console.log('Done - add-oneoff route added');
} else {
  console.log(c.includes('add-oneoff') ? 'Already exists' : 'Anchor NOT FOUND');
}
