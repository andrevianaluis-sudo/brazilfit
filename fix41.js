const fs = require("fs");
const file = "C:/Users/viana/BRAZILFIT/frontend/src/pages/client/ClientWellness.jsx";
let c = fs.readFileSync(file, "utf8");

// Fix line 499-500 (rest_day section)
c = c.replace(
  `                  onStart={()=>{if(item.type===""breathing"")setBreathingSession(item);else setActiveSession(item);}}\n                  onStartRoutine={item.type===""rest_day""?()=>setStretchRoutineSession(item):null}/>`,
  `                  onStart={()=>{if(item.type==='breathing')setBreathingSession(item);else setActiveSession(item);}}\n                  onStartRoutine={item.type==='rest_day'?()=>setStretchRoutineSession(item):null}/>`
);

// Fix line 548-549 (other section)  
c = c.replace(
  `                onStart={()=>{if(item.type==='breathing')setBreathingSession(item);else setActiveSession(item);}}\n                onStartRoutine={item.type==='rest_day'?()=>setStretchRoutineSession(item):null}/>`,
  `                onStart={()=>{if(item.type==='breathing')setBreathingSession(item);else setActiveSession(item);}}\n                onStartRoutine={item.type==='rest_day'?()=>setStretchRoutineSession(item):null}/>`
);

fs.writeFileSync(file, c, "utf8");
console.log("Done");