const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken, requirePT } = require('../middleware/auth');

// ─── PT: Create workout plan ──────────────────────────────────────────────────

// GET /api/workouts/plans — list all plans (PT sees all, client sees theirs)
router.get('/plans', authenticateToken, (req, res) => {
  const db = getDb();
  const { clientId } = req.query;

  let plans;
  if (req.user.role === 'pt') {
    plans = clientId
      ? db.prepare('SELECT wp.*, u.name as client_name FROM workout_plans wp LEFT JOIN clients c ON c.id = wp.client_id LEFT JOIN users u ON u.id = c.user_id WHERE wp.client_id = ? ORDER BY wp.created_at DESC').all(clientId)
      : db.prepare('SELECT wp.*, u.name as client_name FROM workout_plans wp LEFT JOIN clients c ON c.id = wp.client_id LEFT JOIN users u ON u.id = c.user_id ORDER BY wp.created_at DESC').all();
  } else {
    const cid = req.user.clientId;
    plans = db.prepare('SELECT * FROM workout_plans WHERE client_id = ? AND is_active = 1 ORDER BY created_at DESC').all(cid);
  }

  res.json(plans);
});

// GET /api/workouts/plans/:id — plan with days and exercises
router.get('/plans/:id', authenticateToken, (req, res) => {
  const db = getDb();
  const plan = db.prepare('SELECT wp.*, u.name as client_name FROM workout_plans wp LEFT JOIN clients c ON c.id = wp.client_id LEFT JOIN users u ON u.id = c.user_id WHERE wp.id = ?').get(req.params.id);
  if (!plan) return res.status(404).json({ error: 'Plan not found' });

  const days = db.prepare('SELECT * FROM workout_days WHERE plan_id = ? ORDER BY sort_order').all(plan.id);

  for (const day of days) {
    day.exercises = db.prepare(`
      SELECT wde.*, e.name as exercise_name, e.category, e.muscle_groups, e.difficulty, e.equipment, e.youtube_video_id, e.sets_reps as default_sets_reps
      FROM workout_day_exercises wde
      JOIN exercises e ON e.id = wde.exercise_id
      WHERE wde.day_id = ?
      ORDER BY wde.sort_order
    `).all(day.id);
  }

  plan.days = days;
  res.json(plan);
});

// POST /api/workouts/plans — PT creates a plan
router.post('/plans', authenticateToken, requirePT, (req, res) => {
  const db = getDb();
  const { client_id, name, description, days } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });

  const planResult = db.prepare(`
    INSERT INTO workout_plans (client_id, name, description, created_by)
    VALUES (?, ?, ?, ?)
  `).run(client_id || null, name, description || '', req.user.id);

  const planId = planResult.lastInsertRowid;

  if (Array.isArray(days)) {
    days.forEach((day, i) => {
      const dayResult = db.prepare(`
        INSERT INTO workout_days (plan_id, day_name, sort_order) VALUES (?, ?, ?)
      `).run(planId, day.day_name, i);

      if (Array.isArray(day.exercises)) {
        day.exercises.forEach((ex, j) => {
          db.prepare(`
            INSERT INTO workout_day_exercises (day_id, exercise_id, sets, reps, rest_seconds, notes, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).run(dayResult.lastInsertRowid, ex.exercise_id, ex.sets || 3, ex.reps || '10', ex.rest_seconds || 60, ex.notes || '', j);
        });
      }
    });
  }

  res.status(201).json({ id: planId });
});

// PUT /api/workouts/plans/:id — PT updates plan (replaces days fully)
router.put('/plans/:id', authenticateToken, requirePT, (req, res) => {
  const db = getDb();
  const { name, description, is_active, days } = req.body;

  if (name || description !== undefined || is_active !== undefined) {
    db.prepare(`
      UPDATE workout_plans SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        is_active = COALESCE(?, is_active)
      WHERE id = ?
    `).run(name || null, description ?? null, is_active ?? null, req.params.id);
  }

  if (Array.isArray(days)) {
    // Get existing days to delete their exercises
    const existingDays = db.prepare('SELECT id FROM workout_days WHERE plan_id = ?').all(req.params.id);
    for (const d of existingDays) {
      db.prepare('DELETE FROM workout_day_exercises WHERE day_id = ?').run(d.id);
    }
    db.prepare('DELETE FROM workout_days WHERE plan_id = ?').run(req.params.id);

    days.forEach((day, i) => {
      const dayResult = db.prepare(`
        INSERT INTO workout_days (plan_id, day_name, sort_order) VALUES (?, ?, ?)
      `).run(req.params.id, day.day_name, i);

      if (Array.isArray(day.exercises)) {
        day.exercises.forEach((ex, j) => {
          db.prepare(`
            INSERT INTO workout_day_exercises (day_id, exercise_id, sets, reps, rest_seconds, notes, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).run(dayResult.lastInsertRowid, ex.exercise_id, ex.sets || 3, ex.reps || '10', ex.rest_seconds || 60, ex.notes || '', j);
        });
      }
    });
  }

  res.json({ ok: true });
});

// DELETE /api/workouts/plans/:id
router.delete('/plans/:id', authenticateToken, requirePT, (req, res) => {
  const db = getDb();
  db.prepare('UPDATE workout_plans SET is_active = 0 WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ─── Client: Today's Workout ──────────────────────────────────────────────────

// GET /api/workouts/today — client's workout for today
router.get('/today', authenticateToken, (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  if (!clientId) return res.status(403).json({ error: 'Client only' });

  // Find active plan for this client
  const plan = db.prepare(`
    SELECT * FROM workout_plans WHERE client_id = ? AND is_active = 1 ORDER BY created_at DESC LIMIT 1
  `).get(clientId);

  if (!plan) return res.json({ plan: null, day: null });

  // Determine today's day based on day of week cycling through plan days
  const days = db.prepare('SELECT * FROM workout_days WHERE plan_id = ? ORDER BY sort_order').all(plan.id);
  if (!days.length) return res.json({ plan, day: null });

  // Use day of week to select which day in the plan (0=Mon, 1=Tue, etc → cycle through plan days)
  const dow = new Date().getDay(); // 0=Sun, 1=Mon...
  // Map Sun=0 to index 6, Mon=1 to 0, etc. so week starts Monday
  const weekIndex = dow === 0 ? 6 : dow - 1;
  const dayIndex = weekIndex % days.length;
  const today = days[dayIndex];

  today.exercises = db.prepare(`
    SELECT wde.*, e.name as exercise_name, e.category, e.muscle_groups, e.difficulty, e.equipment, e.youtube_video_id, e.sets_reps as default_sets_reps, e.instructions, e.common_mistakes, e.pro_tips
    FROM workout_day_exercises wde
    JOIN exercises e ON e.id = wde.exercise_id
    WHERE wde.day_id = ?
    ORDER BY wde.sort_order
  `).all(today.id);

  // Check if already logged today
  const today_date = new Date().toISOString().split('T')[0];
  const alreadyLogged = db.prepare(`
    SELECT id FROM workout_session_logs
    WHERE client_id = ? AND workout_day_id = ? AND DATE(started_at) = ?
  `).get(clientId, today.id, today_date);

  res.json({ plan, day: today, alreadyLogged: alreadyLogged ? true : false });
});

// ─── Client: Log workout session ─────────────────────────────────────────────

// POST /api/workouts/log — client logs a completed workout
router.post('/log', authenticateToken, (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  if (!clientId) return res.status(403).json({ error: 'Client only' });

  const { workout_day_id, exercises_completed, notes, session_id } = req.body;

  const result = db.prepare(`
    INSERT INTO workout_session_logs (client_id, session_id, workout_day_id, completed_at, exercises_completed, notes)
    VALUES (?, ?, ?, datetime('now'), ?, ?)
  `).run(clientId, session_id || null, workout_day_id || null, JSON.stringify(exercises_completed || []), notes || '');

  res.status(201).json({ id: result.lastInsertRowid });
});

// GET /api/workouts/logs — client's workout history
router.get('/logs', authenticateToken, (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  if (!clientId) return res.status(403).json({ error: 'Client only' });

  const logs = db.prepare(`
    SELECT wsl.*, wd.day_name, wp.name as plan_name
    FROM workout_session_logs wsl
    LEFT JOIN workout_days wd ON wd.id = wsl.workout_day_id
    LEFT JOIN workout_plans wp ON wp.id = wd.plan_id
    WHERE wsl.client_id = ?
    ORDER BY wsl.created_at DESC
    LIMIT 30
  `).all(clientId);

  res.json(logs);
});

module.exports = router;
