const fs = require("fs");
const file = "C:/Users/viana/BRAZILFIT/backend/src/routes/pt.js";
let c = fs.readFileSync(file, "utf8");

const route = `
// TEMP: Set pt_id for all clients
router.post("/clients/set-pt", (req, res) => {
  if (req.user.role !== "pt") return res.status(403).json({ error: "PT only" });
  const db = getDb();
  try {
    db.exec("ALTER TABLE clients ADD COLUMN pt_id INTEGER");
  } catch(e) {}
  const result = db.prepare("UPDATE clients SET pt_id = ?").run(req.user.id);
  res.json({ updated: result.changes });
});
`;

c = c.replace("module.exports = router;", route + "\nmodule.exports = router;");
fs.writeFileSync(file, c, "utf8");
console.log("Done");