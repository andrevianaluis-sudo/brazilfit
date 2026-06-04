const fs = require('fs');
let c = fs.readFileSync('PTLayout.jsx', 'utf8');

c = c.replace("  { icon: DollarSign,  label: 'Income',     to: '/pt/income'                  },\n", "");
c = c.replace("  { icon: BarChart3,   label: 'Analytics',  to: '/pt/analytics'               },\n", "");

fs.writeFileSync('PTLayout.jsx', c);
console.log('Done');
