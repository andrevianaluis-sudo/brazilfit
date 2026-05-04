const fs = require("fs");
const file = "C:/Users/viana/BRAZILFIT/frontend/src/pages/client/ClientWellness.jsx";
let c = fs.readFileSync(file, "utf8");
c = c.replace("border:1px solid ,marginBottom:4}", "border:`1px solid ${BORDER}`,marginBottom:4}");
c = c.replace("name={[ex.name](http://ex.name)}", "name={ex.name}");
fs.writeFileSync(file, c, "utf8");
console.log("Done");