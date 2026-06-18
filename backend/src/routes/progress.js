const sharp = require('sharp');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getDb } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// --- Calorie profile + calculation ---
function calcCalories(p) {
  if (!p || !p.weight_kg || !p.height_cm || !p.age || !p.sex) return null;
  const w = p.weight_kg, h = p.height_cm, a = p.age;
  let bmr = 10 * w + 6.25 * h - 5 * a + (p.sex === 'male' ? 5 : -161);
  const factors = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
  const factor = factors[p.activity_level] || 1.2;
  const tdee = bmr * factor;
  const amount = p.deficit_preference || 500;
  const goal = p.calorie_goal || 'lose';
  const target = goal === 'gain' ? tdee + amount : tdee - amount;
  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    target: Math.round(target),
    deficit: amount,
    goal
  };
}

// GET /progress/calorie-profile/:clientId
router.get('/calorie-profile/:clientId', (req, res) => {
  const db = getDb();
  const clientId = parseInt(req.params.clientId);
  const cl = db.prepare("SELECT height_cm, age, sex, activity_level, deficit_preference, calorie_goal FROM clients WHERE id = ?").get(clientId);
  if (!cl) return res.status(404).json({ error: 'Client not found' });
  const latest = db.prepare("SELECT weight_kg FROM progress_entries WHERE client_id = ? AND weight_kg IS NOT NULL ORDER BY entry_date DESC LIMIT 1").get(clientId);
  const profile = { ...cl, weight_kg: latest ? latest.weight_kg : null };
  res.json({ profile, calories: calcCalories(profile) });
});

// POST /progress/calorie-profile/:clientId
router.post('/calorie-profile/:clientId', (req, res) => {
  const db = getDb();
  const clientId = parseInt(req.params.clientId);
  const { height_cm, age, sex, activity_level, deficit_preference, calorie_goal } = req.body;
  db.prepare(`UPDATE clients SET
    height_cm = COALESCE(?, height_cm),
    age = COALESCE(?, age),
    sex = COALESCE(?, sex),
    activity_level = COALESCE(?, activity_level),
    deficit_preference = COALESCE(?, deficit_preference),
    calorie_goal = COALESCE(?, calorie_goal)
    WHERE id = ?`).run(
      height_cm != null ? parseFloat(height_cm) : null,
      age != null ? parseInt(age) : null,
      sex || null,
      activity_level || null,
      deficit_preference != null ? parseInt(deficit_preference) : null,
      calorie_goal || null,
      clientId
    );
  const cl = db.prepare("SELECT height_cm, age, sex, activity_level, deficit_preference, calorie_goal FROM clients WHERE id = ?").get(clientId);
  const latest = db.prepare("SELECT weight_kg FROM progress_entries WHERE client_id = ? AND weight_kg IS NOT NULL ORDER BY entry_date DESC LIMIT 1").get(clientId);
  const profile = { ...cl, weight_kg: latest ? latest.weight_kg : null };
  res.json({ profile, calories: calcCalories(profile) });
});


const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get progress entries for a client
router.get('/:clientId', (req, res) => {
  const db = getDb();
  const clientId = parseInt(req.params.clientId);

  if (req.user.role === 'client' && req.user.clientId !== clientId) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const entries = db.prepare(`
    SELECT * FROM progress_entries WHERE client_id = ? ORDER BY entry_date ASC
  `).all(clientId);

  const latest = entries[entries.length - 1];
  const first = entries[0];
  const weightChange = latest && first ? (latest.weight_kg - first.weight_kg).toFixed(1) : null;

  res.json({
    entries,
    startWeight: first?.weight_kg || null,
    currentWeight: latest?.weight_kg || null,
    weightChange,
    firstEntry: first || null,
    latestEntry: latest || null,
  });
});

// Log a progress entry (client)
router.post('/', (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  if (!clientId && req.user.role !== 'pt') return res.status(403).json({ error: 'Clients only' });

  const { client_id, entry_date, weight_kg, waist_cm, hips_cm, chest_cm, body_fat_pct, notes } = req.body;
  const targetClientId = req.user.role === 'pt' ? client_id : clientId;

  // Check if entry exists for this date
  const existing = db.prepare('SELECT id FROM progress_entries WHERE client_id = ? AND entry_date = ?').get(targetClientId, entry_date);
  if (existing) {
    db.prepare(`
      UPDATE progress_entries SET weight_kg = ?, waist_cm = ?, hips_cm = ?, chest_cm = ?, body_fat_pct = ?, notes = ?
      WHERE id = ?
    `).run(weight_kg, waist_cm, hips_cm, chest_cm, body_fat_pct, notes, existing.id);
    return res.json({ id: existing.id, message: 'Progress updated' });
  }

  const result = db.prepare(`
    INSERT INTO progress_entries (client_id, entry_date, weight_kg, waist_cm, hips_cm, chest_cm, body_fat_pct, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(targetClientId, entry_date, weight_kg, waist_cm, hips_cm, chest_cm, body_fat_pct, notes);

  res.json({ id: result.lastInsertRowid, message: 'Progress logged' });
});

// Wearable data
router.get('/wearable/:clientId', (req, res) => {
  const db = getDb();
  const clientId = parseInt(req.params.clientId);

  if (req.user.role === 'client' && req.user.clientId !== clientId) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const recentData = db.prepare(`
    SELECT * FROM wearable_data WHERE client_id = ? ORDER BY data_date DESC LIMIT 14
  `).all(clientId);

  const connections = db.prepare(`
    SELECT device_type, connection_status, last_sync FROM wearable_connections WHERE client_id = ?
  `).all(clientId);

  const today = recentData[0];
  const readinessScore = today?.readiness_score;

  let recoveryRecommendation = null;
  if (readinessScore !== null && readinessScore !== undefined) {
    if (readinessScore < 40) {
      recoveryRecommendation = { level: 'rest', message: 'Your readiness is low today. Consider a rest day or light stretching only. Your body needs recovery time.' };
    } else if (readinessScore < 65) {
      recoveryRecommendation = { level: 'light', message: 'Moderate readiness. Go for a lighter session today — focus on mobility and technique rather than intensity.' };
    } else {
      recoveryRecommendation = { level: 'go', message: 'Great readiness score! You are primed for a strong session today. Push hard and make it count.' };
    }
  }

  res.json({ data: recentData, connections, readinessScore, recoveryRecommendation });
});

// Connect wearable device
router.post('/wearable/connect', (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  if (!clientId) return res.status(403).json({ error: 'Clients only' });

  const { device_type, access_token } = req.body;

  db.prepare(`
    INSERT OR REPLACE INTO wearable_connections (client_id, device_type, connection_status, access_token, last_sync)
    VALUES (?, ?, 'connected', ?, datetime('now'))
  `).run(clientId, device_type, access_token || 'demo-token');

  // Insert demo wearable data
  const today = new Date().toISOString().split('T')[0];
  const demoData = [
    { days: 0, hr: 62, calories: 480, steps: 8200, sleep: 7.5, hrv: 58, readiness: 78 },
    { days: 1, hr: 65, calories: 520, steps: 9100, sleep: 6.8, hrv: 52, readiness: 65 },
    { days: 2, hr: 60, calories: 410, steps: 7400, sleep: 8.2, hrv: 68, readiness: 85 },
    { days: 3, hr: 68, calories: 350, steps: 5800, sleep: 5.9, hrv: 44, readiness: 42 },
    { days: 4, hr: 63, calories: 490, steps: 8800, sleep: 7.1, hrv: 55, readiness: 72 },
    { days: 5, hr: 61, calories: 530, steps: 9500, sleep: 7.8, hrv: 62, readiness: 82 },
    { days: 6, hr: 64, calories: 460, steps: 8000, sleep: 7.3, hrv: 57, readiness: 76 },
  ];

  const insertWearable = db.prepare(`
    INSERT OR REPLACE INTO wearable_data
    (client_id, data_date, heart_rate_resting, active_calories, steps, sleep_hours, hrv, readiness_score, data_source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const d of demoData) {
    const date = new Date(today);
    date.setDate(date.getDate() - d.days);
    insertWearable.run(clientId, date.toISOString().split('T')[0], d.hr, d.calories, d.steps, d.sleep, d.hrv, d.readiness, device_type);
  }

  res.json({ message: `${device_type} connected successfully`, demo: true });
});

// POST /api/progress/photos — upload progress photo
router.post('/photos', upload.single('photo'), async (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  if (!clientId) return res.status(403).json({ error: 'Clients only' });

  const { angle, notes } = req.body;
  if (!angle || !req.file) return res.status(400).json({ error: 'Photo and angle required' });

  const photoData = await sharp(req.file.buffer)
    .rotate()
    .resize({ width: 800, withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();
  const uploadDate = new Date().toISOString().split('T')[0];

  try {
    const result = db.prepare(`
      INSERT INTO progress_photos (client_id, photo_data, angle, upload_date, notes)
      VALUES (?, ?, ?, ?, ?)
    `).run(clientId, photoData, angle, uploadDate, notes || null);

    res.status(201).json({
      id: result.lastInsertRowid,
      angle,
      upload_date: uploadDate,
      notes,
      message: 'Photo uploaded successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

// GET /api/progress/photos — get photos for client (no param) or specific client (for PT)
router.get('/photos', (req, res) => {
  const db = getDb();
  let clientId;

  if (req.user.role === 'client') {
    clientId = req.user.clientId;
  } else if (req.user.role === 'pt') {
    clientId = parseInt(req.query.clientId);
    if (!clientId) return res.status(400).json({ error: 'clientId required for PTs' });
  } else {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const photos = db.prepare(`
      SELECT id, angle, upload_date, notes, created_at FROM progress_photos
      WHERE client_id = ? ORDER BY upload_date DESC
    `).all(clientId);

    res.json(photos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

// GET /api/progress/photos/client/:clientId — get all photos for a client (PT view)
router.get('/photos/client/:clientId', (req, res) => {
  const db = getDb();
  const clientId = parseInt(req.params.clientId);

  if (req.user.role === 'pt') {
    // PT can view any client
  } else if (req.user.role === 'client' && req.user.clientId !== clientId) {
    return res.status(403).json({ error: 'Access denied' });
  } else if (req.user.role === 'client') {
    // Client viewing their own
  } else {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const photos = db.prepare(`
      SELECT id, angle, upload_date, notes, created_at FROM progress_photos
      WHERE client_id = ? ORDER BY upload_date DESC
    `).all(clientId);

    res.json(photos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

// GET /api/progress/photos/:photoId/data — get photo data by ID
router.get('/photos/:photoId/data', (req, res) => {
  const db = getDb();
  const photoId = parseInt(req.params.photoId);

  try {
    const photo = db.prepare(`
      SELECT client_id, photo_data FROM progress_photos WHERE id = ?
    `).get(photoId);

    if (!photo) return res.status(404).json({ error: 'Photo not found' });

    if (req.user.role === 'client' && req.user.clientId !== photo.client_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Disposition', 'inline');
    res.end(photo.photo_data, 'binary');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch photo' });
  }
});

// DELETE /api/progress/photos/:photoId — delete a photo
router.delete('/photos/:photoId', (req, res) => {
  const db = getDb();
  const photoId = parseInt(req.params.photoId);

  try {
    const photo = db.prepare('SELECT client_id FROM progress_photos WHERE id = ?').get(photoId);
    if (!photo) return res.status(404).json({ error: 'Photo not found' });

    if (req.user.role === 'client' && req.user.clientId !== photo.client_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    db.prepare('DELETE FROM progress_photos WHERE id = ?').run(photoId);
    res.json({ message: 'Photo deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});


router.delete('/:id', authenticateToken, (req, res) => {
  const db = getDb();
  const entryId = parseInt(req.params.id);
  try {
    const entry = db.prepare('SELECT client_id FROM progress_entries WHERE id = ?').get(entryId);
    if (!entry) return res.status(404).json({ error: 'Not found' });
    if (req.user.role === 'client' && req.user.clientId !== entry.client_id) return res.status(403).json({ error: 'Access denied' });
    db.prepare('DELETE FROM progress_entries WHERE id = ?').run(entryId);
    res.json({ message: 'Deleted' });
  } catch { res.status(500).json({ error: 'Failed to delete' }); }
});

module.exports = router;
