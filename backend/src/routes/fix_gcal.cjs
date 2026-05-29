const fs = require('fs');
let c = fs.readFileSync('googleCalendar.js', 'utf8');
let count = 0;

// Fix 1: Main sync - limit PT sessions to 14 days ahead
const old1 = `      if (client) {
        const clientList = Array.isArray(client) ? client : [client];
        for (const c of clientList) {
          const existing = db.prepare(\"SELECT id FROM sessions WHERE client_id = ? AND scheduled_date = ? AND scheduled_time = ?\")
            .get(c.id, date, time);
          if (existing) { skipped++; continue; }
          db.prepare(\`INSERT INTO sessions (client_id, scheduled_date, scheduled_time, status, google_event_id, notes) VALUES (?, ?, ?, 'upcoming', ?, ?)\`)
            .run(c.id, date || null, time || null, event.id || null, null);
          sessionsCreated++;
        }`;

const new1 = `      if (client) {
        const clientList = Array.isArray(client) ? client : [client];
        for (const c of clientList) {
          // Skip GCal PT sessions more than 14 days away — app manages scheduling
          const today = new Date(); today.setHours(0,0,0,0);
          const sessionDate = new Date(date + 'T12:00:00');
          const daysAhead = (sessionDate - today) / (1000 * 60 * 60 * 24);
          if (daysAhead > 14) { skipped++; continue; }
          const existing = db.prepare(\"SELECT id FROM sessions WHERE client_id = ? AND scheduled_date = ? AND scheduled_time = ?\")
            .get(c.id, date, time);
          if (existing) { skipped++; continue; }
          const upcomingCount = db.prepare(\"SELECT COUNT(*) as cnt FROM sessions WHERE client_id = ? AND status = 'upcoming'\").get(c.id);
          if (upcomingCount.cnt >= 10) { skipped++; continue; }
          db.prepare(\`INSERT INTO sessions (client_id, scheduled_date, scheduled_time, status, google_event_id, notes) VALUES (?, ?, ?, 'upcoming', ?, ?)\`)
            .run(c.id, date || null, time || null, event.id || null, null);
          sessionsCreated++;
        }`;

if (c.includes(old1)) { c = c.replace(old1, new1); count++; }

// Fix 2: Webhook - only delete GCal-created sessions
const old2 = `    db.exec('PRAGMA foreign_keys = OFF');
    db.prepare(\"DELETE FROM sessions WHERE scheduled_date >= ? AND status = 'upcoming'\").run(today);
    db.exec('PRAGMA foreign_keys = ON');`;

const new2 = `    db.exec('PRAGMA foreign_keys = OFF');
    db.prepare(\"DELETE FROM sessions WHERE scheduled_date >= ? AND status = 'upcoming' AND google_event_id IS NOT NULL\").run(today);
    db.exec('PRAGMA foreign_keys = ON');`;

if (c.includes(old2)) { c = c.replace(old2, new2); count++; }

// Fix 3: Webhook sync - limit PT sessions
const old3 = `      if (client) {
        const clientList = Array.isArray(client) ? client : [client];
        for (const c of clientList) {
          try {
            db.prepare(\`INSERT INTO sessions (client_id, scheduled_date, scheduled_time, status, google_event_id, notes) VALUES (?, ?, ?, 'upcoming', ?, ?)\`)
              .run(c.id, date, time, event.id || null, null);
          } catch(e) {}
        }
      } else if (!titleLower.includes('pt') && !titleLower.includes('1:1') && !titleLower.includes('1-1')) {`;

const new3 = `      if (client) {
        const clientList = Array.isArray(client) ? client : [client];
        for (const c of clientList) {
          try {
            const todayD = new Date(); todayD.setHours(0,0,0,0);
            const sessionD = new Date(date + 'T12:00:00');
            if ((sessionD - todayD) / (1000*60*60*24) > 14) continue;
            const ex = db.prepare("SELECT id FROM sessions WHERE client_id = ? AND scheduled_date = ? AND scheduled_time = ?").get(c.id, date, time);
            if (ex) continue;
            const cnt = db.prepare("SELECT COUNT(*) as cnt FROM sessions WHERE client_id = ? AND status = 'upcoming'").get(c.id);
            if (cnt.cnt >= 10) continue;
            db.prepare(\`INSERT INTO sessions (client_id, scheduled_date, scheduled_time, status, google_event_id, notes) VALUES (?, ?, ?, 'upcoming', ?, ?)\`)
              .run(c.id, date, time, event.id || null, null);
          } catch(e) {}
        }
      } else if (!titleLower.includes('pt') && !titleLower.includes('1:1') && !titleLower.includes('1-1')) {`;

if (c.includes(old3)) { c = c.replace(old3, new3); count++; }

fs.writeFileSync('googleCalendar.js', c);
console.log(`Done - ${count} fixes applied`);
