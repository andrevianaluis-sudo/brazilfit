const fs = require('fs');
let c = fs.readFileSync('pt.js', 'utf8');

const old = `  const { phone, email, sessions_used, current_block_number, block_start_date, block_price, client_type } = req.body;`;
const newCode = `  const { phone, email, sessions_used, current_block_number, block_start_date, block_price, client_type, is_pro, pro_expires_at } = req.body;`;

const old2 = `  if (client_type !== undefined)          { fields.push('client_type = ?');          values.push(client_type); }`;
const newCode2 = `  if (client_type !== undefined)          { fields.push('client_type = ?');          values.push(client_type); }
  if (is_pro !== undefined)               { fields.push('is_pro = ?');               values.push(is_pro ? 1 : 0); }
  if (pro_expires_at !== undefined)       { fields.push('pro_expires_at = ?');       values.push(pro_expires_at); }`;

let count = 0;
if (c.includes(old)) { c = c.replace(old, newCode); count++; }
if (c.includes(old2)) { c = c.replace(old2, newCode2); count++; }

fs.writeFileSync('pt.js', c);
console.log(count === 2 ? 'Done' : 'Partial: ' + count + ' fixes applied');
