const fs = require('fs');
const lines = fs.readFileSync('pt.js', 'utf8').split('\n');

let startLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("router.post('/clients/:id/fix-blocks'")) {
    startLine = i;
    break;
  }
}

if (startLine < 0) { console.log('NOT FOUND'); process.exit(1); }

// Find the end of this route (next router. line)
let endLine = -1;
for (let i = startLine + 1; i < lines.length; i++) {
  if (lines[i].includes('router.get') || lines[i].includes('router.post') || lines[i].includes('router.put')) {
    endLine = i;
    break;
  }
}

console.log('Found route from line', startLine + 1, 'to', endLine);

const newRoute = [
  "// POST /api/pt/clients/:id/fix-blocks — set a specific block as current, delete others",
  "router.post('/clients/:id/fix-blocks', authenticateToken, (req, res) => {",
  "  const db = getDb();",
  "  const clientId = parseInt(req.params.id);",
  "  const { keepBlockId } = req.body;",
  "  if (!keepBlockId) return res.status(400).json({ error: 'keepBlockId required' });",
  "  db.exec('PRAGMA foreign_keys = OFF');",
  "  // Move all sessions to the kept block",
  "  db.prepare('UPDATE sessions SET block_id = ? WHERE client_id = ?').run(keepBlockId, clientId);",
  "  // Delete extra blocks",
  "  db.prepare('DELETE FROM blocks WHERE client_id = ? AND id != ?').run(clientId, keepBlockId);",
  "  // Set the kept block as current",
  "  db.prepare('UPDATE blocks SET is_current = 1, end_date = NULL WHERE id = ?').run(keepBlockId);",
  "  db.exec('PRAGMA foreign_keys = ON');",
  "  res.json({ message: 'Blocks fixed' });",
  "});",
  ""
];

lines.splice(startLine, endLine - startLine, ...newRoute);
fs.writeFileSync('pt.js', lines.join('\n'));
console.log('Done');
