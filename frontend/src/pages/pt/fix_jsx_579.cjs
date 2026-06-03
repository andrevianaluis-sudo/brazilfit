const fs = require('fs');
const lines = fs.readFileSync('PTSchedule.jsx', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('setRescheduleTime(s.scheduled_time); } editingTimeId=')) {
    lines[i] = lines[i].replace(
      'setRescheduleTime(s.scheduled_time); } editingTimeId=',
      'setRescheduleTime(s.scheduled_time); }} editingTimeId='
    );
    console.log('Fixed at line', i + 1);
    break;
  }
}

fs.writeFileSync('PTSchedule.jsx', lines.join('\n'));
console.log('Done');
