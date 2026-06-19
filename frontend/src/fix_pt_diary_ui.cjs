const fs = require('fs');
let c = fs.readFileSync('pages/pt/PTClientProfile.jsx', 'utf8');
let steps = 0;

// 1. Add 'diary' to tabs array
const oldTabs = "const tabs = ['overview', 'sessions', 'cancellations', 'progress', 'photos', 'notes', 'messages', 'blocks', 'checkins', 'onboarding', 'assessment', 'programme', 'workouts'];";
const newTabs = "const tabs = ['overview', 'sessions', 'cancellations', 'progress', 'photos', 'diary', 'notes', 'messages', 'blocks', 'checkins', 'onboarding', 'assessment', 'programme', 'workouts'];";
if (c.includes(oldTabs)) { c = c.replace(oldTabs, newTabs); steps++; }

// 2. Add label
const oldLabels = "checkins:'Check-ins', onboarding:'Onboard',";
const newLabels = "checkins:'Check-ins', diary:'Food Diary', onboarding:'Onboard',";
if (c.includes(oldLabels)) { c = c.replace(oldLabels, newLabels); steps++; }

// 3. Add state for diary data near other state
if (!c.includes('diaryData')) {
  c = c.replace(
    "const [oneoffOpen, setOneoffOpen] = useState(false);",
    "const [oneoffOpen, setOneoffOpen] = useState(false);\n  const [diaryData, setDiaryData] = useState(null);"
  );
  steps++;
}

// 4. Load diary data when tab opens (hook into existing tab effect)
// Find the effect that loads on activeTab and add a branch
if (!c.includes("activeTab === 'diary'")) {
  c = c.replace(
    "if (activeTab === 'workouts') loadClientPlans();",
    "if (activeTab === 'workouts') loadClientPlans();\n    if (activeTab === 'diary') { api.get('/diary/pt/' + id).then(r => setDiaryData(r.data)).catch(() => setDiaryData({ entries: [], photosByDate: {} })); }"
  );
  steps++;
}

// 5. Add the tab render block — insert after the checkins tab block.
// Use the photos tab closing as anchor (right before notes typically). We'll anchor on the onboarding tab start.
const anchor = "        {activeTab === 'onboarding' && (";
const diaryBlock = `        {activeTab === 'diary' && (
          <div>
            {!diaryData ? (
              <p style={{color:'#606060',padding:'1rem'}}>Loading…</p>
            ) : diaryData.entries.length === 0 && Object.keys(diaryData.photosByDate || {}).length === 0 ? (
              <p style={{color:'#606060',padding:'1rem'}}>No food diary entries yet.</p>
            ) : (
              diaryData.entries.map((e, i) => {
                let meals = [];
                try { meals = JSON.parse(e.meals || '[]'); } catch(x) {}
                const totals = meals.reduce((a,m)=>({cal:a.cal+(parseInt(m.calories)||0),pro:a.pro+(parseInt(m.protein)||0)}),{cal:0,pro:0});
                const pics = (diaryData.photosByDate && diaryData.photosByDate[e.entry_date]) || [];
                return (
                  <div key={i} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'14px',marginBottom:'10px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
                      <span style={{fontWeight:700,color:'#fff',fontSize:'0.9rem'}}>{e.entry_date}</span>
                      <span style={{fontSize:'0.78rem',color:'#FF6B2B',fontWeight:700}}>{totals.cal} kcal · {totals.pro}g protein</span>
                    </div>
                    {meals.map((m,j)=>(
                      <div key={j} style={{fontSize:'0.8rem',color:'#ccc',padding:'3px 0',borderTop:j>0?'1px solid rgba(255,255,255,0.05)':'none'}}>
                        <span style={{color:'#888'}}>{m.time}:</span> {m.food||'—'} {m.calories?\`(\${m.calories} kcal)\`:''}
                      </div>
                    ))}
                    {pics.length > 0 && (
                      <div style={{display:'flex',gap:'6px',flexWrap:'wrap',marginTop:'10px'}}>
                        {pics.map(pid => (
                          <img key={pid} src={\`\${api.defaults.baseURL}/diary/photo/\${pid}?token=\${localStorage.getItem('brazilfit_token')}\`} alt="meal" style={{width:'64px',height:'64px',objectFit:'cover',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.1)'}}/>
                        ))}
                      </div>
                    )}
                    {e.notes && <p style={{fontSize:'0.78rem',color:'#aaa',marginTop:'8px',fontStyle:'italic'}}>"{e.notes}"</p>}
                    {(e.water_glasses != null) && <p style={{fontSize:'0.72rem',color:'#60a5fa',marginTop:'6px'}}>💧 {e.water_glasses} glasses water</p>}
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'onboarding' && (`;
if (c.includes(anchor) && !c.includes("activeTab === 'diary' &&")) {
  c = c.replace(anchor, diaryBlock); steps++;
}

fs.writeFileSync('pages/pt/PTClientProfile.jsx', c);
console.log('Done -', steps, 'of 6 changes applied');
