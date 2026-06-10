const fs = require('fs');
let c = fs.readFileSync('ClientMyJourney.jsx', 'utf8');

c = c.replace(
  `                  {pill} {isProOnly && !user?.isPro ? '' : ''}`,
  `                  {pill} {isProOnly && !user?.isPro ? '🔒' : ''}`
);

fs.writeFileSync('ClientMyJourney.jsx', c);
console.log('Done');
