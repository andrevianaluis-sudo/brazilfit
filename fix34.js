const fs = require("fs");
const file = "C:/Users/viana/BRAZILFIT/frontend/index.html";
let c = fs.readFileSync(file, "utf8");
c = c.replace(
  '<!-- Luxury fitness typography: Clash Display (headings) + Satoshi (body) -->',
  '<!-- Luxury fitness typography: Clash Display (headings) + Satoshi (body) + DM Sans (UI) -->\n    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap" rel="stylesheet" />'
);
fs.writeFileSync(file, c, "utf8");
console.log("Done:", c.includes("DM+Sans"));