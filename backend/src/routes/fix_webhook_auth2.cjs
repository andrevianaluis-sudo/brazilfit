const fs = require('fs');
const lines = fs.readFileSync('subscriptions.js', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === 'router.use(authenticateToken);') {
    lines[i] = `// Apply auth to all routes EXCEPT the Stripe webhook
router.use((req, res, next) => {
  if (req.path === '/webhook') return next();
  return authenticateToken(req, res, next);
});`;
    console.log('Fixed at line', i + 1);
    break;
  }
}

fs.writeFileSync('subscriptions.js', lines.join('\n'));
console.log('Done');
