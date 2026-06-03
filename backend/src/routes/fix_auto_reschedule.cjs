const fs = require('fs');
const lines = fs.readFileSync('sessions.js', 'utf8').split('\n');

// Find the line with the final res.json for cancellation
let targetLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("res.json({ message: 'Session cancelled. It has been carried over") &&
      lines[i+1] && lines[i+1].trim() === '});' &&
      lines[i+2] && lines[i+2].includes('override-cancel')) {
    targetLine = i;
    break;
  }
}

if (targetLine < 0) { console.log('NOT FOUND'); process.exit(1); }
console.log('Found at line', targetLine + 1);

const newCode = [
  "  // Auto-schedule a replacement session on the client's next regular slot",
  "  try {",
  "    const schedule = db.prepare('SELECT day_of_week, session_time FROM client_schedules WHERE client_id = ? ORDER BY day_of_week, session_time').all(clientId);",
  "    if (schedule.length > 0) {",
  "      const block = db.prepare('SELECT id FROM blocks WHERE client_id = ? AND is_current = 1').get(clientId);",
  "      if (block) {",
  "        const lastSession = db.prepare(\"SELECT MAX(scheduled_date) as last_date FROM sessions WHERE client_id = ? AND status = 'upcoming'\").get(clientId);",
  "        const startFrom = lastSession?.last_date || session.scheduled_date;",
  "        const start = new Date(startFrom + 'T12:00:00');",
  "        start.setDate(start.getDate() + 1);",
  "        let nextDate = null, nextTime = null;",
  "        for (let i = 0; i < 60; i++) {",
  "          const d = new Date(start.getTime());",
  "          d.setDate(start.getDate() + i);",
  "          const slot = schedule.find(s => s.day_of_week === d.getDay());",
  "          if (slot) {",
  "            const dateStr = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');",
  "            const exists = db.prepare(\"SELECT id FROM sessions WHERE client_id = ? AND scheduled_date = ? AND status = 'upcoming'\").get(clientId, dateStr);",
  "            if (!exists) { nextDate = dateStr; nextTime = slot.session_time; break; }",
  "          }",
  "        }",
  "        if (nextDate) {",
  "          db.prepare(\"INSERT INTO sessions (client_id, block_id, scheduled_date, scheduled_time, status, session_type) VALUES (?, ?, ?, ?, 'upcoming', 'PT')\").run(clientId, block.id, nextDate, nextTime);",
  "          console.log('[cancel] Auto-scheduled replacement for client', clientId, 'on', nextDate);",
  "        }",
  "      }",
  "    }",
  "  } catch(e) { console.error('[cancel] Auto-schedule error:', e.message); }",
  ""
];

lines.splice(targetLine, 0, ...newCode);
fs.writeFileSync('sessions.js', lines.join('\n'));
console.log('Done');
