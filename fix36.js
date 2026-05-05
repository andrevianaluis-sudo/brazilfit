const fs = require("fs");
const path = require("path");
const dir = "C:/Users/viana/BRAZILFIT/frontend/src";

function walk(d) {
  const files = [];
  fs.readdirSync(d).forEach(f => {
    const full = path.join(d, f);
    if (fs.statSync(full).isDirectory()) files.push(...walk(full));
    else if (f.endsWith(".jsx") || f.endsWith(".js")) files.push(full);
  });
  return files;
}

let count = 0;
walk(dir).forEach(file => {
  let c = fs.readFileSync(file, "utf8");
  if (c.includes("Satoshi")) {
    c = c.replace(/"'Satoshi',system-ui"/g, '"\'DM Sans\',system-ui"');
    c = c.replace(/"'Satoshi', system-ui"/g, '"\'DM Sans\', system-ui"');
    c = c.replace(/"'Satoshi',sans-serif"/g, '"\'DM Sans\',sans-serif"');
    c = c.replace(/'Satoshi'/g, "'DM Sans'");
    fs.writeFileSync(file, c, "utf8");
    count++;
  }
});
console.log("Updated", count, "files");