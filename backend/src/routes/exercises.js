const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

const STRETCHING_MUSCLE_GROUPS = ['Neck', 'Shoulders', 'Back', 'Hips', 'Thighs', 'Calves',
  'Forearms', 'Waist', 'Chest', 'Upper Arms', 'Articulations', 'Pilates', 'Yoga', 'Full Body'];

router.get('/', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const { search, category, limit = 30, offset = 0 } = req.query;
    let conditions = [];
    let queryParams = [];
    if (search) {
      conditions.push('(e.name LIKE ? OR e.muscle_groups LIKE ?)');
      queryParams.push('%' + search + '%', '%' + search + '%');
    }
    if (category) {
      if (STRETCHING_MUSCLE_GROUPS.includes(category)) {
        conditions.push('(e.category = ? OR e.muscle_groups LIKE ?)');
        queryParams.push('Stretching', '%' + category + '%');
      } else {
        conditions.push('e.category = ?');
        queryParams.push(category);
      }
    }
    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    const limitNum = parseInt(limit) || 30;
    const offsetNum = parseInt(offset) || 0;
    const countParams = [...queryParams];
    const exerciseParams = [...queryParams, limitNum, offsetNum];
    const total = db.prepare('SELECT COUNT(*) as total FROM exercises e ' + whereClause).get(...countParams);
    const exercises = db.prepare('SELECT e.* FROM exercises e ' + whereClause + ' ORDER BY e.name ASC LIMIT ? OFFSET ?').all(...exerciseParams);
    res.json({ exercises, total: total.total });
  } catch (err) {
    console.error('GET /exercises error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/stretching/all', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const exercises = db.prepare('SELECT * FROM exercises WHERE category = \'Stretching\' ORDER BY muscle_groups, name').all([]);
    res.json(exercises);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const exercise = db.prepare('SELECT * FROM exercises WHERE id = ?').get([req.params.id]);
    if (!exercise) return res.status(404).json({ error: 'Exercise not found' });
    res.json(exercise);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const { name, category, muscle_groups, difficulty, equipment, youtube_video_id, sets_reps, instructions, common_mistakes, pro_tips, gif_url } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    const result = db.prepare('INSERT INTO exercises (name, category, muscle_groups, difficulty, equipment, youtube_video_id, sets_reps, instructions, common_mistakes, pro_tips, gif_url, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run([name, category || 'Other', muscle_groups || '', difficulty || 'intermediate', equipment || 'bodyweight', youtube_video_id || null, sets_reps || '3x10', instructions || '', common_mistakes || '', pro_tips || '', gif_url || null, req.user.id]);
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const { name, category, muscle_groups, difficulty, equipment, youtube_video_id, sets_reps, instructions, common_mistakes, pro_tips, gif_url } = req.body;
    db.prepare('UPDATE exercises SET name = COALESCE(?, name), category = COALESCE(?, category), muscle_groups = COALESCE(?, muscle_groups), difficulty = COALESCE(?, difficulty), equipment = COALESCE(?, equipment), gif_url = COALESCE(?, gif_url) WHERE id = ?').run([name, category, muscle_groups, difficulty, equipment, gif_url, req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM exercises WHERE id = ?').run([req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
