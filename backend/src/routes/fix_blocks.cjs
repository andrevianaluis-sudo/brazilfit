const fs = require('fs');
let c = fs.readFileSync('pt.js', 'utf8');

const code = `
// POST /api/pt/clients/:id/fix-blocks — set a specific block as current, delete others
router.post('/clients/:id/fix-blocks', authenticateToken, (req, res) => {
  const db = getDb();
  const clientId = parseInt(req.params.id);
  const { keepBlockId } = req.body;
  if (!keepBlockId) return res.status(400).json({ error: 'keepBlockId required' });

  // Set all blocks to not current
  db.prepare('UPDATE blocks SET is_current = 0 WHERE client_id = ?').run(clientId);
  // Delete extra blocks (not the one we want to keep)
  db.prepare('DELETE FROM blocks WHERE client_id = ? AND id != ?').run(clientId, keepBlockId);
  // Set the kept block as current
  db.prepare('UPDATE blocks SET is_current = 1, end_date = NULL WHERE id = ?').run(keepBlockId);

  res.json({ message: 'Blocks fixed' });
});

`;

const target = "router.get('/client-notifications'";
const idx = c.indexOf(target);
if (idx === -1) { console.log('TARGET NOT FOUND'); process.exit(1); }
c = c.slice(0, idx) + code + c.slice(idx);
fs.writeFileSync('pt.js', c);
console.log('Done');
