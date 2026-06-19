const fs = require('fs');
let c = fs.readFileSync('diary.js', 'utf8');

// Check for sharp + multer imports; add if missing
let header = '';
if (!c.includes("require('sharp')")) header += "const sharp = require('sharp');\n";
if (!c.includes("require('multer')")) header += "const multer = require('multer');\n";

// Add multer setup + routes after the router is created
const anchor = "const router = express.Router();";

const setup = `const router = express.Router();
const _mealUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// POST /diary/photos/:date — upload a meal photo (max 4 per day)
router.post('/photos/:date', authenticateToken, _mealUpload.single('photo'), async (req, res) => {
  try {
    const { getDb } = require('../db/database');
    const db = getDb();
    const clientId = req.user.clientId;
    if (!clientId) return res.status(400).json({ error: 'No client' });
    if (!req.file) return res.status(400).json({ error: 'No photo' });
    const date = req.params.date;
    const count = db.prepare("SELECT COUNT(*) as c FROM meal_photos WHERE client_id = ? AND entry_date = ?").get(clientId, date);
    if (count.c >= 4) return res.status(400).json({ error: 'Max 4 photos per day' });
    const sharp = require('sharp');
    const data = await sharp(req.file.buffer).resize({ width: 400, withoutEnlargement: true }).jpeg({ quality: 70 }).toBuffer();
    db.prepare("INSERT INTO meal_photos (client_id, entry_date, photo_data) VALUES (?,?,?)").run(clientId, date, data);
    res.json({ message: 'Photo added' });
  } catch (e) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

// GET /diary/photos/:date — list photo IDs for a day (current client)
router.get('/photos/:date', authenticateToken, (req, res) => {
  const { getDb } = require('../db/database');
  const db = getDb();
  const clientId = req.user.clientId;
  if (!clientId) return res.json({ photos: [] });
  const rows = db.prepare("SELECT id FROM meal_photos WHERE client_id = ? AND entry_date = ? ORDER BY id").all(clientId, req.params.date);
  res.json({ photos: rows.map(r => r.id) });
});

// GET /diary/photo/:id — serve a photo image
router.get('/photo/:id', authenticateToken, (req, res) => {
  const { getDb } = require('../db/database');
  const db = getDb();
  const row = db.prepare("SELECT photo_data FROM meal_photos WHERE id = ?").get(parseInt(req.params.id));
  if (!row) return res.status(404).end();
  res.setHeader('Content-Type', 'image/jpeg');
  res.end(row.photo_data, 'binary');
});

// DELETE /diary/photo/:id — delete a meal photo (own only)
router.delete('/photo/:id', authenticateToken, (req, res) => {
  const { getDb } = require('../db/database');
  const db = getDb();
  const clientId = req.user.clientId;
  db.prepare("DELETE FROM meal_photos WHERE id = ? AND client_id = ?").run(parseInt(req.params.id), clientId);
  res.json({ message: 'Deleted' });
});
`;

if (c.includes('diary/photos/:date') || c.includes('_mealUpload')) {
  console.log('Already exists');
} else if (c.includes(anchor)) {
  c = header + c.replace(anchor, setup);
  fs.writeFileSync('diary.js', c);
  console.log('Done - meal photo routes added');
} else {
  console.log('Anchor NOT FOUND');
}
