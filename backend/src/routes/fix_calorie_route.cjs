const fs = require('fs');
let c = fs.readFileSync('progress.js', 'utf8');

// Insert routes right after router.use(authenticateToken);
const anchor = "router.use(authenticateToken);";

const routes = `router.use(authenticateToken);

// --- Calorie profile + calculation ---
function calcCalories(p) {
  if (!p || !p.weight_kg || !p.height_cm || !p.age || !p.sex) return null;
  const w = p.weight_kg, h = p.height_cm, a = p.age;
  let bmr = 10 * w + 6.25 * h - 5 * a + (p.sex === 'male' ? 5 : -161);
  const factors = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
  const factor = factors[p.activity_level] || 1.2;
  const tdee = bmr * factor;
  const deficit = p.deficit_preference || 500;
  const target = tdee - deficit;
  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    target: Math.round(target),
    deficit
  };
}

// GET /progress/calorie-profile/:clientId
router.get('/calorie-profile/:clientId', (req, res) => {
  const db = getDb();
  const clientId = parseInt(req.params.clientId);
  const cl = db.prepare("SELECT height_cm, age, sex, activity_level, deficit_preference FROM clients WHERE id = ?").get(clientId);
  if (!cl) return res.status(404).json({ error: 'Client not found' });
  const latest = db.prepare("SELECT weight_kg FROM progress_entries WHERE client_id = ? AND weight_kg IS NOT NULL ORDER BY entry_date DESC LIMIT 1").get(clientId);
  const profile = { ...cl, weight_kg: latest ? latest.weight_kg : null };
  res.json({ profile, calories: calcCalories(profile) });
});

// POST /progress/calorie-profile/:clientId
router.post('/calorie-profile/:clientId', (req, res) => {
  const db = getDb();
  const clientId = parseInt(req.params.clientId);
  const { height_cm, age, sex, activity_level, deficit_preference } = req.body;
  db.prepare(\`UPDATE clients SET
    height_cm = COALESCE(?, height_cm),
    age = COALESCE(?, age),
    sex = COALESCE(?, sex),
    activity_level = COALESCE(?, activity_level),
    deficit_preference = COALESCE(?, deficit_preference)
    WHERE id = ?\`).run(
      height_cm != null ? parseFloat(height_cm) : null,
      age != null ? parseInt(age) : null,
      sex || null,
      activity_level || null,
      deficit_preference != null ? parseInt(deficit_preference) : null,
      clientId
    );
  const cl = db.prepare("SELECT height_cm, age, sex, activity_level, deficit_preference FROM clients WHERE id = ?").get(clientId);
  const latest = db.prepare("SELECT weight_kg FROM progress_entries WHERE client_id = ? AND weight_kg IS NOT NULL ORDER BY entry_date DESC LIMIT 1").get(clientId);
  const profile = { ...cl, weight_kg: latest ? latest.weight_kg : null };
  res.json({ profile, calories: calcCalories(profile) });
});
`;

if (c.includes(anchor) && !c.includes('calorie-profile')) {
  c = c.replace(anchor, routes);
  fs.writeFileSync('progress.js', c);
  console.log('Done - calorie routes added');
} else {
  console.log(c.includes('calorie-profile') ? 'Already exists' : 'Anchor NOT FOUND');
}
