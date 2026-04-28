const { getDb } = require('./database');

const db = getDb();

console.log('🥗 Seeding nutrition tips...');

const tips = [
  // PRE-WORKOUT
  { category: 'pre-workout', title: 'Complex Carbs Are Your Friend', content: 'Eat oats, rice, or sweet potato 2 hours before training for sustained energy. Complex carbs provide a steady release of glucose that fuels your workout without the crash.' },
  { category: 'pre-workout', title: 'Avoid High Fat Before Training', content: 'High fat meals slow digestion and can cause discomfort during exercise. Stick to carbs and lean protein in your pre-workout meal for optimal performance.' },
  { category: 'pre-workout', title: 'Coffee Boost Your Performance', content: 'Coffee 30 minutes before training can boost performance by up to 12%. Caffeine increases alertness, reduces perceived effort, and improves endurance.' },
  { category: 'pre-workout', title: 'Hydrate Before You Start', content: 'Even mild dehydration reduces strength and endurance. Drink water throughout the day and have 500ml 2-3 hours before training.' },
  { category: 'pre-workout', title: 'Timing Your Pre-Workout Snack', content: 'A small protein and carb snack 30-60 minutes before is ideal for most people. Think banana with peanut butter or Greek yogurt with berries.' },

  // HYDRATION
  { category: 'hydration', title: 'Hydrate First Thing in the Morning', content: 'Drink 500ml of water first thing every morning before coffee or food. After 8 hours of sleep, your body is dehydrated and needs rehydration.' },
  { category: 'hydration', title: 'Your Urine Tells the Truth', content: 'Your urine colour tells you everything — pale yellow means well hydrated, dark yellow means drink more. It is the simplest hydration indicator available.' },
  { category: 'hydration', title: 'Electrolytes During Intense Sessions', content: 'Add electrolytes to your water during intense sessions lasting over 60 minutes. Sodium helps retain water and maintains muscle function during prolonged exercise.' },
  { category: 'hydration', title: 'Thirst is Already Dehydration', content: 'Thirst is already a sign of dehydration — drink before you feel thirsty. By the time you feel thirsty, performance has already been affected.' },
  { category: 'hydration', title: 'Herbal Teas Count Toward Hydration', content: 'Herbal teas count toward your daily fluid intake — try peppermint or ginger. Herbal teas are caffeine-free and provide additional benefits like digestion support.' },

  // RECOVERY
  { category: 'recovery', title: 'Sleep is Your Superpower', content: 'Sleep is your most powerful recovery tool — aim for 7 to 9 hours every night. Growth hormone is released during sleep and that is when muscle repair happens.' },
  { category: 'recovery', title: 'Active Recovery Beats Complete Rest', content: 'Active recovery like walking or gentle stretching reduces soreness better than complete rest. Light movement increases blood flow to muscles promoting faster recovery.' },
  { category: 'recovery', title: 'Cold Exposure Reduces Inflammation', content: 'Cold exposure after training reduces inflammation — even a cold shower for 2 minutes helps. Ice baths have been shown to reduce muscle soreness and accelerate recovery.' },
  { category: 'recovery', title: 'Magnesium for Muscle Recovery', content: 'Magnesium rich foods like spinach, nuts, and dark chocolate support muscle recovery. Magnesium helps relax muscles and improves sleep quality for better overnight repair.' },
  { category: 'recovery', title: 'Foam Rolling Post-Workout', content: 'Foam rolling for 10 minutes after training improves circulation and reduces next day soreness. It breaks down adhesions and increases blood flow to worked muscles.' },

  // WEIGHT-LOSS
  { category: 'weight-loss', title: 'Protein at Every Meal', content: 'Eat protein at every meal — it keeps you full and preserves muscle while losing fat. Protein has the highest thermic effect meaning your body burns calories digesting it.' },
  { category: 'weight-loss', title: 'Fibre is Your Secret Weapon', content: 'Fibre is your secret weapon — vegetables, beans, and oats keep hunger at bay for hours. Fibre slows digestion and keeps blood sugar stable preventing energy crashes.' },
  { category: 'weight-loss', title: 'Never Skip Breakfast', content: 'People who eat breakfast consume fewer calories throughout the day. Breakfast stabilises blood sugar and reduces cravings for sugary snacks later.' },
  { category: 'weight-loss', title: 'Meal Prep on Sundays', content: 'Meal prep on Sundays to avoid poor food choices during busy weekdays. When healthy food is ready to eat, you are far more likely to choose it.' },
  { category: 'weight-loss', title: 'Eat Slowly Without Distractions', content: 'Eat slowly and without distractions — it takes 20 minutes for your brain to register fullness. Mindful eating prevents overeating and improves digestion.' },

  // MUSCLE-GAIN
  { category: 'muscle-gain', title: 'Protein Intake for Growth', content: 'Aim for 1.6 to 2.2 grams of protein per kilogram of bodyweight daily for maximum muscle growth. Protein provides amino acids needed for muscle protein synthesis.' },
  { category: 'muscle-gain', title: 'Progressive Overload is Key', content: 'Progressive overload is the key to muscle growth — increase weight or reps each week. Your muscles adapt quickly so constantly challenging them is essential.' },
  { category: 'muscle-gain', title: 'Creatine for Strength', content: 'Creatine is the most research-backed supplement for strength and muscle gain. It improves ATP production allowing for more reps and increased muscle damage stimulating growth.' },
  { category: 'muscle-gain', title: 'Calorie Surplus for Muscle', content: 'Eat in a slight calorie surplus of 200-300 calories above maintenance to build muscle without excess fat. Too large a surplus and you will gain too much fat.' },
  { category: 'muscle-gain', title: 'Carbs Fuel Muscle Building', content: 'Carbohydrates are essential for muscle building — they fuel your workouts and replenish glycogen stores. Without adequate carbs your strength and endurance suffer.' },

  // GENERAL
  { category: 'general', title: 'Cook More Meals at Home', content: 'Cook more meals at home — restaurant meals average 3 times more calories than home cooked food. Home cooking gives you control over ingredients and portions.' },
  { category: 'general', title: 'Read Your Food Labels', content: 'Read food labels — ingredients are listed by weight so the first ingredient is the most abundant. Understanding what you eat is the foundation of good nutrition.' },
  { category: 'general', title: 'Consistency Over Perfection', content: 'Healthy eating is 80% consistency, not perfection — one bad meal does not ruin your progress. One healthy meal does not make you healthy either. It is the pattern that matters.' },
  { category: 'general', title: 'Eat the Rainbow', content: 'Eating the rainbow means getting a wide variety of vitamins and antioxidants from colourful vegetables and fruits. Different colours contain different phytochemicals so variety is key.' },
  { category: 'general', title: 'Plan Your Weekly Meals', content: 'Plan your meals for the week every Sunday — people who plan eat healthier and save money. Meal planning removes the decision fatigue that leads to poor food choices.' },
  { category: 'general', title: 'Drink Water Throughout the Day', content: 'Make water your default beverage — most people are chronically dehydrated. Aim for 2-3 litres daily depending on activity level and climate.' },
  { category: 'general', title: 'Understand Your Hunger Signals', content: 'Learn to distinguish between physical hunger and emotional eating. Pause when you want to eat and ask yourself if you are truly hungry or just bored stressed or tired.' },
  { category: 'general', title: 'Shop the Perimeter of the Store', content: 'Shop the perimeter of the grocery store where whole foods live — avoid the processed centre aisles. The healthiest foods are usually unbranded whole foods.' },
];

const insertTip = db.prepare(`
  INSERT INTO nutrition_tips (category, title, content, is_featured)
  VALUES (?, ?, ?, ?)
`);

let added = 0;
let skipped = 0;

for (const tip of tips) {
  // Check if tip already exists
  const existing = db.prepare(`
    SELECT id FROM nutrition_tips WHERE title = ? AND category = ?
  `).get(tip.title, tip.category);

  if (!existing) {
    insertTip.run(tip.category, tip.title, tip.content, 0);
    added++;
    console.log(`✓ ${tip.title}`);
  } else {
    skipped++;
  }
}

const totalCount = db.prepare('SELECT COUNT(*) as count FROM nutrition_tips').get();
console.log(`\n✅ Added ${added} new tips`);
console.log(`⏭️  Skipped ${skipped} duplicate tips`);
console.log(`📚 Total tips in database: ${totalCount.count}`);
