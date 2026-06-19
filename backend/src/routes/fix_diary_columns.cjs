const fs = require('fs');
let c = fs.readFileSync('diary.js', 'utf8');
let steps = 0;

// 1. Fix the UPDATE - remove updated_at = datetime('now')
const oldUpdate = "SET food_description = ?, water_glasses = ?, mood_before_eating = ?, mood_after_eating = ?, reflection_notes = ?, updated_at = datetime('now') WHERE id = ?";
const newUpdate = "SET food_description = ?, water_glasses = ?, mood_before_eating = ?, mood_after_eating = ?, reflection_notes = ? WHERE id = ?";
if (c.includes(oldUpdate)) { c = c.replace(oldUpdate, newUpdate); steps++; }

// 2. Fix the GET /:date route to return proper column names mapped to what frontend expects
const oldGet = "const entry = db.prepare(`SELECT * FROM food_mood_entries WHERE client_id = ? AND entry_date = ? ORDER BY created_at DESC LIMIT 1`).get(clientId, req.params.date);\n  res.json(entry || null);";
const newGet = `const row = db.prepare(\`SELECT * FROM food_mood_entries WHERE client_id = ? AND entry_date = ? ORDER BY created_at DESC LIMIT 1\`).get(clientId, req.params.date);
  if (!row) return res.json(null);
  res.json({
    meals: row.food_description,
    water_glasses: row.water_glasses,
    mood_before: row.mood_before_eating,
    mood_after: row.mood_after_eating,
    notes: row.reflection_notes
  });`;
if (c.includes(oldGet)) { c = c.replace(oldGet, newGet); steps++; }

// 3. Fix PT route to read correct columns
const oldPt = "SELECT entry_date, meals, water_glasses, mood_before, mood_after, notes FROM food_mood_entries WHERE client_id = ? ORDER BY entry_date DESC LIMIT 30";
const newPt = "SELECT entry_date, food_description as meals, water_glasses, mood_before_eating as mood_before, mood_after_eating as mood_after, reflection_notes as notes FROM food_mood_entries WHERE client_id = ? ORDER BY entry_date DESC LIMIT 30";
if (c.includes(oldPt)) { c = c.replace(oldPt, newPt); steps++; }

fs.writeFileSync('diary.js', c);
console.log('Done -', steps, 'of 3 changes applied');
