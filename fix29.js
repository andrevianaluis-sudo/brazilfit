const fs = require("fs");
const file = "C:/Users/viana/BRAZILFIT/backend/src/routes/progress.js";
let c = fs.readFileSync(file, "utf8");
const route = `
// TEMP: Delete all progress entries for a client
router.delete("/entries/:clientId", (req, res) => {
  if (req.user.role !== "pt") return res.status(403).json({ error: "PT only" });
  const db = getDb();
  const result = db.prepare("DELETE FROM progress_entries WHERE client_id = ?").run(req.params.clientId);
  res.json({ deleted: result.changes });
});
`;
c = c.replace("module.exports = router;", route + "\nmodule.exports = router;");
fs.writeFileSync(file, c, "utf8");
console.log("Done");