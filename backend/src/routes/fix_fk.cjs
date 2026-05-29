const fs = require('fs');
const lines = fs.readFileSync('pt.js', 'utf8').split('\n');

let startLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("router.post('/clients/:id/insert-sessions'")) {
    startLine = i;
    break;
  }
}

if (startLine < 0) { console.log('NOT FOUND'); process.exit(1); }

// Find the deleteFromDate line
let deleteLine = -1;
for (let i = startLine; i < startLine + 15; i++) {
  if (lines[i] && lines[i].includes('deleteFromDate') && lines[i].includes('db.prepare')) {
    deleteLine = i;
    break;
  }
}

if (deleteLine < 0) { console.log('DELETE LINE NOT FOUND'); process.exit(1); }

console.log('Found delete at line', deleteLine + 1, ':', lines[deleteLine].trim());

// Replace just that line with FK-safe version
lines[deleteLine] = '    db.exec(\'PRAGMA foreign_keys = OFF\');\n    db.prepare("DELETE FROM sessions WHERE client_id = ? AND scheduled_date >= ?").run(clientId, deleteFromDate);\n    db.exec(\'PRAGMA foreign_keys = ON\');';

fs.writeFileSync('pt.js', lines.join('\n'));
console.log('Done');
