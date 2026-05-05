const fs = require("fs");
const file = "C:/Users/viana/BRAZILFIT/backend/src/routes/pt.js";
let c = fs.readFileSync(file, "utf8");

const clientNotifRoute = `
// GET /pt/client-notifications — notifications for a specific client
router.get('/client-notifications', (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  if (!clientId) return res.status(403).json({ error: "Clients only" });
  const notifications = db.prepare(\`
    SELECT * FROM notifications
    WHERE client_id = ?
    ORDER BY created_at DESC
    LIMIT 20
  \`).all(clientId);
  const unreadCount = db.prepare("SELECT COUNT(*) as count FROM notifications WHERE client_id = ? AND is_read = 0").get(clientId).count;
  res.json({ notifications, unreadCount });
});

// PUT /pt/client-notifications/read-all — client marks all their notifications as read
router.put('/client-notifications/read-all', (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  if (!clientId) return res.status(403).json({ error: "Clients only" });
  db.prepare("UPDATE notifications SET is_read = 1 WHERE client_id = ?").run(clientId);
  res.json({ message: "All marked as read" });
});
`;

c = c.replace("module.exports = router;", clientNotifRoute + "\nmodule.exports = router;");
fs.writeFileSync(file, c, "utf8");
console.log("Done");