import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Droplets, Smile, Frown, Meh, Camera } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const BG='#0f0f0f';const SURFACE='#1a1a1a';const S2='#222';const BORDER='rgba(255,255,255,0.08)';const TEXT='#fff';const MUTED='#606060';const ORANGE='#FF6B2B';const YELLOW='#FFD600';const GREEN='#4CAF50';const BLUE='#60a5fa';

const MOODS=[{v:1,l:'Terrible',icon:Frown,c:'#ef4444'},{v:2,l:'Bad',icon:Frown,c:ORANGE},{v:3,l:'Okay',icon:Meh,c:YELLOW},{v:4,l:'Good',icon:Smile,c:'#a3e635'},{v:5,l:'Great',icon:Smile,c:GREEN}];
const TIMES=['Breakfast','Morning Snack','Lunch','Afternoon Snack','Dinner','Evening Snack'];
const ds=(d)=>d.toISOString().split('T')[0];

function MoodPicker({label,value,onChange}){
  return(
    <div>
      <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.72rem',fontWeight:700,color:MUTED,textTransform:'uppercase',letterSpacing:'0.1em',margin:'0 0 8px'}}>{label}</p>
      <div style={{display:'flex',gap:'6px'}}>
        {MOODS.map(m=>{
          const Icon=m.icon;const sel=value===m.v;
          return(
            <button key={m.v} type="button" onClick={()=>onChange(m.v)} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',padding:'10px 4px',borderRadius:'10px',border:`1px solid ${sel?m.c:BORDER}`,background:sel?`${m.c}18`:S2,cursor:'pointer',minHeight:'auto',transition:'all 0.15s'}}>
              <Icon size={18} color={sel?m.c:MUTED}/>
              <span style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.58rem',fontWeight:sel?700:400,color:sel?m.c:MUTED}}>{m.l}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WaterTracker({value,onChange}){
  return(
    <div>
      <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.72rem',fontWeight:700,color:MUTED,textTransform:'uppercase',letterSpacing:'0.1em',margin:'0 0 8px'}}>Water Intake</p>
      <div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginBottom:'6px'}}>
        {Array.from({length:8},(_,i)=>(
          <button key={i} type="button" onClick={()=>onChange(i+1===value?i:i+1)} style={{width:'40px',height:'40px',borderRadius:'10px',border:`1.5px solid ${i<value?BLUE:BORDER}`,background:i<value?`${BLUE}20`:S2,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',minHeight:'auto',minWidth:'auto',transition:'all 0.15s'}}>
            <Droplets size={16} color={i<value?BLUE:MUTED}/>
          </button>
        ))}
      </div>
      <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.72rem',color:MUTED}}>{value}  250ml = {(value*0.25).toFixed(2)}L</p>
    </div>
  );
}

function MealRow({meal,onChange,onDelete}){
  const[open,setOpen]=useState(!meal.food);
  return(
    <div style={{background:S2,borderRadius:'10px',border:`1px solid ${BORDER}`,overflow:'hidden'}}>
      <div style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 12px'}}>
        <div style={{flex:1,minWidth:0}}>
          <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.7rem',fontWeight:700,color:GREEN,margin:0}}>{meal.time}</p>
          {!open&&meal.food&&<p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.85rem',color:TEXT,margin:'2px 0 0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{meal.food}</p>}
        </div>
        <button type="button" onClick={()=>setOpen(o=>!o)} style={{background:'rgba(255,255,255,0.06)',border:'none',borderRadius:'8px',padding:'5px 8px',cursor:'pointer',color:MUTED,fontFamily:"'DM Sans',system-ui",fontSize:'0.72rem',minHeight:'auto',minWidth:'auto'}}>{open?'Done':'Edit'}</button>
        <button type="button" onClick={onDelete} style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'8px',padding:'5px',cursor:'pointer',display:'flex',alignItems:'center',minHeight:'auto',minWidth:'auto'}}>
          <X size={13} color="#ef4444"/>
        </button>
      </div>
      {open&&(
        <div style={{padding:'0 12px 12px',display:'flex',flexDirection:'column',gap:'8px',borderTop:`1px solid ${BORDER}`}}>
          <input placeholder="What did you eat?" value={meal.food||''} onChange={e=>onChange({...meal,food:e.target.value})}
            style={{width:'100%',padding:'8px 10px',background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:'8px',color:TEXT,fontFamily:"'DM Sans',system-ui",fontSize:'0.85rem',outline:'none',boxSizing:'border-box'}}/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
            {[['Calories','calories','kcal'],['Protein','protein','g'],['Carbs','carbs','g'],['Fat','fat','g']].map(([l,k,u])=>(
              <div key={k}>
                <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.62rem',fontWeight:700,color:MUTED,margin:'0 0 4px',textTransform:'uppercase',letterSpacing:'0.08em'}}>{l}</p>
                <div style={{display:'flex',alignItems:'center',gap:'4px',background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:'8px',padding:'6px 8px'}}>
                  <input type="number" placeholder="0" value={meal[k]||''} onChange={e=>onChange({...meal,[k]:e.target.value})}
                    style={{flex:1,border:'none',background:'transparent',color:TEXT,fontFamily:"'DM Sans',system-ui",fontSize:'0.85rem',outline:'none',width:'100%'}}/>
                  <span style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.65rem',color:MUTED,flexShrink:0}}>{u}</span>
                </div>
              </div>
            ))}
          </div>
          <textarea placeholder="Notes..." value={meal.notes||''} onChange={e=>onChange({...meal,notes:e.target.value})} rows={2}
            style={{width:'100%',padding:'8px 10px',background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:'8px',color:TEXT,fontFamily:"'DM Sans',system-ui",fontSize:'0.82rem',outline:'none',resize:'vertical',boxSizing:'border-box'}}/>
        </div>
      )}
    </div>
  );
}

export default function ClientFoodDiary(){
  const[date,setDate]=useState(new Date());
  const[entry,setEntry]=useState({meals:[],water:0,mood_before:3,mood_after:3,notes:''});
  const[saving,setSaving]=useState(false);
  const[mealPhotos,setMealPhotos]=useState([]);
  const[photoUploading,setPhotoUploading]=useState(false);

  useEffect(()=>{
    api.get(`/diary/${ds(date)}`).then(r=>{
      if(r.data){setEntry({meals:JSON.parse(r.data.meals||'[]'),water:r.data.water_glasses||0,mood_before:r.data.mood_before||3,mood_after:r.data.mood_after||3,notes:r.data.notes||''});}
      else{setEntry({meals:[],water:0,mood_before:3,mood_after:3,notes:''});}
    }).catch(()=>setEntry({meals:[],water:0,mood_before:3,mood_after:3,notes:''}));
    api.get(`/diary/photos/${ds(date)}`).then(r=>setMealPhotos(r.data.photos||[])).catch(()=>setMealPhotos([]));
  },[date]);

  const addMeal=()=>{
    const used=entry.meals.map(m=>m.time);
    const next=TIMES.find(t=>!used.includes(t))||TIMES[0];
    setEntry(e=>({...e,meals:[...e.meals,{time:next,food:'',calories:'',protein:'',carbs:'',fat:'',notes:''}]}));
  };

  const handlePhotoUpload=async(e)=>{
    const file=e.target.files[0]; if(!file) return;
    if(mealPhotos.length>=4){toast.error('Max 4 photos per day');return;}
    const fd=new FormData(); fd.append('photo',file);
    try{
      setPhotoUploading(true);
      await api.post(`/diary/photos/${ds(date)}`,fd,{headers:{'Content-Type':'multipart/form-data'}});
      const r=await api.get(`/diary/photos/${ds(date)}`);
      setMealPhotos(r.data.photos||[]);
      toast.success('Photo added');
    }catch(err){toast.error(err.response?.data?.error||'Upload failed');}
    finally{setPhotoUploading(false);}
  };
  const deletePhoto=async(pid)=>{
    try{await api.delete(`/diary/photo/${pid}`);setMealPhotos(p=>p.filter(x=>x!==pid));}
    catch{toast.error('Failed to delete');}
  };

  const save=async()=>{
    try{setSaving(true);await api.post('/diary',{date:ds(date),meals:JSON.stringify(entry.meals),water_glasses:entry.water,mood_before:entry.mood_before,mood_after:entry.mood_after,notes:entry.notes});toast.success('Diary saved!');}
    catch{toast.error('Failed to save');}finally{setSaving(false);}
  };

  const totals=entry.meals.reduce((acc,m)=>({cal:acc.cal+(parseInt(m.calories)||0),pro:acc.pro+(parseInt(m.protein)||0),carb:acc.carb+(parseInt(m.carbs)||0),fat:acc.fat+(parseInt(m.fat)||0)}),{cal:0,pro:0,carb:0,fat:0});
  const prevDay=()=>{const d=new Date(date);d.setDate(d.getDate()-1);setDate(d);};
  const nextDay=()=>{const d=new Date(date);d.setDate(d.getDate()+1);setDate(d);};
  const isToday=ds(date)===ds(new Date());

  return(
    <div style={{backgroundColor:BG,paddingBottom:'2rem',fontFamily:"'DM Sans',system-ui"}}>

      {/* Date nav */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.25rem',background:SURFACE,borderRadius:'14px',border:`1px solid ${BORDER}`,padding:'12px 16px'}}>
        <button onClick={prevDay} style={{background:S2,border:`1px solid ${BORDER}`,borderRadius:'8px',padding:'8px',cursor:'pointer',display:'flex',alignItems:'center',minHeight:'auto',minWidth:'auto'}}>
          <ChevronLeft size={16} color={TEXT}/>
        </button>
        <div style={{textAlign:'center'}}>
          <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'1rem',fontWeight:800,color:TEXT,margin:0,letterSpacing:'-0.02em'}}>
            {date.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})}
          </p>
          {isToday&&<p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.65rem',fontWeight:700,color:ORANGE,margin:'2px 0 0'}}>Today</p>}
        </div>
        <button onClick={nextDay} disabled={isToday} style={{background:S2,border:`1px solid ${BORDER}`,borderRadius:'8px',padding:'8px',cursor:isToday?'not-allowed':'pointer',display:'flex',alignItems:'center',minHeight:'auto',minWidth:'auto',opacity:isToday?0.3:1}}>
          <ChevronRight size={16} color={TEXT}/>
        </button>
      </div>

      {/* Macros summary */}
      {entry.meals.length>0&&(
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'6px',marginBottom:'1.25rem'}}>
          {[{l:'Calories',v:totals.cal,u:'kcal',c:ORANGE},{l:'Protein',v:totals.pro,u:'g',c:BLUE},{l:'Carbs',v:totals.carb,u:'g',c:YELLOW},{l:'Fat',v:totals.fat,u:'g',c:'#f472b6'}].map((m,i)=>(
            <div key={i} style={{background:`${m.c}10`,border:`1px solid ${m.c}25`,borderRadius:'12px',padding:'10px 8px',textAlign:'center'}}>
              <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'1.1rem',fontWeight:800,color:m.c,margin:'0 0 2px',letterSpacing:'-0.02em'}}>{m.v}</p>
              <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.55rem',fontWeight:700,color:m.c,textTransform:'uppercase',letterSpacing:'0.1em',margin:0,opacity:0.8}}>{m.l}</p>
            </div>
          ))}
        </div>
      )}

      {/* Meals */}
      <div style={{marginBottom:'1.25rem'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'10px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <div style={{width:'3px',height:'14px',borderRadius:'2px',background:`linear-gradient(180deg,${GREEN},${GREEN}88)`}}/>
            <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.6rem',fontWeight:700,letterSpacing:'0.18em',color:GREEN,textTransform:'uppercase',margin:0}}>Meals ({entry.meals.length})</p>
          </div>
          <div style={{display:'flex',gap:'6px'}}>
            <button type="button" onClick={addMeal} style={{display:'flex',alignItems:'center',gap:'4px',background:`${ORANGE}15`,border:`1px solid ${ORANGE}30`,borderRadius:'8px',padding:'5px 12px',cursor:'pointer',color:ORANGE,fontFamily:"'DM Sans',system-ui",fontSize:'0.75rem',fontWeight:700,minHeight:'auto'}}>
              <Plus size={13}/> Add Meal
            </button>
            <label style={{display:'flex',alignItems:'center',gap:'4px',background:`${GREEN}15`,border:`1px solid ${GREEN}30`,borderRadius:'8px',padding:'5px 12px',cursor:'pointer',color:GREEN,fontFamily:"'DM Sans',system-ui",fontSize:'0.75rem',fontWeight:700}}>
              <Camera size={13}/> {photoUploading?'…':'Add Photo'}
              <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{display:'none'}}/>
            </label>
          </div>
        </div>
        {mealPhotos.length>0&&(
          <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'12px'}}>
            {mealPhotos.map(pid=>(
              <div key={pid} style={{position:'relative'}}>
                <img src={`${api.defaults.baseURL}/diary/photo/${pid}?token=${localStorage.getItem('brazilfit_token')}`} alt="meal" style={{width:'72px',height:'72px',objectFit:'cover',borderRadius:'10px',border:`1px solid ${BORDER}`}}/>
                <button onClick={()=>deletePhoto(pid)} style={{position:'absolute',top:'-6px',right:'-6px',background:'#000',border:`1px solid ${BORDER}`,borderRadius:'50%',width:'20px',height:'20px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',padding:0}}>
                  <X size={12} color="#fff"/>
                </button>
              </div>
            ))}
          </div>
        )}
        {entry.meals.length===0?(
          <div style={{background:SURFACE,borderRadius:'12px',border:`1px dashed ${BORDER}`,padding:'2rem',textAlign:'center'}}>
            <p style={{fontSize:'1.5rem',margin:'0 0 6px'}}></p>
            <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.82rem',color:MUTED,margin:0}}>No meals logged yet</p>
          </div>
        ):(
          <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
            {entry.meals.map((meal,i)=>(
              <MealRow key={i} meal={meal}
                onChange={m=>setEntry(e=>({...e,meals:e.meals.map((x,j)=>j===i?m:x)}))}
                onDelete={()=>setEntry(e=>({...e,meals:e.meals.filter((_,j)=>j!==i)}))}/>
            ))}
          </div>
        )}
      </div>

      {/* Water */}
      <div style={{background:SURFACE,borderRadius:'14px',border:`1px solid ${BORDER}`,padding:'1rem',marginBottom:'1rem'}}>
        <WaterTracker value={entry.water} onChange={v=>setEntry(e=>({...e,water:v}))}/>
      </div>

      {/* Mood */}
      <div style={{background:SURFACE,borderRadius:'14px',border:`1px solid ${BORDER}`,padding:'1rem',marginBottom:'1rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
        <MoodPicker label="Mood before eating" value={entry.mood_before} onChange={v=>setEntry(e=>({...e,mood_before:v}))}/>
        <MoodPicker label="Mood after eating" value={entry.mood_after} onChange={v=>setEntry(e=>({...e,mood_after:v}))}/>
      </div>

      {/* Notes */}
      <div style={{marginBottom:'1.25rem'}}>
        <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.6rem',fontWeight:700,letterSpacing:'0.18em',color:MUTED,textTransform:'uppercase',margin:'0 0 8px'}}>Daily Notes</p>
        <textarea value={entry.notes} onChange={e=>setEntry(en=>({...en,notes:e.target.value}))} placeholder="How did you feel today? Any patterns you noticed?" rows={3}
          style={{width:'100%',padding:'0.875rem',background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:'12px',color:TEXT,fontFamily:"'DM Sans',system-ui",fontSize:'0.875rem',outline:'none',resize:'vertical',boxSizing:'border-box'}}
          onFocus={e=>e.target.style.borderColor=ORANGE} onBlur={e=>e.target.style.borderColor=BORDER}/>
      </div>

      {/* Save */}
      <button onClick={save} disabled={saving} style={{width:'100%',padding:'0.9rem',background:`linear-gradient(135deg,${ORANGE},${YELLOW})`,border:'none',borderRadius:'12px',color:'#000',fontFamily:"'DM Sans',system-ui",fontSize:'0.9rem',fontWeight:800,cursor:saving?'not-allowed':'pointer',opacity:saving?0.7:1,boxShadow:`0 4px 20px ${ORANGE}44`}}>
        {saving?'Saving...':'Save Diary Entry'}
      </button>
    </div>
  );
}

