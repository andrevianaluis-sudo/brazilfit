const fs = require('fs');
let c = fs.readFileSync('subscriptions.js', 'utf8');

const old = `router.use(authenticateToken);\n`;
const newCode = `// Apply auth to all routes EXCEPT the Stripe webhook\nrouter.use((req, res, next) => {\n  if (req.path === '/webhook') return next();\n  return authenticateToken(req, res, next);\n});\n`;

if (c.includes(old)) {
  c = c.replace(old, newCode);
  fs.writeFileSync('subscriptions.js', c);
  console.log('Done');
} else {
  console.log('NOT FOUND');
}
