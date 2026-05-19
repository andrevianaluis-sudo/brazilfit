import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Check } from 'lucide-react';
const PAGES = {
  '/client': { title: 'Welcome to BrazilFit!', color: '#FF6B2B', description: 'This is your personal training hub. Track your sessions, message your PT and access all your fitness tools from here.' },
  '/client/sessions': { title: 'My Sessions', color: '#FF6B2B', description: 'View your upcoming and past sessions. Each block has 10 sessions. You can cancel up to 24 hours before your session.' },
  '/client/progress': { title: 'Track Your Progress', color: '#4CAF50', description: 'Log your measurements here - weight, waist, hips and more. Add progress photos to see your visual transformation over time.' },
  '/client/messages': { title: 'Messages', color: '#a78bfa', description: 'Your direct line to your PT. Ask questions, share updates or just check in. Feel free to be open and honest!' },
  '/client/workouts': { title: 'My Workouts', color: '#FF6B2B', description: 'Your PT assigns workout plans here for you to follow between sessions. Mark each one complete when done.' },
  '/client/habits': { title: 'Health and Habits', color: '#4CAF50', description: 'Track your daily habits - sleep, water, steps and energy. Your PT uses this data to tailor your training and support.' },
  '/client/checkin': { title: 'Weekly Check-in', color: '#FFD600', description: 'Your weekly check-in helps your PT understand how you are feeling. It takes about 5 minutes and makes a huge difference!' },
  '/client/wellness': { title: 'Wellness Hub', color: '#a78bfa', description: 'Your Pro wellness hub includes mindfulness, breathing and rest day routines. Taking care of your mind is just as important as training.' },
  '/client/nutrition': { title: 'Nutrition', color: '#60a5fa', description: 'Discover healthy meals, nutrition tips and shopping lists. Use the food diary to log your daily eating and save your favourites!' },
  '/client/exercises': { title: 'Stretching Library', color: '#4CAF50', description: 'Browse 400+ stretching exercises. Build your own routines and follow the guided player. Regular stretching speeds up recovery.' },
};
export default function PageIntroManager() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [dontShow, setDontShow] = useState(false);
  const [page, setPage] = useState(null);
  useEffect(() => {
    const config = PAGES[location.pathname];
    if (!config) { setVisible(false); return; }
    const key = 'bfit_intro_' + location.pathname.replace(/\//g, '_');
    if (!localStorage.getItem(key)) { setPage({...config, key}); setDontShow(false); setVisible(true); }
    else { setVisible(false); }
  }, [location.pathname]);
  const handleClose = () => { if (dontShow && page) localStorage.setItem(page.key, '1'); setVisible(false); };
  if (!visible || !page) return null;
  return (
    <div style={{position:'fixed',inset:0,zIndex:1000,background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'flex-end',justifyContent:'center',padding:'0 0 24px',backdropFilter:'blur(4px)'}}>
      <div style={{width:'100%',maxWidth:'480px',background:'#1a1a1a',borderRadius:'24px 24px 16px 16px',overflow:'hidden',margin:'0 16px'}}>
        <div style={{background:linear-gradient(135deg,,99),padding:'20px',position:'relative'}}>
          <button onClick={handleClose} style={{position:'absolute',top:12,right:12,background:'rgba(0,0,0,0.25)',border:'none',borderRadius:'50%',width:30,height:30,cursor:'pointer',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center'}}><X size={15}/></button>
          <h2 style={{fontFamily:'DM Sans',system-ui,fontSize:'1.3rem',fontWeight:800,color:'#fff',margin:0,paddingRight:40}}>{page.title}</h2>
        </div>
        <div style={{padding:'18px'}}>
          <p style={{fontFamily:'DM Sans',system-ui,fontSize:'0.875rem',color:'#bbb',lineHeight:1.6,margin:'0 0 18px'}}>{page.description}</p>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14,cursor:'pointer'}} onClick={()=>setDontShow(d=>!d)}>
            <div style={{width:20,height:20,borderRadius:5,border:2px solid ,background:dontShow?page.color:'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              {dontShow && <Check size={12} color='#000' strokeWidth={3}/>}
            </div>
            <span style={{fontSize:'0.8rem',color:'#777'}}>Don't show this again</span>
          </div>
          <button onClick={handleClose} style={{width:'100%',background:linear-gradient(135deg,,bb),border:'none',borderRadius:10,padding:13,fontSize:'0.9rem',fontWeight:700,color:'#fff',cursor:'pointer'}}>Got it, let's go!</button>
        </div>
      </div>
    </div>
  );
}
