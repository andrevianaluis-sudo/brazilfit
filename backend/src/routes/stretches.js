const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/stretches — list all stretching exercises with optional filters
router.get('/', authenticateToken, (req, res) => {
  const db = getDb();
  const { muscle_group, search, clientId } = req.query;

  let query = 'SELECT * FROM stretching_exercises WHERE 1=1';
  const params = [];

  if (muscle_group && muscle_group !== 'All') {
    query += ' AND muscle_group = ?';
    params.push(muscle_group);
  }

  if (search) {
    query += ' AND name LIKE ?';
    params.push(`%${search}%`);
  }

  query += ' ORDER BY muscle_group, name';

  try {
    const stretches = db.prepare(query).all(...params);
    res.json(stretches);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stretches' });
  }
});

// GET /api/stretches/muscle-groups — list all unique muscle groups
router.get('/muscle-groups', authenticateToken, (req, res) => {
  const db = getDb();

  try {
    const groups = db.prepare(`
      SELECT DISTINCT muscle_group FROM stretching_exercises
      ORDER BY muscle_group
    `).all();

    res.json(groups.map(g => g.muscle_group));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch muscle groups' });
  }
});

// GET /api/stretches/logs/:clientId — get stretch logs for client
router.get('/logs/:clientId', authenticateToken, (req, res) => {
  const db = getDb();

  try {
    const logs = db.prepare(`
      SELECT sl.*, se.name, se.muscle_group, se.gif_file
      FROM stretching_logs sl
      JOIN stretching_exercises se ON se.id = sl.stretching_exercise_id
      WHERE sl.client_id = ?
      ORDER BY sl.completed_at DESC
    `).all(req.params.clientId);

    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// GET /api/stretches/:id — single stretching exercise
router.get('/:id', authenticateToken, (req, res) => {
  const db = getDb();
  const stretch = db.prepare('SELECT * FROM stretching_exercises WHERE id = ?').get(req.params.id);
  if (!stretch) return res.status(404).json({ error: 'Not found' });
  res.json(stretch);
});

// POST /api/stretches/:id/log — log completed stretch
router.post('/:id/log', authenticateToken, (req, res) => {
  const db = getDb();
  const { clientId } = req.body;

  if (!clientId) return res.status(400).json({ error: 'clientId required' });

  try {
    const result = db.prepare(`
      INSERT INTO stretching_logs (client_id, stretching_exercise_id)
      VALUES (?, ?)
    `).run(clientId, req.params.id);

    res.status(201).json({ id: result.lastInsertRowid, ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to log stretch' });
  }
});


// TEMP: Seed stretching exercises from POST body
router.post("/seed", authenticateToken, (req, res) => {
  if (req.user.role !== "pt") return res.status(403).json({ error: "PT only" });
  const db = getDb();
  const { exercises } = req.body;
  if (!exercises || !Array.isArray(exercises)) return res.status(400).json({ error: "exercises array required" });
  const count = db.prepare("SELECT COUNT(*) as n FROM stretching_exercises").get();
  if (count.n > 0) return res.json({ message: "Already seeded", count: count.n });
  const ins = db.prepare("INSERT INTO stretching_exercises (name, muscle_group, gif_file, difficulty) VALUES (?, ?, ?, ?)");
  let inserted = 0;
  for (const ex of exercises) {
    try { ins.run(ex.name, ex.muscleGroup, ex.filename, "beginner"); inserted++; } catch(e) {}
  }
  res.json({ inserted });
});

module.exports = router;
