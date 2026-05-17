import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Check, Plus, ArrowRight, Lock, Calendar } from 'lucide-react';
import BackButton from '../../components/BackButton';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const BG='#0f0f0f';const SURFACE='#1a1a1a';const S2='#222';const BORDER='rgba(255,255,255,0.08)';const TEXT='#fff';const MUTED='#606060';const ORANGE='#FF6B2B';const GREEN='#4CAF50';const YELLOW='#FFD600';

const ta = (extra={}) => ({width:'100%',padding:'0.875rem',background:S2,border:`1px solid ${BORDER}`,borderRadius:'12px',color:TEXT,fontFamily:"'DM Sans',system-ui",fontSize:'0.875rem',outline:'none',resize:'vertical',boxSizing:'border-box',...extra});

function Card({step,total,emoji,label,title,sub,children}){
  return(
    <div style={{borderRadius:'20px',overflow:'hidden',border:'1px solid rgba(255,107,43,0.2)',background:'linear-gradient(135deg,#1a1a1a,#1e1a0a)',boxShadow:'0 4px 24px rgba(0,0,0,0.3)'}}>
      <div style={{height:'3px',background:`linear-gradient(90deg,${ORANGE},${YELLOW})`}}/>
      <div style={{padding:'1.5rem'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1rem'}}>
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <span style={{fontSize:'1.2rem'}}>{emoji}</span>
            <span style={{fontSize:'0.58rem',fontWeight:700,letterSpacing:'0.18em',color:ORANGE,textTransform:'uppercase'}}>{label}</span>
          </div>
          {step&&<span style={{fontSize:'0.65rem',fontWeight:700,color:MUTED,background:S2,border:`1px solid ${BORDER}`,borderRadius:'20px',padding:'2px 10px'}}>{step}/{total}</span>}
        </div>
        <h3 style={{fontFamily:"'DM Sans',system-ui",fontSize:'1.15rem',fontWeight:800,color:TEXT,letterSpacing:'-0.02em',margin:'0 0 4px',lineHeight:1.3}}>{title}</h3>
        {sub&&<p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.78rem',color:MUTED,margin:'0 0 1.25rem',lineHeight:1.5}}>{sub}</p>}
        {!sub&&<div style={{marginBottom:'1.25rem'}}/>}
        {children}
      </div>
    </div>
  );
}

function Choices({options,selected,onChange}){
  return(
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
      {options.map(o=>{
        const sel=selected===o.value;
        return(
          <button key={o.value} type="button" onClick={()=>onChange(o.value)} style={{padding:'0.875rem',borderRadius:'12px',cursor:'pointer',minHeight:'auto',border:`1px solid ${sel?o.color||ORANGE:BORDER}`,background:sel?`${o.color||ORANGE}18`:S2,color:sel?o.color||ORANGE:'#a0a0a0',fontFamily:"'DM Sans',system-ui",fontSize:'0.85rem',fontWeight:sel?700:500,transition:'all 0.15s',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',boxShadow:sel?`0 0 14px ${o.color||ORANGE}30`:'none'}}>
            {o.emoji&&<span style={{fontSize:'1.1rem'}}>{o.emoji}</span>}
            <span>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Emojis({list,labels,selected,onChange}){
  return(
    <div style={{display:'flex',gap:'8px'}}>
      {list.map((e,i)=>{
        const sel=selected===e;
        return(
          <button key={i} type="button" onClick={()=>onChange(e)} style={{flex:1,padding:'12px 4px',borderRadius:'14px',cursor:'pointer',minHeight:'auto',border:`1px solid ${sel?ORANGE:BORDER}`,background:sel?`${ORANGE}18`:S2,display:'flex',flexDirection:'column',alignItems:'center',gap:'6px',transition:'all 0.15s',transform:sel?'scale(1.06)':'scale(1)'}}>
            <span style={{fontSize:'1.8rem'}}>{e}</span>
            <span style={{fontSize:'0.6rem',fontWeight:700,color:sel?ORANGE:MUTED,textAlign:'center'}}>{labels[i]}</span>
          </button>
        );
      })}
    </div>
  );
}

function Slide({label,value,min,max,step,unit,fmt,color,onChange}){
  const pct=((value-min)/(max-min))*100;
  return(
    <div>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'10px'}}>
        <span style={{fontSize:'0.82rem',fontWeight:600,color:'#c0c0c0'}}>{label}</span>
        <span style={{fontSize:'1.3rem',fontWeight:800,color:color||ORANGE,letterSpacing:'-0.02em'}}>{fmt(value)}{unit}</span>
      </div>
      <div style={{position:'relative',height:'6px',background:S2,borderRadius:'3px'}}>
        <div style={{position:'absolute',left:0,top:0,height:'100%',width:`${pct}%`,background:`linear-gradient(90deg,${color||ORANGE},${YELLOW})`,borderRadius:'3px'}}/>
        <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(parseFloat(e.target.value))} style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:0,cursor:'pointer',margin:0}}/>
      </div>
    </div>
  );
}

function Scale({label,value,onChange,color}){
  return(
    <div>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'10px'}}>
        <span style={{fontSize:'0.85rem',fontWeight:700,color:'#c0c0c0'}}>{label}</span>
        {value&&<span style={{fontSize:'1rem',fontWeight:800,color}}>{value}/10</span>}
      </div>
      <div style={{display:'flex',gap:'5px'}}>
        {[1,2,3,4,5,6,7,8,9,10].map(n=>{
          const sel=value===n;const lit=n<=value;
          return(<button key={n} type="button" onClick={()=>onChange(n)} style={{flex:1,height:'38px',borderRadius:'8px',border:`1px solid ${sel?color:lit?`${color}55`:BORDER}`,background:sel?color:lit?`${color}22`:S2,color:sel?'#000':lit?color:MUTED,fontFamily:"'DM Sans',system-ui",fontSize:'0.75rem',fontWeight:sel?800:500,cursor:'pointer',padding:0,minHeight:'auto',minWidth:'auto',transition:'all 0.1s'}}>{n}</button>);
        })}
      </div>
      <div style={{display:'flex',justifyContent:'space-between',marginTop:'5px'}}>
        <span style={{fontSize:'0.6rem',color:MUTED}}>Low</span>
        <span style={{fontSize:'0.6rem',color:MUTED}}>High</span>
      </div>
    </div>
  );
}

function List({items,setItems,placeholder,emoji,maxItems,addLabel}){
  return(
    <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
      {items.map((item,i)=>(
        <div key={i} style={{display:'flex',alignItems:'center',gap:'10px',background:S2,borderRadius:'10px',padding:'10px 12px',border:`1px solid ${BORDER}`}}>
          <span style={{fontSize:'1rem',flexShrink:0}}>{emoji}</span>
          <input type="text" value={item} onChange={e=>{const n=[...items];n[i]=e.target.value;setItems(n);}} placeholder={placeholder} style={{flex:1,border:'none',background:'transparent',color:TEXT,fontFamily:"'DM Sans',system-ui",fontSize:'0.85rem',outline:'none'}}/>
        </div>
      ))}
      {items.length<maxItems&&(
        <button type="button" onClick={()=>setItems([...items,''])} style={{display:'flex',alignItems:'center',gap:'6px',color:ORANGE,background:`${ORANGE}10`,border:`1px dashed ${ORANGE}44`,borderRadius:'10px',padding:'10px 14px',fontFamily:"'DM Sans',system-ui",fontSize:'0.8rem',fontWeight:700,cursor:'pointer',minHeight:'auto'}}>
          <Plus size={14}/>{addLabel}
        </button>
      )}
    </div>
  );
}

export default function ClientCheckin(){
  const {user}=useAuth();
  const navigate=useNavigate();
  const [loading,setLoading]=useState(true);
  const [submitting,setSubmitting]=useState(false);
  const [submitted,setSubmitted]=useState(false);
  const [checkin,setCheckin]=useState(null);
  const [week,setWeek]=useState('');
  const [monday,setMonday]=useState('');
  const [fd,setFd]=useState({
    goals_achieved:'',goals_barrier:'',
    workouts_completed:'',workouts_notes:'',workouts_felt:'',
    sleep_hours:7,water_glasses:8,daily_steps:8000,
    alcohol_free:false,ate_breakfast:false,limited_processed:false,
    motivation_score:7,stress_score:5,
    overall_mood:'',motivation_factors:'',
    wins:['','',''],challenges:['','',''],next_week_goals:['','',''],
  });

  const upd=(k,v)=>setFd(f=>({...f,[k]:v}));

  const [streak, setStreak] = useState(0);
  const [lastCheckinDate, setLastCheckinDate] = useState(null);

  const load=async()=>{
    try{
      setLoading(true);
      const r=await api.get('/checkins/current');
      setWeek(r.data.currentWeek);
      setMonday(r.data.mondayDate);
      if(r.data.checkin){
        setCheckin(r.data.checkin);
        setSubmitted(true);
        // Load real streak
        const sr = await api.get('/checkins/streak').catch(()=>({data:{streak:0}}));
        setStreak(sr.data.streak||0);
        setLastCheckinDate(sr.data.lastCheckinDate||null);
      }
    }catch(e){toast.error('Failed to load');}
    finally{setLoading(false);}
  };

  useEffect(()=>{load();},[]);

  const submit=async(e)=>{
    e.preventDefault();
    const wins=fd.wins.filter(w=>w.trim());
    if(!wins.length){toast.error('Add at least 1 win');return;}
    try{
      setSubmitting(true);
      await api.post('/checkins/submit',{
        checkin_week:week,
        wins:JSON.stringify(wins),
        challenges:JSON.stringify(fd.challenges.filter(c=>c.trim())),
        next_week_goals:JSON.stringify(fd.next_week_goals.filter(g=>g.trim())),
        workouts_felt:fd.workouts_felt||null,
        workouts_completed:fd.workouts_completed||null,
        overall_mood:fd.overall_mood||null,
        motivation_score:fd.motivation_score||null,
        stress_score:fd.stress_score||null,
        sleep_hours:fd.sleep_hours||null,
        water_glasses:fd.water_glasses||null,
        daily_steps:fd.daily_steps||null,
        insight:fd.motivation_factors||null,
        goals_last_week:fd.goals_barrier||null,
        goals_achieved:fd.goals_achieved||null,
      });
      toast.success('Check-in submitted!');
      setTimeout(()=>load(),800);
    }catch(e){toast.error(e.response?.data?.error||'Failed to submit');}
    finally{setSubmitting(false);}
  };

  if(loading)return(<div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'60vh',background:BG}}><div style={{width:'24px',height:'24px',border:`2px solid ${ORANGE}`,borderTop:'2px solid transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}/></div>);

  // Success screen
  if(submitted&&checkin){
    return(
      <div style={{background:BG,minHeight:'100vh',padding:'2rem 1.25rem',paddingBottom:'6rem',fontFamily:"'DM Sans',system-ui"}}>
        <div style={{maxWidth:'600px',margin:'0 auto'}}>
          <div style={{textAlign:'center',padding:'2rem 0 2rem'}}>
            <div style={{width:'90px',height:'90px',margin:'0 auto 1.25rem',background:`linear-gradient(135deg,${ORANGE},${YELLOW})`,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 0 0 12px ${ORANGE}18,0 8px 40px ${ORANGE}55`}}>
              <span style={{fontSize:'2.2rem'}}></span>
            </div>
            <h2 style={{fontFamily:"'DM Sans',system-ui",fontSize:'1.85rem',fontWeight:800,color:TEXT,letterSpacing:'-0.03em',margin:'0 0 0.5rem'}}>Check-in Submitted!</h2>
            <p style={{fontSize:'0.95rem',color:ORANGE,fontWeight:700,margin:'0 0 0.35rem'}}>Great work this week</p>
            <p style={{fontSize:'0.82rem',color:MUTED,margin:0}}>Your PT will review your answers and respond soon</p>
          </div>

          <div style={{background:`linear-gradient(135deg,${ORANGE}28,${YELLOW}14)`,border:`1px solid ${ORANGE}44`,borderRadius:'16px',padding:'1.5rem',marginBottom:'1.25rem',display:'flex',alignItems:'center',gap:'1.5rem'}}>
            <div style={{textAlign:'center',flexShrink:0}}>
              <div style={{fontSize:'2rem',marginBottom:'4px'}}></div>
              <div style={{fontFamily:"'DM Sans',system-ui",fontSize:'3rem',fontWeight:900,color:ORANGE,lineHeight:1}}>{streak}</div>
              <div style={{fontSize:'0.58rem',fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',color:MUTED,marginTop:'4px'}}>Week Streak</div>
            </div>
            <div style={{flex:1}}>
              <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.92rem',fontWeight:700,color:TEXT,margin:'0 0 6px'}}>Keep it up  you're building something special</p>
              <p style={{fontSize:'0.78rem',color:MUTED,margin:'0 0 10px'}}>Your PT can see your consistency  it matters</p>
              <div style={{display:'inline-flex',alignItems:'center',gap:'6px',background:`${ORANGE}20`,border:`1px solid ${ORANGE}35`,borderRadius:'20px',padding:'4px 12px'}}>
                <span style={{fontSize:'0.8rem'}}></span>
                <span style={{fontSize:'0.72rem',fontWeight:700,color:ORANGE}}>+1 streak point earned!</span>
              </div>
            </div>
          </div>

          {[
            {icon:'',color:ORANGE,bg:`${ORANGE}15`,border:`${ORANGE}30`,text:'Every check-in adds +1 to your streak  keep the chain going'},
            {icon:'',color:'#60a5fa',bg:'rgba(96,165,250,0.12)',border:'rgba(96,165,250,0.25)',text:'Clients who check in weekly see 3 better results  research backed'},
            {icon:'',color:GREEN,bg:'rgba(76,175,80,0.12)',border:'rgba(76,175,80,0.25)',text:"Your PT uses your answers to personalise next week's programme"},
            {icon:'',color:'#c084fc',bg:'rgba(192,132,252,0.12)',border:'rgba(192,132,252,0.25)',text:'Every check-in brings you closer to your next achievement badge'},
          ].map((item,i)=>(
            <div key={i} style={{display:'flex',alignItems:'flex-start',gap:'14px',padding:'14px 16px',borderRadius:'12px',marginBottom:'8px',background:item.bg,border:`1px solid ${item.border}`}}>
              <span style={{fontSize:'1.3rem',flexShrink:0}}>{item.icon}</span>
              <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.84rem',color:TEXT,margin:0,lineHeight:1.55,fontWeight:500}}>{item.text}</p>
            </div>
          ))}

          <div style={{display:'flex',flexDirection:'column',gap:'10px',marginTop:'1.25rem'}}>
            <button onClick={()=>setSubmitted(false)} style={{width:'100%',padding:'0.9rem',background:'transparent',border:`1px solid ${BORDER}`,borderRadius:'12px',color:TEXT,fontFamily:"'DM Sans',system-ui",fontSize:'0.875rem',fontWeight:600,cursor:'pointer',minHeight:'auto'}}>View This Week's Answers</button>
            <button onClick={()=>navigate('/client')} style={{width:'100%',padding:'0.9rem',background:`linear-gradient(135deg,${ORANGE},${YELLOW})`,border:'none',borderRadius:'12px',color:'#000',fontFamily:"'DM Sans',system-ui",fontSize:'0.9rem',fontWeight:800,cursor:'pointer',minHeight:'auto',boxShadow:`0 4px 20px ${ORANGE}44`}}>Back to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  const T=9;

  return(
    <div style={{background:BG,minHeight:'100vh',paddingBottom:'6rem',fontFamily:"'DM Sans',system-ui"}}>
      <div style={{maxWidth:'680px',margin:'0 auto',padding:'2rem 1.25rem'}}>
        <BackButton to="/client"/>

        {checkin&&(
          <div style={{background:'rgba(76,175,80,0.1)',border:'1px solid rgba(76,175,80,0.25)',borderRadius:'14px',padding:'1rem 1.25rem',marginBottom:'1.5rem',display:'flex',alignItems:'center',gap:'12px'}}>
            <span style={{fontSize:'1.3rem'}}></span>
            <div style={{flex:1}}>
              <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.85rem',fontWeight:700,color:GREEN,margin:'0 0 2px'}}>Already submitted this week</p>
              <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.75rem',color:MUTED,margin:0}}>Viewing your answers</p>
            </div>
            <button onClick={()=>setSubmitted(true)} style={{background:`linear-gradient(135deg,${ORANGE},${YELLOW})`,border:'none',borderRadius:'10px',padding:'8px 14px',color:'#000',fontFamily:"'DM Sans',system-ui",fontSize:'0.75rem',fontWeight:800,cursor:'pointer',minHeight:'auto'}}>Back</button>
          </div>
        )}

        <div style={{margin:'0 0 2rem'}}>
          <p style={{fontSize:'0.6rem',fontWeight:700,letterSpacing:'0.2em',color:ORANGE,textTransform:'uppercase',margin:'0 0 6px'}}>Weekly Review</p>
          <h1 style={{fontFamily:"'DM Sans',system-ui",fontSize:'2.5rem',fontWeight:800,color:TEXT,letterSpacing:'-0.05em',margin:'0 0 6px',lineHeight:1}}>Weekly Check-in</h1>
          <p style={{fontSize:'0.82rem',color:MUTED,margin:'0 0 0.75rem'}}>Takes about 5 minutes  Helps your PT support you better</p>
          {monday&&(
            <div style={{display:'inline-flex',alignItems:'center',gap:'6px',background:'rgba(76,175,80,0.1)',border:'1px solid rgba(76,175,80,0.2)',borderRadius:'20px',padding:'4px 12px'}}>
              <Calendar size={12} color={GREEN}/>
              <p style={{fontSize:'0.75rem',color:GREEN,fontWeight:700,margin:0}}>Week of {new Date(monday).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}</p>
            </div>
          )}
        </div>

        <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:'14px'}}>

          <Card step={1} total={T} emoji="" label="Goal Review" title="Did you achieve your goals last week?" sub="Be honest  your PT is here to help, not judge">
            <Choices selected={fd.goals_achieved} onChange={v=>upd('goals_achieved',v)} options={[
              {value:'YES',label:'Yes, nailed it!',emoji:'',color:GREEN},
              {value:'NO',label:'Not quite',emoji:'',color:'#ef4444'},
            ]}/>
            {fd.goals_achieved==='NO'&&(
              <textarea value={fd.goals_barrier} onChange={e=>upd('goals_barrier',e.target.value)} placeholder="What got in the way? Your PT reads every answer." rows={3} style={{...ta(),marginTop:'12px'}} onFocus={e=>e.target.style.borderColor=ORANGE} onBlur={e=>e.target.style.borderColor=BORDER}/>
            )}
          </Card>

          <Card step={2} total={T} emoji="" label="Workouts" title="How many assigned workouts did you complete?">
            <Choices selected={fd.workouts_completed} onChange={v=>upd('workouts_completed',v)} options={[
              {value:'All of them',label:'All of them',emoji:'',color:GREEN},
              {value:'Most of them',label:'Most of them',emoji:'',color:'#60a5fa'},
              {value:'Some of them',label:'Some of them',emoji:'',color:YELLOW},
              {value:'None of them',label:'None of them',emoji:'',color:'#ef4444'},
            ]}/>
            <textarea value={fd.workouts_notes} onChange={e=>upd('workouts_notes',e.target.value)} placeholder="Tell us more  what got in the way if you missed any?" rows={2} style={{...ta(),marginTop:'12px'}} onFocus={e=>e.target.style.borderColor=ORANGE} onBlur={e=>e.target.style.borderColor=BORDER}/>
          </Card>

          <Card step={3} total={T} emoji="" label="Workout Feel" title="How did your workouts feel this week?">
            <Emojis list={['','','','','']} labels={['Tough','Meh','Good','Strong','On Fire!']} selected={fd.workouts_felt} onChange={v=>upd('workouts_felt',v)}/>
          </Card>

          <Card step={4} total={T} emoji="" label="Lifestyle" title="How were your daily habits?" sub="Use the sliders to show your average this week">
            <div style={{display:'flex',flexDirection:'column',gap:'1.5rem',marginBottom:'1.25rem'}}>
              <Slide label="Sleep per night" value={fd.sleep_hours} min={0} max={12} step={0.5} unit="h" fmt={v=>v} color={ORANGE} onChange={v=>upd('sleep_hours',v)}/>
              <Slide label="Water glasses" value={fd.water_glasses} min={0} max={15} step={1} unit=" glasses" fmt={v=>v} color="#60a5fa" onChange={v=>upd('water_glasses',v)}/>
              <Slide label="Daily steps" value={fd.daily_steps} min={0} max={20000} step={500} unit="k" fmt={v=>(v/1000).toFixed(0)} color={GREEN} onChange={v=>upd('daily_steps',v)}/>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
              {[{k:'alcohol_free',l:'Alcohol-free most days',e:''},{k:'ate_breakfast',l:'Ate breakfast daily',e:''},{k:'limited_processed',l:'Limited processed food',e:''}].map(item=>(
                <div key={item.k} onClick={()=>upd(item.k,!fd[item.k])} style={{display:'flex',alignItems:'center',gap:'10px',cursor:'pointer',padding:'10px 12px',background:fd[item.k]?'rgba(76,175,80,0.08)':S2,borderRadius:'10px',border:`1px solid ${fd[item.k]?'rgba(76,175,80,0.3)':BORDER}`,transition:'all 0.15s'}}>
                  <span style={{fontSize:'1.1rem'}}>{item.e}</span>
                  <span style={{flex:1,fontFamily:"'DM Sans',system-ui",fontSize:'0.875rem',color:fd[item.k]?TEXT:'#a0a0a0',fontWeight:fd[item.k]?600:400}}>{item.l}</span>
                  <div style={{width:'22px',height:'22px',borderRadius:'6px',border:`1px solid ${fd[item.k]?GREEN:BORDER}`,background:fd[item.k]?GREEN:S2,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    {fd[item.k]&&<Check size={13} color="#000"/>}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card step={5} total={T} emoji="" label="Mindset" title="Rate your motivation and stress levels" sub="1 = Low  10 = High">
            <div style={{display:'flex',flexDirection:'column',gap:'1.75rem'}}>
              <Scale label="Motivation" value={fd.motivation_score} onChange={v=>upd('motivation_score',v)} color={GREEN}/>
              <Scale label="Stress" value={fd.stress_score} onChange={v=>upd('stress_score',v)} color={YELLOW}/>
            </div>
          </Card>

          <Card step={6} total={T} emoji="" label="Mood" title="What's your overall mood this week?">
            <Emojis list={['','','','','']} labels={['Down','Neutral','Happy','Very Happy','Amazing!']} selected={fd.overall_mood} onChange={v=>upd('overall_mood',v)}/>
          </Card>

          <Card step={7} total={T} emoji="" label="Insight" title="What contributed to your motivation or stress?" sub="Your PT reads every word  be specific">
            <textarea value={fd.motivation_factors} onChange={e=>upd('motivation_factors',e.target.value)} placeholder="Share what helped you stay motivated or what caused stress..." rows={4} style={ta()} onFocus={e=>e.target.style.borderColor=ORANGE} onBlur={e=>e.target.style.borderColor=BORDER}/>
            <p style={{fontSize:'0.68rem',color:MUTED,margin:'6px 0 0',textAlign:'right'}}>{fd.motivation_factors.length}/500</p>
          </Card>

          <Card step={8} total={T} emoji="" label="Celebrate" title="List your wins from this week" sub="Big or small  every win counts">
            <List items={fd.wins} setItems={v=>upd('wins',v)} placeholder="I completed all my sessions" emoji="" maxItems={5} addLabel="Add another win"/>
          </Card>

          <Card step={9} total={T} emoji="" label="Looking Ahead" title="What are your goals for next week?" sub="Writing them down makes you 3x more likely to achieve them">
            <List items={fd.next_week_goals} setItems={v=>upd('next_week_goals',v)} placeholder="I will complete all 3 sessions" emoji="" maxItems={5} addLabel="Add another goal"/>
          </Card>

          <div style={{marginTop:'8px'}}>
            <button type="submit" disabled={submitting} style={{width:'100%',padding:'1.1rem',background:`linear-gradient(135deg,${ORANGE},${YELLOW})`,border:'none',borderRadius:'14px',color:'#000',fontFamily:"'DM Sans',system-ui",fontSize:'1rem',fontWeight:800,cursor:submitting?'not-allowed':'pointer',opacity:submitting?0.7:1,display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',minHeight:'auto',boxShadow:`0 6px 24px ${ORANGE}44`}}>
              {submitting?'Submitting...':<><span>Submit My Weekly Check-in</span><ArrowRight size={18}/></>}
            </button>
            <div style={{display:'flex',alignItems:'center',gap:'6px',marginTop:'12px',justifyContent:'center'}}>
              <Lock size={11} color={MUTED}/>
              <p style={{fontSize:'0.7rem',color:MUTED,margin:0}}>Private  shared only with your PT</p>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}




