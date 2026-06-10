const fs = require('fs');
const lines = fs.readFileSync('auth.js', 'utf8').split('\n');
let fixed = false;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const user = jwt.verify(token, JWT_SECRET);') &&
      lines[i + 1] && lines[i + 1].includes('req.user = user;')) {
    lines.splice(i + 1, 1,
      "    // Refresh Pro status from DB so upgrades apply without re-login",
      "    if (user.clientId) {",
      "      try {",
      "        const { getDb } = require('../db/database');",
      "        const row = getDb().prepare('SELECT is_pro FROM clients WHERE id = ?').get(user.clientId);",
      "        if (row) user.isPro = row.is_pro === 1;",
      "      } catch (e) {}",
      "    }",
      "    req.user = user;"
    );
    fixed = true;
    console.log('Fixed at line', i + 1);
    break;
  }
}

if (!fixed) { console.log('NOT FOUND'); process.exit(1); }
fs.writeFileSync('auth.js', lines.join('\n'));
console.log('Done');
