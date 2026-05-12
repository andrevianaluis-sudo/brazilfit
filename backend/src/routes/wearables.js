const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

const OW_API_URL = process.env.OPEN_WEARABLES_URL || 'https://backend-production-3bd4d.up.railway.app';
const OW_API_KEY = process.env.OPEN_WEARABLES_API_KEY || '';

async function owFetch(path, options = {}) {
  const res = await fetch(`${OW_API_URL}/api/v1${path}`, {
    ...options,
    headers: {
      'X-Open-Wearables-API-Key': OW_API_KEY,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`OW API error: ${res.status}`);
  return res.json();
}

// GET /api/wearables/connections - get client's connected devices
router.get('/connections', authenticateToken, async (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  if (!clientId) return res.status(403).json({ error: 'Clients only' });

  try {
    const client = db.prepare('SELECT ow_user_id FROM clients WHERE id = ?').get(clientId);
    if (!client?.ow_user_id) return res.json([]);

    const data = await owFetch(`/users/${client.ow_user_id}/connections`);
    res.json(data || []);
  } catch (e) {
    console.error('OW connections error:', e.message);
    res.json([]);
  }
});

// POST /api/wearables/connect - initiate OAuth for a provider
router.post('/connect', authenticateToken, async (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  if (!clientId) return res.status(403).json({ error: 'Clients only' });

  const { provider } = req.body;
  if (!provider) return res.status(400).json({ error: 'Provider required' });

  try {
    let client = db.prepare('SELECT ow_user_id, id FROM clients WHERE id = ?').get(clientId);
    const user = db.prepare('SELECT name, email FROM users WHERE id = (SELECT user_id FROM clients WHERE id = ?)').get(clientId);

    // Create OW user if not exists
    if (!client?.ow_user_id) {
      const owUser = await owFetch('/users', {
        method: 'POST',
        body: JSON.stringify({
          external_user_id: `brazilfit_client_${clientId}`,
          name: user?.name || 'BrazilFit Client',
          email: user?.email || `client_${clientId}@brazilfit.app`,
        }),
      });
      db.prepare('UPDATE clients SET ow_user_id = ? WHERE id = ?').run(owUser.id, clientId);
      client = { ow_user_id: owUser.id };
    }

    // Generate connection link
    const link = await owFetch(`/users/${client.ow_user_id}/connection-link`, {
      method: 'POST',
      body: JSON.stringify({ provider }),
    });

    res.json({ auth_url: link.url || link.connection_url || link.link });
  } catch (e) {
    console.error('OW connect error:', e.message);
    res.status(500).json({ error: 'Failed to initiate connection' });
  }
});

// DELETE /api/wearables/connections/:provider - disconnect a device
router.delete('/connections/:provider', authenticateToken, async (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  if (!clientId) return res.status(403).json({ error: 'Clients only' });

  try {
    const client = db.prepare('SELECT ow_user_id FROM clients WHERE id = ?').get(clientId);
    if (!client?.ow_user_id) return res.status(404).json({ error: 'No connected devices' });

    await owFetch(`/users/${client.ow_user_id}/connections/${req.params.provider}`, { method: 'DELETE' });
    res.json({ message: 'Disconnected' });
  } catch (e) {
    console.error('OW disconnect error:', e.message);
    res.status(500).json({ error: 'Failed to disconnect' });
  }
});

// GET /api/wearables/daily/:date - get daily health data
router.get('/daily/:date', authenticateToken, async (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  if (!clientId) return res.status(403).json({ error: 'Clients only' });

  try {
    const client = db.prepare('SELECT ow_user_id FROM clients WHERE id = ?').get(clientId);
    if (!client?.ow_user_id) return res.json(null);

    const data = await owFetch(`/users/${client.ow_user_id}/activity?date=${req.params.date}`);
    res.json(data || null);
  } catch (e) {
    res.json(null);
  }
});

// POST /api/wearables/sync - trigger manual sync
router.post('/sync', authenticateToken, async (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  if (!clientId) return res.status(403).json({ error: 'Clients only' });

  try {
    const client = db.prepare('SELECT ow_user_id FROM clients WHERE id = ?').get(clientId);
    if (!client?.ow_user_id) return res.status(404).json({ error: 'No connected devices' });

    await owFetch(`/users/${client.ow_user_id}/sync`, { method: 'POST' });
    res.json({ message: 'Sync started' });
  } catch (e) {
    res.status(500).json({ error: 'Sync failed' });
  }
});

module.exports = router;
