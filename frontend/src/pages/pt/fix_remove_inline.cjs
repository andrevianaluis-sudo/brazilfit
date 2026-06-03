const fs = require('fs');
const lines = fs.readFileSync('PTSchedule.jsx', 'utf8').split('\n');
let startLine = -1, endLine = -1;

// Find the div that wraps the inline edit
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("display:'flex',alignItems:'center',gap:'6px'") && 
      lines[i+1] && lines[i+1].includes('editingTimeId === entry.id')) {
    startLine = i;
    break;
  }
}

// Find the end of this block (closing div + the sessions_remaining span)
for (let i = startLine + 1; i < startLine + 30; i++) {
  if (lines[i].includes('sessions_remaining} remaining</span>') && 
      lines[i+1] && lines[i+1].trim() === '</div>') {
    endLine = i + 1;
    break;
  }
}

console.log('Found block from line', startLine + 1, 'to', endLine + 1);

// Replace with simple time display
const replacement = `          <p style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.72rem', color:'#666', margin:0 }}>{entry.scheduled_time} · Session {entry.sessions_used} of 10 · {entry.sessions_remaining} remaining</p>`;

lines.splice(startLine, endLine - startLine + 1, replacement);
fs.writeFileSync('PTSchedule.jsx', lines.join('\n'));
console.log('Done');
