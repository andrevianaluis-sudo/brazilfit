const fs = require("fs");
const file = "C:/Users/viana/BRAZILFIT/backend/src/routes/stretches.js";
let c = fs.readFileSync(file, "utf8");
const idx = c.indexOf("\n// TEMP: Seed stretching exercises from POST body");
if (idx >= 0) { c = c.substring(0, idx) + "\nmodule.exports = router;"; }
fs.writeFileSync(file, c, "utf8");
console.log("Done, length:", c.length);