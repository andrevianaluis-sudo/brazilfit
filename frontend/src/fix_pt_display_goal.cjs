const fs = require('fs');
let c = fs.readFileSync('pages/pt/PTProgressOverview.jsx', 'utf8');

const old = `<div style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em', color: GREEN, textTransform: 'uppercase', marginBottom: '6px' }}>Calorie target ({s.calories.deficit} deficit)</div>`;
const newCode = `<div style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em', color: GREEN, textTransform: 'uppercase', marginBottom: '6px' }}>Calorie target · {s.calories.goal === 'gain' ? 'gain' : 'lose'} ({s.calories.goal === 'gain' ? '+' : '-'}{s.calories.deficit})</div>`;

if (c.includes(old)) {
  c = c.replace(old, newCode);
  fs.writeFileSync('pages/pt/PTProgressOverview.jsx', c);
  console.log('Done - PT display shows goal direction');
} else {
  console.log('Anchor NOT FOUND');
}
