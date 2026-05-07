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

// Helper: Get ISO week number for a date (YYYY-W##)
function getISOWeek(date) {
  const d = new Date(date);
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

// Helper: Get the Monday of a given ISO week
function getMondayOfWeek(isoWeek) {
  const [year, week] = isoWeek.split('-W');
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const dayNum = yearStart.getUTCDay() || 7;
  const adjustedStart = new Date(Date.UTC(year, 0, 1 + (4 - dayNum)));
  const weekStart = new Date(Date.UTC(year, 0, adjustedStart.getUTCDate() + (parseInt(week) - 1) * 7));
  return weekStart.toISOString().split('T')[0];
}

// GET /api/checkins/current - Get this week's check-in (if completed)

// Add rich checkin columns migration
try { db.exec('ALTER TABLE weekly_checkins ADD COLUMN wins TEXT'); } catch(e) {}
try { db.exec('ALTER TABLE weekly_checkins ADD COLUMN challenges TEXT'); } catch(e) {}
try { db.exec('ALTER TABLE weekly_checkins ADD COLUMN next_week_goals TEXT'); } catch(e) {}
try { db.exec('ALTER TABLE weekly_checkins ADD COLUMN workouts_felt TEXT'); } catch(e) {}
try { db.exec('ALTER TABLE weekly_checkins ADD COLUMN overall_mood TEXT'); } catch(e) {}
try { db.exec('ALTER TABLE weekly_checkins ADD COLUMN motivation_score INTEGER'); } catch(e) {}
try { db.exec('ALTER TABLE weekly_checkins ADD COLUMN stress_score INTEGER'); } catch(e) {}
try { db.exec('ALTER TABLE weekly_checkins ADD COLUMN goals_last_week TEXT'); } catch(e) {}
try { db.exec('ALTER TABLE weekly_checkins ADD COLUMN goals_achieved INTEGER'); } catch(e) {}
try { db.exec('ALTER TABLE weekly_checkins ADD COLUMN insight TEXT'); } catch(e) {}
try { db.exec('ALTER TABLE weekly_checkins ADD COLUMN sleep_hours REAL'); } catch(e) {}
try { db.exec('ALTER TABLE weekly_checkins ADD COLUMN water_glasses INTEGER'); } catch(e) {}
try { db.exec('ALTER TABLE weekly_checkins ADD COLUMN daily_steps INTEGER'); } catch(e) {}

router.get('/current', authenticateToken, requirePro, (req, res) => {
  const db = getDb();
  const currentWeek = getISOWeek(new Date().toISOString().split('T')[0]);

  const checkin = db.prepare(`
    SELECT * FROM weekly_checkins
    WHERE client_id = ? AND checkin_week = ?
  `).get(req.user.clientId, currentWeek);

  if (!checkin) {
    return res.json({ checkin: null, currentWeek, mondayDate: getMondayOfWeek(currentWeek) });
  }

  res.json({ checkin, currentWeek });
});

// POST /api/checkins/submit - Submit weekly check-in form
router.post('/submit', authenticateToken, requirePro, (req, res) => {
  const { checkin_week, mood_rating, nutrition_goals_hit, injuries_concerns, energy_level, sleep_quality, what_went_well, what_was_challenging, wins, challenges, next_week_goals, workouts_felt, overall_mood, motivation_score, stress_score, goals_last_week, goals_achieved, insight, sleep_hours, water_glasses, daily_steps } = req.body;

  if (!checkin_week) {
    return res.status(400).json({ error: 'checkin_week required' });
  }

  const db = getDb();
  const today = new Date().toISOString().split('T')[0];

  try {
    // Check if already submitted this week
    const existing = db.prepare(`
      SELECT id FROM weekly_checkins
      WHERE client_id = ? AND checkin_week = ?
    `).get(req.user.clientId, checkin_week);

    if (existing) {
      // Update existing
      db.prepare(`
        UPDATE weekly_checkins
        SET mood_rating = ?, nutrition_goals_hit = ?, injuries_concerns = ?, energy_level = ?, sleep_quality = ?, what_went_well = ?, what_was_challenging = ?, wins = ?, challenges = ?, next_week_goals = ?, workouts_felt = ?, overall_mood = ?, motivation_score = ?, stress_score = ?, goals_last_week = ?, goals_achieved = ?, insight = ?, sleep_hours = ?, water_glasses = ?, daily_steps = ?, checkin_date = ?, updated_at = ?
        WHERE id = ?
      `).run(
        mood_rating || null,
        nutrition_goals_hit || null,
        injuries_concerns || null,
        energy_level || null,
        sleep_quality || null,
        what_went_well || null,
        what_was_challenging || null,
        wins || null,
        challenges || null,
        challenges || null,
        next_week_goals || null,
        workouts_felt || null,
        overall_mood || null,
        motivation_score || null,
        stress_score || null,
        goals_last_week || null,
        goals_achieved || null,
        insight || null,
        sleep_hours || null,
        water_glasses || null,
        daily_steps || null,
        daily_steps || null,
        today,
        new Date().toISOString(),
        existing.id
      );
    }

    // Create new
    const result = db.prepare(`
      INSERT INTO weekly_checkins
      (client_id, checkin_week, checkin_date, mood_rating, nutrition_goals_hit, injuries_concerns, energy_level, sleep_quality, what_went_well, what_was_challenging, wins, challenges, next_week_goals, workouts_felt, overall_mood, motivation_score, stress_score, goals_last_week, goals_achieved, insight, sleep_hours, water_glasses, daily_steps)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.user.clientId,
      checkin_week,
      today,
      mood_rating || null,
      nutrition_goals_hit || null,
      injuries_concerns || null,
      energy_level || null,
      sleep_quality || null,
      what_went_well || null,
      what_went_well || null,
      what_was_challenging || null,
      wins || null,
      challenges || null,
      next_week_goals || null,
      workouts_felt || null,
      overall_mood || null,
      motivation_score || null,
      stress_score || null,
      goals_last_week || null,
      goals_achieved || null,
      insight || null,
      sleep_hours || null,
      water_glasses || null,
      daily_steps || null
    );

  } catch (err) {
    res.status(500).json({ error: 'Failed to submit check-in' });
  }
});

// PUT /api/checkins/:id - PT updates response/note
router.put('/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'pt') {
    return res.status(403).json({ error: 'PT only' });
  }

  const db = getDb();
  const checkin = db.prepare('SELECT client_id FROM weekly_checkins WHERE id = ?').get(req.params.id);

  if (!checkin) {
    return res.status(404).json({ error: 'Check-in not found' });
  }

  const { pt_response } = req.body;

  try {
    db.prepare(`
      UPDATE weekly_checkins
      SET pt_response = ?, pt_responded_at = ?, updated_at = ?
      WHERE id = ?
    `).run(
      pt_response || null,
      pt_response ? new Date().toISOString() : null,
      new Date().toISOString(),
      req.params.id
    );

    res.json({ message: 'Check-in response updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update check-in' });
  }
});

// GET /api/checkins/history - Get all past check-ins for client
router.get('/history', authenticateToken, requirePro, (req, res) => {
  const db = getDb();
  const checkins = db.prepare(`
    SELECT * FROM weekly_checkins
    WHERE client_id = ?
    ORDER BY checkin_week DESC
  `).all(req.user.clientId);

  res.json({ checkins });
});

// GET /api/pt/checkins/summary - PT views all clients' check-ins for the current week
router.get('/pt/summary', authenticateToken, (req, res) => {
  if (req.user.role !== 'pt') {
    return res.status(403).json({ error: 'PT only' });
  }

  const db = getDb();
  const currentWeek = getISOWeek(new Date().toISOString().split('T')[0]);

  // Get all clients for this PT
  const clients = db.prepare(`
    SELECT c.id, c.user_id, u.name FROM clients c
    JOIN users u ON u.id = c.user_id
    WHERE c.pt_id = ?
    ORDER BY u.name ASC
  `).all(req.user.id);

  // Get check-ins for all clients for current + past 3 weeks
  const threeWeeksAgo = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const threeWeeksAgoISOWeek = getISOWeek(threeWeeksAgo);

  const checkinSummary = clients.map(client => {
    const checkins = db.prepare(`
      SELECT checkin_week, checkin_date, mood_rating, nutrition_goals_hit, energy_level, sleep_quality, what_went_well, what_was_challenging, wins, challenges, next_week_goals, workouts_felt, overall_mood, motivation_score, stress_score, goals_last_week, goals_achieved, insight, sleep_hours, water_glasses, daily_steps, pt_responded_at
      FROM weekly_checkins
      WHERE client_id = ? AND checkin_week >= ?
      ORDER BY checkin_week DESC
      LIMIT 4
    `).all(client.id, threeWeeksAgoISOWeek);

    return {
      clientId: client.id,
      clientName: client.name,
      latestCheckin: checkins[0] || null,
      hasResponded: checkins[0]?.pt_responded_at ? true : false,
      pastCheckins: checkins
    };
  });

  res.json({
    currentWeek,
    summary: checkinSummary
  });
});

module.exports = router;

router.delete('/client/:clientId/week/:week', authenticateToken, (req, res) => { if (req.user.role !== 'pt') return res.status(403).json({error:'PT only'}); const db = getDb(); const r = db.prepare('DELETE FROM weekly_checkins WHERE client_id = ? AND checkin_week = ?').run(req.params.clientId, req.params.week); res.json({deleted: r.changes}); });
