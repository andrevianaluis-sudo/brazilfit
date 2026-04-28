const { getDb } = require('./database');
const MEAL_PHOTOS = require('./meal-photos');

const db = getDb();

console.log('🖼️ Updating meal photos...');

let updated = 0;
let notFound = 0;

const stmt = db.prepare(`UPDATE meal_ideas SET photo_url = ? WHERE name = ?`);

for (const [mealName, photoUrl] of Object.entries(MEAL_PHOTOS)) {
  const result = stmt.run(photoUrl, mealName);
  if (result.changes > 0) {
    updated++;
    console.log(`✓ ${mealName}`);
  } else {
    notFound++;
    console.log(`✗ ${mealName} (not found in database)`);
  }
}

console.log(`\n✅ Updated ${updated} meals with specific photos`);
if (notFound > 0) {
  console.log(`⚠️  ${notFound} meals not found in database`);
}
