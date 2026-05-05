const fs = require("fs");
const file = "C:/Users/viana/BRAZILFIT/frontend/src/index.css";
let c = fs.readFileSync(file, "utf8");
c = c.replace(/font-family: 'Satoshi'[^;]+;/g, "font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;");
fs.writeFileSync(file, c, "utf8");
console.log("Done - Satoshi remaining:", (c.match(/Satoshi/g) || []).length);