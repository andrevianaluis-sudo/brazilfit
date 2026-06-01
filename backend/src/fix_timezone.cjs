const fs = require('fs');
const lines = fs.readFileSync('index.js', 'utf8').split('\n');

// Find the today line in the cron
let todayLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("const today = now.toISOString().split('T')[0]") && 
      lines[i-1] && lines[i-1].includes('const now = new Date()')) {
    todayLine = i;
    break;
  }
}

if (todayLine < 0) { console.log('NOT FOUND'); process.exit(1); }

console.log('Found at line', todayLine + 1);

// Replace the today line and following time lines with BST-aware version
const newLines = [
  "  // Use UK time (BST = UTC+1 in summer, UTC+0 in winter)",
  "  const ukOffset = 60; // BST offset in minutes - update to 0 in winter",
  "  const ukNow = new Date(now.getTime() + ukOffset * 60 * 1000);",
  "  const today = ukNow.toISOString().split('T')[0];"
];

// Replace lines todayLine to todayLine+3 (today, hh, mm, currentTime)
lines.splice(todayLine, 4, ...newLines);

// Also fix the nowMins calculation
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const nowMins = now.getHours()')) {
    lines[i] = "    const nowMins = ukNow.getHours() * 60 + ukNow.getMinutes();";
    console.log('Fixed nowMins at line', i + 1);
    break;
  }
}

fs.writeFileSync('index.js', lines.join('\n'));
console.log('Done');
