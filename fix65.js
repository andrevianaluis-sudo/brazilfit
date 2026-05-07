const fs = require("fs");
const file = "C:/Users/viana/BRAZILFIT/backend/src/routes/checkins.js";
let c = fs.readFileSync(file, "utf8");
c = c.replace(/\[existing\.id\]\(http:\/\/existing\.id\)/g, "existing.id");
c = c.replace(/\[result\.lastInsertRowid\]\(http:\/\/result\.lastInsertRowid\)/g, "result.lastInsertRowid");
fs.writeFileSync(file, c, "utf8");
console.log("Done");
