const fs = require("fs");
const file = "C:/Users/viana/BRAZILFIT/frontend/src/pages/client/ClientWellness.jsx";
let c = fs.readFileSync(file, "utf8");

const QUOTES = [
  "Flexibility is not just about your body — it is about your mindset too.",
  "Recovery is where the magic happens. You showed up for yourself today.",
  "Every stretch brings you closer to the best version of yourself.",
  "Rest is not weakness. It is wisdom.",
  "Your body just thanked you. Well done.",
  "Progress is not always visible, but today you moved forward.",
  "Consistency beats intensity. Keep showing up.",
  "A flexible body builds a resilient mind.",
];

const playerComp = `
function StretchRoutinePlayer({ item, onClose }) {
  const [stretches, setStretches] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isActive, setIsActive] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [quote] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const totalTime = 45;
  let parsed; try { parsed = JSON.parse(item.content); } catch { parsed = {}; }
  const ids = parsed?.stretch_ids || [];

  useEffect(() => {
    Promise.all(ids.map(id => api.get("/stretches/" + id).then(r => r.data).catch(() => null)))
      .then(results => setStretches(results.filter(Boolean)));
  }, []);

  useEffect(() => {
    if (!isActive || isDone) return;
    if (timeLeft <= 0) {
      if (currentIdx < stretches.length - 1) {
        setCurrentIdx(i => i + 1);
        setTimeLeft(45);
      } else {
        setIsDone(true);
        setIsActive(false);
      }
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [isActive, timeLeft, currentIdx, stretches.length, isDone]);

  const current = stretches[currentIdx];
  const progress = stretches.length > 0 ? ((currentIdx) / stretches.length) * 100 : 0;
  const circumference = 2 * Math.PI * 54;

  if (stretches.length === 0) return (
    <div style={{position:"fixed",inset:0,zIndex:50,background:"#0d0d0d",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:24,height:24,border:"2px solid #4CAF50",borderTop:"2px solid transparent",borderRadius:"50%",animation:"spin 1s linear infinite"}}/>
    </div>
  );

  if (isDone) return (
    <div style={{position:"fixed",inset:0,zIndex:50,background:"linear-gradient(180deg,#0d0d0d,#0a1a0a)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"2rem"}}>
      <div style={{fontSize:64,marginBottom:24}}>🌿</div>
      <p style={{fontSize:"0.65rem",fontWeight:400,letterSpacing:"0.2em",color:"#4CAF50",textTransform:"uppercase",margin:"0 0 12px"}}>Complete</p>
      <h2 style={{fontSize:"2rem",fontWeight:300,color:"#fff",letterSpacing:"-0.03em",margin:"0 0 24px",textAlign:"center"}}>{item.title}</h2>
      <div style={{background:"rgba(76,175,80,0.1)",border:"1px solid rgba(76,175,80,0.2)",borderRadius:16,padding:"1.5rem",maxWidth:340,marginBottom:32,textAlign:"center"}}>
        <p style={{fontSize:"1rem",fontWeight:300,color:"#fff",lineHeight:1.7,margin:0,fontStyle:"italic"}}>"{quote}"</p>
      </div>
      <div style={{display:"flex",gap:12,width:"100%",maxWidth:320}}>
        <button onClick={()=>{setCurrentIdx(0);setTimeLeft(45);setIsActive(false);setIsDone(false);}} style={{flex:1,padding:"14px",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,color:"#fff",fontSize:"0.875rem",fontWeight:400,cursor:"pointer"}}>Restart</button>
        <button onClick={onClose} style={{flex:2,padding:"14px",background:"linear-gradient(135deg,#4CAF50,#2d8a30)",border:"none",borderRadius:12,color:"#fff",fontSize:"0.875rem",fontWeight:400,cursor:"pointer"}}>Finish</button>
      </div>
    </div>
  );

  return (
    <div style={{position:"fixed",inset:0,zIndex:50,background:"#0d0d0d",display:"flex",flexDirection:"column",overflowY:"auto"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"1rem 1.25rem",flexShrink:0}}>
        <div>
          <p style={{fontSize:"0.6rem",fontWeight:400,letterSpacing:"0.18em",color:"#4CAF50",textTransform:"uppercase",margin:0}}>{item.title}</p>
          <p style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.4)",margin:"2px 0 0"}}>{currentIdx + 1} of {stretches.length}</p>
        </div>
        <button onClick={onClose} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:"50%",width:36,height:36,cursor:"pointer",color:"rgba(255,255,255,0.6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.1rem"}}>✕</button>
      </div>

      {/* Progress bar */}
      <div style={{height:2,background:"rgba(255,255,255,0.08)",flexShrink:0}}>
        <div style={{height:"100%",background:"#4CAF50",width:progress+"%",transition:"width 0.5s ease"}}/>
      </div>

      {/* GIF */}
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",minHeight:280}}>
        {current && (
          <div style={{width:"100%",maxWidth:320,aspectRatio:"1",borderRadius:20,overflow:"hidden",background:"#1a1a1a"}}>
            <img src={"/exercise-gifs/" + current.gif_file} alt={current.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          </div>
        )}
      </div>

      {/* Exercise info + timer */}
      <div style={{padding:"0 1.5rem 1rem",flexShrink:0,textAlign:"center"}}>
        <p style={{fontSize:"0.65rem",fontWeight:400,letterSpacing:"0.15em",color:"#4CAF50",textTransform:"uppercase",margin:"0 0 6px"}}>{current?.muscle_group}</p>
        <h2 style={{fontSize:"1.5rem",fontWeight:300,color:"#fff",letterSpacing:"-0.03em",margin:"0 0 24px",lineHeight:1.2}}>{current?.name}</h2>

        {/* Timer circle */}
        <div style={{position:"relative",width:140,height:140,margin:"0 auto 24px"}}>
          <svg width="140" height="140" viewBox="0 0 120 120" style={{transform:"rotate(-90deg)"}}>
            <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6"/>
            <circle cx="60" cy="60" r="54" fill="none" stroke="#4CAF50" strokeWidth="6" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={circumference * (1 - timeLeft / totalTime)}
              style={{transition:"stroke-dashoffset 1s linear"}}/>
          </svg>
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
            <p style={{fontSize:"2.2rem",fontWeight:300,color:"#fff",margin:0,lineHeight:1}}>{timeLeft}</p>
            <p style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.4)",margin:0}}>seconds</p>
          </div>
        </div>

        {/* Buttons */}
        <div style={{display:"flex",gap:10,marginBottom:8}}>
          <button onClick={()=>{if(currentIdx>0){setCurrentIdx(i=>i-1);setTimeLeft(45);}}} disabled={currentIdx===0}
            style={{flex:1,padding:"13px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,color:currentIdx===0?"rgba(255,255,255,0.2)":"#fff",fontSize:"0.85rem",fontWeight:400,cursor:currentIdx===0?"default":"pointer"}}>
            ← Prev
          </button>
          <button onClick={()=>setIsActive(a=>!a)}
            style={{flex:2,padding:"13px",background:isActive?"rgba(255,107,43,0.15)":"linear-gradient(135deg,#4CAF50,#2d8a30)",border:isActive?"1px solid rgba(255,107,43,0.3)":"none",borderRadius:12,color:"#fff",fontSize:"0.95rem",fontWeight:400,cursor:"pointer"}}>
            {isActive ? "⏸ Pause" : timeLeft === totalTime ? "▶ Start" : "▶ Resume"}
          </button>
          <button onClick={()=>{if(currentIdx<stretches.length-1){setCurrentIdx(i=>i+1);setTimeLeft(45);}else{setIsDone(true);}}}
            style={{flex:1,padding:"13px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,color:"#fff",fontSize:"0.85rem",fontWeight:400,cursor:"pointer"}}>
            Next →
          </button>
        </div>
        <p style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.25)",margin:0}}>Hold the stretch. Breathe deeply.</p>
      </div>
    </div>
  );
}
`;

c = c.replace("const QUOTES", "// QUOTES\nconst QUOTES");
c = c.replace("// QUOTES\nconst QUOTES", playerComp + "\nconst QUOTES");

// Add stretchRoutineSession state
c = c.replace(
  "  const [breathingSession,setBreathingSession]=useState(null);",
  "  const [breathingSession,setBreathingSession]=useState(null);\n  const [stretchRoutineSession,setStretchRoutineSession]=useState(null);"
);

// Add player render
c = c.replace(
  "{breathingSession&&<BreathingPlayer exercise={breathingSession} onClose={()=>setBreathingSession(null)}/>}",
  "{breathingSession&&<BreathingPlayer exercise={breathingSession} onClose={()=>setBreathingSession(null)}/> }\n      {stretchRoutineSession&&<StretchRoutinePlayer item={stretchRoutineSession} onClose={()=>setStretchRoutineSession(null)}/>}"
);

// Add Start Routine button to rest_day ContentCard
c = c.replace(
  "            {tabContent.map(item=>(\n                <ContentCard key={item.id} item={item} tab={tab}\n                  expanded={expanded===item.id}\n                  onToggleExpand={()=>setExpanded(expanded===item.id?null:item.id)}\n                  onStart={()=>{if(item.type===\"breathing\")setBreathingSession(item);else setActiveSession(item);}}/>",
  "            {tabContent.map(item=>(\n                <ContentCard key={item.id} item={item} tab={tab}\n                  expanded={expanded===item.id}\n                  onToggleExpand={()=>setExpanded(expanded===item.id?null:item.id)}\n                  onStart={()=>{if(item.type===\"breathing\")setBreathingSession(item);else if(item.type===\"rest_day\"){let p;try{p=JSON.parse(item.content);}catch{p={}}; if(p?.stretch_ids?.length>0)setStretchRoutineSession(item);else setActiveSession(item);}else setActiveSession(item);}}\n                  onStartRoutine={item.type===\"rest_day\"?()=>{let p;try{p=JSON.parse(item.content);}catch{p={}}; if(p?.stretch_ids?.length>0)setStretchRoutineSession(item);}:null}/>",
);

fs.writeFileSync(file, c, "utf8");
console.log("Done:", c.includes("StretchRoutinePlayer"));