const fs = require('fs');
const file = 'C:/Users/viana/BRAZILFIT/frontend/src/pages/client/ClientLayout.jsx';
let c = fs.readFileSync(file, 'utf8');
c = c.replace("import api from '../../utils/api';", "// api already imported");
if (!c.includes("import api")) { c = c.replace("import { useAuth }", "import api from '../../utils/api';\nimport { useAuth }"); }
fs.writeFileSync(file, c, 'utf8');
console.log('Done:', c.includes("import api"));
