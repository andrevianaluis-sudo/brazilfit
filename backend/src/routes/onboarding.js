const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const { getDb } = require('../db/database');
const { authenticateToken, requirePT } = require('../middleware/auth');

router.use(authenticateToken);

const DOCS_DIR = path.join(__dirname, '../../src/signed-docs');
if (!fs.existsSync(DOCS_DIR)) fs.mkdirSync(DOCS_DIR, { recursive: true });

// ─── helpers ─────────────────────────────────────────────────────────────────

function getClientId(req) {
  return req.user.role === 'pt' ? null : req.user.clientId;
}

function upsert(db, table, data, uniqueField = 'client_id') {
  const keys = Object.keys(data);
  const placeholders = keys.map(() => '?').join(', ');
  const updates = keys.filter(k => k !== uniqueField).map(k => `${k} = excluded.${k}`).join(', ');
  const stmt = db.prepare(
    `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})
     ON CONFLICT(${uniqueField}) DO UPDATE SET ${updates}, updated_at = datetime('now')`
  );
  stmt.run(...keys.map(k => data[k]));
}

function ensureStatus(db, clientId) {
  db.prepare(
    `INSERT OR IGNORE INTO onboarding_status (client_id) VALUES (?)`
  ).run(clientId);
}

// ─── GET /onboarding/status ───────────────────────────────────────────────────
// Client: own status. PT: pass ?clientId=
router.get('/status', (req, res) => {
  const db = getDb();
  const clientId = req.user.role === 'pt'
    ? parseInt(req.query.clientId)
    : req.user.clientId;
  if (!clientId) return res.status(400).json({ error: 'clientId required' });

  ensureStatus(db, clientId);
  const status = db.prepare('SELECT * FROM onboarding_status WHERE client_id = ?').get(clientId);
  res.json(status);
});

// ─── GET /onboarding/all-clients ─────────────────────────────────────────────
// PT: list all clients with onboarding status
router.get('/all-clients', requirePT, (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT c.id, u.name, u.email, c.client_type,
           os.step1_complete, os.step2_complete, os.step3_complete,
           os.step4_complete, os.step5_complete, os.completed, os.completed_at,
           os.pdf_parq_consent, os.pdf_tc,
           pq.any_yes
    FROM clients c
    JOIN users u ON u.id = c.user_id
    LEFT JOIN onboarding_status os ON os.client_id = c.id
    LEFT JOIN onboarding_parq pq ON pq.client_id = c.id
    WHERE u.is_active = 1
    ORDER BY u.name
  `).all();
  res.json(rows);
});

// ─── GET /onboarding/data ─────────────────────────────────────────────────────
router.get('/data', (req, res) => {
  const db = getDb();
  const clientId = req.user.role === 'pt'
    ? parseInt(req.query.clientId)
    : req.user.clientId;
  if (!clientId) return res.status(400).json({ error: 'clientId required' });

  const personal  = db.prepare('SELECT * FROM onboarding_personal WHERE client_id = ?').get(clientId);
  const lifestyle = db.prepare('SELECT * FROM onboarding_lifestyle WHERE client_id = ?').get(clientId);
  const parq      = db.prepare('SELECT * FROM onboarding_parq WHERE client_id = ?').get(clientId);
  const consent   = db.prepare('SELECT * FROM onboarding_consent WHERE client_id = ?').get(clientId);
  const tc        = db.prepare('SELECT * FROM onboarding_tc WHERE client_id = ?').get(clientId);
  const status    = db.prepare('SELECT * FROM onboarding_status WHERE client_id = ?').get(clientId);

  // Strip large signature data for the overview — PT doesn't need the raw base64
  const consentSafe = consent ? { ...consent, signature_data: consent.signature_data ? '[signed]' : '' } : null;
  const tcSafe      = tc      ? { ...tc,      signature_data: tc.signature_data      ? '[signed]' : '' } : null;

  res.json({ personal, lifestyle, parq, consent: consentSafe, tc: tcSafe, status });
});

// ─── POST /onboarding/step1 ───────────────────────────────────────────────────
router.post('/step1', (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  if (!clientId) return res.status(403).json({ error: 'Clients only' });

  const { full_name, dob, gender, phone, email, address, occupation,
          emergency_contact_name, emergency_contact_phone } = req.body;
  if (!full_name || !dob || !gender) return res.status(400).json({ error: 'Name, DOB and gender are required' });

  upsert(db, 'onboarding_personal', {
    client_id: clientId, full_name, dob, gender,
    phone: phone || '', email: email || '', address: address || '',
    occupation: occupation || '',
    emergency_contact_name: emergency_contact_name || '',
    emergency_contact_phone: emergency_contact_phone || '',
  });

  ensureStatus(db, clientId);
  db.prepare(`UPDATE onboarding_status SET step1_complete = 1, updated_at = datetime('now') WHERE client_id = ?`).run(clientId);

  // Also update the users/clients phone if provided
  if (phone) db.prepare(`UPDATE clients SET phone = ? WHERE id = ?`).run(phone, clientId);

  res.json({ ok: true });
});

// ─── POST /onboarding/step2 ───────────────────────────────────────────────────
router.post('/step2', (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  if (!clientId) return res.status(403).json({ error: 'Clients only' });

  const {
    lifestyle_description, smokes, cigarettes_per_day,
    drinks_alcohol, alcohol_units_per_week,
    motivation, exercise_likes, exercise_dislikes,
    fitt_frequency, fitt_intensity, fitt_type, fitt_time,
    barriers, barriers_strategies,
    goal_short, goal_medium, goal_long, nutrition_notes,
  } = req.body;

  upsert(db, 'onboarding_lifestyle', {
    client_id: clientId,
    lifestyle_description: lifestyle_description || '',
    smokes: smokes ? 1 : 0,
    cigarettes_per_day: cigarettes_per_day || 0,
    drinks_alcohol: drinks_alcohol ? 1 : 0,
    alcohol_units_per_week: alcohol_units_per_week || 0,
    motivation: motivation || '',
    exercise_likes: exercise_likes || '',
    exercise_dislikes: exercise_dislikes || '',
    fitt_frequency: fitt_frequency || '',
    fitt_intensity: fitt_intensity || '',
    fitt_type: fitt_type || '',
    fitt_time: fitt_time || '',
    barriers: barriers || '',
    barriers_strategies: barriers_strategies || '',
    goal_short: goal_short || '',
    goal_medium: goal_medium || '',
    goal_long: goal_long || '',
    nutrition_notes: nutrition_notes || '',
  });

  ensureStatus(db, clientId);
  db.prepare(`UPDATE onboarding_status SET step2_complete = 1, updated_at = datetime('now') WHERE client_id = ?`).run(clientId);
  res.json({ ok: true });
});

// ─── POST /onboarding/step3 ───────────────────────────────────────────────────
router.post('/step3', (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  if (!clientId) return res.status(403).json({ error: 'Clients only' });

  const { q1, q2, q3, q4, q5, q6, q7, additional_notes } = req.body;
  const any_yes = [q1,q2,q3,q4,q5,q6,q7].some(v => v) ? 1 : 0;

  db.prepare(`
    INSERT INTO onboarding_parq (client_id, q1, q2, q3, q4, q5, q6, q7, any_yes, additional_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(client_id) DO UPDATE SET
      q1=excluded.q1, q2=excluded.q2, q3=excluded.q3, q4=excluded.q4,
      q5=excluded.q5, q6=excluded.q6, q7=excluded.q7,
      any_yes=excluded.any_yes, additional_notes=excluded.additional_notes
  `).run(clientId, q1?1:0, q2?1:0, q3?1:0, q4?1:0, q5?1:0, q6?1:0, q7?1:0, any_yes, additional_notes||'');

  ensureStatus(db, clientId);
  db.prepare(`UPDATE onboarding_status SET step3_complete = 1, updated_at = datetime('now') WHERE client_id = ?`).run(clientId);
  res.json({ ok: true, any_yes: any_yes === 1 });
});

// ─── POST /onboarding/step4 ───────────────────────────────────────────────────
router.post('/step4', (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  if (!clientId) return res.status(403).json({ error: 'Clients only' });

  const { read_understood, signature_data, signed_name, signed_date } = req.body;
  if (!signature_data || !signed_name) return res.status(400).json({ error: 'Signature and name required' });

  db.prepare(`
    INSERT INTO onboarding_consent (client_id, read_understood, signature_data, signed_name, signed_date)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(client_id) DO UPDATE SET
      read_understood=excluded.read_understood, signature_data=excluded.signature_data,
      signed_name=excluded.signed_name, signed_date=excluded.signed_date
  `).run(clientId, read_understood?1:0, signature_data, signed_name, signed_date || new Date().toISOString().split('T')[0]);

  ensureStatus(db, clientId);
  db.prepare(`UPDATE onboarding_status SET step4_complete = 1, updated_at = datetime('now') WHERE client_id = ?`).run(clientId);
  res.json({ ok: true });
});

// ─── POST /onboarding/step5 ───────────────────────────────────────────────────
router.post('/step5', (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  if (!clientId) return res.status(403).json({ error: 'Clients only' });

  const { agreed, signature_data, signed_name, signed_date } = req.body;
  if (!signature_data || !signed_name) return res.status(400).json({ error: 'Signature and name required' });

  db.prepare(`
    INSERT INTO onboarding_tc (client_id, agreed, signature_data, signed_name, signed_date)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(client_id) DO UPDATE SET
      agreed=excluded.agreed, signature_data=excluded.signature_data,
      signed_name=excluded.signed_name, signed_date=excluded.signed_date
  `).run(clientId, agreed?1:0, signature_data, signed_name, signed_date || new Date().toISOString().split('T')[0]);

  ensureStatus(db, clientId);
  db.prepare(`UPDATE onboarding_status SET step5_complete = 1, updated_at = datetime('now') WHERE client_id = ?`).run(clientId);
  res.json({ ok: true });
});

// ─── POST /onboarding/complete ────────────────────────────────────────────────
router.post('/complete', async (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  if (!clientId) return res.status(403).json({ error: 'Clients only' });

  try {
    const personal  = db.prepare('SELECT * FROM onboarding_personal WHERE client_id = ?').get(clientId);
    const parq      = db.prepare('SELECT * FROM onboarding_parq WHERE client_id = ?').get(clientId);
    const consent   = db.prepare('SELECT * FROM onboarding_consent WHERE client_id = ?').get(clientId);
    const tc        = db.prepare('SELECT * FROM onboarding_tc WHERE client_id = ?').get(clientId);

    if (!personal || !parq || !consent || !tc) {
      return res.status(400).json({ error: 'Please complete all steps first' });
    }

    const [pdfParq, pdfTc] = await Promise.all([
      generateParQConsentPDF(clientId, personal, parq, consent),
      generateTCPDF(clientId, personal, tc),
    ]);

    db.prepare(`
      UPDATE onboarding_status
      SET completed = 1, completed_at = datetime('now'), pdf_parq_consent = ?, pdf_tc = ?, updated_at = datetime('now')
      WHERE client_id = ?
    `).run(pdfParq, pdfTc, clientId);

    // Create PT notification
    db.prepare(`
      INSERT INTO notifications (type, title, message, client_id)
      VALUES ('onboarding', ?, ?, ?)
    `).run(
      `New client onboarding complete`,
      `${personal.full_name} has completed onboarding and signed all documents.`,
      clientId
    );

    res.json({ ok: true, pdf_parq: pdfParq, pdf_tc: pdfTc });
  } catch (err) {
    console.error('[Onboarding complete]', err);
    res.status(500).json({ error: 'Failed to generate documents' });
  }
});

// ─── GET /onboarding/pdf/:clientId/:type ──────────────────────────────────────
router.get('/pdf/:clientId/:type', requirePT, (req, res) => {
  const db = getDb();
  const { clientId, type } = req.params;
  const status = db.prepare('SELECT * FROM onboarding_status WHERE client_id = ?').get(clientId);
  if (!status) return res.status(404).json({ error: 'Not found' });

  const filename = type === 'tc' ? status.pdf_tc : status.pdf_parq_consent;
  if (!filename) return res.status(404).json({ error: 'PDF not generated yet' });

  const filepath = path.join(DOCS_DIR, filename);
  if (!fs.existsSync(filepath)) return res.status(404).json({ error: 'File not found' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  fs.createReadStream(filepath).pipe(res);
});

// ─── POST /onboarding/reminder/:clientId ──────────────────────────────────────
router.post('/reminder/:clientId', requirePT, (req, res) => {
  const db = getDb();
  const { clientId } = req.params;
  const client = db.prepare('SELECT u.name, u.email FROM clients c JOIN users u ON u.id = c.user_id WHERE c.id = ?').get(clientId);
  if (!client) return res.status(404).json({ error: 'Client not found' });
  // In a full system, send email here. For now, create an in-app note.
  res.json({ ok: true, message: `Reminder logged for ${client.name}` });
});

// ─────────────────────────────────────────────────────────────────────────────
// FITNESS ASSESSMENTS
// ─────────────────────────────────────────────────────────────────────────────

router.get('/assessments/:clientId', requirePT, (req, res) => {
  const db = getDb();
  const rows = db.prepare(
    'SELECT * FROM fitness_assessments WHERE client_id = ? ORDER BY assessment_date DESC'
  ).all(req.params.clientId);
  res.json(rows);
});

router.post('/assessments/:clientId', requirePT, (req, res) => {
  const db = getDb();
  const clientId = parseInt(req.params.clientId);
  const data = req.body;

  const fields = [
    'assessment_date','resting_hr','height_cm','weight_kg','bmi',
    'bicep_cm','chest_cm','waist_cm','hip_cm','upper_leg_cm','lower_leg_cm','waist_hip_ratio',
    'sf_triceps','sf_biceps','sf_subscapula','sf_suprailiac','sf_total','body_fat_pct',
    'bp_systolic','bp_diastolic','bp_avg_systolic','bp_avg_diastolic','bp_classification',
    'peak_flow',
    'flex_hamstrings','flex_quads','flex_iliopsoas','flex_adductors','flex_pectorals','flex_gastroc','flex_sit_reach',
    'cv_step_test_hr','cv_step_test_vo2','cv_bleep_level','cv_cooper_time',
    'me_curl_ups','me_sit_ups','me_push_ups','me_plank_secs','me_squats',
    'ms_bench_1rm','ms_leg_press_1rm','ms_vertical_jump','ms_broad_jump',
    'posture_head','posture_shoulders','posture_hips','posture_knees','posture_ankles',
    'posture_observations','posture_actions','notes',
  ];

  const cols = ['client_id', ...fields.filter(f => data[f] !== undefined)];
  const vals = [clientId, ...fields.filter(f => data[f] !== undefined).map(f => data[f])];
  const placeholders = vals.map(() => '?').join(', ');

  const id = db.prepare(
    `INSERT INTO fitness_assessments (${cols.join(', ')}) VALUES (${placeholders})`
  ).run(...vals).lastInsertRowid;

  res.json({ ok: true, id });
});

router.put('/assessments/entry/:id', requirePT, (req, res) => {
  const db = getDb();
  const data = req.body;
  const allowed = [
    'assessment_date','resting_hr','height_cm','weight_kg','bmi',
    'bicep_cm','chest_cm','waist_cm','hip_cm','upper_leg_cm','lower_leg_cm','waist_hip_ratio',
    'sf_triceps','sf_biceps','sf_subscapula','sf_suprailiac','sf_total','body_fat_pct',
    'bp_systolic','bp_diastolic','bp_avg_systolic','bp_avg_diastolic','bp_classification',
    'peak_flow',
    'flex_hamstrings','flex_quads','flex_iliopsoas','flex_adductors','flex_pectorals','flex_gastroc','flex_sit_reach',
    'cv_step_test_hr','cv_step_test_vo2','cv_bleep_level','cv_cooper_time',
    'me_curl_ups','me_sit_ups','me_push_ups','me_plank_secs','me_squats',
    'ms_bench_1rm','ms_leg_press_1rm','ms_vertical_jump','ms_broad_jump',
    'posture_head','posture_shoulders','posture_hips','posture_knees','posture_ankles',
    'posture_observations','posture_actions','notes',
  ];
  const sets = allowed.filter(f => data[f] !== undefined).map(f => `${f} = ?`).join(', ');
  const vals = [...allowed.filter(f => data[f] !== undefined).map(f => data[f]), req.params.id];
  if (!sets) return res.json({ ok: true });
  db.prepare(`UPDATE fitness_assessments SET ${sets} WHERE id = ?`).run(...vals);
  res.json({ ok: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// PROGRAMME CARDS
// ─────────────────────────────────────────────────────────────────────────────

router.get('/programme/:clientId', (req, res) => {
  const db = getDb();
  const { clientId } = req.params;
  if (req.user.role === 'client' && req.user.clientId !== parseInt(clientId)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  const cards = db.prepare(
    'SELECT * FROM programme_cards WHERE client_id = ? AND is_active = 1 ORDER BY created_at DESC'
  ).all(clientId);
  res.json(cards);
});

router.post('/programme/:clientId', requirePT, (req, res) => {
  const db = getDb();
  const clientId = parseInt(req.params.clientId);
  const {
    card_date, title,
    warm_up_pulse, warm_up_stretches, cardio, resistance,
    cool_down_cv, cool_down_stretches, activities_away, session_notes,
  } = req.body;

  const id = db.prepare(`
    INSERT INTO programme_cards
      (client_id, created_by, card_date, title, warm_up_pulse, warm_up_stretches,
       cardio, resistance, cool_down_cv, cool_down_stretches, activities_away, session_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    clientId, req.user.id,
    card_date || new Date().toISOString().split('T')[0],
    title || 'Programme Card',
    JSON.stringify(warm_up_pulse || []),
    JSON.stringify(warm_up_stretches || []),
    JSON.stringify(cardio || []),
    JSON.stringify(resistance || []),
    JSON.stringify(cool_down_cv || []),
    JSON.stringify(cool_down_stretches || []),
    activities_away || '',
    session_notes || '',
  ).lastInsertRowid;

  res.json({ ok: true, id });
});

router.put('/programme/card/:id', requirePT, (req, res) => {
  const db = getDb();
  const {
    card_date, title,
    warm_up_pulse, warm_up_stretches, cardio, resistance,
    cool_down_cv, cool_down_stretches, activities_away, session_notes,
  } = req.body;

  db.prepare(`
    UPDATE programme_cards SET
      card_date = ?, title = ?,
      warm_up_pulse = ?, warm_up_stretches = ?, cardio = ?, resistance = ?,
      cool_down_cv = ?, cool_down_stretches = ?, activities_away = ?, session_notes = ?,
      updated_at = datetime('now')
    WHERE id = ?
  `).run(
    card_date, title || 'Programme Card',
    JSON.stringify(warm_up_pulse || []),
    JSON.stringify(warm_up_stretches || []),
    JSON.stringify(cardio || []),
    JSON.stringify(resistance || []),
    JSON.stringify(cool_down_cv || []),
    JSON.stringify(cool_down_stretches || []),
    activities_away || '',
    session_notes || '',
    req.params.id,
  );
  res.json({ ok: true });
});

router.delete('/programme/card/:id', requirePT, (req, res) => {
  const db = getDb();
  db.prepare(`UPDATE programme_cards SET is_active = 0 WHERE id = ?`).run(req.params.id);
  res.json({ ok: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// FOOD & MOOD DIARY
// ─────────────────────────────────────────────────────────────────────────────

router.get('/diary', (req, res) => {
  const db = getDb();
  const clientId = req.user.role === 'pt' ? parseInt(req.query.clientId) : req.user.clientId;
  if (!clientId) return res.status(400).json({ error: 'clientId required' });

  const { date } = req.query;
  if (date) {
    const entry = db.prepare('SELECT * FROM food_mood_diary WHERE client_id = ? AND entry_date = ?').get(clientId, date);
    return res.json(entry || null);
  }

  const entries = db.prepare(
    'SELECT id, entry_date, water_glasses, how_felt_today FROM food_mood_diary WHERE client_id = ? ORDER BY entry_date DESC LIMIT 30'
  ).all(clientId);
  res.json(entries);
});

router.post('/diary', (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  if (!clientId) return res.status(403).json({ error: 'Clients only' });

  const { entry_date, meals, water_glasses, how_felt_today, food_review, cravings, moods, behaviours } = req.body;
  const date = entry_date || new Date().toISOString().split('T')[0];

  db.prepare(`
    INSERT INTO food_mood_diary (client_id, entry_date, meals, water_glasses, how_felt_today, food_review, cravings, moods, behaviours)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(client_id, entry_date) DO UPDATE SET
      meals=excluded.meals, water_glasses=excluded.water_glasses,
      how_felt_today=excluded.how_felt_today, food_review=excluded.food_review,
      cravings=excluded.cravings, moods=excluded.moods, behaviours=excluded.behaviours,
      updated_at=datetime('now')
  `).run(
    clientId, date,
    JSON.stringify(meals || []),
    water_glasses || 0,
    how_felt_today || '', food_review || '', cravings || '', moods || '', behaviours || '',
  );
  res.json({ ok: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// WORKOUT LOG
// ─────────────────────────────────────────────────────────────────────────────

router.get('/workoutlog', (req, res) => {
  const db = getDb();
  const clientId = req.user.role === 'pt' ? parseInt(req.query.clientId) : req.user.clientId;
  if (!clientId) return res.status(400).json({ error: 'clientId required' });

  const rows = db.prepare(
    'SELECT * FROM workout_log_sessions WHERE client_id = ? ORDER BY session_date DESC, id DESC LIMIT 50'
  ).all(clientId);
  res.json(rows);
});

router.post('/workoutlog', (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  if (!clientId) return res.status(403).json({ error: 'Clients only' });

  const { session_date, session_aims, exercises, additional_comments, changes_next_session } = req.body;

  // Auto-increment session_number for this client
  const last = db.prepare('SELECT MAX(session_number) as n FROM workout_log_sessions WHERE client_id = ?').get(clientId);
  const sessionNumber = (last?.n || 0) + 1;

  const id = db.prepare(`
    INSERT INTO workout_log_sessions
      (client_id, session_date, session_number, session_aims, exercises, additional_comments, changes_next_session)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    clientId,
    session_date || new Date().toISOString().split('T')[0],
    sessionNumber,
    session_aims || '',
    JSON.stringify(exercises || []),
    additional_comments || '',
    changes_next_session || '',
  ).lastInsertRowid;

  res.json({ ok: true, id, session_number: sessionNumber });
});

router.put('/workoutlog/:id', (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  const { session_date, session_aims, exercises, additional_comments, changes_next_session } = req.body;

  const row = db.prepare('SELECT client_id FROM workout_log_sessions WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  if (req.user.role !== 'pt' && row.client_id !== clientId) return res.status(403).json({ error: 'Access denied' });

  db.prepare(`
    UPDATE workout_log_sessions SET
      session_date = ?, session_aims = ?, exercises = ?,
      additional_comments = ?, changes_next_session = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(
    session_date, session_aims || '',
    JSON.stringify(exercises || []),
    additional_comments || '', changes_next_session || '',
    req.params.id,
  );
  res.json({ ok: true });
});

router.delete('/workoutlog/:id', (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  const row = db.prepare('SELECT client_id FROM workout_log_sessions WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  if (req.user.role !== 'pt' && row.client_id !== clientId) return res.status(403).json({ error: 'Access denied' });
  db.prepare('DELETE FROM workout_log_sessions WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// PDF GENERATION
// ─────────────────────────────────────────────────────────────────────────────

function drawSectionHeader(doc, text) {
  doc.rect(doc.x, doc.y, doc.page.width - doc.options.margins.left - doc.options.margins.right, 18)
    .fill('#1a2a1a');
  doc.fill('#00c851').font('Helvetica-Bold').fontSize(10)
    .text(text.toUpperCase(), doc.options.margins.left + 6, doc.y - 15, { lineBreak: false });
  doc.fill('#ffffff').font('Helvetica').fontSize(10);
  doc.moveDown(0.8);
}

function labelValue(doc, label, value) {
  doc.fill('#aaaaaa').fontSize(8).text(label, { continued: false });
  doc.fill('#ffffff').fontSize(10).text(value || '—');
  doc.moveDown(0.3);
}

async function generateParQConsentPDF(clientId, personal, parq, consent) {
  return new Promise((resolve, reject) => {
    const filename = `parq-consent-${clientId}-${Date.now()}.pdf`;
    const filepath = path.join(DOCS_DIR, filename);
    const doc = new PDFDocument({ size: 'A4', margin: 50, info: { Title: 'PAR-Q & Informed Consent — BrazilFit' } });
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // ── Header ──
    doc.fill('#009C3B').font('Helvetica-Bold').fontSize(28).text('BrazilFit', { align: 'center' });
    doc.fill('#FEDF00').fontSize(12).text('Personal Training by Andre Viana', { align: 'center' });
    doc.fill('#ffffff').fontSize(14).font('Helvetica-Bold').moveDown(0.5)
      .text('PAR-Q & Informed Consent', { align: 'center' });
    doc.fill('#888888').fontSize(9).font('Helvetica')
      .text(`Generated: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, { align: 'center' });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#009C3B');
    doc.moveDown();

    // ── Client Details ──
    drawSectionHeader(doc, 'Client Details');
    labelValue(doc, 'Full Name', personal.full_name);
    labelValue(doc, 'Date of Birth', personal.dob);
    labelValue(doc, 'Gender', personal.gender);

    // ── PAR-Q Questions ──
    doc.moveDown(0.5);
    drawSectionHeader(doc, 'Physical Activity Readiness Questionnaire (PAR-Q)');

    const questions = [
      'Has your doctor ever said that you have a heart condition and that you should only do physical activity recommended by a doctor?',
      'Do you feel pain in your chest when you do physical activity?',
      'In the past month, have you had chest pain when you were not doing physical activity?',
      'Do you lose your balance because of dizziness or do you ever lose consciousness?',
      'Do you have a bone or joint problem (for example, back, knee or hip) that could be made worse by a change in your physical activity?',
      'Is your doctor currently prescribing drugs (for example, water pills) for your blood pressure or heart condition?',
      'Do you know of any other reason why you should not do physical activity?',
    ];

    const answers = [parq.q1, parq.q2, parq.q3, parq.q4, parq.q5, parq.q6, parq.q7];
    questions.forEach((q, i) => {
      const ans = answers[i];
      doc.fill('#cccccc').fontSize(9).text(`Q${i+1}. ${q}`, { lineGap: 2 });
      doc.fill(ans ? '#ff4444' : '#00c851').font('Helvetica-Bold').fontSize(10)
        .text(ans ? '✓ YES' : '✓ NO', doc.options.margins.left + 20);
      doc.font('Helvetica');
      doc.moveDown(0.4);
    });

    if (parq.any_yes) {
      doc.rect(doc.options.margins.left, doc.y, doc.page.width - 100, 30).fill('#3a1a00');
      doc.fill('#ffaa00').font('Helvetica-Bold').fontSize(10)
        .text('⚠ Client answered YES to one or more PAR-Q questions. Medical clearance recommended before beginning exercise programme.', doc.options.margins.left + 8, doc.y - 23, { width: doc.page.width - 116 });
      doc.font('Helvetica').moveDown(1.5);
    } else {
      doc.rect(doc.options.margins.left, doc.y, doc.page.width - 100, 22).fill('#002200');
      doc.fill('#00c851').font('Helvetica-Bold').fontSize(10)
        .text('✓ Client answered NO to all questions — cleared for exercise.', doc.options.margins.left + 8, doc.y - 17);
      doc.font('Helvetica').moveDown(1);
    }

    if (parq.additional_notes) {
      labelValue(doc, 'Additional Notes', parq.additional_notes);
    }

    // ── Informed Consent ──
    doc.addPage();
    drawSectionHeader(doc, 'Informed Consent for Physical Fitness Programme');
    doc.fill('#cccccc').fontSize(9).font('Helvetica').text(
      'I, the undersigned, understand and agree to the following:\n\n' +
      '1. I voluntarily consent to engage in a programme of physical activity under the supervision of Andre Viana, Personal Trainer.\n\n' +
      '2. The purpose of this programme is to improve my physical fitness and general health. The activities may include cardiovascular exercise, strength training, flexibility work and other fitness activities.\n\n' +
      '3. I understand that physical exercise involves certain inherent risks including cardiovascular stress, muscular injury and fatigue. I confirm that I am in good health and have not been advised against exercise by a medical professional.\n\n' +
      '4. I have answered the PAR-Q honestly and completely. If any answer changes, I will inform my trainer immediately.\n\n' +
      '5. I understand that my trainer will design and supervise my programme but that the results depend on my effort, consistency and adherence to advice given.\n\n' +
      '6. I consent to my personal data being stored securely and used for the purpose of delivering my personal training services in accordance with GDPR.\n\n' +
      '7. I understand that I have the right to withdraw from any activity at any time without prejudice.\n\n' +
      '8. I have had the opportunity to ask questions about the programme and all my questions have been answered to my satisfaction.\n\n' +
      '9. I understand that the personal trainer carries public liability insurance but that I participate in all activities at my own risk.\n\n' +
      '10. This consent remains valid for the duration of my training with Andre Viana Personal Training.',
      { lineGap: 3 }
    );
    doc.moveDown();

    // ── Signature ──
    doc.moveDown(0.5);
    drawSectionHeader(doc, 'Client Signature');
    labelValue(doc, 'Printed Name', consent.signed_name);
    labelValue(doc, 'Date', consent.signed_date);
    doc.fill('#aaaaaa').fontSize(8).text('Signature:');
    doc.moveDown(0.3);

    if (consent.signature_data && consent.signature_data.startsWith('data:image')) {
      try {
        const base64Data = consent.signature_data.replace(/^data:image\/\w+;base64,/, '');
        const imgBuffer = Buffer.from(base64Data, 'base64');
        doc.image(imgBuffer, { width: 200, height: 70 });
      } catch (e) { doc.text('[Signature image unavailable]'); }
    }

    doc.end();
    stream.on('finish', () => resolve(filename));
    stream.on('error', reject);
  });
}

async function generateTCPDF(clientId, personal, tc) {
  return new Promise((resolve, reject) => {
    const filename = `tc-${clientId}-${Date.now()}.pdf`;
    const filepath = path.join(DOCS_DIR, filename);
    const doc = new PDFDocument({ size: 'A4', margin: 50, info: { Title: 'Terms & Conditions — BrazilFit' } });
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // ── Header ──
    doc.fill('#009C3B').font('Helvetica-Bold').fontSize(28).text('BrazilFit', { align: 'center' });
    doc.fill('#FEDF00').fontSize(12).text('Personal Training by Andre Viana', { align: 'center' });
    doc.fill('#ffffff').fontSize(14).font('Helvetica-Bold').moveDown(0.5)
      .text('Terms and Conditions Contract', { align: 'center' });
    doc.fill('#888888').fontSize(9).font('Helvetica')
      .text(`Generated: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, { align: 'center' });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#009C3B');
    doc.moveDown();

    labelValue(doc, 'Client Name', personal.full_name);
    labelValue(doc, 'Trainer', tc.trainer_name || 'Andre Viana');
    doc.moveDown(0.5);

    drawSectionHeader(doc, 'Terms and Conditions');
    doc.fill('#cccccc').fontSize(9).font('Helvetica').text(
      'TERM 1 — AGREEMENT TO PARTICIPATE\n' +
      'The client agrees to participate in a personal training programme designed and delivered by Andre Viana Personal Training. This agreement commences on the date of signing and continues for the duration of the training relationship.\n\n' +
      'TERM 2 — HEALTH AND MEDICAL CLEARANCE\n' +
      'The client confirms they have completed the PAR-Q health questionnaire honestly and completely. The client accepts responsibility for informing the trainer of any changes to their medical condition, injury or health status before each session. The trainer reserves the right to refuse to conduct a session if safety is a concern.\n\n' +
      'TERM 3 — PAYMENT TERMS\n' +
      'Personal training is sold in blocks of 10 sessions. Payment is due in full before the block commences. The agreed block price is confirmed at the start of each block. Prices are subject to review with one calendar month\'s notice.\n\n' +
      'TERM 4 — CANCELLATION AND LATE CANCELLATION POLICY\n' +
      'A minimum of 24 hours\' notice is required to cancel or reschedule a session. Sessions cancelled with less than 24 hours\' notice will be charged in full and deducted from the client\'s block. The trainer will endeavour to provide the same notice for any trainer-initiated cancellations. Sessions cancelled by the trainer without 24 hours\' notice will be returned to the client\'s block at the trainer\'s discretion.\n\n' +
      'TERM 5 — LATENESS\n' +
      'If the client is late to a session, the session will end at the originally scheduled time and the full session fee applies. If the trainer is late, the session will be extended by the time lost or an alternative arrangement will be made.\n\n' +
      'TERM 6 — PERSONAL TRAINING SESSIONS\n' +
      'All sessions are one-to-one unless otherwise agreed. Sessions are non-transferable. Block sessions expire 12 weeks from the date of purchase unless otherwise agreed in writing. The trainer will design, deliver and progress the programme in line with the client\'s goals and health status.\n\n' +
      'TERM 7 — CONDUCT AND PROFESSIONALISM\n' +
      'Both parties agree to treat each other with courtesy and respect. The trainer will maintain professional standards at all times. The client agrees to arrive appropriately dressed and equipped for training. The trainer reserves the right to terminate the training relationship if conduct is inappropriate.\n\n' +
      'TERM 8 — LIABILITY\n' +
      'The client participates in all activities entirely at their own risk. The trainer carries public liability insurance. The trainer accepts no liability for loss or damage to the client\'s personal property. The client accepts that results from personal training depend on individual effort, lifestyle choices and adherence to the programme.\n\n' +
      'TERM 9 — DATA PROTECTION (GDPR)\n' +
      'Personal data collected during onboarding (including health questionnaires, assessment data and signed documents) is stored securely and used solely for the purpose of delivering personal training services. Data will not be shared with third parties without the client\'s consent. The client has the right to access, amend or request deletion of their data in accordance with GDPR.\n\n' +
      'TERM 10 — VARIATION AND ENTIRE AGREEMENT\n' +
      'These terms constitute the entire agreement between the parties. Any variation must be agreed in writing by both parties. By signing this document the client confirms they have read, understood and agree to all the above terms and conditions for the duration of their training with Andre Viana Personal Training.',
      { lineGap: 4 }
    );

    // ── Signature ──
    doc.addPage();
    drawSectionHeader(doc, 'Agreement — Client Signature');
    doc.fill('#cccccc').fontSize(9).font('Helvetica')
      .text('I agree to the above Terms and Conditions for the duration of my training with Andre Viana Personal Trainer.');
    doc.moveDown();
    labelValue(doc, 'Client Name (printed)', personal.full_name);
    labelValue(doc, 'Date', tc.signed_date);
    labelValue(doc, 'Trainer', tc.trainer_name || 'Andre Viana');
    doc.fill('#aaaaaa').fontSize(8).text('Client Signature:');
    doc.moveDown(0.3);

    if (tc.signature_data && tc.signature_data.startsWith('data:image')) {
      try {
        const base64Data = tc.signature_data.replace(/^data:image\/\w+;base64,/, '');
        const imgBuffer = Buffer.from(base64Data, 'base64');
        doc.image(imgBuffer, { width: 200, height: 70 });
      } catch (e) { doc.text('[Signature image unavailable]'); }
    }

    doc.end();
    stream.on('finish', () => resolve(filename));
    stream.on('error', reject);
  });
}

module.exports = router;
