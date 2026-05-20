const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/routines â€” get all routines for logged-in client
router.get('/', authenticateToken, (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  if (!clientId) return res.status(403).json({ error: 'Clients only' });
  const routines = db.prepare(`
    SELECT * FROM client_routines WHERE client_id = ? ORDER BY created_at DESC
  `).all(clientId);
  res.json(routines.map(r => ({ ...r, stretches: JSON.parse(r.stretches) })));
});

// POST /api/routines â€” save a new routine
router.post('/', authenticateToken, (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  if (!clientId) return res.status(403).json({ error: 'Clients only' });
  const { name, stretches } = req.body;
  if (!name?.trim() || !stretches?.length) return res.status(400).json({ error: 'Name and stretches required' });
  const result = db.prepare(`
    INSERT INTO client_routines (client_id, name, stretches) VALUES (?, ?, ?)
  `).run(clientId, name.trim(), JSON.stringify(stretches));
  res.json({ id: result.lastInsertRowid, name, stretches });
});

// DELETE /api/routines/:id â€” delete a routine
router.put('/:id', authenticateToken, (req, res) => {
  const db = getDb();
  const { name, stretches } = req.body;
  const clientId = req.user.clientId;
  try {
    const routine = db.prepare('SELECT * FROM routines WHERE id = ? AND client_id = ?').get(req.params.id, clientId);
    if (!routine) return res.status(404).json({ error: 'Not found' });
    db.prepare('UPDATE routines SET name = ?, stretches = ? WHERE id = ?').run(name, JSON.stringify(stretches), req.params.id);
    res.json({ id: req.params.id, name, stretches });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', authenticateToken, (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  if (!clientId) return res.status(403).json({ error: 'Clients only' });
  const routine = db.prepare('SELECT * FROM client_routines WHERE id = ?').get(req.params.id);
  if (!routine) return res.status(404).json({ error: 'Not found' });
  if (routine.client_id !== clientId) return res.status(403).json({ error: 'Not your routine' });
  db.prepare('DELETE FROM client_routines WHERE id = ?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;

