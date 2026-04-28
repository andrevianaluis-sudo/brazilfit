const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { getDb } = require('./database');
const MEALS_WITH_RECIPES = require('./meals-with-recipes');
// node:sqlite uses the same synchronous API as better-sqlite3

const db = getDb();

// Days: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function parseSchedule(scheduleStr) {
  const parts = scheduleStr.split(',').map(s => s.trim());
  return parts.map(part => {
    const dayMap = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 };
    const [day, time] = part.split(' ');
    return { day_of_week: dayMap[day], session_time: time };
  });
}

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function getNextOccurrence(fromDate, dayOfWeek, timeStr) {
  const d = new Date(fromDate);
  const currentDay = d.getDay();
  let daysUntil = dayOfWeek - currentDay;
  if (daysUntil < 0) daysUntil += 7;
  if (daysUntil === 0 && d.toISOString().split('T')[0] <= fromDate) daysUntil = 0;
  d.setDate(d.getDate() + daysUntil);
  return d.toISOString().split('T')[0];
}

function generateSessionDates(blockStartDate, scheduleItems, sessionsToGenerate) {
  const dates = [];
  let currentDate = blockStartDate;
  const sortedSchedule = [...scheduleItems].sort((a, b) => {
    if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week;
    return a.session_time.localeCompare(b.session_time);
  });

  // Find all occurrences across weeks
  const allOccurrences = [];
  for (let week = 0; week < 20; week++) {
    for (const item of sortedSchedule) {
      // Use T12:00:00 to avoid timezone-midnight UTC offset issues
      const d = new Date(blockStartDate + 'T12:00:00');
      const offset = (item.day_of_week - d.getDay() + 7) % 7;
      d.setDate(d.getDate() + (week * 7) + offset);
      const dateStr = d.toISOString().split('T')[0];
      if (dateStr >= blockStartDate) {
        allOccurrences.push({ date: dateStr, time: item.session_time, day: item.day_of_week });
      }
    }
  }

  allOccurrences.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.time.localeCompare(b.time);
  });

  const unique = [];
  const seen = new Set();
  for (const occ of allOccurrences) {
    const key = `${occ.date}-${occ.time}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(occ);
    }
  }

  return unique.slice(0, sessionsToGenerate);
}

async function seed() {
  console.log('🌱 Seeding BrazilFit database...');

  // Add missing columns to existing tables
  try {
    db.exec(`ALTER TABLE meal_ideas ADD COLUMN ingredients TEXT DEFAULT '[]';`);
  } catch (e) {
    // Column already exists
  }
  try {
    db.exec(`ALTER TABLE meal_ideas ADD COLUMN method TEXT DEFAULT '[]';`);
  } catch (e) {
    // Column already exists
  }
  try {
    db.exec(`ALTER TABLE meal_ideas ADD COLUMN protein DECIMAL DEFAULT 0;`);
  } catch (e) {
    // Column already exists
  }
  try {
    db.exec(`ALTER TABLE meal_ideas ADD COLUMN carbs DECIMAL DEFAULT 0;`);
  } catch (e) {
    // Column already exists
  }
  try {
    db.exec(`ALTER TABLE meal_ideas ADD COLUMN fat DECIMAL DEFAULT 0;`);
  } catch (e) {
    // Column already exists
  }
  try {
    db.exec(`CREATE TABLE IF NOT EXISTS shopping_list_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL REFERENCES clients(id),
      name TEXT NOT NULL,
      quantity TEXT,
      category TEXT DEFAULT 'PANTRY',
      is_checked INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );`);
  } catch (e) {
    // Table already exists
  }

  // Clear existing data
  db.exec('PRAGMA foreign_keys = OFF;');
  db.exec(`
    DELETE FROM wearable_data;
    DELETE FROM wearable_connections;
    DELETE FROM subscriptions;
    DELETE FROM challenge_participants;
    DELETE FROM weekly_challenges;
    DELETE FROM habit_logs;
    DELETE FROM progress_entries;
    DELETE FROM client_notes;
    DELETE FROM shopping_list_items;
    DELETE FROM client_meal_favorites;
    DELETE FROM meal_ideas;
    DELETE FROM nutrition_tips;
    DELETE FROM tip_of_week;
    DELETE FROM class_sessions;
    DELETE FROM classes;
    DELETE FROM sessions;
    DELETE FROM blocks;
    DELETE FROM client_schedules;
    DELETE FROM clients;
    DELETE FROM users;
  `);
  db.exec('PRAGMA foreign_keys = ON;');

  const passwordHash = await bcrypt.hash('BrazilFit2026!', 10);
  const ptPasswordHash = await bcrypt.hash('PTadmin2026!', 10);

  // Insert PT user
  const ptInsert = db.prepare(`
    INSERT INTO users (email, username, password_hash, role, name)
    VALUES (?, ?, ?, 'pt', ?)
  `);
  const ptResult = ptInsert.run('pt@brazilfit.co.uk', 'pt', ptPasswordHash, 'BrazilFit PT');
  const ptUserId = ptResult.lastInsertRowid;

  // Client data
  const clientsData = [
    { name: 'Vivien',   type: 'Online', price: 350, sessionsUsed: 6,  blockStart: '2026-03-13', schedule: 'Tue 07:00, Fri 08:00' },
    { name: 'Sue',      type: 'F2F',    price: 400, sessionsUsed: 3,  blockStart: '2026-03-19', schedule: 'Tue 11:00, Fri 12:00' },
    { name: 'Neil',     type: 'F2F',    price: 400, sessionsUsed: 3,  blockStart: '2026-03-19', schedule: 'Tue 10:00, Fri 11:00' },
    { name: 'Puja',     type: 'Online', price: 350, sessionsUsed: 0,  blockStart: '2026-04-13', schedule: 'Mon 16:15, Tue 16:15, Wed 17:15' },
    { name: 'Sharon',   type: 'F2F',    price: 400, sessionsUsed: 4,  blockStart: '2026-03-16', schedule: 'Mon 09:00, Wed 10:00, Fri 10:00' },
    { name: 'Jaqueta',  type: 'F2F',    price: 400, sessionsUsed: 6,  blockStart: '2026-03-17', schedule: 'Tue 09:00, Thu 09:00' },
    { name: 'Michelle', type: 'F2F',    price: 400, sessionsUsed: 2,  blockStart: '2026-03-25', schedule: 'Mon 07:00, Wed 07:00' },
    { name: 'Chrissie', type: 'F2F',    price: 400, sessionsUsed: 0,  blockStart: '2026-04-13', schedule: 'Mon 11:00, Thu 13:15' },
    { name: 'Lyin',     type: 'F2F',    price: 400, sessionsUsed: 8,  blockStart: '2026-03-11', schedule: 'Mon 13:00, Fri 13:00' },
    { name: 'Noah',     type: 'F2F',    price: 400, sessionsUsed: 8,  blockStart: '2026-03-04', schedule: 'Mon 14:00' },
    { name: 'James',    type: 'F2F',    price: 400, sessionsUsed: 8,  blockStart: '2026-03-05', schedule: 'Mon 17:15, Fri 18:15' },
    { name: 'Laura',    type: 'F2F',    price: 400, sessionsUsed: 8,  blockStart: '2026-03-05', schedule: 'Tue 18:15, Fri 18:15' },
    { name: 'Filomena', type: 'F2F',    price: 400, sessionsUsed: 1,  blockStart: '2026-03-25', schedule: 'Mon 18:15, Wed 18:15' },
    { name: 'Louisa',   type: 'F2F',    price: 400, sessionsUsed: 8,  blockStart: '2026-02-24', schedule: 'Mon 12:00, Wed 12:00' },
    { name: 'Chris',    type: 'F2F',    price: 400, sessionsUsed: 4,  blockStart: '2026-02-02', schedule: 'Wed 11:00' },
    { name: 'Andy',     type: 'F2F',    price: 400, sessionsUsed: 0,  blockStart: '2026-03-27', schedule: 'Fri 09:00' },
    { name: 'Lucy',     type: 'F2F',    price: 400, sessionsUsed: 0,  blockStart: '2026-04-14', schedule: 'Tue 08:00, Wed 08:00' },
    { name: 'Clare',    type: 'F2F',    price: 400, sessionsUsed: 9,  blockStart: '2026-02-26', schedule: 'Tue 14:00, Thu 10:00' },
  ];

  const userInsert = db.prepare(`
    INSERT INTO users (email, username, password_hash, role, name)
    VALUES (?, ?, ?, 'client', ?)
  `);
  const clientInsert = db.prepare(`
    INSERT INTO clients (user_id, client_type, block_price, current_block_number, block_start_date, sessions_used)
    VALUES (?, ?, ?, 1, ?, ?)
  `);
  const scheduleInsert = db.prepare(`
    INSERT INTO client_schedules (client_id, day_of_week, session_time) VALUES (?, ?, ?)
  `);
  const blockInsert = db.prepare(`
    INSERT INTO blocks (client_id, block_number, start_date, sessions_attended, amount_paid, payment_date, is_current)
    VALUES (?, 1, ?, ?, ?, ?, 1)
  `);
  const sessionInsert = db.prepare(`
    INSERT INTO sessions (client_id, block_id, scheduled_date, scheduled_time, status, session_type)
    VALUES (?, ?, ?, ?, ?, 'PT')
  `);

  const clientIds = {};
  const today = '2026-04-14';

  for (const c of clientsData) {
    const firstName = c.name.toLowerCase();
    const username = firstName;
    const email = `${firstName}@brazilfit.co.uk`;

    const userResult = userInsert.run(email, username, passwordHash, c.name);
    const userId = userResult.lastInsertRowid;

    const clientResult = clientInsert.run(userId, c.type, c.price, c.blockStart, c.sessionsUsed);
    const clientId = clientResult.lastInsertRowid;
    clientIds[c.name] = clientId;

    // Insert schedules
    const schedItems = parseSchedule(c.schedule);
    for (const item of schedItems) {
      scheduleInsert.run(clientId, item.day_of_week, item.session_time);
    }

    // Create block record
    const blockResult = blockInsert.run(clientId, c.blockStart, c.sessionsUsed, c.price, c.blockStart);
    const blockId = blockResult.lastInsertRowid;

    // Generate session records
    const allSessionDates = generateSessionDates(c.blockStart, schedItems, 10);

    for (let i = 0; i < allSessionDates.length; i++) {
      const sess = allSessionDates[i];
      let status;
      if (i < c.sessionsUsed) {
        status = 'attended';
      } else if (sess.date <= today) {
        status = 'upcoming'; // upcoming but in past means it hasn't been logged yet (edge case)
      } else {
        status = 'upcoming';
      }
      sessionInsert.run(clientId, blockId, sess.date, sess.time, status);
    }
  }

  // Add previous blocks for long-standing clients (Louisa, Chris, Clare, Lyin, Noah, James, Laura)
  const prevBlockData = [
    { name: 'Louisa',  blockNum: 0, start: '2025-11-24', attended: 10, amount: 400 },
    { name: 'Chris',   blockNum: 0, start: '2025-10-15', attended: 10, amount: 400 },
    { name: 'Clare',   blockNum: 0, start: '2025-11-20', attended: 10, amount: 400 },
    { name: 'Lyin',    blockNum: 0, start: '2025-12-01', attended: 10, amount: 400 },
    { name: 'Noah',    blockNum: 0, start: '2025-11-15', attended: 10, amount: 400 },
    { name: 'James',   blockNum: 0, start: '2025-11-20', attended: 10, amount: 400 },
    { name: 'Laura',   blockNum: 0, start: '2025-11-20', attended: 10, amount: 400 },
  ];

  const prevBlockInsert = db.prepare(`
    INSERT INTO blocks (client_id, block_number, start_date, end_date, sessions_attended, amount_paid, payment_date, is_current)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0)
  `);
  for (const pb of prevBlockData) {
    if (clientIds[pb.name]) {
      prevBlockInsert.run(clientIds[pb.name], pb.blockNum, pb.start, addDays(pb.start, 70), pb.attended, pb.amount, pb.start);
      // Update block number
      db.prepare(`UPDATE clients SET current_block_number = 2 WHERE id = ?`).run(clientIds[pb.name]);
    }
  }

  // Classes
  const classesData = [
    { name: 'Vision Support', day: 2, time: '12:30', payment_type: 'flat', flat_fee: 35 },
    { name: 'Dance',          day: 2, time: '19:15', payment_type: 'flat', flat_fee: 28 },
    { name: 'Pilates',        day: 3, time: '09:00', payment_type: 'flat', flat_fee: 28 },
    { name: 'Pilates',        day: 4, time: '11:45', payment_type: 'per_person', per_person_fee: 8, max_people: 12 },
    { name: 'Pilates',        day: 5, time: '19:15', payment_type: 'flat', flat_fee: 28 },
    { name: 'Pilates',        day: 6, time: '10:00', payment_type: 'flat', flat_fee: 28 },
    { name: 'Pilates',        day: 6, time: '11:00', payment_type: 'flat', flat_fee: 28 },
    { name: 'Meditation',     day: 6, time: '12:00', payment_type: 'flat', flat_fee: 28 },
  ];

  const classInsert = db.prepare(`
    INSERT INTO classes (name, day_of_week, class_time, payment_type, flat_fee, per_person_fee, max_people)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const classSessionInsert = db.prepare(`
    INSERT INTO class_sessions (class_id, session_date, attendees, total_earned)
    VALUES (?, ?, ?, ?)
  `);

  for (const cls of classesData) {
    const result = classInsert.run(cls.name, cls.day, cls.time, cls.payment_type, cls.flat_fee || null, cls.per_person_fee || null, cls.max_people || null);
    const classId = result.lastInsertRowid;

    // Generate 6 weeks of class sessions in the past
    for (let w = 6; w >= 1; w--) {
      // Find the date for this class in week w ago
      const baseDate = new Date('2026-04-14');
      baseDate.setDate(baseDate.getDate() - (w * 7));
      const dayDiff = cls.day - baseDate.getDay();
      const sessionDate = new Date(baseDate);
      sessionDate.setDate(baseDate.getDate() + dayDiff);
      if (sessionDate <= new Date('2026-04-14')) {
        const dateStr = sessionDate.toISOString().split('T')[0];
        const attendees = cls.max_people || null;
        const earned = cls.payment_type === 'per_person' ? (cls.per_person_fee * cls.max_people) : cls.flat_fee;
        classSessionInsert.run(classId, dateStr, attendees, earned);
      }
    }
  }

  // Nutrition Tips
  const tips = [
    { category: 'pre-workout', title: 'Power Up Before Training', content: 'Eat a banana or handful of oats 45–60 minutes before your session. Fast-releasing carbs give your muscles the fuel they need for peak performance. Avoid heavy meals within 2 hours of training.', is_featured: 1, featured_week: '2026-04-13' },
    { category: 'hydration', title: 'Hydration is Performance', content: 'Aim for 2–3 litres of water daily. Dehydration of just 2% impairs muscle function and focus. Add a pinch of sea salt and lemon to your water for electrolytes on training days.', is_featured: 0 },
    { category: 'recovery', title: 'Post-Workout Protein Window', content: 'Consume 20–30g of protein within 30–60 minutes after training. Good options: Greek yoghurt with berries, eggs on toast, or a protein shake with milk. This is when your muscles are primed for repair.', is_featured: 0 },
    { category: 'weight-loss', title: 'Eat More to Lose More', content: 'Chronic under-eating slows your metabolism. Aim for a modest 300–500 calorie deficit rather than extreme restriction. High volume, low calorie foods like vegetables keep you full while supporting fat loss.', is_featured: 0 },
    { category: 'muscle-gain', title: 'Progressive Protein', content: 'Aim for 1.6–2.2g of protein per kg of bodyweight daily when building muscle. Spread this evenly across 3–4 meals. Leucine-rich sources like eggs, chicken, and dairy are most effective for muscle protein synthesis.', is_featured: 0 },
    { category: 'general', title: 'The 80/20 Rule', content: 'Eat nutritious whole foods 80% of the time and enjoy treats guilt-free 20% of the time. Rigid diets fail long-term. Building sustainable habits around real food is what delivers lasting results.', is_featured: 0 },
    { category: 'hydration', title: 'Coffee and Caffeine', content: 'Caffeine can boost performance by 3–5% and improves focus during training. Optimal dose is 3–6mg per kg bodyweight taken 30–60 minutes before exercise. Cut off caffeine by 14:00 to protect sleep quality.', is_featured: 0 },
    { category: 'recovery', title: 'Sleep is Your Superpower', content: 'Growth hormone is released during deep sleep — this is when your body repairs muscle tissue. Aim for 7–9 hours. Poor sleep increases cortisol, drives sugar cravings, and slows fat loss. Prioritise sleep like you prioritise training.', is_featured: 0 },
    { category: 'pre-workout', title: 'Morning Training Fuel', content: 'Training fasted can work for short low-intensity sessions, but for strength work have a small carb-protein snack first. Try 2 rice cakes with peanut butter or a small Greek yoghurt with honey 30 minutes before.', is_featured: 0 },
    { category: 'weight-loss', title: 'Protein First', content: 'Start every meal with your protein source. Protein has the highest thermic effect of food, meaning your body burns more calories digesting it. It also keeps you fuller for longer and preserves muscle while in a calorie deficit.', is_featured: 0 },
    { category: 'muscle-gain', title: 'Carbs are Not the Enemy', content: 'Carbohydrates are your muscles preferred fuel source. When building muscle, carbs before and after training help performance and recovery. Focus on quality carbs: oats, rice, sweet potato, and fruit rather than processed options.', is_featured: 0 },
    { category: 'general', title: 'Rainbow Eating', content: 'Aim to eat at least 5 different colours of vegetables and fruit each day. Each colour represents different antioxidants and phytonutrients that support immunity, reduce inflammation, and improve overall health.', is_featured: 0 },
  ];

  const tipInsert = db.prepare(`
    INSERT INTO nutrition_tips (category, title, content, is_featured, featured_week, created_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const tip of tips) {
    const result = tipInsert.run(tip.category, tip.title, tip.content, tip.is_featured ? 1 : 0, tip.featured_week || null, ptUserId);
    if (tip.is_featured) {
      db.prepare(`INSERT INTO tip_of_week (tip_id, week_start) VALUES (?, ?)`).run(result.lastInsertRowid, '2026-04-13');
    }
  }

  // Meal Ideas
  const mealInsert = db.prepare(`
    INSERT INTO meal_ideas (name, calories, goal, emoji, description, photo_url, ingredients, method, protein, carbs, fat)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const meal of MEALS_WITH_RECIPES) {
    mealInsert.run(
      meal.name,
      meal.calories,
      meal.goal,
      meal.emoji,
      meal.description,
      meal.photo_url,
      JSON.stringify(meal.ingredients),
      JSON.stringify(meal.method),
      meal.protein,
      meal.carbs,
      meal.fat
    );
  }

  // Progress entries for some clients
  const progressData = [
    { name: 'Vivien', entries: [
      { date: '2026-03-13', weight: 72.4, waist: 78, hips: 96, chest: 88 },
      { date: '2026-03-20', weight: 71.9, waist: 77.5, hips: 95.5, chest: 87.5 },
      { date: '2026-03-27', weight: 71.2, waist: 77, hips: 95, chest: 87 },
      { date: '2026-04-03', weight: 70.8, waist: 76, hips: 94.5, chest: 86.5 },
      { date: '2026-04-10', weight: 70.1, waist: 75.5, hips: 94, chest: 86 },
    ]},
    { name: 'Sharon', entries: [
      { date: '2026-03-16', weight: 68.2, waist: 74, hips: 98, chest: 92 },
      { date: '2026-03-23', weight: 67.8, waist: 73.5, hips: 97.5, chest: 91.5 },
      { date: '2026-03-30', weight: 67.1, waist: 73, hips: 97, chest: 91 },
      { date: '2026-04-07', weight: 66.9, waist: 72.5, hips: 96.5, chest: 90.5 },
    ]},
    { name: 'Clare', entries: [
      { date: '2026-02-26', weight: 65.0, waist: 70, hips: 94, chest: 86 },
      { date: '2026-03-05', weight: 64.3, waist: 69.5, hips: 93.5, chest: 85.5 },
      { date: '2026-03-12', weight: 63.8, waist: 69, hips: 93, chest: 85 },
      { date: '2026-03-19', weight: 63.2, waist: 68.5, hips: 92.5, chest: 84.5 },
      { date: '2026-03-26', weight: 62.5, waist: 68, hips: 92, chest: 84 },
      { date: '2026-04-02', weight: 62.1, waist: 67.5, hips: 91.5, chest: 83.5 },
    ]},
    { name: 'Louisa', entries: [
      { date: '2026-02-24', weight: 79.5, waist: 85, hips: 104, chest: 96 },
      { date: '2026-03-03', weight: 78.8, waist: 84.5, hips: 103.5, chest: 95.5 },
      { date: '2026-03-10', weight: 78.1, waist: 84, hips: 103, chest: 95 },
      { date: '2026-03-17', weight: 77.6, waist: 83.5, hips: 102.5, chest: 94.5 },
      { date: '2026-03-24', weight: 77.0, waist: 83, hips: 102, chest: 94 },
      { date: '2026-03-31', weight: 76.4, waist: 82.5, hips: 101.5, chest: 93.5 },
      { date: '2026-04-07', weight: 75.9, waist: 82, hips: 101, chest: 93 },
    ]},
  ];

  const progressInsert = db.prepare(`
    INSERT INTO progress_entries (client_id, entry_date, weight_kg, waist_cm, hips_cm, chest_cm)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const pd of progressData) {
    const clientId = clientIds[pd.name];
    if (clientId) {
      for (const e of pd.entries) {
        progressInsert.run(clientId, e.date, e.weight, e.waist, e.hips, e.chest);
      }
    }
  }

  // Client notes from PT
  const notesData = [
    { name: 'Vivien', content: 'Vivien is making excellent progress with her strength. She mentioned shoulder niggle on 20 Mar — keep overhead movements light until fully resolved. Very motivated and consistent.', type: 'general' },
    { name: 'Sharon', content: 'Sharon responds really well to circuit training. She prefers not to do burpees due to knee history. Working on her confidence with weights — huge improvement over the last 4 sessions.', type: 'general' },
    { name: 'Clare', content: 'Clare is on session 9 — renewal conversation needed this week. She has been absolutely incredible, the consistency has really shown in her results. Discuss next block goals.', type: 'general' },
    { name: 'Lyin', content: 'Lyin is on session 8 — approaching renewal. She is very strong now and ready to progress to heavier compound lifts. Consider adding deadlifts next block.', type: 'general' },
    { name: 'Noah', content: 'Noah session 8 — renewal needed soon. Very coachable, great attitude. Focus next block on running performance alongside strength work.', type: 'general' },
    { name: 'Louisa', content: 'Louisa has lost 3.6kg in this block — she is thrilled. Keep the momentum going. She loves HIIT and responds well to step targets between sessions.', type: 'general' },
    { name: 'Puja', content: 'New client starting 13 April. Online via Zoom. Initial assessment call done — main goal is weight loss and improving energy levels. Moderate fitness level.', type: 'general' },
    { name: 'Chrissie', content: 'New client starting 13 April. Referred by Sharon. Complete beginner — build slowly and keep everything fun and achievable in the first few sessions.', type: 'general' },
    { name: 'Lucy', content: 'New client starting 14 April. Works shifts so schedule may vary occasionally. Very motivated, ran a 10k last year. Wants to build strength and lose some weight.', type: 'general' },
  ];

  const noteInsert = db.prepare(`
    INSERT INTO client_notes (client_id, created_by, note_type, content) VALUES (?, ?, ?, ?)
  `);
  for (const n of notesData) {
    const clientId = clientIds[n.name];
    if (clientId) {
      noteInsert.run(clientId, ptUserId, n.type, n.content);
    }
  }

  // Progress notes (encouragement)
  const progressNotes = [
    { name: 'Vivien', content: '🔥 Amazing work this week Vivien! Down 2.3kg since you started and your strength has gone through the roof. Keep up the incredible consistency — you are crushing it!' },
    { name: 'Clare', content: '⭐ Clare you have lost 2.9kg and your measurements are shrinking every single week. I am so proud of you — this is what consistent effort looks like. Nearly at your 3kg goal!' },
    { name: 'Louisa', content: '💪 Louisa — 3.6kg down and looking and feeling stronger than ever. Your dedication is genuinely inspiring. Let us push for the 4kg milestone next block!' },
    { name: 'Sharon', content: '✨ Sharon your technique on squats this week was perfect. The hard work is paying off. You should be really proud of how far you have come in just 4 sessions!' },
  ];

  const progNoteInsert = db.prepare(`
    INSERT INTO client_notes (client_id, created_by, note_type, content, is_progress_note) VALUES (?, ?, 'progress', ?, 1)
  `);
  for (const n of progressNotes) {
    const clientId = clientIds[n.name];
    if (clientId) {
      progNoteInsert.run(clientId, ptUserId, n.content);
    }
  }

  // Habit logs for some clients
  const habitDates = ['2026-04-08','2026-04-09','2026-04-10','2026-04-11','2026-04-12','2026-04-13','2026-04-14'];
  const habitInsert = db.prepare(`
    INSERT OR IGNORE INTO habit_logs (client_id, log_date, water_glasses, sleep_hours, steps, veg_portions, alcohol_free, mood_rating)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const habitsClients = ['Vivien', 'Sharon', 'Clare', 'Louisa'];
  for (const name of habitsClients) {
    const clientId = clientIds[name];
    if (!clientId) continue;
    for (let i = 0; i < habitDates.length; i++) {
      habitInsert.run(
        clientId, habitDates[i],
        Math.floor(Math.random() * 4) + 6,
        (Math.random() * 2 + 6.5).toFixed(1),
        Math.floor(Math.random() * 4000) + 7000,
        Math.floor(Math.random() * 3) + 3,
        Math.random() > 0.3 ? 1 : 0,
        Math.floor(Math.random() * 2) + 3
      );
    }
  }

  // Weekly challenge
  const challengeInsert = db.prepare(`
    INSERT INTO weekly_challenges (title, description, start_date, end_date)
    VALUES (?, ?, ?, ?)
  `);
  challengeInsert.run(
    '7-Day Hydration Challenge',
    'Hit 8 glasses of water every day this week. Track it in your habit log and see how much better you feel by Friday!',
    '2026-04-13',
    '2026-04-19'
  );

  // Pro subscriptions for Vivien and Clare
  const subInsert = db.prepare(`
    INSERT INTO subscriptions (client_id, plan, status, amount, current_period_start, current_period_end)
    VALUES (?, ?, 'active', ?, ?, ?)
  `);
  subInsert.run(clientIds['Vivien'], 'monthly', 999, '2026-03-13', '2026-04-13');
  subInsert.run(clientIds['Clare'], 'annual', 7999, '2026-02-26', '2027-02-26');

  // Update pro status
  db.prepare(`UPDATE clients SET is_pro = 1, pro_expires_at = '2026-04-13' WHERE id = ?`).run(clientIds['Vivien']);
  db.prepare(`UPDATE clients SET is_pro = 1, pro_expires_at = '2027-02-26' WHERE id = ?`).run(clientIds['Clare']);

  // Give all new clients 7-day pro trial
  for (const c of clientsData) {
    const clientId = clientIds[c.name];
    if (c.name === 'Puja' || c.name === 'Chrissie' || c.name === 'Lucy' || c.name === 'Andy') {
      db.prepare(`UPDATE clients SET is_pro = 1, pro_trial_used = 1, pro_expires_at = ? WHERE id = ?`)
        .run(addDays('2026-04-13', 7), clientId);
    }
  }

  console.log('✅ Database seeded successfully!');
  console.log('');
  console.log('🔑 LOGIN CREDENTIALS:');
  console.log('  PT Login:     username: pt        password: PTadmin2026!');
  console.log('  Client Login: username: vivien    password: BrazilFit2026!');
  console.log('  Client Login: username: claire    password: BrazilFit2026!');
  console.log('  (All clients use the same default password)');
  console.log('');
  console.log('🚀 Start the server: npm run dev');
}

seed().catch(console.error);
