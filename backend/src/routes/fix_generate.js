const fs = require('fs');
let c = fs.readFileSync('pt.js', 'utf8');

const old = `function generateFutureSessions(startDate, schedule, count) {
  const results = [];
  let current = new Date(startDate + 'T12:00:00');
  const seen = new Set();

  for (let week = 0; week < 20 && results.length < count; week++) {
    for (const item of schedule) {
      const d = new Date(startDate + 'T12:00:00');
      d.setDate(d.getDate() + (week * 7) + ((item.day_of_week - d.getDay() + 7) % 7));
      const dateStr = d.toISOString().split('T')[0];
      const key = \`\${dateStr}-\${item.session_time}\`;
      if (dateStr >= startDate && !seen.has(key)) {
        seen.add(key);
        results.push({ date: dateStr, time: item.session_time });
      }
    }
  }

  results.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  return results.slice(0, count);
}`;

const newFn = `function generateFutureSessions(startDate, schedule, count) {
  const results = [];
  const seen = new Set();

  for (const item of schedule) {
    const start = new Date(startDate + 'T12:00:00');
    const startDay = start.getDay();
    const targetDay = item.day_of_week;
    const daysUntil = (targetDay - startDay + 7) % 7;

    for (let week = 0; week <= 20; week++) {
      const d = new Date(startDate + 'T12:00:00');
      d.setDate(d.getDate() + daysUntil + (week * 7));
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = \`\${y}-\${m}-\${day}\`;
      const key = \`\${dateStr}-\${item.session_time}\`;
      if (dateStr >= startDate && !seen.has(key)) {
        seen.add(key);
        results.push({ date: dateStr, time: item.session_time });
      }
    }
  }

  results.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  return results.slice(0, count);
}`;

if (c.includes(old)) {
  c = c.replace(old, newFn);
  fs.writeFileSync('pt.js', c);
  console.log('Done');
} else {
  console.log('NOT FOUND - function may have already been changed');
}
