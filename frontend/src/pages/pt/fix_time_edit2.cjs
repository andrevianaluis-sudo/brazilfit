const fs = require('fs');
const lines = fs.readFileSync('PTSchedule.jsx', 'utf8').split('\n');
let count = 0;

// Fix 1: Add editingTime states after rescheduling state
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const [rescheduling, setRescheduling]') && 
      !lines[i+1].includes('editingTimeId')) {
    lines.splice(i + 1, 0, 
      "  const [editingTimeId, setEditingTimeId] = useState(null);",
      "  const [editingTimeValue, setEditingTimeValue] = useState('');"
    );
    count++;
    console.log('Fix 1 applied at line', i + 1);
    break;
  }
}

// Fix 2: Replace time display line with inline editable version
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('entry.scheduled_time} · Session {entry.sessions_used} of 10')) {
    lines[i] = `          <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
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
                style={{fontSize:'0.72rem',color:'#4CAF50',background:'transparent',border:'none',borderBottom:'1px solid #4CAF50',outline:'none',width:'80px',fontFamily:"'DM Sans',system-ui",padding:'0'}}
              />
            ) : (
              <span onClick={()=>{setEditingTimeId(entry.id);setEditingTimeValue(entry.scheduled_time);}}
                style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.72rem',color:'#666',cursor:'pointer'}}
                title="Tap to edit time"
              >{entry.scheduled_time}</span>
            )}
            <span style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.72rem',color:'#666'}}>· Session {entry.sessions_used} of 10 · {entry.sessions_remaining} remaining</span>
          </div>`;
    count++;
    console.log('Fix 2 applied at line', i + 1);
    break;
  }
}

fs.writeFileSync('PTSchedule.jsx', lines.join('\n'));
console.log('Done -', count, 'fixes applied');
