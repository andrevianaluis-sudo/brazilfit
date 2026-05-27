const fs = require('fs');
let c = fs.readFileSync('PTBlockTracker.jsx', 'utf8');

// 1. Add RefreshCw to imports
c = c.replace(
  "import { AlertCircle, ChevronRight } from 'lucide-react';",
  "import { AlertCircle, ChevronRight, RefreshCw } from 'lucide-react';"
);

// 2. Add renewingId state
c = c.replace(
  "  const navigate = useNavigate();",
  "  const [renewingId, setRenewingId] = useState(null);\n  const navigate = useNavigate();"
);

// 3. Add renewBlock function
c = c.replace(
  "  const urgentCount = clients.filter",
  `  const renewBlock = async (e, clientId) => {
    e.stopPropagation();
    setRenewingId(clientId);
    try {
      const today = new Date().toISOString().split('T')[0];
      await api.post(\`/pt/blocks/\${clientId}/renew\`, { paymentDate: today });
      const r = await api.get('/pt/blocks');
      const sorted = (r.data?.clients || []).sort((a,b) => (a.sessions_remaining||0) - (b.sessions_remaining||0));
      setClients(sorted);
    } catch(err) {
      alert('Renew failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setRenewingId(null);
    }
  };

  const urgentCount = clients.filter`
);

// 4. Add Renew button after BlockDots
c = c.replace(
  `                  <BlockDots used={used}/>
                  <div style={{ display:'flex', justifyContent:'space-between', marginTop:'5px' }}>
                    <span style={{ fontSize:'0.65rem', color:MUTED }}>{used} / 10 sessions used</span>
                    {c.payment_date && <span style={{ fontSize:'0.65rem', color:MUTED }}>Since {new Date(c.payment_date).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</span>}
                  </div>`,
  `                  <BlockDots used={used}/>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'8px' }}>
                    <span style={{ fontSize:'0.65rem', color:MUTED }}>{used} / 10 sessions used</span>
                    {c.payment_date && <span style={{ fontSize:'0.65rem', color:MUTED }}>Since {new Date(c.payment_date).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</span>}
                  </div>
                  <button onClick={(e) => renewBlock(e, c.id)}
                    disabled={renewingId === c.id}
                    style={{ marginTop:'10px', width:'100%', padding:'7px', borderRadius:'8px', border:\`1px solid \${GREEN}40\`, background:\`\${GREEN}12\`, color:GREEN, fontFamily:"'DM Sans',system-ui", fontSize:'0.75rem', fontWeight:700, cursor:renewingId===c.id?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', opacity:renewingId===c.id?0.6:1 }}>
                    <RefreshCw size={12} style={{ animation: renewingId===c.id ? 'spin 1s linear infinite' : 'none' }}/>
                    {renewingId === c.id ? 'Renewing...' : 'Renew Block'}
                  </button>`
);

fs.writeFileSync('PTBlockTracker.jsx', c);
console.log('Done');
