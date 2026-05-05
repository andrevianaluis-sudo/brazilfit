const fs = require("fs");
const file = "C:/Users/viana/BRAZILFIT/backend/src/routes/sessions.js";
let c = fs.readFileSync(file, "utf8");
const route = `
// TEMP: Delete upcoming sessions for a client
router.delete("/client/:clientId/upcoming", requirePT, (req, res) => {
  const db = getDb();
  const result = db.prepare("DELETE FROM sessions WHERE client_id = ? AND status = 'upcoming'").run(req.params.clientId);
  res.json({ deleted: result.changes });
});
`;
c = c.replace("module.exports = router;", route + "\nmodule.exports = router;");
fs.writeFileSync(file, c, "utf8");
console.log("Done");