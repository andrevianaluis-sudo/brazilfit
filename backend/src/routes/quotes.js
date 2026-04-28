const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Get today's quote for this client
router.get('/today', (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  const today = new Date().toISOString().split('T')[0];

  // Check for a PT custom quote: client-specific takes priority over global
  const customQuote = db.prepare(`
    SELECT * FROM pt_custom_quotes
    WHERE show_date = ? AND is_active = 1
      AND (client_id = ? OR client_id IS NULL)
    ORDER BY CASE WHEN client_id IS NOT NULL THEN 0 ELSE 1 END
    LIMIT 1
  `).get(today, clientId || -1);

  let quote;
  if (customQuote) {
    quote = {
      id: customQuote.id,
      quote: customQuote.quote,
      author: customQuote.author,
      source: 'pt_custom',
    };
  } else {
    // Deterministic daily rotation from library
    const totalRes = db.prepare('SELECT COUNT(*) as n FROM daily_quotes').get();
    const total = totalRes.n;
    if (total === 0) return res.json(null);

    const epoch = new Date('2024-01-01').getTime();
    const todayMs = new Date(today + 'T00:00:00').getTime();
    const dayIndex = Math.floor((todayMs - epoch) / 86400000);
    const offset = ((dayIndex % total) + total) % total;

    const libQuote = db.prepare('SELECT * FROM daily_quotes ORDER BY id LIMIT 1 OFFSET ?').get(offset);
    quote = { id: libQuote.id, quote: libQuote.quote, author: libQuote.author, source: 'library' };
  }

  // Check if this client has favorited it
  if (clientId) {
    const fav = db.prepare(
      'SELECT id FROM client_quote_favorites WHERE client_id = ? AND quote_text = ?'
    ).get(clientId, quote.quote);
    quote.isFavorited = !!fav;
  } else {
    quote.isFavorited = false;
  }

  res.json(quote);
});

// Get client's saved favourite quotes
router.get('/favorites', (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  if (!clientId) return res.status(403).json({ error: 'Clients only' });

  const favorites = db.prepare(
    'SELECT * FROM client_quote_favorites WHERE client_id = ? ORDER BY saved_at DESC'
  ).all(clientId);

  res.json(favorites);
});

// Toggle a quote as favourite
router.post('/favorite', (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  if (!clientId) return res.status(403).json({ error: 'Clients only' });

  const { quote_text, quote_author } = req.body;
  if (!quote_text) return res.status(400).json({ error: 'quote_text required' });

  const existing = db.prepare(
    'SELECT id FROM client_quote_favorites WHERE client_id = ? AND quote_text = ?'
  ).get(clientId, quote_text);

  if (existing) {
    db.prepare(
      'DELETE FROM client_quote_favorites WHERE client_id = ? AND quote_text = ?'
    ).run(clientId, quote_text);
    return res.json({ favorited: false });
  }

  db.prepare(
    'INSERT INTO client_quote_favorites (client_id, quote_text, quote_author) VALUES (?, ?, ?)'
  ).run(clientId, quote_text, quote_author || 'Unknown');

  res.json({ favorited: true });
});

module.exports = router;
