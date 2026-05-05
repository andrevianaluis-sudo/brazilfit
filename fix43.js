const fs = require("fs");
const file = "C:/Users/viana/BRAZILFIT/frontend/src/pages/client/ClientWellness.jsx";
let c = fs.readFileSync(file, "utf8");

// Add onStartRoutine to the rest_day ContentCard (line ~499)
c = c.replace(
  `onStart={()=>{if(item.type==="breathing")setBreathingSession(item);else setActiveSession(item);}}/>
              ))}
            </div>
            <div style={{borderTop`,
  `onStart={()=>{if(item.type==="breathing")setBreathingSession(item);else setActiveSession(item);}}
                  onStartRoutine={item.type==="rest_day"?()=>setStretchRoutineSession(item):null}/>
              ))}
            </div>
            <div style={{borderTop`
);

fs.writeFileSync(file, c, "utf8");
console.log("Done:", c.includes("onStartRoutine"));