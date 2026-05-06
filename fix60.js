const fs = require('fs');
const file = 'C:/Users/viana/BRAZILFIT/backend/src/routes/messages.js';
let c = fs.readFileSync(file, 'utf8');
c = c.replace(
);
fs.writeFileSync(file, c, 'utf8');
console.log('Done:', c.includes('ptMessage'));
