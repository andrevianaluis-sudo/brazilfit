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
  // Start from beginning of today to catch all of today's events
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sixMonthsAhead = new Date(now);
  sixMonthsAhead.setMonth(sixMonthsAhead.getMonth() + 6);

  const params = new URLSearchParams({
    timeMin: todayStart.toISOString(),
    timeMax: sixMonthsAhead.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '2500',
  });

  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.json();
}

// Manual overrides â€” calendar name fragment â†’ BrazilFit client name fragment
const NAME_ALIASES = {
  'filo': 'filomena',
  'lyin': 'lynne',
  'chrissie': 'chrissie',
  'christine': 'chrissie',
  'jaquetta': 'jaquetta',
  'hilary': 'hilary',
  'vivien': 'vivien',
  'sharon l': 'sharon langridge',
  'sharon p': 'sharon langridge',
  'michelle p': 'michelle pegg',
  'lucy c': 'lucy clarke',
  'lucy pt': 'lucy',
  'chris s': 'chris siddle',
  'andy d': 'andy devlin',
  'sue c': 'sue crawley',
  'clare m': 'clare moody',
};

// Events to completely ignore
const IGNORE_EVENTS = [
  'martial arts', 'sofia martial', 'hong le', 'appointment', 'school holiday',
  'spring', 'corpo', 'sofia&papai', 'papai', 'freeman', 'first aid', 'foot clinic',
  'saturday foot', 'sofia pick', 'pick up school', 'breakfast club',
];

// Special pair sessions â€” calendar title â†’ combined display name
const PAIR_SESSIONS = {
  'laura/james': 'Laura & James',
  'james/laura': 'Laura & James',
};

function matchClientFromTitle(title, clients) {
  if (!title) return null;
  const titleLower = title.toLowerCase().trim();

  // Check for pair sessions first â€” match to Laura's account
  for (const [pair, display] of Object.entries(PAIR_SESSIONS)) {
    if (titleLower.includes(pair)) {
      const client = clients.find(c => c.name.toLowerCase().includes('laura'));
      if (client) return { ...client, display_name: display };
    }
  }

  // Apply aliases
  let searchTitle = titleLower;
  for (const [alias, real] of Object.entries(NAME_ALIASES)) {
    if (titleLower.includes(alias)) {
      searchTitle = real;
      break;
    }
  }

  // Try exact first name match
  for (const client of clients) {
    const nameParts = client.name.toLowerCase().split(' ');
    for (const part of nameParts) {
      if (part.length > 2 && searchTitle.includes(part)) return client;
    }
  }
  return null;
}

// GET /api/google-calendar/auth â€” start OAuth flow
router.get('/auth', authenticateToken, (req, res) => {
  if (req.user.role !== 'pt') return res.status(403).json({ error: 'PT only' });
  res.json({ url: getOAuthUrl() });
});

// GET /api/google-calendar/callback â€” handle OAuth callback
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

// GET /api/google-calendar/status â€” check if connected
router.get('/status', authenticateToken, (req, res) => {
  if (req.user.role !== 'pt') return res.status(403).json({ error: 'PT only' });
  const db = getDb();
  const user = db.prepare("SELECT google_calendar_connected FROM users WHERE id = ?").get(req.user.id);
  res.json({ connected: !!(user?.google_calendar_connected) });
});

// POST /api/google-calendar/sync â€” sync ALL calendar events to sessions/classes
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

    const CLASS_KEYWORDS = ['pilates', 'dance', 'meditation', 'yoga', 'vision support', 'hot pilates', 'cardio', 'hiit', 'zumba', 'spinning', 'bootcamp', 'class', 'group', 'breakfast club', 'fusion', 'newcastle vision'];

    let sessionsCreated = 0, classesCreated = 0, skipped = 0;

    for (const event of allEvents) {
      const title = event.summary || 'Unnamed Event';
      const titleLower = title.toLowerCase();

      const startDateTime = event.start?.dateTime || event.start?.date;
      if (!startDateTime) { skipped++; continue; }

      // Parse time in UK timezone
      // Google sends times like "2026-05-14T09:00:00+01:00" - extract time directly
      let date, time;
      if (startDateTime.includes('T')) {
        // Extract the local time part before any timezone offset
        // "2026-05-14T09:00:00+01:00" â†’ date="2026-05-14", time="09:00"
        const withoutOffset = startDateTime.replace(/([+-]\d{2}:\d{2}|Z)$/, '');
        date = withoutOffset.split('T')[0];
        time = withoutOffset.split('T')[1].substring(0, 5);
      } else {
        date = startDateTime;
        time = '09:00';
      }
      const dayOfWeek = new Date(date + 'T12:00:00').getDay();

      // Skip ignored events
      if (IGNORE_EVENTS.some(k => titleLower.includes(k))) { skipped++; continue; }

      // Try to match to a client
      const client = matchClientFromTitle(title, clients);

      if (client) {
        // It's a PT session â€” create as session
        const existing = db.prepare("SELECT id FROM sessions WHERE client_id = ? AND scheduled_date = ? AND scheduled_time = ?")
          .get(client.id, date, time);
        if (existing) { skipped++; continue; }
        db.prepare(`INSERT INTO sessions (client_id, scheduled_date, scheduled_time, status, google_event_id, notes) VALUES (?, ?, ?, 'upcoming', ?, ?)`)
          .run(client.id, date, time, event.id || null, client.display_name ? `pair:${client.display_name}` : null);
        sessionsCreated++;
      } else if (titleLower.includes('pt') || titleLower.includes('1:1') || titleLower.includes('1-1')) {
        // Has PT in name but no client match â€” skip it, don't create as class
        skipped++;
      } else {
        // No PT in name â€” treat as a group class with exact calendar title
        // Normalise class names
        let className = title.trim();
        if (className.toLowerCase().includes('newcastle vision support')) className = 'Vision Support';
        if (className.toLowerCase().includes('dance fusion')) className = 'Dance Fusion';
        if (className.toLowerCase().includes('hot pilates')) className = 'Hot Pilates';

        const existing = db.prepare("SELECT id FROM classes WHERE name = ? AND day_of_week = ? AND class_time = ?")
          .get(className, dayOfWeek, time);
        if (existing) { skipped++; continue; }
        db.prepare(`INSERT INTO classes (name, day_of_week, class_time, payment_type, flat_fee, is_active) VALUES (?, ?, ?, 'flat', 0, 1)`)
          .run(className, dayOfWeek, time);
        classesCreated++;
      }
    }

    res.json({ sessionsCreated, classesCreated, skipped, total: allEvents.length });
  } catch(e) {
    console.error('Sync error:', e);
    res.status(500).json({ error: 'Sync failed: ' + e.message });
  }
});

// DELETE /api/google-calendar/wipe â€” wipe all Google-imported sessions and classes
router.delete('/wipe', authenticateToken, (req, res) => {
  if (req.user.role !== 'pt') return res.status(403).json({ error: 'PT only' });
  const db = getDb();
  db.exec('PRAGMA foreign_keys = OFF');
  const r1 = db.prepare("DELETE FROM sessions").run();
  const r2 = db.prepare("DELETE FROM classes").run();
  db.exec('PRAGMA foreign_keys = ON');
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

// GET /api/google-calendar/debug â€” show raw calendar events for today
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

// â”€â”€ Google Calendar Webhook (Push Notifications) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// POST /api/google-calendar/webhook â€” receives push notifications from Google
router.post('/webhook', async (req, res) => {
  // Google sends a ping â€” we verify and trigger a sync
  const channelId = req.headers['x-goog-channel-id'];
  const resourceState = req.headers['x-goog-resource-state'];

  // Always respond 200 immediately to Google
 res.status(200).send('OK');

  // Ignore sync/initial messages
  if (resourceState === 'sync') return;

  // Run async so it never crashes the server
  setImmediate(async () => {
  try {
    const db = getDb();
    // Get PT user's tokens
    const ptUser = db.prepare("SELECT id, google_access_token, google_refresh_token FROM users WHERE role = 'pt' AND google_calendar_connected = 1 LIMIT 1").get();
    if (!ptUser?.google_access_token) return;

    let accessToken = ptUser.google_access_token;

    // Refresh token if needed
    let events = await fetchCalendarEvents(accessToken);
    if (events.error?.code === 401 && ptUser.google_refresh_token) {
      const refreshed = await refreshAccessToken(ptUser.google_refresh_token);
      accessToken = refreshed.access_token;
      db.prepare("UPDATE users SET google_access_token = ? WHERE id = ?").run(accessToken, ptUser.id);
      events = await fetchCalendarEvents(accessToken);
    }

    // Only wipe FUTURE upcoming sessions — preserve history
    const today = new Date().toISOString().split('T')[0];
    db.exec('PRAGMA foreign_keys = OFF');
    db.prepare("DELETE FROM sessions WHERE scheduled_date >= ? AND status = 'upcoming'").run(today);
    db.exec('PRAGMA foreign_keys = ON');

    const allEvents = events.items || [];
    const clients = db.prepare("SELECT c.id, u.name FROM clients c JOIN users u ON u.id = c.user_id").all();

    for (const event of allEvents) {
      const title = event.summary || '';
      const titleLower = title.toLowerCase().trim();
      const startDateTime = event.start?.dateTime || event.start?.date;
      if (!startDateTime) continue;

      if (IGNORE_EVENTS.some(k => titleLower.includes(k))) continue;

      let date, time;
      if (startDateTime.includes('T')) {
        const withoutOffset = startDateTime.replace(/([+-]\d{2}:\d{2}|Z)$/, '');
        date = withoutOffset.split('T')[0];
        time = withoutOffset.split('T')[1].substring(0, 5);
      } else {
        date = startDateTime;
        time = '09:00';
      }
      const dayOfWeek = new Date(date + 'T12:00:00').getDay();
      const client = matchClientFromTitle(title, clients);

      if (client) {
        try {
          db.prepare(`INSERT INTO sessions (client_id, scheduled_date, scheduled_time, status, google_event_id, notes) VALUES (?, ?, ?, 'upcoming', ?, ?)`)
            .run(client.id, date, time, event.id || null, client.display_name ? `pair:${client.display_name}` : null);
        } catch(e) {}
      } else if (!titleLower.includes('pt') && !titleLower.includes('1:1') && !titleLower.includes('1-1')) {
        let className = title.trim();
        if (className.toLowerCase().includes('newcastle vision support')) className = 'Vision Support';
        if (className.toLowerCase().includes('dance fusion')) className = 'Dance Fusion';
        if (className.toLowerCase().includes('hot pilates')) className = 'Hot Pilates';
        try {
          const existing = db.prepare("SELECT id FROM classes WHERE name = ? AND day_of_week = ? AND class_time = ?").get(className, dayOfWeek, time);
          if (!existing) db.prepare(`INSERT INTO classes (name, day_of_week, class_time, payment_type, flat_fee, is_active) VALUES (?, ?, ?, 'flat', 0, 1)`).run(className, dayOfWeek, time);
        } catch(e) {}
      }
    }
    console.log(`âœ… Webhook auto-sync complete: ${allEvents.length} events processed`);
 } catch(e) {
    console.error('Webhook sync error:', e.message);
  }
  }); // end setImmediate
});

// POST /api/google-calendar/register-webhook â€” register webhook with Google
router.post('/register-webhook', authenticateToken, async (req, res) => {
  if (req.user.role !== 'pt') return res.status(403).json({ error: 'PT only' });
  const db = getDb();
  const user = db.prepare("SELECT google_access_token FROM users WHERE id = ?").get(req.user.id);
  if (!user?.google_access_token) return res.status(400).json({ error: 'Google Calendar not connected' });

  const webhookUrl = `${process.env.RAILWAY_PUBLIC_URL || 'https://brazilfit-production.up.railway.app'}/api/google-calendar/webhook`;
  const channelId = `brazilfit-${Date.now()}`;
  const expiration = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days

  try {
    const r = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events/watch', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user.google_access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: channelId,
        type: 'web_hook',
        address: webhookUrl,
        expiration: expiration.toString(),
      }),
    });
    const data = await r.json();
    if (data.error) return res.status(400).json({ error: data.error.message });

    // Store webhook details for renewal
    try { db.exec(`ALTER TABLE users ADD COLUMN webhook_channel_id TEXT`); } catch(e) {}
    try { db.exec(`ALTER TABLE users ADD COLUMN webhook_expiry INTEGER`); } catch(e) {}
    db.prepare("UPDATE users SET webhook_channel_id = ?, webhook_expiry = ? WHERE id = ?").run(channelId, expiration, req.user.id);

    res.json({ message: 'Webhook registered â€” auto-sync is now active!', expiry: new Date(expiration).toISOString() });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});


