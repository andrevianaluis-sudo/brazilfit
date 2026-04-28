const express = require('express');
const { getDb } = require('../db/database');
const { authenticateToken, requirePT } = require('../middleware/auth');

const router = express.Router();

// Get all templates for PT
router.get('/', authenticateToken, requirePT, (req, res) => {
  const db = getDb();
  try {
    const templates = db.prepare(`
      SELECT * FROM workout_templates
      WHERE pt_user_id = ?
      ORDER BY created_at DESC
    `).all(req.user.id);

    res.json(templates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Get single template with exercises
router.get('/:id', authenticateToken, (req, res) => {
  const db = getDb();
  try {
    const template = db.prepare(`
      SELECT * FROM workout_templates WHERE id = ?
    `).get(req.params.id);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const exercises = db.prepare(`
      SELECT wte.*, e.name, e.category, e.muscle_groups, e.equipment, e.difficulty
      FROM workout_template_exercises wte
      JOIN exercises e ON wte.exercise_id = e.id
      WHERE wte.template_id = ?
      ORDER BY wte.sort_order
    `).all(req.params.id);

    res.json({ ...template, exercises });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

// Create new template
router.post('/', authenticateToken, requirePT, (req, res) => {
  const db = getDb();
  const { name, description, difficulty, estimated_duration_minutes, exercises } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Workout name required' });
  }

  try {
    const result = db.prepare(`
      INSERT INTO workout_templates (pt_user_id, name, description, difficulty, estimated_duration_minutes)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      req.user.id,
      name,
      description || '',
      difficulty || 'intermediate',
      estimated_duration_minutes || 60
    );

    const templateId = result.lastInsertRowid;

    // Add exercises to template
    if (Array.isArray(exercises) && exercises.length > 0) {
      const insertEx = db.prepare(`
        INSERT INTO workout_template_exercises (template_id, exercise_id, sets, reps, weight_kg, rest_seconds, notes, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      exercises.forEach((ex, index) => {
        insertEx.run(
          templateId,
          ex.exercise_id,
          ex.sets || 3,
          ex.reps || '10',
          ex.weight_kg || null,
          ex.rest_seconds || 60,
          ex.notes || '',
          index
        );
      });
    }

    const created = db.prepare('SELECT * FROM workout_templates WHERE id = ?').get(templateId);
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// Update template
router.patch('/:id', authenticateToken, requirePT, (req, res) => {
  const db = getDb();
  const { name, description, difficulty, estimated_duration_minutes } = req.body;

  try {
    const template = db.prepare('SELECT * FROM workout_templates WHERE id = ?').get(req.params.id);
    if (!template) return res.status(404).json({ error: 'Template not found' });
    if (template.pt_user_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    db.prepare(`
      UPDATE workout_templates
      SET name = ?, description = ?, difficulty = ?, estimated_duration_minutes = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(
      name || template.name,
      description !== undefined ? description : template.description,
      difficulty || template.difficulty,
      estimated_duration_minutes || template.estimated_duration_minutes,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM workout_templates WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// Delete template
router.delete('/:id', authenticateToken, requirePT, (req, res) => {
  const db = getDb();

  try {
    const template = db.prepare('SELECT * FROM workout_templates WHERE id = ?').get(req.params.id);
    if (!template) return res.status(404).json({ error: 'Template not found' });
    if (template.pt_user_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    db.prepare('DELETE FROM workout_templates WHERE id = ?').run(req.params.id);
    res.json({ message: 'Template deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

// Add exercise to template
router.post('/:id/exercises', authenticateToken, requirePT, (req, res) => {
  const db = getDb();
  const { exercise_id, sets, reps, weight_kg, rest_seconds, notes } = req.body;

  if (!exercise_id) {
    return res.status(400).json({ error: 'Exercise ID required' });
  }

  try {
    const template = db.prepare('SELECT * FROM workout_templates WHERE id = ?').get(req.params.id);
    if (!template) return res.status(404).json({ error: 'Template not found' });
    if (template.pt_user_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    const maxOrder = db.prepare('SELECT MAX(sort_order) as max_order FROM workout_template_exercises WHERE template_id = ?')
      .get(req.params.id);

    const result = db.prepare(`
      INSERT INTO workout_template_exercises (template_id, exercise_id, sets, reps, weight_kg, rest_seconds, notes, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.params.id,
      exercise_id,
      sets || 3,
      reps || '10',
      weight_kg || null,
      rest_seconds || 60,
      notes || '',
      (maxOrder.max_order || -1) + 1
    );

    const created = db.prepare(`
      SELECT wte.*, e.name, e.category, e.muscle_groups, e.equipment, e.difficulty
      FROM workout_template_exercises wte
      JOIN exercises e ON wte.exercise_id = e.id
      WHERE wte.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add exercise' });
  }
});

// Remove exercise from template
router.delete('/:id/exercises/:exerciseId', authenticateToken, requirePT, (req, res) => {
  const db = getDb();

  try {
    const template = db.prepare('SELECT * FROM workout_templates WHERE id = ?').get(req.params.id);
    if (!template) return res.status(404).json({ error: 'Template not found' });
    if (template.pt_user_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    db.prepare('DELETE FROM workout_template_exercises WHERE template_id = ? AND id = ?')
      .run(req.params.id, req.params.exerciseId);

    res.json({ message: 'Exercise removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove exercise' });
  }
});

module.exports = router;
