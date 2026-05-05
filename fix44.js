const fs = require("fs");
const file = "C:/Users/viana/BRAZILFIT/frontend/src/pages/client/ClientWellness.jsx";
const lines = fs.readFileSync(file, "utf8").split("\n");
// Remove the duplicate </button> on line 383 (index 382)
if (lines[382].trim() === "</button>") {
  lines.splice(382, 1);
  console.log("Removed duplicate </button>");
}
fs.writeFileSync(file, lines.join("\n"), "utf8");
console.log("Done, total lines:", lines.length);