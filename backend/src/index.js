const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { getDb } = require('./db/database');
const authRoutes = require('./routes/auth');
const ptRoutes = require('./routes/pt');
const sessionsRoutes = require('./routes/sessions');
const classesRoutes = require('./routes/classes');
const wellnessRoutes = require('./routes/wellness');
const shoppingRoutes = require('./routes/shopping');
const progressRoutes = require('./routes/progress');
const progressProRoutes = require('./routes/progress_pro');
const diaryRoutes = require('./routes/diary');
const checkinsRoutes = require('./routes/checkins');
const badgesRoutes = require('./routes/badges');
const messagesRoutes = require('./routes/messages');
const wearablesRoutes = require('./routes/wearables');
const googleCalendarRoutes = require('./routes/googleCalendar');
const habitsRoutes = require('./routes/habits');
const subscriptionsRoutes = require('./routes/subscriptions');
const quotesRoutes = require('./routes/quotes');
const ttsRoutes    = require('./routes/tts');
const musicRoutes  = require('./routes/music');
const exercisesRoutes  = require('./routes/exercises');
const stretchesRoutes  = require('./routes/stretches');
const routinesRoutes   = require('./routes/routines');
const workoutsRoutes   = require('./routes/workouts');
const workoutTemplatesRoutes = require('./routes/workout-templates');
const assignedWorkoutsRoutes = require('./routes/assigned-workouts');
const onboardingRoutes = require('./routes/onboarding');
const mediaRoutes = require('./routes/media');
const settingsRoutes = require('./routes/settings');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS - Allow Railway domain and localhost for development
const corsOptions = {
  origin: [
    'https://brazilfit-production.up.railway.app',
    'http://localhost:5173',
    'http://localhost:3001',
    'http://192.168.1.129:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Length', 'X-JSON-Response-Length'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// Explicit CORS headers middleware (ensures all responses have CORS headers)
app.use((req, res, next) => {
  const origin = req.get('Origin');
  if (!origin) {
    // Request has no origin, allow it (mobile, curl, etc)
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (origin.startsWith('http://localhost') || !process.env.FRONTEND_URL) {
    // Allow any localhost origin in development
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (process.env.FRONTEND_URL && process.env.FRONTEND_URL.split(',').includes(origin)) {
    // Allow configured origins
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// Body parsing (except webhook which needs raw)
app.use('/api/subscriptions/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize DB
getDb();

// Routes (must come before static files)
app.use('/api/auth', authRoutes);
app.use('/api/pt', ptRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/wellness', wellnessRoutes);
app.use('/api/shopping', shoppingRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/progress', progressProRoutes);
app.use('/api/diary', diaryRoutes);
app.use('/api/checkins', checkinsRoutes);
app.use('/api/badges', badgesRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/wearables',        wearablesRoutes);
app.use('/api/google-calendar',  googleCalendarRoutes);
app.use('/api/habits', habitsRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/quotes', quotesRoutes);
app.use('/api/tts',       ttsRoutes);
app.use('/api/music',     musicRoutes);
app.use('/api/exercises',  exercisesRoutes);
app.use('/api/stretches',  stretchesRoutes);
app.use('/api/routines',   routinesRoutes);
app.use('/api/workouts',   workoutsRoutes);
app.use('/api/workout-templates', workoutTemplatesRoutes);
app.use('/api/assigned-workouts', assignedWorkoutsRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/settings', settingsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'BrazilFit API', version: '1.0.0' });
});

// Serve frontend static files (after API routes so they take priority)
app.use(express.static(path.join(__dirname, '../frontend-dist')));

// Auto-mark sessions at 20:00 Mon-Fri
cron.schedule('0 20 * * 1-5', async () => {
  console.log('[CRON] Auto-marking sessions at 20:00...');
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];

  const result = db.prepare(`
    UPDATE sessions SET status = 'attended', auto_marked = 1
    WHERE status = 'upcoming' AND scheduled_date = ? AND session_type = 'PT'
  `).run(today);

  if (result.changes > 0) {
    // Update client session counts
    const affected = db.prepare(`
      SELECT DISTINCT client_id FROM sessions WHERE status = 'attended' AND auto_marked = 1 AND scheduled_date = ?
    `).all(today);

    for (const { client_id } of affected) {
      const count = db.prepare(`SELECT COUNT(*) as c FROM sessions WHERE client_id = ? AND status = 'attended'`).get(client_id);
      db.prepare('UPDATE clients SET sessions_used = ? WHERE id = ?').run(Math.min(10, count.c), client_id);
    }
    // Send low session alerts
    for (const { client_id } of affected) {
      const client = db.prepare('SELECT sessions_used FROM clients WHERE id = ?').get(client_id);
      const remaining = 10 - (client?.sessions_used || 0);
      if (remaining === 1) {
        try {
          db.prepare(`
            INSERT INTO messages (sender_id, receiver_id, content, created_at)
            SELECT u_pt.id, u_client.id,
              'You have 1 session remaining in your current block. Please contact me to renew.',
              datetime('now')
            FROM clients c
            JOIN users u_client ON c.user_id = u_client.id
            JOIN users u_pt ON u_pt.role = 'pt'
            WHERE c.id = ?
            LIMIT 1
          `).run(client_id);

          // Also push a bell notification
          const clientUser = db.prepare(`SELECT u.name FROM clients c JOIN users u ON c.user_id = u.id WHERE c.id = ?`).get(client_id);
          db.prepare(`INSERT INTO notifications (type, title, message, client_id) VALUES (?, ?, ?, ?)`)
            .run(
              'renewal',
              '1 session remaining ðŸ””',
              `You're on your 9th session â€” just 1 left in your block. Your PT will be in touch to arrange renewal. Keep going ${clientUser?.name || ''}!`,
              client_id
            );
          console.log('[CRON] Low session alert sent to client ' + client_id);
        } catch(e) { console.error('[CRON] Alert error:', e.message); }
      }

      if (remaining === 0) {
        try {
          const clientUser = db.prepare(`SELECT u.name FROM clients c JOIN users u ON c.user_id = u.id WHERE c.id = ?`).get(client_id);
          db.prepare(`INSERT INTO notifications (type, title, message, client_id) VALUES (?, ?, ?, ?)`)
            .run(
              'renewal',
              'Block complete! ðŸ†',
              `Amazing â€” you've completed all 10 sessions! Contact your PT to start your next block and keep your momentum.`,
              client_id
            );
        } catch(e) { console.error('[CRON] Block complete notification error:', e.message); }
      }
    }
    console.log('[CRON] Auto-marked ' + result.changes + ' sessions');
  }
});

// Auto-renew Google Calendar webhook daily at 06:00
cron.schedule('0 6 * * *', async () => {
  console.log('[CRON] Checking Google Calendar webhook renewal...');
  try {
    const db = getDb();
    const ptUser = db.prepare("SELECT id, google_access_token, google_refresh_token, webhook_expiry FROM users WHERE role = 'pt' AND google_calendar_connected = 1 LIMIT 1").get();
    if (!ptUser?.google_access_token) return;

    // Renew if expiring within 2 days
    const twoDaysFromNow = Date.now() + (2 * 24 * 60 * 60 * 1000);
    if (!ptUser.webhook_expiry || ptUser.webhook_expiry < twoDaysFromNow) {
      console.log('[CRON] Webhook expiring soon â€” renewing...');

      // Refresh access token if needed
      let accessToken = ptUser.google_access_token;
      if (ptUser.google_refresh_token) {
        const r = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            refresh_token: ptUser.google_refresh_token,
            grant_type: 'refresh_token',
          }),
        });
        const tokens = await r.json();
        if (tokens.access_token) {
          accessToken = tokens.access_token;
          db.prepare("UPDATE users SET google_access_token = ? WHERE id = ?").run(accessToken, ptUser.id);
        }
      }

      // Register new webhook
      const webhookUrl = `${process.env.RAILWAY_PUBLIC_URL || 'https://brazilfit-production.up.railway.app'}/api/google-calendar/webhook`;
      const channelId = `brazilfit-${Date.now()}`;
      const expiration = Date.now() + (7 * 24 * 60 * 60 * 1000);

      const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events/watch', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: channelId, type: 'web_hook', address: webhookUrl, expiration: expiration.toString() }),
      });
      const data = await res.json();
      if (!data.error) {
        db.prepare("UPDATE users SET webhook_channel_id = ?, webhook_expiry = ? WHERE id = ?").run(channelId, expiration, ptUser.id);
        console.log('[CRON] âœ… Webhook renewed until', new Date(expiration).toISOString());
      } else {
        console.error('[CRON] Webhook renewal failed:', data.error.message);
      }
    } else {
      console.log('[CRON] Webhook still valid â€” no renewal needed');
    }
  } catch(e) {
    console.error('[CRON] Webhook renewal error:', e.message);
  }
});

// SPA fallback - route all non-API requests to index.html
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../frontend-dist/index.html'));
  } else {
    // API request that didn't match any route - return 404
    res.status(404).json({ error: 'API endpoint not found' });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

PORT, '0.0.0.0', () => {
  console.log('');
  console.log('âš¡ BrazilFit API running on http://0.0.0.0:' + PORT + ' (accessible at http://192.168.1.74:' + PORT + ')');
  console.log('ðŸ‹ï¸  Train smarter. Live better.');
  console.log('');
  console.log('ðŸ“š API Endpoints:');
  console.log('   POST /api/auth/login');
  console.log('   GET  /api/pt/schedule/today');
  console.log('   GET  /api/pt/blocks');
  console.log('   GET  /api/pt/income');
  console.log('');
});
// ONE-TIME CLEANUP ROUTE
app.get('/api/cleanup-duplicates', (req, res) => {
  try {
    const dupes = ['andy.devlin','chris.siddle','clare.moody','filomena','hilary','james','jaquetta','laura','louisa','louise','lucy','lucy.clarke','lynne','michelle.pegg','noah','puja','sharon.langridge','sharon','sue.crawley','andy','chris','chrissie','clare','craig','michelle','neil','sofia','sue'].map(u => u + '@brazilfit.app');
    let deleted = 0;
    for (const email of dupes) {
      const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
      if (!user) continue;
      const client = db.prepare('SELECT id FROM clients WHERE user_id = ?').get(user.id);
      if (client) {
        db.prepare('DELETE FROM blocks WHERE client_id = ?').run(client.id);
        db.prepare('DELETE FROM client_settings WHERE client_id = ?').run(client.id);
        db.prepare('DELETE FROM sessions WHERE client_id = ?').run(client.id);
        db.prepare('DELETE FROM clients WHERE id = ?').run(client.id);
      }
      db.prepare('DELETE FROM users WHERE id = ?').run(user.id);
      deleted++;
    }
    db.prepare("UPDATE clients SET block_price = 400 WHERE client_type = 'F2F' AND block_price = 500").run();
    db.prepare("UPDATE clients SET block_price = 350 WHERE client_type = 'Online'").run();
    res.json({ message: 'Done', deleted });
  } catch(e) { res.status(500).json({ error: e.message }); }
});