const fs = require('fs');
const lines = fs.readFileSync('index.js', 'utf8').split('\n');

// Find the cron line
let cronLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("cron.schedule('0 20 * * 1-5'")) {
    cronLine = i;
    break;
  }
}

if (cronLine < 0) { console.log('NOT FOUND'); process.exit(1); }

// Find the end of the result = db.prepare block (the .run(today) line)
let endLine = -1;
for (let i = cronLine; i < cronLine + 10; i++) {
  if (lines[i].includes('.run(today)')) {
    endLine = i;
    break;
  }
}

if (endLine < 0) { console.log('END NOT FOUND'); process.exit(1); }

console.log('Found cron at line', cronLine + 1, 'end at line', endLine + 1);

// Replace from cronLine to endLine with new code
const newLines = [
  "// Auto-mark sessions 15 minutes after scheduled time (runs every 5 minutes)",
  "cron.schedule('*/5 * * * *', async () => {",
  "  const db = getDb();",
  "  const now = new Date();",
  "  const today = now.toISOString().split('T')[0];",
  "  const sessions = db.prepare(`",
  "    SELECT * FROM sessions",
  "    WHERE status = 'upcoming' AND scheduled_date = ? AND session_type = 'PT'",
  "  `).all(today);",
  "  const toMark = sessions.filter(s => {",
  "    const [sh, sm] = s.scheduled_time.split(':').map(Number);",
  "    const sessionMins = sh * 60 + sm + 15;",
  "    const nowMins = now.getHours() * 60 + now.getMinutes();",
  "    return nowMins >= sessionMins;",
  "  });",
  "  if (toMark.length === 0) return;",
  "  const ids = toMark.map(s => s.id);",
  "  const placeholders = ids.map(() => '?').join(',');",
  "  const result = db.prepare(`UPDATE sessions SET status = 'attended', auto_marked = 1 WHERE id IN (${placeholders})`).run(...ids);"
];

lines.splice(cronLine, endLine - cronLine + 1, ...newLines);
fs.writeFileSync('index.js', lines.join('\n'));
console.log('Done');
