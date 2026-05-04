const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken, requirePT } = require('../middleware/auth');

router.use(authenticateToken);

// Get all tips (clients only see appropriate content)
router.get('/tips', (req, res) => {
  const db = getDb();
  const isPro = req.user.isPro;

  let tips;
  if (req.user.role === 'pt') {
    tips = db.prepare('SELECT * FROM nutrition_tips ORDER BY created_at DESC').all();
  } else if (isPro) {
    tips = db.prepare('SELECT * FROM nutrition_tips ORDER BY is_featured DESC, created_at DESC').all();
  } else {
    // Free: only featured tip
    tips = db.prepare('SELECT * FROM nutrition_tips WHERE is_featured = 1 ORDER BY created_at DESC LIMIT 1').all();
  }
  res.json(tips);
});

// Get tip of the week (rotates per client login)
router.get('/tip-of-week', (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;

  // Get all tips and pick a random one
  const tips = db.prepare(`
    SELECT * FROM nutrition_tips
    ORDER BY RANDOM()
    LIMIT 1
  `).all();

  const tip = tips.length > 0 ? tips[0] : null;

  // If client, log which tip they saw this session
  if (clientId && tip) {
    const sessionKey = `tip_${clientId}_${new Date().toISOString().split('T')[0]}`;
    // Could be enhanced to track which tips client has seen this week
  }

  res.json(tip || null);
});

// Get meal ideas
router.get('/meals', (req, res) => {
  const db = getDb();
  const isPro = req.user.isPro;
  const clientId = req.user.clientId;

  let meals;
  if (!isPro && req.user.role === 'client') {
    meals = db.prepare('SELECT * FROM meal_ideas WHERE is_active = 1 LIMIT 3').all();
  } else {
    meals = db.prepare('SELECT * FROM meal_ideas WHERE is_active = 1 ORDER BY created_at DESC').all();
  }

  // Add favorites if client
  if (clientId) {
    const favorites = db.prepare('SELECT meal_id FROM client_meal_favorites WHERE client_id = ?').all(clientId);
    const favSet = new Set(favorites.map(f => f.meal_id));
    meals = meals.map(m => ({ ...m, isFavorite: favSet.has(m.id) }));
  }

  res.json(meals);
});

// Toggle favorite meal
router.post('/meals/:id/favorite', (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  if (!clientId) return res.status(403).json({ error: 'Clients only' });

  const existing = db.prepare('SELECT id FROM client_meal_favorites WHERE client_id = ? AND meal_id = ?').get(clientId, req.params.id);
  if (existing) {
    db.prepare('DELETE FROM client_meal_favorites WHERE client_id = ? AND meal_id = ?').run(clientId, req.params.id);
    res.json({ favorited: false });
  } else {
    db.prepare('INSERT INTO client_meal_favorites (client_id, meal_id) VALUES (?, ?)').run(clientId, req.params.id);
    res.json({ favorited: true });
  }
});

// Get client's private notes from PT
router.get('/notes/:clientId', (req, res) => {
  const db = getDb();
  const clientId = parseInt(req.params.clientId);

  if (req.user.role === 'client' && req.user.clientId !== clientId) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const notes = db.prepare(`
    SELECT * FROM client_notes WHERE client_id = ? ORDER BY created_at DESC
  `).all(clientId);

  const progressNote = notes.find(n => n.is_progress_note);
  res.json({ notes, progressNote: progressNote || null });
});

// PT updates or adds a note
router.post('/notes', requirePT, (req, res) => {
  const db = getDb();
  const { client_id, content, note_type, is_progress_note } = req.body;
  const result = db.prepare(`
    INSERT INTO client_notes (client_id, created_by, note_type, content, is_progress_note)
    VALUES (?, ?, ?, ?, ?)
  `).run(client_id, req.user.id, note_type || 'general', content, is_progress_note ? 1 : 0);
  res.json({ id: result.lastInsertRowid, message: 'Note posted' });
});

// Get all challenges
router.get('/challenges', (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  const challenges = db.prepare(`
    SELECT wc.*, COUNT(cp.id) as participant_count
    FROM weekly_challenges wc
    LEFT JOIN challenge_participants cp ON cp.challenge_id = wc.id
    GROUP BY wc.id
    ORDER BY wc.start_date DESC
  `).all();

  if (clientId) {
    const joined = db.prepare('SELECT challenge_id FROM challenge_participants WHERE client_id = ?').all(clientId);
    const joinedSet = new Set(joined.map(j => j.challenge_id));
    return res.json(challenges.map(c => ({ ...c, hasJoined: joinedSet.has(c.id) })));
  }

  res.json(challenges);
});

// Get mind & wellness content
router.get('/mind', (req, res) => {
  const db = getDb();
  const isPro = req.user.isPro;

  const allContent = db.prepare(
    'SELECT * FROM wellness_content WHERE is_active = 1 ORDER BY type, is_featured DESC, created_at ASC'
  ).all();

  if (req.user.role === 'pt' || isPro) {
    return res.json(allContent);
  }

  // Free users: one preview item per type (the featured one, or first)
  const types = ['mindfulness', 'breathing', 'rest_day', 'mental_wellness', 'stress'];
  const preview = types.map(type => {
    const items = allContent.filter(c => c.type === type);
    return items[0] || null;
  }).filter(Boolean);

  res.json({ preview, isLimited: true });
});

// Join a challenge
router.post('/challenges/:id/join', (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  if (!clientId) return res.status(403).json({ error: 'Clients only' });

  try {
    db.prepare('INSERT INTO challenge_participants (challenge_id, client_id) VALUES (?, ?)').run(req.params.id, clientId);
    res.json({ message: 'Joined challenge' });
  } catch {
    res.status(400).json({ error: 'Already joined' });
  }
});


// TEMP: Update wellness content
router.patch("/content/:id", (req, res) => {
  if (req.user.role !== "pt") return res.status(403).json({ error: "PT only" });
  const db = getDb();
  const { content } = req.body;
  db.prepare("UPDATE wellness_content SET content = ? WHERE id = ?").run(content, req.params.id);
  res.json({ ok: true });
});

module.exports = router;
