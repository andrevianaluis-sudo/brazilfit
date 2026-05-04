const fs = require("fs");
const file = "C:/Users/viana/BRAZILFIT/backend/src/routes/wellness.js";
let c = fs.readFileSync(file, "utf8");
const route = `
// TEMP: Update wellness content
router.patch("/content/:id", (req, res) => {
  if (req.user.role !== "pt") return res.status(403).json({ error: "PT only" });
  const db = getDb();
  const { content } = req.body;
  db.prepare("UPDATE wellness_content SET content = ? WHERE id = ?").run(content, req.params.id);
  res.json({ ok: true });
});
`;
c = c.replace("module.exports = router;", route + "\nmodule.exports = router;");
fs.writeFileSync(file, c, "utf8");
console.log("Done");