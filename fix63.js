const fs = require("fs");
const file = "C:/Users/viana/BRAZILFIT/backend/src/db/database.js";
let c = fs.readFileSync(file, "utf8");
const cols = ["wins TEXT","challenges TEXT","next_week_goals TEXT","workouts_felt TEXT","overall_mood TEXT","motivation_score INTEGER","stress_score INTEGER","goals_last_week TEXT","goals_achieved INTEGER","insight TEXT","sleep_hours REAL","water_glasses INTEGER","daily_steps INTEGER"];
const migration = cols.map(col => `try { db.exec("ALTER TABLE weekly_checkins ADD COLUMN ${col}"); } catch(e) {}`).join("\n");
c = c.replace("function runMigrations() {", "function runMigrations() {\n" + migration);
fs.writeFileSync(file, c, "utf8");
console.log("Done:", c.includes("wins TEXT"));
