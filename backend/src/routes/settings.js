const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Get client settings
router.get('/:clientId', (req, res) => {
  const db = getDb();
  const clientId = parseInt(req.params.clientId);

  if (req.user.role === 'client' && parseInt(req.user.clientId) !== clientId) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const settings = db.prepare('SELECT * FROM client_settings WHERE client_id = ?').get(clientId);

    if (!settings) {
      // Create default settings if they don't exist
      db.prepare(`
        INSERT INTO client_settings (client_id) VALUES (?)
      `).run(clientId);
      const newSettings = db.prepare('SELECT * FROM client_settings WHERE client_id = ?').get(clientId);
      return res.json(newSettings || {});
    }

    res.json(settings);
  } catch (err) {
    console.error('Failed to fetch settings:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update client settings
router.put('/:clientId', (req, res) => {
  const db = getDb();
  const clientId = parseInt(req.params.clientId);

  if (req.user.role === 'client' && parseInt(req.user.clientId) !== clientId) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    // Ensure settings row exists
    const exists = db.prepare('SELECT id FROM client_settings WHERE client_id = ?').get(clientId);
    if (!exists) {
      db.prepare('INSERT INTO client_settings (client_id) VALUES (?)').run(clientId);
    }

    const updates = req.body;
    const fields = [];
    const values = [];

    // Get actual columns in the live DB
    const existingCols = db.prepare('PRAGMA table_info(client_settings)').all().map(c => c.name);

    // Whitelist allowed fields — only ones that exist in the live DB
    const allowedFields = [
      'firstName', 'lastName', 'dateOfBirth', 'gender', 'hometown', 'bio',
      'fitnessGoals', 'fitnessLevel',
      'weightUnit', 'heightUnit', 'distanceUnit',
      'sessionReminder1h', 'sessionReminder24h', 'sessionCompleted', 'missedSession',
      'blockReminder2', 'blockReminder1', 'ptMessage',
      'shareProgress', 'shareHabits', 'shareCheckins', 'showOnLeaderboard',
      'analytics', 'marketing',
      'weeklyCheckInReminder', 'habitStreakReminders', 'dailyHabitReminder', 'dailyHabitReminderTime',
      'newChallengeNotification', 'challengeCompletedNotification', 'leaderboardUpdateNotification',
      'newMessageNotification', 'ptRepliedNotification',
      'badgeEarnedNotification', 'milestoneReachedNotification',
      'allNotifications',
      'country', 'language'
    ].filter(f => existingCols.includes(f));

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        // Convert booleans to integers for SQLite
        values.push(typeof value === 'boolean' ? (value ? 1 : 0) : value);
      }
    }

    if (fields.length === 0) {
      return res.json({ message: 'No valid fields to update' });
    }

    if (existingCols.includes('updated_at')) {
      fields.push('updated_at = ?');
      values.push(new Date().toISOString());
    }

    const query = `UPDATE client_settings SET ${fields.join(', ')} WHERE client_id = ?`;
    values.push(clientId);

    db.prepare(query).run(...values);

    // Return updated settings
    const updatedSettings = db.prepare('SELECT * FROM client_settings WHERE client_id = ?').get(clientId);
    res.json(updatedSettings);
  } catch (err) {
    console.error('Failed to update settings:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Download user data
router.get('/:clientId/download-data', (req, res) => {
  const db = getDb();
  const clientId = parseInt(req.params.clientId);

  if (req.user.role === 'client' && parseInt(req.user.clientId) !== clientId) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    // Gather all user data
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(clientId);
    const settings = db.prepare('SELECT * FROM client_settings WHERE client_id = ?').get(clientId);
    const sessions = db.prepare('SELECT * FROM sessions WHERE client_id = ? ORDER BY date DESC').all(clientId);
    const habitLogs = db.prepare('SELECT * FROM habit_logs WHERE client_id = ? ORDER BY log_date DESC').all(clientId);
    const checkins = db.prepare('SELECT * FROM checkins WHERE client_id = ? ORDER BY date DESC').all(clientId);
    const messages = db.prepare('SELECT * FROM messages WHERE sender_id = ? OR recipient_id = ? ORDER BY created_at DESC').all(clientId, clientId);
    const notes = db.prepare('SELECT * FROM client_notes WHERE client_id = ? ORDER BY created_at DESC').all(clientId);

    const userData = {
      exportDate: new Date().toISOString(),
      profile: client,
      settings: settings,
      sessions: sessions,
      habitLogs: habitLogs,
      weeklyCheckins: checkins,
      messages: messages,
      notes: notes,
    };

    // Send as JSON for now (could be converted to PDF)
    res.json(userData);
  } catch (err) {
    console.error('Failed to download data:', err);
    res.status(500).json({ error: 'Failed to download data' });
  }
});

// Get notification preferences
router.get('/:clientId/notifications', (req, res) => {
  const db = getDb();
  const clientId = parseInt(req.params.clientId);

  if (req.user.role === 'client' && parseInt(req.user.clientId) !== clientId) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const settings = db.prepare(`
      SELECT
        allNotifications,
        sessionReminder1h,
        sessionReminder24h,
        sessionCompleted,
        missedSession,
        blockReminder1,
        blockReminder2,
        weeklyCheckInReminder,
        habitStreakReminders,
        dailyHabitReminder,
        dailyHabitReminderTime,
        newChallengeNotification,
        challengeCompletedNotification,
        leaderboardUpdateNotification,
        newMessageNotification,
        ptRepliedNotification,
        badgeEarnedNotification,
        milestoneReachedNotification
      FROM client_settings WHERE client_id = ?
    `).get(clientId);

    if (!settings) {
      return res.json({});
    }

    res.json(settings);
  } catch (err) {
    console.error('Failed to fetch notification preferences:', err);
    res.status(500).json({ error: 'Failed to fetch notification preferences' });
  }
});

// Update notification preferences
router.put('/:clientId/notifications', (req, res) => {
  const db = getDb();
  const clientId = parseInt(req.params.clientId);

  if (req.user.role === 'client' && parseInt(req.user.clientId) !== clientId) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const { allNotifications } = req.body;

    // If master toggle is off, disable all notifications
    const notifCols = db.prepare('PRAGMA table_info(client_settings)').all().map(c => c.name);
    if (allNotifications === false) {
      const offFields = [
        'sessionReminder1h','sessionReminder24h','sessionCompleted','missedSession',
        'blockReminder1','blockReminder2','weeklyCheckInReminder','habitStreakReminders',
        'dailyHabitReminder','newChallengeNotification','challengeCompletedNotification',
        'leaderboardUpdateNotification','newMessageNotification','ptRepliedNotification',
        'badgeEarnedNotification','milestoneReachedNotification','allNotifications'
      ].filter(f => notifCols.includes(f));
      if (offFields.length > 0) {
        db.prepare(`UPDATE client_settings SET ${offFields.map(f => f + ' = 0').join(', ')} WHERE client_id = ?`).run(clientId);
      }
    } else if (notifCols.includes('allNotifications')) {
      db.prepare('UPDATE client_settings SET allNotifications = 1 WHERE client_id = ?').run(clientId);
    }

    const updated = db.prepare('SELECT * FROM client_settings WHERE client_id = ?').get(clientId);
    res.json(updated);
  } catch (err) {
    console.error('Failed to update notification preferences:', err);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
});

// Get privacy settings
router.get('/:clientId/privacy', (req, res) => {
  const db = getDb();
  const clientId = parseInt(req.params.clientId);

  if (req.user.role === 'client' && parseInt(req.user.clientId) !== clientId) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const settings = db.prepare(`
      SELECT
        shareProgress,
        shareHabits,
        shareCheckins,
        showOnLeaderboard,
        analytics,
        marketing
      FROM client_settings WHERE client_id = ?
    `).get(clientId);

    res.json(settings || {});
  } catch (err) {
    console.error('Failed to fetch privacy settings:', err);
    res.status(500).json({ error: 'Failed to fetch privacy settings' });
  }
});

// Update privacy settings
router.put('/:clientId/privacy', (req, res) => {
  const db = getDb();
  const clientId = parseInt(req.params.clientId);

  if (req.user.role === 'client' && parseInt(req.user.clientId) !== clientId) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const { shareProgress, shareHabits, shareCheckins, showOnLeaderboard, analytics, marketing } = req.body;

    const fields = [];
    const values = [];

    if (shareProgress !== undefined) {
      fields.push('shareProgress = ?');
      values.push(shareProgress ? 1 : 0);
    }
    if (shareHabits !== undefined) {
      fields.push('shareHabits = ?');
      values.push(shareHabits ? 1 : 0);
    }
    if (shareCheckins !== undefined) {
      fields.push('shareCheckins = ?');
      values.push(shareCheckins ? 1 : 0);
    }
    if (showOnLeaderboard !== undefined) {
      fields.push('showOnLeaderboard = ?');
      values.push(showOnLeaderboard ? 1 : 0);
    }
    if (analytics !== undefined) {
      fields.push('analytics = ?');
      values.push(analytics ? 1 : 0);
    }
    if (marketing !== undefined) {
      fields.push('marketing = ?');
      values.push(marketing ? 1 : 0);
    }

    if (fields.length > 0) {
      fields.push('updated_at = ?');
      values.push(new Date().toISOString());
      values.push(clientId);

      db.prepare(`UPDATE client_settings SET ${fields.join(', ')} WHERE client_id = ?`).run(...values);
    }

    const updated = db.prepare('SELECT * FROM client_settings WHERE client_id = ?').get(clientId);
    res.json(updated);
  } catch (err) {
    console.error('Failed to update privacy settings:', err);
    res.status(500).json({ error: 'Failed to update privacy settings' });
  }
});

// Get units preferences
router.get('/:clientId/units', (req, res) => {
  const db = getDb();
  const clientId = parseInt(req.params.clientId);

  if (req.user.role === 'client' && parseInt(req.user.clientId) !== clientId) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const settings = db.prepare(`
      SELECT weightUnit, heightUnit, distanceUnit FROM client_settings WHERE client_id = ?
    `).get(clientId);

    res.json(settings || { weightUnit: 'KG', heightUnit: 'CM', distanceUnit: 'KM' });
  } catch (err) {
    console.error('Failed to fetch unit preferences:', err);
    res.status(500).json({ error: 'Failed to fetch unit preferences' });
  }
});

module.exports = router;




