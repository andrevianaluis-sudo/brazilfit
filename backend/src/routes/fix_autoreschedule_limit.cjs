const fs = require('fs');
let c = fs.readFileSync('sessions.js', 'utf8');

const old = `        if (nextDate) {
          db.prepare("INSERT INTO sessions (client_id, block_id, scheduled_date, scheduled_time, status, session_type) VALUES (?, ?, ?, ?, 'upcoming', 'PT')").run(clientId, block.id, nextDate, nextTime);
          console.log(\`[cancel] Auto-scheduled replacement session for client \${clientId} on \${nextDate} at \${nextTime}\`);`;

const newCode = `        if (nextDate) {
          // Only add replacement if total sessions (attended + upcoming) is below 10
          const totalSessions = db.prepare("SELECT COUNT(*) as cnt FROM sessions WHERE client_id = ? AND status IN ('attended', 'upcoming')").get(clientId);
          if (totalSessions.cnt < 10) {
            db.prepare("INSERT INTO sessions (client_id, block_id, scheduled_date, scheduled_time, status, session_type) VALUES (?, ?, ?, ?, 'upcoming', 'PT')").run(clientId, block.id, nextDate, nextTime);
            console.log(\`[cancel] Auto-scheduled replacement for client \${clientId} on \${nextDate}\`);
          } else {
            console.log(\`[cancel] Client \${clientId} already has 10 sessions, no replacement needed\`);
          }`;

if (c.includes(old)) {
  c = c.replace(old, newCode);
  fs.writeFileSync('sessions.js', c);
  console.log('Done');
} else {
  console.log('NOT FOUND');
}
