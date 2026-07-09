const fs = require('fs');
let c = fs.readFileSync('pages/client/ClientSessions.jsx', 'utf8');
let steps = 0;

// Add a divider before sessions beyond the current block, and dim those sessions.
const oldMap = `              {upcoming.map((s,i)=>{
                const hrs=hoursUntil(s.scheduled_date,s.scheduled_time);const locked=hrs>=0&&hrs<24;const sessionsLeftAfter=Math.max(0,sessionsRemaining-i-1);
                return(`;

const newMap = `              {upcoming.map((s,i)=>{
                const hrs=hoursUntil(s.scheduled_date,s.scheduled_time);const locked=hrs>=0&&hrs<24;const sessionsLeftAfter=Math.max(0,sessionsRemaining-i-1);
                const beyondBlock=i>=sessionsRemaining;
                const isFirstBeyond=i===sessionsRemaining&&sessionsRemaining>0;
                return(
                  <div key={'wrap-'+s.id}>
                  {isFirstBeyond&&(
                    <div style={{display:'flex',alignItems:'center',gap:'10px',margin:'14px 0 10px'}}>
                      <div style={{flex:1,height:'1px',background:'rgba(255,255,255,0.1)'}}/>
                      <span style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.6rem',fontWeight:700,letterSpacing:'0.15em',color:MUTED,textTransform:'uppercase',whiteSpace:'nowrap'}}>Beyond current block</span>
                      <div style={{flex:1,height:'1px',background:'rgba(255,255,255,0.1)'}}/>
                    </div>
                  )}`;

if (c.includes(oldMap)) { c = c.replace(oldMap, newMap); steps++; }

// Dim the sessions beyond the block by adjusting opacity on the card div
const oldCard = `                  <div key={s.id} style={{borderRadius:'14px',padding:'1rem 1.25rem',background:locked?'rgba(239,68,68,0.06)':'linear-gradient(135deg,rgba(76,175,80,0.06),rgba(26,26,26,1))',border:\`1px solid \${locked?'rgba(239,68,68,0.2)':'rgba(76,175,80,0.2)'}\`,display:'flex',alignItems:'center',justifyContent:'space-between',gap:'12px'}}>`;
const newCard = `                  <div key={s.id} style={{borderRadius:'14px',padding:'1rem 1.25rem',background:locked?'rgba(239,68,68,0.06)':beyondBlock?'rgba(26,26,26,1)':'linear-gradient(135deg,rgba(76,175,80,0.06),rgba(26,26,26,1))',border:\`1px solid \${locked?'rgba(239,68,68,0.2)':beyondBlock?'rgba(255,255,255,0.06)':'rgba(76,175,80,0.2)'}\`,opacity:beyondBlock?0.55:1,display:'flex',alignItems:'center',justifyContent:'space-between',gap:'12px',marginBottom:'8px'}}>`;
if (c.includes(oldCard)) { c = c.replace(oldCard, newCard); steps++; }

// Close the wrapper div we opened
const oldEnd = `                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* History */}`;
const newEnd = `                  </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* History */}`;
if (c.includes(oldEnd)) { c = c.replace(oldEnd, newEnd); steps++; }

// Fix the "sessions left after this" text for beyond-block sessions
const oldText = `                          {sessionsLeftAfter} session{sessionsLeftAfter!==1?'s':''} left after this`;
const newText = `                          {beyondBlock?'Scheduled — not in current block':\`\${sessionsLeftAfter} session\${sessionsLeftAfter!==1?'s':''} left after this\`}`;
if (c.includes(oldText)) { c = c.replace(oldText, newText); steps++; }

fs.writeFileSync('pages/client/ClientSessions.jsx', c);
console.log('Done -', steps, 'of 4 changes applied');
