const fs = require("fs");
const file = "C:/Users/viana/BRAZILFIT/frontend/src/pages/client/ClientWellness.jsx";
let c = fs.readFileSync(file, "utf8");

c = c.replace(
  `                  onStartRoutine={item.type==="rest_day"?()=>setStretchRoutineSession(item):null}/>\n            </div>`,
  `                  onStartRoutine={item.type==="rest_day"?()=>setStretchRoutineSession(item):null}/>\n              ))}\n            </div>`
);

fs.writeFileSync(file, c, "utf8");
console.log("Done");