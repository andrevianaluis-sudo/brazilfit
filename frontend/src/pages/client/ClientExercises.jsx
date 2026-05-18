import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const BG='#0f0f0f';const SURFACE='#1a1a1a';const BORDER='rgba(255,255,255,0.08)';const TEXT='#ffffff';const MUTED='#606060';const GREEN='#4CAF50';const ORANGE='#FF6B2B';const YELLOW='#FFD600';

function StretchPlayer({ stretches, onClose }) {
  const [idx,setIdx]=useState(0);const [timeLeft,setTimeLeft]=useState(45);const [active,setActive]=useState(false);const [done,setDone]=useState(false);
  const total=45;const circ=2*Math.PI*54;const current=stretches[idx];
  useEffect(()=>{if(!active||done)return;if(timeLeft<=0){if(idx<stretches.length-1){setIdx(i=>i+1);setTimeLeft(45);}else{setDone(true);setActive(false);}return;}const t=setInterval(()=>setTimeLeft(t=>t-1),1000);return()=>clearInterval(t);},[active,timeLeft,idx,stretches.length,done]);
  if(done)return(<div style={{position:'fixed',inset:0,zIndex:100,background:'#0d0d0d',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'2rem'}}><div style={{fontSize:64,marginBottom:16}}>ðŸŒ¿</div><p style={{fontSize:'0.65rem',letterSpacing:'0.2em',color:GREEN,textTransform:'uppercase',margin:'0 0 8px'}}>Complete</p><h2 style={{fontSize:'2rem',fontWeight:300,color:TEXT,margin:'0 0 24px',textAlign:'center'}}>Routine Done!</h2><p style={{fontSize:'0.9rem',fontStyle:'italic',color:'rgba(255,255,255,0.6)',margin:'0 0 32px',textAlign:'center'}}>Every stretch brings you closer to the best version of yourself.</p><div style={{display:'flex',gap:12,width:'100%',maxWidth:320}}><button onClick={()=>{setIdx(0);setTimeLeft(45);setActive(false);setDone(false);}} style={{flex:1,padding:14,background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:12,color:TEXT,cursor:'pointer'}}>Restart</button><button onClick={onClose} style={{flex:2,padding:14,background:'linear-gradient(135deg,#4CAF50,#2d8a30)',border:'none',borderRadius:12,color:'#fff',cursor:'pointer'}}>Finish</button></div></div>);
  return(<div style={{position:'fixed',inset:0,zIndex:100,background:'#0d0d0d',display:'flex',flexDirection:'column'}}><div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'1rem 1.25rem',flexShrink:0}}><div><p style={{fontSize:'0.6rem',letterSpacing:'0.18em',color:GREEN,textTransform:'uppercase',margin:0}}>Routine</p><p style={{fontSize:'0.8rem',color:'rgba(255,255,255,0.4)',margin:'2px 0 0'}}>{idx+1} of {stretches.length}</p></div><button onClick={onClose} style={{background:'rgba(255,255,255,0.08)',border:'none',borderRadius:'50%',width:36,height:36,cursor:'pointer',color:'rgba(255,255,255,0.6)',fontSize:'1.1rem'}}>âœ•</button></div><div style={{height:2,background:'rgba(255,255,255,0.08)',flexShrink:0}}><div style={{height:'100%',background:GREEN,width:`${(idx/stretches.length)*100}%`,transition:'width 0.5s'}}/></div><div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}>{current&&<div style={{width:'100%',maxWidth:320,aspectRatio:'1',borderRadius:20,overflow:'hidden',background:'#1a1a1a'}}><img src={`/exercise-gifs/${current.gif_file}`} alt={current.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/></div>}</div><div style={{padding:'0 1rem 1rem',textAlign:'center',flexShrink:0,overflowY:'auto'}}><p style={{fontSize:'0.65rem',letterSpacing:'0.15em',color:GREEN,textTransform:'uppercase',margin:'0 0 6px'}}>{current?.muscle_group}</p><h2 style={{fontSize:'1.2rem',fontWeight:300,color:TEXT,margin:'0 0 12px',lineHeight:1.2}}>{current?.name}</h2><div style={{position:'relative',width:100,height:100,margin:'0 auto 16px'}}><svg width="100" height="100" viewBox="0 0 120 120" style={{transform:'rotate(-90deg)'}}><circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6"/><circle cx="60" cy="60" r="54" fill="none" stroke={GREEN} strokeWidth="6" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ*(1-timeLeft/total)} style={{transition:'stroke-dashoffset 1s linear'}}/></svg><div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}><p style={{fontSize:'1.8rem',fontWeight:300,color:TEXT,margin:0,lineHeight:1}}>{timeLeft}</p><p style={{fontSize:'0.65rem',color:'rgba(255,255,255,0.4)',margin:0}}>seconds</p></div></div><div style={{display:'flex',gap:10}}><button onClick={()=>{if(idx>0){setIdx(i=>i-1);setTimeLeft(45);}}} disabled={idx===0} style={{flex:1,padding:13,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,color:idx===0?'rgba(255,255,255,0.2)':TEXT,cursor:idx===0?'default':'pointer'}}>Prev</button><button onClick={()=>setActive(a=>!a)} style={{flex:2,padding:13,background:active?'rgba(255,107,43,0.15)':'linear-gradient(135deg,#4CAF50,#2d8a30)',border:active?'1px solid rgba(255,107,43,0.3)':'none',borderRadius:12,color:'#fff',cursor:'pointer'}}>{active?'Pause':timeLeft===total?'Start':'Resume'}</button><button onClick={()=>{if(idx<stretches.length-1){setIdx(i=>i+1);setTimeLeft(45);}else setDone(true);}} style={{flex:1,padding:13,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,color:TEXT,cursor:'pointer'}}>Next</button></div></div></div>);
}

export default function ClientExercises() {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!user?.isPro) {
    return (
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'70vh',padding:'2rem',textAlign:'center'}}>
        <h2 style={{fontFamily:"'DM Sans',system-ui",fontSize:'1.5rem',fontWeight:800,color:'#fff',margin:'0 0 8px'}}>Stretches is a Pro feature</h2>
        <p style={{color:'#606060',fontSize:'0.875rem',margin:'0 0 1.5rem'}}>Unlock 400+ stretching exercises with BrazilFit Pro.</p>
        <button onClick={()=>navigate('/client/upgrade')} style={{padding:'0.875rem 2rem',background:'linear-gradient(135deg,#FF6B2B,#FFD600)',border:'none',borderRadius:'12px',color:'#000',fontSize:'0.875rem',fontWeight:800,cursor:'pointer'}}>Upgrade to Pro</button>
        <button onClick={()=>navigate(-1)} style={{marginTop:'12px',background:'none',border:'none',color:'#606060',cursor:'pointer'}}>Go back</button>
      </div>
    );
  }
  const [stretches,setStretches]=useState([]);const [loading,setLoading]=useState(true);const [group,setGroup]=useState('All');const [search,setSearch]=useState('');const [groups,setGroups]=useState(['All']);const [selected,setSelected]=useState(null);const [tab,setTab]=useState('browse');const [routineMode,setRoutineMode]=useState(false);const [picked,setPicked]=useState([]);const [routineName,setRoutineName]=useState('');const [myRoutines,setMyRoutines]=useState([]);const [player,setPlayer]=useState(null);
  useEffect(()=>{
    api.get('/stretches').then(r=>{
      setStretches(r.data);
      const g=['All',...new Set(r.data.map(s=>s.muscle_group).filter(Boolean))];
      setGroups(g);
    }).catch(()=>{}).finally(()=>setLoading(false));
    api.get('/routines').then(r=>setMyRoutines(r.data||[])).catch(()=>{});
  },[]);
  const filtered=stretches.filter(s=>(group==='All'||s.muscle_group===group)&&(search===''||s.name.toLowerCase().includes(search.toLowerCase())));
  const togglePick=(s)=>setPicked(p=>p.find(x=>x.id===s.id)?p.filter(x=>x.id!==s.id):[...p,s]);
  const saveRoutine=async()=>{
    if(!routineName.trim()||picked.length<2)return;
    try{
      const res=await api.post('/routines',{name:routineName,stretches:picked});
      setMyRoutines(prev=>[res.data,...prev]);
      setRoutineMode(false);setPicked([]);setRoutineName('');setTab('routines');
      toast.success('Routine saved!');
    }catch{toast.error('Failed to save routine');}
  };
  const deleteRoutine=async(id)=>{
    try{
      await api.delete(`/routines/${id}`);
      setMyRoutines(prev=>prev.filter(r=>r.id!==id));
    }catch{toast.error('Failed to delete routine');}
  };
  if(player)return <StretchPlayer stretches={player.stretches} onClose={()=>setPlayer(null)}/>;

  return (
    <div style={{backgroundColor:BG,minHeight:'100vh',paddingBottom:'6rem'}}>
      <div style={{maxWidth:'800px',margin:'0 auto',padding:'2rem 1.25rem'}}>

        {/* Header */}
        <p style={{fontSize:'0.6rem',fontWeight:700,letterSpacing:'0.2em',color:ORANGE,textTransform:'uppercase',margin:'0 0 6px'}}>Training</p>
        <h1 style={{fontFamily:"'DM Sans',system-ui",fontSize:'2.5rem',fontWeight:800,color:TEXT,letterSpacing:'-0.05em',margin:'0 0 1.5rem',lineHeight:1}}>Stretches</h1>

        {/* Tab bar + Create Routine */}
        <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap',alignItems:'center'}}>

          {/* Browse tab */}
          <button
            onClick={()=>setTab('browse')}
            style={{
              padding:'9px 20px',borderRadius:8,fontSize:'0.82rem',cursor:'pointer',minHeight:'auto',fontWeight:600,
              border: tab==='browse' ? '1px solid rgba(76,175,80,0.6)' : `1px solid ${BORDER}`,
              background: tab==='browse' ? 'rgba(76,175,80,0.18)' : 'rgba(255,255,255,0.04)',
              color: tab==='browse' ? GREEN : '#aaaaaa',
              boxShadow: tab==='browse' ? '0 0 12px rgba(76,175,80,0.12)' : 'none',
            }}
          >Browse Library</button>

          {/* My Routines tab */}
          <button
            onClick={()=>setTab('routines')}
            style={{
              padding:'9px 20px',borderRadius:8,fontSize:'0.82rem',cursor:'pointer',minHeight:'auto',fontWeight:600,
              border: tab==='routines' ? '1px solid rgba(76,175,80,0.6)' : `1px solid ${BORDER}`,
              background: tab==='routines' ? 'rgba(76,175,80,0.18)' : 'rgba(255,255,255,0.04)',
              color: tab==='routines' ? GREEN : '#aaaaaa',
              boxShadow: tab==='routines' ? '0 0 12px rgba(76,175,80,0.12)' : 'none',
            }}
          >My Routines ({myRoutines.length})</button>

          {/* Create Routine â€” full premium orange */}
          <button
            onClick={()=>{setRoutineMode(!routineMode);setPicked([]);}}
            style={{
              marginLeft:'auto',padding:'9px 20px',borderRadius:8,fontSize:'0.82rem',cursor:'pointer',minHeight:'auto',fontWeight:700,
              background: routineMode
                ? 'rgba(255,107,43,0.15)'
                : `linear-gradient(135deg, ${ORANGE}, ${YELLOW})`,
              border: routineMode ? `1px solid ${ORANGE}` : 'none',
              color: routineMode ? ORANGE : '#000',
              boxShadow: routineMode ? 'none' : '0 4px 16px rgba(255,107,43,0.4)',
              letterSpacing: '0.01em',
            }}
          >{routineMode ? 'âœ• Cancel' : '+ Create Routine'}</button>
        </div>

        {/* Routine builder panel */}
        {routineMode && (
          <div style={{background:SURFACE,borderRadius:12,padding:'1rem',marginBottom:16,border:'1px solid rgba(255,107,43,0.25)',boxShadow:'0 0 20px rgba(255,107,43,0.06)'}}>
            <p style={{fontSize:'0.7rem',color:ORANGE,letterSpacing:'0.1em',textTransform:'uppercase',margin:'0 0 10px',fontWeight:700}}>Tap stretches below to add to routine</p>
            <input
              value={routineName} onChange={e=>setRoutineName(e.target.value)}
              placeholder="Routine name..."
              style={{width:'100%',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,color:TEXT,padding:'10px 12px',fontSize:'0.875rem',boxSizing:'border-box',outline:'none',marginBottom:10}}
            />
            <p style={{fontSize:'0.75rem',color:MUTED,margin:'0 0 8px'}}>{picked.length} stretches selected</p>
            <div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:10}}>
              {picked.map(s=>(
                <span key={s.id} style={{fontSize:'0.7rem',padding:'3px 10px',borderRadius:20,background:'rgba(76,175,80,0.15)',color:GREEN,border:'1px solid rgba(76,175,80,0.2)'}}>
                  {s.name.split(' ').slice(0,3).join(' ')}
                </span>
              ))}
            </div>
            <button
              onClick={saveRoutine}
              disabled={!routineName.trim()||picked.length<2}
              style={{
                padding:'11px 20px',border:'none',borderRadius:8,fontSize:'0.875rem',cursor:'pointer',fontWeight:700,
                background: routineName.trim()&&picked.length>=2
                  ? `linear-gradient(135deg, ${ORANGE}, ${YELLOW})`
                  : 'rgba(255,255,255,0.05)',
                color: routineName.trim()&&picked.length>=2 ? '#000' : MUTED,
                boxShadow: routineName.trim()&&picked.length>=2 ? '0 4px 16px rgba(255,107,43,0.35)' : 'none',
              }}
            >Save Routine ({picked.length} stretches)</button>
          </div>
        )}

        {/* My Routines list */}
        {tab==='routines' && (
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {myRoutines.length===0
              ? <p style={{color:MUTED,textAlign:'center',padding:'3rem'}}>No routines yet. Create your first one!</p>
              : myRoutines.map(r=>(
                <div key={r.id} style={{background:SURFACE,borderRadius:12,padding:'1rem',border:`1px solid ${BORDER}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div>
                    <p style={{fontWeight:600,color:TEXT,margin:'0 0 4px'}}>{r.name}</p>
                    <p style={{fontSize:'0.75rem',color:MUTED,margin:0}}>{r.stretches.length} stretches</p>
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    <button onClick={()=>setPlayer(r)} style={{padding:'8px 16px',background:'linear-gradient(135deg,#4CAF50,#2d8a30)',border:'none',borderRadius:8,color:'#fff',cursor:'pointer',fontSize:'0.8rem',fontWeight:600}}>â–¶ Start</button>
                    <button onClick={()=>deleteRoutine(r.id)} style={{padding:'8px 12px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:8,color:'#ef4444',cursor:'pointer',fontSize:'0.8rem'}}>Delete</button>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {/* Browse tab */}
        {tab==='browse' && (
          <>
            <input
              value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search stretches..."
              style={{width:'100%',background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:10,color:TEXT,padding:'10px 14px',fontSize:14,boxSizing:'border-box',outline:'none',marginBottom:12}}
            />

            {/* Muscle group filter pills */}
            <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:8,marginBottom:16}}>
              {groups.map(g=>(
                <button
                  key={g} onClick={()=>setGroup(g)}
                  style={{
                    flexShrink:0,padding:'7px 15px',borderRadius:8,fontSize:'0.75rem',cursor:'pointer',whiteSpace:'nowrap',minHeight:'auto',fontWeight:600,
                    border: group===g ? '1px solid rgba(76,175,80,0.6)' : `1px solid ${BORDER}`,
                    background: group===g ? 'rgba(76,175,80,0.18)' : 'rgba(255,255,255,0.04)',
                    color: group===g ? GREEN : '#999999',
                    boxShadow: group===g ? '0 0 10px rgba(76,175,80,0.15)' : 'none',
                  }}
                >{g}</button>
              ))}
            </div>

            {loading
              ? <div style={{display:'flex',justifyContent:'center',padding:'4rem'}}><div style={{width:20,height:20,border:'2px solid #4CAF50',borderTop:'2px solid transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}/></div>
              : <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10}}>
                  {filtered.map(s=>{
                    const isPicked=picked.find(x=>x.id===s.id);
                    return(
                      <div key={s.id}
                        onClick={()=>routineMode?togglePick(s):setSelected(selected?.id===s.id?null:s)}
                        style={{background:SURFACE,borderRadius:12,overflow:'hidden',border:`1px solid ${isPicked&&routineMode?ORANGE:selected?.id===s.id?GREEN:BORDER}`,cursor:'pointer',position:'relative',transition:'border-color 0.15s'}}
                      >
                        {isPicked&&routineMode&&(
                          <div style={{position:'absolute',top:8,right:8,width:22,height:22,borderRadius:'50%',background:`linear-gradient(135deg,${ORANGE},${YELLOW})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,color:'#000',zIndex:2,fontWeight:700}}>âœ“</div>
                        )}
                        <div style={{background:'#1a1a1a',aspectRatio:'1',overflow:'hidden'}}>
                          <img src={`/exercise-gifs/${s.gif_file}`} alt={s.name} style={{width:'100%',height:'100%',objectFit:'cover'}} loading="lazy"/>
                        </div>
                        <div style={{padding:'8px 10px'}}>
                          <p style={{fontSize:'0.72rem',color:TEXT,margin:'0 0 2px',lineHeight:1.3,fontWeight:400}}>{s.name}</p>
                          <p style={{fontSize:'0.62rem',color:GREEN,margin:0}}>{s.muscle_group}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
            }
          </>
        )}

        {/* Stretch detail modal */}
        {selected&&!routineMode&&(
          <div style={{position:'fixed',inset:0,zIndex:50,background:'rgba(0,0,0,0.9)',display:'flex',alignItems:'center',justifyContent:'center',padding:'1.5rem'}} onClick={()=>setSelected(null)}>
            <div style={{background:SURFACE,borderRadius:16,overflow:'hidden',maxWidth:380,width:'100%',border:`1px solid ${BORDER}`}} onClick={e=>e.stopPropagation()}>
              <img src={`/exercise-gifs/${selected.gif_file}`} alt={selected.name} style={{width:'100%',aspectRatio:'1',objectFit:'cover'}}/>
              <div style={{padding:'1rem'}}>
                <p style={{fontSize:'1rem',fontWeight:400,color:TEXT,margin:'0 0 4px'}}>{selected.name}</p>
                <p style={{fontSize:'0.78rem',color:GREEN,margin:0}}>{selected.muscle_group}</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}


