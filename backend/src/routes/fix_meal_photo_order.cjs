const fs = require('fs');
let c = fs.readFileSync('diary.js', 'utf8');

// Extract the meal photo block that was wrongly placed at the top
const blockStart = "const _mealUpload = multer(";
const blockEnd = "// DELETE /diary/photo/:id — delete a meal photo (own only)";
const deleteRouteEnd = "  res.json({ message: 'Deleted' });\n});\n";

const startIdx = c.indexOf(blockStart);
if (startIdx === -1) { console.log('Block not found - already fixed?'); process.exit(0); }

// Find the end of the delete route (end of the whole misplaced block)
const delIdx = c.indexOf(blockEnd);
const afterDel = c.indexOf(deleteRouteEnd, delIdx) + deleteRouteEnd.length;

// The misplaced block runs from startIdx to afterDel
const block = c.substring(startIdx, afterDel);

// Remove it from its wrong location
c = c.substring(0, startIdx) + c.substring(afterDel);

// Also remove the duplicate sharp/multer requires at very top (keep them, they're fine, but _mealUpload needs to move)
// Re-insert the block (minus the _mealUpload const which we'll redefine) after authenticateToken import
const anchor = "const { authenticateToken } = require('../middleware/auth');";
c = c.replace(anchor, anchor + "\n\n" + block);

fs.writeFileSync('diary.js', c);
console.log('Done - meal photo routes moved below imports');
