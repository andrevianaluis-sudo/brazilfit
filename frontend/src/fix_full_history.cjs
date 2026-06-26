const fs = require('fs');
let c = fs.readFileSync('pages/client/ClientSessions.jsx', 'utf8');
let steps = 0;

// 1. Change history limit to show all
const oldLimit = "const limitedHistory=user?.isPro?history:history.slice(0,5);";
const newLimit = "const limitedHistory=history;";
if (c.includes(oldLimit)) { c = c.replace(oldLimit, newLimit); steps++; }

// 2. Remove the "See all" button block (top right of history)
const seeAllBlock = `            {!user?.isPro&&history.length>5&&(
              <button onClick={()=>navigate('/client/upgrade')} style={{display:'flex',alignItems:'center',gap:'4px',background:'none',border:'none',cursor:'pointer',fontFamily:"'DM Sans',system-ui",fontSize:'0.65rem',fontWeight:700,color:YELLOW,letterSpacing:'0.08em',textTransform:'uppercase',minHeight:'auto',padding:0}}>
                <Crown size={11}/>See all {history.length}
              </button>
            )}
`;
if (c.includes(seeAllBlock)) { c = c.replace(seeAllBlock, ''); steps++; }

// 3. Remove the "X more sessions / Upgrade to Pro" banner at the bottom
const banner = `          {!user?.isPro&&history.length>5&&(
            <div onClick={()=>navigate('/client/upgrade')} style={{marginTop:'8px',borderRadius:'14px',padding:'1rem 1.25rem',background:'rgba(255,214,0,0.06)',border:'1px solid rgba(255,214,0,0.2)',display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer'}}>
              <div>
                <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.85rem',fontWeight:700,color:YELLOW,margin:'0 0 2px'}}>{history.length-5} more sessions</p>
                <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.72rem',color:MUTED,margin:0}}>Upgrade to Pro to see full history</p>
              </div>
              <Crown size={14} color={YELLOW}/>
            </div>
          )}
`;
if (c.includes(banner)) { c = c.replace(banner, ''); steps++; }

fs.writeFileSync('pages/client/ClientSessions.jsx', c);
console.log('Done -', steps, 'of 3 changes applied');
