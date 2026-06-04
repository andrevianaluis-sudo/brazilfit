const fs = require('fs');
let c = fs.readFileSync('database.js', 'utf8');

c = c.replace(
  'module.exports = { getDb };',
  `// Add last_login column if not exists\ntry { db.exec("ALTER TABLE users ADD COLUMN last_login TEXT"); } catch(e) {}\n\nmodule.exports = { getDb };`
);

fs.writeFileSync('database.js', c);
console.log('Done');
