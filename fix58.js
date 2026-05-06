const fs = require('fs');
const pt = 'C:/Users/viana/BRAZILFIT/backend/src/routes/pt.js';
const msg = 'C:/Users/viana/BRAZILFIT/backend/src/routes/messages.js';
let p = fs.readFileSync(pt, 'utf8');
let m = fs.readFileSync(msg, 'utf8');
const route = p.match(/\/\/ GET \/pt\/client-notifications[\s\S]*?read-all[\s\S]*?\}\);/)[0];
m = m.replace('module.exports = router;', route + '\nmodule.exports = router;');
fs.writeFileSync(msg, m, 'utf8');
console.log('Done:', m.includes('client-notifications'));
