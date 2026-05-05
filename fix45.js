const fs = require("fs");
const file = "C:/Users/viana/BRAZILFIT/frontend/src/pages/client/ClientWellness.jsx";
const lines = fs.readFileSync(file, "utf8").split("\n");
lines[384] = "              <button onClick={onStartRoutine} style={{width:'100%',padding:'0.8rem',background:`linear-gradient(135deg,${GREEN},#2d8a30)`,border:'none',borderRadius:'8px',color:'#fff',fontSize:'0.875rem',fontWeight:400,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',minHeight:'auto',marginBottom:8}}><Play size={14}/> Start Routine</button>";
fs.writeFileSync(file, lines.join("\n"), "utf8");
console.log("Done");