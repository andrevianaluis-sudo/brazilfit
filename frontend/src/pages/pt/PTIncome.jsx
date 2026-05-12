import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, Calendar } from 'lucide-react';
import api from '../../utils/api';

const BG='#0f0f0f';const SURFACE='#1a1a1a';const S2='#222';const BORDER='rgba(255,255,255,0.08)';const TEXT='#fff';const MUTED='#606060';const ORANGE='#FF6B2B';const YELLOW='#FFD600';const GREEN='#4CAF50';const BLUE='#60a5fa';const RED='#ef4444';

function SectionLabel({ children, color=ORANGE }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'0.875rem' }}>
      <div style={{ width:'3px', height:'14px', borderRadius:'2px', background:`linear-gradient(180deg,${color},${color}88)` }}/>
      <p style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.2em', color, textTransform:'uppercase', margin:0 }}>{children}</p>
    </div>
  );
}

function fmt(v) { return `£${Number(v||0).toLocaleString('en-GB')}`; }

function IncomeCard({ label, gross, tax, net, color=GREEN }) {
  return (
    <div style={{ background:`linear-gradient(135deg,${color}10,${SURFACE})`, borderRadius:'14px', padding:'1.1rem', border:`1px solid ${color}20` }}>
      <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'1.6rem', fontWeight:800, color, margin:'0 0 2px', letterSpacing:'-0.04em', lineHeight:1 }}>{fmt(gross)}</p>
      <p style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.12em', color:MUTED, textTransform:'uppercase', margin:'0 0 8px' }}>{label}</p>
      <div style={{ display:'flex', gap:'12px' }}>
        <span style={{ fontSize:'0.72rem', color:RED, fontWeight:600 }}>Tax: {fmt(tax)}</span>
        <span style={{ fontSize:'0.72rem', color:MUTED, fontWeight:600 }}>Net: {fmt(net)}</span>
      </div>
    </div>
  );
}

export default function PTIncome() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/pt/income').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', padding:'5rem', background:BG }}>
      <div style={{ width:'24px', height:'24px', border:`2px solid ${ORANGE}`, borderTop:'2px solid transparent', borderRadius:'50%', animation:'spin 1s linear infinite' }}/>
    </div>
  );

  const s = data?.summary || {};

  return (
    <div style={{ backgroundColor:BG, minHeight:'100vh', padding:'1.5rem 1.25rem', paddingBottom:'6rem', fontFamily:"'DM Sans',system-ui" }}>
      <div style={{ maxWidth:'800px', margin:'0 auto' }}>

        <div style={{ marginBottom:'2rem' }}>
          <p style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.2em', color:ORANGE, textTransform:'uppercase', margin:'0 0 6px' }}>Finances</p>
          <h1 style={{ fontSize:'2.5rem', fontWeight:800, color:TEXT, letterSpacing:'-0.05em', margin:0, lineHeight:1 }}>Income</h1>
        </div>

        {/* Summary cards */}
        <div style={{ marginBottom:'1.75rem' }}>
          <SectionLabel color={GREEN}>Overall Summary</SectionLabel>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'8px' }}>
            <IncomeCard label="Total Gross" gross={s.totalGross} tax={s.totalTax} net={s.totalNet} color={GREEN}/>
            <IncomeCard label="PT Sessions" gross={s.ptGross} tax={s.ptTax} net={s.ptNet} color={ORANGE}/>
            <IncomeCard label="Classes" gross={s.classGross} tax={s.classTax} net={s.classNet} color={BLUE}/>
            <div style={{ background:`linear-gradient(135deg,${YELLOW}10,${SURFACE})`, borderRadius:'14px', padding:'1.1rem', border:`1px solid ${YELLOW}20` }}>
              <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'1.6rem', fontWeight:800, color:YELLOW, margin:'0 0 2px', letterSpacing:'-0.04em', lineHeight:1 }}>{fmt(s.totalNet)}</p>
              <p style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.12em', color:MUTED, textTransform:'uppercase', margin:'0 0 8px' }}>Total Net (after 20% tax)</p>
              <p style={{ fontSize:'0.72rem', color:RED, fontWeight:600 }}>Tax owed: {fmt(s.totalTax)}</p>
            </div>
          </div>
        </div>

        {/* Per client */}
        {data?.ptIncome?.length > 0 && (
          <div style={{ marginBottom:'1.75rem' }}>
            <SectionLabel color={ORANGE}>Per Client</SectionLabel>
            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              {data.ptIncome.map((c,i) => (
                <div key={c.id} style={{ background:SURFACE, borderRadius:'12px', padding:'0.875rem 1rem', border:`1px solid ${BORDER}`, display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px' }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:'0.9rem', fontWeight:700, color:TEXT, margin:'0 0 2px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.name}</p>
                    <p style={{ fontSize:'0.7rem', color:MUTED, margin:0 }}>{c.blocks_sold} block{c.blocks_sold!==1?'s':''} · Net {fmt(c.net)}</p>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <p style={{ fontSize:'1.1rem', fontWeight:800, color:GREEN, margin:'0 0 2px', letterSpacing:'-0.02em' }}>{fmt(c.total_earned)}</p>
                    <p style={{ fontSize:'0.65rem', color:RED }}>-{fmt(c.tax)} tax</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Per class */}
        {data?.classIncome?.length > 0 && (
          <div>
            <SectionLabel color={BLUE}>Per Class</SectionLabel>
            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              {data.classIncome.map((c,i) => {
                const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
                return (
                  <div key={c.id} style={{ background:SURFACE, borderRadius:'12px', padding:'0.875rem 1rem', border:`1px solid ${BORDER}`, display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px' }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:'0.9rem', fontWeight:700, color:TEXT, margin:'0 0 2px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.name}</p>
                      <p style={{ fontSize:'0.7rem', color:MUTED, margin:0 }}>{days[c.day_of_week]} {c.class_time} · {c.sessions_run} sessions</p>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <p style={{ fontSize:'1.1rem', fontWeight:800, color:BLUE, margin:'0 0 2px', letterSpacing:'-0.02em' }}>{fmt(c.total_earned)}</p>
                      <p style={{ fontSize:'0.65rem', color:RED }}>-{fmt(c.tax)} tax</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!data && (
          <div style={{ textAlign:'center', padding:'3rem', background:SURFACE, borderRadius:'16px', border:`1px solid ${BORDER}` }}>
            <p style={{ fontSize:'2rem', margin:'0 0 8px' }}>💰</p>
            <p style={{ fontSize:'0.875rem', color:MUTED, margin:0 }}>No income data yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
