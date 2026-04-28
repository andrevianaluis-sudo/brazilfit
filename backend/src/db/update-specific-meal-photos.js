const { getDb } = require('./database');

const db = getDb();

console.log('🖼️ Updating specific meal photos...');

const mealPhotoUpdates = {
  'Overnight Oats with Banana': 'https://images.unsplash.com/photo-1504308805006-0f7a5f1adea9?w=300&h=300&fit=crop',
  'Greek Yoghurt with Berries': 'https://images.unsplash.com/photo-1488477181356-fd2f1cf71ea9?w=300&h=300&fit=crop',
  'Banana and Peanut Butter': 'https://images.unsplash.com/photo-1571748982800-fa51082c2224?w=300&h=300&fit=crop',
  'Green Smoothie': 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=300&h=300&fit=crop',
  'Walnut and Berry Porridge': 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=300&h=300&fit=crop',
  'Chia Pudding': 'https://images.unsplash.com/photo-1502747812021-0ae746b6c23b?w=300&h=300&fit=crop',
  'Oat and Honey Energy Balls': 'https://images.unsplash.com/photo-1604152135912-04a022e23696?w=300&h=300&fit=crop',
  'Avocado and Egg Toast': 'https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=300&h=300&fit=crop',
  'Scrambled Eggs on Sourdough': 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=300&h=300&fit=crop',
  'Whey Protein Smoothie Bowl': 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=300&h=300&fit=crop',
};

let updated = 0;
let notFound = 0;

const stmt = db.prepare(`UPDATE meal_ideas SET photo_url = ? WHERE name = ?`);

for (const [mealName, photoUrl] of Object.entries(mealPhotoUpdates)) {
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
