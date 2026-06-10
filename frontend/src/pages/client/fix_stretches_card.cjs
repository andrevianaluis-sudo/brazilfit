const fs = require('fs');
let c = fs.readFileSync('ClientHome.jsx', 'utf8');

// Fix the card click to check isPro for pro-gated items
c = c.replace(
  `              <div key={i} onClick={()=>navigate(lk.to)} style={{`,
  `              <div key={i} onClick={()=>navigate(lk.pro && !user?.isPro ? '/client/upgrade' : lk.to)} style={{`
);

fs.writeFileSync('ClientHome.jsx', c);
console.log('Done');
