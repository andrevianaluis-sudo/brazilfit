const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken, requirePT } = require('../middleware/auth');

// GET /api/exercises/stretching — list all stretching exercises
// Strength exercises hidden until GIFs are added
router.get('/stretching/all', authenticateToken, (req, res) => {
  const db = getDb();
  try {
    const stretchingCategories = ['Neck', 'Shoulders', 'Back', 'Arms', 'Chest', 'Hips', 'Legs', 'Calves', 'Full Body', 'Stretching'];
    const placeholders = stretchingCategories.map(() => '?').join(',');
    const query = `
      SELECT e.*, 'stretching' as type
      FROM exercises e
      WHERE e.equipment = 'bodyweight' AND e.category IN (${placeholders})
      ORDER BY e.category, e.name
    `;
    const stretches = db.prepare(query).all(...stretchingCategories);
    res.json(stretches);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stretching exercises' });
  }
});

// GET /api/exercises — list all exercises (with optional filters)
router.get('/', authenticateToken, (req, res) => {
  const db = getDb();
  const { category, equipment, difficulty, search, clientId } = req.query;

  let query = `
    SELECT e.*,
      CASE WHEN ef.id IS NOT NULL THEN 1 ELSE 0 END as is_favorite
    FROM exercises e
    LEFT JOIN exercise_favorites ef ON ef.exercise_id = e.id AND ef.client_id = ?
    WHERE 1=1
  `;
  const params = [clientId || null];

  if (category) { query += ' AND e.category = ?'; params.push(category); }
  if (equipment) { query += ' AND e.equipment = ?'; params.push(equipment); }
  if (difficulty) { query += ' AND e.difficulty = ?'; params.push(difficulty); }
  if (search) { query += ' AND e.name LIKE ?'; params.push(`%${search}%`); }

  query += ' ORDER BY e.category, e.name';

  try {
    const exercises = db.prepare(query).all(...params);
    res.json(exercises);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
});

// GET /api/exercises/:id — single exercise
router.get('/:id', authenticateToken, (req, res) => {
  const db = getDb();
  const exercise = db.prepare('SELECT * FROM exercises WHERE id = ?').get(req.params.id);
  if (!exercise) return res.status(404).json({ error: 'Not found' });
  res.json(exercise);
});

// POST /api/exercises — PT creates new exercise
router.post('/', authenticateToken, requirePT, (req, res) => {
  const db = getDb();
  const { name, category, muscle_groups, difficulty, equipment, youtube_video_id, sets_reps, instructions, common_mistakes, pro_tips } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });

  const result = db.prepare(`
    INSERT INTO exercises (name, category, muscle_groups, difficulty, equipment, youtube_video_id, sets_reps, instructions, common_mistakes, pro_tips, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    name,
    category || 'Full Body',
    JSON.stringify(muscle_groups || []),
    difficulty || 'beginner',
    equipment || 'bodyweight',
    youtube_video_id || null,
    sets_reps || '3x10',
    JSON.stringify(instructions || []),
    JSON.stringify(common_mistakes || []),
    JSON.stringify(pro_tips || []),
    req.user.id
  );

  const created = db.prepare('SELECT * FROM exercises WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(created);
});

// PUT /api/exercises/:id — PT updates exercise
router.put('/:id', authenticateToken, requirePT, (req, res) => {
  const db = getDb();
  const { name, category, muscle_groups, difficulty, equipment, youtube_video_id, sets_reps, instructions, common_mistakes, pro_tips } = req.body;

  db.prepare(`
    UPDATE exercises SET
      name = COALESCE(?, name),
      category = COALESCE(?, category),
      muscle_groups = COALESCE(?, muscle_groups),
      difficulty = COALESCE(?, difficulty),
      equipment = COALESCE(?, equipment),
      youtube_video_id = COALESCE(?, youtube_video_id),
      sets_reps = COALESCE(?, sets_reps),
      instructions = COALESCE(?, instructions),
      common_mistakes = COALESCE(?, common_mistakes),
      pro_tips = COALESCE(?, pro_tips)
    WHERE id = ?
  `).run(
    name || null,
    category || null,
    muscle_groups ? JSON.stringify(muscle_groups) : null,
    difficulty || null,
    equipment || null,
    youtube_video_id || null,
    sets_reps || null,
    instructions ? JSON.stringify(instructions) : null,
    common_mistakes ? JSON.stringify(common_mistakes) : null,
    pro_tips ? JSON.stringify(pro_tips) : null,
    req.params.id
  );

  res.json({ ok: true });
});

// POST /api/exercises/:id/favorite — toggle favorite
router.post('/:id/favorite', authenticateToken, (req, res) => {
  const db = getDb();
  const { clientId } = req.body;
  if (!clientId) return res.status(400).json({ error: 'clientId required' });

  const existing = db.prepare('SELECT id FROM exercise_favorites WHERE client_id = ? AND exercise_id = ?').get(clientId, req.params.id);
  if (existing) {
    db.prepare('DELETE FROM exercise_favorites WHERE client_id = ? AND exercise_id = ?').run(clientId, req.params.id);
    res.json({ favorited: false });
  } else {
    db.prepare('INSERT INTO exercise_favorites (client_id, exercise_id) VALUES (?, ?)').run(clientId, req.params.id);
    res.json({ favorited: true });
  }
});

module.exports = router;
