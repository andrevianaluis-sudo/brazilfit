const fs = require("fs");
const file = "C:/Users/viana/BRAZILFIT/backend/src/routes/pt.js";
let c = fs.readFileSync(file, "utf8");
const idx = c.indexOf("\n// TEMP: Set pt_id for all clients");
if (idx >= 0) { c = c.substring(0, idx) + "\nmodule.exports = router;"; }
fs.writeFileSync(file, c, "utf8");
console.log("Done");