const express = require('express');
const { getDb } = require('../db/database');
const { authenticateToken, requirePT } = require('../middleware/auth');

const router = express.Router();

// Get workouts assigned to a client
router.get('/client/:clientId', authenticateToken, (req, res) => {
  const db = getDb();
  try {
    const workouts = db.prepare(`
      SELECT aw.*, u.name as pt_name
      FROM assigned_workouts aw
      JOIN users u ON aw.pt_user_id = u.id
      WHERE aw.client_id = ?
      ORDER BY aw.scheduled_date DESC
    `).all(req.params.clientId);

    // Get exercises for each workout
    const stretchingCategories = ['Neck', 'Shoulders', 'Arms', 'Chest', 'Hips', 'Legs', 'Calves', 'Core', 'Stretching', 'Full Body'];
    const result = workouts.map(workout => {
      const exercises = db.prepare(`
        SELECT awe.*, e.name, e.category, e.muscle_groups, e.equipment, e.difficulty
        FROM assigned_workout_exercises awe
        JOIN exercises e ON awe.exercise_id = e.id
        WHERE awe.assigned_workout_id = ?
        ORDER BY awe.sort_order
      `).all(workout.id);

      // Add type field to indicate stretching vs strength
      const exercisesWithType = exercises.map(ex => ({
        ...ex,
        type: ex.equipment === 'bodyweight' && stretchingCategories.includes(ex.category) ? 'stretching' : 'strength'
      }));

      return { ...workout, exercises: exercisesWithType };
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch workouts' });
  }
});

// Get single assigned workout
router.get('/:id', authenticateToken, (req, res) => {
  const db = getDb();
  try {
    const workout = db.prepare('SELECT * FROM assigned_workouts WHERE id = ?').get(req.params.id);
    if (!workout) return res.status(404).json({ error: 'Workout not found' });

    const exercises = db.prepare(`
      SELECT awe.*, e.name, e.category, e.muscle_groups, e.equipment, e.difficulty
      FROM assigned_workout_exercises awe
      JOIN exercises e ON awe.exercise_id = e.id
      WHERE awe.assigned_workout_id = ?
      ORDER BY awe.sort_order
    `).all(req.params.id);

    // Add type field to indicate stretching vs strength
    const stretchingCategories = ['Neck', 'Shoulders', 'Arms', 'Chest', 'Hips', 'Legs', 'Calves', 'Core', 'Stretching', 'Full Body'];
    const exercisesWithType = exercises.map(ex => ({
      ...ex,
      type: ex.equipment === 'bodyweight' && stretchingCategories.includes(ex.category) ? 'stretching' : 'strength'
    }));

    res.json({ ...workout, exercises: exercisesWithType });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch workout' });
  }
});

// Create new assigned workout
router.post('/', authenticateToken, requirePT, (req, res) => {
  const db = getDb();
  const { template_id, client_id, name, description, difficulty, estimated_duration_minutes, scheduled_date, exercises } = req.body;

  if (!client_id || !name || !scheduled_date) {
    return res.status(400).json({ error: 'Client ID, name, and scheduled date required' });
  }

  try {
    const result = db.prepare(`
      INSERT INTO assigned_workouts (template_id, client_id, pt_user_id, name, description, difficulty, estimated_duration_minutes, scheduled_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'assigned')
    `).run(
      template_id || null,
      client_id,
      req.user.id,
      name,
      description || '',
      difficulty || 'intermediate',
      estimated_duration_minutes || 60,
      scheduled_date
    );

    const workoutId = result.lastInsertRowid;

    // Add exercises to assigned workout
    if (Array.isArray(exercises) && exercises.length > 0) {
      const insertEx = db.prepare(`
        INSERT INTO assigned_workout_exercises (assigned_workout_id, exercise_id, sets, reps, weight_kg, rest_seconds, notes, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      exercises.forEach((ex, index) => {
        insertEx.run(
          workoutId,
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

    // Create notification for client
    const client = db.prepare('SELECT user_id FROM clients WHERE id = ?').get(client_id);
    if (client) {
      db.prepare(`
        INSERT INTO notifications (type, title, message, client_id)
        VALUES ('workout_assigned', ?, ?, ?)
      `).run(
        `New workout: ${name}`,
        `Your PT assigned you a new workout "${name}" scheduled for ${scheduled_date}`,
        client_id
      );
    }

    const created = db.prepare('SELECT * FROM assigned_workouts WHERE id = ?').get(workoutId);
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create workout assignment' });
  }
});

// Update assigned workout status
router.patch('/:id/status', authenticateToken, requirePT, (req, res) => {
  const db = getDb();
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status required' });
  }

  try {
    const workout = db.prepare('SELECT * FROM assigned_workouts WHERE id = ?').get(req.params.id);
    if (!workout) return res.status(404).json({ error: 'Workout not found' });
    if (workout.pt_user_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    const completed_date = status === 'completed' ? new Date().toISOString().split('T')[0] : null;

    db.prepare(`
      UPDATE assigned_workouts
      SET status = ?, completed_date = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(status, completed_date, req.params.id);

    const updated = db.prepare('SELECT * FROM assigned_workouts WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Mark workout as complete (client or PT)
router.patch('/:id/complete', authenticateToken, (req, res) => {
  const db = getDb();

  try {
    const workout = db.prepare('SELECT * FROM assigned_workouts WHERE id = ?').get(req.params.id);
    if (!workout) return res.status(404).json({ error: 'Workout not found' });

    // Check authorization
    const client = db.prepare('SELECT user_id FROM clients WHERE id = ?').get(workout.client_id);
    const isClient = client && client.user_id === req.user.id;
    const isPT = workout.pt_user_id === req.user.id;

    if (!isClient && !isPT) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const completedDate = new Date().toISOString().split('T')[0];

    db.prepare(`
      UPDATE assigned_workouts
      SET status = 'completed', completed_date = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(completedDate, req.params.id);

    const updated = db.prepare('SELECT * FROM assigned_workouts WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to mark as complete' });
  }
});

// Delete assigned workout
router.delete('/:id', authenticateToken, requirePT, (req, res) => {
  const db = getDb();

  try {
    const workout = db.prepare('SELECT * FROM assigned_workouts WHERE id = ?').get(req.params.id);
    if (!workout) return res.status(404).json({ error: 'Workout not found' });
    if (workout.pt_user_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    db.prepare('DELETE FROM assigned_workouts WHERE id = ?').run(req.params.id);
    res.json({ message: 'Workout deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete workout' });
  }
});

module.exports = router;
