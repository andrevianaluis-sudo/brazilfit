// backend/src/routes/exercises.js
// Replace your existing exercises.js with this version
const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

// Stretching muscle group categories (stored in muscle_groups column)
const STRETCHING_MUSCLE_GROUPS = ['Neck', 'Shoulders', 'Back', 'Hips', 'Thighs', 'Calves',
  'Forearms', 'Waist', 'Chest', 'Upper Arms', 'Articulations', 'Pilates', 'Yoga', 'Full Body'];

// GET /api/exercises
router.get('/', authenticateToken, (req, res) => {
  const db = getDb();
  const { search, category, muscle_group, limit = 30, offset = 0 } = req.query;

  let where = [];
  let params = [];

  if (search) {
    where.push('(e.name LIKE ? OR e.muscle_groups LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  // Category filter — if it's a stretching muscle group, filter by muscle_groups instead
  if (category) {
    if (STRETCHING_MUSCLE_GROUPS.includes(category)) {
      // Filter stretching exercises by their muscle_groups field
      where.push('(e.category = ? OR e.muscle_groups LIKE ?)');
      params.push('Stretching', `%${category}%`);
    } else {
      where.push('e.category = ?');
      params.push(category);
    }
  }

  if (muscle_group) {
    where.push('e.muscle_groups LIKE ?');
    params.push(`%${muscle_group}%`);
  }

  const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

  // Count total
  const countRow = db.prepare(`SELECT COUNT(*) as total FROM exercises e ${whereClause}`).get(...params);
  const total = countRow.total;

  // Fetch exercises
  const exercises = db.prepare(`
    SELECT e.* FROM exercises e
    ${whereClause}
    ORDER BY
      CASE WHEN e.gif_url IS NOT NULL AND e.gif_url != '' THEN 0 ELSE 1 END,
      e.name ASC
    LIMIT ? OFFSET ?
  `).all(...params, parseInt(limit), parseInt(offset));

  res.json({ exercises, total });
});

// GET /api/exercises/stretching/all — legacy endpoint for stretching only
router.get('/stretching/all', authenticateToken, (req, res) => {
  const db = getDb();
  const exercises = db.prepare(`
    SELECT * FROM exercises
    WHERE category = 'Stretching'
    ORDER BY muscle_groups, name
  `).all();
  res.json(exercises);
});

// GET /api/exercises/:id
router.get('/:id', authenticateToken, (req, res) => {
  const db = getDb();
  const exercise = db.prepare('SELECT * FROM exercises WHERE id = ?').get(req.params.id);
  if (!exercise) return res.status(404).json({ error: 'Exercise not found' });
  res.json(exercise);
});

// POST /api/exercises — PT creates exercise
router.post('/', authenticateToken, (req, res) => {
  const db = getDb();
  const { name, category, muscle_groups, difficulty, equipment, youtube_video_id,
    sets_reps, instructions, common_mistakes, pro_tips, gif_url } = req.body;

  if (!name) return res.status(400).json({ error: 'Name required' });

  const result = db.prepare(`
    INSERT INTO exercises (name, category, muscle_groups, difficulty, equipment,
      youtube_video_id, sets_reps, instructions, common_mistakes, pro_tips, gif_url, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name, category || 'Other', muscle_groups || '', difficulty || 'intermediate',
    equipment || 'bodyweight', youtube_video_id || null, sets_reps || '3x10',
    instructions || '', common_mistakes || '', pro_tips || '', gif_url || null, req.user.id);

  res.status(201).json({ id: result.lastInsertRowid });
});

// PUT /api/exercises/:id
router.put('/:id', authenticateToken, (req, res) => {
  const db = getDb();
  const { name, category, muscle_groups, difficulty, equipment, youtube_video_id,
    sets_reps, instructions, common_mistakes, pro_tips, gif_url } = req.body;

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
      pro_tips = COALESCE(?, pro_tips),
      gif_url = COALESCE(?, gif_url)
    WHERE id = ?
  `).run(name, category, muscle_groups, difficulty, equipment, youtube_video_id,
    sets_reps, instructions, common_mistakes, pro_tips, gif_url, req.params.id);

  res.json({ ok: true });
});

// DELETE /api/exercises/:id
router.delete('/:id', authenticateToken, (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM exercises WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
