const fs = require('fs');
let c = fs.readFileSync('googleCalendar.js', 'utf8');
let count = 0;

// Fix 1: Main sync - add 14 day limit
const old1 = "          const existing = db.prepare(\"SELECT id FROM sessions WHERE client_id = ? AND scheduled_date = ? AND scheduled_time = ?\")\n            .get(c.id, date, time);\n          if (existing) { skipped++; continue; }\n          db.prepare(`INSERT INTO sessions (client_id, scheduled_date, scheduled_time, status, google_event_id, notes) VALUES (?, ?, ?, 'upcoming', ?, ?)`)\n            .run(c.id, date || null, time || null, event.id || null, null);\n          sessionsCreated++;";

const new1 = "          // Skip PT sessions more than 14 days ahead\n          const _td = new Date(); _td.setHours(0,0,0,0);\n          const _sd = new Date(date + 'T12:00:00');\n          if ((_sd - _td) / (1000*60*60*24) > 14) { skipped++; continue; }\n          const existing = db.prepare(\"SELECT id FROM sessions WHERE client_id = ? AND scheduled_date = ? AND scheduled_time = ?\")\n            .get(c.id, date, time);\n          if (existing) { skipped++; continue; }\n          const _uc = db.prepare(\"SELECT COUNT(*) as cnt FROM sessions WHERE client_id = ? AND status = 'upcoming'\").get(c.id);\n          if (_uc.cnt >= 10) { skipped++; continue; }\n          db.prepare(`INSERT INTO sessions (client_id, scheduled_date, scheduled_time, status, google_event_id, notes) VALUES (?, ?, ?, 'upcoming', ?, ?)`)\n            .run(c.id, date || null, time || null, event.id || null, null);\n          sessionsCreated++;";

if (c.includes(old1)) { c = c.replace(old1, new1); count++; console.log('Fix 1 applied'); }
else console.log('Fix 1 NOT FOUND');

// Fix 3: Webhook session insert
const old3 = "            db.prepare(`INSERT INTO sessions (client_id, scheduled_date, scheduled_time, status, google_event_id, notes) VALUES (?, ?, ?, 'upcoming', ?, ?)`)\n              .run(c.id, date, time, event.id || null, null);";

const new3 = "            const _tdW = new Date(); _tdW.setHours(0,0,0,0);\n            const _sdW = new Date(date + 'T12:00:00');\n            if ((_sdW - _tdW) / (1000*60*60*24) > 14) continue;\n            const _exW = db.prepare(\"SELECT id FROM sessions WHERE client_id = ? AND scheduled_date = ? AND scheduled_time = ?\").get(c.id, date, time);\n            if (_exW) continue;\n            const _cntW = db.prepare(\"SELECT COUNT(*) as cnt FROM sessions WHERE client_id = ? AND status = 'upcoming'\").get(c.id);\n            if (_cntW.cnt >= 10) continue;\n            db.prepare(`INSERT INTO sessions (client_id, scheduled_date, scheduled_time, status, google_event_id, notes) VALUES (?, ?, ?, 'upcoming', ?, ?)`)\n              .run(c.id, date, time, event.id || null, null);";

if (c.includes(old3)) { c = c.replace(old3, new3); count++; console.log('Fix 3 applied'); }
else console.log('Fix 3 NOT FOUND');

fs.writeFileSync('googleCalendar.js', c);
console.log('Done - ' + count + ' fixes applied');
