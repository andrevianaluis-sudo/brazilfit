const fs = require('fs');
let c = fs.readFileSync('index.js', 'utf8');

const old = `// Auto-mark sessions at 20:00 Mon-Fri
cron.schedule('0 20 * * 1-5', async () => {
  console.log('[CRON] Auto-marking sessions at 20:00...');
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];

  const result = db.prepare(\`
    UPDATE sessions SET status = 'attended', auto_marked = 1
    WHERE status = 'upcoming' AND scheduled_date = ? AND session_type = 'PT'
  \`).run(today);`;

const newCode = `// Auto-mark sessions 15 minutes after scheduled time (runs every 5 minutes)
cron.schedule('*/5 * * * *', async () => {
  const db = getDb();
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  // Find upcoming sessions scheduled today where current time >= session time + 15 mins
  const sessions = db.prepare(\`
    SELECT * FROM sessions
    WHERE status = 'upcoming' AND scheduled_date = ? AND session_type = 'PT'
  \`).all(today);

  const toMark = sessions.filter(s => {
    const [sh, sm] = s.scheduled_time.split(':').map(Number);
    const sessionMins = sh * 60 + sm + 15;
    const nowMins = now.getHours() * 60 + now.getMinutes();
    return nowMins >= sessionMins;
  });

  if (toMark.length === 0) return;

  const ids = toMark.map(s => s.id);
  const placeholders = ids.map(() => '?').join(',');
  const result = db.prepare(\`UPDATE sessions SET status = 'attended', auto_marked = 1 WHERE id IN (\${placeholders})\`).run(...ids);`;

if (c.includes(old)) {
  c = c.replace(old, newCode);
  fs.writeFileSync('index.js', c);
  console.log('Done');
} else {
  console.log('NOT FOUND');
}
