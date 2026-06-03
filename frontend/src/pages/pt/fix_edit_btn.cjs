const fs = require('fs');
const lines = fs.readFileSync('PTSchedule.jsx', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<span onClick={()=>{setEditingTimeId(entry.id);setEditingTimeValue(entry.scheduled_time);}}') &&
      lines[i].includes('Tap to edit time')) {
    // Replace the span with a button
    lines[i] = `              <span style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.72rem',color:'#666'}}>{entry.scheduled_time}</span>
              <button onClick={(e)=>{e.stopPropagation();setEditingTimeId(entry.id);setEditingTimeValue(entry.scheduled_time);}} style={{background:'none',border:'none',cursor:'pointer',padding:'0 2px',minHeight:'auto',minWidth:'auto',display:'flex',alignItems:'center'}} title="Edit time">✏️</button>`;
    console.log('Fixed at line', i + 1);
    break;
  }
}

fs.writeFileSync('PTSchedule.jsx', lines.join('\n'));
console.log('Done');
