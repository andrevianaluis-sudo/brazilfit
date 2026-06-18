const fs = require('fs');

// 1. Fix the api import path in PTCheckins.jsx
let checkins = fs.readFileSync('pages/pt/PTCheckins.jsx', 'utf8');
checkins = checkins.replace("from '../../services/api'", "from '../../utils/api'");
fs.writeFileSync('pages/pt/PTCheckins.jsx', checkins);
console.log('Fixed api import path');

// 2. Fix the duplicate borderBottom key in PTClientProfile.jsx
let profile = fs.readFileSync('pages/pt/PTClientProfile.jsx', 'utf8');
const dup = 'style={{flexShrink:0,padding:"10px 12px",fontSize:"0.72rem",fontWeight:500,textTransform:"capitalize",whiteSpace:"nowrap",borderBottom:activeTab===tab?"2px solid #4CAF50":"2px solid transparent",color:activeTab===tab?"#4CAF50":"#888",background:"none",border:"none",borderBottom:activeTab===tab?"2px solid #4CAF50":"2px solid transparent",cursor:"pointer"}}';
const fixed = 'style={{flexShrink:0,padding:"10px 12px",fontSize:"0.72rem",fontWeight:500,textTransform:"capitalize",whiteSpace:"nowrap",color:activeTab===tab?"#4CAF50":"#888",background:"none",border:"none",borderBottom:activeTab===tab?"2px solid #4CAF50":"2px solid transparent",cursor:"pointer"}}';
if (profile.includes(dup)) {
  profile = profile.replace(dup, fixed);
  fs.writeFileSync('pages/pt/PTClientProfile.jsx', profile);
  console.log('Fixed duplicate borderBottom key');
} else {
  console.log('borderBottom dup not found (may already be fixed)');
}

console.log('Done');
