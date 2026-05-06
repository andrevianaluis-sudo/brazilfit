const fs = require('fs');
const file = 'C:/Users/viana/BRAZILFIT/backend/src/routes/checkins.js';
let c = fs.readFileSync(file, 'utf8');
// Add migration to add missing columns
const migration = `
// Add rich checkin columns migration
try { db.exec('ALTER TABLE weekly_checkins ADD COLUMN wins TEXT'); } catch(e) {}
try { db.exec('ALTER TABLE weekly_checkins ADD COLUMN challenges TEXT'); } catch(e) {}
try { db.exec('ALTER TABLE weekly_checkins ADD COLUMN next_week_goals TEXT'); } catch(e) {}
try { db.exec('ALTER TABLE weekly_checkins ADD COLUMN workouts_felt TEXT'); } catch(e) {}
try { db.exec('ALTER TABLE weekly_checkins ADD COLUMN overall_mood TEXT'); } catch(e) {}
try { db.exec('ALTER TABLE weekly_checkins ADD COLUMN motivation_score INTEGER'); } catch(e) {}
try { db.exec('ALTER TABLE weekly_checkins ADD COLUMN stress_score INTEGER'); } catch(e) {}
try { db.exec('ALTER TABLE weekly_checkins ADD COLUMN goals_last_week TEXT'); } catch(e) {}
try { db.exec('ALTER TABLE weekly_checkins ADD COLUMN goals_achieved INTEGER'); } catch(e) {}
try { db.exec('ALTER TABLE weekly_checkins ADD COLUMN insight TEXT'); } catch(e) {}
try { db.exec('ALTER TABLE weekly_checkins ADD COLUMN sleep_hours REAL'); } catch(e) {}
try { db.exec('ALTER TABLE weekly_checkins ADD COLUMN water_glasses INTEGER'); } catch(e) {}
try { db.exec('ALTER TABLE weekly_checkins ADD COLUMN daily_steps INTEGER'); } catch(e) {}
`;
c = c.replace('router.get', migration + '\nrouter.get');
fs.writeFileSync(file, c, 'utf8');
console.log('Done');
