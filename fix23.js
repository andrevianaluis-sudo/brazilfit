const fs = require("fs");
const file = "C:/Users/viana/BRAZILFIT/backend/src/routes/pt.js";
let c = fs.readFileSync(file, "utf8");

const route = `
// Seed client schedule and generate sessions
router.post("/clients/:id/schedule", (req, res) => {
  const db = getDb();
  const clientId = parseInt(req.params.id);
  const { slots } = req.body; // [{day_of_week, session_time}]
  if (!slots || !Array.isArray(slots)) return res.status(400).json({ error: "slots required" });

  // Clear existing schedule
  db.prepare("DELETE FROM client_schedules WHERE client_id = ?").run(clientId);

  // Insert new schedule
  const ins = db.prepare("INSERT INTO client_schedules (client_id, day_of_week, session_time) VALUES (?, ?, ?)");
  for (const slot of slots) {
    ins.run(clientId, slot.day_of_week, slot.session_time);
  }

  // Delete existing upcoming sessions
  db.prepare("DELETE FROM sessions WHERE client_id = ? AND status = 'upcoming'").run(clientId);

  // Get current block
  const block = db.prepare("SELECT id FROM blocks WHERE client_id = ? AND is_current = 1").get(clientId);
  if (!block) return res.json({ scheduled: slots.length, sessions: 0 });

  // Generate future sessions
  const today = new Date().toISOString().split("T")[0];
  const sessionDates = generateFutureSessions(today, slots, 10);
  const sessionIns = db.prepare("INSERT INTO sessions (client_id, block_id, scheduled_date, scheduled_time, status, session_type) VALUES (?, ?, ?, ?, 'upcoming', 'PT')");
  for (const s of sessionDates) {
    sessionIns.run(clientId, block.id, s.date, s.time);
  }

  res.json({ scheduled: slots.length, sessions: sessionDates.length });
});
`;

c = c.replace("module.exports = router;", route + "\nmodule.exports = router;");
fs.writeFileSync(file, c, "utf8");
console.log("Done");