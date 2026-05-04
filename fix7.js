const fs = require("fs");
const file = "C:/Users/viana/BRAZILFIT/backend/src/routes/stretches.js";
let c = fs.readFileSync(file, "utf8");
c = c.replace(
  "const count = db.prepare(\"SELECT COUNT(*) as n FROM stretching_exercises\").get();\n  if (count.n > 0) return res.json({ message: \"Already seeded\", count: count.n });",
  ""
);
fs.writeFileSync(file, c, "utf8");
console.log("Done");