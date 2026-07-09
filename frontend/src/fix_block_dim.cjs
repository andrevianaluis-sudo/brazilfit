const fs = require('fs');
let c = fs.readFileSync('pages/client/ClientSessions.jsx', 'utf8');
let steps = 0;

// 1. Add beyondBlock flag
const oldLine = "                const hrs=hoursUntil(s.scheduled_date,s.scheduled_time);const locked=hrs>=0&&hrs<24;const sessionsLeftAfter=Math.max(0,sessionsRemaining-i-1);";
const newLine = "                const hrs=hoursUntil(s.scheduled_date,s.scheduled_time);const locked=hrs>=0&&hrs<24;const sessionsLeftAfter=Math.max(0,sessionsRemaining-i-1);const beyondBlock=i>=sessionsRemaining;";
if (c.includes(oldLine)) { c = c.replace(oldLine, newLine); steps++; }

// 2. Dim the card if beyond block
const oldCard = "                  <div key={s.id} style={{borderRadius:'14px',padding:'1rem 1.25rem',background:locked?'rgba(239,68,68,0.06)':'linear-gradient(135deg,rgba(76,175,80,0.06),rgba(26,26,26,1))',border:`1px solid ${locked?'rgba(239,68,68,0.2)':'rgba(76,175,80,0.2)'}`,display:'flex',alignItems:'center',justifyContent:'space-between',gap:'12px'}}>";
const newCard = "                  <div key={s.id} style={{borderRadius:'14px',padding:'1rem 1.25rem',background:locked?'rgba(239,68,68,0.06)':beyondBlock?'rgba(26,26,26,1)':'linear-gradient(135deg,rgba(76,175,80,0.06),rgba(26,26,26,1))',border:`1px solid ${locked?'rgba(239,68,68,0.2)':beyondBlock?'rgba(255,255,255,0.07)':'rgba(76,175,80,0.2)'}`,opacity:beyondBlock?0.6:1,display:'flex',alignItems:'center',justifyContent:'space-between',gap:'12px'}}>";
if (c.includes(oldCard)) { c = c.replace(oldCard, newCard); steps++; }

// 3. Change the subtitle text for beyond-block sessions
const oldText = "                          {sessionsLeftAfter} session{sessionsLeftAfter!==1?'s':''} left after this";
const newText = "                          {beyondBlock?'Scheduled \\u00b7 not in current block':`${sessionsLeftAfter} session${sessionsLeftAfter!==1?'s':''} left after this`}";
if (c.includes(oldText)) { c = c.replace(oldText, newText); steps++; }

fs.writeFileSync('pages/client/ClientSessions.jsx', c);
console.log('Done -', steps, 'of 3 changes applied');
