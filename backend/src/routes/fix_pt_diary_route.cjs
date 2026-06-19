const fs = require('fs');
let c = fs.readFileSync('diary.js', 'utf8');

// Add a PT route after the authenticateToken import block.
const anchor = "const { authenticateToken } = require('../middleware/auth');";

const ptRoute = `const { authenticateToken } = require('../middleware/auth');

// GET /diary/pt/:clientId — PT views a client's recent diary entries + photos
router.get('/pt/:clientId', authenticateToken, (req, res) => {
  if (req.user.role !== 'pt') return res.status(403).json({ error: 'PT only' });
  const { getDb } = require('../db/database');
  const db = getDb();
  const clientId = parseInt(req.params.clientId);
  const entries = db.prepare(
    "SELECT entry_date, meals, water_glasses, mood_before, mood_after, notes FROM food_mood_entries WHERE client_id = ? ORDER BY entry_date DESC LIMIT 30"
  ).all(clientId);
  const photos = db.prepare(
    "SELECT id, entry_date FROM meal_photos WHERE client_id = ? ORDER BY entry_date DESC, id DESC"
  ).all(clientId);
  // group photos by date
  const photosByDate = {};
  for (const p of photos) {
    if (!photosByDate[p.entry_date]) photosByDate[p.entry_date] = [];
    photosByDate[p.entry_date].push(p.id);
  }
  res.json({ entries, photosByDate });
});`;

if (c.includes('/diary/pt/:clientId') || c.includes("router.get('/pt/:clientId'")) {
  console.log('Already exists');
} else if (c.includes(anchor)) {
  c = c.replace(anchor, ptRoute);
  fs.writeFileSync('diary.js', c);
  console.log('Done - PT diary route added');
} else {
  console.log('Anchor NOT FOUND');
}
