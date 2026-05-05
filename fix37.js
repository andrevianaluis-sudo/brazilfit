const fs = require("fs");
const path = require("path");

// Fix index.css - replace Clash Display with DM Sans light weight
const cssFile = "C:/Users/viana/BRAZILFIT/frontend/src/index.css";
let css = fs.readFileSync(cssFile, "utf8");
css = css.replace(/font-family: 'Clash Display'[^;]+;/g, "font-family: 'DM Sans', sans-serif;");
css = css.replace(/font-weight: 800;/g, "font-weight: 300;");
css = css.replace(/font-weight: 700;/g, "font-weight: 400;");
fs.writeFileSync(cssFile, css, "utf8");
console.log("CSS fixed");

// Fix pages.css if exists
const pagesFile = "C:/Users/viana/BRAZILFIT/frontend/src/styles/pages.css";
if (fs.existsSync(pagesFile)) {
  let p = fs.readFileSync(pagesFile, "utf8");
  p = p.replace(/font-family: 'Clash Display'[^;]+;/g, "font-family: 'DM Sans', sans-serif;");
  p = p.replace(/font-family: 'Satoshi'[^;]+;/g, "font-family: 'DM Sans', sans-serif;");
  fs.writeFileSync(pagesFile, p, "utf8");
  console.log("pages.css fixed");
}

// Fix all JSX files
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
walk("C:/Users/viana/BRAZILFIT/frontend/src").forEach(file => {
  let c = fs.readFileSync(file, "utf8");
  const orig = c;
  c = c.replace(/'Clash Display'/g, "'DM Sans'");
  c = c.replace(/fontWeight:800/g, "fontWeight:300");
  c = c.replace(/fontWeight:'800'/g, "fontWeight:'300'");
  c = c.replace(/fontWeight:700/g, "fontWeight:400");
  c = c.replace(/fontWeight:'700'/g, "fontWeight:'400'");
  c = c.replace(/fontSize:'1\.3rem'/g, "fontSize:'1.5rem'");
  c = c.replace(/lineHeight:1\.2/g, "lineHeight:1.4");
  c = c.replace(/lineHeight:1\.4([^5])/g, "lineHeight:1.6$1");
  c = c.replace(/letterSpacing:'-0\.02em'/g, "letterSpacing:'-0.03em'");
  c = c.replace(/letterSpacing:'-0\.03em'/g, "letterSpacing:'-0.04em'");
  if (c !== orig) { fs.writeFileSync(file, c, "utf8"); count++; }
});
console.log("Updated", count, "JSX files");