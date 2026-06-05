const fs = require('fs');
let c = fs.readFileSync('pt.js', 'utf8');

c = c.replace(
  '           c.sessions_used, c.is_pro, c.pro_expires_at, u.last_login,',
  '           c.sessions_used, c.is_pro, c.pro_expires_at,'
);

fs.writeFileSync('pt.js', c);
console.log('Done');
