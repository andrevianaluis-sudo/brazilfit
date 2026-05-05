const fs = require("fs");
const file = "C:/Users/viana/BRAZILFIT/frontend/src/pages/client/ClientWellness.jsx";
let c = fs.readFileSync(file, "utf8");

// Update ContentCard to accept onStartRoutine prop and show Start Routine button for rest_day
c = c.replace(
  "function ContentCard({ item, tab, expanded, onToggleExpand, onStart }) {",
  "function ContentCard({ item, tab, expanded, onToggleExpand, onStart, onStartRoutine }) {"
);

c = c.replace(
  "  const isInteractive=tab==='mindfulness'||tab==='breathing';",
  "  const isInteractive=tab==='mindfulness'||tab==='breathing';\n  const isStretchRoutine=tab==='rest_day'&&onStartRoutine;"
);

c = c.replace(
  "        {isInteractive?(\n          <button onClick={onStart} style={{width:'100%',padding:'0.8rem',background:`linear-gradient(135deg,${ORANGE},${YELLOW})`,border:'none',borderRadius:'8px',color:'#000',fontFamily:\"'DM Sans',system-ui\",fontSize:'0.875rem',fontWeight:300,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',minHeight:'auto'}}>\n            <Play size={14}/>{tab==='breathing'?'Start Breathing Exercise':'Begin Session'}\n          </button>\n        ):(",
  "        {isInteractive?(\n          <button onClick={onStart} style={{width:'100%',padding:'0.8rem',background:`linear-gradient(135deg,${ORANGE},${YELLOW})`,border:'none',borderRadius:'8px',color:'#000',fontFamily:\"'DM Sans',system-ui\",fontSize:'0.875rem',fontWeight:300,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',minHeight:'auto'}}>\n            <Play size={14}/>{tab==='breathing'?'Start Breathing Exercise':'Begin Session'}\n          </button>\n        ):isStretchRoutine?(\n          <>\n            <button onClick={onStartRoutine} style={{width:'100%',padding:'0.8rem',background:`linear-gradient(135deg,${GREEN},#2d8a30)`,border:'none',borderRadius:'8px',color:'#fff',fontFamily:\"'DM Sans',system-ui\",fontSize:'0.875rem',fontWeight:400,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',minHeight:'auto',marginBottom:8}}>\n              <Play size={14}/> Start Routine\n            </button>\n            <button onClick={onToggleExpand} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',fontFamily:\"'DM Sans',system-ui\",fontSize:'0.75rem',color:MUTED,background:'none',border:'none',cursor:'pointer',padding:'6px 0',minHeight:'auto'}}\n              onMouseEnter={e=>e.currentTarget.style.color=TEXT} onMouseLeave={e=>e.currentTarget.style.color=MUTED}>\n              <span>{expanded?'Hide exercises':'Preview exercises'}</span>\n              {expanded?<ChevronUp size={14}/>:<ChevronDown size={14}/>}\n            </button>\n            {expanded&&<ExpandedDetail item={item}/>}\n          </>\n        ):("
);

fs.writeFileSync(file, c, "utf8");
console.log("Done:", c.includes("Start Routine"));