const fs = require("fs");
const file = "C:/Users/viana/BRAZILFIT/frontend/src/pages/client/ClientWellness.jsx";
let c = fs.readFileSync(file, "utf8");

// 1. Add stretches state after breathingSession state
c = c.replace(
  "  const [breathingSession,setBreathingSession]=useState(null);",
  "  const [breathingSession,setBreathingSession]=useState(null);\n  const [stretches,setStretches]=useState([]);\n  const [stretchGroup,setStretchGroup]=useState(\"All\");\n  const [stretchSearch,setStretchSearch]=useState(\"\");\n  const [stretchGroups,setStretchGroups]=useState([\"All\"]);\n  const [selectedStretch,setSelectedStretch]=useState(null);"
);

// 2. Add fetch for stretches when tab changes to rest_day
c = c.replace(
  "  const tabContent=content.filter(c=>c.type===tab);",
  "  useEffect(()=>{\n    if(tab===\"rest_day\"){\n      api.get(\"/stretches\").then(r=>{\n        setStretches(r.data);\n        const groups=[\"All\",...new Set(r.data.map(s=>s.muscle_group))];\n        setStretchGroups(groups);\n      }).catch(()=>{});\n    }\n  },[tab]);\n  const tabContent=content.filter(c=>c.type===tab);"
);

// 3. Replace the content rendering to handle rest_day separately
c = c.replace(
  "        {/* Content */}\n        {tabContent.length===0?(",
  "        {/* Content */}\n        {tab===\"rest_day\"?(\n          <div>\n            <div style={{display:\"flex\",gap:6,overflowX:\"auto\",paddingBottom:8,marginBottom:12}}>\n              {stretchGroups.map(g=>(\n                <button key={g} onClick={()=>setStretchGroup(g)} style={{flexShrink:0,padding:\"6px 14px\",borderRadius:8,border:`1px solid ${stretchGroup===g?GREEN:BORDER}`,background:stretchGroup===g?`${GREEN}22`:\"transparent\",color:stretchGroup===g?GREEN:MUTED,fontSize:\"0.75rem\",fontWeight:700,cursor:\"pointer\",minHeight:\"auto\",whiteSpace:\"nowrap\"}}>{g}</button>\n              ))}\n            </div>\n            <div style={{marginBottom:12}}>\n              <input value={stretchSearch} onChange={e=>setStretchSearch(e.target.value)} placeholder=\"Search stretches...\" style={{width:\"100%\",background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:10,color:TEXT,padding:\"10px 14px\",fontSize:14,boxSizing:\"border-box\",outline:\"none\"}}/>\n            </div>\n            <div style={{display:\"grid\",gridTemplateColumns:\"repeat(2,1fr)\",gap:10}}>\n              {stretches.filter(s=>(stretchGroup===\"All\"||s.muscle_group===stretchGroup)&&(stretchSearch===\"\"||s.name.toLowerCase().includes(stretchSearch.toLowerCase()))).map(s=>(\n                <div key={s.id} onClick={()=>setSelectedStretch(selectedStretch?.id===s.id?null:s)} style={{background:SURFACE,borderRadius:12,overflow:\"hidden\",border:`1px solid ${selectedStretch?.id===s.id?GREEN:BORDER}`,cursor:\"pointer\",transition:\"all 0.2s\"}}>\n                  <div style={{background:\"#1a1a1a\",aspectRatio:\"1\",display:\"flex\",alignItems:\"center\",justifyContent:\"center\",overflow:\"hidden\"}}>\n                    <img src={`/exercise-gifs/${s.gif_file}`} alt={s.name} style={{width:\"100%\",height:\"100%\",objectFit:\"cover\"}} loading=\"lazy\"/>\n                  </div>\n                  <div style={{padding:\"8px 10px\"}}>\n                    <p style={{fontSize:\"0.72rem\",fontWeight:700,color:TEXT,margin:\"0 0 2px\",lineHeight:1.3}}>{s.name}</p>\n                    <p style={{fontSize:\"0.62rem\",color:GREEN,fontWeight:600,margin:0}}>{s.muscle_group}</p>\n                  </div>\n                </div>\n              ))}\n            </div>\n            {selectedStretch&&(\n              <div style={{position:\"fixed\",inset:0,zIndex:50,background:\"rgba(0,0,0,0.9)\",display:\"flex\",alignItems:\"center\",justifyContent:\"center\",padding:\"1.5rem\"}} onClick={()=>setSelectedStretch(null)}>\n                <div style={{background:SURFACE,borderRadius:16,overflow:\"hidden\",maxWidth:380,width:\"100%\",border:`1px solid ${BORDER}`}} onClick={e=>e.stopPropagation()}>\n                  <img src={`/exercise-gifs/${selectedStretch.gif_file}`} alt={selectedStretch.name} style={{width:\"100%\",aspectRatio:\"1\",objectFit:\"cover\"}}/>\n                  <div style={{padding:\"1rem\"}}>\n                    <p style={{fontSize:\"1rem\",fontWeight:800,color:TEXT,margin:\"0 0 4px\"}}>{selectedStretch.name}</p>\n                    <p style={{fontSize:\"0.78rem\",color:GREEN,fontWeight:600,margin:\"0 0 12px\"}}>{selectedStretch.muscle_group}</p>\n                    <button onClick={()=>setSelectedStretch(null)} style={{width:\"100%\",padding:\"12px\",background:`linear-gradient(135deg,${GREEN},#2d8a30)`,border:\"none\",borderRadius:10,color:\"#fff\",fontWeight:800,fontSize:\"0.875rem\",cursor:\"pointer\"}}>Got it</button>\n                  </div>\n                </div>\n              </div>\n            )}\n          </div>\n        ):tabContent.length===0?("
);

// 4. Close the new ternary properly
c = c.replace(
  "          </div>\n        )}\n      </div>\n\n      {activeSession&&",
  "          </div>\n        ):null}\n      </div>\n\n      {activeSession&&"
);

fs.writeFileSync(file, c, "utf8");
console.log("Done");
