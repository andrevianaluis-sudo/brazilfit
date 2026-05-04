const fs = require("fs");
const file = "C:/Users/viana/BRAZILFIT/backend/src/routes/sessions.js";
let c = fs.readFileSync(file, "utf8");
c = c.replace(
  "ORDER BY s.scheduled_date DESC, s.scheduled_time DESC",
  "ORDER BY s.scheduled_date ASC, s.scheduled_time ASC"
);
fs.writeFileSync(file, c, "utf8");
console.log("Done:", c.includes("ASC, s.scheduled_time ASC"));