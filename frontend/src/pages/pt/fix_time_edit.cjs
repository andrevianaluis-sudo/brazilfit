const fs = require('fs');
let c = fs.readFileSync('PTSchedule.jsx', 'utf8');
let count = 0;

// Fix 1: Add editingTime states
const old1 = `  const [rescheduleSession, setRescheduleSession] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');`;

const new1 = `  const [rescheduleSession, setRescheduleSession] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [editingTimeId, setEditingTimeId] = useState(null);
  const [editingTimeValue, setEditingTimeValue] = useState('');`;

if (c.includes(old1)) { c = c.replace(old1, new1); count++; console.log('Fix 1 applied'); }
else console.log('Fix 1 NOT FOUND');

// Fix 2: Replace time display with inline editable version
const old2 = `          <p style={{ fontFamily:\\"'DM Sans', system-ui\\", fontSize:'0.72rem', color:MUTED, margin:0 }}>{entry.scheduled_time} · Session {entry.sessions_used} of 10 · {entry.sessions_remaining} remaining</p>`;

const new2 = `          <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
            {editingTimeId === entry.id ? (
              <input type="time" value={editingTimeValue} onChange={e=>setEditingTimeValue(e.target.value)}
                autoFocus
                onBlur={async()=>{
                  if(editingTimeValue && editingTimeValue !== entry.scheduled_time){
                    try{
                      await api.put(\`/sessions/\${entry.id}/reschedule\`,{new_date:entry.scheduled_date,new_time:editingTimeValue});
                      toast.success('Time updated');
                      fetchSchedule();
                    }catch{toast.error('Failed to update time');}
                  }
                  setEditingTimeId(null);
                }}
                onKeyDown={e=>{if(e.key==='Escape')setEditingTimeId(null);}}
                style={{fontSize:'0.72rem',color:GREEN,background:'transparent',border:'none',borderBottom:\`1px solid \${GREEN}\`,outline:'none',width:'80px',fontFamily:"'DM Sans',system-ui",padding:'0'}}
              />
            ) : (
              <span onClick={()=>{setEditingTimeId(entry.id);setEditingTimeValue(entry.scheduled_time);}}
                style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.72rem',color:MUTED,cursor:'pointer',borderBottom:'1px dashed transparent'}}
                onMouseEnter={e=>e.currentTarget.style.borderBottomColor=MUTED}
                onMouseLeave={e=>e.currentTarget.style.borderBottomColor='transparent'}
                title="Tap to edit time"
              >{entry.scheduled_time}</span>
            )}
            <span style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.72rem',color:MUTED}}>· Session {entry.sessions_used} of 10 · {entry.sessions_remaining} remaining</span>
          </div>`;

if (c.includes(old2)) { c = c.replace(old2, new2); count++; console.log('Fix 2 applied'); }
else console.log('Fix 2 NOT FOUND');

fs.writeFileSync('PTSchedule.jsx', c);
console.log('Done -', count, 'fixes applied');
