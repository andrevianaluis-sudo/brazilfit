const fs = require("fs");
const file = "C:/Users/viana/BRAZILFIT/frontend/src/pages/client/ClientWellness.jsx";
const lines = fs.readFileSync(file, "utf8").split("\n");
// Remove duplicate )} on line 395 (index 394)
if (lines[394].trim() === ")}") {
  lines.splice(394, 1);
  console.log("Removed duplicate )}");
}
fs.writeFileSync(file, lines.join("\n"), "utf8");
console.log("Done");