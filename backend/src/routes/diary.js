const sharp = require('sharp');
const multer = require('multer');
const express = require('express');
const router = express.Router();

const { getDb } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

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
});

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


// Require Pro for all routes
function requirePro(req, res, next) {
  if (!req.user?.isPro) {
    return res.status(403).json({ error: 'Pro feature required' });
  }
  next();
}

// GET /api/diary/entries - Get all diary entries for client with optional date filtering
router.get('/entries', authenticateToken, requirePro, (req, res) => {
  const db = getDb();
  const { startDate, endDate } = req.query;

  let query = `
    SELECT * FROM food_mood_entries
    WHERE client_id = ?
  `;
  const params = [req.user.clientId];

  if (startDate) {
    query += ` AND entry_date >= ?`;
    params.push(startDate);
  }
  if (endDate) {
    query += ` AND entry_date <= ?`;
    params.push(endDate);
  }

  query += ` ORDER BY entry_date DESC, entry_time DESC`;

  const entries = db.prepare(query).all(...params);
  res.json({ entries });
});

// POST /api/diary/entries - Create new diary entry
router.post('/entries', authenticateToken, requirePro, (req, res) => {
  const { entry_date, entry_time, location, food_description, food_amount, mood_before_eating, mood_after_eating, reflection_notes, water_glasses } = req.body;

  if (!entry_date) {
    return res.status(400).json({ error: 'entry_date required' });
  }

  const db = getDb();
  try {
    const result = db.prepare(`
      INSERT INTO food_mood_entries
      (client_id, entry_date, entry_time, location, food_description, food_amount, mood_before_eating, mood_after_eating, reflection_notes, water_glasses)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.user.clientId,
      entry_date,
      entry_time || null,
      location || null,
      food_description || null,
      food_amount || null,
      mood_before_eating || null,
      mood_after_eating || null,
      reflection_notes || null,
      water_glasses || 0
    );

    res.json({ id: result.lastInsertRowid, message: 'Entry created' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create entry' });
  }
});

// PUT /api/diary/entries/:id - Update diary entry
router.put('/entries/:id', authenticateToken, requirePro, (req, res) => {
  const db = getDb();
  const entry = db.prepare('SELECT client_id FROM food_mood_entries WHERE id = ?').get(req.params.id);

  if (!entry || entry.client_id !== req.user.clientId) {
    return res.status(404).json({ error: 'Entry not found' });
  }

  const { entry_date, entry_time, location, food_description, food_amount, mood_before_eating, mood_after_eating, reflection_notes, water_glasses } = req.body;

  try {
    db.prepare(`
      UPDATE food_mood_entries
      SET entry_date = ?, entry_time = ?, location = ?, food_description = ?, food_amount = ?, mood_before_eating = ?, mood_after_eating = ?, reflection_notes = ?, water_glasses = ?
      WHERE id = ?
    `).run(
      entry_date || null,
      entry_time || null,
      location || null,
      food_description || null,
      food_amount || null,
      mood_before_eating || null,
      mood_after_eating || null,
      reflection_notes || null,
      water_glasses || 0,
      req.params.id
    );

    res.json({ message: 'Entry updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update entry' });
  }
});

// DELETE /api/diary/entries/:id - Delete diary entry
router.delete('/entries/:id', authenticateToken, requirePro, (req, res) => {
  const db = getDb();
  const entry = db.prepare('SELECT client_id FROM food_mood_entries WHERE id = ?').get(req.params.id);

  if (!entry || entry.client_id !== req.user.clientId) {
    return res.status(404).json({ error: 'Entry not found' });
  }

  db.prepare('DELETE FROM food_mood_entries WHERE id = ?').run(req.params.id);
  res.json({ message: 'Entry deleted' });
});

// GET /api/diary/weekly - Get weekly summary with mood patterns and water intake
router.get('/weekly', authenticateToken, requirePro, (req, res) => {
  const db = getDb();
  const { startDate, endDate } = req.query;

  let query = `
    SELECT entry_date, mood_before_eating, mood_after_eating, water_glasses
    FROM food_mood_entries
    WHERE client_id = ?
  `;
  const params = [req.user.clientId];

  if (startDate) {
    query += ` AND entry_date >= ?`;
    params.push(startDate);
  }
  if (endDate) {
    query += ` AND entry_date <= ?`;
    params.push(endDate);
  }

  query += ` ORDER BY entry_date DESC`;

  const entries = db.prepare(query).all(...params);

  // Calculate weekly summary
  const moodBefore = entries.filter(e => e.mood_before_eating).map(e => e.mood_before_eating);
  const moodAfter = entries.filter(e => e.mood_after_eating).map(e => e.mood_after_eating);
  const totalWaterGlasses = entries.reduce((sum, e) => sum + (e.water_glasses || 0), 0);

  const avgMoodBefore = moodBefore.length > 0 ? (moodBefore.reduce((a, b) => a + b, 0) / moodBefore.length).toFixed(1) : null;
  const avgMoodAfter = moodAfter.length > 0 ? (moodAfter.reduce((a, b) => a + b, 0) / moodAfter.length).toFixed(1) : null;
  const moodImprovement = avgMoodBefore && avgMoodAfter ? (avgMoodAfter - avgMoodBefore).toFixed(1) : null;

  // Group by day for daily patterns
  const byDay = {};
  entries.forEach(e => {
    if (!byDay[e.entry_date]) {
      byDay[e.entry_date] = { entries: 0, water: 0, moodBefore: [], moodAfter: [] };
    }
    byDay[e.entry_date].entries += 1;
    byDay[e.entry_date].water += (e.water_glasses || 0);
    if (e.mood_before_eating) byDay[e.entry_date].moodBefore.push(e.mood_before_eating);
    if (e.mood_after_eating) byDay[e.entry_date].moodAfter.push(e.mood_after_eating);
  });

  const summary = {
    totalEntries: entries.length,
    avgMoodBefore: parseFloat(avgMoodBefore) || null,
    avgMoodAfter: parseFloat(avgMoodAfter) || null,
    moodImprovement: parseFloat(moodImprovement) || null,
    totalWaterGlasses,
    avgWaterPerDay: entries.length > 0 ? (totalWaterGlasses / Object.keys(byDay).length).toFixed(1) : 0,
    daysTracked: Object.keys(byDay).length,
    byDay: Object.entries(byDay).map(([date, data]) => ({
      date,
      entries: data.entries,
      waterGlasses: data.water,
      avgMoodBefore: data.moodBefore.length > 0 ? (data.moodBefore.reduce((a, b) => a + b, 0) / data.moodBefore.length).toFixed(1) : null,
      avgMoodAfter: data.moodAfter.length > 0 ? (data.moodAfter.reduce((a, b) => a + b, 0) / data.moodAfter.length).toFixed(1) : null,
    }))
  };

  res.json(summary);
});

// GET /api/diary/insights - Get mood pattern insights over time
router.get('/insights', authenticateToken, requirePro, (req, res) => {
  const db = getDb();
  const entries = db.prepare(`
    SELECT entry_date, mood_before_eating, mood_after_eating, food_description, location, water_glasses
    FROM food_mood_entries
    WHERE client_id = ?
    ORDER BY entry_date DESC
    LIMIT 90
  `).all(req.user.clientId);

  // Analyze mood triggers - identify patterns
  const locationMoods = {};
  const foodMoods = {};

  entries.forEach(e => {
    if (e.location && e.mood_before_eating) {
      if (!locationMoods[e.location]) locationMoods[e.location] = [];
      locationMoods[e.location].push({
        moodBefore: e.mood_before_eating,
        moodAfter: e.mood_after_eating
      });
    }

    if (e.food_description && e.mood_after_eating) {
      const foodType = e.food_description.split(/\s+/)[0].toLowerCase();
      if (!foodMoods[foodType]) foodMoods[foodType] = [];
      foodMoods[foodType].push({
        moodBefore: e.mood_before_eating,
        moodAfter: e.mood_after_eating
      });
    }
  });

  // Calculate average moods by location
  const locationInsights = Object.entries(locationMoods).map(([location, moods]) => {
    const avgBefore = (moods.reduce((sum, m) => sum + m.moodBefore, 0) / moods.length).toFixed(1);
    const avgAfter = (moods.reduce((sum, m) => sum + (m.moodAfter || 0), 0) / moods.length).toFixed(1);
    return {
      location,
      avgMoodBefore: parseFloat(avgBefore),
      avgMoodAfter: parseFloat(avgAfter),
      moodShift: parseFloat((avgAfter - avgBefore).toFixed(1)),
      count: moods.length
    };
  }).sort((a, b) => Math.abs(b.moodShift) - Math.abs(a.moodShift));

  // Calculate average moods by food type
  const foodInsights = Object.entries(foodMoods).map(([food, moods]) => {
    const avgBefore = (moods.reduce((sum, m) => sum + (m.moodBefore || 0), 0) / moods.length).toFixed(1);
    const avgAfter = (moods.reduce((sum, m) => sum + m.moodAfter, 0) / moods.length).toFixed(1);
    return {
      food,
      avgMoodBefore: parseFloat(avgBefore) || null,
      avgMoodAfter: parseFloat(avgAfter),
      moodShift: parseFloat((avgAfter - (avgBefore || 0)).toFixed(1)),
      count: moods.length
    };
  }).sort((a, b) => Math.abs(b.moodShift) - Math.abs(a.moodShift));

  // Overall trends
  const moodBefores = entries.filter(e => e.mood_before_eating).map(e => e.mood_before_eating);
  const moodAfters = entries.filter(e => e.mood_after_eating).map(e => e.mood_after_eating);
  const overallAvgBefore = moodBefores.length > 0 ? (moodBefores.reduce((a, b) => a + b, 0) / moodBefores.length).toFixed(1) : null;
  const overallAvgAfter = moodAfters.length > 0 ? (moodAfters.reduce((a, b) => a + b, 0) / moodAfters.length).toFixed(1) : null;

  const insights = {
    totalEntries: entries.length,
    daysOfData: new Set(entries.map(e => e.entry_date)).size,
    overallAvgMoodBefore: parseFloat(overallAvgBefore) || null,
    overallAvgMoodAfter: parseFloat(overallAvgAfter) || null,
    overallMoodShift: overallAvgBefore && overallAvgAfter ? parseFloat((overallAvgAfter - overallAvgBefore).toFixed(1)) : null,
    bestLocations: locationInsights.slice(0, 5),
    bestFoods: foodInsights.filter(f => f.moodShift > 0).slice(0, 5),
    foodsToAvoid: foodInsights.filter(f => f.moodShift < 0).slice(0, 5)
  };

  res.json(insights);
});

module.exports = router;

// ── Simple diary endpoints for ClientFoodDiary (no requirePro) ────────────────

// GET /api/diary/:date — get entry for a specific date
router.get('/:date', authenticateToken, (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  if (!clientId) return res.status(403).json({ error: 'Clients only' });
  const entry = db.prepare(`SELECT * FROM food_mood_entries WHERE client_id = ? AND entry_date = ? ORDER BY created_at DESC LIMIT 1`).get(clientId, req.params.date);
  res.json(entry || null);
});

// POST /api/diary — save or update a full day diary entry
router.post('/', authenticateToken, (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  if (!clientId) return res.status(403).json({ error: 'Clients only' });
  const { date, meals, water_glasses, mood_before, mood_after, notes } = req.body;
  if (!date) return res.status(400).json({ error: 'date required' });
  try {
    const existing = db.prepare(`SELECT id FROM food_mood_entries WHERE client_id = ? AND entry_date = ?`).get(clientId, date);
    if (existing) {
      db.prepare(`UPDATE food_mood_entries SET food_description = ?, water_glasses = ?, mood_before_eating = ?, mood_after_eating = ?, reflection_notes = ?, updated_at = datetime('now') WHERE id = ?`)
        .run(meals || null, water_glasses || 0, mood_before || null, mood_after || null, notes || null, existing.id);
      res.json({ id: existing.id, message: 'Updated' });
    } else {
      const result = db.prepare(`INSERT INTO food_mood_entries (client_id, entry_date, food_description, water_glasses, mood_before_eating, mood_after_eating, reflection_notes) VALUES (?, ?, ?, ?, ?, ?, ?)`)
        .run(clientId, date, meals || null, water_glasses || 0, mood_before || null, mood_after || null, notes || null);
      res.json({ id: result.lastInsertRowid, message: 'Created' });
    }
  } catch(e) { res.status(500).json({ error: 'Failed to save' }); }
});
