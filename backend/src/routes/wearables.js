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

// GET /api/wearables/devices - Get connected devices for client
router.get('/devices', authenticateToken, requirePro, (req, res) => {
  const db = getDb();
  const devices = db.prepare(`
    SELECT id, device_type, is_active, last_sync, sync_error
    FROM wearable_devices
    WHERE client_id = ?
    ORDER BY device_type ASC
  `).all(req.user.clientId);

  res.json({ devices });
});

// POST /api/wearables/connect - Start OAuth flow for device
router.post('/connect', authenticateToken, requirePro, (req, res) => {
  const db = getDb();
  const { device_type } = req.body;

  if (!device_type || !['apple_health', 'garmin', 'oura'].includes(device_type)) {
    return res.status(400).json({ error: 'Invalid device_type' });
  }

  // Check if already connected
  const existing = db.prepare(`
    SELECT id FROM wearable_devices WHERE client_id = ? AND device_type = ?
  `).get(req.user.clientId, device_type);

  if (existing) {
    return res.status(400).json({ error: `${device_type} already connected` });
  }

  let authUrl = '';
  const redirectUri = `${process.env.BACKEND_URL || 'http://localhost:3003'}/api/wearables/callback`;
  const state = require('crypto').randomBytes(16).toString('hex');

  // Store state in database temporarily (expires in 10 minutes)
  db.prepare(`
    INSERT INTO wearable_devices (client_id, device_type, access_token)
    VALUES (?, ?, ?)
  `).run(req.user.clientId, device_type, `pending:${state}`);

  switch (device_type) {
    case 'apple_health':
      // Apple Health uses native iOS SDK - return instructions
      authUrl = 'native://apple-health-connect';
      break;
    case 'garmin':
      authUrl = `https://connect.garmin.com/oauthConfirm?client_id=${process.env.GARMIN_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
      break;
    case 'oura':
      authUrl = `https://cloud.ouraring.com/oauth/authorize?client_id=${process.env.OURA_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=personal&state=${state}`;
      break;
  }

  res.json({ authUrl, state, message: `Connecting ${device_type}` });
});

// POST /api/wearables/callback - Receive OAuth callback from device service
router.post('/callback', (req, res) => {
  const db = getDb();
  const { code, state, device_type, user_id } = req.body;

  if (!code || !state || !device_type || !user_id) {
    return res.status(400).json({ error: 'Missing callback parameters' });
  }

  // Find the pending device connection
  const device = db.prepare(`
    SELECT * FROM wearable_devices WHERE device_type = ? AND access_token LIKE ?
  `).get(device_type, `pending:${state}%`);

  if (!device) {
    return res.status(400).json({ error: 'Invalid state or device not found' });
  }

  let accessToken = '';
  let refreshToken = '';

  try {
    // Exchange code for tokens (simplified - actual implementation depends on service)
    switch (device_type) {
      case 'garmin':
        // Call Garmin OAuth endpoint
        accessToken = `garmin_token_${Date.now()}`; // Placeholder
        refreshToken = `garmin_refresh_${Date.now()}`; // Placeholder
        break;
      case 'oura':
        // Call Oura OAuth endpoint
        accessToken = `oura_token_${Date.now()}`; // Placeholder
        refreshToken = `oura_refresh_${Date.now()}`; // Placeholder
        break;
      default:
        return res.status(400).json({ error: 'Device type not supported for OAuth' });
    }

    // Update device with tokens
    db.prepare(`
      UPDATE wearable_devices
      SET access_token = ?, refresh_token = ?, is_active = 1, last_sync = datetime('now')
      WHERE id = ?
    `).run(accessToken, refreshToken, device.id);

    res.json({ message: `${device_type} connected successfully` });
  } catch (err) {
    // Mark as error
    db.prepare(`
      UPDATE wearable_devices SET sync_error = ? WHERE id = ?
    `).run(err.message, device.id);

    res.status(500).json({ error: 'Failed to connect device' });
  }
});

// DELETE /api/wearables/devices/:id - Disconnect device
router.delete('/devices/:id', authenticateToken, requirePro, (req, res) => {
  const db = getDb();
  const device = db.prepare(`
    SELECT client_id FROM wearable_devices WHERE id = ?
  `).get(req.params.id);

  if (!device || device.client_id !== req.user.clientId) {
    return res.status(404).json({ error: 'Device not found' });
  }

  db.prepare('DELETE FROM wearable_devices WHERE id = ?').run(req.params.id);
  res.json({ message: 'Device disconnected' });
});

// GET /api/wearables/daily/:date - Get daily metrics for a date
router.get('/daily/:date', authenticateToken, requirePro, (req, res) => {
  const db = getDb();
  const { date } = req.params;

  const metrics = db.prepare(`
    SELECT * FROM wearable_daily_data
    WHERE client_id = ? AND data_date = ?
  `).get(req.user.clientId, date);

  res.json({ metrics: metrics || null });
});

// GET /api/wearables/weekly - Get weekly summary
router.get('/weekly', authenticateToken, requirePro, (req, res) => {
  const db = getDb();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const weeklyData = db.prepare(`
    SELECT
      AVG(steps) as avg_steps,
      AVG(heart_rate_avg) as avg_heart_rate,
      AVG(active_calories) as avg_active_calories,
      AVG(sleep_duration) as avg_sleep_duration,
      AVG(sleep_quality) as avg_sleep_quality,
      AVG(hrv) as avg_hrv,
      COUNT(*) as days_tracked
    FROM wearable_daily_data
    WHERE client_id = ? AND data_date >= ?
  `).get(req.user.clientId, weekAgo);

  res.json({
    summary: {
      avgSteps: Math.round(weeklyData?.avg_steps || 0),
      avgHeartRate: Math.round(weeklyData?.avg_heart_rate || 0),
      avgActiveCalories: Math.round(weeklyData?.avg_active_calories || 0),
      avgSleepDuration: (weeklyData?.avg_sleep_duration || 0).toFixed(1),
      avgSleepQuality: Math.round(weeklyData?.avg_sleep_quality || 0),
      avgHRV: (weeklyData?.avg_hrv || 0).toFixed(1),
      daysTracked: weeklyData?.days_tracked || 0
    }
  });
});

// GET /api/wearables/readiness - Get today's readiness score
router.get('/readiness', authenticateToken, requirePro, (req, res) => {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];

  const readiness = db.prepare(`
    SELECT readiness_score, readiness_recommendation, data_source
    FROM wearable_daily_data
    WHERE client_id = ? AND data_date = ?
  `).get(req.user.clientId, today);

  res.json({
    readinessScore: readiness?.readiness_score || null,
    recommendation: readiness?.readiness_recommendation || 'No data',
    dataSource: readiness?.data_source || null
  });
});

// POST /api/wearables/sync - Manual sync trigger
router.post('/sync', authenticateToken, requirePro, (req, res) => {
  const db = getDb();
  const devices = db.prepare(`
    SELECT * FROM wearable_devices WHERE client_id = ? AND is_active = 1
  `).all(req.user.clientId);

  const syncResults = [];

  devices.forEach(device => {
    try {
      // Simulate sync (actual implementation would call device APIs)
      const today = new Date().toISOString().split('T')[0];

      // Check if data already exists for today
      const existing = db.prepare(`
        SELECT id FROM wearable_daily_data WHERE client_id = ? AND data_date = ? AND data_source = ?
      `).get(req.user.clientId, today, device.device_type);

      if (!existing) {
        // Insert dummy data for today (in real implementation, fetch from device API)
        db.prepare(`
          INSERT INTO wearable_daily_data
          (client_id, data_date, steps, heart_rate_avg, active_calories, sleep_duration, sleep_quality, data_source, synced_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `).run(
          req.user.clientId,
          today,
          7500 + Math.floor(Math.random() * 3000), // Random steps
          70 + Math.floor(Math.random() * 20), // Random HR
          300 + Math.floor(Math.random() * 200), // Random calories
          7.5 + (Math.random() * 1.5), // Random sleep duration
          75 + Math.floor(Math.random() * 20), // Random sleep quality
          device.device_type,
        );
      }

      // Update last_sync
      db.prepare(`
        UPDATE wearable_devices SET last_sync = datetime('now'), sync_error = NULL WHERE id = ?
      `).run(device.id);

      syncResults.push({ device: device.device_type, status: 'success' });
    } catch (err) {
      db.prepare(`
        UPDATE wearable_devices SET sync_error = ? WHERE id = ?
      `).run(err.message, device.id);

      syncResults.push({ device: device.device_type, status: 'error', error: err.message });
    }
  });

  res.json({ syncResults, message: `Synced ${devices.length} device(s)` });
});

// ── PT DASHBOARD ────────────────────────────────────────────────────────────

// GET /api/pt/clients/:clientId/wearables - PT views client wearable data
router.get('/pt/clients/:clientId', authenticateToken, (req, res) => {
  if (req.user.role !== 'pt') {
    return res.status(403).json({ error: 'PT only' });
  }

  const db = getDb();
  const { clientId } = req.params;

  // Verify PT owns this client
  const client = db.prepare(`
    SELECT id FROM clients WHERE id = ? AND pt_id = ?
  `).get(clientId, req.user.id);

  if (!client) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  // Get devices
  const devices = db.prepare(`
    SELECT device_type, is_active, last_sync FROM wearable_devices WHERE client_id = ?
  `).all(clientId);

  // Get latest daily data (last 7 days)
  const recentData = db.prepare(`
    SELECT * FROM wearable_daily_data
    WHERE client_id = ?
    ORDER BY data_date DESC
    LIMIT 7
  `).all(clientId);

  // Get today's readiness
  const today = new Date().toISOString().split('T')[0];
  const todayReadiness = db.prepare(`
    SELECT readiness_score, readiness_recommendation FROM wearable_daily_data
    WHERE client_id = ? AND data_date = ?
  `).get(clientId, today);

  res.json({
    devices,
    recentData,
    todayReadiness: todayReadiness || null
  });
});

module.exports = router;
