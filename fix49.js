const fs = require("fs");
const file = "C:/Users/viana/BRAZILFIT/frontend/src/pages/client/ClientWellness.jsx";
const lines = fs.readFileSync(file, "utf8").split("\n");
// Line 624 (index 623) - add onStartRoutine prop
lines[623] = `                  onStart={()=>{if(item.type==="breathing")setBreathingSession(item);else setActiveSession(item);}}
                  onStartRoutine={item.type==="rest_day"?()=>setStretchRoutineSession(item):null}/>`;
fs.writeFileSync(file, lines.join("\n"), "utf8");
console.log("Done");