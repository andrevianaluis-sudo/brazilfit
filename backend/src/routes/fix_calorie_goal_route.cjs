const fs = require('fs');
let c = fs.readFileSync('progress.js', 'utf8');
let steps = 0;

// 1. Update calcCalories to handle goal direction
const oldCalc = `  const deficit = p.deficit_preference || 500;
  const target = tdee - deficit;
  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    target: Math.round(target),
    deficit
  };
}`;
const newCalc = `  const amount = p.deficit_preference || 500;
  const goal = p.calorie_goal || 'lose';
  const target = goal === 'gain' ? tdee + amount : tdee - amount;
  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    target: Math.round(target),
    deficit: amount,
    goal
  };
}`;
if (c.includes(oldCalc)) { c = c.replace(oldCalc, newCalc); steps++; }

// 2. GET route - include calorie_goal in SELECT (both occurrences)
c = c.split('SELECT height_cm, age, sex, activity_level, deficit_preference FROM clients WHERE id = ?')
     .join('SELECT height_cm, age, sex, activity_level, deficit_preference, calorie_goal FROM clients WHERE id = ?');
steps++;

// 3. POST route - accept and save calorie_goal
const oldDestructure = `  const { height_cm, age, sex, activity_level, deficit_preference } = req.body;
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
    );`;
const newDestructure = `  const { height_cm, age, sex, activity_level, deficit_preference, calorie_goal } = req.body;
  db.prepare(\`UPDATE clients SET
    height_cm = COALESCE(?, height_cm),
    age = COALESCE(?, age),
    sex = COALESCE(?, sex),
    activity_level = COALESCE(?, activity_level),
    deficit_preference = COALESCE(?, deficit_preference),
    calorie_goal = COALESCE(?, calorie_goal)
    WHERE id = ?\`).run(
      height_cm != null ? parseFloat(height_cm) : null,
      age != null ? parseInt(age) : null,
      sex || null,
      activity_level || null,
      deficit_preference != null ? parseInt(deficit_preference) : null,
      calorie_goal || null,
      clientId
    );`;
if (c.includes(oldDestructure)) { c = c.replace(oldDestructure, newDestructure); steps++; }

fs.writeFileSync('progress.js', c);
console.log('Done -', steps, 'changes applied');
