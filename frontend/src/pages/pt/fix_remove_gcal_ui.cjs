const fs = require('fs');
const lines = fs.readFileSync('PTSchedule.jsx', 'utf8').split('\n');

let startLine = -1, endLine = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Google Calendar sync banner')) {
    startLine = i;
  }
  if (startLine > -1 && lines[i].includes('Date nav')) {
    endLine = i;
    break;
  }
}

console.log('Found GCal banner from line', startLine + 1, 'to', endLine + 1);

// Remove everything from startLine to endLine (keep the Date nav comment)
lines.splice(startLine, endLine - startLine);

fs.writeFileSync('PTSchedule.jsx', lines.join('\n'));
console.log('Done');
