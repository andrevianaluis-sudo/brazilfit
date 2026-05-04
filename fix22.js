const fs = require("fs");
const file = "C:/Users/viana/BRAZILFIT/backend/src/routes/pt.js";
let c = fs.readFileSync(file, "utf8");
c = c.replace(
  "const { phone, email } = req.body;",
  "const { phone, email, sessions_used } = req.body;"
);
c = c.replace(
  "  res.json({ message: 'Client updated' });",
  "  if (sessions_used !== undefined) db.prepare('UPDATE clients SET sessions_used = ? WHERE id = ?').run(sessions_used, req.params.id);\n  res.json({ message: 'Client updated' });"
);
fs.writeFileSync(file, c, "utf8");
console.log("Done:", c.includes("sessions_used !== undefined"));