const fs = require('fs');
const lines = fs.readFileSync('PTSchedule.jsx', 'utf8').split('\n');
let count = 0;

// Fix 1: Add editingTimeId and editingTimeValue to SessionSlot props
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('function SessionSlot(') && lines[i].includes('onReschedule')) {
    lines[i] = lines[i].replace(
      '{ entry, onMarkAttended, onMarkMissed, onMarkUpcoming, onNotes, onReinstate, onReschedule }',
      '{ entry, onMarkAttended, onMarkMissed, onMarkUpcoming, onNotes, onReinstate, onReschedule, editingTimeId, setEditingTimeId, editingTimeValue, setEditingTimeValue, onTimeUpdate }'
    );
    count++;
    console.log('Fix 1 applied at line', i + 1);
    break;
  }
}

// Fix 2: Add props when SessionSlot is called
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('onReschedule={(s) => { setRescheduleSession(s)') && lines[i].includes('}} />')) {
    lines[i] = lines[i].replace(
      '}} />',
      '} editingTimeId={editingTimeId} setEditingTimeId={setEditingTimeId} editingTimeValue={editingTimeValue} setEditingTimeValue={setEditingTimeValue} onTimeUpdate={fetchSchedule} />'
    );
    count++;
    console.log('Fix 2 applied at line', i + 1);
    break;
  }
}

fs.writeFileSync('PTSchedule.jsx', lines.join('\n'));
console.log('Done -', count, 'fixes applied');
