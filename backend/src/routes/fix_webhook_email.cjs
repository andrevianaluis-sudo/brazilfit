const fs = require('fs');
const lines = fs.readFileSync('subscriptions.js', 'utf8').split('\n');

let start = -1, end = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("if (event.type === 'checkout.session.completed')")) {
    start = i;
  }
  if (start > -1 && lines[i].trim() === '}' && i > start + 5) {
    // Find the closing brace of the if block
    let depth = 0;
    for (let j = start; j <= i; j++) {
      depth += (lines[j].match(/{/g) || []).length;
      depth -= (lines[j].match(/}/g) || []).length;
    }
    if (depth === 0) { end = i; break; }
  }
}

console.log('Found checkout block from line', start + 1, 'to', end + 1);

const newBlock = [
  "  if (event.type === 'checkout.session.completed') {",
  "    const session = event.data.object;",
  "    let clientId = session.metadata?.clientId;",
  "    const plan = session.metadata?.plan || 'annual';",
  "    const email = session.customer_details?.email;",
  "",
  "    // If no clientId in metadata, try to find client by email",
  "    if (!clientId && email) {",
  "      const user = db.prepare(\"SELECT u.id, c.id as client_id FROM users u JOIN clients c ON c.user_id = u.id WHERE LOWER(u.email) = LOWER(?)\").get(email);",
  "      if (user) clientId = user.client_id;",
  "    }",
  "",
  "    if (clientId) {",
  "      const expiresAt = new Date();",
  "      if (plan === 'annual') expiresAt.setFullYear(expiresAt.getFullYear() + 1);",
  "      else expiresAt.setMonth(expiresAt.getMonth() + 1);",
  "      db.prepare('UPDATE clients SET is_pro = 1, pro_expires_at = ? WHERE id = ?')",
  "        .run(expiresAt.toISOString().split('T')[0], clientId);",
  "      console.log('[webhook] Upgraded client', clientId, 'to Pro until', expiresAt.toISOString().split('T')[0]);",
  "    } else {",
  "      console.log('[webhook] Could not find client for email:', email);",
  "    }",
  "  }"
];

lines.splice(start, end - start + 1, ...newBlock);
fs.writeFileSync('subscriptions.js', lines.join('\n'));
console.log('Done');
