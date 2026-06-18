const fs = require('fs');
let c = fs.readFileSync('pt.js', 'utf8');

// Update the SELECT to include calorie_goal
const oldSel = `           c.height_cm, c.age, c.sex, c.activity_level, c.deficit_preference`;
const newSel = `           c.height_cm, c.age, c.sex, c.activity_level, c.deficit_preference, c.calorie_goal`;
let steps = 0;
if (c.includes(oldSel)) { c = c.replace(oldSel, newSel); steps++; }

// Update the calc helper to handle direction
const oldCalc = `    const tdee = bmr * (factors[cl.activity_level] || 1.2);
    const deficit = cl.deficit_preference || 500;
    return { bmr: Math.round(bmr), tdee: Math.round(tdee), target: Math.round(tdee - deficit), deficit };`;
const newCalc = `    const tdee = bmr * (factors[cl.activity_level] || 1.2);
    const amount = cl.deficit_preference || 500;
    const goal = cl.calorie_goal || 'lose';
    const target = goal === 'gain' ? tdee + amount : tdee - amount;
    return { bmr: Math.round(bmr), tdee: Math.round(tdee), target: Math.round(target), deficit: amount, goal };`;
if (c.includes(oldCalc)) { c = c.replace(oldCalc, newCalc); steps++; }

fs.writeFileSync('pt.js', c);
console.log('Done -', steps, 'of 2 changes applied');
