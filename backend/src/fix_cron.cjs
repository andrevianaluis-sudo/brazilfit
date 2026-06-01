const fs = require('fs');
const lines = fs.readFileSync('index.js', 'utf8').split('\n');

// Find the cron schedule line
let cronStart = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("cron.schedule('*/5 * * * *'")) {
    cronStart = i;
    break;
  }
}

if (cronStart < 0) { console.log('NOT FOUND'); process.exit(1); }

// Find the end of this cron (next cron.schedule)
let cronEnd = -1;
for (let i = cronStart + 1; i < lines.length; i++) {
  if (lines[i].includes('cron.schedule(')) {
    cronEnd = i;
    break;
  }
}

console.log('Cron from line', cronStart + 1, 'to', cronEnd);

const newCron = [
  "// Auto-mark sessions 15 minutes after scheduled time (runs every 5 minutes)",
  "cron.schedule('*/5 * * * *', async () => {",
  "  const db = getDb();",
  "  const now = new Date();",
  "  // Use UK BST time (UTC+1)",
  "  const ukOffset = 60;",
  "  const ukNow = new Date(now.getTime() + ukOffset * 60 * 1000);",
  "  const today = ukNow.toISOString().split('T')[0];",
  "",
  "  const sessions = db.prepare(",
  "    \"SELECT * FROM sessions WHERE status = 'upcoming' AND scheduled_date = ? AND session_type = 'PT'\"",
  "  ).all(today);",
  "",
  "  const toMark = sessions.filter(s => {",
  "    const parts = s.scheduled_time.split(':');",
  "    const sessionMins = parseInt(parts[0]) * 60 + parseInt(parts[1]) + 15;",
  "    const nowMins = ukNow.getHours() * 60 + ukNow.getMinutes();",
  "    return nowMins >= sessionMins;",
  "  });",
  "",
  "  if (toMark.length === 0) return;",
  "",
  "  for (const s of toMark) {",
  "    db.prepare(\"UPDATE sessions SET status = 'attended', auto_marked = 1 WHERE id = ?\").run(s.id);",
  "    db.prepare(\"UPDATE clients SET sessions_used = sessions_used + 1 WHERE id = ?\").run(s.client_id);",
  "    console.log('[CRON] Auto-marked session', s.id, 'for client', s.client_id);",
  "  }",
  "});",
  ""
];

lines.splice(cronStart, cronEnd - cronStart, ...newCron);
fs.writeFileSync('index.js', lines.join('\n'));
console.log('Done');
