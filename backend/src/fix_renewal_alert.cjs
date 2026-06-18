const fs = require('fs');
let c = fs.readFileSync('index.js', 'utf8');

const old = `  for (const s of toMark) {
    db.prepare("UPDATE sessions SET status = 'attended', auto_marked = 1 WHERE id = ?").run(s.id);
    db.prepare("UPDATE clients SET sessions_used = sessions_used + 1 WHERE id = ?").run(s.client_id);
    console.log('[CRON] Auto-marked session', s.id, 'for client', s.client_id);
  }`;

const newCode = `  for (const s of toMark) {
    db.prepare("UPDATE sessions SET status = 'attended', auto_marked = 1 WHERE id = ?").run(s.id);
    db.prepare("UPDATE clients SET sessions_used = sessions_used + 1 WHERE id = ?").run(s.client_id);
    console.log('[CRON] Auto-marked session', s.id, 'for client', s.client_id);

    // Auto-renewal alert: if this client just hit 10 sessions, notify the PT
    try {
      const cl = db.prepare("SELECT c.sessions_used, u.name FROM clients c JOIN users u ON c.user_id = u.id WHERE c.id = ?").get(s.client_id);
      if (cl && cl.sessions_used >= 10) {
        const already = db.prepare("SELECT id FROM notifications WHERE type = 'renewal' AND client_id = ? AND is_read = 0").get(s.client_id);
        if (!already) {
          db.prepare("INSERT INTO notifications (type, title, message, client_id) VALUES (?,?,?,?)")
            .run('renewal', cl.name + ' has finished their block', cl.name + ' has completed all 10 sessions — time to renew their block.', s.client_id);
          console.log('[CRON] Renewal alert created for', cl.name);
        }
      }
    } catch(e) { console.error('[CRON] Renewal alert error:', e.message); }
  }`;

if (c.includes(old)) {
  c = c.replace(old, newCode);
  fs.writeFileSync('index.js', c);
  console.log('Done - renewal alert added');
} else {
  console.log('NOT FOUND');
}
