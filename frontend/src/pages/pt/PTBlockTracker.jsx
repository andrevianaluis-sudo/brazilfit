import { useState, useEffect } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const BG='#0f0f0f';const SURFACE='#1a1a1a';const S2='#222';const BORDER='rgba(255,255,255,0.08)';const TEXT='#fff';const MUTED='#606060';const ORANGE='#FF6B2B';const YELLOW='#FFD600';const GREEN='#4CAF50';const RED='#ef4444';

function StatusIcon({ status }) {
  if (status === 'renew')    return <AlertCircle size={18} color={RED}/>;
  if (status === 'critical') return <AlertTriangle size={18} color={ORANGE}/>;
  if (status === 'warning')  return <AlertTriangle size={18} color={YELLOW}/>;
  return <CheckCircle size={18} color={GREEN}/>;
}

function BlockDots({ used }) {
  return (
    <div style={{ display:'flex', gap:'3px' }}>
      {Array.from({ length:10 }, (_,i) => (
        <div key={i} style={{ flex:1, height:'6px', borderRadius:'2px', background: i < used ? GREEN : S2, transition:'background 0.2s' }}/>
      ))}
    </div>
  );
}

const STATUS_STYLE = {
  renew:    { color:RED,    bg:'rgba(239,68,68,0.1)',   border:'rgba(239,68,68,0.25)',   label:'Renew Now' },
  critical: { color:ORANGE, bg:'rgba(255,107,43,0.1)',  border:'rgba(255,107,43,0.25)',  label:'Critical' },
  warning:  { color:YELLOW, bg:'rgba(255,214,0,0.1)',   border:'rgba(255,214,0,0.25)',   label:'Low' },
  ok:       { color:GREEN,  bg:'rgba(76,175,80,0.05)',  border:'rgba(255,255,255,0.08)', label:'Active' },
};

export default function PTBlockTracker() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [renewingId, setRenewingId] = useState(null);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    api.get('/pt/blocks').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleRenew = async (clientId) => {
    setRenewingId(clientId);
    try {
      await api.post(`/pt/blocks/${clientId}/renew`, { paymentDate });
      const r = await api.get('/pt/blocks');
      setData(r.data);
      toast.success('Block renewed!');
    } catch { toast.error('Failed to renew block'); }
    finally { setRenewingId(null); }
  };

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', padding:'5rem', background:BG }}>
      <div style={{ width:'24px', height:'24px', border:`2px solid ${ORANGE}`, borderTop:'2px solid transparent', borderRadius:'50%', animation:'spin 1s linear infinite' }}/>
    </div>
  );

  const clients = data?.clients || [];
  const needRenew = clients.filter(c => c.blockStatus === 'renew' || c.blockStatus === 'critical');

  return (
    <div style={{ backgroundColor:BG, minHeight:'100vh', padding:'1.5rem 1.25rem', paddingBottom:'6rem', fontFamily:"'DM Sans',system-ui" }}>
      <div style={{ maxWidth:'800px', margin:'0 auto' }}>

        <div style={{ marginBottom:'2rem' }}>
          <p style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.2em', color:ORANGE, textTransform:'uppercase', margin:'0 0 6px' }}>Sessions</p>
          <h1 style={{ fontSize:'2.5rem', fontWeight:800, color:TEXT, letterSpacing:'-0.05em', margin:0, lineHeight:1 }}>Block Tracker</h1>
        </div>

        {/* Alert banner */}
        {needRenew.length > 0 && (
          <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:'14px', padding:'1rem 1.25rem', marginBottom:'1.25rem', display:'flex', alignItems:'center', gap:'12px' }}>
            <AlertCircle size={18} color={RED}/>
            <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.875rem', fontWeight:700, color:RED, margin:0 }}>
              {needRenew.length} client{needRenew.length>1?'s':''} need{needRenew.length===1?'s':''} block renewal
            </p>
          </div>
        )}

        {/* Payment date picker */}
        <div style={{ background:SURFACE, borderRadius:'14px', border:`1px solid ${BORDER}`, padding:'1rem 1.25rem', marginBottom:'1.25rem', display:'flex', alignItems:'center', gap:'14px' }}>
          <p style={{ fontSize:'0.82rem', fontWeight:600, color:TEXT, margin:0, flexShrink:0 }}>Payment date for renewals:</p>
          <input type="date" value={paymentDate} onChange={e=>setPaymentDate(e.target.value)}
            style={{ flex:1, padding:'7px 10px', background:S2, border:`1px solid ${BORDER}`, borderRadius:'8px', color:TEXT, fontFamily:"'DM Sans',system-ui", fontSize:'0.82rem', outline:'none' }}/>
        </div>

        {/* Client blocks */}
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {clients.map(c => {
            const st = STATUS_STYLE[c.blockStatus] || STATUS_STYLE.ok;
            return (
              <div key={c.id} style={{ background:`linear-gradient(135deg,${st.bg},${SURFACE})`, borderRadius:'16px', border:`1px solid ${st.border}`, overflow:'hidden' }}>
                <div style={{ height:'3px', background:`linear-gradient(90deg,${st.color},${st.color}44)` }}/>
                <div style={{ padding:'1rem 1.25rem' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px', marginBottom:'0.875rem' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px', minWidth:0 }}>
                      <StatusIcon status={c.blockStatus}/>
                      <div style={{ minWidth:0 }}>
                        <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'1rem', fontWeight:800, color:TEXT, margin:'0 0 2px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.name}</p>
                        <p style={{ fontSize:'0.7rem', color:MUTED, margin:0 }}>{c.sessionsUsed} of {c.sessionsUsed + c.sessionsRemaining} sessions used</p>
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px', flexShrink:0 }}>
                      <span style={{ fontSize:'0.6rem', fontWeight:700, color:st.color, background:st.bg, border:`1px solid ${st.border}`, borderRadius:'20px', padding:'2px 10px', letterSpacing:'0.08em', textTransform:'uppercase' }}>{st.label}</span>
                      {(c.blockStatus === 'renew' || c.blockStatus === 'critical') && (
                        <button onClick={() => handleRenew(c.id)} disabled={renewingId===c.id} style={{
                          padding:'6px 14px', borderRadius:'8px', border:'none', cursor:'pointer',
                          background:`linear-gradient(135deg,${ORANGE},${YELLOW})`, color:'#000',
                          fontFamily:"'DM Sans',system-ui", fontSize:'0.75rem', fontWeight:800,
                          minHeight:'auto', opacity:renewingId===c.id?0.6:1,
                        }}>
                          {renewingId===c.id?<RefreshCw size={12}/>:'Renew'}
                        </button>
                      )}
                    </div>
                  </div>
                  <BlockDots used={c.sessionsUsed}/>
                  <div style={{ display:'flex', justifyContent:'space-between', marginTop:'5px' }}>
                    <span style={{ fontSize:'0.62rem', color:MUTED }}>{c.sessionsRemaining} sessions remaining</span>
                    {c.lastPaymentDate && <span style={{ fontSize:'0.62rem', color:MUTED }}>Last payment: {new Date(c.lastPaymentDate).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {clients.length === 0 && (
          <div style={{ textAlign:'center', padding:'3rem', background:SURFACE, borderRadius:'16px', border:`1px solid ${BORDER}` }}>
            <p style={{ fontSize:'2rem', margin:'0 0 8px' }}>📦</p>
            <p style={{ fontSize:'0.875rem', color:MUTED, margin:0 }}>No active blocks yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
