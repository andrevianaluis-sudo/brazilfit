const fs = require('fs');
const file = 'C:/Users/viana/BRAZILFIT/frontend/src/pages/client/ClientProgress.jsx';
let c = fs.readFileSync(file, 'utf8');

const oldBanner = "                  <div style={{ background:linear-gradient(135deg, \15, #FFD60010), border:1px solid \33, borderRadius:14, padding:'1rem 1.25rem', marginBottom:'1rem' }}>\n                    <p style={{ color:TEXT, fontSize:14, margin:0, lineHeight:1.6 }}>\n                      {weightChange !== null && weightChange < 0 ? ?? You have lost \kg since you started. Keep going! : weightChange !== null && weightChange > 0 ? ?? You have gained \kg ? muscle building in progress! : ?? Tracking \ check-ins over time.}\n                    </p>\n                  </div>";

const newBanner = "                  <div style={{ background:linear-gradient(135deg, \18, #FFD60008), border:1px solid \40, borderRadius:16, padding:'1rem 1.25rem', marginBottom:'1rem', display:'flex', alignItems:'center', gap:12 }}>\n                    <div style={{ fontSize:24, flexShrink:0 }}>{weightChange !== null && weightChange < 0 ? '\uD83D\uDD25' : weightChange !== null && weightChange > 0 ? '\uD83D\uDCAA' : '\uD83D\uDCCA'}</div>\n                    <p style={{ color:TEXT, fontSize:14, margin:0, lineHeight:1.6, fontWeight:500 }}>{weightChange !== null && weightChange < 0 ? You have lost \kg since you started. Keep going! : weightChange !== null && weightChange > 0 ? You have gained \kg \u2014 muscle building in progress! : Tracking \ check-ins over time.}</p>\n                  </div>";

if (c.includes(oldBanner)) {
  c = c.replace(oldBanner, newBanner);
  fs.writeFileSync(file, c, 'utf8');
  console.log('SUCCESS');
} else {
  console.log('NOT FOUND');
}
