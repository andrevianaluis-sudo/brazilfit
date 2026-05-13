const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'brazilfit-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const db = getDb();
  const user = db.prepare(`
    SELECT u.*, c.id as client_id, c.client_type, c.block_price, c.is_pro, c.sessions_used,
           c.block_start_date, c.current_block_number, c.pro_expires_at
    FROM users u
    LEFT JOIN clients c ON c.user_id = u.id
    WHERE (u.username = ? OR u.email = ?) AND u.is_active = 1
  `).get(username, username);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const validPassword = bcrypt.compareSync(password, user.password_hash);
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const tokenPayload = {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    role: user.role,
    clientId: user.client_id || null,
    isPro: user.is_pro === 1,
  };

  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      clientId: user.client_id || null,
      isPro: user.is_pro === 1,
      proExpiresAt: user.pro_expires_at,
    }
  });
});

// Get current user
router.get('/me', authenticateToken, (req, res) => {
  const db = getDb();
  const user = db.prepare(`
    SELECT u.id, u.email, u.username, u.name, u.role, u.created_at,
           c.id as client_id, c.client_type, c.block_price, c.is_pro,
           c.sessions_used, c.block_start_date, c.current_block_number,
           c.pro_expires_at, c.pro_trial_used,
           op.gender
    FROM users u
    LEFT JOIN clients c ON c.user_id = u.id
    LEFT JOIN onboarding_personal op ON op.client_id = c.id
    WHERE u.id = ?
  `).get(req.user.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
    role: user.role,
    clientId: user.client_id || null,
    clientType: user.client_type,
    blockPrice: user.block_price,
    isPro: user.is_pro === 1,
    proExpiresAt: user.pro_expires_at,
    proTrialUsed: user.pro_trial_used === 1,
    sessionsUsed: user.sessions_used,
    blockStartDate: user.block_start_date,
    blockNumber: user.current_block_number,
    createdAt: user.created_at,
    gender: user.gender || null,
  });
});

// Change password
router.post('/change-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Both passwords required' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  const valid = bcrypt.compareSync(currentPassword, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  const hash = await bcrypt.hash(newPassword, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, req.user.id);
  res.json({ message: 'Password changed successfully' });
});

// Request password reset (simplified - returns token in response for demo)
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  if (!user) {
    // Don't reveal if email exists
    return res.json({ message: 'If that email exists, a reset link has been sent.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expires = Date.now() + 3600000; // 1 hour
  db.prepare('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?')
    .run(token, expires, user.id);

  // In production: send email with reset link
  console.log(`Password reset token for ${email}: ${token}`);
  res.json({ message: 'If that email exists, a reset link has been sent.', devToken: token });
});

// Reset password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  const db = getDb();
  const user = db.prepare(`
    SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > ?
  `).get(token, Date.now());

  if (!user) {
    return res.status(400).json({ error: 'Invalid or expired reset token' });
  }

  const hash = await bcrypt.hash(newPassword, 10);
  db.prepare('UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?')
    .run(hash, user.id);
  res.json({ message: 'Password reset successfully' });
});

// POST /api/auth/pt-reset-password — PT resets a client's password
router.post('/pt-reset-password', authenticateToken, async (req, res) => {
  if (req.user.role !== 'pt') return res.status(403).json({ error: 'PT only' });
  const { username, newPassword } = req.body;
  if (!username || !newPassword) return res.status(400).json({ error: 'username and newPassword required' });
  const db = getDb();
  const user = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const hash = await bcrypt.hash(newPassword, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, user.id);
  res.json({ message: `Password reset for ${username}` });
});

// Delete user account
router.delete('/users/:userId', authenticateToken, (req, res) => {
  const db = getDb();
  const userId = parseInt(req.params.userId);

  // Only allow users to delete their own account
  if (req.user.id !== userId) {
    return res.status(403).json({ error: 'Cannot delete another user account' });
  }

  try {
    // Get client ID if exists
    const client = db.prepare('SELECT id FROM clients WHERE user_id = ?').get(userId);

    // Delete client-related data
    if (client) {
      const clientId = client.id;

      // Delete in order of dependencies
      db.prepare('DELETE FROM client_settings WHERE client_id = ?').run(clientId);
      db.prepare('DELETE FROM habit_logs WHERE client_id = ?').run(clientId);
      db.prepare('DELETE FROM progress_entries WHERE client_id = ?').run(clientId);
      db.prepare('DELETE FROM shopping_list_items WHERE client_id = ?').run(clientId);
      db.prepare('DELETE FROM client_meal_favorites WHERE client_id = ?').run(clientId);
      db.prepare('DELETE FROM challenge_participants WHERE client_id = ?').run(clientId);
      db.prepare('DELETE FROM workout_logs WHERE client_id = ?').run(clientId);
      db.prepare('DELETE FROM client_notes WHERE client_id = ?').run(clientId);
      db.prepare('DELETE FROM sessions WHERE client_id = ?').run(clientId);
      db.prepare('DELETE FROM checkins WHERE client_id = ?').run(clientId);
      db.prepare('DELETE FROM exercise_favorites WHERE client_id = ?').run(clientId);
      db.prepare('DELETE FROM wearable_connections WHERE client_id = ?').run(clientId);
      db.prepare('DELETE FROM wearable_data WHERE client_id = ?').run(clientId);
      db.prepare('DELETE FROM client_schedule WHERE client_id = ?').run(clientId);
      db.prepare('DELETE FROM client_quote_favorites WHERE client_id = ?').run(clientId);
      db.prepare('DELETE FROM workout_plans WHERE client_id = ?').run(clientId);
      db.prepare('DELETE FROM notifications WHERE client_id = ?').run(clientId);
      db.prepare('DELETE FROM messages WHERE sender_id = ? OR recipient_id = ?').run(clientId, clientId);
      db.prepare('DELETE FROM clients WHERE id = ?').run(clientId);
    }

    // Delete user
    db.prepare('DELETE FROM users WHERE id = ?').run(userId);

    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Failed to delete account:', err);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// GET /api/auth/export-data — export all client data (GDPR right to portability)
router.get('/export-data', authenticateToken, (req, res) => {
  const db = getDb();
  const userId = req.user.id;
  const clientId = req.user.clientId;

  const user = db.prepare('SELECT id, name, email, username, role, created_at FROM users WHERE id = ?').get(userId);
  const client = clientId ? db.prepare('SELECT * FROM clients WHERE id = ?').get(clientId) : null;
  const sessions = clientId ? db.prepare('SELECT * FROM sessions WHERE client_id = ?').all(clientId) : [];
  const checkins = clientId ? db.prepare('SELECT * FROM weekly_checkins WHERE client_id = ?').all(clientId) : [];
  const progress = clientId ? db.prepare('SELECT * FROM progress_entries WHERE client_id = ?').all(clientId) : [];
  const habits = clientId ? db.prepare('SELECT * FROM habit_logs WHERE client_id = ?').all(clientId) : [];
  const messages = clientId ? db.prepare('SELECT * FROM messages WHERE client_id = ?').all(clientId) : [];
  const diary = clientId ? db.prepare('SELECT * FROM food_mood_entries WHERE client_id = ?').all(clientId) : [];

  const exportData = {
    exported_at: new Date().toISOString(),
    gdpr_notice: 'This export contains all personal data BrazilFit holds about you, as required by GDPR Article 20 (Right to Data Portability).',
    personal_info: user,
    client_profile: client,
    sessions,
    weekly_checkins: checkins,
    progress_entries: progress,
    habit_logs: habits,
    messages,
    food_diary: diary,
  };

  res.setHeader('Content-Disposition', `attachment; filename="brazilfit-data-export-${new Date().toISOString().split('T')[0]}.json"`);
  res.setHeader('Content-Type', 'application/json');
  res.json(exportData);
});

// POST /api/auth/reset-client-data — PT only, wipes all data for a client (temp admin tool)
router.post('/reset-client-data', authenticateToken, async (req, res) => {
  if (req.user.role !== 'pt') return res.status(403).json({ error: 'PT only' });
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'username required' });
  const db = getDb();
  const user = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const client = db.prepare("SELECT id FROM clients WHERE user_id = ?").get(user.id);
  if (!client) return res.status(404).json({ error: 'Client not found' });
  const clientId = client.id;
  const tables = ['sessions','weekly_checkins','habit_logs','progress_entries','progress_photos','messages','food_mood_entries','shopping_list_items','client_routines','notifications','blocks'];
  for (const table of tables) {
    try { db.prepare(`DELETE FROM ${table} WHERE client_id = ?`).run(clientId); } catch(e) {}
  }
  try { db.prepare(`UPDATE clients SET sessions_used=0, sessions_remaining=0, current_block_number=0, last_payment_date=NULL, block_start_date=NULL WHERE id=?`).run(clientId); } catch(e) {}
  res.json({ message: `All data reset for ${username} — account intact` });
});

// POST /api/auth/update-client-name — PT only
router.post('/update-client-name', authenticateToken, (req, res) => {
  if (req.user.role !== 'pt') return res.status(403).json({ error: 'PT only' });
  const { username, name } = req.body;
  if (!username || !name) return res.status(400).json({ error: 'username and name required' });
  const db = getDb();
  const user = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
  if (!user) return res.status(404).json({ error: 'User not found' });
  db.prepare("UPDATE users SET name = ? WHERE id = ?").run(name, user.id);
  res.json({ message: `Name updated to ${name}` });
});

module.exports = router;
