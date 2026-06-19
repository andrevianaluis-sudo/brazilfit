const fs = require('fs');
let c = fs.readFileSync('pages/pt/PTProgressOverview.jsx', 'utf8');

const anchor = `                    {s.entries.map(e => (
                      <div key={e.id} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>`;

const calorieBlock = `                    {s.calories && (
                      <div style={{ background: 'rgba(76,175,80,0.1)', border: '1px solid rgba(76,175,80,0.25)', borderRadius: '10px', padding: '12px 14px', margin: '10px 0 14px' }}>
                        <div style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em', color: GREEN, textTransform: 'uppercase', marginBottom: '6px' }}>Calorie target · {s.calories.goal === 'gain' ? 'gain' : 'lose'} ({s.calories.goal === 'gain' ? '+' : '-'}{s.calories.deficit})</div>
                        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'baseline' }}>
                          <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>{s.calories.target}<span style={{ fontSize: '0.7rem', color: MUTED, fontWeight: 600 }}> kcal/day</span></span>
                          <span style={{ fontSize: '0.78rem', color: MUTED }}>BMR {s.calories.bmr} · Maintenance {s.calories.tdee}</span>
                        </div>
                      </div>
                    )}
                    {s.entries.map(e => (
                      <div key={e.id} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>`;

if (c.includes(anchor) && !c.includes('Calorie target ·')) {
  c = c.replace(anchor, calorieBlock);
  fs.writeFileSync('pages/pt/PTProgressOverview.jsx', c);
  console.log('Done - calorie target now shows on PT progress page');
} else {
  console.log(c.includes('Calorie target ·') ? 'Already exists' : 'Anchor NOT FOUND');
}
