const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const DB_PATH = process.env.DB_PATH || './brazilfit.db';
const dbPath = path.resolve(__dirname, '../../', DB_PATH);

let db;

function getDb() {
  if (!db) {
    db = new DatabaseSync(dbPath);
    db.exec('PRAGMA journal_mode = WAL');
    db.exec('PRAGMA foreign_keys = ON');
    initSchema();
    runMigrations();
seedStretchingGifs();
  }
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'client',
      name TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      reset_token TEXT,
      reset_token_expires INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL REFERENCES users(id),
      phone TEXT,
      client_type TEXT NOT NULL DEFAULT 'F2F',
      block_price INTEGER NOT NULL DEFAULT 400,
      current_block_number INTEGER DEFAULT 1,
      block_start_date TEXT,
      sessions_used INTEGER DEFAULT 0,
      is_pro INTEGER DEFAULT 0,
      pro_trial_used INTEGER DEFAULT 0,
      pro_expires_at TEXT,
      stripe_customer_id TEXT,
      joined_date TEXT DEFAULT (date('now')),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS client_schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL REFERENCES clients(id),
      day_of_week INTEGER NOT NULL,
      session_time TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS blocks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL REFERENCES clients(id),
      block_number INTEGER NOT NULL DEFAULT 1,
      start_date TEXT NOT NULL,
      end_date TEXT,
      sessions_attended INTEGER DEFAULT 0,
      sessions_missed INTEGER DEFAULT 0,
      amount_paid INTEGER NOT NULL,
      payment_date TEXT,
      is_current INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL REFERENCES clients(id),
      block_id INTEGER REFERENCES blocks(id),
      scheduled_date TEXT NOT NULL,
      scheduled_time TEXT NOT NULL,
      status TEXT DEFAULT 'upcoming',
      session_type TEXT DEFAULT 'PT',
      notes TEXT,
      auto_marked INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      day_of_week INTEGER NOT NULL,
      class_time TEXT NOT NULL,
      payment_type TEXT NOT NULL DEFAULT 'flat',
      flat_fee INTEGER,
      per_person_fee INTEGER,
      max_people INTEGER,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS class_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      class_id INTEGER NOT NULL REFERENCES classes(id),
      session_date TEXT NOT NULL,
      attendees INTEGER,
      total_earned INTEGER,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS nutrition_tips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL DEFAULT 'general',
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      is_featured INTEGER DEFAULT 0,
      featured_week TEXT,
      created_by INTEGER REFERENCES users(id),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS meal_ideas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      calories INTEGER,
      goal TEXT,
      emoji TEXT DEFAULT '??',
      photo_url TEXT,
      description TEXT,
      ingredients TEXT DEFAULT '[]',
      method TEXT DEFAULT '[]',
      protein DECIMAL DEFAULT 0,
      carbs DECIMAL DEFAULT 0,
      fat DECIMAL DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS client_meal_favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL REFERENCES clients(id),
      meal_id INTEGER NOT NULL REFERENCES meal_ideas(id),
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(client_id, meal_id)
    );

    CREATE TABLE IF NOT EXISTS shopping_list_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL REFERENCES clients(id),
      name TEXT NOT NULL,
      quantity TEXT,
      category TEXT DEFAULT 'PANTRY',
      is_checked INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS client_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL REFERENCES clients(id),
      created_by INTEGER REFERENCES users(id),
      note_type TEXT DEFAULT 'general',
      content TEXT NOT NULL,
      is_progress_note INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS progress_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL REFERENCES clients(id),
      entry_date TEXT NOT NULL,
      weight_kg REAL,
      waist_cm REAL,
      hips_cm REAL,
      chest_cm REAL,
      body_fat_pct REAL,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS progress_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL REFERENCES clients(id),
      photo_data BLOB NOT NULL,
      angle TEXT NOT NULL,
      upload_date TEXT NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS habit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL REFERENCES clients(id),
      log_date TEXT NOT NULL,
      water_glasses INTEGER DEFAULT 0,
      sleep_hours REAL DEFAULT 0,
      steps INTEGER DEFAULT 0,
      veg_portions INTEGER DEFAULT 0,
      alcohol_free INTEGER DEFAULT 0,
      mood_rating INTEGER DEFAULT 3,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(client_id, log_date)
    );

    CREATE TABLE IF NOT EXISTS weekly_challenges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS challenge_participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      challenge_id INTEGER NOT NULL REFERENCES weekly_challenges(id),
      client_id INTEGER NOT NULL REFERENCES clients(id),
      joined_at TEXT DEFAULT (datetime('now')),
      completed INTEGER DEFAULT 0,
      UNIQUE(challenge_id, client_id)
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL REFERENCES clients(id),
      plan TEXT NOT NULL DEFAULT 'monthly',
      status TEXT NOT NULL DEFAULT 'active',
      stripe_subscription_id TEXT,
      stripe_customer_id TEXT,
      current_period_start TEXT,
      current_period_end TEXT,
      amount INTEGER NOT NULL,
      gifted_by INTEGER REFERENCES users(id),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS wearable_connections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL REFERENCES clients(id),
      device_type TEXT NOT NULL,
      connection_status TEXT DEFAULT 'disconnected',
      access_token TEXT,
      refresh_token TEXT,
      last_sync TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(client_id, device_type)
    );

    CREATE TABLE IF NOT EXISTS wearable_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL REFERENCES clients(id),
      data_date TEXT NOT NULL,
      heart_rate_avg INTEGER,
      heart_rate_resting INTEGER,
      active_calories INTEGER,
      total_calories INTEGER,
      steps INTEGER,
      sleep_hours REAL,
      sleep_deep REAL,
      sleep_rem REAL,
      hrv REAL,
      vo2_max REAL,
      readiness_score INTEGER,
      body_temp_deviation REAL,
      spo2 REAL,
      data_source TEXT,
      synced_at TEXT DEFAULT (datetime('now')),
      UNIQUE(client_id, data_date, data_source)
    );

    CREATE TABLE IF NOT EXISTS workout_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL REFERENCES clients(id),
      log_date TEXT NOT NULL,
      session_type TEXT NOT NULL DEFAULT 'Solo gym',
      duration_minutes INTEGER,
      notes TEXT,
      exercises TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tip_of_week (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tip_id INTEGER REFERENCES nutrition_tips(id),
      week_start TEXT NOT NULL UNIQUE,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS daily_quotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quote TEXT NOT NULL,
      author TEXT NOT NULL,
      category TEXT DEFAULT 'fitness',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS pt_custom_quotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quote TEXT NOT NULL,
      author TEXT DEFAULT 'Your PT',
      show_date TEXT NOT NULL,
      client_id INTEGER REFERENCES clients(id),
      is_active INTEGER DEFAULT 1,
      created_by INTEGER REFERENCES users(id),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS client_quote_favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL REFERENCES clients(id),
      quote_text TEXT NOT NULL,
      quote_author TEXT NOT NULL,
      saved_at TEXT DEFAULT (datetime('now')),
      UNIQUE(client_id, quote_text)
    );

    CREATE TABLE IF NOT EXISTS wellness_content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      subtype TEXT DEFAULT 'general',
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      duration_minutes INTEGER DEFAULT 0,
      content TEXT DEFAULT '[]',
      difficulty TEXT DEFAULT 'beginner',
      is_active INTEGER DEFAULT 1,
      is_featured INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  seedWellnessContent();
  seedDailyQuotes();
}

function seedUsers() {
  // Only seed if no users exist (idempotent)
  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (existingUsers.count > 0) return;

  try {
    const ptPasswordHash = bcrypt.hashSync('PTadmin2026!', 10);
    const clientPasswordHash = bcrypt.hashSync('BrazilFit2026!', 10);

    // Create PT user
    db.prepare(`
      INSERT INTO users (email, username, password_hash, role, name)
      VALUES (?, ?, ?, ?, ?)
    `).run('pt@brazilfit.co.uk', 'pt', ptPasswordHash, 'pt', 'BrazilFit PT');

    // Create test client user
    const clientResult = db.prepare(`
      INSERT INTO users (email, username, password_hash, role, name)
      VALUES (?, ?, ?, ?, ?)
    `).run('vivien@example.com', 'vivien', clientPasswordHash, 'client', 'Vivien');
    const clientUserId = clientResult.lastInsertRowid;

    // Create client profile
    db.prepare(`
      INSERT INTO clients (user_id, client_type, block_price, block_start_date, sessions_used)
      VALUES (?, ?, ?, ?, ?)
    `).run(clientUserId, 'F2F', 400, '2026-03-13', 6);

    console.log('? Test users seeded (PT: pt/PTadmin2026!, Client: vivien/BrazilFit2026!)');
  } catch (e) {
    console.log('??  Users already exist, skipping seed');
  }
}

function runMigrations() {
try { db.exec("ALTER TABLE weekly_checkins ADD COLUMN wins TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE weekly_checkins ADD COLUMN challenges TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE weekly_checkins ADD COLUMN next_week_goals TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE weekly_checkins ADD COLUMN workouts_felt TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE weekly_checkins ADD COLUMN overall_mood TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE weekly_checkins ADD COLUMN motivation_score INTEGER"); } catch(e) {}
try { db.exec("ALTER TABLE weekly_checkins ADD COLUMN stress_score INTEGER"); } catch(e) {}
try { db.exec("ALTER TABLE weekly_checkins ADD COLUMN goals_last_week TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE weekly_checkins ADD COLUMN goals_achieved INTEGER"); } catch(e) {}
try { db.exec("ALTER TABLE weekly_checkins ADD COLUMN insight TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE weekly_checkins ADD COLUMN sleep_hours REAL"); } catch(e) {}
try { db.exec("ALTER TABLE weekly_checkins ADD COLUMN water_glasses INTEGER"); } catch(e) {}
try { db.exec("ALTER TABLE weekly_checkins ADD COLUMN daily_steps INTEGER"); } catch(e) {}
  try { db.exec('ALTER TABLE exercises ADD COLUMN gif_url TEXT'); } catch(e) {}
  try { db.exec('ALTER TABLE messages ADD COLUMN pt_id INTEGER'); } catch(e) {}
  try { db.exec('ALTER TABLE subscriptions ADD COLUMN active INTEGER DEFAULT 1'); } catch(e) {}
  try { db.exec('ALTER TABLE subscriptions ADD COLUMN active INTEGER DEFAULT 1'); } catch(e) {}

  const cols = db.prepare('PRAGMA table_info(sessions)').all().map(c => c.name);
  if (!cols.includes('cancelled_at'))
  try { db.exec('ALTER TABLE sessions ADD COLUMN cancelled_at TEXT'); } catch(e) {}
  try { db.exec('ALTER TABLE sessions ADD COLUMN cancellation_notice_hours REAL'); } catch(e) {}
  try { db.exec('ALTER TABLE sessions ADD COLUMN cancelled_by TEXT'); } catch(e) {}
  try { db.exec('ALTER TABLE sessions ADD COLUMN pt_override_note TEXT'); } catch(e) {}
  try { db.exec('ALTER TABLE sessions ADD COLUMN session_carried_over INTEGER DEFAULT 0'); } catch(e) {}
  try { db.exec('ALTER TABLE sessions ADD COLUMN google_event_id TEXT'); } catch(e) {}
  try { db.exec('ALTER TABLE users ADD COLUMN google_access_token TEXT'); } catch(e) {}
  try { db.exec('ALTER TABLE users ADD COLUMN google_refresh_token TEXT'); } catch(e) {}
  try { db.exec('ALTER TABLE users ADD COLUMN google_calendar_connected INTEGER DEFAULT 0'); } catch(e) {}
  try { db.exec('ALTER TABLE clients ADD COLUMN ow_user_id TEXT'); } catch(e) {}
  try { db.exec('ALTER TABLE habit_logs ADD COLUMN resting_heart_rate INTEGER'); } catch(e) {}
  try { db.exec('ALTER TABLE habit_logs ADD COLUMN hrv INTEGER'); } catch(e) {}
  try { db.exec('ALTER TABLE habit_logs ADD COLUMN energy_score INTEGER DEFAULT 5'); } catch(e) {}
  try { db.exec('ALTER TABLE habit_logs ADD COLUMN blood_oxygen INTEGER'); } catch(e) {}
  try { db.exec('ALTER TABLE habit_logs ADD COLUMN stress_level INTEGER DEFAULT 5'); } catch(e) {}
  try { db.exec('ALTER TABLE habit_logs ADD COLUMN active_minutes INTEGER DEFAULT 0'); } catch(e) {}
  try { db.exec('ALTER TABLE habit_logs ADD COLUMN nutrition_score INTEGER DEFAULT 5'); } catch(e) {}
  try { db.exec('ALTER TABLE habit_logs ADD COLUMN wellness_score REAL'); } catch(e) {}
  try { db.exec(`CREATE TABLE IF NOT EXISTS client_routines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL REFERENCES clients(id),
    name TEXT NOT NULL,
    stretches TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )`); } catch(e) {}

  // Notifications table for PT in-app alerts
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL DEFAULT 'cancellation',
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      client_id INTEGER REFERENCES clients(id),
      session_id INTEGER REFERENCES sessions(id),
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Exercise Library

  db.exec(`
    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Full Body',
      muscle_groups TEXT NOT NULL DEFAULT '[]',
      difficulty TEXT NOT NULL DEFAULT 'beginner',
      equipment TEXT NOT NULL DEFAULT 'bodyweight',
      youtube_video_id TEXT,
      sets_reps TEXT DEFAULT '3x10',
      instructions TEXT DEFAULT '[]',
      common_mistakes TEXT DEFAULT '[]',
      pro_tips TEXT DEFAULT '[]',
      gif_url TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS exercise_favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL REFERENCES clients(id),
      exercise_id INTEGER NOT NULL REFERENCES exercises(id),
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(client_id, exercise_id)
    )
  `);

  // Client Settings
  db.exec(`
    CREATE TABLE IF NOT EXISTS client_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER UNIQUE NOT NULL REFERENCES clients(id),
      firstName TEXT,
      lastName TEXT,
      dateOfBirth TEXT,
      gender TEXT,
      hometown TEXT,
      bio TEXT,
      fitnessGoals TEXT,
      fitnessLevel TEXT,
      weightUnit TEXT DEFAULT 'KG',
      heightUnit TEXT DEFAULT 'CM',
      distanceUnit TEXT DEFAULT 'KM',
      sessionReminder1h INTEGER DEFAULT 1,
      sessionReminder24h INTEGER DEFAULT 1,
      sessionCompleted INTEGER DEFAULT 1,
      missedSession INTEGER DEFAULT 1,
      blockReminder2 INTEGER DEFAULT 1,
      blockReminder1 INTEGER DEFAULT 1,
      ptMessage INTEGER DEFAULT 1,
      shareProgress INTEGER DEFAULT 1,
      shareHabits INTEGER DEFAULT 1,
      shareCheckins INTEGER DEFAULT 1,
      showOnLeaderboard INTEGER DEFAULT 0,
      analytics INTEGER DEFAULT 1,
      marketing INTEGER DEFAULT 0,
      weeklyCheckInReminder INTEGER DEFAULT 1,
      habitStreakReminders INTEGER DEFAULT 1,
      dailyHabitReminder INTEGER DEFAULT 1,
      dailyHabitReminderTime TEXT DEFAULT '20:00',
      newChallengeNotification INTEGER DEFAULT 1,
      challengeCompletedNotification INTEGER DEFAULT 1,
      leaderboardUpdateNotification INTEGER DEFAULT 1,
      newMessageNotification INTEGER DEFAULT 1,
      ptRepliedNotification INTEGER DEFAULT 1,
      badgeEarnedNotification INTEGER DEFAULT 1,
      milestoneReachedNotification INTEGER DEFAULT 1,
      allNotifications INTEGER DEFAULT 1,
      country TEXT DEFAULT 'United Kingdom',
      language TEXT DEFAULT 'English',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);


  // Workout Builder
  db.exec(`
    CREATE TABLE IF NOT EXISTS workout_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER REFERENCES clients(id),
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      created_by INTEGER REFERENCES users(id),
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS workout_days (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plan_id INTEGER NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
      day_name TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS workout_day_exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day_id INTEGER NOT NULL REFERENCES workout_days(id) ON DELETE CASCADE,
      exercise_id INTEGER NOT NULL REFERENCES exercises(id),
      sets INTEGER DEFAULT 3,
      reps TEXT DEFAULT '10',
      rest_seconds INTEGER DEFAULT 60,
      notes TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS workout_session_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL REFERENCES clients(id),
      session_id INTEGER REFERENCES sessions(id),
      workout_day_id INTEGER REFERENCES workout_days(id),
      started_at TEXT DEFAULT (datetime('now')),
      completed_at TEXT,
      exercises_completed TEXT DEFAULT '[]',
      notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Session Notes
  db.exec(`
    CREATE TABLE IF NOT EXISTS session_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL REFERENCES sessions(id),
      client_id INTEGER NOT NULL REFERENCES clients(id),
      pt_user_id INTEGER REFERENCES users(id),
      what_we_worked_on TEXT DEFAULT '',
      what_went_well TEXT DEFAULT '',
      what_to_improve TEXT DEFAULT '',
      focus_next_session TEXT DEFAULT '',
      injuries_concerns TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // -- Workout Templates & Assignments -----------------------------------------

  db.exec(`
    CREATE TABLE IF NOT EXISTS workout_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pt_user_id INTEGER NOT NULL REFERENCES users(id),
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      difficulty TEXT DEFAULT 'intermediate',
      estimated_duration_minutes INTEGER DEFAULT 60,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS workout_template_exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      template_id INTEGER NOT NULL REFERENCES workout_templates(id) ON DELETE CASCADE,
      exercise_id INTEGER NOT NULL REFERENCES exercises(id),
      sets INTEGER DEFAULT 3,
      reps TEXT DEFAULT '10',
      weight_kg REAL,
      rest_seconds INTEGER DEFAULT 60,
      notes TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS assigned_workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      template_id INTEGER REFERENCES workout_templates(id),
      client_id INTEGER NOT NULL REFERENCES clients(id),
      pt_user_id INTEGER NOT NULL REFERENCES users(id),
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      difficulty TEXT DEFAULT 'intermediate',
      estimated_duration_minutes INTEGER DEFAULT 60,
      scheduled_date TEXT NOT NULL,
      status TEXT DEFAULT 'assigned',
      assigned_date TEXT DEFAULT (datetime('now')),
      completed_date TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS assigned_workout_exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      assigned_workout_id INTEGER NOT NULL REFERENCES assigned_workouts(id) ON DELETE CASCADE,
      exercise_id INTEGER NOT NULL REFERENCES exercises(id),
      sets INTEGER DEFAULT 3,
      reps TEXT DEFAULT '10',
      weight_kg REAL,
      rest_seconds INTEGER DEFAULT 60,
      notes TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Stretching Exercises
  db.exec(`
    CREATE TABLE IF NOT EXISTS stretching_exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      muscle_group TEXT NOT NULL,
      gif_file TEXT NOT NULL UNIQUE,
      difficulty TEXT DEFAULT 'beginner',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS stretching_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL REFERENCES clients(id),
      stretching_exercise_id INTEGER NOT NULL REFERENCES stretching_exercises(id),
      completed_at TEXT DEFAULT (datetime('now')),
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  seedExercises();
  seedStretchingExercises();
  seedStretchingExercisesToMainTable();

  // -- Onboarding System ------------------------------------------------------

  db.exec(`
    CREATE TABLE IF NOT EXISTS onboarding_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER UNIQUE NOT NULL REFERENCES clients(id),
      step1_complete INTEGER DEFAULT 0,
      step2_complete INTEGER DEFAULT 0,
      step3_complete INTEGER DEFAULT 0,
      step4_complete INTEGER DEFAULT 0,
      step5_complete INTEGER DEFAULT 0,
      completed INTEGER DEFAULT 0,
      completed_at TEXT,
      pdf_parq_consent TEXT,
      pdf_tc TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS onboarding_personal (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER UNIQUE NOT NULL REFERENCES clients(id),
      full_name TEXT NOT NULL DEFAULT '',
      dob TEXT DEFAULT '',
      gender TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      email TEXT DEFAULT '',
      address TEXT DEFAULT '',
      occupation TEXT DEFAULT '',
      emergency_contact_name TEXT DEFAULT '',
      emergency_contact_phone TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS onboarding_lifestyle (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER UNIQUE NOT NULL REFERENCES clients(id),
      lifestyle_description TEXT DEFAULT '',
      smokes INTEGER DEFAULT 0,
      cigarettes_per_day INTEGER DEFAULT 0,
      drinks_alcohol INTEGER DEFAULT 0,
      alcohol_units_per_week REAL DEFAULT 0,
      motivation TEXT DEFAULT '',
      exercise_likes TEXT DEFAULT '',
      exercise_dislikes TEXT DEFAULT '',
      fitt_frequency TEXT DEFAULT '',
      fitt_intensity TEXT DEFAULT '',
      fitt_type TEXT DEFAULT '',
      fitt_time TEXT DEFAULT '',
      barriers TEXT DEFAULT '',
      barriers_strategies TEXT DEFAULT '',
      goal_short TEXT DEFAULT '',
      goal_medium TEXT DEFAULT '',
      goal_long TEXT DEFAULT '',
      nutrition_notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS onboarding_parq (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER UNIQUE NOT NULL REFERENCES clients(id),
      q1 INTEGER DEFAULT 0,
      q2 INTEGER DEFAULT 0,
      q3 INTEGER DEFAULT 0,
      q4 INTEGER DEFAULT 0,
      q5 INTEGER DEFAULT 0,
      q6 INTEGER DEFAULT 0,
      q7 INTEGER DEFAULT 0,
      any_yes INTEGER DEFAULT 0,
      additional_notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS onboarding_consent (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER UNIQUE NOT NULL REFERENCES clients(id),
      read_understood INTEGER DEFAULT 0,
      signature_data TEXT DEFAULT '',
      signed_name TEXT DEFAULT '',
      signed_date TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS onboarding_tc (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER UNIQUE NOT NULL REFERENCES clients(id),
      agreed INTEGER DEFAULT 0,
      signature_data TEXT DEFAULT '',
      signed_name TEXT DEFAULT '',
      signed_date TEXT DEFAULT '',
      trainer_name TEXT DEFAULT 'Andre Viana',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // -- Fitness Assessments ---------------------------------------------------

  db.exec(`
    CREATE TABLE IF NOT EXISTS fitness_assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL REFERENCES clients(id),
      assessment_date TEXT DEFAULT (date('now')),
      resting_hr INTEGER,
      height_cm REAL, weight_kg REAL, bmi REAL,
      bicep_cm REAL, chest_cm REAL, waist_cm REAL, hip_cm REAL,
      upper_leg_cm REAL, lower_leg_cm REAL, waist_hip_ratio REAL,
      sf_triceps REAL, sf_biceps REAL, sf_subscapula REAL, sf_suprailiac REAL,
      sf_total REAL, body_fat_pct REAL,
      bp_systolic INTEGER, bp_diastolic INTEGER, bp_avg_systolic INTEGER, bp_avg_diastolic INTEGER, bp_classification TEXT,
      peak_flow INTEGER,
      flex_hamstrings TEXT, flex_quads TEXT, flex_iliopsoas TEXT,
      flex_adductors TEXT, flex_pectorals TEXT, flex_gastroc TEXT, flex_sit_reach REAL,
      cv_step_test_hr INTEGER, cv_step_test_vo2 REAL,
      cv_bleep_level TEXT, cv_cooper_time REAL,
      me_curl_ups INTEGER, me_sit_ups INTEGER, me_push_ups INTEGER,
      me_plank_secs INTEGER, me_squats INTEGER,
      ms_bench_1rm REAL, ms_leg_press_1rm REAL,
      ms_vertical_jump REAL, ms_broad_jump REAL,
      posture_head TEXT, posture_shoulders TEXT, posture_hips TEXT,
      posture_knees TEXT, posture_ankles TEXT,
      posture_observations TEXT, posture_actions TEXT,
      notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // -- Programme Cards -------------------------------------------------------

  db.exec(`
    CREATE TABLE IF NOT EXISTS programme_cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL REFERENCES clients(id),
      created_by INTEGER REFERENCES users(id),
      card_date TEXT DEFAULT (date('now')),
      title TEXT DEFAULT 'Programme Card',
      warm_up_pulse TEXT DEFAULT '[]',
      warm_up_stretches TEXT DEFAULT '[]',
      cardio TEXT DEFAULT '[]',
      resistance TEXT DEFAULT '[]',
      cool_down_cv TEXT DEFAULT '[]',
      cool_down_stretches TEXT DEFAULT '[]',
      activities_away TEXT DEFAULT '',
      session_notes TEXT DEFAULT '',
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // -- Food & Mood Diary -----------------------------------------------------

  db.exec(`
    CREATE TABLE IF NOT EXISTS food_mood_diary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL REFERENCES clients(id),
      entry_date TEXT NOT NULL,
      meals TEXT DEFAULT '[]',
      water_glasses INTEGER DEFAULT 0,
      how_felt_today TEXT DEFAULT '',
      food_review TEXT DEFAULT '',
      cravings TEXT DEFAULT '',
      moods TEXT DEFAULT '',
      behaviours TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(client_id, entry_date)
    )
  `);

  // -- Workout Log Sessions --------------------------------------------------

  db.exec(`
    CREATE TABLE IF NOT EXISTS workout_log_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL REFERENCES clients(id),
      session_date TEXT DEFAULT (date('now')),
      session_number INTEGER DEFAULT 1,
      session_aims TEXT DEFAULT '',
      exercises TEXT DEFAULT '[]',
      additional_comments TEXT DEFAULT '',
      changes_next_session TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // -- PRO TIER FEATURES ------------------------------------------------------

  // Progress Tracking Tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS progress_measurements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL REFERENCES clients(id),
      tracking_date TEXT NOT NULL,
      weight_kg REAL,
      waist_cm REAL,
      hips_cm REAL,
      chest_cm REAL,
      arms_cm REAL,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(client_id, tracking_date)
    )
  `);


  // Extended Food & Mood Diary (with individual time-stamped entries)
  db.exec(`
    CREATE TABLE IF NOT EXISTS food_mood_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL REFERENCES clients(id),
      entry_date TEXT NOT NULL,
      entry_time TEXT,
      location TEXT,
      food_description TEXT,
      food_amount TEXT,
      mood_before_eating INTEGER,
      mood_after_eating INTEGER,
      reflection_notes TEXT,
      water_glasses INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Weekly Check-ins
  db.exec(`
    CREATE TABLE IF NOT EXISTS weekly_checkins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL REFERENCES clients(id),
      checkin_week TEXT NOT NULL,
      checkin_date TEXT,
      mood_rating INTEGER,
      nutrition_goals_hit INTEGER,
      injuries_concerns TEXT,
      energy_level INTEGER,
      sleep_quality INTEGER,
      what_went_well TEXT,
      what_was_challenging TEXT,
      pt_response TEXT,
      pt_responded_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(client_id, checkin_week)
    )
  `);

  // Achievement Badges
  db.exec(`
    CREATE TABLE IF NOT EXISTS achievement_badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      badge_type TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      description TEXT,
      icon_emoji TEXT,
      color TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS client_badges_earned (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL REFERENCES clients(id),
      badge_id INTEGER NOT NULL REFERENCES achievement_badges(id),
      earned_at TEXT DEFAULT (datetime('now')),
      notes TEXT,
      awarded_by INTEGER REFERENCES users(id),
      UNIQUE(client_id, badge_id)
    )
  `);

  // PT Messaging
  db.exec(`
    CREATE TABLE IF NOT EXISTS pt_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL REFERENCES clients(id),
      pt_user_id INTEGER NOT NULL REFERENCES users(id),
      sender_type TEXT,
      message_text TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      read_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Wearable Devices
  db.exec(`
    CREATE TABLE IF NOT EXISTS wearable_devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL REFERENCES clients(id),
      device_type TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      access_token TEXT,
      refresh_token TEXT,
      last_sync TEXT,
      sync_error TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(client_id, device_type)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS wearable_daily_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL REFERENCES clients(id),
      data_date TEXT NOT NULL,
      steps INTEGER,
      heart_rate_avg INTEGER,
      heart_rate_resting INTEGER,
      active_calories INTEGER,
      total_calories INTEGER,
      sleep_duration REAL,
      sleep_quality INTEGER,
      hrv REAL,
      readiness_score INTEGER,
      readiness_recommendation TEXT,
      data_source TEXT,
      synced_at TEXT,
      UNIQUE(client_id, data_date, data_source)
    )
  `);

  // Create indexes for performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_progress_measurements_client_date
    ON progress_measurements(client_id, tracking_date DESC);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_progress_photos_client_date
    ON progress_photos(client_id, upload_date DESC);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_food_mood_entries_client_date
    ON food_mood_entries(client_id, entry_date DESC);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_weekly_checkins_client_week
    ON weekly_checkins(client_id, checkin_week DESC);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_client_badges_earned_client
    ON client_badges_earned(client_id, earned_at DESC);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_pt_messages_client
    ON pt_messages(client_id, created_at DESC);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_pt_messages_pt
    ON pt_messages(pt_user_id, created_at DESC);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_wearable_daily_data_client_date
    ON wearable_daily_data(client_id, data_date DESC);
  `);

  // -- Media Management System ------------------------------------------------

  db.exec(`
    CREATE TABLE IF NOT EXISTS pt_media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      media_type TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER,
      mime_type TEXT,
      width INTEGER,
      height INTEGER,
      duration_seconds REAL,
      category TEXT NOT NULL,
      sub_category TEXT,
      description TEXT,
      alt_text TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      deleted_at TEXT,
      UNIQUE(user_id, file_name)
    )
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_pt_media_user_category
    ON pt_media(user_id, category);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_pt_media_type
    ON pt_media(media_type);
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS media_assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      media_id INTEGER NOT NULL REFERENCES pt_media(id),
      assignment_type TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      start_date TEXT,
      end_date TEXT,
      order_index INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(assignment_type, is_active)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS pt_weekly_media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      media_id INTEGER NOT NULL REFERENCES pt_media(id),
      week_number INTEGER,
      year INTEGER,
      content_type TEXT NOT NULL,
      views_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(week_number, year, content_type)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS client_testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER REFERENCES clients(id),
      media_id INTEGER NOT NULL REFERENCES pt_media(id),
      caption TEXT NOT NULL,
      transformation_start_date TEXT,
      transformation_end_date TEXT,
      is_featured INTEGER DEFAULT 0,
      order_index INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS media_reactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      media_id INTEGER NOT NULL REFERENCES pt_media(id),
      client_id INTEGER NOT NULL REFERENCES clients(id),
      reaction_type TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(media_id, client_id, reaction_type)
    )
  `);

  // Video versions for adaptive streaming
  db.exec(`
    CREATE TABLE IF NOT EXISTS video_versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      media_id INTEGER NOT NULL REFERENCES pt_media(id),
      resolution TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER,
      duration_seconds REAL,
      codec TEXT DEFAULT 'h264',
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(media_id, resolution)
    )
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_video_versions_media
    ON video_versions(media_id);
  `);

  // Add thumbnail and processing columns to pt_media if not exists
  const mediaCols = db.prepare('PRAGMA table_info(pt_media)').all().map(c => c.name);
  if (!mediaCols.includes('thumbnail_path'))
    db.exec('ALTER TABLE pt_media ADD COLUMN thumbnail_path TEXT');
  if (!mediaCols.includes('processing_status'))
    db.exec('ALTER TABLE pt_media ADD COLUMN processing_status TEXT DEFAULT "completed"');
  if (!mediaCols.includes('has_720p_version'))
    db.exec('ALTER TABLE pt_media ADD COLUMN has_720p_version INTEGER DEFAULT 0');
  if (!mediaCols.includes('has_1080p_version'))
    db.exec('ALTER TABLE pt_media ADD COLUMN has_1080p_version INTEGER DEFAULT 0');

  seedUsers();
  seedAchievementBadges();
}

function seedExercises() {
  const count = db.prepare('SELECT COUNT(*) as n FROM exercises').get();
  if (count.n > 0) return;

  const ins = db.prepare(`
    INSERT INTO exercises (name, category, muscle_groups, difficulty, equipment, youtube_video_id, sets_reps, instructions, common_mistakes, pro_tips)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const exercises = [
    // PUSH
    ['Push-Up', 'Push', '["Chest","Triceps","Shoulders"]', 'beginner', 'bodyweight', 'IODxDxX7oi4', '3x10-15',
      '["Start in a high plank, hands just outside shoulder width.","Lower your chest to the floor, keeping elbows at 45 .","Push back up to full arm extension.","Keep your core braced and body in a straight line throughout."]',
      '["Letting hips sag or rise   keep body rigid.","Flaring elbows out past 90    causes shoulder stress.","Not going all the way down."]',
      '["Squeeze your chest at the top of each rep.","Imagine trying to pull the floor apart with your hands for better chest activation.","Elevate feet to shift load to upper chest."]'],

    ['Barbell Bench Press', 'Push', '["Chest","Triceps","Shoulders"]', 'intermediate', 'barbell', 'BYKScL2sgCs', '4x6-10',
      '["Lie flat, grip just wider than shoulder width.","Unrack and lower bar to lower chest with control.","Press up and slightly back to lockout.","Keep feet flat, glutes on bench, natural arch in lower back."]',
      '["Bouncing the bar off your chest.","Lifting your glutes off the bench.","Grip too wide causing shoulder impingement."]',
      '["Leg drive significantly increases your press   push the floor away.","Retract and depress your scapulae before unracking.","Tuck chin slightly as bar passes your face."]'],

    ['Incline Dumbbell Press', 'Push', '["Upper Chest","Shoulders","Triceps"]', 'intermediate', 'dumbbell', '8iPEnn-ltC8', '3x10-12',
      '["Set bench to 30-45 . Hold dumbbells at shoulder height.","Press up and together, bringing the weights close at the top.","Lower with control to a slight stretch at the bottom.","Keep shoulders retracted throughout."]',
      '["Going too steep   45  already becomes mostly shoulder.","Letting elbows flare excessively.","Rushing the descent."]',
      '["30  is often the sweet spot for upper chest with less shoulder stress.","Neutral grip (palms facing each other) is easier on the shoulders."]'],

    ['Dumbbell Shoulder Press', 'Push', '["Shoulders","Triceps","Upper Chest"]', 'intermediate', 'dumbbell', 'qEwKCR5JCog', '3x10-12',
      '["Sit upright, dumbbells at ear height with palms facing forward.","Press straight up until arms are nearly locked out.","Lower slowly back to start.","Avoid leaning back excessively."]',
      '["Arching the lower back heavily   increases injury risk.","Not going through full range of motion.","Pressing dumbbells too far forward."]',
      '["Arnold press variation adds rotational component for fuller delt activation.","Keep core tight to avoid spinal compression."]'],

    ['Tricep Dips', 'Push', '["Triceps","Chest","Shoulders"]', 'intermediate', 'bodyweight', '2z8JmcrW-As', '3x8-12',
      '["Grip parallel bars, arms straight, slight forward lean.","Lower until upper arms are parallel to floor.","Push back up to full extension.","Keep elbows pointing back, not out."]',
      '["Dipping too deep with compromised shoulder position.","Letting elbows flare wide.","Shrugging shoulders up during the movement."]',
      '["Lean forward slightly for more chest, stay upright for more tricep.","Add weight with a dip belt as you progress."]'],

    ['Overhead Tricep Extension', 'Push', '["Triceps"]', 'beginner', 'dumbbell', 'YbX7Wd8jQ-Q', '3x12-15',
      '["Stand or sit with dumbbell held with both hands overhead.","Lower the weight behind your head by bending elbows.","Extend elbows to press back to start.","Keep upper arms close to ears throughout."]',
      '["Moving upper arms   only forearms should move.","Using too much weight and losing form.","Arching the lower back."]',
      '["This targets the long head of the tricep which many press variations miss.","Cables give constant tension and are easier on the elbow joint."]'],

    // PULL
    ['Pull-Up', 'Pull', '["Lats","Biceps","Upper Back"]', 'intermediate', 'bodyweight', 'eGo4IYlbE5g', '3x5-10',
      '["Hang from bar with hands slightly wider than shoulders.","Pull yourself up until chin clears the bar.","Lower slowly with control   2-3 seconds down.","Think about pulling your elbows toward your hips."]',
      '["Kipping or swinging   removes the muscle stimulus.","Not going through full range of motion.","Looking down instead of forward/up."]',
      '["Scapular pull-ups (just squeezing shoulder blades) are a great warm-up.","Negatives (jump up, slow down) build strength for your first pull-up.","Weighted pull-ups are one of the best upper body mass builders."]'],

    ['Barbell Row', 'Pull', '["Upper Back","Lats","Biceps","Rear Delts"]', 'intermediate', 'barbell', 'kBWAon7ItDw', '4x8-10',
      '["Hinge at hips to about 45 , bar hanging from arms.","Pull the bar to your lower chest/upper stomach.","Squeeze shoulder blades together at the top.","Lower with control."]',
      '["Using momentum and body swing.","Rounding the lower back.","Pulling to the wrong part of the torso."]',
      '["Chest-supported rows remove lower back fatigue for pure upper back work.","Pronated grip hits upper back more; supinated hits biceps more."]'],

    ['Dumbbell Bicep Curl', 'Pull', '["Biceps","Brachialis"]', 'beginner', 'dumbbell', 'ykJmrZ5v0Oo', '3x12-15',
      '["Stand with dumbbells at sides, palms forward.","Curl both arms up, keeping upper arms fixed.","Squeeze biceps at top.","Lower slowly   2-3 seconds."]',
      '["Swinging the torso to help lift the weight.","Not fully extending at the bottom.","Moving the elbows forward."]',
      '["Hammer curls (neutral grip) target the brachialis for arm thickness.","Incline curls provide a greater stretch on the bicep.","Slow negatives build more mass than fast ones."]'],

    ['Face Pull', 'Pull', '["Rear Delts","Rotator Cuff","Upper Back"]', 'beginner', 'cable', 'HSoHeSjvIdY', '3x15-20',
      '["Set cable at face height with rope attachment.","Pull rope toward your face, separating handles at the end.","Hold briefly with external rotation at peak contraction.","Return slowly."]',
      '["Pulling to the neck instead of face level.","Not externally rotating at the end.","Going too heavy   this is a corrective exercise."]',
      '["One of the most important exercises for shoulder health   do it every session.","External rotation at the end is the key component for rotator cuff health."]'],

    ['Lat Pulldown', 'Pull', '["Lats","Biceps","Rear Delts"]', 'beginner', 'cable', 'CAwf7n6Luuc', '3x10-12',
      '["Sit, knees under pad, grip bar just wider than shoulder width.","Pull bar to upper chest, leading with elbows.","Squeeze lats at bottom position.","Extend arms fully at top."]',
      '["Pulling behind the neck   high injury risk.","Using momentum and leaning back excessively.","Not going through full range."]',
      '["Think about pulling your elbows into your back pockets.","Supinated (underhand) grip shifts emphasis to biceps and often feels more natural."]'],

    // LEGS
    ['Barbell Back Squat', 'Legs', '["Quads","Glutes","Hamstrings","Core"]', 'intermediate', 'barbell', 'ultWZbUMPL8', '4x6-10',
      '["Bar on upper traps, feet shoulder-width, toes slightly out.","Break at knees and hips simultaneously, sitting between your legs.","Descend until thighs are parallel or below.","Drive through the whole foot back to standing."]',
      '["Knees caving inward   push them out.","Good morning squat   hips rising before shoulders.","Heels rising off the floor   work on ankle mobility."]',
      '["Brace your entire core like you are taking a punch.","The squat is a hip hinge AND knee bend   not just a knee bend.","Box squats help learn proper depth and hip crease mechanics."]'],

    ['Romanian Deadlift', 'Legs', '["Hamstrings","Glutes","Lower Back"]', 'intermediate', 'barbell', 'JCXUYuzwNrM', '3x10-12',
      '["Stand with bar at hips, slight knee bend.","Hinge at hips, pushing them back, lowering the bar along your legs.","Feel a stretch in hamstrings, then drive hips forward to return.","Keep back flat throughout."]',
      '["Squatting the movement   it is a hip hinge, minimal knee bend.","Rounding the lower back.","Letting the bar drift away from the legs."]',
      '["RDLs develop hamstring length and strength simultaneously.","The bar should drag along your shins and thighs the whole way down.","Dumbbell variation is great for beginners to feel the hip hinge pattern."]'],

    ['Conventional Deadlift', 'Legs', '["Hamstrings","Glutes","Lower Back","Traps","Core"]', 'intermediate', 'barbell', 'op9kVnSso6Q', '3x5-8',
      '["Stand with bar over mid-foot. Hinge down and grip just outside legs.","Pull the slack out of the bar before initiating the lift.","Drive feet through the floor while keeping bar close to body.","Lock out at top   hips fully extended, standing tall."]',
      '["Jerking the bar off the floor instead of building tension first.","Bar drifting away from the body.","Hyperextending at lockout.","Rounding the lower back under load."]',
      '["The deadlift is not a squat with the bar on the floor   set the hips higher.","Hook grip or straps allow you to train heavier without grip being the limiting factor."]'],

    ['Leg Press', 'Legs', '["Quads","Glutes","Hamstrings"]', 'beginner', 'machine', 'IZxyjW7MPJQ', '3x12-15',
      '["Sit in machine, feet hip-width on platform.","Lower platform until knees reach 90 .","Press back to full extension   do NOT lock out knees aggressively.","Keep lower back pressed into the seat."]',
      '["Lowering too deep with lower back rounding off the seat.","Locking out knees aggressively at the top.","Feet too low causing excessive knee travel."]',
      '["High foot placement targets glutes and hamstrings more.","Low narrow placement hits quads harder.","Single leg press addresses imbalances effectively."]'],

    ['Walking Lunges', 'Legs', '["Quads","Glutes","Hamstrings","Balance"]', 'beginner', 'bodyweight', 'L8fvwPVQovQ', '3x12 each leg',
      '["Stand tall, take a large step forward.","Lower back knee toward floor   front shin vertical.","Push through front heel to stand and bring back foot forward.","Continue alternating legs."]',
      '["Front knee caving inward.","Leaning forward too much.","Stepping too short   knee goes past toes."]',
      '["Keep torso upright   imagine balancing a book on your head.","Add dumbbells as you progress.","Reverse lunges are easier to learn and more knee-friendly."]'],

    ['Glute Bridge / Hip Thrust', 'Legs', '["Glutes","Hamstrings","Core"]', 'beginner', 'bodyweight', 'xnKMl_J4i4E', '3x15',
      '["Lie on back, feet flat on floor, arms by sides.","Drive hips up by squeezing glutes, forming a straight line from knees to shoulders.","Hold at top for 1-2 seconds.","Lower with control."]',
      '["Hyperextending the lower back at the top.","Feet too close   causing more quad activation.","Not fully extending the hips."]',
      '["Single leg version is significantly harder and addresses imbalances.","Barbell hip thrust is one of the best exercises for glute hypertrophy.","Elevate shoulders on a bench for greater range of motion."]'],

    ['Bulgarian Split Squat', 'Legs', '["Quads","Glutes","Hip Flexors","Balance"]', 'intermediate', 'bodyweight', '2C-uNgKwPLE', '3x8-10 each',
      '["Rear foot elevated on bench, front foot forward enough for vertical shin.","Lower back knee toward floor, keeping torso upright.","Drive through front heel to return.","Keep front knee tracking over toes."]',
      '["Front foot too close   causes forward knee lean.","Rotating the hips open.","Losing balance   use a wall or slow down the tempo."]',
      '["One of the best single-leg exercises for quad and glute development.","Lean forward slightly for more glute bias, stay upright for more quad.","Add a dumbbell in the goblet position for easier balance."]'],

    ['Calf Raise', 'Legs', '["Calves","Soleus"]', 'beginner', 'bodyweight', 'gwLzBJYoWlQ', '4x15-20',
      '["Stand on edge of step with heels off the edge.","Lower heels as far as possible for a full stretch.","Rise up on toes as high as possible.","Hold the peak for 1 second."]',
      '["Not going through full range   partial reps limit calf development.","Bouncing at the bottom without pause.","Going too fast."]',
      '["Calves respond very well to high volume   4 sets is a minimum.","Bent-knee calf raise (seated) targets the soleus, which sits beneath the gastrocnemius.","Pause at the bottom stretch to prevent Achilles issues."]'],

    // CORE
    ['Plank', 'Core', '["Core","Shoulders","Glutes"]', 'beginner', 'bodyweight', 'ASdvN_XEl_c', '3x30-60s',
      '["Forearms on floor, elbows under shoulders.","Body straight from head to heels.","Brace core, squeeze glutes, and breathe.","Hold for target time."]',
      '["Hips too high   reduces core demand.","Hips sagging   lower back strain.","Holding breath.","Looking up   keep neck neutral."]',
      '["Quality over time   30 seconds perfectly beats 60 seconds with bad form.","Side planks target the obliques.","RKC plank (squeezing everything harder) increases difficulty without duration."]'],

    ['Crunch', 'Core', '["Rectus Abdominis","Hip Flexors"]', 'beginner', 'bodyweight', 'Xyd_fa5zoEU', '3x15-20',
      '["Lie on back, knees bent, hands behind head lightly.","Lift shoulders off the floor using your abs   NOT pulling your neck.","Lower slowly.","Exhale as you crunch up."]',
      '["Pulling on the neck with hands.","Using momentum to swing up.","Not controlling the lowering phase."]',
      '["Think about shortening the distance between your ribs and hips.","Keep chin slightly tucked.","Crunches develop definition, but planks and compound lifts build functional core strength."]'],

    ['Russian Twist', 'Core', '["Obliques","Core"]', 'beginner', 'bodyweight', 'wkD8rjkodUI', '3x20 total',
      '["Sit with knees bent, feet slightly elevated, torso at 45 .","Clasp hands or hold a weight.","Rotate torso side to side, touching the floor each side.","Keep core braced throughout."]',
      '["Twisting only the arms   rotate from the torso.","Rounding the back.","Going too fast with no control."]',
      '["Adding a medicine ball or plate increases the challenge.","Keep the movement controlled   this is not a speed exercise."]'],

    ['Hanging Leg Raise', 'Core', '["Lower Abs","Hip Flexors","Core"]', 'intermediate', 'bodyweight', 'hdng3Nm1x70', '3x10-15',
      '["Hang from a pull-up bar with arms fully extended.","Keeping legs together, raise them until parallel to floor (or higher).","Lower slowly   2-3 seconds.","Avoid swinging."]',
      '["Swinging and using momentum.","Bending knees to make it easier (can also do this as a regression).","Not going through full range."]',
      '["One of the best lower ab exercises.","Tuck version (knees to chest) is the regression.","Straight leg to 90  is the target, toes to bar is advanced."]'],

    ['Mountain Climber', 'Core', '["Core","Hip Flexors","Cardio"]', 'beginner', 'bodyweight', 'nmwgirgXLYM', '3x30s',
      '["Start in high plank position.","Drive one knee toward your chest, then quickly switch legs.","Keep hips level   don\'t let them rise.","Maintain a tight core throughout."]',
      '["Hips rising with each leg drive.","Slowing down so much it becomes a static stretch.","Looking down instead of forward."]',
      '["Works as both a core exercise and cardio depending on speed.","Slow mountain climbers (3s hold) are more of an anti-rotation core exercise."]'],

    // CARDIO / FULL BODY
    ['Burpee', 'Full Body', '["Full Body","Cardio","Legs","Push"]', 'intermediate', 'bodyweight', 'dZgVxmf6jkA', '3x10',
      '["Stand tall, then squat and place hands on floor.","Jump feet back to plank and perform a push-up.","Jump feet forward, then explosively jump up with arms overhead.","Land softly and repeat."]',
      '["Sagging in the plank position.","Not performing the push-up component.","Landing heavily   bend knees to absorb."]',
      '["Step-out burpees are lower impact and fine as a modification.","Focus on smooth transitions rather than pure speed."]'],

    ['Kettlebell Swing', 'Full Body', '["Glutes","Hamstrings","Core","Shoulders"]', 'intermediate', 'kettlebell', 'sSESeQAir2M', '3x15-20',
      '["Hinge at hips, swing KB back between legs.","Drive hips forward explosively   the arms don\'t pull.","KB floats to shoulder height from momentum alone.","Let it swing back and repeat the hinge."]',
      '["Squatting the movement instead of hinging.","Using arms to pull the KB up.","Rounding the lower back at the bottom.","Hyperextending at the top."]',
      '["The swing is a hip snap   not a squat or a shoulder raise.","One of the most effective tools for posterior chain conditioning.","Start light and nail the hinge pattern first."]'],

    ['Box Jump', 'Full Body', '["Legs","Glutes","Explosive Power"]', 'intermediate', 'bodyweight', 'NBY9-kTuHEk', '3x6-8',
      '["Stand facing box, feet hip-width.","Swing arms back, bend knees slightly.","Explode upward, swinging arms and jumping onto box.","Land softly with knees bent.","Step down   never jump down."]',
      '["Jumping without pre-loading the arms.","Landing stiff-legged.","Using a box that is too high before mastering lower heights.","Jumping down   step-down only."]',
      '["Box jumps train explosive power, not strength   keep reps low and quality high.","Depth jumps (jump off box then immediately up) are a progression for advanced athletes."]'],

    ['Goblet Squat', 'Legs', '["Quads","Glutes","Core","Mobility"]', 'beginner', 'kettlebell', 'MeIiIdhvXT4', '3x12',
      '["Hold KB or dumbbell at chest, elbows tucked.","Feet shoulder-width, toes slightly out.","Squat deep, keeping chest up and elbows inside knees.","Drive through heels to stand."]',
      '["Letting elbows collapse inward.","Not squatting deep enough.","Heels rising   work on ankle mobility."]',
      '["The goblet squat is the best way to learn squat mechanics.","The weight acts as a counterbalance making it easier to sit into depth.","Holding the bottom for 30s is a great mobility drill."]'],

    ['Dumbbell Lateral Raise', 'Push', '["Lateral Deltoids","Shoulders"]', 'beginner', 'dumbbell', '3VcKaXpzqRo', '3x15',
      '["Stand with dumbbells at sides, slight bend in elbows.","Raise arms out to sides until parallel to floor.","Lead with your elbows, not your hands.","Lower slowly   2-3 seconds."]',
      '["Shrugging shoulders up during the raise.","Going too heavy and swinging.","Wrists above elbows at top   should be level."]',
      '["Tilt the dumbbell slightly (as if pouring water) to better target the lateral head.","Cable lateral raises provide constant tension and are great for a pump.","This is a detail exercise   ego has no place here."]'],

    ['Cable Fly / Chest Fly', 'Push', '["Chest","Anterior Deltoids"]', 'intermediate', 'cable', 'WEM-i7L5o8s', '3x12-15',
      '["Set cables at shoulder height, stand in middle, one foot forward.","Hold handles with arms wide, slight bend at elbows.","Bring hands together in front of you in a hugging motion.","Return slowly with control."]',
      '["Bending the arms too much   this becomes a press.","Not maintaining consistent elbow angle throughout.","Allowing the weight to jerk the arms back."]',
      '["Cables keep the muscle under tension through the full range unlike dumbbells.","Low cables target the upper chest.","High cables target the lower chest."]'],

    // More CHEST exercises
    ['Dips', 'Chest', '["Chest","Triceps","Shoulders"]', 'intermediate', 'bodyweight', '2z8JmcrW-As', '3x8-12',
      '["Grip parallel bars, arms straight, slight forward lean.","Lower until upper arms are parallel to floor.","Push back up to full extension.","Lean forward for more chest emphasis."]',
      '["Dipping too deep with compromised form.","Elbows flaring too wide.","Not controlling the descent."]',
      '["Excellent compound movement for chest and arms.","Add weight belt for progressive overload.","Lean forward to target chest more, stay upright for triceps."]'],

    ['Chest Press Machine', 'Chest', '["Chest","Triceps"]', 'beginner', 'machine', 'Z-U0h9xL3pE', '3x12-15',
      '["Sit upright, feet flat on floor.","Grip handles at chest height.","Press forward until arms are nearly extended.","Return slowly to starting position."]',
      '["Not maintaining full range of motion.","Pressing with only arms, not engaging chest.","Locking out elbows fully at extension."]',
      '["Machine provides a stable path great for beginners.","Easier on shoulders compared to free weights.","Good option for high volume training."]'],

    // More BACK exercises
    ['Lat Pulldown', 'Pull', '["Lats","Biceps"]', 'beginner', 'cable', 'CAwf7n6Luuc', '3x10-12',
      '["Sit with knees secured under pad.","Grip bar wider than shoulder width.","Pull bar down to upper chest.","Control the weight on the way up."]',
      '["Pulling too far behind neck.","Using momentum and jerking.","Incomplete range of motion."]',
      '["Think elbows to hips.","Lean back slightly as you pull.","Great preparatory exercise for pull-ups."]'],

    ['Seated Cable Row', 'Pull', '["Upper Back","Lats","Biceps"]', 'beginner', 'cable', '3YxPJJzNmEg', '3x10-12',
      '["Sit with chest supported, feet on platform.","Grip handles at arm\'s length.","Row handles toward your chest.","Squeeze shoulder blades together."]',
      '["Rounding the lower back.","Insufficient range of motion.","Using too much weight compromising form."]',
      '["Keep chest up against pad.","Initiate pull with lats, not arms.","Seated variation reduces lower back strain."]'],

    ['Single Arm Row', 'Pull', '["Upper Back","Lats","Biceps"]', 'intermediate', 'dumbbell', 'ROhwv4cgKfw', '3x10 each',
      '["Place one knee on bench, opposite foot on ground.","Row dumbbell to rib cage.","Keep elbow close to body.","Avoid rotating torso."]',
      '["Letting the weight drift away from body.","Rotating hips and shoulders.","Not achieving full range of motion."]',
      '["Great for addressing strength imbalances.","Increased core demand from unilateral movement.","Focus on mind-muscle connection."]'],

    // More ARM exercises
    ['Hammer Curl', 'Pull', '["Biceps","Brachialis"]', 'beginner', 'dumbbell', 'zC3nLlEvin0', '3x12-15',
      '["Stand with dumbbells at sides, neutral grip.","Curl both weights up, keeping upper arms stationary.","Squeeze at the top of the movement.","Lower with control."]',
      '["Letting elbows move forward.","Using momentum to swing weights.","Incomplete range of motion."]',
      '["Neutral grip variation targets brachialis muscle.","Easier on the wrists and elbows.","Creates more arm thickness than standard curls."]'],

    ['Tricep Pushdown', 'Push', '["Triceps"]', 'beginner', 'cable', 'JLeyUOH4Dpw', '3x12-15',
      '["Stand facing cable machine, bar at elbow height.","Grip bar with hands shoulder-width apart.","Push bar down until arms are nearly extended.","Control the weight on the way up."]',
      '["Using too much weight and body momentum.","Not achieving full range at bottom.","Elbows flaring away from body."]',
      '["Keep upper arms stationary throughout.","Full extension at bottom is key.","Constant tension on triceps throughout the set."]'],

    ['Skull Crusher', 'Push', '["Triceps"]', 'intermediate', 'dumbbell', 'yKPL0Zcj7nE', '3x10-12',
      '["Lie on flat bench, dumbbells above chest.","Lower weights by bending elbows toward head.","Extend elbows to return to start.","Keep upper arms vertical."]',
      '["Elbows drifting outward.","Not moving through full range.","Using too much weight."]',
      '["Requires more stability than other tricep exercises.","Variations with barbell or EZ-bar also work well.","Excellent tricep finisher at end of workout."]'],

    ['Preacher Curl', 'Pull', '["Biceps"]', 'beginner', 'machine', 'wHhPvE4jYcI', '3x10-12',
      '["Sit at preacher bench with arms resting on pad.","Grip barbell or dumbbells at shoulder width.","Curl weights toward you.","Lower slowly with control."]',
      '["Lifting elbows off the pad.","Going too heavy compromising form.","Swinging the weight up."]',
      '["Eliminates cheating through momentum.","Great for isolating the bicep.","Excellent pump at the end of back day."]'],

    // More LEG exercises
    ['Leg Curl', 'Legs', '["Hamstrings","Biceps Femoris"]', 'beginner', 'machine', 'N0NyFJf8lSQ', '3x12-15',
      '["Lie face down on leg curl machine.","Keep hips pressed on the bench.","Curl the weight toward your glutes.","Lower slowly with control."]',
      '["Lifting hips off the bench.","Jerking the weight up.","Not achieving full extension at bottom."]',
      '["Focus on squeezing hamstrings at peak.","Slow negatives build more muscle.","Can be done single leg for unilateral work."]'],

    ['Leg Extension', 'Legs', '["Quadriceps"]', 'beginner', 'machine', 'YGj-A8XRl-0', '3x12-15',
      '["Sit upright, back against pad, legs bent.","Push weight forward by extending knees.","Hold briefly at full extension.","Lower slowly."]',
      '["Using momentum to drive weight up.","Not achieving full extension.","Excessive weight causing form breakdown."]',
      '["Great isolated quad developer.","Light weight with high reps builds endurance.","Useful for prehab and warm-up."]'],

    ['Leg Press', 'Legs', '["Quads","Glutes","Hamstrings"]', 'beginner', 'machine', 'IZxyjW7MPJQ', '3x12-15',
      '["Sit in machine with feet on platform.","Lower platform until knees reach 90 .","Press back to full extension.","Keep lower back against pad."]',
      '["Lowering too deep with back rounding.","Locking knees aggressively.","Feet positioned too low."]',
      '["High foot placement targets glutes more.","Great for heavy load training.","Less demanding on core than barbell squats."]'],

    // More GLUTES exercises
    ['Hip Thrust', 'Glutes', '["Glutes","Hamstrings","Core"]', 'intermediate', 'bodyweight', 'xnKMl_J4i4E', '3x12-15',
      '["Upper back on bench, feet flat on floor.","Drive hips up toward ceiling.","Squeeze glutes at top position.","Lower with control."]',
      '["Not achieving full hip extension.","Neck hyperextension.","Too much lower back involvement."]',
      '["Barbell variation allows for heavier loads.","Single leg hip thrust increases difficulty.","One of the best glute activation exercises."]'],

    ['Cable Kickback', 'Glutes', '["Glutes","Hamstrings"]', 'beginner', 'cable', 'Z48D3rKZeXw', '3x12 each',
      '["Face the cable machine, cable attached to ankle.","Kick leg back and up, squeezing glute.","Control the return to starting position.","Maintain upright posture."]',
      '["Swinging the weight up using momentum.","Excessive forward lean of torso.","Not achieving full range of motion."]',
      '["Great for glute isolation.","Constant tension throughout movement.","High reps work well for burnout."]'],

    ['Sumo Squat', 'Glutes', '["Glutes","Quads","Adductors"]', 'intermediate', 'dumbbell', 'V4rXAM_VQNQ', '3x12',
      '["Feet wider than shoulder-width, toes out 45 .","Lower hips down and back, knees tracking over toes.","Drive through heels to return.","Keep chest up."]',
      '["Knees caving inward.","Leaning too far forward.","Insufficient depth."]',
      '["Greater glute activation compared to narrow stance.","Excellent for hip opening and mobility.","Works inner thighs more than standard squat."]'],

    // More SHOULDER exercises
    ['Lateral Raise', 'Shoulders', '["Lateral Deltoids"]', 'beginner', 'dumbbell', '3VcKaXpzqRo', '3x15',
      '["Stand with dumbbells at sides, slight elbow bend.","Raise arms to shoulder height.","Lead with elbows, not hands.","Lower slowly."]',
      '["Using momentum and swinging.","Raising too high above shoulder level.","Shoulders shrugged up."]',
      '["Perfect tilt the dumbbell slightly forward.","Best isolation for lateral delts.","Light weight and high reps work best."]'],

    ['Front Raise', 'Shoulders', '["Front Deltoids"]', 'beginner', 'dumbbell', 'EL4I4R-z0Jg', '3x12-15',
      '["Stand holding dumbbells at thighs, palms facing back.","Raise weights up to shoulder height.","Control the descent.","Avoid excessive arching."]',
      '["Swinging the weights up.","Raising too high above shoulders.","Using heavy weight compromising form."]',
      '["Excellent anterior deltoid builder.","Cable version allows constant tension.","Often overtrained; limit volume for shoulder health."]'],

    ['Arnold Press', 'Shoulders', '["Shoulders","Triceps","Upper Chest"]', 'intermediate', 'dumbbell', 'qEwKCR5JCog', '3x10',
      '["Sit upright, dumbbells at shoulder height, palms facing you.","Press and rotate so palms face forward at top.","Lower and rotate back to starting position."]',
      '["Not rotating through full range.","Leaning back excessively.","Rushing the movement."]',
      '["Hits all three deltoid heads.","Rotation component increases muscle fiber recruitment.","Progression from regular shoulder press."]'],

    ['Upright Row', 'Shoulders', '["Shoulders","Traps","Biceps"]', 'intermediate', 'barbell', 'tXwkOpc-_Jk', '3x10-12',
      '["Stand with barbell at thighs, hands shoulder-width.","Pull bar up to chin level, leading with elbows.","Lower slowly to starting position.","Keep bar close to body."]',
      '["Using too much weight and body swing.","Elbows dipping too low.","Excessive forward lean."]',
      '["Great for trap development.","Elbows should travel higher than the bar.","Important for shoulder and trap definition."]'],

    // More CORE exercises
    ['Leg Raise', 'Core', '["Lower Abs","Hip Flexors"]', 'intermediate', 'bodyweight', 'V3T37pRq_GA', '3x12-15',
      '["Lie on back, legs extended, hands at sides or under glutes.","Raise legs to 90  at hips.","Lower slowly without touching floor.","Keep lower back in contact with floor."]',
      '["Momentum swinging legs up.","Lower back lifting off floor.","Excessive speed without control."]',
      '["Excellent lower ab developer.","Bent knee variation is easier regression.","Slower tempo increases difficulty."]'],

    ['Ab Wheel Rollout', 'Core', '["Rectus Abdominis","Core","Shoulders"]', 'intermediate', 'bodyweight', 'Duw_KRuTn7A', '3x8-10',
      '["Kneel, holding ab wheel with both hands.","Roll forward, extending body while maintaining core tension.","Pull yourself back to starting position.","Progress to standing."]',
      '["Hyperextending the back.","Not maintaining core tension.","Stopping short of full range."]',
      '["One of the hardest core exercises.","Requires tremendous core stability.","Standing version is advanced progression."]'],

    ['Dead Bug', 'Core', '["Core","Stability"]', 'beginner', 'bodyweight', '4lJHLYTlEwQ', '3x10 each side',
      '["Lie on back, arms extended toward ceiling, knees bent at 90 .","Extend opposite arm and leg while keeping lower back on floor.","Return and switch sides.","Move slowly and controlled."]',
      '["Lower back lifting off floor.","Moving too quickly.","Insufficient range of motion."]',
      '["Great anti-extension core exercise.","Teaches proper core stabilization.","Excellent beginner core foundation."]'],

    // CARDIO exercises
    ['Treadmill Run', 'Cardio', '["Cardiovascular","Endurance"]', 'beginner', 'machine', 'qDHWQkK0CeU', 'Variable',
      '["Start with warm-up walk or jog.","Maintain steady pace appropriate for fitness level.","Keep arms relaxed, chest up.","Cool down with walking."]',
      '["Overstriding leading to injury.","Running on heels instead of midfoot.","Neglecting proper warm-up."]',
      '["HIIT intervals are more time-efficient than steady state.","Invest in proper running shoes.","Foam rolling quads and calves post-workout."]'],

    ['Rowing Machine', 'Cardio', '["Cardiovascular","Full Body","Endurance"]', 'intermediate', 'machine', 'xF4djQS1eRE', '20-30 min',
      '["Feet secured in footrests.","Drive with legs, then hinge back slightly, pull handle to chest.","Extend arms and hinge forward to return.","Maintain steady pace and rhythm."]',
      '["Using only arms   legs provide most power.","Rounding the lower back.","Slamming the seat forward."]',
      '["Full body cardio exercise.","Great for building back endurance.","Adjustable resistance allows for varied training."]'],

    ['Jump Rope', 'Cardio', '["Cardiovascular","Agility","Calves"]', 'beginner', 'bodyweight', 'V6mFLqnTCkk', '3x30s',
      '["Hands at waist height, elbows bent 90 .","Jump on balls of feet with minimal ground contact.","Keep jumping rhythm steady and relaxed.","Land softly."]',
      '["Stiff ankles and jumping flat-footed.","Swinging rope with arms too wide.","Tensing up shoulders."]',
      '["Excellent warm-up or finisher.","Calf and ankle strength improves.","Very cost-effective training tool."]'],

    ['Burpee', 'Cardio', '["Full Body","Cardio","Legs"]', 'intermediate', 'bodyweight', 'dZgVxmf6jkA', '3x10',
      '["Stand, squat down, place hands on floor.","Jump feet back to plank, do push-up.","Jump feet back to squat, explosive jump up.","Repeat for reps."]',
      '["Sagging in plank position.","Not performing full push-up.","Landing stiffly without control."]',
      '["Best full-body compound exercise.","Combines strength and cardio.","Low volume but high intensity."]'],

    ['Box Jump', 'Cardio', '["Explosive Power","Legs","Glutes"]', 'intermediate', 'bodyweight', 'NBY9-kTuHEk', '3x5-8',
      '["Face box, feet hip-width.","Swing arms, jump explosively onto box.","Land softly with knees bent.","Step down   never jump down."]',
      '["Jumping without arm swing.","Stiff landing position.","Using excessive box height."]',
      '["Trains explosive power and rate of force development.","Essential for athletic performance.","Recovery between sets is important."]'],

    ['Cycling', 'Cardio', '["Cardiovascular","Legs","Endurance"]', 'beginner', 'machine', 'EZ5BT_zmiye', '20-45 min',
      '["Adjust seat height so knee is slightly bent at bottom.","Maintain steady cadence 80-100 RPM.","Keep core engaged and shoulders relaxed.","Gradually increase resistance as fitness improves."]',
      '["Seat too high or low causing discomfort.","Standing excessively when not needed.","Ignoring proper bike setup."]',
      '["Low-impact cardio option.","Great for recovery days.","Can be done long duration without joint stress."]'],

    ['Stair Climber', 'Cardio', '["Cardiovascular","Legs","Glutes"]', 'intermediate', 'machine', 'ShGzfEXyXZQ', '20-30 min',
      '["Stand upright, hands on handles lightly.","Maintain steady stepping pace.","Avoid leaning excessively on handles.","Adjust speed based on fitness level."]',
      '["Slouching or excessive forward lean.","Gripping handles too tightly.","Taking very short steps."]',
      '["Excellent leg and glute builder.","Low impact on joints.","Can adjust intensity quickly."]'],

    // STRETCHING exercises
    ['Hip Flexor Stretch', 'Stretching', '["Hip Flexors","Mobility"]', 'beginner', 'bodyweight', 'KxMXLv0uXDk', '30-60s each side',
      '["Kneel on one knee, other foot forward.","Push hips forward gently.","Feel stretch in front of back leg hip.","Keep torso upright."]',
      '["Pushing too aggressively.","Rounding lower back.","Insufficient depth."]',
      '["Hold 30-60 seconds per side.","Tight hip flexors are common from sitting.","Do daily for best results."]'],

    ['Hamstring Stretch', 'Stretching', '["Hamstrings","Mobility"]', 'beginner', 'bodyweight', 'gPMx3PzYz9I', '30-60s each leg',
      '["Sit with one leg extended, one leg bent.","Fold forward over the straight leg.","Keep back relatively straight.","Feel mild stretch in hamstring."]',
      '["Forcing the stretch too aggressively.","Bouncing at the end range.","Rounding entire spine excessively."]',
      '["Tight hamstrings limit athletic performance.","Dynamic stretches pre-workout, static post.","Yoga and foam rolling help long-term."]'],

    ['Quad Stretch', 'Stretching', '["Quadriceps","Mobility"]', 'beginner', 'bodyweight', 'Ixs2tCLqiLA', '30-60s each leg',
      '["Stand on one leg, grab other foot behind.","Pull foot toward glutes gently.","Keep knees together and hips square.","Feel stretch in front of thigh."]',
      '["Pulling knee outward.","Leaning backward excessively.","Forcing the stretch too hard."]',
      '["Hold 30-60 seconds each leg.","Great post-leg workout.","Balance challenge when done standing."]'],

    ['Shoulder Stretch', 'Stretching', '["Shoulders","Rotator Cuff"]', 'beginner', 'bodyweight', 'fYhEw4-3CfY', '30-60s each side',
      '["Bring one arm across body, chest level.","Use other arm to gently pull elbow toward body.","Feel stretch in back of shoulder.","Keep torso upright."]',
      '["Pulling too aggressively.","Shoulder shrugging up toward ear.","Excessive forward lean."]',
      '["Great post-shoulder workout.","Often forgotten but important for shoulder health.","Do gently and controlled."]'],

    ['Child\'s Pose', 'Stretching', '["Back","Shoulders","Hips"]', 'beginner', 'bodyweight', '1OGsWlJvq0s', '60-90s',
      '["Kneel on mat, big toes touching, knees wide.","Fold torso forward between legs.","Arms extended or resting by sides.","Breathe deeply and relax."]',
      '["Forcing torso down too hard.","Arching lower back excessively.","Holding breath during stretch."]',
      '["Excellent full-body relaxation pose.","Great cool-down exercise.","Promotes spinal mobility and breathing."]'],

    ['Pigeon Pose', 'Stretching', '["Hips","Glutes","Hip External Rotators"]', 'intermediate', 'bodyweight', 'rOJdE1S64rg', '60-90s each side',
      '["From hands and knees, bring right leg forward under torso.","Square hips forward, fold body over leg.","Feel deep stretch in hip and glute.","Breathe and relax into stretch."]',
      '["Front knee pointing too far inward.","Forcing excessive forward lean.","Asymmetrical hip positioning."]',
      '["Excellent for tight hips.","Very common tight spot in athletes.","Consistent practice needed for improvement."]'],
  ];

  for (const e of exercises) {
    ins.run(...e);
  }
}

function seedStretchingExercises() {
  const count = db.prepare('SELECT COUNT(*) as n FROM stretching_exercises').get();
  if (count.n > 0) return;

  const fs = require('fs');
  const path = require('path');

  try {
    const mappingPath = path.join(__dirname, '../../frontend/public/exercise-gifs/mapping.json');
    if (!fs.existsSync(mappingPath)) return;

    const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
    const ins = db.prepare(`
      INSERT INTO stretching_exercises (name, muscle_group, gif_file, difficulty)
      VALUES (?, ?, ?, ?)
    `);

    // Map muscle groups from filenames to canonical groups
    const muscleGroupMap = {
      'Neck': 'Neck',
      'Shoulder': 'Shoulders',
      'Deltoid': 'Shoulders',
      'Back': 'Back',
      'Spine': 'Back',
      'Lower-Back': 'Back',
      'Tricep': 'Arms',
      'Bicep': 'Arms',
      'Forearm': 'Arms',
      'Wrist': 'Arms',
      'Arm': 'Arms',
      'Upper-Arm': 'Arms',
      'Chest': 'Chest',
      'Pectoral': 'Chest',
      'Hip': 'Hips',
      'Glute': 'Hips',
      'Piriform': 'Hips',
      'Quad': 'Legs',
      'Hamstring': 'Legs',
      'Knee': 'Legs',
      'Thigh': 'Legs',
      'Calf': 'Calves',
      'Ankle': 'Calves',
      'Cat': 'Full Body',
      'Child': 'Full Body',
      'Yoga': 'Full Body',
      'Full-Body': 'Full Body'
    };

    const getMuscleGroup = (rawMuscle) => {
      const parts = rawMuscle.split('-');
      for (const part of parts) {
        if (muscleGroupMap[part]) return muscleGroupMap[part];
      }
      return 'Full Body';
    };

    for (const exercise of mapping) {
      const muscleGroup = getMuscleGroup(exercise.muscleGroup);
      ins.run(exercise.exerciseName, muscleGroup, exercise.filename, 'beginner');
    }
  } catch (err) {
    console.log('Stretching exercises seeding skipped (likely during setup)');
  }
}

function seedStretchingExercisesToMainTable() {
  // Check if Gymvisual stretching exercises already seeded (look for specific Gymvisual exercise)
  const check = db.prepare('SELECT id FROM exercises WHERE name = ?').get('Front and Back Neck Stretch');
  if (check) return;

  const fs = require('fs');
  const path = require('path');

  try {
    const mappingPath = path.join(__dirname, '../../../frontend/public/exercise-gifs/mapping.json');
    if (!fs.existsSync(mappingPath)) {
      console.log('Mapping file not found at:', mappingPath);
      return;
    }

    let content = fs.readFileSync(mappingPath, 'utf8');
    // Remove BOM if present
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }
    const mapping = JSON.parse(content);

    // Map muscle groups from filenames to canonical categories
    const muscleGroupMap = {
      'Neck': 'Neck',
      'Neck-FIX': 'Neck',
      'Shoulders': 'Shoulders',
      'Shoulders FIX': 'Shoulders',
      'Shoulder': 'Shoulders',
      'Back': 'Back',
      'Back FIX': 'Back',
      'Upper-Arms': 'Arms',
      'Upper Arms': 'Arms',
      'Forearms': 'Arms',
      'Hands': 'Arms',
      'Chest': 'Chest',
      'Chest FIX': 'Chest',
      'Hips': 'Hips',
      'Hips FIX': 'Hips',
      'Thighs': 'Legs',
      'Calves': 'Calves',
      'Calf': 'Calves',
      'Feet': 'Calves',
      'Waist': 'Core',
      'Stretching': 'Full Body',
      'Stretching FIX': 'Full Body',
      'Articulations': 'Full Body',
      'Yoga': 'Full Body',
      'Pilates': 'Full Body',
      'Isometric': 'Full Body'
    };

    const getMappedCategory = (rawMuscle) => {
      return muscleGroupMap[rawMuscle] || 'Full Body';
    };

    const ins = db.prepare(`
      INSERT INTO exercises (name, category, muscle_groups, difficulty, equipment)
      VALUES (?, ?, ?, ?, ?)
    `);

    let inserted = 0;
    for (const exercise of mapping) {
      const mappedCategory = getMappedCategory(exercise.muscleGroup);
      try {
        ins.run(
          exercise.exerciseName,
          mappedCategory,
          JSON.stringify([mappedCategory]),
          'beginner',
          'bodyweight'
        );
        inserted++;
      } catch (e) {
        // Skip duplicates or other insert errors
      }
    }
    console.log(`Seeded ${inserted} stretching exercises to main table`);
  } catch (err) {
    console.log('Stretching exercises seeding to main table error:', err.message);
  }
}

function seedWellnessContent() {
  const count = db.prepare('SELECT COUNT(*) as n FROM wellness_content').get();
  if (count.n > 0) return;

  const insert = db.prepare(`
    INSERT INTO wellness_content (type, subtype, title, description, duration_minutes, content, difficulty, is_featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Mindfulness & Meditation
  insert.run('mindfulness', 'pre-workout', 'Quick Mindset Reset', 'A fast 2-minute focus exercise before training to clear your head and set your intention.', 2,
    JSON.stringify(["Find a comfortable seated position and close your eyes.", "Take 3 slow, deep breaths   in through the nose, out through the mouth.", "On each exhale, release any tension you're carrying.", "Set a clear intention for your session. What do you want to achieve today?", "Open your eyes, take one more deep breath, and go train."]), 'beginner', 0);

  insert.run('mindfulness', 'pre-workout', 'Pre-Workout Focus', 'A 5-minute guided session to prime your mind and body before training.', 5,
    JSON.stringify(["Sit or lie in a comfortable position. Close your eyes.", "Breathe in for 4 counts, hold for 4, exhale for 4. Repeat 3 times.", "Visualise yourself performing today's session with strength and confidence.", "Feel your muscles warm and ready. Your body is capable and prepared.", "Picture the outcome you want   how will you feel after finishing this session?", "Take one deep breath, open your eyes, and channel that energy into your workout."]), 'beginner', 1);

  insert.run('mindfulness', 'morning', 'Morning Clarity Meditation', 'Start your day with a clear, focused mind. Perfect before breakfast or your morning session.', 5,
    JSON.stringify(["Sit comfortably with your spine tall. Place your hands on your knees.", "Close your eyes and take 5 deep breaths, letting each exhale be longer than the inhale.", "Scan your body from head to toe. Notice any areas of tension and breathe into them.", "Think of 3 things you are grateful for in your training journey.", "Set one intention for today   one quality you will bring to everything you do.", "Slowly return your awareness to the room. Wiggle fingers and toes, then open your eyes."]), 'beginner', 0);

  insert.run('mindfulness', 'post-workout', 'Post-Workout Gratitude', 'Wind down and appreciate what your body just accomplished. A 10-minute recovery meditation.', 10,
    JSON.stringify(["Lie on your back in savasana or sit comfortably. Allow your breathing to slow.", "Close your eyes and take 5 deep breaths. Let your heart rate come down naturally.", "Bring awareness to the parts of your body you worked today. Thank each muscle group.", "Replay one moment from your session where you pushed through and felt strong.", "Acknowledge your effort   consistency is the greatest achievement in fitness.", "Take 3 final deep breaths. With each exhale, let go of any frustration or self-criticism.", "Open your eyes slowly. Smile   you showed up today and that is everything."]), 'beginner', 0);

  insert.run('mindfulness', 'sleep', 'Deep Body Scan for Sleep', 'A 15-minute progressive relaxation to help you recover fully and sleep deeply after training.', 15,
    JSON.stringify(["Lie down in bed. Let your body become heavy and sink into the mattress.", "Close your eyes. Take 5 slow breaths, making each exhale twice as long as the inhale.", "Bring awareness to your feet. Consciously relax every muscle in your feet and toes.", "Move up to your calves, then thighs. Feel all tension melt away completely.", "Relax your hips, lower back, and abdomen. Let your belly rise and fall with each breath.", "Relax your chest, shoulders, and arms right down to your fingertips.", "Soften your neck, jaw, face, and the muscles around your eyes.", "Your whole body is relaxed and at ease. Your training today has made you stronger.", "Continue breathing slowly. You are safe, you are recovering, you are growing."]), 'intermediate', 0);

  insert.run('mindfulness', 'general', 'Performance Visualisation', 'A 20-minute guided visualisation session to mentally rehearse your best performance.', 20,
    JSON.stringify(["Find a quiet space and sit or lie comfortably. Close your eyes.", "Take 10 deep breaths to transition from your everyday mind to a performance mindset.", "Imagine yourself arriving at your training environment feeling confident and prepared.", "Begin to walk through your ideal session in vivid detail   every movement, every rep.", "See yourself handling challenges with calm determination. Obstacles make you stronger.", "Feel the physical sensations: strength in your muscles, power in your movements.", "Visualise completing your session and feeling deeply satisfied with your effort.", "See the longer-term version of yourself   months of this consistency paying off.", "Breathe deeply for 2 minutes, holding this vision of your best self.", "When ready, open your eyes and carry this confidence forward into your day."]), 'intermediate', 0);

  // Breathing Exercises
  insert.run('breathing', 'pre-workout', 'Box Breathing for Focus', 'The go-to pre-workout breathing technique used by athletes and military personnel to enter peak focus state.', 5,
    JSON.stringify({"pattern": {"inhale": 4, "hold_in": 4, "exhale": 4, "hold_out": 4}, "rounds": 6, "cues": ["Sit upright with your feet flat on the floor.", "This is box breathing   each side of the box is 4 seconds.", "Use this before any session where focus is critical.", "You will feel calmer and more centred after 6 rounds."]}), 'beginner', 1);

  insert.run('breathing', 'post-workout', '4-7-8 Recovery Breath', 'Activates your parasympathetic nervous system to accelerate recovery and reduce post-workout cortisol.', 5,
    JSON.stringify({"pattern": {"inhale": 4, "hold_in": 7, "exhale": 8, "hold_out": 0}, "rounds": 5, "cues": ["This technique lowers heart rate and stress hormones rapidly.", "The extended exhale is the key   it triggers the relaxation response.", "Best used immediately after training or before sleep.", "If 7-second hold feels too long, start with 4-5 and build up."]}), 'beginner', 0);

  insert.run('breathing', 'energise', 'Energising Breath', 'A quick 2-minute breathing sequence to boost energy and mental clarity without caffeine.', 2,
    JSON.stringify({"pattern": {"inhale": 2, "hold_in": 0, "exhale": 2, "hold_out": 0}, "rounds": 20, "cues": ["Breathe in and out rapidly through the nose like a bellows.", "This increases oxygen and stimulates the sympathetic nervous system.", "You may feel slightly lightheaded   this is normal and passes quickly.", "Follow with one deep slow breath to ground yourself before training."]}), 'beginner', 0);

  insert.run('breathing', 'recovery', 'Diaphragmatic Breathing', 'Learn to breathe correctly using your diaphragm. Improves oxygen delivery and reduces fatigue.', 10,
    JSON.stringify({"pattern": {"inhale": 5, "hold_in": 0, "exhale": 6, "hold_out": 0}, "rounds": 10, "cues": ["Place one hand on your chest, one on your belly.", "As you inhale, only your belly hand should rise   chest stays still.", "This activates full lung capacity and improves exercise performance.", "Practice this daily to retrain your default breathing pattern."]}), 'beginner', 0);

  insert.run('breathing', 'recovery', 'Coherent Breathing', 'Breathe at 5 breaths per minute to maximise heart rate variability and accelerate recovery.', 10,
    JSON.stringify({"pattern": {"inhale": 6, "hold_in": 0, "exhale": 6, "hold_out": 0}, "rounds": 8, "cues": ["Research shows 6-second in / 6-second out optimises the nervous system.", "This is the most researched breathing pattern for HRV improvement.", "Best performed after training or before sleep.", "Try to relax completely   let each breath feel effortless and smooth."]}), 'intermediate', 0);

  // Rest Day Content
  insert.run('rest_day', 'stretching', 'Full Body Morning Stretch', 'A complete 15-minute stretching routine to mobilise every major joint and muscle group.', 15,
    JSON.stringify({"exercises": [{"name": "Neck Rolls", "duration": "30s each direction", "instruction": "Slowly roll your head in a large circle. Avoid any painful positions."}, {"name": "Shoulder Cross-Body Stretch", "duration": "30s each side", "instruction": "Pull one arm across your chest. Keep your shoulder down and breathe deeply."}, {"name": "Chest Opener", "duration": "60s", "instruction": "Clasp hands behind your back, squeeze shoulder blades together and lift arms gently."}, {"name": "Standing Hip Flexor Lunge", "duration": "45s each side", "instruction": "Step one foot forward into a lunge. Push hips forward to feel the front hip stretch. Keep torso tall."}, {"name": "Seated Hamstring Stretch", "duration": "45s each side", "instruction": "Sit on the floor with one leg extended. Reach toward your toes, keeping your back flat."}, {"name": "Seated Pigeon Pose", "duration": "60s each side", "instruction": "Cross one ankle over the opposite knee. Sit tall or lean forward to increase the stretch."}, {"name": "Child's Pose", "duration": "60s", "instruction": "Kneel and sit back toward your heels, arms extended forward on the floor. Breathe into your lower back."}, {"name": "Spinal Twist", "duration": "45s each side", "instruction": "Lie on your back, bring one knee across your body. Extend the same arm outward and breathe."}]}), 'beginner', 1);

  insert.run('rest_day', 'stretching', 'Hip Flexor Release Sequence', 'Target the hip flexors which tighten after heavy leg training or prolonged sitting.', 10,
    JSON.stringify({"exercises": [{"name": "Kneeling Hip Flexor Stretch", "duration": "60s each side", "instruction": "Kneel on one knee with the other foot forward. Tuck your pelvis and shift weight forward until you feel the front of the rear hip stretching."}, {"name": "Couch Stretch", "duration": "60s each side", "instruction": "Place one foot up on a wall or sofa behind you, other foot on the floor. Hold position and breathe."}, {"name": "Psoas March (Standing)", "duration": "30 reps each side", "instruction": "Stand tall and drive one knee up to hip height. Lower slowly. Maintains hip flexor strength and mobility."}, {"name": "90/90 Hip Stretch", "duration": "60s each side", "instruction": "Sit with both knees at 90 degrees, one in front and one to the side. Keep torso upright and lean forward slightly."}, {"name": "Happy Baby Pose", "duration": "60s", "instruction": "Lie on your back, grab the outer edges of your feet and draw knees toward armpits. Rock gently side to side."}]}), 'beginner', 0);

  insert.run('rest_day', 'foam-rolling', 'Lower Body Foam Rolling Guide', 'Release tension in the quads, hamstrings, glutes and IT band after leg day.', 15,
    JSON.stringify({"exercises": [{"name": "Quad Roll", "duration": "60s each side", "instruction": "Lie face down, roll from hip to knee. Pause on any tender spots for 10-15 seconds."}, {"name": "IT Band Roll", "duration": "60s each side", "instruction": "Lie on your side, roll from hip to knee along the outer thigh. This area is often very tight."}, {"name": "Hamstring Roll", "duration": "60s each side", "instruction": "Sit with the roller under one thigh. Roll from just below the glute to above the knee."}, {"name": "Glute & Piriformis Roll", "duration": "60s each side", "instruction": "Sit on the roller, cross one ankle over the opposite knee. Roll in small circles on the glute."}, {"name": "Calf Roll", "duration": "60s each side", "instruction": "Place the roller under one calf. Cross the other ankle on top for added pressure. Roll slowly."}]}), 'beginner', 0);

  insert.run('rest_day', 'foam-rolling', 'Upper Body Tension Release', 'Target the thoracic spine, lats, and shoulders to relieve the tightness that builds from training.', 10,
    JSON.stringify({"exercises": [{"name": "Thoracic Spine Roll", "duration": "90s", "instruction": "Lie on your back with the roller behind your shoulder blades. Support your head with hands. Arch over the roller segment by segment."}, {"name": "Lat Roll", "duration": "60s each side", "instruction": "Lie on your side with arm extended overhead. Roll from armpit down to lower rib area slowly."}, {"name": "Pec & Shoulder Roll", "duration": "45s each side", "instruction": "Place roller at the front of one shoulder. Lie face down and roll across the pec and front shoulder."}, {"name": "Upper Trap & Neck Base", "duration": "45s each side", "instruction": "Place roller at the base of the neck. Tilt head gently to one side. Use minimal pressure here."}]}), 'beginner', 0);

  insert.run('rest_day', 'active-recovery', 'Active Recovery Walk Guide', 'Light aerobic movement promotes blood flow to muscles, accelerating repair and reducing DOMS.', 30,
    JSON.stringify({"exercises": [{"name": "Warm-Up Walk (5 min)", "duration": "5 minutes", "instruction": "Start at a very easy pace   4/10 effort. Focus on breathing naturally and relaxing your shoulders."}, {"name": "Main Walk (20 min)", "duration": "20 minutes", "instruction": "Maintain a comfortable conversational pace   5/10 effort. You should be able to hold a full conversation. Avoid hills if legs are very sore."}, {"name": "Cool-Down Walk (5 min)", "duration": "5 minutes", "instruction": "Slow your pace back down. Notice how your muscles feel compared to when you started."}, {"name": "Post-Walk Stretch", "duration": "Recommended", "instruction": "Use this as a perfect opportunity to do the Full Body Morning Stretch immediately after."}]}), 'beginner', 0);

  // Mental Wellness Tips
  insert.run('mental_wellness', 'recovery', 'The Power of Rest Days', 'Understanding why rest is not laziness   it is where the real progress happens.', 0,
    JSON.stringify({"body": ["Many people fear rest days, worrying that they will lose progress or fall behind. The truth is the opposite: rest days are when your body actually builds the strength you earned in training.", "During exercise, you create tiny tears in muscle fibres. Growth happens during repair   and repair requires rest, sleep, and nutrition. Training without adequate rest is like renovating a house while it is still on fire.", "Research consistently shows that athletes who respect recovery outperform those who train more but sleep less. A well-rested body lifts heavier, moves faster, and stays injury-free longer.", "Signs you need a rest day: persistent fatigue, declining performance, elevated resting heart rate, irritability, disrupted sleep, nagging minor injuries. These are not signs of weakness   they are biological data."], "key_points": ["Rest days accelerate muscle growth and strength gains", "Aim for 1-2 full rest days per week minimum", "Active recovery (walks, light stretching) is also valuable on rest days", "Sleep is your most powerful performance-enhancing tool   prioritise 7-9 hours"]}), 'beginner', 1);

  insert.run('mental_wellness', 'mindset', 'Building a Positive Training Mindset', 'The mental habits that separate athletes who progress consistently from those who stay stuck.', 0,
    JSON.stringify({"body": ["Your mindset is trained just like your body. The thoughts you repeat become automatic, and automatic thoughts drive behaviour. Building a positive training mindset is not about being unrealistically cheerful   it is about developing honest, constructive self-talk.", "Start by noticing your internal commentary during and after sessions. Most people are far harsher toward themselves than they would ever be toward a friend. Would you tell a training partner they are weak for struggling on a difficult set? Then do not tell yourself that.", "Progress in fitness is non-linear. There will be weeks where everything clicks, and weeks where nothing does. Both are normal. The defining trait of every long-term successful athlete is the ability to show up consistently regardless of how they feel."], "key_points": ["Replace 'I failed' with 'I am learning what works for me'", "Compare your current self to your past self   not to others", "Celebrate the process, not just outcomes", "Use setbacks as data, not as character verdicts"]}), 'beginner', 0);

  insert.run('mental_wellness', 'motivation', 'Overcoming Comparison in Fitness', 'How to stop the comparison trap from undermining your genuine progress.', 0,
    JSON.stringify({"body": ["Social media has made comparison the default mode of fitness culture. We see highlight reels   peak performances, perfect meals, ideal bodies   and compare them to our everyday reality. This is a losing game that no one can win.", "Every person you see in the gym has a completely different genetic background, training history, lifestyle, and goal. Comparing your week 8 to someone else's year 3 is not just unfair   it is genuinely meaningless information.", "The only comparison that produces useful data is you vs. you. Are you lifting more than you were three months ago? Recovering better? Sleeping more consistently? Feeling stronger? These are the metrics that matter."], "key_points": ["Unfollow or mute accounts that make you feel worse about yourself", "Track your own personal records and celebrate them loudly", "Remember: most impressive people in the gym started exactly where you are", "Your journey timeline is your own   respect it"]}), 'beginner', 0);

  insert.run('mental_wellness', 'motivation', 'Celebrating Non-Scale Victories', 'Fitness success measured beyond weight: the metrics that reflect real, lasting change.', 0,
    JSON.stringify({"body": ["For many people, the scales become a daily source of anxiety that has almost nothing to do with actual fitness progress. Body weight fluctuates by 1-3kg daily based on hydration, food volume, hormones, and inflammation   none of which indicate fat loss or muscle gain.", "Non-scale victories are the honest scoreboard of your fitness journey. They include: lifting heavier, moving more freely, sleeping better, having more energy, fitting into clothes differently, recovering faster, feeling less stressed, and simply enjoying the process more.", "When you shift focus from a number to these lived experiences, training becomes intrinsically rewarding rather than punitive. And intrinsic motivation is the only kind that lasts long-term."], "key_points": ["Log strength improvements weekly   these compound dramatically over months", "Notice energy levels, mood, and sleep quality as fitness markers", "Take monthly progress photos rather than daily weigh-ins", "Celebrate attendance and consistency above all else"]}), 'beginner', 0);

  insert.run('mental_wellness', 'mindset', 'Consistency Over Perfection', 'Why showing up imperfectly beats the perfect plan you never start.', 0,
    JSON.stringify({"body": ["Perfectionism is the enemy of progress in fitness. The person who trains three times per week for two years will always outperform the person who plans an elaborate five-day programme, maintains it perfectly for two weeks, then abandons it when life intervenes.", "The 80% rule is more powerful than any specific training philosophy: if you can consistently do 80% of what you planned, you will see extraordinary results over time. Flexibility beats rigidity every time.", "Bad sessions count. A half-effort training day still produces adaptation, still maintains the habit, still builds the identity of someone who shows up. You cannot build momentum from rest days alone."], "key_points": ["A mediocre workout is infinitely better than a skipped one", "Reduce your minimum commitment   a 20-minute session is always achievable", "Focus on never missing twice   one missed session is normal, two starts a new pattern", "Track consistency percentage, not just perfect weeks"]}), 'beginner', 0);

  // Stress Management
  insert.run('stress', 'post-training', 'Post-Training Stress Reset', 'Simple strategies to lower cortisol and shift from performance mode to recovery mode after sessions.', 0,
    JSON.stringify({"body": ["Training is a physical stressor   it is meant to be. But if you are already carrying high mental or emotional stress, the cumulative cortisol load can impair recovery and leave you feeling wired but tired after sessions.", "The transition from training to recovery is something you can deliberately manage. The goal is to activate your parasympathetic nervous system   the rest-and-digest state   within 30 minutes of finishing training.", "Practical tools: 5 minutes of slow deep breathing (4-7-8 or coherent breathing), a cool-to-cold shower, a protein and carbohydrate meal, and avoiding screens for 20 minutes after training."], "key_points": ["Avoid intense training within 3 hours of bedtime when stressed", "Cold exposure (shower) rapidly lowers cortisol and improves mood", "Slow breathing for 5 minutes post-session measurably reduces stress hormones", "High-stress periods require lower training volume, not higher willpower"]}), 'beginner', 1);

  insert.run('stress', 'pre-competition', 'Managing Pre-Competition Nerves', 'Turn anxiety into performance fuel with these evidence-based strategies.', 0,
    JSON.stringify({"body": ["Pre-event anxiety is a sign your body is preparing for high performance   it only becomes a problem when you interpret it as a sign that something is wrong. Research by Alison Wood Brooks at Harvard shows that reframing anxiety as excitement dramatically improves performance.", "The physiological symptoms of anxiety and excitement are identical: elevated heart rate, heightened senses, increased alertness. The only difference is the story you tell yourself about those sensations.", "Practical strategies: Establish a consistent warm-up routine (predictability lowers anxiety), use box breathing in the 20 minutes before, write down what you are most worried about and then reframe each worry as a preparation action."], "key_points": ["Say 'I am excited' rather than 'I am nervous'   this is evidence-based", "Control controllables: your warm-up, nutrition, sleep, mindset", "A pre-performance routine eliminates decision fatigue and builds confidence", "Mild anxiety actually improves performance   only severe anxiety hinders it"]}), 'intermediate', 0);

  insert.run('stress', 'daily', 'Work-Life-Training Balance', 'How to protect your training and recovery when life outside the gym is demanding.', 0,
    JSON.stringify({"body": ["One of the most underappreciated facts in sports science is that psychological stress and physical stress share the same recovery resources. A brutal work week leaves you less able to recover from training, even if your sleep and nutrition are perfect.", "During high-stress periods in life, the intelligent approach to training is to reduce intensity and volume, not increase willpower. Three moderate sessions with full recovery will produce better results than five sessions with compromised recovery.", "Protecting training also means protecting the habits around training: consistent sleep schedule, regular meals, and scheduled downtime. These are not luxuries   they are the infrastructure that makes everything else work."], "key_points": ["Reduce training volume by 20-40% during high-stress life periods", "Protect sleep as your first priority   everything else follows", "Training can be a stress relief valve, but not when overloaded on top of life stress", "Communicate with your PT if life demands are affecting your capacity to train and recover"]}), 'beginner', 0);

  insert.run('stress', 'sleep', 'Sleep Optimisation for Recovery', 'The most powerful recovery tool available to you   and how to use it properly.', 0,
    JSON.stringify({"body": ["Sleep is where the vast majority of muscle repair, hormonal restoration, and neural consolidation happens. No supplement, no training protocol, no nutrition strategy can compensate for chronic sleep deprivation.", "Growth hormone is primarily released during slow-wave sleep (stages 3-4). Cortisol is regulated during REM sleep. Muscle protein synthesis peaks during sleep. Miss sleep, and you are skipping the most important phase of your training programme.", "Sleep hygiene   the practices that improve sleep quality   is simple but often overlooked: consistent sleep/wake times (even on weekends), a cool dark room (18-19 C), no screens for 45 minutes before bed, no caffeine after 2pm, and a wind-down routine that signals to your body that sleep is coming."], "key_points": ["7-9 hours is optimal for athletes   6 or less measurably impairs performance", "Consistent sleep and wake times matter more than total hours", "A 20-minute nap between 1-3pm can restore afternoon performance", "Even partial sleep restriction (6h for 2 weeks) equals one full night of no sleep in cognitive impact"]}), 'beginner', 0);

  insert.run('stress', 'daily', 'Mindful Eating During Stressful Periods', 'How stress disrupts eating habits and practical ways to maintain good nutrition when life is demanding.', 0,
    JSON.stringify({"body": ["Chronic stress disrupts eating through several mechanisms: it elevates cortisol which increases cravings for high-calorie foods, it depletes willpower making mindful choices harder, and it disrupts hunger signals so you may not feel hungry even when your body needs fuel.", "During high-stress periods, the goal is not perfect nutrition   it is adequate nutrition with minimum friction. This means having simple, nutritious meals you can prepare quickly, keeping easy protein sources available, and not using food restriction as an additional stressor.", "Mindful eating during stress means slowing down meal times (even by 5 minutes), eating without screens when possible, and noticing the difference between physical hunger and emotional eating. You do not need to eliminate stress eating   just be aware of it."], "key_points": ["Prepare simple, reliable meals before high-stress weeks arrive", "Protein and vegetables first   these stabilise blood sugar and reduce cravings", "Eating too little under stress impairs recovery just as much as junk food", "Hydration suffers during stress   drink water before every meal as a baseline habit"]}), 'beginner', 0);
}

function seedDailyQuotes() {
  const count = db.prepare('SELECT COUNT(*) as n FROM daily_quotes').get();
  if (count.n > 0) return;

  const ins = db.prepare('INSERT INTO daily_quotes (quote, author, category) VALUES (?, ?, ?)');

  const quotes = [
    // Training
    ['The only bad workout is the one that didn\'t happen.', 'Unknown', 'fitness'],
    ['Your body can stand almost anything. It\'s your mind you have to convince.', 'Unknown', 'mindset'],
    ['Train hard, recover harder.', 'Unknown', 'fitness'],
    ['The pain you feel today will be the strength you feel tomorrow.', 'Unknown', 'fitness'],
    ['Don\'t wish for it. Work for it.', 'Unknown', 'mindset'],
    ['It never gets easier. You just get better.', 'Unknown', 'mindset'],
    ['Push harder than yesterday if you want a different tomorrow.', 'Unknown', 'mindset'],
    ['Every champion was once a contender who refused to give up.', 'Rocky Balboa', 'mindset'],
    ['Fall in love with taking care of yourself.', 'Unknown', 'wellness'],
    ['To give anything less than your best is to sacrifice the gift.', 'Steve Prefontaine', 'fitness'],
    ['Champions are made from something deep inside   a desire, a dream, a vision.', 'Muhammad Ali', 'mindset'],
    ['Once you see results, it becomes an addiction.', 'Unknown', 'fitness'],
    ['Success is usually the culmination of controlling failure.', 'Sylvester Stallone', 'mindset'],
    ['Strength does not come from the body. It comes from the will of the soul.', 'Unknown', 'fitness'],
    ['The secret of getting ahead is getting started.', 'Mark Twain', 'mindset'],
    // Mindset
    ['Whether you think you can or you think you can\'t   you\'re right.', 'Henry Ford', 'mindset'],
    ['The mind is the limit. As long as it can envision it, you can achieve it.', 'Arnold Schwarzenegger', 'mindset'],
    ['If you want something you\'ve never had, do something you\'ve never done.', 'Thomas Jefferson', 'mindset'],
    ['Success is not final, failure is not fatal: the courage to continue is what counts.', 'Winston Churchill', 'mindset'],
    ['You don\'t have to be extreme   just consistent.', 'Unknown', 'consistency'],
    ['Small steps in the right direction can turn out to be the biggest steps of your life.', 'Unknown', 'mindset'],
    ['It always seems impossible until it\'s done.', 'Nelson Mandela', 'mindset'],
    ['You are your only limit.', 'Unknown', 'mindset'],
    ['Don\'t stop when you\'re tired. Stop when you\'re done.', 'Unknown', 'fitness'],
    ['The difference between impossible and possible lies in determination.', 'Tommy Lasorda', 'mindset'],
    // Recovery & Balance
    ['Rest when weary. Refresh your body, mind, and spirit.', 'Ralph Marston', 'recovery'],
    ['Take care of your body. It\'s the only place you have to live.', 'Jim Rohn', 'wellness'],
    ['Recovery is not a sign of weakness   it is a sign of wisdom.', 'Unknown', 'recovery'],
    ['Sleep is the best meditation.', 'Dalai Lama', 'recovery'],
    ['Your future is created by what you do today, not tomorrow.', 'Robert Kiyosaki', 'mindset'],
    ['Listen to your body. It\'s the most intelligent thing you have.', 'Unknown', 'recovery'],
    ['The body achieves what the mind believes.', 'Unknown', 'mindset'],
    ['A year from now you\'ll wish you had started today.', 'Karen Lamb', 'mindset'],
    ['You deserve to be healthy, energetic, and strong.', 'Unknown', 'wellness'],
    ['Progress is progress, no matter how small.', 'Unknown', 'consistency'],
    // Nutrition
    ['Let food be thy medicine and medicine be thy food.', 'Hippocrates', 'nutrition'],
    ['Eat well, move daily, hydrate often, sleep lots, love your body.', 'Unknown', 'wellness'],
    ['Your diet is a bank account. Good food choices are good investments.', 'Bethenny Frankel', 'nutrition'],
    ['The groundwork of all happiness is health.', 'Leigh Hunt', 'wellness'],
    ['Fuel your body like the high-performance machine it is.', 'Unknown', 'nutrition'],
    ['Health is not about the weight you lose, but the life you gain.', 'Unknown', 'wellness'],
    ['Nourish to flourish.', 'Unknown', 'nutrition'],
    ['Take care of your body and your body will take care of you.', 'Unknown', 'wellness'],
    ['Energy and persistence conquer all things.', 'Benjamin Franklin', 'mindset'],
    // Consistency
    ['We are what we repeatedly do. Excellence, then, is not an act but a habit.', 'Aristotle', 'consistency'],
    ['One workout at a time. One day at a time. One meal at a time.', 'Unknown', 'consistency'],
    ['Motivation gets you started. Habit keeps you going.', 'Jim Ryun', 'consistency'],
    ['Discipline is doing what needs to be done, even if you don\'t want to.', 'Unknown', 'consistency'],
    ['Show up. Work hard. Be kind. Everything else is a bonus.', 'Unknown', 'mindset'],
    ['Don\'t count the days. Make the days count.', 'Muhammad Ali', 'mindset'],
    ['Consistency over intensity. Always.', 'Unknown', 'consistency'],
    ['You\'ve got what it takes   but it will take everything you\'ve got.', 'Unknown', 'mindset'],
    ['Believe in yourself and all that you are.', 'Christian D. Larson', 'mindset'],
    ['The hardest part is getting started. After that, momentum takes over.', 'Unknown', 'mindset'],
    ['You\'re not just building a body. You\'re building a life.', 'Unknown', 'wellness'],
    ['Every rep, every step, every choice   it all adds up.', 'Unknown', 'consistency'],
  ];

  for (const [quote, author, category] of quotes) {
    ins.run(quote, author, category);
  }
}

function seedAchievementBadges() {
  const count = db.prepare('SELECT COUNT(*) as n FROM achievement_badges').get();
  if (count.n > 0) return;

  const ins = db.prepare(`
    INSERT INTO achievement_badges (badge_type, display_name, description, icon_emoji, color)
    VALUES (?, ?, ?, ?, ?)
  `);

  const badges = [
    ['first_session', 'First Session', 'Completed your first training session', '??', '#10B981'],
    ['sessions_5', '5 Sessions', 'Completed 5 training sessions', '?', '#3B82F6'],
    ['block_complete', 'Block Champion', 'Completed a full block of 10 sessions', '??', '#F59E0B'],
    ['habit_30', '30-Day Habit', 'Maintained your habits for 30 consecutive days', '??', '#EF4444'],
    ['habit_60', '60-Day Habit', 'Maintained your habits for 60 consecutive days', '??', '#A855F7'],
    ['personal_best', 'Personal Best', 'Achieved a new personal best in measurements or weight', '??', '#8B5CF6'],
    ['attender_4weeks', 'Consistent Attender', 'No missed sessions for 4 weeks', '?', '#10B981'],
    ['early_bird', 'Early Bird', 'Completed 5 morning sessions before 9am', '??', '#FBBF24'],
    ['wellness_10', 'Wellness Warrior', 'Completed 10 meditation or wellness sessions', '??', '#06B6D4'],
    ['checkin_champion', 'Check-in Champion', 'Completed 8 weekly check-ins in a row', '??', '#EC4899']
  ];

  for (const [type, name, desc, emoji, color] of badges) {
    ins.run(type, name, desc, emoji, color);
  }
}
function seedStretchingGifs() {
  try {
    const fs = require('fs');
    const path = require('path');
    const gifPath = path.join(__dirname, '../../frontend-dist/exercise-gifs/mapping.json');
    if (!fs.existsSync(gifPath)) return;
    const raw = fs.readFileSync(gifPath, 'utf8').replace(/^\uFEFF/, '').trim();
    const mapping = JSON.parse(raw);
    const insert = db.prepare(`INSERT OR IGNORE INTO exercises (name, category, muscle_groups, difficulty, equipment, gif_url) VALUES (?, 'Stretching', ?, 'beginner', 'bodyweight', ?)`);
    for (const entry of mapping) {
      insert.run(entry.exerciseName, entry.muscleGroup || 'Full Body', '/exercise-gifs/exercise-gifs/' + entry.filename);
    }
    console.log('✅ Stretching GIFs seeded');
  } catch(e) {
    console.log('Stretching seed skipped:', e.message);
  }
}
function seedNutritionData() {
  try {
    const nc = db.prepare('SELECT COUNT(*) as n FROM nutrition_tips').get();
    if (nc.n > 0) return;
    require('./seedNutrition')(db);
    console.log('Nutrition seeded!');
  } catch(e) { console.log('Nutrition seed error:', e.message); }
}

// Add last_login column if not exists
try { db.exec("ALTER TABLE users ADD COLUMN last_login TEXT"); } catch(e) {}

module.exports = { getDb };

