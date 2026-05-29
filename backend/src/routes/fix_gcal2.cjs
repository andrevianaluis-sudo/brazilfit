const fs = require('fs');
let c = fs.readFileSync('googleCalendar.js', 'utf8');
let count = 0;

// Fix 1: Main sync - add 14 day limit before the existing check
const old1 = `          const existing = db.prepare("SELECT id FROM sessions WHERE client_id = ? AND scheduled_date = ? AND scheduled_time = ?")
            .get(c.id, date, time);
          if (existing) { skipped++; continue; }
          db.prepare(\`INSERT INTO sessions (client_id, scheduled_date, scheduled_time, status, google_event_id, notes) VALUES (?, ?, ?, 'upcoming', ?, ?)\`)
            .run(c.id, date || null, time || null, event.id || null, null);
          sessionsCreated++;`;

const new1 = `          // Skip PT sessions more than 14 days ahead - app manages scheduling
          const _today = new Date(); _today.setHours(0,0,0,0);
          const _sessionDate = new Date(date + 'T12:00:00');
          if ((_sessionDate - _today) / (1000*60*60*24) > 14) { skipped++; continue; }
          const existing = db.prepare("SELECT id FROM sessions WHERE client_id = ? AND scheduled_date = ? AND scheduled_time = ?")
            .get(c.id, date, time);
          if (existing) { skipped++; continue; }
          const _upcomingCount = db.prepare("SELECT COUNT(*) as cnt FROM sessions WHERE client_id = ? AND status = 'upcoming'").get(c.id);
          if (_upcomingCount.cnt >= 10) { skipped++; continue; }
          db.prepare(\`INSERT INTO sessions (client_id, scheduled_date, scheduled_time, status, google_event_id, notes) VALUES (?, ?, ?, 'upcoming', ?, ?)\`)
            .run(c.id, date || null, time || null, event.id || null, null);
          sessionsCreated++;`;

if (c.includes(old1)) { c = c.replace(old1, new1); count++; console.log('Fix 1 applied'); }
else console.log('Fix 1 NOT FOUND');

// Fix 2: Webhook - only delete GCal-created sessions
const old2 = `    db.prepare("DELETE FROM sessions WHERE scheduled_date >= ? AND status = 'upcoming'").run(today);`;
const new2 = `    db.prepare("DELETE FROM sessions WHERE scheduled_date >= ? AND status = 'upcoming' AND google_event_id IS NOT NULL").run(today);`;

if (c.includes(old2)) { c = c.replace(old2, new2); count++; console.log('Fix 2 applied'); }
else console.log('Fix 2 NOT FOUND');

// Fix 3: Webhook session insert - add 14 day limit
const old3 = `            db.prepare(\`INSERT INTO sessions (client_id, scheduled_date, scheduled_time, status, google_event_id, notes) VALUES (?, ?, ?, 'upcoming', ?, ?)\`)
              .run(c.id, date, time, event.id || null, null);`;

const new3 = `            const _todayW = new Date(); _todayW.setHours(0,0,0,0);
            const _sessionW = new Date(date + 'T12:00:00');
            if ((_sessionW - _todayW) / (1000*60*60*24) > 14) continue;
            const _exW = db.prepare("SELECT id FROM sessions WHERE client_id = ? AND scheduled_date = ? AND scheduled_time = ?").get(c.id, date, time);
            if (_exW) continue;
            const _cntW = db.prepare("SELECT COUNT(*) as cnt FROM sessions WHERE client_id = ? AND status = 'upcoming'").get(c.id);
            if (_cntW.cnt >= 10) continue;
            db.prepare(\`INSERT INTO sessions (client_id, scheduled_date, scheduled_time, status, google_event_id, notes) VALUES (?, ?, ?, 'upcoming', ?, ?)\`)
              .run(c.id, date, time, event.id || null, null);`;

if (c.includes(old3)) { c = c.replace(old3, new3); count++; console.log('Fix 3 applied'); }
else console.log('Fix 3 NOT FOUND');

fs.writeFileSync('googleCalendar.js', c);
console.log(`Done - ${count} fixes applied`);
