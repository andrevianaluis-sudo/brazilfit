// Run this from C:\Users\viana\BRAZILFIT\frontend\src
const fs = require('fs');

function patch(file, replacements) {
  let c = fs.readFileSync(file, 'utf8');
  let count = 0;
  for (const [oldStr, newStr] of replacements) {
    if (c.includes(oldStr)) { c = c.split(oldStr).join(newStr); count++; }
    else console.log('  NOT FOUND in', file, ':', oldStr.substring(0, 40));
  }
  fs.writeFileSync(file, c);
  console.log(file, '-', count, 'applied');
}

// 1. Client Sessions page - remove block number
patch('pages/client/ClientSessions.jsx', [
  ['Block {user?.blockNumber||1}', 'Block']
]);

// 2. PT Block Tracker - remove block number
patch('pages/pt/PTBlockTracker.jsx', [
  ['Block {c.current_block_number} · £{c.block_price}', '£{c.block_price}']
]);

// 3. PT Client Profile - remove block number from header
patch('pages/pt/PTClientProfile.jsx', [
  ['Block {client.current_block_number} · Started {fmtDate(client.block_start_date)}', 'Started {fmtDate(client.block_start_date)}']
]);

console.log('Done');
