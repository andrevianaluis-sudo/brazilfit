const fs = require("fs");
const file = "C:/Users/viana/BRAZILFIT/frontend/src/pages/client/ClientWellness.jsx";
let c = fs.readFileSync(file, "utf8");
// Remove duplicate isStretchRoutine
c = c.replace(
  "  const isStretchRoutine=tab==='rest_day'&&onStartRoutine;\n  const isStretchRoutine=tab==='rest_day'&&onStartRoutine;",
  "  const isStretchRoutine=tab==='rest_day'&&onStartRoutine;"
);
fs.writeFileSync(file, c, "utf8");
console.log("Done");