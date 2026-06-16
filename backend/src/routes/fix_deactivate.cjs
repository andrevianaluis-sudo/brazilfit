const fs = require('fs');
let c = fs.readFileSync('pt.js', 'utf8');

// Add is_active to the destructured body
const old1 = "  const { phone, email, sessions_used, current_block_number, block_start_date, block_price, client_type, is_pro, pro_expires_at } = req.body;";
const new1 = "  const { phone, email, sessions_used, current_block_number, block_start_date, block_price, client_type, is_pro, pro_expires_at, is_active } = req.body;";

// Add is_active handling - it's on the users table, not clients
const old2 = "  if (email) db.prepare('UPDATE users SET email = ? WHERE id = ?').run(email, client.user_id);";
const new2 = "  if (email) db.prepare('UPDATE users SET email = ? WHERE id = ?').run(email, client.user_id);\n  if (is_active !== undefined) db.prepare('UPDATE users SET is_active = ? WHERE id = ?').run(is_active ? 1 : 0, client.user_id);";

let count = 0;
if (c.includes(old1)) { c = c.replace(old1, new1); count++; }
if (c.includes(old2)) { c = c.replace(old2, new2); count++; }

fs.writeFileSync('pt.js', c);
console.log(count === 2 ? 'Done' : 'Partial: ' + count);
