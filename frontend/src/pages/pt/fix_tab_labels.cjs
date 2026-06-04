const fs = require('fs');
let c = fs.readFileSync('PTClientProfile.jsx', 'utf8');

const old = `  const tabs = ['overview', 'sessions', 'cancellations', 'progress', 'photos', 'notes', 'messages', 'blocks', 'checkins', 'onboarding', 'assessment', 'programme', 'workouts'];`;

const newCode = `  const tabs = ['overview', 'sessions', 'cancellations', 'progress', 'photos', 'notes', 'messages', 'blocks', 'checkins', 'onboarding', 'assessment', 'programme', 'workouts'];
  const tabLabels = { overview:'Overview', sessions:'Sessions', cancellations:'Cancels', progress:'Progress', photos:'Photos', notes:'Notes', messages:'Messages', blocks:'Blocks', checkins:'Check-ins', onboarding:'Onboard', assessment:'Assessment', programme:'Programme', workouts:'Workouts' };`;

let count = 0;
if (c.includes(old)) { c = c.replace(old, newCode); count++; console.log('Fix 1 applied'); }
else console.log('Fix 1 NOT FOUND');

c = c.replace(
  "            {tab}\n            {tab === 'cancellations'",
  "            {tabLabels[tab] || tab}\n            {tab === 'cancellations'"
);

if (count > 0 || c.includes('tabLabels')) {
  fs.writeFileSync('PTClientProfile.jsx', c);
  console.log('Done');
} else {
  console.log('Nothing changed');
}
