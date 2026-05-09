import { useState, useEffect } from 'react';
import api from '../../utils/api';
const BG='#141414';const SURFACE='#1e1e1e';const BORDER='rgba(255,255,255,0.08)';const TEXT='#ffffff';const MUTED='#707070';const GREEN='#4CAF50';const ORANGE='#FF6B2B';
export default function ClientExercises() {
  const [stretches,setStretches]=useState([]);const [loading,setLoading]=useState(true);const [group,setGroup]=useState('All');const [search,setSearch]=useState('');const [groups,setGroups]=useState(['All']);const [selected,setSelected]=useState(null);
  useEffect(()=>{api.get('/stretches').then(r=>{setStretches(r.data);const g=['All',...new Set(r.data.map(s=>s.muscle_group).filter(Boolean))];setGroups(g);}).catch(()=>{}).finally(()=>setLoading(false));},[]);
  const filtered=stretches.filter(s=>(group==='All'||s.muscle_group===group)&&(search===''||s.name.toLowerCase().includes(search.toLowerCase())));
  return (
    <div style={{backgroundColor:BG,minHeight:'100vh',paddingBottom:'6rem'}}>
      <div style={{maxWidth:'800px',margin:'0 auto',padding:'2rem 1.25rem'}}>
        <p style={{fontSize:'0.65rem',fontWeight:400,letterSpacing:'0.18em',color:ORANGE,textTransform:'uppercase',margin:'0 0 0.4rem'}}>Library</p>
        <h1 style={{fontSize:'2rem',fontWeight:400,color:TEXT,letterSpacing:'-0.04em',margin:'0 0 1.5rem'}}>Stretches</h1>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search stretches..." style={{width:'100%',background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:10,color:TEXT,padding:'10px 14px',fontSize:14,boxSizing:'border-box',outline:'none',marginBottom:12}}/>
        <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:8,marginBottom:16}}>
          {groups.map(g=><button key={g} onClick={()=>setGroup(g)} style={{flexShrink:0,padding:'6px 14px',borderRadius:8,border:`1px solid ${group===g?GREEN:BORDER}`,background:group===g?`${GREEN}22`:'transparent',color:group===g?GREEN:MUTED,fontSize:'0.75rem',cursor:'pointer',whiteSpace:'nowrap',minHeight:'auto'}}>{g}</button>)}
        </div>
        {loading?<div style={{display:'flex',justifyContent:'center',padding:'4rem'}}><div style={{width:20,height:20,border:'2px solid #4CAF50',borderTop:'2px solid transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}/></div>:(
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10}}>
            {filtered.map(s=>(
              <div key={s.id} onClick={()=>setSelected(selected?.id===s.id?null:s)} style={{background:SURFACE,borderRadius:12,overflow:'hidden',border:`1px solid ${selected?.id===s.id?GREEN:BORDER}`,cursor:'pointer'}}>
                <div style={{background:'#1a1a1a',aspectRatio:'1',overflow:'hidden'}}><img src={`/exercise-gifs/${s.gif_file}`} alt={s.name} style={{width:'100%',height:'100%',objectFit:'cover'}} loading="lazy"/></div>
                <div style={{padding:'8px 10px'}}><p style={{fontSize:'0.72rem',color:TEXT,margin:'0 0 2px',lineHeight:1.3,fontWeight:300}}>{s.name}</p><p style={{fontSize:'0.62rem',color:GREEN,margin:0}}>{s.muscle_group}</p></div>
              </div>
            ))}
          </div>
        )}
        {selected&&(<div style={{position:'fixed',inset:0,zIndex:50,background:'rgba(0,0,0,0.9)',display:'flex',alignItems:'center',justifyContent:'center',padding:'1.5rem'}} onClick={()=>setSelected(null)}><div style={{background:SURFACE,borderRadius:16,overflow:'hidden',maxWidth:380,width:'100%',border:`1px solid ${BORDER}`}} onClick={e=>e.stopPropagation()}><img src={`/exercise-gifs/${selected.gif_file}`} alt={selected.name} style={{width:'100%',aspectRatio:'1',objectFit:'cover'}}/><div style={{padding:'1rem'}}><p style={{fontSize:'1rem',fontWeight:300,color:TEXT,margin:'0 0 4px'}}>{selected.name}</p><p style={{fontSize:'0.78rem',color:GREEN,margin:0}}>{selected.muscle_group}</p></div></div></div>)}
      </div>
    </div>
  );
}