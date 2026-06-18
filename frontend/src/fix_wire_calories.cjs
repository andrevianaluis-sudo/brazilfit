const fs = require('fs');
let c = fs.readFileSync('pages/client/ClientProgress.jsx', 'utf8');
let steps = 0;

// 1. Add import
if (!c.includes('CalorieCalculator')) {
  c = c.replace(
    "import PhotoGallery from '../../components/PhotoGallery';",
    "import PhotoGallery from '../../components/PhotoGallery';\nimport CalorieCalculator from './CalorieCalculator';"
  );
  steps++;
}

// 2. Add the tab button (after photos in the tab array)
const oldTabs = "{[{key:'progress',label:' Stats'},{key:'photos',label:' Photos'}].map(t => (";
const newTabs = "{[{key:'progress',label:' Stats'},{key:'photos',label:' Photos'},{key:'calories',label:' Calories'}].map(t => (";
if (c.includes(oldTabs)) {
  c = c.replace(oldTabs, newTabs);
  steps++;
}

// 3. Add the tab content before the closing of the inner container.
// Insert right after the photos block closes.
const anchor = `        {activeTab === 'photos' && (
          <div>
            <div style={{ marginBottom:'1rem', display:'flex', justifyContent:'flex-end' }}><PhotoUploadButton clientId={user.clientId} onUploadSuccess={() => setRefreshKey(k => k+1)}/></div>
            <BeforeAfterSlider key={refreshKey} clientId={user.clientId}/>
            <div style={{ marginTop:'1.5rem' }}><PhotoGallery key={refreshKey} clientId={user.clientId}/></div>
          </div>
        )}`;
const withCalories = anchor + `
        {activeTab === 'calories' && (
          <CalorieCalculator />
        )}`;
if (c.includes(anchor) && !c.includes("activeTab === 'calories'")) {
  c = c.replace(anchor, withCalories);
  steps++;
}

fs.writeFileSync('pages/client/ClientProgress.jsx', c);
console.log('Done -', steps, 'of 3 changes applied');
