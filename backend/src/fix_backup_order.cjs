const fs = require('fs');
let c = fs.readFileSync('index.js', 'utf8');

// Remove the misplaced backup endpoint (after the catch-all)
const misplaced = `
// Manual backup trigger (PT only) — GET /api/backup-now?token=...
app.get('/api/backup-now', async (req, res) => {
  await runBackup();
  res.json({ message: 'Backup triggered, check logs' });
});
`;

if (c.includes(misplaced)) {
  c = c.replace(misplaced, '\n');
  console.log('Removed misplaced endpoint');
}

// Insert it BEFORE the catch-all app.get('*')
const catchAll = "app.get('*', (req, res) => {";
const endpoint = `// Manual backup trigger — GET /api/backup-now
app.get('/api/backup-now', async (req, res) => {
  await runBackup();
  res.json({ message: 'Backup triggered, check logs' });
});

app.get('*', (req, res) => {`;

if (c.includes(catchAll) && !c.includes('// Manual backup trigger — GET')) {
  c = c.replace(catchAll, endpoint);
  console.log('Inserted endpoint before catch-all');
}

fs.writeFileSync('index.js', c);
console.log('Done');
