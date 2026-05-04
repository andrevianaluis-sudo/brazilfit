const fs = require("fs");
const file = "C:/Users/viana/BRAZILFIT/frontend/src/pages/client/ClientLayout.jsx";
let c = fs.readFileSync(file, "utf8");
c = c.replace(", Trophy,", ",");
fs.writeFileSync(file, c, "utf8");
console.log("Done:", !c.includes("Trophy"));