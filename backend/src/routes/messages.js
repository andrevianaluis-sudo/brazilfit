const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/messages - Get message thread with PT for client
router.get('/', authenticateToken, (req, res) => {
  const db = getDb();

  // Get the client's PT
  const client = db.prepare(`
    SELECT pt_id FROM clients WHERE user_id = ?
  `).get(req.user.id);

  if (!client || !client.pt_id) {
    return res.json({ messages: [], pt: null });
  }

  // Get all messages between client and their PT
  const messages = db.prepare(`
    SELECT pm.*, u.name as sender_name
    FROM pt_messages pm
    JOIN users u ON u.id = CASE
      WHEN pm.sender_type = 'pt' THEN pm.pt_user_id
      WHEN pm.sender_type = 'client' THEN (SELECT user_id FROM clients WHERE id = pm.client_id)
    END
    WHERE pm.client_id = (SELECT id FROM clients WHERE user_id = ?) AND pm.pt_user_id = ?
    ORDER BY pm.created_at ASC
  `).all(req.user.id, client.pt_id);

  // Get PT info
  const pt = db.prepare(`
    SELECT id, name, email FROM users WHERE id = ?
  `).get(client.pt_id);

  // Mark all messages from PT as read
  db.prepare(`
    UPDATE pt_messages
    SET is_read = 1, read_at = datetime('now')
    WHERE client_id = (SELECT id FROM clients WHERE user_id = ?) AND sender_type = 'pt' AND is_read = 0
  `).run(req.user.id);

  res.json({ messages, pt });
});

// POST /api/messages - Client sends message to PT
router.post('/', authenticateToken, (req, res) => {
  const db = getDb();
  const { message_text } = req.body;

  if (!message_text) {
    return res.status(400).json({ error: 'message_text required' });
  }

  // Get the client record
  const client = db.prepare(`
    SELECT id, pt_id FROM clients WHERE user_id = ?
  `).get(req.user.id);

  if (!client || !client.pt_id) {
    return res.status(400).json({ error: 'No PT assigned' });
  }

  try {
    const result = db.prepare(`
      INSERT INTO pt_messages (client_id, pt_user_id, sender_type, message_text)
      VALUES (?, ?, ?, ?)
    `).run(client.id, client.pt_id, 'client', message_text);

    try { const cu = db.prepare('SELECT u.name FROM users u JOIN clients c ON c.user_id = u.id WHERE c.id = ?').get(client.id); db.prepare('INSERT INTO notifications (type, title, message, client_id) VALUES (?,?,?,?)').run('message', 'New message from ' + (cu ? cu.name : 'Client'), message_text.length>60?message_text.substring(0,60)+'...':message_text, client.id); } catch(e) { console.error('Notif insert error:', e.message); }
    res.json({ id: result.lastInsertRowid, message: 'Message sent' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// GET /api/messages/unread-count - Unread message count for client
router.get('/unread-count', authenticateToken, (req, res) => {
  const db = getDb();

  const result = db.prepare(`
    SELECT COUNT(*) as count FROM pt_messages
    WHERE client_id = (SELECT id FROM clients WHERE user_id = ?) AND sender_type = 'pt' AND is_read = 0
  `).get(req.user.id);

  res.json({ unreadCount: result?.count || 0 });
});

// PUT /api/messages/:id/read - Mark message as read for client
router.put('/:id/read', authenticateToken, (req, res) => {
  const db = getDb();
  const message = db.prepare(`
    SELECT pm.* FROM pt_messages pm
    WHERE pm.id = ? AND pm.client_id = (SELECT id FROM clients WHERE user_id = ?)
  `).get(req.params.id, req.user.id);

  if (!message) {
    return res.status(404).json({ error: 'Message not found' });
  }

  db.prepare(`
    UPDATE pt_messages SET is_read = 1, read_at = datetime('now') WHERE id = ?
  `).run(req.params.id);

  res.json({ message: 'Message marked as read' });
});

// â”€â”€ PT ROUTES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// GET /api/pt/messages - PT gets all unread messages from all clients
router.get('/pt/inbox', authenticateToken, (req, res) => {
  if (req.user.role !== 'pt') {
    return res.status(403).json({ error: 'PT only' });
  }

  const db = getDb();

  const messages = db.prepare(`
    SELECT pm.*, u.name as client_name, c.id as client_id
    FROM pt_messages pm
    JOIN clients c ON c.id = pm.client_id
    JOIN users u ON u.id = c.user_id
    WHERE pm.pt_user_id = ? AND pm.is_read = 0
    ORDER BY pm.created_at DESC
  `).all(req.user.id);

  res.json({ messages });
});

// GET /api/pt/messages/:clientId - PT gets thread with specific client
router.get('/pt/client/:clientId', authenticateToken, (req, res) => {
  if (req.user.role !== 'pt') {
    return res.status(403).json({ error: 'PT only' });
  }

  const db = getDb();
  const clientId = req.params.clientId;

  // Verify PT owns this client
  const client = db.prepare(`
    SELECT id FROM clients WHERE id = ? AND pt_id = ?
  `).get(clientId, req.user.id);

  if (!client) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const messages = db.prepare(`
    SELECT pm.*, u.name as sender_name
    FROM pt_messages pm
    JOIN users u ON u.id = CASE
      WHEN pm.sender_type = 'pt' THEN pm.pt_user_id
      WHEN pm.sender_type = 'client' THEN (SELECT user_id FROM clients WHERE id = pm.client_id)
    END
    WHERE pm.client_id = ?
    ORDER BY pm.created_at ASC
  `).all(clientId);

  // Get client info
  const clientInfo = db.prepare(`
    SELECT u.id, u.name, u.email FROM clients c
    JOIN users u ON u.id = c.user_id
    WHERE c.id = ?
  `).get(clientId);

  // Mark all messages as read
  db.prepare(`
    UPDATE pt_messages SET is_read = 1, read_at = datetime('now')
    WHERE client_id = ? AND sender_type = 'client'
  `).run(clientId);

  res.json({ messages, client: clientInfo });
});

// POST /api/pt/messages/:clientId - PT replies to client
router.post('/pt/client/:clientId', authenticateToken, (req, res) => {
  if (req.user.role !== 'pt') {
    return res.status(403).json({ error: 'PT only' });
  }

  const db = getDb();
  const clientId = req.params.clientId;
  const { message_text } = req.body;

  if (!message_text) {
    return res.status(400).json({ error: 'message_text required' });
  }

  // Verify PT owns this client
  const client = db.prepare(`
    SELECT id FROM clients WHERE id = ? AND pt_id = ?
  `).get(clientId, req.user.id);

  if (!client) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  try {
    const result = db.prepare(`
      INSERT INTO pt_messages (client_id, pt_user_id, sender_type, message_text)
      VALUES (?, ?, ?, ?)
    `).run(clientId, req.user.id, 'pt', message_text);

    try { db.prepare('INSERT INTO notifications (type, title, message, client_id) VALUES (?,?,?,?)').run('message', 'New message from your PT', message_text.length>60?message_text.substring(0,60)+'...':message_text, clientId); } catch(e) { console.error('Notif insert error:', e.message); }
    res.json({ id: result.lastInsertRowid, message: 'Message sent' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// POST /api/pt/messages/:clientId/mark-read - PT marks messages as read
router.post('/pt/client/:clientId/mark-read', authenticateToken, (req, res) => {
  if (req.user.role !== 'pt') {
    return res.status(403).json({ error: 'PT only' });
  }

  const db = getDb();
  const clientId = req.params.clientId;

  // Verify PT owns this client
  const client = db.prepare(`
    SELECT id FROM clients WHERE id = ? AND pt_id = ?
  `).get(clientId, req.user.id);

  if (!client) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  db.prepare(`
    UPDATE pt_messages SET is_read = 1, read_at = datetime('now')
    WHERE client_id = ? AND sender_type = 'client' AND is_read = 0
  `).run(clientId);

  res.json({ message: 'Messages marked as read' });
});


// GET /api/messages/client-notifications
router.get('/client-notifications', authenticateToken, (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  if (!clientId) return res.status(403).json({ error: 'Clients only' });
  const notifications = db.prepare('SELECT * FROM notifications WHERE client_id = ? ORDER BY created_at DESC LIMIT 20').all(clientId);
  const unreadCount = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE client_id = ? AND is_read = 0').get(clientId).count;
  res.json({ notifications, unreadCount });
});
// PUT /api/messages/client-notifications/read-all
router.put('/client-notifications/read-all', authenticateToken, (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  if (!clientId) return res.status(403).json({ error: 'Clients only' });
  db.prepare('UPDATE notifications SET is_read = 1 WHERE client_id = ?').run(clientId);
  res.json({ message: 'All marked as read' });
});

router.delete('/pt/client/:clientId/all', authenticateToken, (req, res) => {
  if (req.user.role !== 'pt') return res.status(403).json({ error: 'PT only' });
  const db = getDb();
  const result = db.prepare('DELETE FROM pt_messages WHERE client_id = ?').run(req.params.clientId);
  res.json({ deleted: result.changes });
});

module.exports = router;





