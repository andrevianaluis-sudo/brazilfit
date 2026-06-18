const fs = require('fs');
let c = fs.readFileSync('pages/client/ClientCheckin.jsx', 'utf8');

const old = '<Slide label="Daily steps" value={fd.daily_steps} min={0} max={20000} step={500} unit="k" fmt={v=>(v/1000).toFixed(0)} color={GREEN} onChange={v=>upd(\'daily_steps\',v)}/>';
const newCode = '<Slide label="Daily steps" value={fd.daily_steps} min={0} max={40000} step={1000} unit="k" fmt={v=>(v/1000).toFixed(0)} color={GREEN} onChange={v=>upd(\'daily_steps\',v)}/>';

if (c.includes(old)) {
  c = c.replace(old, newCode);
  fs.writeFileSync('pages/client/ClientCheckin.jsx', c);
  console.log('Done - steps max now 40000');
} else {
  console.log('NOT FOUND');
}
