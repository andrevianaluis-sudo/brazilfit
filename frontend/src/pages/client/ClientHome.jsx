import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, Dumbbell, TrendingUp, Heart, MessageSquare, ClipboardList, Activity } from 'lucide-react';
import api from '../../utils/api';
const QUOTES = [{ text: 'Progress is progress no matter how small.', author: 'Unknown' },{ text: 'Train hard, recover harder.', author: 'Unknown' }];
const LINKS = [{ label: 'My Sessions', sub: 'Book & manage', to: '/client/sessions', ic: Calendar, color: '#FF6B2B' },{ label: 'Progress', sub: 'Track results', to: '/client/progress', ic: TrendingUp, color: '#4CAF50' },{ label: 'Wellness', sub: 'Daily check-in', to: '/client/wellness', ic: Heart, color: '#a78bfa' },{ label: 'Nutrition', sub: 'Food & shopping', to: '/client/nutrition', ic: Activity, color: '#60a5fa' },{ label: 'Messages', sub: 'Chat with PT', to: '/client/messages', ic: MessageSquare, color: '#4CAF50' },{ label: 'Check-in', sub: 'Weekly review', to: '/client/checkin', ic: ClipboardList, color: '#FFD600' },{ label: 'Workouts', sub: 'Browse library', to: '/client/workouts', ic: Dumbbell, color: '#FF6B2B' }];
export default function ClientHome() {
  const { user } = useAuth(); const navigate = useNavigate();
  const [sessions, setSessions] = useState(null); const [loading, setLoading] = useState(true);
  const [quote] = useState(QUOTES[Math.floor((Date.now() - new Date(new Date().getFullYear(),0,0))/86400000) % QUOTES.length]);
  useEffect(() => { if (!user?.clientId) return; api.get(`/sessions/client/${user.clientId}`).then(r => setSessions(r.data)).catch(console.error).finally(() => setLoading(false)); }, [user]);
  if (loading) return <div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'100vh',background:'#111'}}><div style={{width:'20px',height:'20px',border:'2px solid #FF6B2B',borderTop:'2px solid transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}/></div>;
  const rem = sessions?.sessionsRemaining||0, used = sessions?.sessionsUsed||0, total = used+rem;
  const pct = total>0?(used/total)*100:0;
  const sc = rem<=2?'#ef4444':rem<=5?'#FF6B2B':'#4CAF50';
  const hr = new Date().getHours();
  const g = hr<12?'Good morning':hr<18?'Good afternoon':'Good evening';
  const name = user?.name?.split(' ')[0]||'Athlete';
  const today = new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'});
  const C = {background:'#2a2a2a',borderRadius:'14px',border:'1px solid rgba(255,255,255,0.15)',padding:'1rem 1.25rem'};
  return (
    <div style={{background:'#111',minHeight:'100vh',paddingBottom:'6rem',fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <div style={{maxWidth:'800px',margin:'0 auto',padding:'2rem 1.25rem'}}>
        <div style={{marginBottom:'1.5rem'}}>
          <p style={{fontSize:'0.65rem',fontWeight:400,letterSpacing:'0.18em',color:'#FF6B2B',textTransform:'uppercase',margin:'0 0 0.4rem'}}>{g}</p>
          <h1 style={{fontFamily:"'DM Sans',system-ui",fontSize:'2.5rem',fontWeight:300,color:'#fff',letterSpacing:'-0.04em',lineHeight:1.1,margin:'0 0 0.3rem'}}>{name}</h1>
          <p style={{fontSize:'0.8rem',color:'#707070',margin:0}}>{today}</p>
        </div>
        <div onClick={()=>navigate('/client/sessions')} style={{background:'linear-gradient(135deg,#FF6B2B,#FFD600)',borderRadius:'14px',padding:'1.25rem 1.5rem',marginBottom:'1rem',cursor:'pointer'}}>
          <p style={{fontSize:'0.6rem',fontWeight:400,letterSpacing:'0.16em',color:'rgba(0,0,0,0.55)',textTransform:'uppercase',margin:'0 0 0.4rem'}}>Next Session</p>
          <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'1.1rem',fontWeight:400,color:'#000',margin:0}}>{sessions?.upcoming?.[0]?.title||'No session booked yet'}</p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px',marginBottom:'1rem'}}>
          {[{v:rem,l:'Sessions Left',c:sc},{v:5,l:'Week Streak',c:'#FF6B2B'},{v:used,l:'Completed',c:'#FFD600'}].map((s,i)=>(
            <div key={i} style={{...C,textAlign:'center'}}>
              <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'2.2rem',fontWeight:300,color:s.c,letterSpacing:'-0.04em',lineHeight:1,margin:'0 0 0.4rem'}}>{s.v}</p>
              <p style={{fontSize:'0.6rem',fontWeight:400,letterSpacing:'0.1em',color:'#707070',textTransform:'uppercase',margin:0}}>{s.l}</p>
            </div>
          ))}
        </div>
        <div style={{...C,marginBottom:'1rem'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.75rem'}}>
            <div>
              <p style={{fontSize:'0.6rem',fontWeight:400,letterSpacing:'0.18em',color:'#FF6B2B',textTransform:'uppercase',margin:'0 0 0.3rem'}}>Block Progress</p>
              <p style={{fontSize:'0.78rem',color:'#707070',margin:0}}>{used} of {total} sessions done</p>
            </div>
            <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'1.6rem',fontWeight:300,color:'#4CAF50',margin:0}}>{Math.round(pct)}%</p>
          </div>
          <div style={{width:'100%',height:'6px',backgroundColor:'#444',borderRadius:'3px',overflow:'hidden'}}>
            <div style={{height:'100%',width:`${pct}%`,background:'linear-gradient(90deg,#FF6B2B,#FFD600)',borderRadius:'3px'}}/>
          </div>
        </div>
        <p style={{fontSize:'0.6rem',fontWeight:400,letterSpacing:'0.18em',color:'#FF6B2B',textTransform:'uppercase',margin:'0 0 0.75rem'}}>Quick Access</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'1rem'}}>
          {LINKS.map((lk,i)=>{ const Icon=lk.ic; return (
            <div key={i} onClick={()=>navigate(lk.to)} style={{...C,cursor:'pointer',display:'flex',flexDirection:'column',gap:'0.6rem'}}>
              <Icon size={18} color={lk.color}/>
              <div>
                <p style={{fontSize:'0.875rem',fontWeight:400,color:'#fff',margin:'0 0 2px'}}>{lk.label}</p>
                <p style={{fontSize:'0.7rem',color:'#707070',margin:0}}>{lk.sub}</p>
              </div>
            </div>
          );})}
        </div>
        <div style={{...C,borderLeft:'3px solid #FF6B2B'}}>
          <p style={{fontSize:'0.6rem',fontWeight:400,letterSpacing:'0.18em',color:'#FF6B2B',textTransform:'uppercase',margin:'0 0 0.75rem'}}>Motivation</p>
          <p style={{fontSize:'0.9rem',color:'#b0b0b0',lineHeight:1.65,margin:'0 0 0.5rem',fontStyle:'italic'}}>"{quote.text}"</p>
          <p style={{fontSize:'0.65rem',fontWeight:400,color:'#FF6B2B',margin:0}}>� {quote.author}</p>
        </div>
      </div>
    </div>
  );
}
