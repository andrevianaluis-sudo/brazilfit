import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, Dumbbell, TrendingUp, Heart, MessageSquare, ClipboardList, Activity, Zap } from 'lucide-react';
import api from '../../utils/api';

const QUOTES = [
  { text: 'Progress is progress no matter how small.', author: 'Unknown' },
  { text: 'Train hard, recover harder.', author: 'Unknown' },
  { text: 'The body achieves what the mind believes.', author: 'Unknown' },
  { text: 'Showing up is the hardest part. You already won.', author: 'Unknown' },
  { text: 'Sweat is just fat crying.', author: 'Unknown' },
  { text: 'Don\'t wish for it. Work for it.', author: 'Unknown' },
  { text: 'Your only competition is who you were yesterday.', author: 'Unknown' },
  { text: 'Rest is part of the training.', author: 'Unknown' },
  { text: 'Consistency over intensity. Every single time.', author: 'Unknown' },
  { text: 'Fall in love with the process and the results will come.', author: 'Unknown' },
  { text: 'One workout at a time. One day at a time.', author: 'Unknown' },
  { text: 'Strong is built, not born.', author: 'Unknown' },
  { text: 'The pain you feel today is the strength you feel tomorrow.', author: 'Unknown' },
  { text: 'Every rep counts. Even the ugly ones.', author: 'Unknown' },
];

export default function ClientHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState(null);
  const [streak, setStreak] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quote] = useState(QUOTES[Math.floor((Date.now() - new Date(new Date().getFullYear(),0,0)) / 86400000) % QUOTES.length]);

  useEffect(() => {
    if (!user?.clientId) return;
    Promise.all([
      api.get(`/sessions/client/${user.clientId}`).catch(() => null),
      api.get(`/habits/${user.clientId}`).catch(() => null),
      api.get('/messages/unread-count').catch(() => null),
    ]).then(([sessRes, habitsRes, msgRes]) => {
      if (sessRes) setSessions(sessRes.data);
      if (habitsRes) setStreak(habitsRes.data.streak || 0);
      if (msgRes) setUnreadMessages(msgRes.data.unreadCount || 0);
    }).finally(() => setLoading(false));
  }, [user]);

  if (loading) return (
    <div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'100vh',background:'#111'}}>
      <div style={{width:'20px',height:'20px',border:'2px solid #FF6B2B',borderTop:'2px solid transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
    </div>
  );

  const rem = sessions?.sessionsRemaining || 0;
  const used = sessions?.sessionsUsed || 0;
  const total = used + rem;
  const pct = total > 0 ? (used / total) * 100 : 0;
  const sc = rem <= 2 ? '#ef4444' : rem <= 5 ? '#FF6B2B' : '#4CAF50';
  const hr = new Date().getHours();
  const g = hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
  const name = user?.name?.split(' ')[0] || 'Athlete';
  const today = new Date().toLocaleDateString('en-GB', {weekday:'long',day:'numeric',month:'long'});
  const C = {background:'#2a2a2a',borderRadius:'14px',border:'1px solid rgba(255,255,255,0.15)',padding:'1rem 1.25rem'};

  const LINKS = [
    { label: 'My Sessions', sub: 'Book & manage',     to: '/client/sessions',  ic: Calendar,      color: '#FF6B2B' },
    { label: 'Progress',    sub: 'Track results',     to: '/client/progress',  ic: TrendingUp,    color: '#4CAF50' },
    { label: 'Wellness',    sub: 'Mind & recovery',   to: '/client/wellness',  ic: Heart,         color: '#a78bfa' },
    { label: 'Nutrition',   sub: 'Food & shopping',   to: '/client/nutrition', ic: Activity,      color: '#60a5fa' },
    { label: 'Messages',    sub: 'Chat with PT',      to: '/client/messages',  ic: MessageSquare, color: '#4CAF50', badge: unreadMessages },
    { label: 'Check-in',    sub: 'Weekly review',     to: '/client/checkin',   ic: ClipboardList, color: '#FFD600' },
    { label: 'Workouts',    sub: 'Browse library',    to: '/client/workouts',  ic: Dumbbell,      color: '#FF6B2B' },
    { label: 'Stretches',   sub: 'Routines & library',to: '/client/exercises', ic: Zap,           color: '#4CAF50' },
  ];

  return (
    <div style={{background:'#111',minHeight:'100vh',paddingBottom:'6rem',fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <div style={{maxWidth:'800px',margin:'0 auto',padding:'2rem 1.25rem'}}>

        {/* Greeting */}
        <div style={{marginBottom:'1.5rem'}}>
          <p style={{fontSize:'0.65rem',fontWeight:400,letterSpacing:'0.18em',color:'#FF6B2B',textTransform:'uppercase',margin:'0 0 0.4rem'}}>{g}</p>
          <h1 style={{fontFamily:"'DM Sans',system-ui",fontSize:'2.5rem',fontWeight:300,color:'#fff',letterSpacing:'-0.04em',lineHeight:1.1,margin:'0 0 0.3rem'}}>{name}</h1>
          <p style={{fontSize:'0.8rem',color:'#707070',margin:0}}>{today}</p>
        </div>

        {/* Next Session */}
        <div onClick={()=>navigate('/client/sessions')} style={{background:'linear-gradient(135deg,#FF6B2B,#FFD600)',borderRadius:'14px',padding:'1.25rem 1.5rem',marginBottom:'1rem',cursor:'pointer'}}>
          <p style={{fontSize:'0.6rem',fontWeight:400,letterSpacing:'0.16em',color:'rgba(0,0,0,0.55)',textTransform:'uppercase',margin:'0 0 0.4rem'}}>Next Session</p>
          {sessions?.upcoming?.[0] ? (
            <div>
              <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'1.15rem',fontWeight:800,color:'#000',margin:'0 0 2px'}}>
                {new Date(sessions.upcoming[0].scheduled_date + 'T12:00:00').toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})}
              </p>
              <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.85rem',fontWeight:600,color:'rgba(0,0,0,0.6)',margin:0}}>
                {sessions.upcoming[0].scheduled_time} · {sessions.upcoming[0].session_type || 'PT Session'}
              </p>
            </div>
          ) : (
            <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'1rem',fontWeight:600,color:'rgba(0,0,0,0.7)',margin:0}}>No session booked yet — contact your PT</p>
          )}
        </div>

        {/* Stats row */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px',marginBottom:'1rem'}}>
          {[
            {v: rem,    l: 'Sessions Left', c: sc},
            {v: streak, l: 'Week Streak',   c: '#FF6B2B'},
            {v: used,   l: 'Completed',     c: '#FFD600'},
          ].map((s,i) => (
            <div key={i} style={{...C,textAlign:'center'}}>
              <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'2.2rem',fontWeight:300,color:s.c,letterSpacing:'-0.04em',lineHeight:1,margin:'0 0 0.4rem'}}>{s.v}</p>
              <p style={{fontSize:'0.6rem',fontWeight:400,letterSpacing:'0.1em',color:'#707070',textTransform:'uppercase',margin:0}}>{s.l}</p>
            </div>
          ))}
        </div>

        {/* Block Progress */}
        <div style={{...C,marginBottom:'1rem'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.75rem'}}>
            <div>
              <p style={{fontSize:'0.6rem',fontWeight:400,letterSpacing:'0.18em',color:'#FF6B2B',textTransform:'uppercase',margin:'0 0 0.3rem'}}>Block Progress</p>
              <p style={{fontSize:'0.78rem',color:'#707070',margin:0}}>
                {total > 0 ? `${used} of ${total} sessions done` : 'No active block yet'}
              </p>
            </div>
            <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'1.6rem',fontWeight:300,color:'#4CAF50',margin:0}}>{Math.round(pct)}%</p>
          </div>
          <div style={{width:'100%',height:'6px',backgroundColor:'#444',borderRadius:'3px',overflow:'hidden'}}>
            <div style={{height:'100%',width:`${pct}%`,background:'linear-gradient(90deg,#FF6B2B,#FFD600)',borderRadius:'3px'}}/>
          </div>
        </div>

        {/* Quick Access */}
        <p style={{fontSize:'0.6rem',fontWeight:400,letterSpacing:'0.18em',color:'#FF6B2B',textTransform:'uppercase',margin:'0 0 0.75rem'}}>Quick Access</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'1rem'}}>
          {LINKS.map((lk,i) => {
            const Icon = lk.ic;
            return (
              <div key={i} onClick={()=>navigate(lk.to)} style={{...C,cursor:'pointer',display:'flex',flexDirection:'column',gap:'0.6rem',position:'relative'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <Icon size={18} color={lk.color}/>
                  {lk.badge > 0 && (
                    <span style={{background:'#FF6B2B',color:'#000',fontSize:'0.6rem',fontWeight:800,padding:'2px 7px',borderRadius:'20px',lineHeight:1.4}}>
                      {lk.badge > 9 ? '9+' : lk.badge}
                    </span>
                  )}
                </div>
                <div>
                  <p style={{fontSize:'0.875rem',fontWeight:400,color:'#fff',margin:'0 0 2px'}}>{lk.label}</p>
                  <p style={{fontSize:'0.7rem',color:'#707070',margin:0}}>{lk.sub}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Motivation */}
        <div style={{...C,borderLeft:'3px solid #FF6B2B'}}>
          <p style={{fontSize:'0.6rem',fontWeight:400,letterSpacing:'0.18em',color:'#FF6B2B',textTransform:'uppercase',margin:'0 0 0.75rem'}}>Motivation</p>
          <p style={{fontSize:'0.9rem',color:'#b0b0b0',lineHeight:1.65,margin:'0 0 0.5rem',fontStyle:'italic'}}>"{quote.text}"</p>
          <p style={{fontSize:'0.65rem',fontWeight:400,color:'#FF6B2B',margin:0}}>— {quote.author}</p>
        </div>

      </div>
    </div>
  );
}
