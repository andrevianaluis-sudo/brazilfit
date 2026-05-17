import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ChevronRight } from 'lucide-react';
import api from '../../utils/api';

const BG='#0f0f0f';const SURFACE='#1a1a1a';const S2='#222';const BORDER='rgba(255,255,255,0.08)';const TEXT='#fff';const MUTED='#606060';const ORANGE='#FF6B2B';const GREEN='#4CAF50';const RED='#ef4444';const YELLOW='#FFD600';

const STATUS_STYLE = {
  renew:    { color:RED,    border:'rgba(239,68,68,0.2)',    label:'Block Done' },
  critical: { color:ORANGE, border:'rgba(255,107,43,0.2)',   label:'1 Left' },
  warning:  { color:YELLOW, border:'rgba(255,214,0,0.2)',    label:'Running Low' },
  ok:       { color:GREEN,  border:'rgba(255,255,255,0.06)', label:'Active' },
};

function BlockDots({ used }) {
  return (
    <div style={{ display:'flex', gap:'3px' }}>
      {Array.from({ length:10 }, (_,i) => (
        <div key={i} style={{ flex:1, height:'5px', borderRadius:'2px', background: i < used ? GREEN : S2 }}/>
      ))}
    </div>
  );
}

export default function PTBlockTracker() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/pt/blocks')
      .then(r => {
        const sorted = (r.data?.clients || []).sort((a,b) => (a.sessions_remaining||0) - (b.sessions_remaining||0));
        setClients(sorted);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const urgentCount = clients.filter(c => c.status === 'renew' || c.status === 'critical').length;

  const filters = [
    { key:'all',    label:'All',         count: clients.length },
    { key:'urgent', label:'Urgent',      count: urgentCount },
    { key:'low',    label:'Running Low', count: clients.filter(c => c.status === 'warning').length },
    { key:'ok',     label:'Active',      count: clients.filter(c => c.status === 'ok').length },
  ];

  const filtered = clients.filter(c => {
    if (filter === 'urgent') return c.status === 'renew' || c.status === 'critical';
    if (filter === 'low')    return c.status === 'warning';
    if (filter === 'ok')     return c.status === 'ok';
    return true;
  });

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', padding:'5rem' }}>
      <div style={{ width:'24px', height:'24px', border:`2px solid ${ORANGE}`, borderTop:'2px solid transparent', borderRadius:'50%', animation:'spin 1s linear infinite' }}/>
    </div>
  );

  return (
    <div style={{ backgroundColor:BG, minHeight:'100vh', padding:'1.5rem 1.25rem', paddingBottom:'6rem', fontFamily:"'DM Sans',system-ui" }}>
      <div style={{ maxWidth:'800px', margin:'0 auto' }}>

        <div style={{ marginBottom:'1.5rem' }}>
          <p style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.2em', color:ORANGE, textTransform:'uppercase', margin:'0 0 6px' }}>Sessions</p>
          <h1 style={{ fontSize:'2.2rem', fontWeight:800, color:TEXT, letterSpacing:'-0.05em', margin:0, lineHeight:1 }}>Block Tracker</h1>
          <p style={{ fontSize:'0.82rem', color:MUTED, margin:'6px 0 0' }}>Sorted by sessions remaining — lowest first</p>
        </div>

        {urgentCount > 0 && (
          <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'14px', padding:'0.875rem 1.25rem', marginBottom:'1.25rem', display:'flex', alignItems:'center', gap:'12px' }}>
            <AlertCircle size={16} color={RED}/>
            <p style={{ fontSize:'0.875rem', fontWeight:700, color:RED, margin:0 }}>
              {urgentCount} client{urgentCount>1?'s':''} {urgentCount===1?'has':'have'} finished or nearly finished their block
            </p>
          </div>
        )}

        <div style={{ display:'flex', gap:'8px', marginBottom:'1.25rem', overflowX:'auto' }}>
          {filters.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              style={{ display:'flex', alignItems:'center', gap:'6px', padding:'7px 14px', borderRadius:'20px', border:'none', cursor:'pointer', whiteSpace:'nowrap', fontFamily:"'DM Sans',system-ui", fontSize:'0.8rem', fontWeight:600,
                background: filter === f.key ? ORANGE : S2,
                color: filter === f.key ? '#000' : MUTED,
              }}>
              {f.label}
              {f.count > 0 && (
                <span style={{ fontSize:'0.65rem', fontWeight:800, background:'rgba(0,0,0,0.2)', padding:'1px 6px', borderRadius:'10px' }}>
                  {f.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          {filtered.map(c => {
            const st = STATUS_STYLE[c.status] || STATUS_STYLE.ok;
            const isUrgent = c.status === 'renew' || c.status === 'critical';
            const remaining = c.sessions_remaining || 0;
            const used = c.sessions_used || 0;
            return (
              <div key={c.id} onClick={() => navigate(`/pt/clients/${c.id}`)}
                style={{ background:SURFACE, borderRadius:'14px', border:`1px solid ${isUrgent ? st.border : BORDER}`, overflow:'hidden', cursor:'pointer' }}>
                {isUrgent && <div style={{ height:'2px', background:`linear-gradient(90deg,${st.color},${st.color}44)` }}/>}
                <div style={{ padding:'0.875rem 1rem' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px', marginBottom:'10px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px', minWidth:0 }}>
                      <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:`${st.color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'1rem', color:st.color, flexShrink:0 }}>
                        {c.name.charAt(0)}
                      </div>
                      <div style={{ minWidth:0 }}>
                        <p style={{ fontSize:'0.95rem', fontWeight:700, color:TEXT, margin:'0 0 2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.name}</p>
                        <p style={{ fontSize:'0.7rem', color:MUTED, margin:0 }}>Block {c.current_block_number} · £{c.block_price}</p>
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px', flexShrink:0 }}>
                      <span style={{ fontSize:'0.65rem', fontWeight:700, color:st.color, background:`${st.color}15`, border:`1px solid ${st.border}`, borderRadius:'20px', padding:'3px 10px' }}>
                        {remaining <= 0 ? 'Done' : `${remaining} left`}
                      </span>
                      <ChevronRight size={16} color={MUTED}/>
                    </div>
                  </div>
                  <BlockDots used={used}/>
                  <div style={{ display:'flex', justifyContent:'space-between', marginTop:'5px' }}>
                    <span style={{ fontSize:'0.65rem', color:MUTED }}>{used} / 10 sessions used</span>
                    {c.payment_date && <span style={{ fontSize:'0.65rem', color:MUTED }}>Since {new Date(c.payment_date).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'3rem', background:SURFACE, borderRadius:'16px', border:`1px solid ${BORDER}` }}>
            <p style={{ fontSize:'2rem', margin:'0 0 8px' }}>✅</p>
            <p style={{ fontSize:'0.875rem', color:MUTED, margin:0 }}>No clients in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}