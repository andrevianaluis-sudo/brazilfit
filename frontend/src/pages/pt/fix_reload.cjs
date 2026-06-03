const fs = require('fs');
let c = fs.readFileSync('PTSchedule.jsx', 'utf8');

// Fix 1: Replace onTimeUpdate={fetchSchedule} with onTimeUpdate={() => window.location.reload()}
c = c.replace('onTimeUpdate={fetchSchedule}', 'onTimeUpdate={() => window.location.reload()}');

// Fix 2: Replace fetchSchedule() call inside SessionSlot with onTimeUpdate()
c = c.replace("toast.success('Time updated');\n                      fetchSchedule();",
              "toast.success('Time updated');\n                      if(onTimeUpdate) onTimeUpdate();");

fs.writeFileSync('PTSchedule.jsx', c);
console.log('Done');
