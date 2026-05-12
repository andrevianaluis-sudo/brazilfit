import { useState } from 'react';
import { Search, ChevronDown, MessageSquare, AlertCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BG='#0f0f0f';const SURFACE='#1a1a1a';const S2='#222';const BORDER='rgba(255,255,255,0.08)';const TEXT='#fff';const MUTED='#606060';const ORANGE='#FF6B2B';const YELLOW='#FFD600';const GREEN='#4CAF50';

const FAQS = [
  { id:1,  cat:'Getting Started',      q:'How do I book a session?',           a:'Sessions are booked by your PT. Once booked they appear on your My Sessions page and dashboard. Contact your PT via Messages to request a specific time.' },
  { id:2,  cat:'Getting Started',      q:'How do sessions work?',              a:'Sessions are 60-minute workouts with your PT. You\'ll see them in My Sessions. At 8pm each weekday, attended sessions are automatically marked and your block count updates.' },
  { id:3,  cat:'Getting Started',      q:'What is a 10 session block?',        a:'A block is a package of 10 PT sessions. Once you pay for a block, your PT activates it and you\'ll see your session tracker update in real time.' },
  { id:4,  cat:'Getting Started',      q:'How do I cancel a session?',         a:'Go to My Sessions, find the upcoming session, and tap Cancel. You have up to 24 hours before the session to cancel without penalty. Late cancellations are charged.' },
  { id:5,  cat:'Billing & Payments',   q:'How do I pay for my block?',         a:'Payment is made directly to your PT\'s bank account (bank transfer). Once received, your PT will activate your new block in the app and your tracker will reset.' },
  { id:6,  cat:'Billing & Payments',   q:'What is BrazilFit Pro?',             a:'Pro unlocks full progress photo history, advanced analytics, full nutrition library, and wellness content. Ask your PT about upgrading.' },
  { id:7,  cat:'Billing & Payments',   q:'Can I get a refund?',                a:'Session blocks are non-refundable once activated. Unused sessions may be transferred to a new block at your PT\'s discretion.' },
  { id:8,  cat:'Sessions & Tracking',  q:'Why did my session count change?',   a:'Sessions are auto-marked attended at 8pm on the day. Cancelled sessions are returned to your block. Contact your PT if you think there\'s an error.' },
  { id:9,  cat:'Sessions & Tracking',  q:'What happens if I miss a session?',  a:'Missed sessions are deducted from your block. Your PT may offer a make-up depending on your agreement. You\'ll be notified when approaching your last session.' },
  { id:10, cat:'Sessions & Tracking',  q:'What is the weekly check-in?',       a:'A short 9-question form covering your week — workouts, mood, sleep, stress, wins and goals. Your PT reads every answer and uses it to personalise your programme.' },
  { id:11, cat:'Sessions & Tracking',  q:'What are habit streaks?',            a:'Your streak tracks consecutive weeks of completing your weekly check-in. The longer your streak, the more badges you unlock. Every check-in = +1 streak point.' },
  { id:12, cat:'Technical',            q:'The app is not loading',             a:'Try: 1) Force-close and reopen the browser tab, 2) Check your internet connection, 3) Clear browser cache, 4) Try a different browser.' },
  { id:13, cat:'Technical',            q:'I cannot log in',                    a:'Make sure you\'re using the correct username (not email). If you\'ve forgotten your password, contact your PT to reset it for you.' },
  { id:14, cat:'Technical',            q:'How do I change my password?',       a:'Go to Settings and look for the Change Password option. If you\'re locked out, ask your PT to reset it from their dashboard.' },
];

const CATS = ['Getting Started','Billing & Payments','Sessions & Tracking','Technical'];
const CAT_EMOJIS = { 'Getting Started':'🚀', 'Billing & Payments':'💳', 'Sessions & Tracking':'📊', 'Technical':'⚙️' };

export default function ClientHelp() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);

  const filtered = FAQS.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase()) ||
    f.a.toLowerCase().includes(search.toLowerCase()) ||
    f.cat.toLowerCase().includes(search.toLowerCase())
  );
  const grouped = CATS.reduce((acc, cat) => { acc[cat] = filtered.filter(f => f.cat === cat); return acc; }, {});

  return (
    <div style={{ backgroundColor:BG, minHeight:'100vh', paddingBottom:'6rem', fontFamily:"'DM Sans',system-ui" }}>
      <div style={{ maxWidth:'680px', margin:'0 auto', padding:'2rem 1.25rem' }}>

        {/* Header */}
        <div style={{ marginBottom:'2rem' }}>
          <p style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.2em', color:ORANGE, textTransform:'uppercase', margin:'0 0 6px' }}>Support</p>
          <h1 style={{ fontSize:'2.5rem', fontWeight:800, color:TEXT, letterSpacing:'-0.05em', margin:'0 0 4px', lineHeight:1 }}>Help & FAQ</h1>
          <p style={{ fontSize:'0.82rem', color:MUTED, margin:0 }}>Everything you need to know about BrazilFit</p>
        </div>

        {/* Search */}
        <div style={{ position:'relative', marginBottom:'1.5rem' }}>
          <Search size={16} color={MUTED} style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search topics..."
            style={{ width:'100%', padding:'0.875rem 0.875rem 0.875rem 42px', background:SURFACE, border:`1px solid ${BORDER}`, borderRadius:'12px', color:TEXT, fontFamily:"'DM Sans',system-ui", fontSize:'0.875rem', outline:'none', boxSizing:'border-box' }}
            onFocus={e=>e.target.style.borderColor=ORANGE} onBlur={e=>e.target.style.borderColor=BORDER}/>
        </div>

        {/* FAQ groups */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem', marginBottom:'1.5rem' }}>
          {Object.entries(grouped).map(([cat, items]) => items.length === 0 ? null : (
            <div key={cat}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px' }}>
                <span style={{ fontSize:'1rem' }}>{CAT_EMOJIS[cat]}</span>
                <p style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.18em', color:ORANGE, textTransform:'uppercase', margin:0 }}>{cat}</p>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                {items.map(faq => (
                  <div key={faq.id} style={{ background:SURFACE, borderRadius:'12px', border:`1px solid ${expanded===faq.id?'rgba(255,107,43,0.3)':BORDER}`, overflow:'hidden', transition:'border-color 0.15s' }}>
                    <button onClick={()=>setExpanded(expanded===faq.id?null:faq.id)} style={{
                      width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px',
                      padding:'1rem 1.25rem', background:'none', border:'none', cursor:'pointer', textAlign:'left', minHeight:'auto',
                    }}>
                      <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.875rem', fontWeight:600, color:TEXT, margin:0, flex:1 }}>{faq.q}</p>
                      <ChevronDown size={16} color={MUTED} style={{ flexShrink:0, transform:expanded===faq.id?'rotate(180deg)':'rotate(0)', transition:'transform 0.2s' }}/>
                    </button>
                    {expanded===faq.id&&(
                      <div style={{ padding:'0 1.25rem 1rem', borderTop:`1px solid ${BORDER}` }}>
                        <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.82rem', color:'#c0c0c0', margin:'0.875rem 0 0', lineHeight:1.7 }}>{faq.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {filtered.length===0&&(
            <div style={{ textAlign:'center', padding:'3rem', background:SURFACE, borderRadius:'16px', border:`1px solid ${BORDER}` }}>
              <p style={{ fontSize:'1.5rem', margin:'0 0 8px' }}>🔍</p>
              <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.875rem', color:MUTED, margin:0 }}>No results for "{search}"</p>
            </div>
          )}
        </div>

        {/* Contact */}
        <div style={{ background:'linear-gradient(135deg,#1a2a1a,#1a1a1a)', borderRadius:'16px', border:'1px solid rgba(76,175,80,0.2)', padding:'1.5rem' }}>
          <p style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.18em', color:GREEN, textTransform:'uppercase', margin:'0 0 1rem' }}>Can't find what you need?</p>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            <button onClick={()=>navigate('/client/messages')} style={{
              width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.9rem 1.25rem',
              background:`linear-gradient(135deg,${ORANGE},${YELLOW})`, border:'none', borderRadius:'12px',
              color:'#000', fontFamily:"'DM Sans',system-ui", fontSize:'0.875rem', fontWeight:800,
              cursor:'pointer', minHeight:'auto', boxShadow:`0 4px 16px rgba(255,107,43,0.3)`,
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <MessageSquare size={16}/>
                <span>Message Your PT</span>
              </div>
              <ChevronRight size={14}/>
            </button>
            <button style={{
              width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.9rem 1.25rem',
              background:S2, border:`1px solid ${BORDER}`, borderRadius:'12px',
              color:TEXT, fontFamily:"'DM Sans',system-ui", fontSize:'0.875rem', fontWeight:600,
              cursor:'pointer', minHeight:'auto',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <AlertCircle size={16} color={MUTED}/>
                <span>Report a Problem</span>
              </div>
              <ChevronRight size={14} color={MUTED}/>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
