const fs = require('fs');
let c = fs.readFileSync('index.js', 'utf8');

c = c.replace(
  'const sessionMins = parseInt(parts[0]) * 60 + parseInt(parts[1]) + 15;',
  'const sessionMins = parseInt(parts[0]) * 60 + parseInt(parts[1]) + 75; // 1 hour session + 15 min buffer'
);

fs.writeFileSync('index.js', c);
console.log('Done');
