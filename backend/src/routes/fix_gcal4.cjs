const fs = require('fs');
const lines = fs.readFileSync('googleCalendar.js', 'utf8').split('\n');

// Fix 1: Insert 14-day check before line 264 (the existing check in main sync)
// Find the line with the main sync existing check
let fix1Line = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('SELECT id FROM sessions WHERE client_id') && 
      lines[i+1] && lines[i+1].includes('.get(c.id, date, time)') &&
      lines[i+2] && lines[i+2].includes('skipped++')) {
    fix1Line = i;
    break;
  }
}

if (fix1Line >= 0) {
  const insert = [
    "          // Skip PT sessions more than 14 days ahead",
    "          const _td = new Date(); _td.setHours(0,0,0,0);",
    "          const _sd = new Date(date + 'T12:00:00');",
    "          if ((_sd - _td) / (1000*60*60*24) > 14) { skipped++; continue; }",
    "          const _uc = db.prepare(\"SELECT COUNT(*) as cnt FROM sessions WHERE client_id = ? AND status = 'upcoming'\").get(c.id);",
    "          if (_uc.cnt >= 10) { skipped++; continue; }"
  ];
  lines.splice(fix1Line, 0, ...insert);
  console.log('Fix 1 applied at line', fix1Line + 1);
} else {
  console.log('Fix 1 NOT FOUND');
}

// Fix 3: Add guards before webhook INSERT
let fix3Line = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("db.prepare(`INSERT INTO sessions") && 
      lines[i+1] && lines[i+1].includes('.run(c.id, date, time, event.id')) {
    fix3Line = i;
    break;
  }
}

if (fix3Line >= 0) {
  const insert = [
    "            const _tdW = new Date(); _tdW.setHours(0,0,0,0);",
    "            const _sdW = new Date(date + 'T12:00:00');",
    "            if ((_sdW - _tdW) / (1000*60*60*24) > 14) continue;",
    "            const _exW = db.prepare(\"SELECT id FROM sessions WHERE client_id = ? AND scheduled_date = ? AND scheduled_time = ?\").get(c.id, date, time);",
    "            if (_exW) continue;",
    "            const _cntW = db.prepare(\"SELECT COUNT(*) as cnt FROM sessions WHERE client_id = ? AND status = 'upcoming'\").get(c.id);",
    "            if (_cntW.cnt >= 10) continue;"
  ];
  lines.splice(fix3Line, 0, ...insert);
  console.log('Fix 3 applied at line', fix3Line + 1);
} else {
  console.log('Fix 3 NOT FOUND');
}

fs.writeFileSync('googleCalendar.js', lines.join('\n'));
console.log('Done');
