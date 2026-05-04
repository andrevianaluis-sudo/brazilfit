const fs = require("fs");
const file = "C:/Users/viana/BRAZILFIT/backend/src/routes/pt.js";
let c = fs.readFileSync(file, "utf8");
c = c.replace(
`router.put("/clients/:id", (req, res) => {
  const db = getDb();
  const { phone, email } = req.body;
  if (phone) db.prepare("UPDATE clients SET phone = ? WHERE id = ?").run(phone, req.params.id);
  if (email) {
    const client = db.prepare("SELECT user_id FROM clients WHERE id = ?").get(req.params.id);
    db.prepare("UPDATE users SET email = ? WHERE id = ?").run(email, client.user_id);
  }
  res.json({ message: "Client updated" });
});`,
`router.put("/clients/:id", (req, res) => {
  const db = getDb();
  const { phone, email, sessions_used, sessions_remaining, schedule } = req.body;
  if (phone) db.prepare("UPDATE clients SET phone = ? WHERE id = ?").run(phone, req.params.id);
  if (email) {
    const client = db.prepare("SELECT user_id FROM clients WHERE id = ?").get(req.params.id);
    db.prepare("UPDATE users SET email = ? WHERE id = ?").run(email, client.user_id);
  }
  if (sessions_used !== undefined) db.prepare("UPDATE clients SET sessions_used = ? WHERE id = ?").run(sessions_used, req.params.id);
  if (schedule) db.prepare("UPDATE clients SET block_start_date = block_start_date WHERE id = ?").run(req.params.id);
  res.json({ message: "Client updated" });
});`
);
fs.writeFileSync(file, c, "utf8");
console.log("Done:", c.includes("sessions_used !== undefined"));