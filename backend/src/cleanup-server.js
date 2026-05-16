const express = require('express');
const app = express();
const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(process.env.DB_PATH || '/app/data/brazilfit.db');

app.get('/cleanup', (req, res) => {
  try {
    const usernames = ['andy.devlin','chris.siddle','clare.moody','filomena','hilary','james','jaquetta','laura','louisa','louise','lucy','lucy.clarke','lynne','michelle.pegg','noah','puja','sharon.langridge','sharon','sue.crawley','andy','chris','chrissie','clare','craig','michelle','neil','sofia','sue'];
    let deleted = 0;
    for (const u of usernames) {
      const email = u + '@brazilfit.app';
      const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
      if (!user) continue;
      const client = db.prepare('SELECT id FROM clients WHERE user_id = ?').get(user.id);
      if (client) {
        db.prepare('DELETE FROM blocks WHERE client_id = ?').run(client.id);
        db.prepare('DELETE FROM client_settings WHERE client_id = ?').run(client.id);
        db.prepare('DELETE FROM sessions WHERE client_id = ?').run(client.id);
        db.prepare('DELETE FROM clients WHERE id = ?').run(client.id);
      }
      db.prepare('DELETE FROM users WHERE id = ?').run(user.id);
      deleted++;
    }
    db.prepare("UPDATE clients SET block_price = 400 WHERE client_type = 'F2F' AND block_price = 500").run();
    db.prepare("UPDATE clients SET block_price = 350 WHERE client_type = 'Online'").run();
    res.json({ done: true, deleted });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.listen(3001, () => console.log('Cleanup server on 3001'));