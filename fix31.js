const fs = require("fs");
const file = "C:/Users/viana/BRAZILFIT/frontend/src/pages/client/ClientProgress.jsx";
let c = fs.readFileSync(file, "utf8");
c = c.replace('<div style={{ fontSize:48, marginBottom:16 }}>??</div>', '<div style={{ fontSize:48, marginBottom:16 }}>\uD83D\uDCAA</div>');
fs.writeFileSync(file, c, "utf8");
console.log("Done:", c.includes("\uD83D\uDCAA"));