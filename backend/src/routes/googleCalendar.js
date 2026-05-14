const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'https://brazilfit-production.up.railway.app/api/google-calendar/callback';

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

// POST /api/google-calendar/sync — sync ALL calendar events to sessions/classes
router.post('/sync', authenticateToken, async (req, res) => {
  if (req.user.role !== 'pt') return res.status(403).json({ error: 'PT only' });
  const db = getDb();
  const user = db.prepare("SELECT google_access_token, google_refresh_token FROM users WHERE id = ?").get(req.user.id);
  if (!user?.google_access_token) return res.status(400).json({ error: 'Google Calendar not connected' });

  let accessToken = user.google_access_token;

  try {
    let events = await fetchCalendarEvents(accessToken);

    // Refresh token if expired
    if (events.error?.code === 401 && user.google_refresh_token) {
      const refreshed = await refreshAccessToken(user.google_refresh_token);
      accessToken = refreshed.access_token;
      db.prepare("UPDATE users SET google_access_token = ? WHERE id = ?").run(accessToken, req.user.id);
      events = await fetchCalendarEvents(accessToken);
    }

    const allEvents = events.items || [];
    const clients = db.prepare("SELECT c.id, u.name FROM clients c JOIN users u ON u.id = c.user_id").all();

    const CLASS_KEYWORDS = ['pilates', 'dance', 'meditation', 'yoga', 'vision support', 'hot pilates', 'cardio', 'hiit', 'zumba', 'spinning', 'bootcamp', 'class', 'group', 'breakfast club', 'fusion'];

    // Events to completely ignore (old clients, personal events etc)
    const IGNORE_KEYWORDS = ['martial arts', 'sofia martial'];

    let sessionsCreated = 0, classesCreated = 0, skipped = 0;

    for (const event of allEvents) {
      const title = event.summary || 'Unnamed Event';
      const titleLower = title.toLowerCase();

      const startDateTime = event.start?.dateTime || event.start?.date;
      if (!startDateTime) { skipped++; continue; }

      // Parse time in UK timezone
      let date, time;
      if (startDateTime.includes('T')) {
        const d = new Date(startDateTime);
        const ukTime = d.toLocaleString('en-GB', { timeZone: 'Europe/London', hour12: false });
        const parts = ukTime.split(', ');
        const dateParts = parts[0].split('/');
        date = `${dateParts[2]}-${dateParts[1].padStart(2,'0')}-${dateParts[0].padStart(2,'0')}`;
        time = parts[1].substring(0, 5);
        if (time === '24:00') time = '00:00';
      } else {
        date = startDateTime;
        time = '09:00';
      }
      const dayOfWeek = new Date(date + 'T12:00:00').getDay();

      // Skip ignored events
      if (IGNORE_KEYWORDS.some(k => titleLower.includes(k))) { skipped++; continue; }

      // Try to match to a client
      const client = matchClientFromTitle(title, clients);

      if (client) {
        // It's a PT session — create as session
        const existing = db.prepare("SELECT id FROM sessions WHERE client_id = ? AND scheduled_date = ? AND scheduled_time = ?")
          .get(client.id, date, time);
        if (existing) { skipped++; continue; }
        db.prepare(`INSERT INTO sessions (client_id, scheduled_date, scheduled_time, status, google_event_id) VALUES (?, ?, ?, 'upcoming', ?)`)
          .run(client.id, date, time, event.id || null);
        sessionsCreated++;
      } else if (titleLower.includes('pt') || titleLower.includes('1:1') || titleLower.includes('1-1')) {
        // Has PT in name but no client match — skip it, don't create as class
        skipped++;
      } else {
        // No PT in name — treat as a group class with exact calendar title
        const existing = db.prepare("SELECT id FROM classes WHERE name = ? AND day_of_week = ? AND class_time = ?")
          .get(title, dayOfWeek, time);
        if (existing) { skipped++; continue; }
        db.prepare(`INSERT INTO classes (name, day_of_week, class_time, payment_type, flat_fee, is_active) VALUES (?, ?, ?, 'flat', 0, 1)`)
          .run(title, dayOfWeek, time);
        classesCreated++;
      }
    }

    res.json({ sessionsCreated, classesCreated, skipped, total: allEvents.length });
  } catch(e) {
    console.error('Sync error:', e);
    res.status(500).json({ error: 'Sync failed: ' + e.message });
  }
});

// DELETE /api/google-calendar/wipe — wipe all Google-imported sessions and classes
router.delete('/wipe', authenticateToken, (req, res) => {
  if (req.user.role !== 'pt') return res.status(403).json({ error: 'PT only' });
  const db = getDb();
  const r1 = db.prepare("DELETE FROM sessions WHERE google_event_id IS NOT NULL").run();
  const r2 = db.prepare("DELETE FROM classes").run();
  res.json({ sessionsDeleted: r1.changes, classesDeleted: r2.changes });
});

// DELETE /api/google-calendar/disconnect
router.delete('/disconnect', authenticateToken, (req, res) => {
  if (req.user.role !== 'pt') return res.status(403).json({ error: 'PT only' });
  const db = getDb();
  db.prepare("UPDATE users SET google_access_token = NULL, google_refresh_token = NULL, google_calendar_connected = 0 WHERE id = ?").run(req.user.id);
  res.json({ message: 'Disconnected' });
});

module.exports = router;

// GET /api/google-calendar/debug — show raw calendar events for today
router.get('/debug', authenticateToken, async (req, res) => {
  if (req.user.role !== 'pt') return res.status(403).json({ error: 'PT only' });
  const db = getDb();
  const user = db.prepare("SELECT google_access_token FROM users WHERE id = ?").get(req.user.id);
  if (!user?.google_access_token) return res.status(400).json({ error: 'Not connected' });
  
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 7);
  
  const params = new URLSearchParams({
    timeMin: today.toISOString(),
    timeMax: tomorrow.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '50',
  });
  
  const r = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`, {
    headers: { Authorization: `Bearer ${user.google_access_token}` },
  });
  const data = await r.json();
  
  // Return simplified view of events
  const events = (data.items || []).map(e => ({
    title: e.summary,
    start: e.start?.dateTime || e.start?.date,
    id: e.id,
  }));
  
  res.json({ count: events.length, events });
});
