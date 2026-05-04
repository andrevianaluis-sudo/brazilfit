const fs = require("fs");
const file = "C:/Users/viana/BRAZILFIT/frontend/src/pages/client/ClientWellness.jsx";
let c = fs.readFileSync(file, "utf8");

// Close the browse section wrapper div before selectedStretch modal
c = c.replace(
  `            {selectedStretch&&(`,
  `            </div>
            {selectedStretch&&(`
);

fs.writeFileSync(file, c, "utf8");
console.log("Done");
