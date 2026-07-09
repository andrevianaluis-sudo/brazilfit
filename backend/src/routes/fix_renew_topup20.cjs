const fs = require('fs');
let c = fs.readFileSync('pt.js', 'utf8');
let steps = 0;

// 1. Remove the wipe of upcoming sessions
const oldWipe = `  // Wipe ALL existing upcoming sessions before generating new ones
  db.exec('PRAGMA foreign_keys = OFF');
  db.prepare("DELETE FROM sessions WHERE client_id = ? AND status = 'upcoming'").run(clientId);
  db.exec('PRAGMA foreign_keys = ON');
`;
const newComment = `  // Keep existing upcoming sessions — they roll into the new block
`;
if (c.includes(oldWipe)) { c = c.replace(oldWipe, newComment); steps++; }

// 2. Reassign existing upcoming sessions to the new block, then top up to 20
const oldGen = `  // Generate 10 sessions worth of future dates
  const sessionDates = generateFutureSessions(renewalDate, schedule, 10);
  const sessionInsert = db.prepare(\`
    INSERT INTO sessions (client_id, block_id, scheduled_date, scheduled_time, status, session_type)
    VALUES (?, ?, ?, ?, 'upcoming', 'PT')
  \`);
  for (const s of sessionDates) {
    sessionInsert.run(clientId, newBlock.id, s.date, s.time);
  }

  res.json({ message: 'Block renewed', newBlockNumber });`;

const newGen = `  // Move existing upcoming sessions into the new block
  db.prepare("UPDATE sessions SET block_id = ? WHERE client_id = ? AND status = 'upcoming'").run(newBlock.id, clientId);

  // Count what's already scheduled, then top up to 20 upcoming
  const existing = db.prepare("SELECT COUNT(*) as cnt FROM sessions WHERE client_id = ? AND status = 'upcoming'").get(clientId);
  const TARGET = 20;
  const needed = Math.max(0, TARGET - existing.cnt);

  if (needed > 0 && schedule.length > 0) {
    // Start generating from the day after the last scheduled session (or renewal date if none)
    const lastRow = db.prepare("SELECT scheduled_date FROM sessions WHERE client_id = ? AND status = 'upcoming' ORDER BY scheduled_date DESC LIMIT 1").get(clientId);
    const startFrom = lastRow ? lastRow.scheduled_date : renewalDate;
    const sessionDates = generateFutureSessions(startFrom, schedule, needed + schedule.length);
    const sessionInsert = db.prepare(\`
      INSERT INTO sessions (client_id, block_id, scheduled_date, scheduled_time, status, session_type)
      VALUES (?, ?, ?, ?, 'upcoming', 'PT')
    \`);
    let inserted = 0;
    for (const s of sessionDates) {
      if (inserted >= needed) break;
      // Skip if this exact slot already exists
      const dup = db.prepare("SELECT id FROM sessions WHERE client_id = ? AND scheduled_date = ? AND scheduled_time = ?").get(clientId, s.date, s.time);
      if (!dup) { sessionInsert.run(clientId, newBlock.id, s.date, s.time); inserted++; }
    }
  }

  const total = db.prepare("SELECT COUNT(*) as cnt FROM sessions WHERE client_id = ? AND status = 'upcoming'").get(clientId);
  res.json({ message: 'Block renewed', newBlockNumber, upcomingSessions: total.cnt });`;

if (c.includes(oldGen)) { c = c.replace(oldGen, newGen); steps++; }

fs.writeFileSync('pt.js', c);
console.log('Done -', steps, 'of 2 changes applied');
