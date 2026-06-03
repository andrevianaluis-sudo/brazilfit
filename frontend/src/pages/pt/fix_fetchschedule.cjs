const fs = require('fs');
let c = fs.readFileSync('PTSchedule.jsx', 'utf8');

// Replace fetchSchedule() with onTimeUpdate() inside the SessionSlot component
c = c.replace('toast.success(\'Time updated\');\n                      fetchSchedule();', 
               'toast.success(\'Time updated\');\n                      if(onTimeUpdate) onTimeUpdate();');

fs.writeFileSync('PTSchedule.jsx', c);
console.log('Done');
