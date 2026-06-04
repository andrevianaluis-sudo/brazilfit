const fs = require('fs');
let c = fs.readFileSync('ClientProgress.jsx', 'utf8');

c = c.replace(
  `              padding:'8px 20px', borderRadius:'8px', border:'none', cursor:'pointer', fontSize:'0.82rem', fontWeight:600, minHeight:'auto',\n              background: activeTab===t.key ? \`rgba(255,107,43,0.18)\` : 'rgba(255,255,255,0.04)',\n              color: activeTab===t.key ? ORANGE : '#aaa',\n              border: activeTab===t.key ? \`1px solid rgba(255,107,43,0.4)\` : '1px solid rgba(255,255,255,0.08)',`,
  `              padding:'8px 20px', borderRadius:'8px', cursor:'pointer', fontSize:'0.82rem', fontWeight:600, minHeight:'auto',\n              background: activeTab===t.key ? \`rgba(255,107,43,0.18)\` : 'rgba(255,255,255,0.04)',\n              color: activeTab===t.key ? ORANGE : '#aaa',\n              border: activeTab===t.key ? \`1px solid rgba(255,107,43,0.4)\` : '1px solid rgba(255,255,255,0.08)',`
);

fs.writeFileSync('ClientProgress.jsx', c);
console.log('Done');
