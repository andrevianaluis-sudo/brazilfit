import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Zap, Star, Flame, Sun, Calendar, Trophy, CheckCircle, X } from 'lucide-react';
import api from '../../utils/api';

const BG='#0f0f0f';const SURFACE='#1a1a1a';const S2='#222';const BORDER='rgba(255,255,255,0.08)';const TEXT='#fff';const MUTED='#606060';const ORANGE='#FF6B2B';const YELLOW='#FFD600';const GREEN='#4CAF50';

const BADGE_DEFS = [
  { id:'first_session',    name:'First Session',      desc:'Complete your first PT session',           icon:Zap,         color:GREEN,  req:'sessions_used >= 1' },
  { id:'sessions_5',       name:'5 Sessions',         desc:'Complete 5 PT sessions',                   icon:Zap,         color:GREEN,  req:'sessions_used >= 5' },
  { id:'sessions_10',      name:'10 Sessions',        desc:'Complete a full block of 10 sessions',     icon:Star,        color:YELLOW, req:'sessions_used >= 10' },
  { id:'sessions_20',      name:'20 Sessions',        desc:'Complete 20 PT sessions',                  icon:Star,        color:ORANGE, req:'sessions_used >= 20' },
  { id:'checkin_1',        name:'First Check-in',     desc:'Submit your first weekly check-in',        icon:CheckCircle, color:GREEN,  req:'checkins >= 1' },
  { id:'checkin_4',        name:'Monthly Consistent', desc:'4 weeks of check-ins in a row',            icon:CheckCircle, color:YELLOW, req:'checkin_streak >= 4' },
  { id:'checkin_8',        name:'Check-in Champion',  desc:'8 weekly check-ins completed',             icon:Trophy,      color:ORANGE, req:'checkins >= 8' },
  { id:'streak_4',         name:'4 Week Streak',      desc:'4 consecutive weekly check-ins',           icon:Flame,       color:GREEN,  req:'checkin_streak >= 4' },
  { id:'streak_8',         name:'8 Week Streak',      desc:'8 consecutive weekly check-ins',           icon:Flame,       color:YELLOW, req:'checkin_streak >= 8' },
  { id:'streak_12',        name:'12 Week Streak',     desc:'3 months of weekly check-ins',             icon:Flame,       color:ORANGE, req:'checkin_streak >= 12' },
  { id:'block_complete',   name:'Block Complete',     desc:'Complete a full 10-session block',         icon:Trophy,      color:YELLOW, req:'sessions_used >= 10' },
  { id:'early_bird',       name:'Early Bird',         desc:'Complete 5 sessions before 9 AM',          icon:Sun,         color:YELLOW, req:'early_sessions >= 5' },
];

export default function ClientBadges() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [checkinCount, setCheckinCount] = useState(0);
  const [checkinStreak, setCheckinStreak] = useState(0);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.clientId) return;
    Promise.all([
      api.get(`/sessions/client/${user.clientId}`).catch(() => null),
      api.get('/checkins/streak').catch(() => null),
      api.get('/checkins/history').catch(() => null),
    ]).then(([sessRes, streakRes, histRes]) => {
      setStats({ sessions_used: sessRes?.data?.sessionsUsed || 0 });
      setCheckinStreak(streakRes?.data?.streak || 0);
      setCheckinCount(Array.isArray(histRes?.data) ? histRes.data.length : 0);
    }).finally(() => setLoading(false));
  }, [user]);

  const getProgress = (def) => {
    if (!stats) return { earned: false, pct: 0, progress: 0, total: 1 };
    const s = stats.sessions_used || 0;
    const streak = checkinStreak;
    const checkins = checkinCount;
    const map = {
      first_session:  { earned: s >= 1,      progress: Math.min(s, 1),      total: 1  },
      sessions_5:     { earned: s >= 5,       progress: Math.min(s, 5),      total: 5  },
      sessions_10:    { earned: s >= 10,      progress: Math.min(s, 10),     total: 10 },
      sessions_20:    { earned: s >= 20,      progress: Math.min(s, 20),     total: 20 },
      checkin_1:      { earned: checkins >= 1,    progress: Math.min(checkins, 1),      total: 1  },
      checkin_4:      { earned: streak >= 4,      progress: Math.min(streak, 4),        total: 4  },
      checkin_8:      { earned: checkins >= 8,    progress: Math.min(checkins, 8),      total: 8  },
      streak_4:       { earned: streak >= 4,      progress: Math.min(streak, 4),        total: 4  },
      streak_8:       { earned: streak >= 8,      progress: Math.min(streak, 8),        total: 8  },
      streak_12:      { earned: streak >= 12,     progress: Math.min(streak, 12),       total: 12 },
      block_complete: { earned: s >= 10,      progress: Math.min(s, 10),     total: 10 },
      early_bird:     { earned: false,        progress: 0,                   total: 5  },
    };
    const p = map[def.id] || { earned: false, progress: 0, total: 1 };
    return { ...p, pct: Math.round((p.progress / p.total) * 100) };
  };

  const badges = BADGE_DEFS.map(def => ({ ...def, ...getProgress(def) }));
  const earned = badges.filter(b => b.earned);
  const locked = badges.filter(b => !b.earned);

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh', background:BG }}>
      <div style={{ width:'24px', height:'24px', border:`2px solid ${ORANGE}`, borderTop:'2px solid transparent', borderRadius:'50%', animation:'spin 1s linear infinite' }}/>
    </div>
  );

  return (
    <div style={{ backgroundColor:BG, minHeight:'100vh', paddingBottom:'6rem', fontFamily:"'DM Sans',system-ui" }}>
      <div style={{ maxWidth:'680px', margin:'0 auto', padding:'2rem 1.25rem' }}>

        {/* Header */}
        <div style={{ marginBottom:'2rem' }}>
          <p style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.2em', color:YELLOW, textTransform:'uppercase', margin:'0 0 6px' }}>Achievements</p>
          <h1 style={{ fontSize:'2.5rem', fontWeight:800, color:TEXT, letterSpacing:'-0.05em', margin:'0 0 4px', lineHeight:1 }}>My Badges</h1>
          <p style={{ fontSize:'0.82rem', color:MUTED, margin:0 }}>{earned.length} of {badges.length} badges earned</p>
        </div>

        {/* Progress bar */}
        <div style={{ background:SURFACE, borderRadius:'16px', border:`1px solid ${BORDER}`, padding:'1.25rem', marginBottom:'1.5rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
            <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.82rem', fontWeight:600, color:TEXT, margin:0 }}>Overall Progress</p>
            <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'1.5rem', fontWeight:800, color:YELLOW, margin:0, letterSpacing:'-0.03em' }}>{Math.round((earned.length/badges.length)*100)}%</p>
          </div>
          <div style={{ width:'100%', height:'6px', background:S2, borderRadius:'3px', overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${(earned.length/badges.length)*100}%`, background:`linear-gradient(90deg,${GREEN},${YELLOW})`, borderRadius:'3px', transition:'width 0.8s' }}/>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px', marginTop:'1rem' }}>
            {[{v:stats?.sessions_used||0,l:'Sessions',c:GREEN},{v:checkinStreak,l:'Week Streak',c:ORANGE},{v:checkinCount,l:'Check-ins',c:YELLOW}].map((s,i)=>(
              <div key={i} style={{ textAlign:'center', background:S2, borderRadius:'10px', padding:'10px 6px', border:`1px solid ${BORDER}` }}>
                <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'1.4rem', fontWeight:800, color:s.c, margin:'0 0 2px', letterSpacing:'-0.03em' }}>{s.v}</p>
                <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.58rem', fontWeight:700, letterSpacing:'0.1em', color:MUTED, textTransform:'uppercase', margin:0 }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Earned */}
        {earned.length > 0 && (
          <div style={{ marginBottom:'1.5rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px' }}>
              <div style={{ width:'3px', height:'14px', borderRadius:'2px', background:`linear-gradient(180deg,${YELLOW},${YELLOW}88)` }}/>
              <p style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.18em', color:YELLOW, textTransform:'uppercase', margin:0 }}>🏆 Earned ({earned.length})</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px' }}>
              {earned.map(b => {
                const Icon = b.icon;
                return (
                  <button key={b.id} onClick={()=>setSelected(b)} style={{
                    padding:'1rem 0.75rem', borderRadius:'14px', cursor:'pointer', minHeight:'auto',
                    background:`linear-gradient(135deg,${b.color}20,${SURFACE})`,
                    border:`1px solid ${b.color}40`,
                    display:'flex', flexDirection:'column', alignItems:'center', gap:'8px',
                    boxShadow:`0 4px 16px ${b.color}20`, transition:'transform 0.15s',
                  }}
                    onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
                    onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
                    <div style={{ width:'48px', height:'48px', borderRadius:'50%', background:`linear-gradient(135deg,${b.color},${b.color}bb)`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 4px 12px ${b.color}44` }}>
                      <Icon size={22} color="#000"/>
                    </div>
                    <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.72rem', fontWeight:700, color:TEXT, textAlign:'center', margin:0, lineHeight:1.3 }}>{b.name}</p>
                    <span style={{ fontSize:'0.6rem', fontWeight:700, color:b.color, background:`${b.color}15`, border:`1px solid ${b.color}30`, borderRadius:'20px', padding:'2px 8px' }}>Earned ✓</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Locked */}
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px' }}>
            <div style={{ width:'3px', height:'14px', borderRadius:'2px', background:`linear-gradient(180deg,${MUTED},${MUTED}88)` }}/>
            <p style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.18em', color:MUTED, textTransform:'uppercase', margin:0 }}>Locked ({locked.length})</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px' }}>
            {locked.map(b => {
              const Icon = b.icon;
              return (
                <button key={b.id} onClick={()=>setSelected(b)} style={{
                  padding:'1rem 0.75rem', borderRadius:'14px', cursor:'pointer', minHeight:'auto',
                  background:SURFACE, border:`1px solid ${BORDER}`,
                  display:'flex', flexDirection:'column', alignItems:'center', gap:'8px',
                  opacity:0.7, transition:'opacity 0.15s',
                }}
                  onMouseEnter={e=>e.currentTarget.style.opacity='1'}
                  onMouseLeave={e=>e.currentTarget.style.opacity='0.7'}>
                  <div style={{ width:'48px', height:'48px', borderRadius:'50%', background:S2, border:`1px solid ${BORDER}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Icon size={22} color={MUTED}/>
                  </div>
                  <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.72rem', fontWeight:600, color:MUTED, textAlign:'center', margin:0, lineHeight:1.3 }}>{b.name}</p>
                  {b.total > 1 && (
                    <div style={{ width:'100%' }}>
                      <div style={{ width:'100%', height:'3px', background:S2, borderRadius:'2px', overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${b.pct}%`, background:b.color, borderRadius:'2px' }}/>
                      </div>
                      <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.58rem', color:MUTED, textAlign:'center', margin:'3px 0 0' }}>{b.progress}/{b.total}</p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal */}
      {selected && (
        <div onClick={()=>setSelected(null)} style={{ position:'fixed', inset:0, zIndex:50, background:'rgba(0,0,0,0.9)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem', backdropFilter:'blur(4px)' }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:'#111', borderRadius:'20px', border:`1px solid ${selected.earned?selected.color+'40':BORDER}`, padding:'2rem', maxWidth:'320px', width:'100%', textAlign:'center' }}>
            <button onClick={()=>setSelected(null)} style={{ position:'absolute', top:'16px', right:'16px', background:'rgba(255,255,255,0.08)', border:'none', borderRadius:'50%', width:'32px', height:'32px', cursor:'pointer', color:TEXT, display:'flex', alignItems:'center', justifyContent:'center', minHeight:'auto', minWidth:'auto' }}>
              <X size={15}/>
            </button>
            <div style={{ width:'72px', height:'72px', borderRadius:'50%', background:selected.earned?`linear-gradient(135deg,${selected.color},${selected.color}bb)`:S2, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.25rem', boxShadow:selected.earned?`0 8px 24px ${selected.color}44`:'none' }}>
              <selected.icon size={32} color={selected.earned?'#000':MUTED}/>
            </div>
            <h3 style={{ fontFamily:"'DM Sans',system-ui", fontSize:'1.3rem', fontWeight:800, color:TEXT, letterSpacing:'-0.02em', margin:'0 0 6px' }}>{selected.name}</h3>
            <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.82rem', color:MUTED, margin:'0 0 1.25rem', lineHeight:1.6 }}>{selected.desc}</p>
            {selected.earned
              ? <span style={{ fontSize:'0.75rem', fontWeight:700, color:selected.color, background:`${selected.color}15`, border:`1px solid ${selected.color}30`, borderRadius:'20px', padding:'4px 16px' }}>✓ Earned</span>
              : selected.total > 1
              ? <div>
                  <div style={{ width:'100%', height:'6px', background:S2, borderRadius:'3px', overflow:'hidden', marginBottom:'6px' }}>
                    <div style={{ height:'100%', width:`${selected.pct}%`, background:selected.color, borderRadius:'3px', transition:'width 0.5s' }}/>
                  </div>
                  <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.78rem', color:MUTED, margin:0 }}>{selected.progress} of {selected.total} — {selected.pct}% there</p>
                </div>
              : <span style={{ fontSize:'0.75rem', fontWeight:700, color:MUTED }}>🔒 Not yet earned</span>
            }
          </div>
        </div>
      )}
    </div>
  );
}
