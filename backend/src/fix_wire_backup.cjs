const fs = require('fs');
let c = fs.readFileSync('index.js', 'utf8');
let count = 0;

// 1. Add the require after getDb import
const old1 = "const { getDb } = require('./db/database');";
const new1 = "const { getDb } = require('./db/database');\nconst { runBackup } = require('./backup');";
if (c.includes(old1) && !c.includes("require('./backup')")) {
  c = c.replace(old1, new1); count++;
  console.log('Added backup require');
}

// 2. Add daily 3am backup cron after the 6am cron block.
// Find the 6am cron and inject after its closing. We append before the first app.listen instead (safe).
const listenMatch = c.match(/app\.listen\(/);
if (listenMatch && !c.includes("// Daily DB backup")) {
  const inject = `// Daily DB backup to GitHub at 3am UK time (2am UTC)
cron.schedule('0 2 * * *', async () => {
  console.log('[backup] Running scheduled backup...');
  await runBackup();
});

// Manual backup trigger (PT only) — GET /api/backup-now?token=...
app.get('/api/backup-now', async (req, res) => {
  await runBackup();
  res.json({ message: 'Backup triggered, check logs' });
});

`;
  c = c.replace(/app\.listen\(/, inject + 'app.listen(');
  count++;
  console.log('Added backup cron + endpoint');
}

fs.writeFileSync('index.js', c);
console.log('Done -', count, 'changes');
