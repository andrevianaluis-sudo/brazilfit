const fs = require('fs');
let c = fs.readFileSync('messages.js', 'utf8');

// Find the PT send message notification line (sender_type = 'pt')
// It's in the route that has 'pt_user_id, sender_type, message_text' and clientId variable
const lines = c.split('\n');
let fixed = 0;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("run(clientId, req.user.id, 'pt', message_text)")) {
    // Look ahead for the notification line
    for (let j = i + 1; j < i + 5; j++) {
      if (lines[j].includes("INSERT INTO notifications") && lines[j].includes("New message from")) {
        lines[j] = "    try { db.prepare('INSERT INTO notifications (type, title, message, client_id) VALUES (?,?,?,?)').run('message', 'New message from your PT', message_text.length>60?message_text.substring(0,60)+'...':message_text, clientId); } catch(e) { console.error('Notif insert error:', e.message); }";
        fixed++;
        console.log('Fixed PT notification at line', j + 1);
        break;
      }
    }
  }
}

if (fixed > 0) {
  fs.writeFileSync('messages.js', lines.join('\n'));
  console.log('Done');
} else {
  console.log('NOT FOUND');
}
