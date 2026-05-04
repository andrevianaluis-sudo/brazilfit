const fs = require("fs");
const file = "C:/Users/viana/BRAZILFIT/frontend/src/pages/client/ClientWellness.jsx";
let c = fs.readFileSync(file, "utf8");
// Fix broken emoji
c = c.replace(/\u00f0\u009f\u008e\u00b5/g, "\uD83C\uDFB5");
c = c.replace(/\u00f0\u009f\u008e\u00b9/g, "\uD83C\uDFB9");
c = c.replace(/\u00f0\u009f\u008c\u00bf/g, "\uD83C\uDF3F");
c = c.replace(/\u00f0\u009f\u0095\u0089\uef\ub8\u008f/g, "\uD83D\uDD49");
c = c.replace(/\u00f0\u009f\u0094\u00ae/g, "\uD83D\uDD2E");
c = c.replace(/\u00f0\u009f\u008e\u00b5/g, "\uD83C\uDFB5");
// Fix ambient emoji
c = c.replace(/\u00f0\u009f\u0094\u0087/g, "\uD83D\uDD07");
c = c.replace(/\u00f0\u009f\u008c\u00a7\uef\ub8\u008f/g, "\uD83C\uDF27");
// Fix section info emoji
c = c.replace(/\u00f0\u009f\u00a7\u0098/g, "\uD83E\uDDD8");
c = c.replace(/\u00f0\u009f\u0092\u00a8/g, "\uD83D\uDCA8");
c = c.replace(/\u00f0\u009f\u0092\u009a/g, "\uD83D\uDC9A");
c = c.replace(/\u00f0\u009f\u008c\u008a/g, "\uD83C\uDF0A");
fs.writeFileSync(file, c, "utf8");
console.log("Done");