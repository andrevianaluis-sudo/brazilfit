// Run from C:\Users\viana\BRAZILFIT\frontend\src
const fs = require('fs');

// 1. App.jsx - add import + route
let app = fs.readFileSync('App.jsx', 'utf8');
if (!app.includes("import PTCheckins")) {
  app = app.replace(
    "import PTBlockTracker from './pages/pt/PTBlockTracker';",
    "import PTBlockTracker from './pages/pt/PTBlockTracker';\nimport PTCheckins from './pages/pt/PTCheckins';"
  );
  console.log('Added PTCheckins import');
}
if (!app.includes('path="checkins"')) {
  app = app.replace(
    '<Route path="blocks" element={<PTBlockTracker />} />',
    '<Route path="blocks" element={<PTBlockTracker />} />\n        <Route path="checkins" element={<PTCheckins />} />'
  );
  console.log('Added checkins route');
}
fs.writeFileSync('App.jsx', app);

// 2. PTLayout.jsx - add nav item + icon
let layout = fs.readFileSync('pages/pt/PTLayout.jsx', 'utf8');
// add ClipboardCheck to the lucide import
if (!layout.includes('ClipboardCheck')) {
  layout = layout.replace("import {", "import { ClipboardCheck,");
  console.log('Added ClipboardCheck icon import');
}
// add nav item after Blocks
if (!layout.includes("label: 'Check-ins'")) {
  layout = layout.replace(
    "{ icon: Package,     label: 'Blocks',     to: '/pt/blocks'                  },",
    "{ icon: Package,     label: 'Blocks',     to: '/pt/blocks'                  },\n  { icon: ClipboardCheck, label: 'Check-ins', to: '/pt/checkins'              },"
  );
  console.log('Added Check-ins nav item');
}
fs.writeFileSync('pages/pt/PTLayout.jsx', layout);

console.log('Done');
