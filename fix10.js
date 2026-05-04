const fs = require("fs");
const file = "C:/Users/viana/BRAZILFIT/frontend/src/pages/client/ClientWellness.jsx";
let c = fs.readFileSync(file, "utf8");
c = c.replace(
  "          </div>\n        ):null}\n      </div>",
  "          </div>\n        )}\n      </div>"
);
fs.writeFileSync(file, c, "utf8");
console.log("Done");