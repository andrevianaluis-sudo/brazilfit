const fs = require('fs');
let c = fs.readFileSync('PTBlockTracker.jsx', 'utf8');

const old = `                  <button onClick={(e) => renewBlock(e, c.id)}
                    disabled={renewingId === c.id}
                    style={{ marginTop:'10px', width:'100%', padding:'7px', borderRadius:'8px', border:\`1px solid \${GREEN}40\`, background:\`\${GREEN}12\`, color:GREEN, fontFamily:"'DM Sans',system-ui", fontSize:'0.75rem', fontWeight:700, cursor:renewingId===c.id?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', opacity:renewingId===c.id?0.6:1 }}>
                    <RefreshCw size={12} style={{ animation: renewingId===c.id ? 'spin 1s linear infinite' : 'none' }}/>
                    {renewingId === c.id ? 'Renewing...' : 'Renew Block'}
                  </button>`;

const newCode = `                  {(c.sessions_remaining <= 0 || c.status === 'renew') && (
                    <button onClick={(e) => renewBlock(e, c.id)}
                      disabled={renewingId === c.id}
                      style={{ marginTop:'10px', width:'100%', padding:'7px', borderRadius:'8px', border:\`1px solid \${GREEN}40\`, background:\`\${GREEN}12\`, color:GREEN, fontFamily:"'DM Sans',system-ui", fontSize:'0.75rem', fontWeight:700, cursor:renewingId===c.id?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', opacity:renewingId===c.id?0.6:1 }}>
                      <RefreshCw size={12} style={{ animation: renewingId===c.id ? 'spin 1s linear infinite' : 'none' }}/>
                      {renewingId === c.id ? 'Renewing...' : 'Renew Block'}
                    </button>
                  )}`;

if (c.includes(old)) {
  c = c.replace(old, newCode);
  fs.writeFileSync('PTBlockTracker.jsx', c);
  console.log('Done');
} else {
  console.log('NOT FOUND');
}
