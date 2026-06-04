const fs = require('fs');
let c = fs.readFileSync('pt.js', 'utf8');

c = c.replace(
  '    SELECT c.id, u.name, u.email, u.username, c.phone, c.client_type,\n           c.block_price, c.current_block_number, c.block_start_date,\n           c.sessions_used, c.is_pro, c.pro_expires_at,',
  '    SELECT c.id, u.name, u.email, u.username, c.phone, c.client_type,\n           c.block_price, c.current_block_number, c.block_start_date,\n           c.sessions_used, c.is_pro, c.pro_expires_at, u.last_login,'
);

fs.writeFileSync('pt.js', c);
console.log('Done');
