const fs = require("fs");
const file = "C:/Users/viana/BRAZILFIT/frontend/src/pages/client/ClientWellness.jsx";
let c = fs.readFileSync(file, "utf8");

// Insert curated routines before the browse section
c = c.replace(
  `        {tab==="rest_day"?(
          <div>
            <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:8,marginBottom:12}}>`,
  `        {tab==="rest_day"?(
          <div>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:"1.5rem"}}>
              {tabContent.map(item=>(
                <ContentCard key={item.id} item={item} tab={tab}
                  expanded={expanded===item.id}
                  onToggleExpand={()=>setExpanded(expanded===item.id?null:item.id)}
                  onStart={()=>{if(item.type==="breathing")setBreathingSession(item);else setActiveSession(item);}}/>
              ))}
            </div>
            <div style={{borderTop:\`1px solid \${BORDER}\`,paddingTop:"1.25rem",marginBottom:"1rem"}}>
            <p style={{fontSize:"0.6rem",fontWeight:700,letterSpacing:"0.18em",color:GREEN,textTransform:"uppercase",margin:"0 0 0.75rem"}}>Browse All Stretches</p>
            <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:8,marginBottom:12}}>`
);

fs.writeFileSync(file, c, "utf8");
console.log("Done:", c.includes("Browse All Stretches"));
