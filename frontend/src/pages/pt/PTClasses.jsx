import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const BG='#0f0f0f';const SURFACE='#1a1a1a';const S2='#222';const BORDER='rgba(255,255,255,0.08)';const TEXT='#fff';const MUTED='#606060';const ORANGE='#FF6B2B';const YELLOW='#FFD600';const GREEN='#4CAF50';const BLUE='#60a5fa';const PURPLE='#a78bfa';

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const TAX_RATE = 0.20;

function fmt(v) { return `£${Number(v||0).toLocaleString('en-GB',{minimumFractionDigits:0})}`; }

function SectionLabel({ children, color=ORANGE }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'0.875rem' }}>
      <div style={{ width:'3px', height:'14px', borderRadius:'2px', background:`linear-gradient(180deg,${color},${color}88)` }}/>
      <p style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.2em', color, textTransform:'uppercase', margin:0 }}>{children}</p>
    </div>
  );
}

export default function PTClasses() {
  const [classes, setClasses] = useState([]);
  const [income, setIncome] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddIncome, setShowAddIncome] = useState(null); // class id
  const [showAddOneOff, setShowAddOneOff] = useState(false);
  const [incomeForm, setIncomeForm] = useState({ amount:'', date: new Date().toISOString().split('T')[0], attendees:1, notes:'' });
  const [oneOffForm, setOneOffForm] = useState({ name:'', amount:'', date: new Date().toISOString().split('T')[0], attendees:1 });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [classRes, incomeRes] = await Promise.all([
        api.get('/pt/classes'),
        api.get('/pt/income'),
      ]);
      setClasses(classRes.data || []);
      setIncome(incomeRes.data?.classIncome || []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleLogIncome = async (classId) => {
    setSaving(true);
    try {
      await api.post(`/pt/classes/${classId}/sessions`, {
        date: incomeForm.date,
        amount_earned: Number(incomeForm.amount),
        attendees: Number(incomeForm.attendees),
        notes: incomeForm.notes,
      });
      toast.success('Income logged!');
      setShowAddIncome(null);
      setIncomeForm({ amount:'', date: new Date().toISOString().split('T')[0], attendees:1, notes:'' });
      loadData();
    } catch { toast.error('Failed to log income'); }
    finally { setSaving(false); }
  };

  const handleAddOneOff = async () => {
    setSaving(true);
    try {
      await api.post('/pt/classes/one-off', {
        name: oneOffForm.name,
        date: oneOffForm.date,
        amount_earned: Number(oneOffForm.amount),
        attendees: Number(oneOffForm.attendees),
      });
      toast.success('One-off class added!');
      setShowAddOneOff(false);
      setOneOffForm({ name:'', amount:'', date: new Date().toISOString().split('T')[0], attendees:1 });
      loadData();
    } catch { toast.error('Failed to add class'); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh', background:BG }}>
      <div style={{ width:'24px', height:'24px', border:`2px solid ${ORANGE}`, borderTop:'2px solid transparent', borderRadius:'50%', animation:'spin 1s linear infinite' }}/>
    </div>
  );

  // Calculate totals
  const weeklyGross = classes.reduce((sum, c) => sum + (c.flat_fee || 0), 0);
  const monthlyGross = weeklyGross * 4.33;
  const totalEarned = income.reduce((sum, c) => sum + (c.total_earned || 0), 0);
  const totalTax = Math.round(totalEarned * TAX_RATE);
  const totalNet = totalEarned - totalTax;
  const weeklyTax = Math.round(weeklyGross * TAX_RATE);
  const monthlyTax = Math.round(monthlyGross * TAX_RATE);

  const inputStyle = {
    width:'100%', padding:'0.75rem 1rem', background:S2, border:`1px solid ${BORDER}`,
    borderRadius:'10px', color:TEXT, fontFamily:"'DM Sans',system-ui", fontSize:'0.875rem',
    outline:'none', boxSizing:'border-box',
  };

  return (
    <div style={{ backgroundColor:BG, minHeight:'100vh', padding:'1.5rem 1.25rem', paddingBottom:'6rem', fontFamily:"'DM Sans',system-ui" }}>
      <div style={{ maxWidth:'800px', margin:'0 auto' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'2rem' }}>
          <div>
            <p style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.2em', color:ORANGE, textTransform:'uppercase', margin:'0 0 6px' }}>PT Dashboard</p>
            <h1 style={{ fontSize:'2.5rem', fontWeight:800, color:TEXT, letterSpacing:'-0.05em', margin:0, lineHeight:1 }}>Classes</h1>
          </div>
          <button onClick={()=>setShowAddOneOff(true)} style={{ padding:'10px 18px', borderRadius:'12px', border:'none', background:`linear-gradient(135deg,${ORANGE},${YELLOW})`, color:'#000', fontFamily:"'DM Sans',system-ui", fontSize:'0.82rem', fontWeight:800, cursor:'pointer', minHeight:'auto', whiteSpace:'nowrap' }}>
            + One-off Class
          </button>
        </div>

        {/* Income summary cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px', marginBottom:'1.75rem' }}>
          {/* Weekly */}
          <div style={{ background:`linear-gradient(135deg,${GREEN}12,${SURFACE})`, borderRadius:'14px', padding:'1.1rem', border:`1px solid ${GREEN}25` }}>
            <p style={{ fontSize:'0.58rem', fontWeight:700, letterSpacing:'0.12em', color:MUTED, textTransform:'uppercase', margin:'0 0 8px' }}>Weekly</p>
            <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'1.6rem', fontWeight:800, color:GREEN, margin:'0 0 4px', letterSpacing:'-0.04em', lineHeight:1 }}>{fmt(weeklyGross)}</p>
            <p style={{ fontSize:'0.68rem', color:MUTED, margin:0 }}>Tax: {fmt(weeklyTax)}</p>
            <p style={{ fontSize:'0.68rem', color:GREEN, margin:'2px 0 0', fontWeight:700 }}>Net: {fmt(weeklyGross - weeklyTax)}</p>
          </div>
          {/* Monthly */}
          <div style={{ background:`linear-gradient(135deg,${BLUE}12,${SURFACE})`, borderRadius:'14px', padding:'1.1rem', border:`1px solid ${BLUE}25` }}>
            <p style={{ fontSize:'0.58rem', fontWeight:700, letterSpacing:'0.12em', color:MUTED, textTransform:'uppercase', margin:'0 0 8px' }}>Monthly (est.)</p>
            <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'1.6rem', fontWeight:800, color:BLUE, margin:'0 0 4px', letterSpacing:'-0.04em', lineHeight:1 }}>{fmt(Math.round(monthlyGross))}</p>
            <p style={{ fontSize:'0.68rem', color:MUTED, margin:0 }}>Tax: {fmt(monthlyTax)}</p>
            <p style={{ fontSize:'0.68rem', color:BLUE, margin:'2px 0 0', fontWeight:700 }}>Net: {fmt(Math.round(monthlyGross - monthlyTax))}</p>
          </div>
          {/* Total earned */}
          <div style={{ background:`linear-gradient(135deg,${YELLOW}12,${SURFACE})`, borderRadius:'14px', padding:'1.1rem', border:`1px solid ${YELLOW}25` }}>
            <p style={{ fontSize:'0.58rem', fontWeight:700, letterSpacing:'0.12em', color:MUTED, textTransform:'uppercase', margin:'0 0 8px' }}>Total Logged</p>
            <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'1.6rem', fontWeight:800, color:YELLOW, margin:'0 0 4px', letterSpacing:'-0.04em', lineHeight:1 }}>{fmt(totalEarned)}</p>
            <p style={{ fontSize:'0.68rem', color:MUTED, margin:0 }}>Tax: {fmt(totalTax)}</p>
            <p style={{ fontSize:'0.68rem', color:YELLOW, margin:'2px 0 0', fontWeight:700 }}>Net: {fmt(totalNet)}</p>
          </div>
        </div>

        {/* Weekly Classes */}
        <div style={{ marginBottom:'1.75rem' }}>
          <SectionLabel color={PURPLE}>Weekly Schedule</SectionLabel>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {classes.map(c => {
              const classIncome = income.find(i => i.id === c.id);
              const earned = classIncome?.total_earned || 0;
              const sessions = classIncome?.sessions_run || 0;
              return (
                <div key={c.id} style={{ background:SURFACE, borderRadius:'14px', border:`1px solid ${BORDER}`, overflow:'hidden' }}>
                  <div style={{ padding:'0.875rem 1rem', display:'flex', alignItems:'center', gap:'12px' }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'3px' }}>
                        <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.95rem', fontWeight:700, color:TEXT, margin:0 }}>{c.name}</p>
                        <span style={{ fontSize:'0.6rem', fontWeight:700, color:PURPLE, background:`${PURPLE}15`, border:`1px solid ${PURPLE}25`, borderRadius:'20px', padding:'1px 8px' }}>
                          {DAYS[c.day_of_week]} · {c.class_time}
                        </span>
                      </div>
                      <p style={{ fontSize:'0.72rem', color:MUTED, margin:0 }}>{sessions} sessions · {fmt(earned)} earned</p>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'1rem', fontWeight:800, color:GREEN, margin:'0 0 2px' }}>{fmt(c.flat_fee||0)}</p>
                      <p style={{ fontSize:'0.6rem', color:MUTED, margin:0 }}>per session</p>
                    </div>
                    <button onClick={()=>setShowAddIncome(c.id)} style={{ padding:'7px 14px', borderRadius:'8px', border:`1px solid rgba(255,107,43,0.3)`, background:'rgba(255,107,43,0.08)', color:ORANGE, fontFamily:"'DM Sans',system-ui", fontSize:'0.75rem', fontWeight:700, cursor:'pointer', minHeight:'auto', flexShrink:0 }}>
                      + Log
                    </button>
                  </div>

                  {/* Log income form */}
                  {showAddIncome === c.id && (
                    <div style={{ borderTop:`1px solid ${BORDER}`, padding:'0.875rem 1rem', background:S2, display:'flex', flexDirection:'column', gap:'8px' }}>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px' }}>
                        <div>
                          <p style={{ fontSize:'0.62rem', color:MUTED, margin:'0 0 4px', fontWeight:600 }}>Date</p>
                          <input type="date" value={incomeForm.date} onChange={e=>setIncomeForm({...incomeForm,date:e.target.value})} style={inputStyle}/>
                        </div>
                        <div>
                          <p style={{ fontSize:'0.62rem', color:MUTED, margin:'0 0 4px', fontWeight:600 }}>Amount (£)</p>
                          <input type="number" value={incomeForm.amount} onChange={e=>setIncomeForm({...incomeForm,amount:e.target.value})} placeholder={c.flat_fee||'0'} style={inputStyle}/>
                        </div>
                        <div>
                          <p style={{ fontSize:'0.62rem', color:MUTED, margin:'0 0 4px', fontWeight:600 }}>Attendees</p>
                          <input type="number" value={incomeForm.attendees} onChange={e=>setIncomeForm({...incomeForm,attendees:e.target.value})} min="1" style={inputStyle}/>
                        </div>
                      </div>
                      {incomeForm.amount && (
                        <p style={{ fontSize:'0.75rem', color:GREEN, margin:0, fontWeight:600 }}>
                          Net: {fmt(Math.round(Number(incomeForm.amount) * 0.8))} after 20% tax
                        </p>
                      )}
                      <div style={{ display:'flex', gap:'8px' }}>
                        <button onClick={()=>setShowAddIncome(null)} style={{ flex:1, padding:'8px', background:'transparent', border:`1px solid ${BORDER}`, borderRadius:'8px', color:MUTED, fontFamily:"'DM Sans',system-ui", fontSize:'0.78rem', cursor:'pointer', minHeight:'auto' }}>Cancel</button>
                        <button onClick={()=>handleLogIncome(c.id)} disabled={!incomeForm.amount||saving} style={{ flex:2, padding:'8px', background:`linear-gradient(135deg,${ORANGE},${YELLOW})`, border:'none', borderRadius:'8px', color:'#000', fontFamily:"'DM Sans',system-ui", fontSize:'0.78rem', fontWeight:800, cursor:'pointer', minHeight:'auto' }}>
                          {saving?'Saving...':'Log Income'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* One-off class modal */}
        {showAddOneOff && (
          <div onClick={()=>setShowAddOneOff(false)} style={{ position:'fixed', inset:0, zIndex:50, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem', backdropFilter:'blur(4px)' }}>
            <div onClick={e=>e.stopPropagation()} style={{ background:'#111', borderRadius:'20px', border:`1px solid rgba(255,107,43,0.2)`, padding:'1.75rem', maxWidth:'400px', width:'100%' }}>
              <h3 style={{ fontFamily:"'DM Sans',system-ui", fontSize:'1.2rem', fontWeight:800, color:TEXT, margin:'0 0 4px' }}>One-off Class</h3>
              <p style={{ fontSize:'0.82rem', color:MUTED, margin:'0 0 1.25rem' }}>Add a class you covered or a special session</p>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                <div>
                  <p style={{ fontSize:'0.72rem', fontWeight:700, color:MUTED, margin:'0 0 6px', textTransform:'uppercase', letterSpacing:'0.08em' }}>Class Name</p>
                  <input value={oneOffForm.name} onChange={e=>setOneOffForm({...oneOffForm,name:e.target.value})} placeholder="e.g. Cover Pilates, Corporate Yoga..." style={inputStyle}/>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                  <div>
                    <p style={{ fontSize:'0.72rem', fontWeight:700, color:MUTED, margin:'0 0 6px', textTransform:'uppercase', letterSpacing:'0.08em' }}>Date</p>
                    <input type="date" value={oneOffForm.date} onChange={e=>setOneOffForm({...oneOffForm,date:e.target.value})} style={inputStyle}/>
                  </div>
                  <div>
                    <p style={{ fontSize:'0.72rem', fontWeight:700, color:MUTED, margin:'0 0 6px', textTransform:'uppercase', letterSpacing:'0.08em' }}>Amount (£)</p>
                    <input type="number" value={oneOffForm.amount} onChange={e=>setOneOffForm({...oneOffForm,amount:e.target.value})} placeholder="0" style={inputStyle}/>
                  </div>
                </div>
                {oneOffForm.amount && (
                  <div style={{ background:'rgba(76,175,80,0.08)', border:'1px solid rgba(76,175,80,0.2)', borderRadius:'10px', padding:'10px 14px', display:'flex', justifyContent:'space-between' }}>
                    <span style={{ fontSize:'0.82rem', color:MUTED }}>Net after 20% tax:</span>
                    <span style={{ fontSize:'0.82rem', fontWeight:800, color:GREEN }}>{fmt(Math.round(Number(oneOffForm.amount)*0.8))}</span>
                  </div>
                )}
              </div>
              <div style={{ display:'flex', gap:'8px', marginTop:'1.25rem' }}>
                <button onClick={()=>setShowAddOneOff(false)} style={{ flex:1, padding:'0.875rem', background:S2, border:`1px solid ${BORDER}`, borderRadius:'12px', color:MUTED, fontFamily:"'DM Sans',system-ui", fontSize:'0.875rem', fontWeight:600, cursor:'pointer', minHeight:'auto' }}>Cancel</button>
                <button onClick={handleAddOneOff} disabled={!oneOffForm.name||!oneOffForm.amount||saving} style={{ flex:2, padding:'0.875rem', background:`linear-gradient(135deg,${ORANGE},${YELLOW})`, border:'none', borderRadius:'12px', color:'#000', fontFamily:"'DM Sans',system-ui", fontSize:'0.875rem', fontWeight:800, cursor:'pointer', minHeight:'auto' }}>
                  {saving?'Adding...':'Add Class'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
