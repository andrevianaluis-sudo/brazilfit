const fs=require("fs");const f="C:/Users/viana/BRAZILFIT/frontend/src/pages/pt/PTClientProfile.jsx";let c=fs.readFileSync(f,"utf8");const oldTab=c.substring(c.indexOf("function CheckinsTab"),c.indexOf("export default function PTClientProfile"));const newTab=`function CheckinsTab({ clientId }) {
  const [checkins, setCheckins] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const parse = v => { try { const a=JSON.parse(v); return Array.isArray(a)?a:[v]; } catch { return v?[v]:[]; } };
  React.useEffect(() => {
    api.get("/checkins/pt/summary").then(r => {
      const cl = r.data.summary?.find(x => x.clientId === parseInt(clientId));
      setCheckins(cl?.pastCheckins || []);
    }).catch(()=>{}).finally(()=>setLoading(false));
  }, [clientId]);
  if (loading) return <div style={{display:"flex",justifyContent:"center",padding:"2rem"}}><div style={{width:24,height:24,border:"2px solid #4CAF50",borderTop:"2px solid transparent",borderRadius:"50%",animation:"spin 1s linear infinite"}}/></div>;
  if (!checkins.length) return <p style={{textAlign:"center",color:"#707070",padding:"2rem"}}>No check-ins submitted yet</p>;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {checkins.map((c,i)=>(
        <div key={i} style={{background:"#1a1a1a",borderRadius:14,padding:"1.5rem",border:"1px solid rgba(255,255,255,0.06)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,paddingBottom:12,borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
            <span style={{fontSize:"0.7rem",fontWeight:400,letterSpacing:"0.15em",color:"#4CAF50",textTransform:"uppercase"}}>{c.checkin_week}</span>
            <span style={{fontSize:"0.75rem",color:"#606060"}}>{c.checkin_date}</span>
          </div>
          {(c.motivation_score||c.stress_score||c.overall_mood)&&(
            <div style={{display:"flex",gap:24,marginBottom:16}}>
              {c.motivation_score&&<div><p style={{fontSize:"0.65rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"#505050",margin:"0 0 4px"}}>Motivation</p><p style={{fontSize:"1.75rem",fontWeight:300,color:"#4CAF50",margin:0,lineHeight:1}}>{c.motivation_score}<span style={{fontSize:"0.875rem",color:"#404040"}}>/10</span></p></div>}
              {c.stress_score&&<div><p style={{fontSize:"0.65rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"#505050",margin:"0 0 4px"}}>Stress</p><p style={{fontSize:"1.75rem",fontWeight:300,color:"#FFD600",margin:0,lineHeight:1}}>{c.stress_score}<span style={{fontSize:"0.875rem",color:"#404040"}}>/10</span></p></div>}
              {c.overall_mood&&<div><p style={{fontSize:"0.65rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"#505050",margin:"0 0 4px"}}>Mood</p><p style={{fontSize:"1.75rem",fontWeight:300,color:"#fff",margin:0,lineHeight:1}}>{c.overall_mood}</p></div>}
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            {c.workouts_felt&&<div style={{background:"rgba(255,255,255,0.03)",borderRadius:8,padding:"10px 12px"}}><p style={{fontSize:"0.6rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"#505050",margin:"0 0 4px"}}>Workouts</p><p style={{fontSize:"0.875rem",color:"#fff",margin:0,fontWeight:300}}>{c.workouts_felt}</p></div>}
            {c.goals_last_week&&<div style={{background:"rgba(255,255,255,0.03)",borderRadius:8,padding:"10px 12px"}}><p style={{fontSize:"0.6rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"#505050",margin:"0 0 4px"}}>Goals last week</p><p style={{fontSize:"0.875rem",color:"#fff",margin:0,fontWeight:300}}>{c.goals_last_week}</p></div>}
          </div>
          {c.insight&&<div style={{background:"rgba(76,175,80,0.06)",borderRadius:8,padding:"10px 14px",marginBottom:12,borderLeft:"2px solid #4CAF50"}}><p style={{fontSize:"0.6rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"#4CAF50",margin:"0 0 4px"}}>Insight</p><p style={{fontSize:"0.875rem",color:"rgba(255,255,255,0.8)",margin:0,fontStyle:"italic",fontWeight:300}}>{c.insight}</p></div>}
          {c.wins&&parse(c.wins).length>0&&<div style={{marginBottom:12}}><p style={{fontSize:"0.6rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"#505050",margin:"0 0 8px"}}>Wins</p><div style={{display:"flex",flexDirection:"column",gap:4}}>{parse(c.wins).map((w,j)=><div key={j} style={{display:"flex",alignItems:"center",gap:8}}><span style={{color:"#4CAF50",fontSize:"0.75rem"}}>✓</span><span style={{fontSize:"0.875rem",color:"rgba(255,255,255,0.8)",fontWeight:300}}>{w}</span></div>)}</div></div>}
          {c.challenges&&parse(c.challenges).length>0&&<div style={{marginBottom:12}}><p style={{fontSize:"0.6rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"#505050",margin:"0 0 8px"}}>Challenges</p><div style={{display:"flex",flexDirection:"column",gap:4}}>{parse(c.challenges).map((ch,j)=><div key={j} style={{display:"flex",alignItems:"center",gap:8}}><span style={{color:"#FF6B2B",fontSize:"0.75rem"}}>!</span><span style={{fontSize:"0.875rem",color:"rgba(255,255,255,0.8)",fontWeight:300}}>{ch}</span></div>)}</div></div>}
          {(c.sleep_hours||c.water_glasses||c.daily_steps)&&<div style={{display:"flex",gap:16,paddingTop:12,borderTop:"1px solid rgba(255,255,255,0.04)"}}>{c.sleep_hours&&<span style={{fontSize:"0.75rem",color:"#606060"}}>Sleep <strong style={{color:"#fff",fontWeight:400}}>{c.sleep_hours}h</strong></span>}{c.water_glasses&&<span style={{fontSize:"0.75rem",color:"#606060"}}>Water <strong style={{color:"#fff",fontWeight:400}}>{c.water_glasses} glasses</strong></span>}{c.daily_steps&&<span style={{fontSize:"0.75rem",color:"#606060"}}>Steps <strong style={{color:"#fff",fontWeight:400}}>{c.daily_steps?.toLocaleString()}</strong></span>}</div>}
        </div>
      ))}
    </div>
  );
}

`;c=c.replace(oldTab,newTab);fs.writeFileSync(f,c,"utf8");console.log("Done:",c.includes("parse(c.wins)"));