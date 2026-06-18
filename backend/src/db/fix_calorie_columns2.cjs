const fs = require('fs');
let c = fs.readFileSync('database.js', 'utf8');

const anchor = `try { db.exec("ALTER TABLE weekly_checkins ADD COLUMN daily_steps INTEGER"); } catch(e) {}`;

const additions = `try { db.exec("ALTER TABLE weekly_checkins ADD COLUMN daily_steps INTEGER"); } catch(e) {}
try { db.exec("ALTER TABLE clients ADD COLUMN height_cm REAL"); } catch(e) {}
try { db.exec("ALTER TABLE clients ADD COLUMN age INTEGER"); } catch(e) {}
try { db.exec("ALTER TABLE clients ADD COLUMN sex TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE clients ADD COLUMN activity_level TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE clients ADD COLUMN deficit_preference INTEGER"); } catch(e) {}`;

if (c.includes('height_cm')) {
  console.log('Columns already present in code');
} else if (c.includes(anchor)) {
  c = c.replace(anchor, additions);
  fs.writeFileSync('database.js', c);
  console.log('Done - calorie columns added after daily_steps');
} else {
  console.log('Anchor NOT FOUND - daily_steps line missing');
}
