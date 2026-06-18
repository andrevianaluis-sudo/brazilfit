const fs = require('fs');
let c = fs.readFileSync('pt.js', 'utf8');

const old = `WHERE type IN ('message', 'cancellation', 'reinstate', 'checkin', 'session', 'badge')`;
const newCode = `WHERE type IN ('message', 'cancellation', 'reinstate', 'checkin', 'session', 'badge', 'renewal')`;

if (c.includes(old)) {
  c = c.replace(old, newCode);
  fs.writeFileSync('pt.js', c);
  console.log('Done - renewal type now counts in bell badge');
} else {
  console.log('NOT FOUND');
}
