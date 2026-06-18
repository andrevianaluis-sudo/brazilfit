const fs = require('fs');
const path = 'components/ExercisePickerModal.jsx';
let c = fs.readFileSync(path, 'utf8');

// Use a regex to collapse the double )} that appears before </div>
const bad = `          )}\n          )}\n        </div>`;
if (c.includes(bad)) {
  c = c.replace(bad, `          )}\n        </div>`);
  fs.writeFileSync(path, c);
  console.log('Fixed - removed stray )}');
} else {
  // Fallback: try with the span line as anchor
  const bad2 = `<span style={{ fontSize: 64 }}>{stretch ? '' : ''}</span>\n          )}\n          )}`;
  if (c.includes(bad2)) {
    c = c.replace(bad2, `<span style={{ fontSize: 64 }}>{stretch ? '' : ''}</span>\n          )}`);
    fs.writeFileSync(path, c);
    console.log('Fixed via fallback');
  } else {
    console.log('STILL NOT FOUND - manual fix needed');
  }
}
