const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Get leaderboard data
router.get('/', (req, res) => {
  const { type = 'current_week' } = req.query;
  const db = getDb();

  try {
    let query = `
      SELECT
        c.id as client_id,
        u.name,
        SUBSTR(u.name, 1, 1) as initials,
        c.is_anonymous,
        COUNT(s.id) as total_sessions,
        SUM(CASE WHEN s.status = 'attended' THEN 1 ELSE 0 END) as attended_sessions
      FROM clients c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN sessions s ON c.id = s.client_id
    `;

    if (type === 'current_week') {
      const monday = new Date();
      monday.setDate(monday.getDate() - monday.getDay() + 1);
      const mondayStr = monday.toISOString().split('T')[0];

      query += `
        WHERE s.scheduled_date >= ? OR s.id IS NULL
        GROUP BY c.id, u.name, c.is_anonymous
        ORDER BY attended_sessions DESC, total_sessions DESC
      `;

      const leaderboard = db.prepare(query).all(mondayStr).map((row, idx) => ({
        rank: idx + 1,
        ...row,
        sessions_this_week: row.attended_sessions || 0,
      }));

      // Get current user stats
      const userStats = db.prepare(`
        SELECT
          COUNT(DISTINCT s.id) as total_sessions,
          SUM(CASE WHEN s.scheduled_date >= ? AND s.status = 'attended' THEN 1 ELSE 0 END) as sessions_this_week,
          (SELECT COUNT(*) FROM checkins WHERE client_id = ? AND checkin_date >= ?) as checkins
        FROM sessions s
        WHERE s.client_id = ?
      `).get(mondayStr, req.user.clientId, mondayStr, req.user.clientId);

      const userRank = leaderboard.findIndex(entry => entry.client_id === req.user.clientId) + 1 || leaderboard.length + 1;

      res.json({
        leaderboard: leaderboard.slice(0, 10),
        userStats: {
          total_sessions: userStats?.total_sessions || 0,
          sessions_this_week: userStats?.sessions_this_week || 0,
          checkins: userStats?.checkins || 0,
          badges: 0,
          streak: 0,
          current_rank: userRank,
        },
      });
    } else {
      query += `
        GROUP BY c.id, u.name, c.is_anonymous
        ORDER BY attended_sessions DESC, total_sessions DESC
      `;

      const leaderboard = db.prepare(query).all().map((row, idx) => ({
        rank: idx + 1,
        ...row,
      }));

      const userStats = db.prepare(`
        SELECT
          COUNT(DISTINCT s.id) as total_sessions,
          SUM(CASE WHEN s.status = 'attended' THEN 1 ELSE 0 END) as attended_sessions,
          (SELECT COUNT(*) FROM checkins WHERE client_id = ?) as checkins
        FROM sessions s
        WHERE s.client_id = ?
      `).get(req.user.clientId, req.user.clientId);

      const userRank = leaderboard.findIndex(entry => entry.client_id === req.user.clientId) + 1 || leaderboard.length + 1;

      res.json({
        leaderboard: leaderboard.slice(0, 10),
        userStats: {
          total_sessions: userStats?.attended_sessions || 0,
          sessions_this_week: userStats?.attended_sessions || 0,
          checkins: userStats?.checkins || 0,
          badges: 0,
          streak: 0,
          current_rank: userRank,
        },
      });
    }
  } catch (err) {
    console.error('Failed to fetch leaderboard:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;
