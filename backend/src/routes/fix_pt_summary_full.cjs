const fs = require('fs');
let c = fs.readFileSync('pt.js', 'utf8');

// Find the existing progress-summary route and replace the whole block
const startMarker = "// GET /pt/progress-summary";
const endMarker = "router.get('/clients', (req, res) => {";

const startIdx = c.indexOf(startMarker);
const endIdx = c.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.log('Markers not found');
  process.exit(1);
}

const newRoute = `// GET /pt/progress-summary — all active clients with their full progress history
router.get('/progress-summary', authenticateToken, (req, res) => {
  const db = getDb();
  const clients = db.prepare(\`
    SELECT c.id as clientId, u.name as clientName,
           c.height_cm, c.age, c.sex, c.activity_level, c.deficit_preference, c.calorie_goal
    FROM clients c JOIN users u ON c.user_id = u.id
    WHERE u.is_active = 1
    ORDER BY u.name
  \`).all();

  const calcCals = (weight, cl) => {
    if (!weight || !cl.height_cm || !cl.age || !cl.sex) return null;
    let bmr = 10 * weight + 6.25 * cl.height_cm - 5 * cl.age + (cl.sex === 'male' ? 5 : -161);
    const factors = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
    const tdee = bmr * (factors[cl.activity_level] || 1.2);
    const amount = cl.deficit_preference || 500;
    const goal = cl.calorie_goal || 'lose';
    const target = goal === 'gain' ? tdee + amount : tdee - amount;
    return { bmr: Math.round(bmr), tdee: Math.round(tdee), target: Math.round(target), deficit: amount, goal };
  };

  const summary = clients.map(cl => {
    const entries = db.prepare(
      "SELECT id, entry_date, weight_kg, waist_cm, hips_cm, chest_cm, body_fat_pct, notes FROM progress_entries WHERE client_id = ? ORDER BY entry_date DESC"
    ).all(cl.clientId);
    let weightChange = null;
    if (entries.length >= 2) {
      const latest = entries[0];
      const first = entries[entries.length - 1];
      if (latest.weight_kg != null && first.weight_kg != null) {
        weightChange = parseFloat((latest.weight_kg - first.weight_kg).toFixed(1));
      }
    }
    const latestWeight = entries.find(e => e.weight_kg != null);
    return {
      clientId: cl.clientId,
      clientName: cl.clientName,
      entryCount: entries.length,
      latest: entries[0] || null,
      weightChange,
      calories: calcCals(latestWeight ? latestWeight.weight_kg : null, cl),
      entries
    };
  });

  res.json({ summary });
});

`;

c = c.substring(0, startIdx) + newRoute + c.substring(endIdx);
fs.writeFileSync('pt.js', c);
console.log('Done - progress-summary route replaced with calorie version');
