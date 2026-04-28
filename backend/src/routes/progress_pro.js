const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

// Require Pro for all routes
function requirePro(req, res, next) {
  if (!req.user?.isPro) {
    return res.status(403).json({ error: 'Pro feature required' });
  }
  next();
}

// ── MEASUREMENTS ────────────────────────────────────────────────────────────

// GET /api/progress/measurements - Get all measurements for client
router.get('/measurements', authenticateToken, requirePro, (req, res) => {
  const db = getDb();
  const measurements = db.prepare(`
    SELECT * FROM progress_measurements
    WHERE client_id = ?
    ORDER BY tracking_date DESC
  `).all(req.user.clientId);

  res.json({ measurements });
});

// POST /api/progress/measurements - Log new measurement
router.post('/measurements', authenticateToken, requirePro, (req, res) => {
  const { tracking_date, weight_kg, waist_cm, hips_cm, chest_cm, arms_cm, notes } = req.body;

  if (!tracking_date) {
    return res.status(400).json({ error: 'tracking_date required' });
  }

  const db = getDb();
  try {
    const result = db.prepare(`
      INSERT INTO progress_measurements
      (client_id, tracking_date, weight_kg, waist_cm, hips_cm, chest_cm, arms_cm, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.user.clientId,
      tracking_date,
      weight_kg || null,
      waist_cm || null,
      hips_cm || null,
      chest_cm || null,
      arms_cm || null,
      notes || null
    );

    res.json({ id: result.lastInsertRowid, message: 'Measurement logged' });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Measurement already exists for this date' });
    }
    res.status(500).json({ error: 'Failed to log measurement' });
  }
});

// GET /api/progress/summary - Month-by-month comparison
router.get('/summary', authenticateToken, requirePro, (req, res) => {
  const db = getDb();
  const measurements = db.prepare(`
    SELECT tracking_date, weight_kg FROM progress_measurements
    WHERE client_id = ?
    ORDER BY tracking_date DESC
    LIMIT 365
  `).all(req.user.clientId);

  // Group by month and calculate average
  const byMonth = {};
  measurements.forEach(m => {
    const [year, month] = m.tracking_date.split('-').slice(0, 2);
    const monthKey = `${year}-${month}`;
    if (!byMonth[monthKey]) byMonth[monthKey] = [];
    if (m.weight_kg) byMonth[monthKey].push(m.weight_kg);
  });

  const summary = Object.entries(byMonth).map(([month, weights]) => ({
    month,
    avg_weight: weights.length > 0 ? (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1) : null,
    min_weight: weights.length > 0 ? Math.min(...weights) : null,
    max_weight: weights.length > 0 ? Math.max(...weights) : null,
    count: weights.length
  }));

  res.json({ summary: summary.reverse() });
});

// ── PT DASHBOARD ────────────────────────────────────────────────────────────

// GET /api/pt/clients/:clientId/progress - PT views client progress
router.get('/pt/clients/:clientId', authenticateToken, (req, res) => {
  if (req.user.role !== 'pt') {
    return res.status(403).json({ error: 'PT only' });
  }

  const db = getDb();
  const { clientId } = req.params;

  // Get client
  const client = db.prepare(`
    SELECT u.name FROM users u
    JOIN clients c ON c.user_id = u.id
    WHERE c.id = ?
  `).get(clientId);

  if (!client) {
    return res.status(404).json({ error: 'Client not found' });
  }

  // Get latest measurements
  const latest = db.prepare(`
    SELECT * FROM progress_measurements
    WHERE client_id = ?
    ORDER BY tracking_date DESC
    LIMIT 1
  `).get(clientId);

  // Get progress over time
  const history = db.prepare(`
    SELECT tracking_date, weight_kg FROM progress_measurements
    WHERE client_id = ?
    ORDER BY tracking_date DESC
    LIMIT 100
  `).all(clientId);

  // Get photos
  const photos = db.prepare(`
    SELECT * FROM progress_photos
    WHERE client_id = ?
    ORDER BY photo_date DESC
  `).all(clientId);

  res.json({ client, latest, history, photos });
});

module.exports = router;
