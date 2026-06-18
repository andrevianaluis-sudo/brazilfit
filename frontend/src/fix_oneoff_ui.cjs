const fs = require('fs');
let c = fs.readFileSync('pages/pt/PTClientProfile.jsx', 'utf8');
let steps = 0;

// 1. Add state for the one-off modal (after overrideTarget state)
const stateAnchor = "  const [overrideTarget, setOverrideTarget] = useState(null);";
const stateAdd = `  const [overrideTarget, setOverrideTarget] = useState(null);
  const [oneoffOpen, setOneoffOpen] = useState(false);
  const [oneoffDate, setOneoffDate] = useState('');
  const [oneoffTime, setOneoffTime] = useState('');
  const [oneoffSaving, setOneoffSaving] = useState(false);`;
if (c.includes(stateAnchor) && !c.includes('oneoffOpen')) {
  c = c.replace(stateAnchor, stateAdd); steps++;
}

// 2. Add the handler before loadClient
const handlerAnchor = "  const loadClient = async () => {";
const handlerAdd = `  const handleAddOneoff = async () => {
    if (!oneoffDate || !oneoffTime) { alert('Pick a date and time'); return; }
    setOneoffSaving(true);
    try {
      await api.post(\`/pt/clients/\${id}/add-oneoff\`, { date: oneoffDate, time: oneoffTime });
      setOneoffOpen(false); setOneoffDate(''); setOneoffTime('');
      await loadClient();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to add session');
    } finally {
      setOneoffSaving(false);
    }
  };

  const loadClient = async () => {`;
if (c.includes(handlerAnchor) && !c.includes('handleAddOneoff')) {
  c = c.replace(handlerAnchor, handlerAdd); steps++;
}

// 3. Add the button at the top of the sessions tab
const btnAnchor = `        {activeTab === 'sessions' && (
          <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>`;
const btnAdd = `        {activeTab === 'sessions' && (
          <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
            <button onClick={() => setOneoffOpen(true)} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"6px",padding:"0.7rem",background:"rgba(76,175,80,0.1)",border:"1px solid rgba(76,175,80,0.3)",borderRadius:"10px",color:"#4CAF50",fontSize:"0.8rem",fontWeight:700,cursor:"pointer",marginBottom:"4px"}}>+ Add one-off session</button>`;
if (c.includes(btnAnchor) && !c.includes('Add one-off session')) {
  c = c.replace(btnAnchor, btnAdd); steps++;
}

// 4. Add the modal near the override modal. Find the closing of the component return — insert before the overrideTarget modal if present, else before final closing.
const modalAnchor = "      {overrideTarget && (";
const modalAdd = `      {oneoffOpen && (
        <div onClick={() => setOneoffOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"1rem"}}>
          <div onClick={e => e.stopPropagation()} style={{background:"#1a1a1a",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"16px",padding:"1.5rem",maxWidth:"360px",width:"100%"}}>
            <h3 style={{fontSize:"1.1rem",fontWeight:700,color:"#fff",margin:"0 0 4px"}}>Add one-off session</h3>
            <p style={{fontSize:"0.78rem",color:"#888",margin:"0 0 1rem"}}>This counts toward the block of 10. The last scheduled session will be removed to keep the total at 10.</p>
            <label style={{fontSize:"0.7rem",color:"#888",display:"block",marginBottom:"4px"}}>Date</label>
            <input type="date" value={oneoffDate} onChange={e=>setOneoffDate(e.target.value)} style={{width:"100%",padding:"0.6rem",background:"#0f0f0f",border:"1px solid rgba(255,255,255,0.15)",borderRadius:"8px",color:"#fff",marginBottom:"0.8rem"}} />
            <label style={{fontSize:"0.7rem",color:"#888",display:"block",marginBottom:"4px"}}>Time</label>
            <input type="time" value={oneoffTime} onChange={e=>setOneoffTime(e.target.value)} style={{width:"100%",padding:"0.6rem",background:"#0f0f0f",border:"1px solid rgba(255,255,255,0.15)",borderRadius:"8px",color:"#fff",marginBottom:"1.2rem"}} />
            <div style={{display:"flex",gap:"8px"}}>
              <button onClick={() => setOneoffOpen(false)} style={{flex:1,padding:"0.7rem",background:"none",border:"1px solid rgba(255,255,255,0.15)",borderRadius:"8px",color:"#888",fontWeight:600,cursor:"pointer"}}>Cancel</button>
              <button onClick={handleAddOneoff} disabled={oneoffSaving} style={{flex:1,padding:"0.7rem",background:"#4CAF50",border:"none",borderRadius:"8px",color:"#000",fontWeight:700,cursor:"pointer"}}>{oneoffSaving ? 'Adding…' : 'Add session'}</button>
            </div>
          </div>
        </div>
      )}

      {overrideTarget && (`;
if (c.includes(modalAnchor) && !c.includes('Add one-off session</h3>')) {
  c = c.replace(modalAnchor, modalAdd); steps++;
}

fs.writeFileSync('pages/pt/PTClientProfile.jsx', c);
console.log('Done -', steps, 'of 4 changes applied');
