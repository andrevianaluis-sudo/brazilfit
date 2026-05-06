const fs = require('fs');
const file = 'C:/Users/viana/BRAZILFIT/backend/src/routes/messages.js';
let c = fs.readFileSync(file, 'utf8');
const route = `
// GET /api/messages/client-notifications
router.get('/client-notifications', authenticateToken, (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  if (!clientId) return res.status(403).json({ error: 'Clients only' });
  const notifications = db.prepare('SELECT * FROM notifications WHERE client_id = ? ORDER BY created_at DESC LIMIT 20').all(clientId);
  const unreadCount = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE client_id = ? AND is_read = 0').get(clientId).count;
  res.json({ notifications, unreadCount });
});
// PUT /api/messages/client-notifications/read-all
router.put('/client-notifications/read-all', authenticateToken, (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  if (!clientId) return res.status(403).json({ error: 'Clients only' });
  db.prepare('UPDATE notifications SET is_read = 1 WHERE client_id = ?').run(clientId);
  res.json({ message: 'All marked as read' });
});
`;
c = c.replace('module.exports = router;', route + 'module.exports = router;');
fs.writeFileSync(file, c, 'utf8');
console.log('Done:', c.includes('client-notifications'));
