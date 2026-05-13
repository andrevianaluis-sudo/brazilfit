const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.RAILWAY_PUBLIC_DOMAIN
  ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}/api/google-calendar/callback`
  : 'https://brazilfit-production.up.railway.app/api/google-calendar/callback';

function getOAuthUrl() {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
    access_type: 'offline',
    prompt: 'consent',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

async function getTokens(code) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code, client_id: CLIENT_ID, client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI, grant_type: 'authorization_code',
    }),
  });
  return res.json();
}

async function refreshAccessToken(refreshToken) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID, client_secret: CLIENT_SECRET,
      refresh_token: refreshToken, grant_type: 'refresh_token',
    }),
  });
  return res.json();
}

async function fetchCalendarEvents(accessToken) {
  const now = new Date();
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const sixMonthsAhead = new Date(now);
  sixMonthsAhead.setMonth(sixMonthsAhead.getMonth() + 6);

  const params = new URLSearchParams({
    timeMin: sixMonthsAgo.toISOString(),
    timeMax: sixMonthsAhead.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '500',
    q: 'PT',
  });

  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.json();
}

function matchClientFromTitle(title, clients) {
  if (!title) return null;
  const titleLower = title.toLowerCase();
  for (const client of clients) {
    const nameParts = client.name.toLowerCase().split(' ');
    for (const part of nameParts) {
      if (part.length > 2 && titleLower.includes(part)) return client;
    }
  }
  return null;
}

// GET /api/google-calendar/auth — start OAuth flow
router.get('/auth', authenticateToken, (req, res) => {
  if (req.user.role !== 'pt') return res.status(403).json({ error: 'PT only' });
  res.json({ url: getOAuthUrl() });
});

// GET /api/google-calendar/callback — handle OAuth callback
router.get('/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.redirect('/pt?calendar=error');
  try {
    const tokens = await getTokens(code);
    if (!tokens.access_token) return res.redirect('/pt?calendar=error');
    const db = getDb();
    // Store tokens for PT user
    try { db.exec(`ALTER TABLE users ADD COLUMN google_access_token TEXT`); } catch(e) {}
    try { db.exec(`ALTER TABLE users ADD COLUMN google_refresh_token TEXT`); } catch(e) {}
    try { db.exec(`ALTER TABLE users ADD COLUMN google_calendar_connected INTEGER DEFAULT 0`); } catch(e) {}
    const ptUser = db.prepare("SELECT id FROM users WHERE role = 'pt' LIMIT 1").get();
    if (ptUser) {
      db.prepare("UPDATE users SET google_access_token = ?, google_refresh_token = ?, google_calendar_connected = 1 WHERE id = ?")
        .run(tokens.access_token, tokens.refresh_token || null, ptUser.id);
    }
    res.redirect('/pt?calendar=connected');
  } catch(e) {
    console.error('Google callback error:', e);
    res.redirect('/pt?calendar=error');
  }
});

// GET /api/google-calendar/status — check if connected
router.get('/status', authenticateToken, (req, res) => {
  if (req.user.role !== 'pt') return res.status(403).json({ error: 'PT only' });
  const db = getDb();
  const user = db.prepare("SELECT google_calendar_connected FROM users WHERE id = ?").get(req.user.id);
  res.json({ connected: !!(user?.google_calendar_connected) });
});

// POST /api/google-calendar/sync — sync calendar events to sessions
router.post('/sync', authenticateToken, async (req, res) => {
  if (req.user.role !== 'pt') return res.status(403).json({ error: 'PT only' });
  const db = getDb();
  const user = db.prepare("SELECT google_access_token, google_refresh_token FROM users WHERE id = ?").get(req.user.id);
  if (!user?.google_access_token) return res.status(400).json({ error: 'Google Calendar not connected' });

  let accessToken = user.google_access_token;

  // Try to refresh token if needed
  try {
    const events = await fetchCalendarEvents(accessToken);
    if (events.error?.code === 401 && user.google_refresh_token) {
      const refreshed = await refreshAccessToken(user.google_refresh_token);
      accessToken = refreshed.access_token;
      db.prepare("UPDATE users SET google_access_token = ? WHERE id = ?").run(accessToken, req.user.id);
    }

    const allEvents = events.items || [];
    const clients = db.prepare("SELECT c.id, u.name FROM clients c JOIN users u ON u.id = c.user_id").all();

    let created = 0, skipped = 0, unmatched = [];

    for (const event of allEvents) {
      const title = event.summary || '';
      if (!title.toLowerCase().includes('pt') && !title.toLowerCase().includes('session')) { skipped++; continue; }

      const client = matchClientFromTitle(title, clients);
      if (!client) { unmatched.push(title); skipped++; continue; }

      const startDateTime = event.start?.dateTime || event.start?.date;
      const endDateTime = event.end?.dateTime || event.end?.date;
      if (!startDateTime) { skipped++; continue; }

      const date = startDateTime.split('T')[0];
      const time = startDateTime.includes('T') ? startDateTime.split('T')[1].substring(0, 5) : '09:00';

      // Check if session already exists
      const existing = db.prepare("SELECT id FROM sessions WHERE client_id = ? AND scheduled_date = ? AND scheduled_time = ?")
        .get(client.id, date, time);
      if (existing) { skipped++; continue; }

      // Create the session
      db.prepare(`INSERT INTO sessions (client_id, scheduled_date, scheduled_time, duration_minutes, status, google_event_id)
        VALUES (?, ?, ?, ?, 'upcoming', ?) ON CONFLICT DO NOTHING`)
        .run(client.id, date, time, 60, event.id || null);
      created++;
    }

    res.json({ created, skipped, unmatched: [...new Set(unmatched)], total: allEvents.length });
  } catch(e) {
    console.error('Sync error:', e);
    res.status(500).json({ error: 'Sync failed: ' + e.message });
  }
});

// DELETE /api/google-calendar/disconnect
router.delete('/disconnect', authenticateToken, (req, res) => {
  if (req.user.role !== 'pt') return res.status(403).json({ error: 'PT only' });
  const db = getDb();
  db.prepare("UPDATE users SET google_access_token = NULL, google_refresh_token = NULL, google_calendar_connected = 0 WHERE id = ?").run(req.user.id);
  res.json({ message: 'Disconnected' });
});

module.exports = router;
