const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken, requirePT } = require('../middleware/auth');

router.use(authenticateToken);

// Get all classes
router.get('/', (req, res) => {
  const db = getDb();
  const classes = db.prepare(`
    SELECT cl.*, COUNT(cs.id) as sessions_run,
           COALESCE(SUM(cs.total_earned), 0) as total_earned
    FROM classes cl
    LEFT JOIN class_sessions cs ON cs.class_id = cl.id
    WHERE cl.is_active = 1
    GROUP BY cl.id
    ORDER BY cl.day_of_week, cl.class_time
  `).all();
  res.json(classes);
});

// Get class sessions history
router.get('/:id/sessions', requirePT, (req, res) => {
  const db = getDb();
  const sessions = db.prepare(`
    SELECT * FROM class_sessions WHERE class_id = ? ORDER BY session_date DESC
  `).all(req.params.id);
  res.json(sessions);
});

// Log a class session
router.post('/:id/sessions', requirePT, (req, res) => {
  const db = getDb();
  const { session_date, attendees, notes } = req.body;
  const cls = db.prepare('SELECT * FROM classes WHERE id = ?').get(req.params.id);
  if (!cls) return res.status(404).json({ error: 'Class not found' });

  let total_earned;
  if (cls.payment_type === 'per_person') {
    total_earned = (attendees || cls.max_people || 0) * cls.per_person_fee;
  } else {
    total_earned = cls.flat_fee;
  }

  const result = db.prepare(`
    INSERT INTO class_sessions (class_id, session_date, attendees, total_earned, notes)
    VALUES (?, ?, ?, ?, ?)
  `).run(req.params.id, session_date, attendees || cls.max_people, total_earned, notes || null);

  res.json({ id: result.lastInsertRowid, total_earned, message: 'Class session logged' });
});

// Add a new class
router.post('/', requirePT, (req, res) => {
  const db = getDb();
  const { name, day_of_week, class_time, payment_type, flat_fee, per_person_fee, max_people } = req.body;
  const result = db.prepare(`
    INSERT INTO classes (name, day_of_week, class_time, payment_type, flat_fee, per_person_fee, max_people)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(name, day_of_week, class_time, payment_type, flat_fee || null, per_person_fee || null, max_people || null);
  res.json({ id: result.lastInsertRowid, message: 'Class added' });
});

module.exports = router;
