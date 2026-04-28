const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken, requirePT } = require('../middleware/auth');

router.use(authenticateToken);

// Mark session as attended/missed (PT only)
router.put('/:id/status', requirePT, (req, res) => {
  const db = getDb();
  const { status } = req.body; // 'attended', 'missed', 'upcoming'
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const previousStatus = session.status;
  db.prepare('UPDATE sessions SET status = ? WHERE id = ?').run(status, req.params.id);

  // Update client sessions_used count
  const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(session.client_id);
  if (!client) return res.status(404).json({ error: 'Client not found' });

  let newCount = client.sessions_used;
  if (previousStatus === 'attended' && status !== 'attended') {
    newCount = Math.max(0, newCount - 1);
  } else if (previousStatus !== 'attended' && status === 'attended') {
    newCount = Math.min(10, newCount + 1);
  }

  db.prepare('UPDATE clients SET sessions_used = ? WHERE id = ?').run(newCount, session.client_id);

  // Update block sessions count
  if (session.block_id) {
    const attended = db.prepare(`SELECT COUNT(*) as count FROM sessions WHERE block_id = ? AND status = 'attended'`).get(session.block_id);
    const missed = db.prepare(`SELECT COUNT(*) as count FROM sessions WHERE block_id = ? AND status = 'missed'`).get(session.block_id);
    db.prepare('UPDATE blocks SET sessions_attended = ?, sessions_missed = ? WHERE id = ?')
      .run(attended.count, missed.count, session.block_id);
  }

  res.json({ message: 'Session updated', newSessionsUsed: newCount });
});

// Get sessions for a client
router.get('/client/:clientId', (req, res) => {
  const db = getDb();
  const { clientId } = req.params;

  // Verify access
  if (req.user.role === 'client' && req.user.clientId !== parseInt(clientId)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const sessions = db.prepare(`
    SELECT s.*, b.block_number
    FROM sessions s
    LEFT JOIN blocks b ON s.block_id = b.id
    WHERE s.client_id = ?
    ORDER BY s.scheduled_date DESC, s.scheduled_time DESC
  `).all(clientId);

  const upcoming = sessions.filter(s => s.status === 'upcoming');
  const history = sessions.filter(s => s.status !== 'upcoming');

  const client = db.prepare('SELECT sessions_used FROM clients WHERE id = ?').get(clientId);

  res.json({
    sessions,
    upcoming,
    history,
    sessionsUsed: client?.sessions_used || 0,
    sessionsRemaining: 10 - (client?.sessions_used || 0),
  });
});

// Log a solo/home workout (client)
router.post('/workout', (req, res) => {
  const db = getDb();
  const { log_date, session_type, duration_minutes, notes, exercises } = req.body;
  const clientId = req.user.clientId;
  if (!clientId) return res.status(403).json({ error: 'Clients only' });

  const result = db.prepare(`
    INSERT INTO workout_logs (client_id, log_date, session_type, duration_minutes, notes, exercises)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(clientId, log_date, session_type, duration_minutes, notes, JSON.stringify(exercises || []));

  res.json({ id: result.lastInsertRowid, message: 'Workout logged' });
});

// Get workout logs for a client
router.get('/workouts/:clientId', (req, res) => {
  const db = getDb();
  if (req.user.role === 'client' && req.user.clientId !== parseInt(req.params.clientId)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  const logs = db.prepare('SELECT * FROM workout_logs WHERE client_id = ? ORDER BY log_date DESC').all(req.params.clientId);
  res.json(logs);
});

// GET /sessions/cancellations — all cancellations for PT (must be before /:id routes)
router.get('/cancellations', requirePT, (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT s.id, s.scheduled_date, s.scheduled_time, s.cancelled_at,
           s.cancellation_notice_hours, s.session_carried_over,
           s.cancelled_by, s.pt_override_note,
           u.name as client_name, c.id as client_id
    FROM sessions s
    JOIN clients c ON s.client_id = c.id
    JOIN users u ON c.user_id = u.id
    WHERE s.status = 'cancelled'
    ORDER BY s.cancelled_at DESC
    LIMIT 200
  `).all();
  res.json(rows);
});

// GET /sessions/cancellations/client/:clientId — cancellations for one client (PT)
router.get('/cancellations/client/:clientId', requirePT, (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT s.id, s.scheduled_date, s.scheduled_time, s.cancelled_at,
           s.cancellation_notice_hours, s.session_carried_over,
           s.cancelled_by, s.pt_override_note,
           u.name as client_name
    FROM sessions s
    JOIN clients c ON s.client_id = c.id
    JOIN users u ON c.user_id = u.id
    WHERE s.status = 'cancelled' AND s.client_id = ?
    ORDER BY s.cancelled_at DESC
  `).all(req.params.clientId);
  res.json(rows);
});

// POST /sessions/:id/cancel — client cancels a session (24hr policy enforced server-side)
router.post('/:id/cancel', (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  if (!clientId) return res.status(403).json({ error: 'Clients only' });

  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  if (session.client_id !== clientId) return res.status(403).json({ error: 'Access denied' });
  if (session.status !== 'upcoming') return res.status(400).json({ error: 'Only upcoming sessions can be cancelled' });

  // Server-side 24hr enforcement
  const sessionDateTime = new Date(`${session.scheduled_date}T${session.scheduled_time}:00`);
  const now = new Date();
  const hoursNotice = (sessionDateTime - now) / (1000 * 60 * 60);

  if (hoursNotice < 24) {
    return res.status(403).json({
      error: 'cancellation_blocked',
      hoursNotice: Math.max(0, hoursNotice).toFixed(1),
      message: 'Cancellations must be made at least 24 hours before your session. This session cannot be cancelled and will count toward your block.',
    });
  }

  // Cancel and carry over (session was upcoming so sessions_used is unchanged)
  db.prepare(`
    UPDATE sessions
    SET status = 'cancelled', cancelled_at = datetime('now'),
        cancellation_notice_hours = ?, session_carried_over = 1, cancelled_by = 'client'
    WHERE id = ?
  `).run(Math.round(hoursNotice * 10) / 10, session.id);

  // Create PT notification
  const clientRow = db.prepare(`
    SELECT u.name FROM clients c JOIN users u ON c.user_id = u.id WHERE c.id = ?
  `).get(clientId);
  const hoursLabel = hoursNotice >= 48
    ? `${Math.round(hoursNotice / 24)} days`
    : `${Math.floor(hoursNotice)} hours`;

  db.prepare(`
    INSERT INTO notifications (type, title, message, client_id, session_id)
    VALUES ('cancellation', ?, ?, ?, ?)
  `).run(
    `${clientRow?.name} cancelled a session`,
    `${clientRow?.name} cancelled their session on ${session.scheduled_date} at ${session.scheduled_time} — ${hoursLabel} notice given. Session carried over.`,
    clientId,
    session.id
  );

  res.json({ message: 'Session cancelled. It has been carried over and will not count toward your block.', carriedOver: true });
});

// POST /sessions/:id/override-cancel — PT overrides the 24hr rule for a client
router.post('/:id/override-cancel', requirePT, (req, res) => {
  const db = getDb();
  const { override_note } = req.body;

  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  if (session.status !== 'upcoming') return res.status(400).json({ error: 'Only upcoming sessions can be overridden' });

  const sessionDateTime = new Date(`${session.scheduled_date}T${session.scheduled_time}:00`);
  const now = new Date();
  const hoursNotice = (sessionDateTime - now) / (1000 * 60 * 60);

  db.prepare(`
    UPDATE sessions
    SET status = 'cancelled', cancelled_at = datetime('now'),
        cancellation_notice_hours = ?, session_carried_over = 1,
        cancelled_by = 'pt_override', pt_override_note = ?
    WHERE id = ?
  `).run(Math.round(hoursNotice * 10) / 10, override_note || 'PT override — session carried over', session.id);

  // Notify PT (log the override)
  const clientRow = db.prepare(`
    SELECT u.name FROM clients c JOIN users u ON c.user_id = u.id WHERE c.id = ?
  `).get(session.client_id);

  db.prepare(`
    INSERT INTO notifications (type, title, message, client_id, session_id)
    VALUES ('override', ?, ?, ?, ?)
  `).run(
    `PT override: ${clientRow?.name}`,
    `You approved a late cancellation for ${clientRow?.name} on ${session.scheduled_date} at ${session.scheduled_time}. Session carried over. Note: ${override_note || '—'}`,
    session.client_id,
    session.id
  );

  res.json({ message: 'Session cancelled with PT override. Session carried over.', carriedOver: true });
});

// ─── Session Notes ────────────────────────────────────────────────────────────

// GET /sessions/:id/note — get note for a session
router.get('/:id/note', (req, res) => {
  const db = getDb();
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  // Access check: PT sees all, client sees their own
  if (req.user.role === 'client' && req.user.clientId !== session.client_id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const note = db.prepare('SELECT * FROM session_notes WHERE session_id = ?').get(req.params.id);
  res.json(note || null);
});

// POST /sessions/:id/note — PT creates or updates a note for a session
router.post('/:id/note', requirePT, (req, res) => {
  const db = getDb();
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const { what_we_worked_on, what_went_well, what_to_improve, focus_next_session, injuries_concerns } = req.body;

  const existing = db.prepare('SELECT id FROM session_notes WHERE session_id = ?').get(req.params.id);

  if (existing) {
    db.prepare(`
      UPDATE session_notes SET
        what_we_worked_on = ?, what_went_well = ?, what_to_improve = ?,
        focus_next_session = ?, injuries_concerns = ?, updated_at = datetime('now')
      WHERE session_id = ?
    `).run(what_we_worked_on || '', what_went_well || '', what_to_improve || '', focus_next_session || '', injuries_concerns || '', req.params.id);
    res.json({ id: existing.id, updated: true });
  } else {
    const result = db.prepare(`
      INSERT INTO session_notes (session_id, client_id, pt_user_id, what_we_worked_on, what_went_well, what_to_improve, focus_next_session, injuries_concerns)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(req.params.id, session.client_id, req.user.id, what_we_worked_on || '', what_went_well || '', what_to_improve || '', focus_next_session || '', injuries_concerns || '');
    res.status(201).json({ id: result.lastInsertRowid, updated: false });
  }
});

// Auto-mark sessions at end of day (called by cron job)
router.post('/auto-mark', requirePT, (req, res) => {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];
  const day = new Date().getDay();

  // Only run Mon-Fri
  if (day === 0 || day === 6) {
    return res.json({ message: 'No auto-marking on weekends', marked: 0 });
  }

  // Mark all upcoming sessions from before today as attended (auto)
  const result = db.prepare(`
    UPDATE sessions SET status = 'attended', auto_marked = 1
    WHERE status = 'upcoming' AND scheduled_date < ? AND session_type = 'PT'
  `).run(today);

  // Update client session counts
  const affected = db.prepare(`
    SELECT DISTINCT client_id FROM sessions WHERE status = 'attended' AND auto_marked = 1 AND scheduled_date < ?
  `).all(today);

  for (const { client_id } of affected) {
    const count = db.prepare(`SELECT COUNT(*) as c FROM sessions WHERE client_id = ? AND status = 'attended'`).get(client_id);
    db.prepare('UPDATE clients SET sessions_used = ? WHERE id = ?').run(Math.min(10, count.c), client_id);
  }

  res.json({ message: 'Auto-mark complete', marked: result.changes });
});

module.exports = router;
