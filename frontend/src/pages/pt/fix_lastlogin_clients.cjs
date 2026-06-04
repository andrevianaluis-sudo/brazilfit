const fs = require('fs');
let c = fs.readFileSync('PTClients.jsx', 'utf8');

const old = `                <p style={{ fontFamily:\\"'DM Sans', system-ui\\", fontSize:'0.72rem', color:MUTED, margin:'0 0 6px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.email}</p>`;

const newCode = `                <p style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.72rem', color:MUTED, margin:'0 0 3px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.email}</p>
                <p style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.65rem', color: c.last_login ? (new Date() - new Date(c.last_login) < 86400000 ? GREEN : new Date() - new Date(c.last_login) < 604800000 ? YELLOW : MUTED) : '#ef4444', margin:'0 0 4px' }}>
                  {c.last_login ? \`Last seen: \${Math.floor((new Date() - new Date(c.last_login)) / 86400000) === 0 ? 'Today' : Math.floor((new Date() - new Date(c.last_login)) / 86400000) + 'd ago'}\` : 'Never logged in'}
                </p>`;

if (c.includes(old)) { c = c.replace(old, newCode); fs.writeFileSync('PTClients.jsx', c); console.log('Done'); }
else console.log('NOT FOUND');
