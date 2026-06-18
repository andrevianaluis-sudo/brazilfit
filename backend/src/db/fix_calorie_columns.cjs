const fs = require('fs');
let c = fs.readFileSync('database.js', 'utf8');

// Add new migration lines after the last weekly_checkins ALTER
const anchor = `try { db.exec("ALTER TABLE weekly_checkins ADD COLUMN insight TEXT"); } catch(e) {}`;

const additions = `try { db.exec("ALTER TABLE weekly_checkins ADD COLUMN insight TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE clients ADD COLUMN height_cm REAL"); } catch(e) {}
try { db.exec("ALTER TABLE clients ADD COLUMN age INTEGER"); } catch(e) {}
try { db.exec("ALTER TABLE clients ADD COLUMN sex TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE clients ADD COLUMN activity_level TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE clients ADD COLUMN deficit_preference INTEGER"); } catch(e) {}`;

if (c.includes(anchor) && !c.includes('height_cm')) {
  c = c.replace(anchor, additions);
  fs.writeFileSync('database.js', c);
  console.log('Done - calorie profile columns added');
} else {
  console.log(c.includes('height_cm') ? 'Already exists' : 'Anchor NOT FOUND');
}
