import { useNavigate } from 'react-router-dom';
import { MessageSquare, ChevronRight } from 'lucide-react';

const BG='#0f0f0f';const SURFACE='#1a1a1a';const S2='#222';const BORDER='rgba(255,255,255,0.08)';const TEXT='#fff';const MUTED='#606060';const ORANGE='#FF6B2B';const YELLOW='#FFD600';const GREEN='#4CAF50';

const TRAINER = {
  name: 'Andre Viana',
  title: 'Personal Trainer & Wellness Coach',
  location: 'Newcastle, UK',
  yearsExp: 6,
  clients: 24,
  classesPerWeek: 8,
  bio: 'Certified personal trainer specialising in functional fitness, mobility and mindfulness. I combine strength training with movement quality to help clients build bodies that perform and last. Every programme is built around YOU  your goals, your lifestyle, your pace.',
  specialities: [
    { label: 'Strength Training', emoji: '', color: ORANGE },
    { label: 'Mobility & Flexibility', emoji: '', color: GREEN },
    { label: 'Pilates', emoji: '', color: '#60a5fa' },
    { label: 'Dance Cardio', emoji: '', color: '#f472b6' },
    { label: 'Meditation', emoji: '', color: '#a78bfa' },
    { label: 'Vision Support', emoji: '', color: YELLOW },
  ],
  classes: [
    { name: 'Morning Strength', day: 'MON', time: '07:00', color: ORANGE },
    { name: 'Pilates Flow',     day: 'TUE', time: '18:00', color: '#60a5fa' },
    { name: 'Yoga Stretch',     day: 'WED', time: '09:00', color: GREEN },
    { name: 'Dance Cardio',     day: 'THU', time: '19:00', color: '#f472b6' },
    { name: 'Core Work',        day: 'FRI', time: '17:00', color: ORANGE },
    { name: 'Weekend Mobility', day: 'SAT', time: '10:00', color: '#a78bfa' },
    { name: 'Meditation',       day: 'SUN', time: '18:00', color: '#a78bfa' },
    { name: 'Evening Strength', day: 'WED', time: '20:00', color: ORANGE },
  ],
};

export default function TrainerProfile() {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor:BG, minHeight:'100vh', paddingBottom:'6rem', fontFamily:"'DM Sans',system-ui" }}>
      <div style={{ maxWidth:'680px', margin:'0 auto', padding:'2rem 1.25rem' }}>

        {/* Header */}
        <div style={{ marginBottom:'2rem' }}>
          <p style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.2em', color:ORANGE, textTransform:'uppercase', margin:'0 0 6px' }}>Your Coach</p>
          <h1 style={{ fontSize:'2.5rem', fontWeight:800, color:TEXT, letterSpacing:'-0.05em', margin:0, lineHeight:1 }}>Trainer Profile</h1>
        </div>

        {/* Hero card */}
        <div style={{ borderRadius:'20px', overflow:'hidden', marginBottom:'1.25rem', background:'linear-gradient(135deg,#1a1a0a,#0a1a1a)', border:'1px solid rgba(255,107,43,0.2)', position:'relative' }}>
          <div style={{ height:'3px', background:`linear-gradient(90deg,${ORANGE},${YELLOW},${GREEN})` }}/>
          <div style={{ padding:'1.75rem', display:'flex', alignItems:'flex-start', gap:'1.25rem' }}>
            {/* Avatar */}
            <div style={{ width:'72px', height:'72px', borderRadius:'50%', background:`linear-gradient(135deg,${ORANGE},${YELLOW})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem', fontWeight:800, color:'#000', flexShrink:0, boxShadow:`0 8px 24px ${ORANGE}44` }}>AV</div>
            <div style={{ flex:1, minWidth:0 }}>
              <h2 style={{ fontFamily:"'DM Sans',system-ui", fontSize:'1.4rem', fontWeight:800, color:TEXT, letterSpacing:'-0.03em', margin:'0 0 3px' }}>{TRAINER.name}</h2>
              <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.82rem', color:ORANGE, fontWeight:700, margin:'0 0 2px' }}>{TRAINER.title}</p>
              <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.75rem', color:MUTED, margin:0 }}> {TRAINER.location}</p>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
            {[
              { v:TRAINER.yearsExp, l:'Years Exp', c:ORANGE },
              { v:TRAINER.clients,  l:'Clients',   c:GREEN },
              { v:TRAINER.classesPerWeek, l:'Classes/wk', c:YELLOW },
            ].map((s,i)=>(
              <div key={i} style={{ padding:'1rem', textAlign:'center', borderRight:i<2?'1px solid rgba(255,255,255,0.06)':'none' }}>
                <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'1.8rem', fontWeight:800, color:s.c, margin:'0 0 2px', letterSpacing:'-0.04em' }}>{s.v}</p>
                <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.1em', color:MUTED, textTransform:'uppercase', margin:0 }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bio */}
        <div style={{ background:SURFACE, borderRadius:'16px', border:`1px solid ${BORDER}`, padding:'1.25rem', marginBottom:'1.25rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px' }}>
            <div style={{ width:'3px', height:'14px', borderRadius:'2px', background:`linear-gradient(180deg,${ORANGE},${ORANGE}88)` }}/>
            <p style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.18em', color:ORANGE, textTransform:'uppercase', margin:0 }}>About</p>
          </div>
          <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.875rem', color:'#c0c0c0', margin:0, lineHeight:1.75 }}>{TRAINER.bio}</p>
        </div>

        {/* Specialities */}
        <div style={{ marginBottom:'1.25rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px' }}>
            <div style={{ width:'3px', height:'14px', borderRadius:'2px', background:`linear-gradient(180deg,${GREEN},${GREEN}88)` }}/>
            <p style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.18em', color:GREEN, textTransform:'uppercase', margin:0 }}>Specialities</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
            {TRAINER.specialities.map((s,i)=>(
              <div key={i} style={{ background:`${s.color}10`, border:`1px solid ${s.color}25`, borderRadius:'12px', padding:'0.875rem 1rem', display:'flex', alignItems:'center', gap:'10px' }}>
                <span style={{ fontSize:'1.2rem' }}>{s.emoji}</span>
                <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.82rem', fontWeight:700, color:TEXT, margin:0 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Classes */}
        <div style={{ marginBottom:'1.25rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px' }}>
            <div style={{ width:'3px', height:'14px', borderRadius:'2px', background:`linear-gradient(180deg,${YELLOW},${YELLOW}88)` }}/>
            <p style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.18em', color:YELLOW, textTransform:'uppercase', margin:0 }}>Weekly Classes</p>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
            {TRAINER.classes.map((c,i)=>(
              <div key={i} style={{ background:SURFACE, border:`1px solid ${BORDER}`, borderLeft:`3px solid ${c.color}`, borderRadius:'10px', padding:'0.875rem 1rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                  <span style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.62rem', fontWeight:800, color:c.color, background:`${c.color}15`, border:`1px solid ${c.color}25`, borderRadius:'6px', padding:'3px 8px', flexShrink:0 }}>{c.day}</span>
                  <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.875rem', fontWeight:600, color:TEXT, margin:0 }}>{c.name}</p>
                </div>
                <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.82rem', color:MUTED, margin:0, fontWeight:600 }}>{c.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button onClick={()=>navigate('/client/messages')} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', padding:'1rem', background:`linear-gradient(135deg,${ORANGE},${YELLOW})`, border:'none', borderRadius:'14px', color:'#000', fontFamily:"'DM Sans',system-ui", fontSize:'0.95rem', fontWeight:800, cursor:'pointer', boxShadow:`0 6px 24px ${ORANGE}44`, minHeight:'auto', letterSpacing:'0.01em' }}>
          <MessageSquare size={18}/>
          Message Your PT
          <ChevronRight size={16}/>
        </button>

      </div>
    </div>
  );
}

