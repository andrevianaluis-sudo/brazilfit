const fs = require('fs');
const lines = fs.readFileSync('PTSchedule.jsx', 'utf8').split('\n');
let count = 0;

for (let i = 0; i < lines.length; i++) {
  // Remove classes.forEach line
  if (lines[i].includes("classes.forEach(c => { const k = c.scheduled_time.substring(0,5)")) {
    lines.splice(i, 1);
    count++;
    console.log('Removed classes.forEach at line', i + 1);
    i--;
  }
  // Replace gcal timeMap push to only include PT events
  if (lines[i].includes("timeMap[k].push({ ...e, entryType: e.event_type === 'class' ? 'gcal-class'")) {
    lines[i] = "        if (e.event_type === 'pt') { timeMap[k].push({ ...e, entryType: 'gcal-pt', scheduled_time: e.start_time, client_name: e.title }); }";
    count++;
    console.log('Fixed gcal timeMap at line', i + 1);
  }
}

fs.writeFileSync('PTSchedule.jsx', lines.join('\n'));
console.log('Done -', count, 'fixes');
