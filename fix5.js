const fs = require("fs");
const file = "C:/Users/viana/BRAZILFIT/frontend/src/pages/client/ClientWellness.jsx";
let c = fs.readFileSync(file, "utf8");

// Replace MusicSelector with premium version
const oldMusicSelector = `function MusicSelector({ music }) {
  const track=music.tracks.find(t=>t.id===music.selectedId);
  const isFav=music.favouriteId===music.selectedId;
  return (
    <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
      {track && (
        <div style={{backgroundColor:'#1a1a1a',borderRadius:'10px',padding:'0.875rem',border:\`1px solid \${BORDER}\`}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'8px'}}>
            <Music size={13} color={MUTED}/>
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontFamily:"'Satoshi',system-ui",fontSize:'0.82rem',fontWeight:600,color:TEXT,margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{track.name}</p>
              <p style={{fontFamily:"'Satoshi',system-ui",fontSize:'0.68rem',color:MUTED,margin:0}}>by {track.artist}</p>
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'8px'}}>
            <Volume1 size={12} color={MUTED}/>
            <input type="range" min="0" max="1" step="0.05" value={music.volume} onChange={e=>music.setVolume(parseFloat(e.target.value))} style={{flex:1,accentColor:ORANGE,cursor:'pointer'}}/>
            <span style={{fontFamily:"'Satoshi',system-ui",fontSize:'0.65rem',color:MUTED,width:'28px',textAlign:'right'}}>{Math.round(music.volume*100)}%</span>
          </div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}>
            {[{fn:music.prevTrack,label:'\u23EE'},{fn:music.isPlaying?music.stop:music.play,label:music.isPlaying?'\u23F8':'\u25B6',main:true},{fn:music.nextTrack,label:'\u23ED'},{fn:music.toggleLoop,label:'\uD83D\uDD01',active:music.loopMode},{fn:music.toggleShuffle,label:'\uD83D\uDD00',active:music.shuffle},{fn:music.saveFavourite,label:isFav?'\u2665':'\u2661',yellow:isFav}].map((btn,i)=>(
              <button key={i} onClick={btn.fn} style={{width:btn.main?'36px':'28px',height:btn.main?'36px':'28px',borderRadius:'8px',border:'none',backgroundColor:btn.main?ORANGE:btn.active?\`\${ORANGE}22\`:btn.yellow?'transparent':'#252525',color:btn.main?'#000':btn.yellow?YELLOW:btn.active?ORANGE:'#c0c0c0',cursor:'pointer',fontSize:btn.main?'0.9rem':'0.8rem',display:'flex',alignItems:'center',justifyContent:'center',minHeight:'auto',minWidth:'auto',transition:'all 0.15s'}}>{btn.label}</button>
            ))}
          </div>
        </div>
      )}
      <div style={{display:'flex',gap:'6px',overflowX:'auto',paddingBottom:'2px'}}>
        {music.tracks.slice(0,12).map(t=>{const sel=music.selectedId===t.id;return(
          <button key={t.id} onClick={()=>music.setTrack(t.id)} style={{flexShrink:0,display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',padding:'6px 8px',borderRadius:'8px',border:\`1px solid \${sel?ORANGE:BORDER}\`,backgroundColor:sel?\`\${ORANGE}18\`:'transparent',cursor:'pointer',width:'58px',minHeight:'auto',transition:'all 0.15s'}}>
            <span style={{fontSize:'1rem'}}>\uD83C\uDFB5</span>
            <span style={{fontFamily:"'Satoshi',system-ui",fontSize:'0.58rem',color:sel?ORANGE:MUTED,fontWeight:600,textAlign:'center',lineHeight:1.2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',width:'100%'}}>{t.name.slice(0,9)}</span>
          </button>
        );})}
      </div>
    </div>
  );
}`;

const newMusicSelector = `function MusicSelector({ music }) {
  const track=music.tracks.find(t=>t.id===music.selectedId);
  return (
    <div style={{display:'flex',flexDirection:'column',gap:'12px',width:'100%'}}>
      <div style={{display:'flex',alignItems:'center',gap:'10px',background:'rgba(255,255,255,0.05)',borderRadius:14,padding:'12px 14px',border:'1px solid rgba(255,255,255,0.08)'}}>
        <div style={{width:40,height:40,borderRadius:10,background:\`linear-gradient(135deg,\${ORANGE},#FFD600)\`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem',flexShrink:0}}>{track?.emoji||'\uD83C\uDFB5'}</div>
        <div style={{flex:1,minWidth:0}}>
          <p style={{fontSize:'0.85rem',fontWeight:700,color:TEXT,margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{track?.name||'Select track'}</p>
          <p style={{fontSize:'0.7rem',color:MUTED,margin:'2px 0 0'}}>{track?.artist||''}</p>
        </div>
        <button onClick={music.isPlaying?music.stop:music.play} style={{width:44,height:44,borderRadius:22,border:'none',background:music.isPlaying?\`\${ORANGE}33\`:ORANGE,color:music.isPlaying?ORANGE:'#000',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:'1rem'}}>
          {music.isPlaying?'\u23F8':'\u25B6'}
        </button>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
        <Volume1 size={14} color={MUTED}/>
        <input type="range" min="0" max="1" step="0.05" value={music.volume} onChange={e=>music.setVolume(parseFloat(e.target.value))} style={{flex:1,accentColor:ORANGE,cursor:'pointer',height:4}}/>
        <span style={{fontSize:'0.65rem',color:MUTED,width:'30px',textAlign:'right'}}>{Math.round(music.volume*100)}%</span>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6}}>
        {music.tracks.slice(0,10).map(t=>{const sel=music.selectedId===t.id;return(
          <button key={t.id} onClick={()=>music.setTrack(t.id)} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,padding:'8px 4px',borderRadius:10,border:\`1px solid \${sel?ORANGE:'rgba(255,255,255,0.08)'}\`,background:sel?\`\${ORANGE}22\`:'rgba(255,255,255,0.03)',cursor:'pointer',minHeight:'auto',transition:'all 0.2s'}}>
            <span style={{fontSize:'1.3rem'}}>{t.emoji||'\uD83C\uDFB5'}</span>
            <span style={{fontSize:'0.52rem',color:sel?ORANGE:MUTED,fontWeight:600,textAlign:'center',lineHeight:1.2,width:'100%',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.name.split(' ')[0]}</span>
          </button>
        );})}
      </div>
    </div>
  );
}`;

if (c.includes('function MusicSelector')) {
  c = c.replace(oldMusicSelector, newMusicSelector);
  if (c.includes('function MusicSelector({ music }) {\n  const track=music.tracks.find')) {
    console.log('MusicSelector replaced');
  } else {
    // Try simpler replacement - just replace the track grid section
    c = c.replace(
      "      <div style={{display:'flex',gap:'6px',overflowX:'auto',paddingBottom:'2px'}}>\n        {music.tracks.slice(0,12).map(t=>{const sel=music.selectedId===t.id;return(\n          <button key={t.id} onClick={()=>music.setTrack(t.id)} style={{flexShrink:0,display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',padding:'6px 8px',borderRadius:'8px',border:`1px solid ${sel?ORANGE:BORDER}`,backgroundColor:sel?`${ORANGE}18`:'transparent',cursor:'pointer',width:'58px',minHeight:'auto',transition:'all 0.15s'}}>\n            <span style={{fontSize:'1rem'}}>\uD83C\uDFB5</span>\n            <span style={{fontFamily:\"'Satoshi',system-ui\",fontSize:'0.58rem',color:sel?ORANGE:MUTED,fontWeight:600,textAlign:'center',lineHeight:1.2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',width:'100%'}}>{t.name.slice(0,9)}</span>\n          </button>\n        );})}",
      "      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6}}>\n        {music.tracks.slice(0,10).map(t=>{const sel=music.selectedId===t.id;return(\n          <button key={t.id} onClick={()=>music.setTrack(t.id)} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,padding:'8px 4px',borderRadius:10,border:`1px solid ${sel?ORANGE:'rgba(255,255,255,0.08)'}`,background:sel?`${ORANGE}22`:'rgba(255,255,255,0.03)',cursor:'pointer',minHeight:'auto',transition:'all 0.2s'}}>\n            <span style={{fontSize:'1.3rem'}}>{t.emoji||'\uD83C\uDFB5'}</span>\n            <span style={{fontSize:'0.52rem',color:sel?ORANGE:MUTED,fontWeight:600,textAlign:'center',lineHeight:1.2,width:'100%',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.name.split(' ')[0]}</span>\n          </button>\n        );})}",
    );
    console.log('Partial track grid replaced');
  }
}

// Make the mindfulness player full-screen and bigger
c = c.replace(
  "style={{position:'fixed',inset:0,zIndex:50,backgroundColor:'#111',display:'flex',flexDirection:'column',alignItems:'center',padding:'2rem 1.25rem 2rem',overflowY:'auto'}}",
  "style={{position:'fixed',inset:0,zIndex:50,background:'linear-gradient(180deg,#0d0d0d 0%,#1a1008 100%)',display:'flex',flexDirection:'column',alignItems:'center',padding:'env(safe-area-inset-top,2rem) 1.5rem 2rem',overflowY:'auto',minHeight:'100dvh'}}"
);

// Bigger timer circle
c = c.replace(
  "style={{position:'relative',width:'140px',height:'140px',marginBottom:'1.5rem',flexShrink:0}}",
  "style={{position:'relative',width:'200px',height:'200px',marginBottom:'1.5rem',flexShrink:0}}"
);
c = c.replace(
  "const circ=2*Math.PI*44;",
  "const circ=2*Math.PI*88;"
);
c = c.replace(
  'viewBox="0 0 100 100">\n          <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6"/>\n          <circle cx="50" cy="50" r="44" fill="none" stroke={typeInfo.color} strokeWidth="6" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ*(1-progressPct/100)} style={{transition:\'stroke-dashoffset 1s linear\'}}/>',
  'viewBox="0 0 200 200">\n          <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>\n          <circle cx="100" cy="100" r="88" fill="none" stroke={typeInfo.color} strokeWidth="8" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ*(1-progressPct/100)} style={{transition:\'stroke-dashoffset 1s linear\'}}/>',
);
c = c.replace(
  "style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>\n          <p style={{fontFamily:\"'Clash Display',system-ui\",fontSize:'1.75rem',fontWeight:800,color:TEXT,margin:0,lineHeight:1}}>{fmt(remaining)}</p>\n          <p style={{fontFamily:\"'Satoshi',system-ui\",fontSize:'0.65rem',color:MUTED,margin:0}}>{session.duration_minutes} min</p>",
  "style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>\n          <p style={{fontSize:'2.8rem',fontWeight:900,color:TEXT,margin:0,lineHeight:1,letterSpacing:'-0.04em'}}>{fmt(remaining)}</p>\n          <p style={{fontSize:'0.7rem',color:MUTED,margin:'4px 0 0',letterSpacing:'0.1em',textTransform:'uppercase'}}>{session.duration_minutes} min session</p>",
);

// Bigger step text
c = c.replace(
  "style={{fontFamily:\"'Clash Display',system-ui\",fontSize:'1.5rem',fontWeight:300,color:TEXT,lineHeight:1.4,margin:'0 0 0.75rem',letterSpacing:'-0.01em'}}",
  "style={{fontSize:'1.4rem',fontWeight:300,color:TEXT,lineHeight:1.5,margin:'0 0 0.75rem',letterSpacing:'-0.01em',maxWidth:340}}"
);

// Bigger play button
c = c.replace(
  "style={{flex:1,padding:'0.875rem',background:`linear-gradient(135deg,${ORANGE},${YELLOW})`,border:'none',borderRadius:'10px',color:'#000',fontFamily:\"'Satoshi',system-ui\",fontSize:'0.875rem',fontWeight:800,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',minHeight:'auto'}}",
  "style={{flex:1,padding:'1rem',background:`linear-gradient(135deg,${ORANGE},${YELLOW})`,border:'none',borderRadius:14,color:'#000',fontSize:'1rem',fontWeight:900,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,minHeight:'auto',boxShadow:`0 4px 24px ${ORANGE}44`}}"
);

fs.writeFileSync(file, c, "utf8");
console.log("Done");