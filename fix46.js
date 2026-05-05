const fs = require("fs");
const file = "C:/Users/viana/BRAZILFIT/frontend/src/pages/client/ClientWellness.jsx";
const lines = fs.readFileSync(file, "utf8").split("\n");
// Line 394 (index 394) is "}" - should be closing the ContentCard properly
// Need to insert missing lines before the "}"
lines.splice(394, 1, 
  "        )}",
  "      </div>",
  "    </div>",
  "  );",
  "}"
);
fs.writeFileSync(file, lines.join("\n"), "utf8");
console.log("Done, lines:", lines.length);