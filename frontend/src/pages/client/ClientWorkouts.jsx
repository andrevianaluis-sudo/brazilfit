import { useState, useEffect } from 'react';
import { Dumbbell, Calendar, Clock, ArrowRight, Check, Zap, Trophy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import WorkoutDetailModal from '../../components/WorkoutDetailModal';

const BG='#0f0f0f';const SURFACE='#1a1a1a';const BORDER='rgba(255,255,255,0.08)';const TEXT='#ffffff';const MUTED='#606060';const ORANGE='#FF6B2B';const YELLOW='#FFD600';const GREEN='#4CAF50';

const STATUS={
  assigned:    {label:'New',         color:GREEN,  bg:'rgba(76,175,80,0.12)',   border:'rgba(76,175,80,0.25)',   icon:'⚡'},
  in_progress: {label:'In Progress', color:YELLOW, bg:'rgba(255,214,0,0.12)',   border:'rgba(255,214,0,0.25)',   icon:'🔥'},
  completed:   {label:'Completed',   color:MUTED,  bg:'rgba(255,255,255,0.04)', border:'rgba(255,255,255,0.08)', icon:'✅'},
  missed:      {label:'Missed',      color:'#ef4444',bg:'rgba(239,68,68,0.08)', border:'rgba(239,68,68,0.2)',    icon:'❌'},
};

const DIFF={
  beginner:     {label:'Beginner',     color:GREEN,  bg:'rgba(76,175,80,0.12)',  border:'rgba(76,175,80,0.25)'},
  intermediate: {label:'Intermediate', color:YELLOW, bg:'rgba(255,214,0,0.12)',  border:'rgba(255,214,0,0.25)'},
  advanced:     {label:'Advanced',     color:ORANGE, bg:'rgba(255,107,43,0.12)', border:'rgba(255,107,43,0.25)'},
};

function SectionLabel({children,color=ORANGE}){
  return(
    <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'0.875rem'}}>
      <div style={{width:'3px',height:'14px',borderRadius:'2px',background:`linear-gradient(180deg,${color},${color}88)`}}/>
      <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.6rem',fontWeight:700,letterSpacing:'0.2em',color,textTransform:'uppercase',margin:0}}>{children}</p>
    </div>
  );
}

export default function ClientWorkouts(){
  const{user}=useAuth();
  const[workouts,setWorkouts]=useState([]);const[loading,setLoading]=useState(true);const[selectedWorkout,setSelectedWorkout]=useState(null);

  useEffect(()=>{if(user?.clientId)fetchWorkouts();},[user]);

  async function fetchWorkouts(){
    try{setLoading(true);const res=await api.get(`/assigned-workouts/client/${user.clientId}`);setWorkouts(res.data||[]);}
    catch{toast.error('Failed to load workouts');}
    finally{setLoading(false);}
  }

  async function handleMarkComplete(workoutId){
    try{await api.patch(`/assigned-workouts/${workoutId}/complete`);toast.success('Workout marked as complete! 💪');fetchWorkouts();setSelectedWorkout(null);}
    catch{toast.error('Failed to mark complete');}
  }

  const active=workouts.filter(w=>w.status!=='completed');
  const completed=workouts.filter(w=>w.status==='completed');

  return(
    <div style={{backgroundColor:BG,minHeight:'100vh',paddingBottom:'6rem',fontFamily:"'DM Sans',system-ui"}}>
      <div style={{maxWidth:'800px',margin:'0 auto',padding:'2rem 1.25rem'}}>

        {/* Header */}
        <div style={{marginBottom:'2rem'}}>
          <p style={{fontSize:'0.6rem',fontWeight:700,letterSpacing:'0.2em',color:ORANGE,textTransform:'uppercase',margin:'0 0 6px'}}>Training</p>
          <h1 style={{fontFamily:"'DM Sans',system-ui",fontSize:'2.5rem',fontWeight:800,color:TEXT,letterSpacing:'-0.05em',margin:'0 0 4px',lineHeight:1}}>My Workouts</h1>
          <p style={{fontSize:'0.82rem',color:MUTED,margin:0}}>Assigned by your PT</p>
        </div>

        {loading?(
          <div style={{display:'flex',justifyContent:'center',padding:'5rem'}}>
            <div style={{width:'24px',height:'24px',border:`2px solid ${ORANGE}`,borderTop:'2px solid transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
          </div>
        ):workouts.length===0?(
          <div style={{borderRadius:'20px',padding:'3.5rem',textAlign:'center',background:'linear-gradient(135deg,#1a1a1a,#1e1a0a)',border:'1px solid rgba(255,107,43,0.15)'}}>
            <div style={{width:'64px',height:'64px',borderRadius:'20px',background:'rgba(255,107,43,0.1)',border:'1px solid rgba(255,107,43,0.2)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1.25rem',fontSize:'1.8rem'}}>🏋️</div>
            <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'1.3rem',fontWeight:800,color:TEXT,letterSpacing:'-0.03em',margin:'0 0 6px'}}>No workouts yet</p>
            <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.82rem',color:MUTED,margin:0}}>Your PT will assign workouts to your programme soon.</p>
          </div>
        ):(
          <>
            {/* Stats */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'10px',marginBottom:'1.5rem'}}>
              {[
                {value:workouts.length,label:'Total',    color:TEXT,   bg:'rgba(255,255,255,0.05)',border:BORDER,            icon:'📋'},
                {value:active.length,  label:'Active',   color:ORANGE, bg:'rgba(255,107,43,0.1)', border:'rgba(255,107,43,0.2)',icon:'🔥'},
                {value:completed.length,label:'Done',    color:GREEN,  bg:'rgba(76,175,80,0.1)',  border:'rgba(76,175,80,0.2)',icon:'✅'},
              ].map((s,i)=>(
                <div key={i} style={{borderRadius:'16px',padding:'1rem 0.75rem',background:s.bg,border:`1px solid ${s.border}`,textAlign:'center'}}>
                  <p style={{fontSize:'1rem',margin:'0 0 3px'}}>{s.icon}</p>
                  <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'2rem',fontWeight:800,color:s.color,letterSpacing:'-0.05em',lineHeight:1,margin:'0 0 4px'}}>{s.value}</p>
                  <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.58rem',fontWeight:700,letterSpacing:'0.12em',color:s.color,textTransform:'uppercase',margin:0,opacity:0.8}}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Active workouts */}
            {active.length>0&&(
              <div style={{marginBottom:'1.5rem'}}>
                <SectionLabel color={ORANGE}>Active Workouts</SectionLabel>
                <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                  {active.map(workout=>{
                    const st=STATUS[workout.status]||STATUS.assigned;
                    const df=DIFF[workout.difficulty]||DIFF.beginner;
                    return(
                      <div key={workout.id} onClick={()=>setSelectedWorkout(workout)} style={{
                        borderRadius:'16px',overflow:'hidden',cursor:'pointer',
                        background:`linear-gradient(135deg,${SURFACE},${st.bg.replace('0.12','0.2')})`,
                        border:`1px solid ${st.border}`,
                        boxShadow:`0 4px 20px ${st.color}10`,
                        transition:'transform 0.15s,box-shadow 0.15s',
                      }}
                        onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow=`0 8px 28px ${st.color}20`;}}
                        onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow=`0 4px 20px ${st.color}10`;}}>
                        {/* Colour top bar */}
                        <div style={{height:'3px',background:`linear-gradient(90deg,${st.color},${YELLOW})`}}/>
                        <div style={{padding:'1.1rem 1.25rem'}}>
                          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'12px',marginBottom:'0.875rem'}}>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'5px'}}>
                                <span style={{fontSize:'1.1rem'}}>{st.icon}</span>
                                <h3 style={{fontFamily:"'DM Sans',system-ui",fontSize:'1.05rem',fontWeight:800,color:TEXT,letterSpacing:'-0.02em',margin:0,lineHeight:1.2}}>{workout.name}</h3>
                              </div>
                              {workout.description&&<p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.78rem',color:'#a0a0a0',margin:0,lineHeight:1.55}}>{workout.description}</p>}
                            </div>
                            <ArrowRight size={16} color={st.color} style={{flexShrink:0,marginTop:'2px'}}/>
                          </div>
                          {/* Meta row */}
                          <div style={{display:'flex',alignItems:'center',gap:'6px',flexWrap:'wrap'}}>
                            <span style={{display:'flex',alignItems:'center',gap:'4px',fontFamily:"'DM Sans',system-ui",fontSize:'0.7rem',color:MUTED}}>
                              <Calendar size={11} color={MUTED}/>{new Date(workout.scheduled_date).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}
                            </span>
                            <span style={{color:'rgba(255,255,255,0.15)',fontSize:'0.7rem'}}>·</span>
                            <span style={{display:'flex',alignItems:'center',gap:'4px',fontFamily:"'DM Sans',system-ui",fontSize:'0.7rem',color:MUTED}}>
                              <Clock size={11} color={MUTED}/>{workout.estimated_duration_minutes} min
                            </span>
                            <span style={{color:'rgba(255,255,255,0.15)',fontSize:'0.7rem'}}>·</span>
                            <span style={{display:'flex',alignItems:'center',gap:'4px',fontFamily:"'DM Sans',system-ui",fontSize:'0.7rem',color:MUTED}}>
                              <Dumbbell size={11} color={MUTED}/>{workout.exercises?.length||0} exercises
                            </span>
                            <div style={{marginLeft:'auto',display:'flex',gap:'6px',flexShrink:0}}>
                              <span style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.6rem',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:df.color,background:df.bg,border:`1px solid ${df.border}`,padding:'2px 9px',borderRadius:'20px'}}>{df.label}</span>
                              <span style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.6rem',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:st.color,background:st.bg,border:`1px solid ${st.border}`,padding:'2px 9px',borderRadius:'20px'}}>{st.label}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Completed workouts */}
            {completed.length>0&&(
              <div>
                <SectionLabel color={MUTED}>Completed</SectionLabel>
                <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                  {completed.map(workout=>(
                    <div key={workout.id} onClick={()=>setSelectedWorkout(workout)} style={{
                      borderRadius:'14px',padding:'1rem 1.25rem',
                      background:'rgba(76,175,80,0.05)',border:'1px solid rgba(76,175,80,0.12)',
                      cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'12px',
                      opacity:0.75,transition:'opacity 0.15s',
                    }}
                      onMouseEnter={e=>e.currentTarget.style.opacity='1'}
                      onMouseLeave={e=>e.currentTarget.style.opacity='0.75'}>
                      <div style={{display:'flex',alignItems:'center',gap:'12px',flex:1,minWidth:0}}>
                        <div style={{width:'34px',height:'34px',borderRadius:'10px',background:'rgba(76,175,80,0.15)',border:'1px solid rgba(76,175,80,0.25)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:'1rem'}}>✅</div>
                        <div style={{minWidth:0}}>
                          <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.875rem',fontWeight:700,color:'#888',margin:'0 0 3px',textDecoration:'line-through',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{workout.name}</p>
                          <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.7rem',color:MUTED,margin:0}}>
                            {new Date(workout.scheduled_date).toLocaleDateString('en-GB',{day:'numeric',month:'short'})} · {workout.estimated_duration_minutes} min
                          </p>
                        </div>
                      </div>
                      <span style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.62rem',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:GREEN,background:'rgba(76,175,80,0.12)',border:'1px solid rgba(76,175,80,0.25)',padding:'3px 10px',borderRadius:'20px',flexShrink:0}}>Done</span>
                    </div>
                  ))}
                </div>

                {/* Completion banner */}
                {completed.length>=3&&(
                  <div style={{marginTop:'12px',borderRadius:'16px',padding:'1rem 1.25rem',background:'linear-gradient(135deg,rgba(255,214,0,0.08),rgba(255,107,43,0.06))',border:'1px solid rgba(255,214,0,0.2)',display:'flex',alignItems:'center',gap:'12px'}}>
                    <span style={{fontSize:'1.3rem'}}>🏆</span>
                    <div>
                      <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.82rem',fontWeight:700,color:YELLOW,margin:'0 0 2px'}}>{completed.length} workouts crushed</p>
                      <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.72rem',color:MUTED,margin:0}}>Your PT can see your progress — keep going</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {selectedWorkout&&(
        <WorkoutDetailModal workout={selectedWorkout} onClose={()=>setSelectedWorkout(null)} onComplete={()=>handleMarkComplete(selectedWorkout.id)}/>
      )}
    </div>
  );
}
