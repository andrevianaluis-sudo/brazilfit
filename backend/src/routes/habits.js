const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Get habit logs for a client
router.get('/:clientId', (req, res) => {
  const db = getDb();
  const clientId = parseInt(req.params.clientId);

  if (req.user.role === 'client' && req.user.clientId !== clientId) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const isPro = req.user.isPro || req.user.role === 'pt';
  const limit = isPro ? 30 : 7;

  const logs = db.prepare(`
    SELECT * FROM habit_logs WHERE client_id = ? ORDER BY log_date DESC LIMIT ?
  `).all(clientId, limit);

  // Calculate streak
  const allLogs = db.prepare('SELECT log_date FROM habit_logs WHERE client_id = ? ORDER BY log_date DESC').all(clientId);
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  for (let i = 0; i < allLogs.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    const expectedStr = expected.toISOString().split('T')[0];
    if (allLogs[i]?.log_date === expectedStr) {
      streak++;
    } else {
      break;
    }
  }

  // Weekly averages (including new health metrics)
  const weekLogs = logs.slice(0, 7);
  const avgWater = weekLogs.length ? (weekLogs.reduce((s, l) => s + (l.water_glasses || 0), 0) / weekLogs.length).toFixed(1) : 0;
  const avgSleep = weekLogs.length ? (weekLogs.reduce((s, l) => s + (l.sleep_hours || 0), 0) / weekLogs.length).toFixed(1) : 0;
  const avgSteps = weekLogs.length ? Math.round(weekLogs.reduce((s, l) => s + (l.steps || 0), 0) / weekLogs.length) : 0;
  const avgVeg = weekLogs.length ? (weekLogs.reduce((s, l) => s + (l.veg_portions || 0), 0) / weekLogs.length).toFixed(1) : 0;
  const avgHeartRate = weekLogs.length ? Math.round(weekLogs.reduce((s, l) => s + (l.resting_heart_rate || 0), 0) / weekLogs.length) : 0;
  const avgHRV = weekLogs.length ? Math.round(weekLogs.reduce((s, l) => s + (l.hrv || 0), 0) / weekLogs.length) : 0;
  const avgEnergy = weekLogs.length ? (weekLogs.reduce((s, l) => s + (l.energy_score || 0), 0) / weekLogs.length).toFixed(1) : 0;
  const avgSpO2 = weekLogs.length ? Math.round(weekLogs.reduce((s, l) => s + (l.blood_oxygen || 0), 0) / weekLogs.length) : 0;
  const avgStress = weekLogs.length ? (weekLogs.reduce((s, l) => s + (l.stress_level || 0), 0) / weekLogs.length).toFixed(1) : 0;
  const avgActiveMin = weekLogs.length ? Math.round(weekLogs.reduce((s, l) => s + (l.active_minutes || 0), 0) / weekLogs.length) : 0;
  const avgNutrition = weekLogs.length ? (weekLogs.reduce((s, l) => s + (l.nutrition_score || 0), 0) / weekLogs.length).toFixed(1) : 0;
  const avgWellness = weekLogs.length ? (weekLogs.reduce((s, l) => s + (l.wellness_score || 0), 0) / weekLogs.length).toFixed(1) : 0;

  // Today's log
  const todayLog = logs.find(l => l.log_date === today) || null;

  res.json({
    logs,
    streak,
    todayLog,
    weeklyAverages: {
      water: avgWater,
      sleep: avgSleep,
      steps: avgSteps,
      veg: avgVeg,
      heartRate: avgHeartRate,
      hrv: avgHRV,
      energy: avgEnergy,
      bloodOxygen: avgSpO2,
      stress: avgStress,
      activeMinutes: avgActiveMin,
      nutrition: avgNutrition,
      wellness: avgWellness
    },
  });
});

// Log or update today's habits
router.post('/', (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  if (!clientId) return res.status(403).json({ error: 'Clients only' });

  const isPro = req.user.isPro;
  const {
    log_date, water_glasses, sleep_hours, steps, veg_portions, alcohol_free, mood_rating, notes,
    resting_heart_rate, hrv, energy_score, blood_oxygen, stress_level, active_minutes, nutrition_score, wellness_score
  } = req.body;

  const today = log_date || new Date().toISOString().split('T')[0];
  const existing = db.prepare('SELECT id FROM habit_logs WHERE client_id = ? AND log_date = ?').get(clientId, today);

  // Calculate wellness score if not provided
  const calcWellness = wellness_score || (() => {
    const metrics = [
      (sleep_hours || 0) / 8 * 10,
      energy_score || 0,
      (steps || 0) / 10000 * 10,
      (veg_portions || 0) / 5 * 10,
      (100 - (stress_level || 5)) / 10,
      (active_minutes || 0) / 60 * 10,
      nutrition_score || 0
    ];
    const valid = metrics.filter(m => m > 0);
    return valid.length ? (valid.reduce((a, b) => a + b, 0) / valid.length) : 50;
  })();

  if (existing) {
    db.prepare(`
      UPDATE habit_logs SET water_glasses = ?, sleep_hours = ?, steps = ?, veg_portions = ?,
        alcohol_free = ?, mood_rating = ?, notes = ?, resting_heart_rate = ?, hrv = ?, energy_score = ?,
        blood_oxygen = ?, stress_level = ?, active_minutes = ?, nutrition_score = ?, wellness_score = ?
      WHERE id = ?
    `).run(
      water_glasses || 0,
      isPro ? (sleep_hours || 0) : null,
      steps || 0,
      isPro ? (veg_portions || 0) : null,
      isPro ? (alcohol_free ? 1 : 0) : null,
      isPro ? (mood_rating || 3) : null,
      notes || null,
      resting_heart_rate || null,
      hrv || null,
      energy_score || null,
      blood_oxygen || null,
      stress_level || null,
      active_minutes || null,
      nutrition_score || null,
      calcWellness,
      existing.id
    );
    return res.json({ id: existing.id, message: 'Habits updated' });
  }

  const result = db.prepare(`
    INSERT INTO habit_logs (client_id, log_date, water_glasses, sleep_hours, steps, veg_portions, alcohol_free, mood_rating, notes,
      resting_heart_rate, hrv, energy_score, blood_oxygen, stress_level, active_minutes, nutrition_score, wellness_score)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    clientId, today,
    water_glasses || 0,
    isPro ? (sleep_hours || 0) : 0,
    steps || 0,
    isPro ? (veg_portions || 0) : 0,
    isPro ? (alcohol_free ? 1 : 0) : 0,
    isPro ? (mood_rating || 3) : 3,
    notes || null,
    resting_heart_rate || null,
    hrv || null,
    energy_score || null,
    blood_oxygen || null,
    stress_level || null,
    active_minutes || null,
    nutrition_score || null,
    calcWellness
  );

  res.json({ id: result.lastInsertRowid, message: 'Habits logged' });
});

// Leaderboard (opt-in)
router.get('/leaderboard/streaks', (req, res) => {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];

  const clients = db.prepare(`
    SELECT c.id, u.name,
           COUNT(hl.id) as total_logs,
           MAX(hl.log_date) as last_log
    FROM clients c
    JOIN users u ON c.user_id = u.id
    LEFT JOIN habit_logs hl ON hl.client_id = c.id
    WHERE u.is_active = 1
    GROUP BY c.id
    ORDER BY total_logs DESC
    LIMIT 10
  `).all();

  res.json(clients);
});

module.exports = router;
