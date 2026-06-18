const fs = require('fs');
let c = fs.readFileSync('pt.js', 'utf8');

const anchor = "router.get('/clients', (req, res) => {";

const newRoute = `// GET /pt/progress-summary — all active clients with their full progress history
router.get('/progress-summary', authenticateToken, (req, res) => {
  const db = getDb();
  const clients = db.prepare(\`
    SELECT c.id as clientId, u.name as clientName
    FROM clients c JOIN users u ON c.user_id = u.id
    WHERE u.is_active = 1
    ORDER BY u.name
  \`).all();

  const summary = clients.map(cl => {
    const entries = db.prepare(
      "SELECT id, entry_date, weight_kg, waist_cm, hips_cm, chest_cm, body_fat_pct, notes FROM progress_entries WHERE client_id = ? ORDER BY entry_date DESC"
    ).all(cl.clientId);
    let weightChange = null;
    if (entries.length >= 2) {
      const latest = entries[0];
      const first = entries[entries.length - 1];
      if (latest.weight_kg != null && first.weight_kg != null) {
        weightChange = parseFloat((latest.weight_kg - first.weight_kg).toFixed(1));
      }
    }
    return {
      clientId: cl.clientId,
      clientName: cl.clientName,
      entryCount: entries.length,
      latest: entries[0] || null,
      weightChange,
      entries
    };
  });

  res.json({ summary });
});

router.get('/clients', (req, res) => {`;

if (c.includes(anchor) && !c.includes('progress-summary')) {
  c = c.replace(anchor, newRoute);
  fs.writeFileSync('pt.js', c);
  console.log('Done - progress-summary route added');
} else {
  console.log(c.includes('progress-summary') ? 'Already exists' : 'Anchor NOT FOUND');
}
