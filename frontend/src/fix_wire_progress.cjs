// Run from C:\Users\viana\BRAZILFIT\frontend\src
const fs = require('fs');
let steps = 0;

// 1. App.jsx - import + route
let app = fs.readFileSync('App.jsx', 'utf8');
if (!app.includes('PTProgressOverview')) {
  app = app.replace(
    "import PTCheckins from './pages/pt/PTCheckins';",
    "import PTCheckins from './pages/pt/PTCheckins';\nimport PTProgressOverview from './pages/pt/PTProgressOverview';"
  );
  steps++;
}
if (!app.includes('path="progress-overview"')) {
  app = app.replace(
    '<Route path="checkins" element={<PTCheckins />} />',
    '<Route path="checkins" element={<PTCheckins />} />\n        <Route path="progress-overview" element={<PTProgressOverview />} />'
  );
  steps++;
}
fs.writeFileSync('App.jsx', app);

// 2. PTLayout.jsx - nav item below Check-ins
let layout = fs.readFileSync('pages/pt/PTLayout.jsx', 'utf8');
if (!layout.includes('TrendingUp')) {
  layout = layout.replace(
    "  BookOpen, Dumbbell, ChevronRight, Package, PlayCircle, ClipboardCheck\n} from 'lucide-react';",
    "  BookOpen, Dumbbell, ChevronRight, Package, PlayCircle, ClipboardCheck, TrendingUp\n} from 'lucide-react';"
  );
  steps++;
}
if (!layout.includes("label: 'Progress'")) {
  layout = layout.replace(
    "{ icon: ClipboardCheck, label: 'Check-ins', to: '/pt/checkins'              },",
    "{ icon: ClipboardCheck, label: 'Check-ins', to: '/pt/checkins'              },\n  { icon: TrendingUp,  label: 'Progress',   to: '/pt/progress-overview'        },"
  );
  steps++;
}
fs.writeFileSync('pages/pt/PTLayout.jsx', layout);

// 3. Enhance per-client progress tab: add body fat + notes
let profile = fs.readFileSync('pages/pt/PTClientProfile.jsx', 'utf8');
const oldTab = `                <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-grey-200">
                  {p.waist_cm && <span>Waist: {p.waist_cm}cm</span>}
                  {p.hips_cm && <span>Hips: {p.hips_cm}cm</span>}
                  {p.chest_cm && <span>Chest: {p.chest_cm}cm</span>}
                </div>`;
const newTab = `                <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-grey-200">
                  {p.waist_cm && <span>Waist: {p.waist_cm}cm</span>}
                  {p.hips_cm && <span>Hips: {p.hips_cm}cm</span>}
                  {p.chest_cm && <span>Chest: {p.chest_cm}cm</span>}
                  {p.body_fat_pct && <span>Body Fat: {p.body_fat_pct}%</span>}
                </div>
                {p.notes && <p style={{fontSize:"0.75rem",color:"#aaa",marginTop:"6px",fontStyle:"italic"}}>"{p.notes}"</p>}`;
if (profile.includes(oldTab)) {
  profile = profile.replace(oldTab, newTab);
  steps++;
}
fs.writeFileSync('pages/pt/PTClientProfile.jsx', profile);

console.log('Done -', steps, 'of 5 changes applied');
