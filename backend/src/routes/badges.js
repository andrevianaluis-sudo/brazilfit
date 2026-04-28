const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

// Require Pro for all routes
function requirePro(req, res, next) {
  if (!req.user?.isPro) {
    return res.status(403).json({ error: 'Pro feature required' });
  }
  next();
}

// GET /api/badges - Get all available badges
router.get('/', authenticateToken, requirePro, (req, res) => {
  const db = getDb();
  const badges = db.prepare(`
    SELECT * FROM achievement_badges
    ORDER BY id ASC
  `).all();

  res.json({ badges });
});

// GET /api/badges/earned - Get client's earned badges
router.get('/earned', authenticateToken, requirePro, (req, res) => {
  const db = getDb();
  const earnedBadges = db.prepare(`
    SELECT ab.id, ab.badge_type, ab.display_name, ab.description, ab.icon_emoji, ab.color, cbe.earned_at, cbe.notes, u.name as awarded_by_name
    FROM client_badges_earned cbe
    JOIN achievement_badges ab ON ab.id = cbe.badge_id
    LEFT JOIN users u ON u.id = cbe.awarded_by
    WHERE cbe.client_id = ?
    ORDER BY cbe.earned_at DESC
  `).all(req.user.clientId);

  res.json({ badges: earnedBadges });
});

// GET /api/badges/progress - Get progress toward next badges
router.get('/progress', authenticateToken, requirePro, (req, res) => {
  const db = getDb();

  // Get all badges
  const allBadges = db.prepare('SELECT * FROM achievement_badges ORDER BY id ASC').all();

  // Get earned badges
  const earnedBadgeIds = db.prepare(`
    SELECT badge_id FROM client_badges_earned WHERE client_id = ?
  `).all(req.user.clientId).map(row => row.badge_id);

  // Get session count for this client
  const sessionData = db.prepare(`
    SELECT COUNT(*) as total_sessions FROM sessions WHERE client_id = ?
  `).get(req.user.clientId);

  // Get habit check count for this client
  const habitData = db.prepare(`
    SELECT COUNT(*) as total_habits FROM habit_checks WHERE client_id = ?
  `).get(req.user.clientId);

  // Get check-in count
  const checkinData = db.prepare(`
    SELECT COUNT(*) as total_checkins FROM weekly_checkins WHERE client_id = ?
  `).get(req.user.clientId);

  const totalSessions = sessionData?.total_sessions || 0;
  const totalHabits = habitData?.total_habits || 0;
  const totalCheckins = checkinData?.total_checkins || 0;

  // Calculate progress for each badge
  const progress = allBadges.map(badge => {
    const isEarned = earnedBadgeIds.includes(badge.id);
    let progressPercent = 0;
    let progressText = '';
    let currentValue = 0;
    let targetValue = 0;

    switch (badge.badge_type) {
      case 'first_session':
        currentValue = totalSessions > 0 ? 1 : 0;
        targetValue = 1;
        progressPercent = (currentValue / targetValue) * 100;
        progressText = currentValue > 0 ? 'Completed' : 'Complete your first session';
        break;
      case 'sessions_5':
        currentValue = totalSessions;
        targetValue = 5;
        progressPercent = Math.min((currentValue / targetValue) * 100, 100);
        progressText = `${currentValue} of ${targetValue} sessions`;
        break;
      case 'block_complete':
        currentValue = totalSessions;
        targetValue = 10;
        progressPercent = Math.min((currentValue / targetValue) * 100, 100);
        progressText = `${currentValue} of ${targetValue} sessions in a block`;
        break;
      case 'habit_30':
        currentValue = totalHabits;
        targetValue = 30;
        progressPercent = Math.min((currentValue / targetValue) * 100, 100);
        progressText = `${currentValue} of ${targetValue} days`;
        break;
      case 'habit_60':
        currentValue = totalHabits;
        targetValue = 60;
        progressPercent = Math.min((currentValue / targetValue) * 100, 100);
        progressText = `${currentValue} of ${targetValue} days`;
        break;
      case 'personal_best':
        progressText = 'Achieve a new personal best';
        progressPercent = isEarned ? 100 : 0;
        break;
      case 'attender_4weeks':
        progressText = 'Complete 4 weeks without missing';
        progressPercent = isEarned ? 100 : 0;
        break;
      case 'early_bird':
        currentValue = db.prepare(`
          SELECT COUNT(*) as count FROM sessions
          WHERE client_id = ? AND time(start_time) < '09:00:00'
        `).get(req.user.clientId)?.count || 0;
        targetValue = 5;
        progressPercent = Math.min((currentValue / targetValue) * 100, 100);
        progressText = `${currentValue} of ${targetValue} morning sessions`;
        break;
      case 'wellness_10':
        currentValue = db.prepare(`
          SELECT COUNT(*) as count FROM sessions
          WHERE client_id = ? AND session_type IN ('meditation', 'breathing')
        `).get(req.user.clientId)?.count || 0;
        targetValue = 10;
        progressPercent = Math.min((currentValue / targetValue) * 100, 100);
        progressText = `${currentValue} of ${targetValue} wellness sessions`;
        break;
      case 'checkin_champion':
        currentValue = totalCheckins;
        targetValue = 8;
        progressPercent = Math.min((currentValue / targetValue) * 100, 100);
        progressText = `${currentValue} of ${targetValue} check-ins`;
        break;
      default:
        progressPercent = isEarned ? 100 : 0;
    }

    return {
      id: badge.id,
      badge_type: badge.badge_type,
      display_name: badge.display_name,
      description: badge.description,
      icon_emoji: badge.icon_emoji,
      color: badge.color,
      isEarned,
      progressPercent: Math.round(progressPercent),
      progressText,
      currentValue,
      targetValue
    };
  });

  res.json({ progress });
});

// POST /api/badges/check - Check if client earned new badges (internal - called after session/habit/checkin)
router.post('/check', authenticateToken, (req, res) => {
  // This endpoint can be called internally or after certain events
  // Returns newly earned badges
  const db = getDb();
  const clientId = req.user.clientId || req.body.clientId;

  if (!clientId) {
    return res.status(400).json({ error: 'clientId required' });
  }

  const newlyEarned = [];

  // Check each badge type
  const badges = db.prepare('SELECT * FROM achievement_badges').all();

  badges.forEach(badge => {
    // Skip if already earned
    const existing = db.prepare(`
      SELECT id FROM client_badges_earned WHERE client_id = ? AND badge_id = ?
    `).get(clientId, badge.id);

    if (existing) return;

    let shouldEarn = false;

    switch (badge.badge_type) {
      case 'first_session': {
        const count = db.prepare('SELECT COUNT(*) as c FROM sessions WHERE client_id = ?').get(clientId)?.c || 0;
        shouldEarn = count >= 1;
        break;
      }
      case 'sessions_5': {
        const count = db.prepare('SELECT COUNT(*) as c FROM sessions WHERE client_id = ?').get(clientId)?.c || 0;
        shouldEarn = count >= 5;
        break;
      }
      case 'block_complete': {
        const count = db.prepare('SELECT COUNT(*) as c FROM sessions WHERE client_id = ?').get(clientId)?.c || 0;
        shouldEarn = count >= 10;
        break;
      }
      case 'habit_30': {
        const count = db.prepare('SELECT COUNT(*) as c FROM habit_checks WHERE client_id = ?').get(clientId)?.c || 0;
        shouldEarn = count >= 30;
        break;
      }
      case 'habit_60': {
        const count = db.prepare('SELECT COUNT(*) as c FROM habit_checks WHERE client_id = ?').get(clientId)?.c || 0;
        shouldEarn = count >= 60;
        break;
      }
      case 'early_bird': {
        const count = db.prepare(`
          SELECT COUNT(*) as c FROM sessions
          WHERE client_id = ? AND time(start_time) < '09:00:00'
        `).get(clientId)?.c || 0;
        shouldEarn = count >= 5;
        break;
      }
      case 'wellness_10': {
        const count = db.prepare(`
          SELECT COUNT(*) as c FROM sessions
          WHERE client_id = ? AND session_type IN ('meditation', 'breathing')
        `).get(clientId)?.c || 0;
        shouldEarn = count >= 10;
        break;
      }
      case 'checkin_champion': {
        const count = db.prepare('SELECT COUNT(*) as c FROM weekly_checkins WHERE client_id = ?').get(clientId)?.c || 0;
        shouldEarn = count >= 8;
        break;
      }
    }

    if (shouldEarn) {
      try {
        const result = db.prepare(`
          INSERT INTO client_badges_earned (client_id, badge_id)
          VALUES (?, ?)
        `).run(clientId, badge.id);

        newlyEarned.push({
          id: badge.id,
          badge_type: badge.badge_type,
          display_name: badge.display_name,
          icon_emoji: badge.icon_emoji,
          color: badge.color
        });
      } catch (err) {
        // Already earned, skip
      }
    }
  });

  res.json({ newlyEarned, message: `Awarded ${newlyEarned.length} badge(s)` });
});

// POST /api/pt/badges/award - PT awards custom badge to client
router.post('/pt/award', authenticateToken, (req, res) => {
  if (req.user.role !== 'pt') {
    return res.status(403).json({ error: 'PT only' });
  }

  const { clientId, badge_id, notes } = req.body;

  if (!clientId || !badge_id) {
    return res.status(400).json({ error: 'clientId and badge_id required' });
  }

  const db = getDb();
  try {
    const result = db.prepare(`
      INSERT INTO client_badges_earned (client_id, badge_id, awarded_by, notes)
      VALUES (?, ?, ?, ?)
    `).run(clientId, badge_id, req.user.id, notes || null);

    res.json({ id: result.lastInsertRowid, message: 'Badge awarded' });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Badge already earned' });
    }
    res.status(500).json({ error: 'Failed to award badge' });
  }
});

// GET /api/pt/badges/weekly - Badges earned by all clients this week
router.get('/pt/weekly', authenticateToken, (req, res) => {
  if (req.user.role !== 'pt') {
    return res.status(403).json({ error: 'PT only' });
  }

  const db = getDb();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const weeklyBadges = db.prepare(`
    SELECT ab.display_name, ab.icon_emoji, cbe.earned_at, u.name as client_name, c.id as client_id
    FROM client_badges_earned cbe
    JOIN achievement_badges ab ON ab.id = cbe.badge_id
    JOIN clients c ON c.id = cbe.client_id
    JOIN users u ON u.id = c.user_id
    WHERE c.pt_id = ? AND cbe.earned_at >= ?
    ORDER BY cbe.earned_at DESC
  `).all(req.user.id, weekAgo);

  res.json({ badges: weeklyBadges });
});

module.exports = router;
