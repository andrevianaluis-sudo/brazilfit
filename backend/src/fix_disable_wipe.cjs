const fs = require('fs');
let c = fs.readFileSync('googleCalendar.js', 'utf8');

const old = `router.delete('/wipe', authenticateToken, (req, res) => {
  if (req.user.role !== 'pt') return res.status(403).json({ error: 'PT only' });
  const db = getDb();
  db.exec('PRAGMA foreign_keys = OFF');
  const r1 = db.prepare("DELETE FROM sessions").run();
  const r2 = db.prepare("DELETE FROM classes").run();
  db.exec('PRAGMA foreign_keys = ON');
  res.json({ sessionsDeleted: r1.changes, classesDeleted: r2.changes });
});`;

const newCode = `router.delete('/wipe', authenticateToken, (req, res) => {
  // DISABLED: This endpoint previously deleted ALL sessions with no filter,
  // causing accidental data loss. Google Calendar is no longer used.
  return res.status(410).json({ error: 'This endpoint has been permanently disabled for safety.' });
});`;

if (c.includes(old)) {
  c = c.replace(old, newCode);
  fs.writeFileSync('googleCalendar.js', c);
  console.log('Done - wipe endpoint disabled');
} else {
  console.log('NOT FOUND');
}
