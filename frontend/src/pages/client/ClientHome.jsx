import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, Dumbbell, TrendingUp, Heart, MessageSquare, ClipboardList, Activity, Zap, ChevronRight } from 'lucide-react';
import api from '../../utils/api';

const ORANGE='#FF6B2B';const YELLOW='#FFD600';const GREEN='#4CAF50';const TEXT='#ffffff';const MUTED='#606060';const BG='#0f0f0f';

const QUOTES=[
  {text:'Progress is progress no matter how small.',author:'Unknown'},
  {text:'Train hard, recover harder.',author:'Unknown'},
  {text:'The body achieves what the mind believes.',author:'Unknown'},
  {text:'Showing up is the hardest part. You already won.',author:'Unknown'},
  {text:'Your only competition is who you were yesterday.',author:'Unknown'},
  {text:'Consistency over intensity. Every single time.',author:'Unknown'},
  {text:'Fall in love with the process and the results will come.',author:'Unknown'},
  {text:'Strong is built, not born.',author:'Unknown'},
  {text:'The pain you feel today is the strength you feel tomorrow.',author:'Unknown'},
  {text:'Every rep counts. Even the ugly ones.',author:'Unknown'},
  {text:'One workout at a time. One day at a time.',author:'Unknown'},
  {text:'Rest is part of the training.',author:'Unknown'},
  {text:'Don\'t wish for it. Work for it.',author:'Unknown'},
  {text:'Sweat is just fat crying.',author:'Unknown'},
];

export default function ClientHome(){
  const{user}=useAuth();const navigate=useNavigate();
  const[sessions,setSessions]=useState(null);const[lastCheckinDate,setLastCheckinDate]=useState(null);const[unreadMessages,setUnreadMessages]=useState(0);const[loading,setLoading]=useState(true);
  const[quote]=useState(QUOTES[Math.floor((Date.now()-new Date(new Date().getFullYear(),0,0))/86400000)%QUOTES.length]);

  useEffect(()=>{
    if(!user?.clientId)return;
    Promise.all([
      api.get(`/sessions/client/${user.clientId}`).catch(()=>null),
      api.get('/checkins/streak').catch(()=>({data:{streak:0,lastCheckinDate:null}})),
      api.get('/messages/unread-count').catch(()=>null),
    ]).then(([sessRes,habitsRes,msgRes])=>{
      if(sessRes)setSessions(sessRes.data);
      if(habitsRes?.data)setLastCheckinDate(habitsRes.data.lastCheckinDate||null);
      if(msgRes)setUnreadMessages(msgRes.data.unreadCount||0);
    }).finally(()=>setLoading(false));
  },[user]);

  if(loading)return(
    <div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'100vh',background:BG}}>
      <div style={{width:'24px',height:'24px',border:`2px solid ${ORANGE}`,borderTop:'2px solid transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
    </div>
  );

  const rem=sessions?.sessionsRemaining||0;const used=sessions?.sessionsUsed||0;const total=used+rem;
  const pct=total>0?(used/total)*100:0;
  const sc=rem<=2?'#ef4444':rem<=5?ORANGE:GREEN;
  const hr=new Date().getHours();
  const g=hr<12?'Good morning':hr<18?'Good afternoon':'Good evening';
  const name=user?.name?.split(' ')[0]||'Athlete';
  const today=new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'});
  const nextSession=sessions?.upcoming?.[0];

  const LINKS=[
    {label:'My Sessions', sub:'Track your block',    to:'/client/sessions',  ic:Calendar,      color:ORANGE,          bg:'rgba(255,107,43,0.1)',  border:'rgba(255,107,43,0.2)'},
    {label:'Progress',    sub:'See your results',    to:'/client/progress',  ic:TrendingUp,    color:GREEN,           bg:'rgba(76,175,80,0.1)',   border:'rgba(76,175,80,0.2)'},
    {label:'Wellness',    sub:'Mind & recovery',     to:'/client/wellness',  ic:Heart,         color:'#a78bfa',       bg:'rgba(167,139,250,0.1)', border:'rgba(167,139,250,0.2)'},
    {label:'Nutrition',   sub:'Food & shopping',     to:'/client/nutrition', ic:Activity,      color:'#60a5fa',       bg:'rgba(96,165,250,0.1)',  border:'rgba(96,165,250,0.2)'},
    {label:'Messages',    sub:'Chat with PT',        to:'/client/messages',  ic:MessageSquare, color:GREEN,           bg:'rgba(76,175,80,0.1)',   border:'rgba(76,175,80,0.2)',  badge:unreadMessages},
    {label:'Check-in',    sub:'Weekly review',       to:'/client/checkin',   ic:ClipboardList, color:YELLOW,          bg:'rgba(255,214,0,0.1)',   border:'rgba(255,214,0,0.2)'},
    {label:'Workouts',    sub:'Browse library',      to:'/client/workouts',  ic:Dumbbell,      color:ORANGE,          bg:'rgba(255,107,43,0.1)',  border:'rgba(255,107,43,0.2)'},
    {label:'Stretches',   sub:'Pro feature',          to:'/client/exercises', ic:Zap,           color:GREEN,           bg:'rgba(76,175,80,0.1)',   border:'rgba(76,175,80,0.2)', pro:true},
  ];

  return(
    <div style={{background:BG,minHeight:'100vh',paddingBottom:'6rem',fontFamily:"'DM Sans',system-ui"}}>
      <div style={{maxWidth:'800px',margin:'0 auto',padding:'2rem 1.25rem'}}>

        {/* Greeting */}
        <div style={{marginBottom:'2rem'}}>
          <p style={{fontSize:'0.6rem',fontWeight:700,letterSpacing:'0.2em',color:ORANGE,textTransform:'uppercase',margin:'0 0 6px'}}>{g}</p>
          <h1 style={{fontFamily:"'DM Sans',system-ui",fontSize:'2.8rem',fontWeight:800,color:TEXT,letterSpacing:'-0.05em',lineHeight:1,margin:'0 0 5px'}}>{name}</h1>
          <p style={{fontSize:'0.8rem',color:MUTED,margin:0}}>{today}</p>
        </div>

        {/* Next Session hero card */}
        <div onClick={()=>navigate('/client/sessions')} style={{
          borderRadius:'20px',padding:'1.5rem',marginBottom:'1.25rem',cursor:'pointer',
          background:'linear-gradient(135deg,#FF6B2B 0%,#FF9500 50%,#FFD600 100%)',
          boxShadow:'0 8px 40px rgba(255,107,43,0.4)',
          position:'relative',overflow:'hidden',
        }}>
          <div style={{position:'absolute',top:'-20px',right:'-20px',width:'100px',height:'100px',borderRadius:'50%',background:'rgba(255,255,255,0.1)',pointerEvents:'none'}}/>
          <div style={{position:'absolute',bottom:'-30px',left:'30%',width:'80px',height:'80px',borderRadius:'50%',background:'rgba(255,255,255,0.06)',pointerEvents:'none'}}/>
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
            <div style={{flex:1}}>
              <p style={{fontSize:'0.58rem',fontWeight:700,letterSpacing:'0.2em',color:'rgba(0,0,0,0.5)',textTransform:'uppercase',margin:'0 0 8px'}}>NEXT SESSION</p>
              {nextSession?(
                <>
                  <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'1.3rem',fontWeight:800,color:'#000',letterSpacing:'-0.03em',margin:'0 0 4px',lineHeight:1.1}}>
                    {new Date(nextSession.scheduled_date+'T12:00:00').toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})}
                  </p>
                  <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.88rem',fontWeight:600,color:'rgba(0,0,0,0.6)',margin:0}}>
                    {nextSession.scheduled_time}  {nextSession.session_type||'PT Session'}
                  </p>
                </>
              ):(
                <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'1rem',fontWeight:700,color:'rgba(0,0,0,0.7)',margin:0}}>No session booked yet  contact your PT</p>
              )}
            </div>
            <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'rgba(0,0,0,0.15)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <ChevronRight size={18} color='rgba(0,0,0,0.6)'/>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'10px',marginBottom:'1.25rem'}}>
          {[
            {v:rem,    l:'Sessions Left', c:sc,     bg:`${sc}15`,     border:`${sc}30`, icon:''},
            {v:lastCheckinDate?Math.floor((new Date()-new Date(lastCheckinDate))/(1000*60*60*24))+'d ago':'Never', l:'Last Check-in', c:ORANGE,  bg:'rgba(255,107,43,0.1)', border:'rgba(255,107,43,0.2)', icon:''},
            {v:used,   l:'Completed',     c:YELLOW,  bg:'rgba(255,214,0,0.1)', border:'rgba(255,214,0,0.2)', icon:''},
          ].map((s,i)=>(
            <div key={i} style={{borderRadius:'16px',padding:'1rem 0.75rem',background:s.bg,border:`1px solid ${s.border}`,textAlign:'center'}}>
              <p style={{fontSize:'1rem',margin:'0 0 3px'}}>{s.icon}</p>
              <p style={{fontFamily:"'DM Sans',system-ui",fontSize:s.v==='lastCheckin'?'0.85rem':'2rem',fontWeight:800,color:s.c,letterSpacing:'-0.03em',lineHeight:1,margin:'0 0 4px'}}>{s.v}</p>
              <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.56rem',fontWeight:700,letterSpacing:'0.12em',color:s.c,textTransform:'uppercase',margin:0,opacity:0.8}}>{s.l}</p>
            </div>
          ))}
        </div>

        {/* Block progress */}
        <div onClick={()=>navigate('/client/sessions')} style={{
          borderRadius:'20px',padding:'1.25rem 1.5rem',marginBottom:'1.25rem',cursor:'pointer',
          background:'linear-gradient(135deg,#1a2a1a,#1e1a0a,#1a1a1a)',
          border:'1px solid rgba(76,175,80,0.2)',boxShadow:'0 4px 24px rgba(76,175,80,0.06)',
          position:'relative',overflow:'hidden',
        }}>
          <div style={{position:'absolute',top:'-20px',right:'-20px',width:'80px',height:'80px',borderRadius:'50%',background:GREEN,opacity:0.06,pointerEvents:'none'}}/>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.875rem'}}>
            <div>
              <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.58rem',fontWeight:700,letterSpacing:'0.2em',color:ORANGE,textTransform:'uppercase',margin:'0 0 4px'}}>Block Progress</p>
              <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.82rem',color:MUTED,margin:0}}>
                {total>0?`${used} of ${total} sessions done`:'No active block yet'}
              </p>
            </div>
            <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'2.2rem',fontWeight:300,color:GREEN,letterSpacing:'-0.05em',margin:0,lineHeight:1}}>{Math.round(pct)}%</p>
          </div>
          <div style={{width:'100%',height:'6px',backgroundColor:'rgba(255,255,255,0.06)',borderRadius:'3px',overflow:'hidden'}}>
            <div style={{height:'100%',width:`${pct}%`,background:`linear-gradient(90deg,${GREEN},${YELLOW})`,borderRadius:'3px',transition:'width 0.8s ease'}}/>
          </div>
          {rem<=3&&rem>0&&(
            <div style={{marginTop:'0.875rem',display:'flex',alignItems:'center',gap:'8px'}}>
              <span style={{fontSize:'0.8rem'}}></span>
              <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.75rem',color:YELLOW,fontWeight:600,margin:0}}>{rem} session{rem!==1?'s':''} left  time to renew your block</p>
            </div>
          )}
        </div>

        {/* Quick Access */}
        <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'0.875rem'}}>
          <div style={{width:'3px',height:'14px',borderRadius:'2px',background:`linear-gradient(180deg,${ORANGE},${ORANGE}88)`}}/>
          <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.6rem',fontWeight:700,letterSpacing:'0.2em',color:ORANGE,textTransform:'uppercase',margin:0}}>Quick Access</p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'1.25rem'}}>
          {LINKS.map((lk,i)=>{
            const Icon=lk.ic;
            return(
              <div key={i} onClick={()=>navigate(lk.to)} style={{
                borderRadius:'16px',padding:'1rem 1.1rem',cursor:'pointer',
                background:lk.bg,border:`1px solid ${lk.border}`,
                display:'flex',flexDirection:'column',gap:'0.6rem',
                transition:'transform 0.15s,box-shadow 0.15s',position:'relative',
              }}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow=`0 8px 24px ${lk.color}20`;}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div style={{width:'32px',height:'32px',borderRadius:'10px',background:`${lk.color}20`,border:`1px solid ${lk.color}30`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <Icon size={16} color={lk.color}/>
                  </div>
                  {lk.badge>0&&(
                    <span style={{background:ORANGE,color:'#000',fontSize:'0.58rem',fontWeight:800,padding:'2px 8px',borderRadius:'20px',lineHeight:1.4}}>
                      {lk.badge>9?'9+':lk.badge}
                    </span>
                  )}
                </div>
                <div>
                  <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.88rem',fontWeight:700,color:TEXT,margin:'0 0 2px'}}>{lk.label}</p>
                  <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.7rem',color:MUTED,margin:0}}>{lk.sub}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Motivation */}
        <div style={{borderRadius:'20px',padding:'1.5rem',background:'linear-gradient(135deg,#1a1a2e,#1a1a1a)',border:'1px solid rgba(167,139,250,0.2)',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:'-20px',right:'-20px',width:'80px',height:'80px',borderRadius:'50%',background:'#a78bfa',opacity:0.06,pointerEvents:'none'}}/>
          <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.58rem',fontWeight:700,letterSpacing:'0.2em',color:'#a78bfa',textTransform:'uppercase',margin:'0 0 0.875rem'}}> Daily Motivation</p>
          <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'1rem',color:'#c0c0c0',lineHeight:1.7,margin:'0 0 0.75rem',fontStyle:'italic',fontWeight:300}}>"{quote.text}"</p>
          <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.65rem',fontWeight:700,color:'#a78bfa',margin:0}}> {quote.author}</p>
        </div>

      </div>
    </div>
  );
}









