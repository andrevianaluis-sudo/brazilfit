const fs = require("fs");
const file = "C:/Users/viana/BRAZILFIT/backend/src/index.js";
let c = fs.readFileSync(file, "utf8");

c = c.replace(
  "    console.log(`[CRON] Auto-marked ${result.changes} sessions`);\n  }\n});",
  `    // Send low session alerts
    for (const { client_id } of affected) {
      const client = db.prepare('SELECT sessions_used FROM clients WHERE id = ?').get(client_id);
      const remaining = 10 - (client?.sessions_used || 0);
      if (remaining === 1) {
        try {
          db.prepare(\`
            INSERT INTO messages (sender_id, receiver_id, content, created_at)
            SELECT u_pt.id, u_client.id,
              'You have 1 session remaining in your current block. Please contact me to renew.',
              datetime('now')
            FROM clients c
            JOIN users u_client ON c.user_id = u_client.id
            JOIN users u_pt ON u_pt.role = 'pt'
            WHERE c.id = ?
            LIMIT 1
          \`).run(client_id);
          console.log('[CRON] Low session alert sent to client ' + client_id);
        } catch(e) { console.error('[CRON] Alert error:', e.message); }
      }
    }
    console.log('[CRON] Auto-marked ' + result.changes + ' sessions');
  }
});`
);

fs.writeFileSync(file, c, "utf8");
console.log("Done:", c.includes("Low session alert"));