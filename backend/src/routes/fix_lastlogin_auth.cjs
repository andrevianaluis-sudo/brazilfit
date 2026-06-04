const fs = require('fs');
let c = fs.readFileSync('auth.js', 'utf8');

const old = `  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });`;
const newCode = `  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  // Record last login time
  try {
    const db = require('../db/database').getDb();
    db.prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").run(user.id);
  } catch(e) {}`;

if (c.includes(old)) { c = c.replace(old, newCode); fs.writeFileSync('auth.js', c); console.log('Done'); }
else console.log('NOT FOUND');
