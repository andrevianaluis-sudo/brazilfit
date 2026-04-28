const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Get achievements for a client
router.get('/:clientId', (req, res) => {
  const db = getDb();
  const { clientId } = req.params;

  try {
    // Check access - client can only view their own achievements
    if (req.user.role === 'client' && req.user.clientId != clientId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const achievements = {
      trophies: [],
      milestones: [],
      streaks: [],
      workouts: [],
      latest: null,
    };

    // Get session count for milestone badges
    const sessionCount = db.prepare(`
      SELECT COUNT(*) as count FROM sessions
      WHERE client_id = ? AND status = 'attended'
    `).get(clientId);

    const count = sessionCount?.count || 0;

    // Unlock milestones based on session count
    const milestoneThresholds = [1, 3, 5, 7, 10, 15, 20, 25, 30, 40, 50, 75, 100];
    milestoneThresholds.forEach(threshold => {
      if (count >= threshold) {
        achievements.milestones.push(`milestone-${threshold}`);
      }
    });

    // Get streak info
    const streakData = db.prepare(`
      SELECT COALESCE(MAX(habit_streak), 0) as current_streak FROM habit_logs
      WHERE client_id = ?
    `).get(clientId);

    const streak = streakData?.current_streak || 0;

    // Unlock streak badges
    if (streak >= 2) achievements.streaks.push('streak-weeks-2');
    if (streak >= 3) achievements.streaks.push('streak-weeks-3');
    if (streak >= 4) achievements.streaks.push('streak-weeks-4');
    if (streak >= 5) achievements.streaks.push('streak-weeks-5');
    if (streak >= 6) achievements.streaks.push('streak-weeks-6');
    if (streak >= 7) achievements.streaks.push('streak-weeks-7');

    // Get this week's session count for workout badges
    const monday = new Date();
    monday.setDate(monday.getDate() - monday.getDay() + 1);
    const mondayStr = monday.toISOString().split('T')[0];

    const weekCount = db.prepare(`
      SELECT COUNT(*) as count FROM sessions
      WHERE client_id = ? AND scheduled_date >= ? AND status = 'attended'
    `).get(clientId, mondayStr);

    const weekSessions = weekCount?.count || 0;

    // Unlock workout badges
    if (weekSessions >= 2) achievements.workouts.push('workout-2');
    if (weekSessions >= 3) achievements.workouts.push('workout-3');
    if (weekSessions >= 4) achievements.workouts.push('workout-4');
    if (weekSessions >= 5) achievements.workouts.push('workout-5');
    if (weekSessions >= 6) achievements.workouts.push('workout-6');
    if (weekSessions >= 7) achievements.workouts.push('workout-7');

    // Assign trophy badges based on achievements
    if (count >= 1) achievements.trophies.push('first-session');
    if (count >= 10) achievements.trophies.push('block-complete');
    if (streak >= 7) achievements.trophies.push('consistent');

    // Set latest achievement
    if (achievements.milestones.length > 0 || achievements.trophies.length > 0) {
      const allBadges = [
        ...achievements.milestones.map(b => ({ id: b, type: 'milestone' })),
        ...achievements.trophies.map(b => ({ id: b, type: 'trophy' })),
      ];
      const latestBadge = allBadges[allBadges.length - 1];
      achievements.latest = {
        name: latestBadge.id.replace(/-/g, ' ').toUpperCase(),
        date_earned: new Date().toLocaleDateString('en-GB'),
      };
    }

    res.json(achievements);
  } catch (err) {
    console.error('Failed to fetch achievements:', err);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

module.exports = router;
