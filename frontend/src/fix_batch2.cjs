const fs = require('fs');
const path = require('path');

// Fix 1: Messages polling 2s -> 30s
const msgPath = path.join('..', '..', 'pages', 'pt', 'PTMessages.jsx');
let msg = fs.readFileSync(msgPath, 'utf8');
msg = msg.replace('setInterval(fetchMessages, 2000)', 'setInterval(fetchMessages, 30000)');
fs.writeFileSync(msgPath, msg);
console.log('Messages polling fixed');

// Fix 2: Dead routes in App.jsx
const appPath = path.join('..', '..', 'App.jsx');
let app = fs.readFileSync(appPath, 'utf8');
app = app.replace('        <Route path="income" element={<PTIncome />} />\n', '');
app = app.replace('        <Route path="analytics" element={<PTAnalytics />} />\n', '');
app = app.replace('        <Route path="classes" element={<PTClasses />} />\n', '');
fs.writeFileSync(appPath, app);
console.log('Dead routes removed');

// Fix 3: -- dashes in PTSchedule cancellation
const schedPath = path.join('..', '..', 'pages', 'pt', 'PTSchedule.jsx');
let sched = fs.readFileSync(schedPath, 'utf8');
sched = sched.replace(
  '` -- ${Math.floor(entry.cancellation_notice_hours)}h notice -- session carried over`',
  '` · ${Math.floor(entry.cancellation_notice_hours)}h notice · session carried over`'
);
fs.writeFileSync(schedPath, sched);
console.log('Dashes fixed');

console.log('All done');
