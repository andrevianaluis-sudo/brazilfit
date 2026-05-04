const fs = require("fs");
const file = "C:/Users/viana/BRAZILFIT/backend/src/routes/stretches.js";
let c = fs.readFileSync(file, "utf8");
const seedRoute = `
// TEMP: Seed stretching exercises from POST body
router.post("/seed", authenticateToken, (req, res) => {
  if (req.user.role !== "pt") return res.status(403).json({ error: "PT only" });
  const db = getDb();
  const { exercises } = req.body;
  if (!exercises || !Array.isArray(exercises)) return res.status(400).json({ error: "exercises array required" });
  const count = db.prepare("SELECT COUNT(*) as n FROM stretching_exercises").get();
  if (count.n > 0) return res.json({ message: "Already seeded", count: count.n });
  const ins = db.prepare("INSERT INTO stretching_exercises (name, muscle_group, gif_file, difficulty) VALUES (?, ?, ?, ?)");
  let inserted = 0;
  for (const ex of exercises) {
    try { ins.run(ex.name, ex.muscleGroup, ex.filename, "beginner"); inserted++; } catch(e) {}
  }
  res.json({ inserted });
});
`;
c = c.replace("module.exports = router;", seedRoute + "\nmodule.exports = router;");
fs.writeFileSync(file, c, "utf8");
console.log("Done");