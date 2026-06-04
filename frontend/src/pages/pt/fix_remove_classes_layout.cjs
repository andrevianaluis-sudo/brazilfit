const fs = require('fs');

// Fix PTLayout - remove Classes nav item
let layout = fs.readFileSync('PTLayout.jsx', 'utf8');
layout = layout.replace("  { icon: PlayCircle,  label: 'Classes',    to: '/pt/classes'                 },\n", "");
fs.writeFileSync('PTLayout.jsx', layout);
console.log('PTLayout done');
