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
app.use('/api/wearables', wearablesRoutes);
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
              '1 session remaining 🔔',
              `You're on your 9th session — just 1 left in your block. Your PT will be in touch to arrange renewal. Keep going ${clientUser?.name || ''}!`,
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
              'Block complete! 🏆',
              `Amazing — you've completed all 10 sessions! Contact your PT to start your next block and keep your momentum.`,
              client_id
            );
        } catch(e) { console.error('[CRON] Block complete notification error:', e.message); }
      }
    }
    console.log('[CRON] Auto-marked ' + result.changes + ' sessions');
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

app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('⚡ BrazilFit API running on http://0.0.0.0:' + PORT + ' (accessible at http://192.168.1.74:' + PORT + ')');
  console.log('🏋️  Train smarter. Live better.');
  console.log('');
  console.log('📚 API Endpoints:');
  console.log('   POST /api/auth/login');
  console.log('   GET  /api/pt/schedule/today');
  console.log('   GET  /api/pt/blocks');
  console.log('   GET  /api/pt/income');
  console.log('');
});

module.exports = app;
