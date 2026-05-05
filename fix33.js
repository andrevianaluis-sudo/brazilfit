const fs = require("fs");
const file = "C:/Users/viana/BRAZILFIT/frontend/src/pages/client/ClientHome.jsx";
let c = fs.readFileSync(file, "utf8");
c = c.replace(',{ label: \'Leaderboard\', sub: \'See rankings\', to: \'/client/leaderboard\', ic: Trophy, color: \'#FFD600\' }', '');
c = c.replace(', Trophy,', ',');
fs.writeFileSync(file, c, "utf8");
console.log("Done:", !c.includes("Leaderboard"));