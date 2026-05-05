const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken, requirePT } = require('../middleware/auth');

router.use(authenticateToken, requirePT);

// Today's schedule (time-ordered, 07:00-20:00)
router.get('/schedule/today', (req, res) => {
  const db = getDb();
  const dateStr = req.query.date || new Date().toISOString().split('T')[0];
  const dayOfWeek = new Date(dateStr + 'T12:00:00').getDay();

  // PT sessions for today (includes cancelled so they show with CANCELLED label)
  const ptSessions = db.prepare(`
    SELECT s.id, s.scheduled_time, s.status, s.session_type, s.scheduled_date,
           s.cancelled_at, s.cancellation_notice_hours, s.session_carried_over,
           s.cancelled_by, s.pt_override_note,
           u.name as client_name, c.id as client_id, c.client_type,
           c.sessions_used,
           (10 - c.sessions_used) as sessions_remaining,
           b.id as block_id
    FROM sessions s
    JOIN clients c ON s.client_id = c.id
    JOIN users u ON c.user_id = u.id
    LEFT JOIN blocks b ON s.block_id = b.id AND b.is_current = 1
    WHERE s.scheduled_date = ?
    ORDER BY s.scheduled_time
  `).all(dateStr);

  // Classes for today
  const classes = db.prepare(`
    SELECT cl.id, cl.name, cl.class_time as scheduled_time, cl.payment_type,
           cl.flat_fee, cl.per_person_fee, cl.max_people,
           'class' as entry_type
    FROM classes cl
    WHERE cl.day_of_week = ? AND cl.is_active = 1
    ORDER BY cl.class_time
  `).all(dayOfWeek);

  res.json({
    date: dateStr,
    dayOfWeek,
    ptSessions,
    classes,
  });
});

// Weekly overview
router.get('/schedule/week', (req, res) => {
  const db = getDb();
  const weekStart = req.query.weekStart || getMonday(new Date()).toISOString().split('T')[0];
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart + 'T12:00:00');
    d.setDate(d.getDate() + i);
    weekDates.push(d.toISOString().split('T')[0]);
  }

  const sessions = db.prepare(`
    SELECT s.id, s.scheduled_date, s.scheduled_time, s.status,
           u.name as client_name, c.id as client_id, c.sessions_used,
           (10 - c.sessions_used) as sessions_remaining, c.client_type
    FROM sessions s
    JOIN clients c ON s.client_id = c.id
    JOIN users u ON c.user_id = u.id
    WHERE s.scheduled_date >= ? AND s.scheduled_date <= ?
    ORDER BY s.scheduled_date, s.scheduled_time
  `).all(weekDates[0], weekDates[6]);

  const classes = db.prepare(`
    SELECT cl.id, cl.name, cl.day_of_week, cl.class_time, cl.payment_type, cl.flat_fee, cl.per_person_fee, cl.max_people
    FROM classes cl
    WHERE cl.is_active = 1
    ORDER BY cl.day_of_week, cl.class_time
  `).all();

  res.json({ weekDates, sessions, classes });
});

// All clients summary
router.get('/clients', (req, res) => {
  const db = getDb();
  const clients = db.prepare(`
    SELECT c.id, u.name, u.email, u.username, c.phone, c.client_type,
           c.block_price, c.current_block_number, c.block_start_date,
           c.sessions_used, c.is_pro, c.pro_expires_at,
           (10 - c.sessions_used) as sessions_remaining,
           CASE
             WHEN c.sessions_used >= 10 THEN 'renew'
             WHEN 10 - c.sessions_used <= 1 THEN 'critical'
             WHEN 10 - c.sessions_used <= 2 THEN 'warning'
             ELSE 'ok'
           END as status
    FROM clients c
    JOIN users u ON c.user_id = u.id
    WHERE u.is_active = 1
    ORDER BY u.name
  `).all();

  res.json(clients);
});

// Single client full profile
router.get('/clients/:id', (req, res) => {
  const db = getDb();
  const client = db.prepare(`
    SELECT c.id, u.name, u.email, u.username, c.phone, c.client_type,
           c.block_price, c.current_block_number, c.block_start_date,
           c.sessions_used, c.is_pro, c.pro_expires_at, c.joined_date,
           (10 - c.sessions_used) as sessions_remaining
    FROM clients c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `).get(req.params.id);

  if (!client) return res.status(404).json({ error: 'Client not found' });

  const schedule = db.prepare(`SELECT day_of_week, session_time FROM client_schedules WHERE client_id = ? ORDER BY day_of_week, session_time`).all(req.params.id);
  const sessions = db.prepare(`SELECT * FROM sessions WHERE client_id = ? ORDER BY scheduled_date DESC, scheduled_time DESC LIMIT 50`).all(req.params.id);
  const blocks = db.prepare(`SELECT * FROM blocks WHERE client_id = ? ORDER BY block_number DESC`).all(req.params.id);
  const notes = db.prepare(`SELECT * FROM client_notes WHERE client_id = ? ORDER BY created_at DESC`).all(req.params.id);
  const progress = db.prepare(`SELECT * FROM progress_entries WHERE client_id = ? ORDER BY entry_date DESC`).all(req.params.id);

  res.json({ ...client, schedule, sessions, blocks, notes, progress });
});

// Create new client account
router.post('/clients/create', (req, res) => {
  const db = getDb();
  const bcrypt = require('bcryptjs');
  const { name, email, phone, username, password, client_type, block_price, block_start_date, sessions_in_block, notes } = req.body;

  if (!name || !email || !username || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const passwordHash = require('bcryptjs').hashSync(password, 10);

    // Create user
    const userRes = db.prepare(`
      INSERT INTO users (email, username, password_hash, role, name, is_active)
      VALUES (?, ?, ?, 'client', ?, 1)
    `).run(email, username, passwordHash, name);

    const userId = userRes.lastInsertRowid;

    // Create client profile
    const clientRes = db.prepare(`
      INSERT INTO clients (user_id, client_type, block_price, current_block_number, block_start_date, sessions_used, pt_id, joined_date)
      VALUES (?, ?, ?, 1, ?, 0, ?, datetime('now'))
    `).run(userId, client_type, block_price, block_start_date, req.user.id);

    const clientId = clientRes.lastInsertRowid;

    // Create initial block
    db.prepare(`
      INSERT INTO blocks (client_id, block_number, start_date, sessions_attended, amount_paid, payment_date, is_current)
      VALUES (?, 1, ?, 0, ?, ?, 1)
    `).run(clientId, block_start_date, block_price, block_start_date);

    // Add notes if provided
    if (notes) {
      db.prepare(`
        INSERT INTO client_notes (client_id, created_by, note_type, content)
        VALUES (?, ?, 'general', ?)
      `).run(clientId, req.user.id, notes);
    }

    res.json({
      id: clientId,
      message: 'Client created successfully',
      username: username,
      password: password
    });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      res.status(400).json({ error: 'Username or email already exists' });
    } else {
      console.error('Error creating client:', err);
      res.status(500).json({ error: 'Failed to create client' });
    }
  }
});

// Add/update client note
router.post('/clients/:id/notes', (req, res) => {
  const db = getDb();
  const { content, note_type, is_progress_note } = req.body;
  const result = db.prepare(`
    INSERT INTO client_notes (client_id, created_by, note_type, content, is_progress_note)
    VALUES (?, ?, ?, ?, ?)
  `).run(req.params.id, req.user.id, note_type || 'general', content, is_progress_note ? 1 : 0);
  res.json({ id: result.lastInsertRowid, message: 'Note added' });
});

// Update client info
router.put('/clients/:id', (req, res) => {
  const db = getDb();
  const { phone, email, sessions_used } = req.body;
  if (phone) db.prepare('UPDATE clients SET phone = ? WHERE id = ?').run(phone, req.params.id);
  if (email) {
    const client = db.prepare('SELECT user_id FROM clients WHERE id = ?').get(req.params.id);
    db.prepare('UPDATE users SET email = ? WHERE id = ?').run(email, client.user_id);
  }
  if (sessions_used !== undefined) db.prepare('UPDATE clients SET sessions_used = ? WHERE id = ?').run(sessions_used, req.params.id);
  res.json({ message: 'Client updated' });
});

// Block tracker - all clients
router.get('/blocks', (req, res) => {
  const db = getDb();
  const clients = db.prepare(`
    SELECT c.id, u.name, c.client_type, c.block_price, c.current_block_number,
           c.block_start_date, c.sessions_used, (10 - c.sessions_used) as sessions_remaining,
           CASE
             WHEN c.sessions_used >= 10 THEN 'renew'
             WHEN 10 - c.sessions_used <= 1 THEN 'critical'
             WHEN 10 - c.sessions_used <= 2 THEN 'warning'
             ELSE 'ok'
           END as status,
           b.id as block_id, b.payment_date
    FROM clients c
    JOIN users u ON c.user_id = u.id
    LEFT JOIN blocks b ON b.client_id = c.id AND b.is_current = 1
    WHERE u.is_active = 1
    ORDER BY
      CASE WHEN c.sessions_used >= 10 THEN 0
           WHEN 10 - c.sessions_used <= 1 THEN 1
           WHEN 10 - c.sessions_used <= 2 THEN 2
           ELSE 3 END,
      u.name
  `).all();

  const renewalCount = clients.filter(c => c.status === 'renew' || c.status === 'critical').length;
  res.json({ clients, renewalCount });
});

// Renew a client block
router.post('/blocks/:clientId/renew', (req, res) => {
  const db = getDb();
  const { paymentDate } = req.body;
  const clientId = req.params.clientId;

  const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(clientId);
  if (!client) return res.status(404).json({ error: 'Client not found' });

  const renewalDate = paymentDate || new Date().toISOString().split('T')[0];
  const newBlockNumber = (client.current_block_number || 1) + 1;

  // Close current block
  db.prepare('UPDATE blocks SET is_current = 0, end_date = ? WHERE client_id = ? AND is_current = 1')
    .run(renewalDate, clientId);

  // Create new block
  db.prepare(`
    INSERT INTO blocks (client_id, block_number, start_date, sessions_attended, amount_paid, payment_date, is_current)
    VALUES (?, ?, ?, 0, ?, ?, 1)
  `).run(clientId, newBlockNumber, renewalDate, client.block_price, renewalDate);

  // Reset sessions used
  db.prepare('UPDATE clients SET sessions_used = 0, block_start_date = ?, current_block_number = ? WHERE id = ?')
    .run(renewalDate, newBlockNumber, clientId);

  // Generate new sessions from schedule
  const schedule = db.prepare('SELECT day_of_week, session_time FROM client_schedules WHERE client_id = ?').all(clientId);
  const newBlock = db.prepare('SELECT id FROM blocks WHERE client_id = ? AND is_current = 1').get(clientId);

  // Generate 10 sessions worth of future dates
  const sessionDates = generateFutureSessions(renewalDate, schedule, 10);
  const sessionInsert = db.prepare(`
    INSERT INTO sessions (client_id, block_id, scheduled_date, scheduled_time, status, session_type)
    VALUES (?, ?, ?, ?, 'upcoming', 'PT')
  `);
  for (const s of sessionDates) {
    sessionInsert.run(clientId, newBlock.id, s.date, s.time);
  }

  res.json({ message: 'Block renewed', newBlockNumber });
});

function generateFutureSessions(startDate, schedule, count) {
  const results = [];
  let current = new Date(startDate + 'T12:00:00');
  const seen = new Set();

  for (let week = 0; week < 20 && results.length < count; week++) {
    for (const item of schedule) {
      const d = new Date(startDate + 'T12:00:00');
      d.setDate(d.getDate() + (week * 7) + ((item.day_of_week - d.getDay() + 7) % 7));
      const dateStr = d.toISOString().split('T')[0];
      const key = `${dateStr}-${item.session_time}`;
      if (dateStr >= startDate && !seen.has(key)) {
        seen.add(key);
        results.push({ date: dateStr, time: item.session_time });
      }
    }
  }

  results.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  return results.slice(0, count);
}

// Income overview
router.get('/income', (req, res) => {
  const db = getDb();

  // PT income by client
  const ptIncome = db.prepare(`
    SELECT c.id, u.name, c.client_type, c.block_price,
           COUNT(DISTINCT b.id) as blocks_sold,
           COALESCE(SUM(DISTINCT b.amount_paid), 0) as total_earned
    FROM clients c
    JOIN users u ON c.user_id = u.id
    LEFT JOIN blocks b ON b.client_id = c.id
    GROUP BY c.id
    ORDER BY u.name
  `).all();

  // Classes income
  const classIncome = db.prepare(`
    SELECT cl.id, cl.name, cl.day_of_week, cl.class_time, cl.payment_type,
           cl.flat_fee, cl.per_person_fee, cl.max_people,
           COUNT(cs.id) as sessions_run,
           COALESCE(SUM(cs.total_earned), 0) as total_earned
    FROM classes cl
    LEFT JOIN class_sessions cs ON cs.class_id = cl.id
    WHERE cl.is_active = 1
    GROUP BY cl.id
    ORDER BY cl.day_of_week, cl.class_time
  `).all();

  // Pro subscription income
  const proIncome = db.prepare(`
    SELECT s.plan, COUNT(*) as count, SUM(s.amount) as total
    FROM subscriptions s
    WHERE s.status = 'active'
    GROUP BY s.plan
  `).all();

  const ptGross = ptIncome.reduce((sum, c) => sum + c.total_earned, 0);
  const classGross = classIncome.reduce((sum, c) => sum + c.total_earned, 0);
  const proGross = proIncome.reduce((sum, c) => sum + c.total, 0);
  const totalGross = ptGross + classGross + proGross;
  const totalTax = Math.round(totalGross * 0.2);
  const totalNet = totalGross - totalTax;

  res.json({
    ptIncome: ptIncome.map(c => ({
      ...c,
      tax: Math.round(c.total_earned * 0.2),
      net: Math.round(c.total_earned * 0.8),
    })),
    classIncome: classIncome.map(c => ({
      ...c,
      tax: Math.round(c.total_earned * 0.2),
      net: Math.round(c.total_earned * 0.8),
    })),
    proIncome,
    summary: { totalGross, totalTax, totalNet, ptGross, classGross, proGross },
  });
});

// All clients progress (PT view)
router.get('/progress', (req, res) => {
  const db = getDb();
  const clientsProgress = db.prepare(`
    SELECT c.id, u.name,
           (SELECT pe.weight_kg FROM progress_entries pe WHERE pe.client_id = c.id ORDER BY pe.entry_date ASC LIMIT 1) as start_weight,
           (SELECT pe.weight_kg FROM progress_entries pe WHERE pe.client_id = c.id ORDER BY pe.entry_date DESC LIMIT 1) as current_weight,
           (SELECT COUNT(*) FROM progress_entries pe WHERE pe.client_id = c.id) as entry_count,
           (SELECT pe.entry_date FROM progress_entries pe WHERE pe.client_id = c.id ORDER BY pe.entry_date DESC LIMIT 1) as last_entry
    FROM clients c
    JOIN users u ON c.user_id = u.id
    WHERE u.is_active = 1
    ORDER BY u.name
  `).all();

  res.json(clientsProgress);
});

// Wellness hub: post a tip
router.post('/wellness/tips', (req, res) => {
  const db = getDb();
  const { category, title, content, is_featured, featured_week } = req.body;
  const result = db.prepare(`
    INSERT INTO nutrition_tips (category, title, content, is_featured, featured_week, created_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(category, title, content, is_featured ? 1 : 0, featured_week || null, req.user.id);

  if (is_featured && featured_week) {
    db.prepare('INSERT OR REPLACE INTO tip_of_week (tip_id, week_start) VALUES (?, ?)')
      .run(result.lastInsertRowid, featured_week);
  }

  res.json({ id: result.lastInsertRowid, message: 'Tip published' });
});

// Set tip of the week
router.post('/wellness/tip-of-week', (req, res) => {
  const db = getDb();
  const { tip_id, week_start } = req.body;
  db.prepare('INSERT OR REPLACE INTO tip_of_week (tip_id, week_start) VALUES (?, ?)').run(tip_id, week_start);
  db.prepare('UPDATE nutrition_tips SET is_featured = 0').run();
  db.prepare('UPDATE nutrition_tips SET is_featured = 1, featured_week = ? WHERE id = ?').run(week_start, tip_id);
  res.json({ message: 'Tip of the week updated' });
});

// Add meal idea
router.post('/wellness/meals', (req, res) => {
  const db = getDb();
  const { name, calories, goal, emoji, description } = req.body;
  const result = db.prepare(`
    INSERT INTO meal_ideas (name, calories, goal, emoji, description) VALUES (?, ?, ?, ?, ?)
  `).run(name, calories, goal, emoji || '🥗', description);
  res.json({ id: result.lastInsertRowid, message: 'Meal added' });
});

// Subscription management
router.get('/subscriptions', (req, res) => {
  const db = getDb();
  const subs = db.prepare(`
    SELECT c.id as client_id, u.name, c.is_pro, c.pro_expires_at, c.pro_trial_used,
           s.plan, s.status, s.amount, s.current_period_end, s.gifted_by
    FROM clients c
    JOIN users u ON c.user_id = u.id
    LEFT JOIN subscriptions s ON s.client_id = c.id AND s.status = 'active'
    WHERE u.is_active = 1
    ORDER BY u.name
  `).all();

  const monthlyRate = 999;
  const annualRate = 7999;
  const totalClients = subs.length;

  res.json({
    clients: subs,
    projections: {
      all18Monthly: totalClients * monthlyRate,
      all18Annual: totalClients * annualRate,
      fifty50Monthly: 50 * monthlyRate,
      fifty50Annual: 50 * annualRate,
      all18MonthlyNet: Math.round(totalClients * monthlyRate * 0.8),
      all18AnnualNet: Math.round(totalClients * annualRate * 0.8),
    }
  });
});

// Gift Pro to client
router.post('/subscriptions/gift', (req, res) => {
  const db = getDb();
  const { clientId, plan, months } = req.body;
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + (months || (plan === 'annual' ? 12 : 1)));

  db.prepare('UPDATE clients SET is_pro = 1, pro_expires_at = ? WHERE id = ?')
    .run(expiresAt.toISOString().split('T')[0], clientId);

  db.prepare(`
    INSERT INTO subscriptions (client_id, plan, status, amount, current_period_start, current_period_end, gifted_by)
    VALUES (?, ?, 'active', 0, date('now'), ?, ?)
  `).run(clientId, plan || 'monthly', expiresAt.toISOString().split('T')[0], req.user.id);

  res.json({ message: 'Pro gifted successfully' });
});

// Custom quotes management
router.get('/quotes', (req, res) => {
  const db = getDb();
  const quotes = db.prepare(`
    SELECT pq.*, u.name as client_name
    FROM pt_custom_quotes pq
    LEFT JOIN clients c ON pq.client_id = c.id
    LEFT JOIN users u ON c.user_id = u.id
    ORDER BY pq.show_date DESC, pq.created_at DESC
  `).all();
  res.json(quotes);
});

router.post('/quotes', (req, res) => {
  const db = getDb();
  const { quote, author, show_date, client_id } = req.body;
  if (!quote || !show_date) return res.status(400).json({ error: 'quote and show_date required' });
  const result = db.prepare(`
    INSERT INTO pt_custom_quotes (quote, author, show_date, client_id, created_by)
    VALUES (?, ?, ?, ?, ?)
  `).run(quote, author || 'Your PT', show_date, client_id || null, req.user.id);
  res.json({ id: result.lastInsertRowid, message: 'Quote scheduled' });
});

router.put('/quotes/:id', (req, res) => {
  const db = getDb();
  const { quote, author, show_date, client_id, is_active } = req.body;
  db.prepare(`
    UPDATE pt_custom_quotes SET quote=?, author=?, show_date=?, client_id=?, is_active=?
    WHERE id=?
  `).run(quote, author || 'Your PT', show_date, client_id || null, is_active !== false ? 1 : 0, req.params.id);
  res.json({ message: 'Updated' });
});

router.delete('/quotes/:id', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM pt_custom_quotes WHERE id = ?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

// Mind & Wellness content management
router.get('/wellness/mind', (req, res) => {
  const db = getDb();
  const content = db.prepare(
    'SELECT * FROM wellness_content ORDER BY type, is_featured DESC, created_at ASC'
  ).all();
  res.json(content);
});

router.post('/wellness/mind', (req, res) => {
  const db = getDb();
  const { type, subtype, title, description, duration_minutes, content, difficulty, is_featured } = req.body;
  if (!type || !title) return res.status(400).json({ error: 'Type and title are required' });

  const result = db.prepare(`
    INSERT INTO wellness_content (type, subtype, title, description, duration_minutes, content, difficulty, is_featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    type, subtype || 'general', title,
    description || '', parseInt(duration_minutes) || 0,
    content || '[]', difficulty || 'beginner',
    is_featured ? 1 : 0
  );
  res.json({ id: result.lastInsertRowid, message: 'Content created' });
});

router.put('/wellness/mind/:id', (req, res) => {
  const db = getDb();
  const { type, subtype, title, description, duration_minutes, content, difficulty, is_featured, is_active } = req.body;
  db.prepare(`
    UPDATE wellness_content
    SET type=?, subtype=?, title=?, description=?, duration_minutes=?, content=?, difficulty=?, is_featured=?, is_active=?
    WHERE id=?
  `).run(
    type, subtype || 'general', title,
    description || '', parseInt(duration_minutes) || 0,
    content || '[]', difficulty || 'beginner',
    is_featured ? 1 : 0, is_active !== false ? 1 : 0,
    req.params.id
  );
  res.json({ message: 'Updated' });
});

router.delete('/wellness/mind/:id', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM wellness_content WHERE id = ?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

// Weekly challenges
router.post('/challenges', (req, res) => {
  const db = getDb();
  const { title, description, start_date, end_date } = req.body;
  const result = db.prepare(`
    INSERT INTO weekly_challenges (title, description, start_date, end_date)
    VALUES (?, ?, ?, ?)
  `).run(title, description, start_date, end_date);
  res.json({ id: result.lastInsertRowid, message: 'Challenge created' });
});

router.get('/challenges', (req, res) => {
  const db = getDb();
  const challenges = db.prepare(`
    SELECT wc.*, COUNT(cp.id) as participant_count
    FROM weekly_challenges wc
    LEFT JOIN challenge_participants cp ON cp.challenge_id = wc.id
    GROUP BY wc.id
    ORDER BY wc.start_date DESC
  `).all();
  res.json(challenges);
});

// ── Notifications ─────────────────────────────────────────────────────────────

// GET /pt/notifications — all notifications for the PT (newest first)
router.get('/notifications', (req, res) => {
  const db = getDb();
  const notifications = db.prepare(`
    SELECT n.*, u.name as client_name
    FROM notifications n
    LEFT JOIN clients c ON n.client_id = c.id
    LEFT JOIN users u ON c.user_id = u.id
    ORDER BY n.created_at DESC
    LIMIT 50
  `).all();
  const unreadCount = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE is_read = 0').get().count;
  res.json({ notifications, unreadCount });
});

// PUT /pt/notifications/read-all — mark all notifications as read (must be before /:id/read)
router.put('/notifications/read-all', (req, res) => {
  const db = getDb();
  db.prepare('UPDATE notifications SET is_read = 1').run();
  res.json({ message: 'All marked as read' });
});

// PUT /pt/notifications/:id/read — mark one notification as read
router.put('/notifications/:id/read', (req, res) => {
  const db = getDb();
  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(req.params.id);
  res.json({ message: 'Marked as read' });
});

// ── PRO TIER DASHBOARD ─────────────────────────────────────────────────────────

// GET /pt/dashboard/pro-metrics - Pro subscription metrics
router.get('/dashboard/pro-metrics', (req, res) => {
  const db = getDb();

  // Count Pro clients
  const proClients = db.prepare(`
    SELECT COUNT(*) as count FROM clients WHERE is_pro = 1
  `).get();

  // Calculate Pro revenue
  const proRevenue = db.prepare(`
    SELECT
      COUNT(*) as total_subscribers,
      SUM(CASE WHEN plan = 'monthly' THEN amount ELSE 0 END) as monthly_revenue,
      SUM(CASE WHEN plan = 'annual' THEN amount ELSE 0 END) as annual_revenue,
      SUM(amount) as total_revenue
    FROM subscriptions WHERE status = 'active'
  `).get();

  // Get Pro client details
  const proclients = db.prepare(`
    SELECT c.id, u.name, s.plan, c.pro_expires_at,
           (SELECT COUNT(*) FROM weekly_checkins wc WHERE wc.client_id = c.id) as checkins_completed,
           (SELECT COUNT(*) FROM progress_measurements pm WHERE pm.client_id = c.id) as measurements_tracked,
           (SELECT COUNT(*) FROM pt_messages pm WHERE pm.client_id = c.id) as messages_exchanged
    FROM clients c
    JOIN users u ON u.id = c.user_id
    LEFT JOIN subscriptions s ON s.client_id = c.id AND s.status = 'active'
    WHERE c.is_pro = 1
    ORDER BY u.name
  `).all();

  res.json({
    proClientsCount: proClients.count,
    revenue: {
      monthlySubscribers: proRevenue.total_subscribers ? proRevenue.total_subscribers : 0,
      monthlyRecurringRevenue: proRevenue.monthly_revenue || 0,
      annualRecurringRevenue: proRevenue.annual_revenue || 0,
      totalRevenue: proRevenue.total_revenue || 0
    },
    clients: proclients
  });
});

// GET /pt/dashboard/checkins - All client check-ins for current week
router.get('/dashboard/checkins', (req, res) => {
  const db = getDb();

  // Get current ISO week
  function getISOWeek(date) {
    const d = new Date(date);
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
  }

  const currentWeek = getISOWeek(new Date().toISOString().split('T')[0]);

  // Get all clients
  const clients = db.prepare(`
    SELECT c.id, u.name FROM clients c
    JOIN users u ON u.id = c.user_id
    WHERE u.is_active = 1
    ORDER BY u.name
  `).all();

  // Get check-ins for current week
  const checkins = clients.map(client => {
    const checkin = db.prepare(`
      SELECT * FROM weekly_checkins WHERE client_id = ? AND checkin_week = ?
    `).get(client.id, currentWeek);

    return {
      clientId: client.id,
      clientName: client.name,
      completed: !!checkin,
      checkinDate: checkin?.checkin_date || null,
      moodRating: checkin?.mood_rating || null,
      nutritionGoalsHit: checkin?.nutrition_goals_hit || null,
      energyLevel: checkin?.energy_level || null,
      sleepQuality: checkin?.sleep_quality || null,
      responded: !!checkin?.pt_responded_at,
      ptResponse: checkin?.pt_response || null
    };
  });

  const completionRate = checkins.filter(c => c.completed).length / checkins.length * 100;

  res.json({
    week: currentWeek,
    totalClients: checkins.length,
    completedCount: checkins.filter(c => c.completed).length,
    completionRate: Math.round(completionRate),
    checkins
  });
});

// GET /pt/dashboard/messages - Message thread summary with all clients
router.get('/dashboard/messages', (req, res) => {
  const db = getDb();

  const threads = db.prepare(`
    SELECT
      c.id as client_id,
      u.name as client_name,
      COUNT(pm.id) as total_messages,
      SUM(CASE WHEN pm.sender_type = 'client' THEN 1 ELSE 0 END) as client_messages,
      SUM(CASE WHEN pm.sender_type = 'pt' THEN 1 ELSE 0 END) as pt_messages,
      SUM(CASE WHEN pm.sender_type = 'client' AND pm.is_read = 0 THEN 1 ELSE 0 END) as unread_count,
      MAX(pm.created_at) as last_message_at
    FROM clients c
    JOIN users u ON u.id = c.user_id
    LEFT JOIN pt_messages pm ON pm.client_id = c.id AND pm.pt_user_id = ?
    WHERE u.is_active = 1
    GROUP BY c.id
    ORDER BY unread_count DESC, last_message_at DESC
  `).all(req.user.id);

  const totalUnread = threads.reduce((sum, t) => sum + (t.unread_count || 0), 0);

  res.json({ threads, totalUnread });
});

// GET /pt/dashboard/badges - Badges earned by all clients this week
router.get('/dashboard/badges', (req, res) => {
  const db = getDb();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const weeklyBadges = db.prepare(`
    SELECT
      cbe.earned_at,
      ab.display_name,
      ab.icon_emoji,
      ab.color,
      u.name as client_name,
      c.id as client_id
    FROM client_badges_earned cbe
    JOIN achievement_badges ab ON ab.id = cbe.badge_id
    JOIN clients c ON c.id = cbe.client_id
    JOIN users u ON u.id = c.user_id
    WHERE c.pt_id = ? AND cbe.earned_at >= ?
    ORDER BY cbe.earned_at DESC
  `).all(req.user.id, weekAgo);

  // Group by client
  const byClient = {};
  weeklyBadges.forEach(badge => {
    if (!byClient[badge.client_id]) {
      byClient[badge.client_id] = { clientName: badge.client_name, badges: [] };
    }
    byClient[badge.client_id].badges.push({
      displayName: badge.display_name,
      emoji: badge.icon_emoji,
      color: badge.color,
      earnedAt: badge.earned_at
    });
  });

  res.json({
    total: weeklyBadges.length,
    byClient: Object.values(byClient)
  });
});

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
}


// Seed client schedule and generate sessions
router.post("/clients/:id/schedule", (req, res) => {
  const db = getDb();
  const clientId = parseInt(req.params.id);
  const { slots } = req.body; // [{day_of_week, session_time}]
  if (!slots || !Array.isArray(slots)) return res.status(400).json({ error: "slots required" });

  // Clear existing schedule
  db.prepare("DELETE FROM client_schedules WHERE client_id = ?").run(clientId);

  // Insert new schedule
  const ins = db.prepare("INSERT INTO client_schedules (client_id, day_of_week, session_time) VALUES (?, ?, ?)");
  for (const slot of slots) {
    ins.run(clientId, slot.day_of_week, slot.session_time);
  }

  // Delete existing upcoming sessions
  db.prepare("DELETE FROM sessions WHERE client_id = ? AND status = 'upcoming'").run(clientId);

  // Get current block
  const block = db.prepare("SELECT id FROM blocks WHERE client_id = ? AND is_current = 1").get(clientId);
  if (!block) return res.json({ scheduled: slots.length, sessions: 0 });

  // Generate future sessions
  const today = new Date().toISOString().split("T")[0];
  const sessionDates = generateFutureSessions(today, slots, 10);
  const sessionIns = db.prepare("INSERT INTO sessions (client_id, block_id, scheduled_date, scheduled_time, status, session_type) VALUES (?, ?, ?, ?, 'upcoming', 'PT')");
  for (const s of sessionDates) {
    sessionIns.run(clientId, block.id, s.date, s.time);
  }

  res.json({ scheduled: slots.length, sessions: sessionDates.length });
});



// GET /pt/client-notifications — notifications for a specific client
router.get('/client-notifications', (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  if (!clientId) return res.status(403).json({ error: "Clients only" });
  const notifications = db.prepare(`
    SELECT * FROM notifications
    WHERE client_id = ?
    ORDER BY created_at DESC
    LIMIT 20
  `).all(clientId);
  const unreadCount = db.prepare("SELECT COUNT(*) as count FROM notifications WHERE client_id = ? AND is_read = 0").get(clientId).count;
  res.json({ notifications, unreadCount });
});

// PUT /pt/client-notifications/read-all — client marks all their notifications as read
router.put('/client-notifications/read-all', (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  if (!clientId) return res.status(403).json({ error: "Clients only" });
  db.prepare("UPDATE notifications SET is_read = 1 WHERE client_id = ?").run(clientId);
  res.json({ message: "All marked as read" });
});

module.exports = router;