import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BackButton from '../../components/BackButton';
import {
  Brain, Wind, Leaf, Heart, Waves, Crown, Play, Pause,
  ChevronDown, ChevronUp, Clock, X, CheckCircle,
  Volume2, Volume1, VolumeX, Music,
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const TYPES = [
  { key: 'mindfulness',     label: 'Mindfulness',  icon: Brain, color: '#a78bfa', bg: 'rgba(167,139,250,0.15)' },
  { key: 'breathing',       label: 'Breathing',    icon: Wind,  color: '#60a5fa', bg: 'rgba(96,165,250,0.15)'  },
  { key: 'rest_day',        label: 'Rest Day',     icon: Leaf,  color: '#4CAF50', bg: 'rgba(76,175,80,0.15)'   },
  { key: 'mental_wellness', label: 'Mental Health',icon: Heart, color: '#f472b6', bg: 'rgba(244,114,182,0.15)' },
  { key: 'stress',          label: 'Stress',       icon: Waves, color: '#2dd4bf', bg: 'rgba(45,212,191,0.15)'  },
];

const SECTION_INFO = {
  mindfulness:     { emoji: '🧘', text: 'Guided meditation sessions to sharpen focus and aid recovery' },
  breathing:       { emoji: '💨', text: 'Breathing techniques for pre-workout energy and post-workout calm' },
  rest_day:        { emoji: '🌿', text: 'Stretching routines and foam rolling guides for active recovery' },
  mental_wellness: { emoji: '💚', text: 'Tips and insights to build a stronger, healthier mindset' },
  stress:          { emoji: '🌊', text: 'Strategies to manage stress and protect your training progress' },
};

const FALLBACK_MUSIC_TRACKS = [
  { id:'tibetan', name:'Tibetan Bowls', artist:'DesiFreeMuzic', emoji:'🎵', url:'https://cdn.pixabay.com/download/audio/2025/07/04/audio_56496453ec.mp3?filename=desifreemusic-minimalistic-meditation-soundscape-with-tibetan-singing-bowls-369761.mp3', attribution:'Tibetan Bowls by DesiFreeMuzic (Pixabay)' },
  { id:'piano',   name:'Peaceful Piano',artist:'HarumachiMusic',emoji:'🎹', url:'https://cdn.pixabay.com/download/audio/2022/05/28/audio_b79a40aa49.mp3?filename=harumachimusic-peaceful-garden-healing-light-piano-for-meditation-zen-landscapes-112199.mp3', attribution:'Peaceful Piano by HarumachiMusic (Pixabay)' },
  { id:'flute',   name:'Nature & Flute',artist:'Siarhei_Korbut',emoji:'🌿', url:'https://cdn.pixabay.com/download/audio/2025/08/10/audio_d7b8695825.mp3?filename=siarhei_korbut-elven-flute-meditation-nature-remix-387545.mp3', attribution:'Nature & Flute by Siarhei_Korbut (Pixabay)' },
  { id:'om',      name:'Deep Om',      artist:'kalsstockmedia', emoji:'🕉️', url:'https://cdn.pixabay.com/download/audio/2024/08/04/audio_6729bddbf2.mp3?filename=kalsstockmedia-deep-om-chants-with-reverb-229614.mp3', attribution:'Deep Om by kalsstockmedia (Pixabay)' },
  { id:'binaural',name:'Binaural Beats',artist:'CHAKONG',       emoji:'🔮', url:'https://cdn.pixabay.com/download/audio/2023/12/19/audio_1a5566c7ca.mp3?filename=chakong-binaural-beats-alpha-sinewaves-meditation-focus-relax-7-hz-182096.mp3', attribution:'Binaural Beats by CHAKONG (Pixabay)' },
];

const PREF_TRACK_KEY = 'bf_music_track';
const PREF_VOL_KEY   = 'bf_music_vol';
const PREF_LOOP_KEY  = 'bf_music_loop';
const PREF_SHUFFLE_KEY = 'bf_music_shuffle';
const AMBIENT_OPTIONS = [
  { key:'silence', label:'Silence', emoji:'🔇' },
  { key:'rain',    label:'Rain',    emoji:'🌧️' },
  { key:'forest',  label:'Forest',  emoji:'🌿' },
];

const BG='#141414', SURFACE='#2a2a2a', SURFACE2='#333', BORDER='rgba(255,255,255,0.12)', TEXT='#fff', MUTED='#707070', ORANGE='#FF6B2B', YELLOW='#FFD600', GREEN='#4CAF50';

function buildAmbientNodes(ctx, type) {
  const sr=ctx.sampleRate, len=sr*10, buf=ctx.createBuffer(2,len,sr);
  for(let ch=0;ch<2;ch++){const d=buf.getChannelData(ch);if(type==='rain'){let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;for(let i=0;i<len;i++){const w=Math.random()*2-1;b0=0.99886*b0+w*0.0555179;b1=0.99332*b1+w*0.0750759;b2=0.96900*b2+w*0.1538520;b3=0.86650*b3+w*0.3104856;b4=0.55000*b4+w*0.5329522;b5=-0.7616*b5-w*0.0168980;d[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.13;b6=w*0.115926;}}else{for(let i=0;i<len;i++){const env=0.85+0.15*Math.sin((i/sr)*0.4*Math.PI);d[i]=(Math.random()*2-1)*0.14*env;}}}
  const source=ctx.createBufferSource();source.buffer=buf;source.loop=true;
  if(type==='rain'){const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1600;source.connect(lp);return{source,outputNode:lp};}
  const bp=ctx.createBiquadFilter();bp.type='bandpass';bp.frequency.value=1800;bp.Q.value=0.6;source.connect(bp);return{source,outputNode:bp};
}

function useMusicPlayer() {
  const initTrack=localStorage.getItem(PREF_TRACK_KEY)||FALLBACK_MUSIC_TRACKS[0].id;
  const initVol=parseFloat(localStorage.getItem(PREF_VOL_KEY)||'0.55');
  const initLoop=localStorage.getItem(PREF_LOOP_KEY)==='true';
  const initShuffle=localStorage.getItem(PREF_SHUFFLE_KEY)==='true';
  const [tracks,setTracks]=useState(FALLBACK_MUSIC_TRACKS);
  const [selectedId,setSelectedId]=useState(initTrack);
  const [favouriteId,setFavouriteId]=useState(initTrack);
  const [volume,setVolumeState]=useState(initVol);
  const [isPlaying,setIsPlaying]=useState(false);
  const [isLoading,setIsLoading]=useState(false);
  const [loopMode,setLoopModeState]=useState(initLoop);
  const [shuffle,setShuffleState]=useState(initShuffle);
  const [attribution,setAttribution]=useState('');
  const elRef=useRef(null),volRef=useRef(initVol),fadeRef=useRef(null);
  useEffect(()=>{fetch('/api/music/meditation').then(r=>r.json()).then(d=>{if(d.tracks?.length>0)setTracks([...d.tracks,...FALLBACK_MUSIC_TRACKS]);}).catch(()=>{});},[]);
  const clearFade=()=>{if(fadeRef.current){clearInterval(fadeRef.current);fadeRef.current=null;}};
  const getEl=(url)=>{if(!elRef.current){elRef.current=new Audio();elRef.current.preload='auto';}if(elRef.current.src!==url)elRef.current.src=url;return elRef.current;};
  const fadeTo=(el,target,dur,onDone)=>{clearFade();const start=el.volume,steps=Math.max(1,Math.round(dur/50));let step=0;fadeRef.current=setInterval(()=>{step++;el.volume=Math.max(0,Math.min(1,start+(target-start)*(step/steps)));if(step>=steps){clearFade();el.volume=target;onDone?.();}},50);};
  const play=useCallback(()=>{const track=tracks.find(t=>t.id===selectedId);if(!track)return;clearFade();const el=getEl(track.url);el.volume=0;el.loop=loopMode;setIsLoading(true);setAttribution(track.attribution||`${track.name} by ${track.artist}`);el.play().then(()=>{setIsLoading(false);setIsPlaying(true);fadeTo(el,volRef.current,3000);}).catch(()=>{setIsLoading(false);});},[ selectedId,tracks,loopMode]);// eslint-disable-line
  const stop=useCallback(()=>{const el=elRef.current;if(!el||el.paused){setIsPlaying(false);return;}fadeTo(el,0,2000,()=>{el.pause();el.currentTime=0;setIsPlaying(false);});},[]);
  const setTrack=useCallback((id)=>{setSelectedId(id);const el=elRef.current;if(!el||el.paused)return;fadeTo(el,0,800,()=>{el.pause();const track=tracks.find(t=>t.id===id);if(!track)return;el.src=track.url;el.volume=0;el.loop=loopMode;setAttribution(track.attribution||`${track.name} by ${track.artist}`);el.play().then(()=>{fadeTo(el,volRef.current,1500);}).catch(()=>{});});},[tracks,loopMode]);// eslint-disable-line
  const nextTrack=useCallback(()=>{const idx=tracks.findIndex(t=>t.id===selectedId);setTrack(tracks[(idx+1)%tracks.length].id);},[selectedId,tracks,setTrack]);// eslint-disable-line
  const prevTrack=useCallback(()=>{const idx=tracks.findIndex(t=>t.id===selectedId);setTrack(tracks[(idx-1+tracks.length)%tracks.length].id);},[selectedId,tracks,setTrack]);// eslint-disable-line
  const toggleLoop=useCallback(()=>{const n=!loopMode;setLoopModeState(n);localStorage.setItem(PREF_LOOP_KEY,String(n));if(elRef.current)elRef.current.loop=n;},[loopMode]);
  const toggleShuffle=useCallback(()=>{const n=!shuffle;setShuffleState(n);localStorage.setItem(PREF_SHUFFLE_KEY,String(n));},[shuffle]);
  const saveFavourite=useCallback(()=>{localStorage.setItem(PREF_TRACK_KEY,selectedId);setFavouriteId(selectedId);},[selectedId]);
  const setVolume=useCallback((v)=>{volRef.current=v;setVolumeState(v);localStorage.setItem(PREF_VOL_KEY,String(v));const el=elRef.current;if(el&&!el.paused)el.volume=v;},[]);
  const cleanup=useCallback(()=>{clearFade();if(elRef.current){elRef.current.pause();elRef.current.src='';}setIsPlaying(false);setIsLoading(false);},[]);
  return {tracks,selectedId,setTrack,favouriteId,saveFavourite,volume,setVolume,isPlaying,isLoading,loopMode,toggleLoop,shuffle,toggleShuffle,play,stop,cleanup,nextTrack,prevTrack,attribution};
}

function MusicSelector({ music }) {
  const track=music.tracks.find(t=>t.id===music.selectedId);
  return (
    <div style={{display:'flex',flexDirection:'column',gap:'12px',width:'100%'}}>
      <div style={{display:'flex',alignItems:'center',gap:'10px',background:'rgba(255,255,255,0.05)',borderRadius:14,padding:'12px 14px',border:'1px solid rgba(255,255,255,0.08)'}}>
        <div style={{width:40,height:40,borderRadius:10,background:`linear-gradient(135deg,${ORANGE},#FFD600)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem',flexShrink:0}}>{track?.emoji||'🎵'}</div>
        <div style={{flex:1,minWidth:0}}>
          <p style={{fontSize:'0.85rem',fontWeight:400,color:TEXT,margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{track?.name||'Select track'}</p>
          <p style={{fontSize:'0.7rem',color:MUTED,margin:'2px 0 0'}}>{track?.artist||''}</p>
        </div>
        <button onClick={music.isPlaying?music.stop:music.play} style={{width:44,height:44,borderRadius:22,border:'none',background:music.isPlaying?`${ORANGE}33`:ORANGE,color:music.isPlaying?ORANGE:'#000',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:'1rem'}}>
          {music.isPlaying?'⏸':'▶'}
        </button>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
        <Volume1 size={14} color={MUTED}/>
        <input type="range" min="0" max="1" step="0.05" value={music.volume} onChange={e=>music.setVolume(parseFloat(e.target.value))} style={{flex:1,accentColor:ORANGE,cursor:'pointer',height:4}}/>
        <span style={{fontSize:'0.65rem',color:MUTED,width:'30px',textAlign:'right'}}>{Math.round(music.volume*100)}%</span>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6}}>
        {music.tracks.slice(0,10).map(t=>{const sel=music.selectedId===t.id;return(
          <button key={t.id} onClick={()=>music.setTrack(t.id)} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,padding:'8px 4px',borderRadius:10,border:`1px solid ${sel?ORANGE:'rgba(255,255,255,0.08)'}`,background:sel?`${ORANGE}22`:'rgba(255,255,255,0.03)',cursor:'pointer',minHeight:'auto',transition:'all 0.2s'}}>
            <span style={{fontSize:'1.5rem'}}>{t.emoji||'🎵'}</span>
            <span style={{fontSize:'0.52rem',color:sel?ORANGE:MUTED,fontWeight:600,textAlign:'center',lineHeight:1.6,width:'100%',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.name.split(' ')[0]}</span>
          </button>
        );})}
      </div>
    </div>
  );
}

function MindfulnessPlayer({ session, onClose }) {
  const [elapsed,setElapsed]=useState(0);
  const [isActive,setIsActive]=useState(false);
  const [fadeIn,setFadeIn]=useState(false);
  const intervalRef=useRef(null);
  const prevStepRef=useRef(-1);
  const music=useMusicPlayer();
  let parsed;try{parsed=JSON.parse(session.content);}catch{parsed={};}
  const steps=Array.isArray(parsed)?parsed:(parsed.steps||[]);
  const totalSecs=(session.duration_minutes||5)*60;
  const secPerStep=steps.length>0?Math.floor(totalSecs/steps.length):totalSecs;
  const isDone=elapsed>=totalSecs;
  const progressPct=Math.min((elapsed/totalSecs)*100,100);
  const currentStepIdx=Math.min(Math.floor(elapsed/secPerStep),steps.length-1);
  const remaining=totalSecs-elapsed;
  useEffect(()=>{if(isActive&&!isDone){intervalRef.current=setInterval(()=>setElapsed(p=>p+1),1000);}return()=>clearInterval(intervalRef.current);},[isActive,isDone]);
  useEffect(()=>{if(!isActive||isDone||steps.length===0)return;if(currentStepIdx!==prevStepRef.current){prevStepRef.current=currentStepIdx;setFadeIn(false);setTimeout(()=>setFadeIn(true),100);}},[currentStepIdx,isActive,isDone]);// eslint-disable-line
  useEffect(()=>{if(isDone)music.stop();},[isDone]);// eslint-disable-line
  useEffect(()=>()=>{music.cleanup();},[]);// eslint-disable-line
  const toggle=()=>{if(isDone)return;const s=!isActive;setIsActive(s);if(s){music.play();setFadeIn(true);}};
  const handleClose=()=>{music.stop();setTimeout(music.cleanup,2200);onClose();};
  const fmt=s=>`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
  const circ=2*Math.PI*88;
  const typeInfo=TYPES.find(t=>t.key==='mindfulness');
  return (
    <div style={{position:'fixed',inset:0,zIndex:50,background:'linear-gradient(180deg,#0d0d0d 0%,#1a1008 100%)',display:'flex',flexDirection:'column',alignItems:'center',padding:'env(safe-area-inset-top,2rem) 1.5rem 2rem',overflowY:'auto',minHeight:'100dvh'}}>
      <button onClick={handleClose} style={{position:'absolute',top:'1rem',right:'1rem',background:'none',border:'none',cursor:'pointer',color:MUTED,padding:'8px',minHeight:'auto',minWidth:'auto'}}><X size={20}/></button>
      <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.6rem',fontWeight:400,letterSpacing:'0.18em',color:typeInfo.color,textTransform:'uppercase',margin:'0 0 0.4rem'}}>Mindfulness Session</p>
      <h2 style={{fontFamily:"'DM Sans',system-ui",fontSize:'1.5rem',fontWeight:400,color:TEXT,letterSpacing:'-0.04em',margin:'0 0 1.5rem',textAlign:'center'}}>{session.title}</h2>
      <div style={{width:'100%',maxWidth:'320px',marginBottom:'1.5rem'}}>
        <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.6rem',fontWeight:400,letterSpacing:'0.14em',color:MUTED,textTransform:'uppercase',margin:'0 0 0.5rem',textAlign:'center'}}>Background Music</p>
        <MusicSelector music={music}/>
      </div>
      <div style={{position:'relative',width:'200px',height:'200px',marginBottom:'1.5rem',flexShrink:0}}>
        <svg style={{width:'100%',height:'100%',transform:'rotate(-90deg)'}} viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
          <circle cx="100" cy="100" r="88" fill="none" stroke={typeInfo.color} strokeWidth="8" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ*(1-progressPct/100)} style={{transition:'stroke-dashoffset 1s linear'}}/>
        </svg>
        <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
          <p style={{fontSize:'2.8rem',fontWeight:900,color:TEXT,margin:0,lineHeight:1,letterSpacing:'-0.04em'}}>{fmt(remaining)}</p>
          <p style={{fontSize:'0.7rem',color:MUTED,margin:'4px 0 0',letterSpacing:'0.1em',textTransform:'uppercase'}}>{session.duration_minutes} min session</p>
        </div>
      </div>
      <div style={{textAlign:'center',maxWidth:'480px',minHeight:'100px',marginBottom:'1.5rem'}}>
        {isDone?(
          <div style={{opacity:1}}>
            <CheckCircle size={36} color={GREEN} style={{marginBottom:'0.75rem'}}/>
            <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'1.5rem',fontWeight:400,color:GREEN,margin:'0 0 0.4rem'}}>Session Complete</p>
            <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.85rem',color:MUTED,margin:0}}>Take a moment to notice how you feel.</p>
          </div>
        ):steps.length>0?(
          <div style={{opacity:fadeIn?1:0,transform:fadeIn?'scale(1)':'scale(0.95)',transition:'all 0.8s ease'}}>
            <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.65rem',fontWeight:400,letterSpacing:'0.12em',color:MUTED,textTransform:'uppercase',margin:'0 0 0.75rem'}}>Step {currentStepIdx+1} of {steps.length}</p>
            <p style={{fontSize:'1.4rem',fontWeight:300,color:TEXT,lineHeight:1.5,margin:'0 0 0.75rem',letterSpacing:'-0.01em',maxWidth:340}}>{steps[currentStepIdx]}</p>
            <div style={{display:'flex',gap:'6px',justifyContent:'center'}}>
              {[...Array(steps.length)].map((_,i)=>(
                <div key={i} style={{height:'3px',borderRadius:'2px',backgroundColor:i===currentStepIdx?typeInfo.color:'rgba(255,255,255,0.15)',width:i===currentStepIdx?'20px':'8px',transition:'all 0.3s'}}/>
              ))}
            </div>
          </div>
        ):(
          <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'1rem',color:MUTED,fontStyle:'italic'}}>Follow your breath and stay present.</p>
        )}
      </div>
      <div style={{display:'flex',gap:'10px',width:'100%',maxWidth:'300px'}}>
        {!isDone&&(
          <button onClick={toggle} style={{flex:1,padding:'1rem',background:`linear-gradient(135deg,${ORANGE},${YELLOW})`,border:'none',borderRadius:14,color:'#000',fontSize:'1rem',fontWeight:900,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,minHeight:'auto',boxShadow:`0 4px 24px ${ORANGE}44`}}>
            {isActive?<Pause size={16}/>:<Play size={16}/>}
            {isActive?'Pause':elapsed===0?'Begin':'Resume'}
          </button>
        )}
        <button onClick={handleClose} style={{flex:isDone?1:0,padding:'0.875rem 1.5rem',backgroundColor:'transparent',border:`1px solid ${BORDER}`,borderRadius:'10px',color:TEXT,fontFamily:"'DM Sans',system-ui",fontSize:'0.875rem',fontWeight:600,cursor:'pointer',minHeight:'auto'}}>
          {isDone?'Finish':'End'}
        </button>
      </div>
    </div>
  );
}

function BreathingPlayer({ exercise, onClose }) {
  const [elapsed,setElapsed]=useState(0);
  const [isActive,setIsActive]=useState(false);
  const intervalRef=useRef(null);
  const prevPhaseRef=useRef('');
  const music=useMusicPlayer();
  let parsed;try{parsed=JSON.parse(exercise.content);}catch{parsed={};}
  const pattern=parsed.pattern||{inhale:4,hold_in:0,exhale:4,hold_out:0};
  const totalRounds=parsed.rounds||6;
  const cycleDur=(pattern.inhale||0)+(pattern.hold_in||0)+(pattern.exhale||0)+(pattern.hold_out||0);
  const totalDur=cycleDur*totalRounds;
  const isDone=elapsed>=totalDur;
  const round=Math.min(Math.floor(elapsed/cycleDur)+1,totalRounds);
  const getPhase=(t)=>{const pos=t%cycleDur,i=pattern.inhale||0,h=pattern.hold_in||0,e=pattern.exhale||0;if(pos<i)return{label:'Breathe in',rem:i-pos,scale:1.35};if(pos<i+h)return{label:'Hold',rem:i+h-pos,scale:1.35};if(pos<i+h+e)return{label:'Breathe out',rem:i+h+e-pos,scale:1.0};return{label:'Hold',rem:cycleDur-pos,scale:1.0};};
  const phase=isDone?{label:'✓',rem:0,scale:1.0}:getPhase(elapsed);
  useEffect(()=>{if(isActive&&!isDone){intervalRef.current=setInterval(()=>setElapsed(p=>p+1),1000);}return()=>clearInterval(intervalRef.current);},[isActive,isDone]);
  useEffect(()=>{if(isDone)music.stop();},[isDone]);// eslint-disable-line
  useEffect(()=>()=>{music.cleanup();},[]);// eslint-disable-line
  const toggle=()=>{if(isDone)return;const s=!isActive;setIsActive(s);if(s){music.play();prevPhaseRef.current=getPhase(elapsed).label;}};
  const handleClose=()=>{music.stop();setTimeout(music.cleanup,2200);onClose();};
  const circleSize=130+(phase.scale-1)*100;
  const typeInfo=TYPES.find(t=>t.key==='breathing');
  return (
    <div style={{position:'fixed',inset:0,zIndex:50,backgroundColor:'#111',display:'flex',flexDirection:'column',alignItems:'center',padding:'2rem 1.25rem',overflowY:'auto'}}>
      <button onClick={handleClose} style={{position:'absolute',top:'1rem',right:'1rem',background:'none',border:'none',cursor:'pointer',color:MUTED,padding:'8px',minHeight:'auto',minWidth:'auto'}}><X size={20}/></button>
      <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.6rem',fontWeight:400,letterSpacing:'0.18em',color:typeInfo.color,textTransform:'uppercase',margin:'0 0 0.4rem'}}>Breathing Exercise</p>
      <h2 style={{fontFamily:"'DM Sans',system-ui",fontSize:'1.5rem',fontWeight:400,color:TEXT,letterSpacing:'-0.04em',margin:'0 0 0.25rem',textAlign:'center'}}>{exercise.title}</h2>
      <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.78rem',color:MUTED,margin:'0 0 1.25rem'}}>{isDone?'Complete!': `Round ${round} of ${totalRounds}`}</p>
      <div style={{width:'100%',maxWidth:'320px',marginBottom:'1.25rem'}}>
        <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.6rem',fontWeight:400,letterSpacing:'0.14em',color:MUTED,textTransform:'uppercase',margin:'0 0 0.5rem',textAlign:'center'}}>Background Music</p>
        <MusicSelector music={music}/>
      </div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',margin:'0.5rem 0 1rem'}}>
        <div style={{width:`${circleSize}px`,height:`${circleSize}px`,borderRadius:'50%',backgroundColor:typeInfo.bg,border:`2px solid ${typeInfo.color}44`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',transition:'all 1s ease-in-out'}}>
          <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'1rem',fontWeight:400,color:typeInfo.color,margin:0}}>{phase.label}</p>
          {isActive&&!isDone&&phase.rem>0&&<p style={{fontFamily:"'DM Sans',system-ui",fontSize:'2.5rem',fontWeight:300,color:TEXT,margin:'4px 0 0',lineHeight:1}}>{phase.rem}</p>}
        </div>
      </div>
      {isDone?(
        <div style={{textAlign:'center',marginBottom:'1.25rem'}}>
          <CheckCircle size={32} color={GREEN} style={{marginBottom:'0.5rem'}}/>
          <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'1.1rem',fontWeight:400,color:GREEN,margin:'0 0 0.25rem'}}>Session Complete!</p>
          <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.82rem',color:MUTED,margin:0}}>Notice how you feel right now.</p>
        </div>
      ):(
        <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.75rem',color:MUTED,margin:'0 0 1.25rem',textAlign:'center'}}>
          {[pattern.inhale&&`${pattern.inhale}s inhale`,pattern.hold_in&&`${pattern.hold_in}s hold`,pattern.exhale&&`${pattern.exhale}s exhale`,pattern.hold_out&&`${pattern.hold_out}s hold`].filter(Boolean).join(' · ')}
        </p>
      )}
      <div style={{display:'flex',gap:'10px',width:'100%',maxWidth:'300px'}}>
        {!isDone&&(
          <button onClick={toggle} style={{flex:1,padding:'0.875rem',background:`linear-gradient(135deg,${ORANGE},${YELLOW})`,border:'none',borderRadius:'10px',color:'#000',fontFamily:"'DM Sans',system-ui",fontSize:'0.875rem',fontWeight:300,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',minHeight:'auto'}}>
            {isActive?<Pause size={16}/>:<Play size={16}/>}
            {isActive?'Pause':elapsed===0?'Start':'Resume'}
          </button>
        )}
        <button onClick={handleClose} style={{flex:isDone?1:0,padding:'0.875rem 1.5rem',backgroundColor:'transparent',border:`1px solid ${BORDER}`,borderRadius:'10px',color:TEXT,fontFamily:"'DM Sans',system-ui",fontSize:'0.875rem',fontWeight:600,cursor:'pointer',minHeight:'auto'}}>{isDone?'Finish':'End'}</button>
      </div>
    </div>
  );
}

function StretchIdList({ ids }) {
  const [stretches, setStretches] = useState([]);
  useEffect(() => {
    Promise.all(ids.map(id => api.get("/stretches/" + id).then(r => r.data).catch(() => null)))
      .then(results => setStretches(results.filter(Boolean)));
  }, [ids.join(",")]);
  return (
    <div style={{marginTop:"1rem",paddingTop:"1rem",borderTop:"1px solid rgba(255,255,255,0.1)",display:"flex",flexDirection:"column",gap:8}}>
      {stretches.map((s,i) => (
        <div key={s.id} style={{background:"#1a1a1a",borderRadius:12,overflow:"hidden",border:"1px solid rgba(255,255,255,0.08)",display:"flex"}}>
          <div style={{width:90,height:90,flexShrink:0,background:"#111",overflow:"hidden"}}>
            <img src={"/exercise-gifs/" + s.gif_file} alt={s.name} style={{width:"100%",height:"100%",objectFit:"cover"}} loading="lazy"/>
          </div>
          <div style={{padding:"10px 12px",flex:1}}>
            <p style={{fontSize:"0.82rem",fontWeight:400,color:"#fff",margin:"0 0 2px"}}>{s.name}</p>
            <p style={{fontSize:"0.68rem",color:"#4CAF50",fontWeight:600,margin:"0 0 4px"}}>{s.muscle_group}</p>
            <p style={{fontSize:"0.65rem",color:"#707070",margin:0}}>Hold for 30-60 seconds</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ExerciseWithGif({ name, duration, instruction, index }) {
  const [gif, setGif] = useState(null);
  useEffect(() => {
    api.get("/stretches?search=" + encodeURIComponent(name)).then(r => {
      if (r.data && r.data.length > 0) setGif(r.data[0].gif_file);
    }).catch(() => {});
  }, [name]);
  return (
    <div style={{display:"flex"}}>
      <div style={{width:90,height:90,flexShrink:0,background:"#111",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center"}}>
        {gif ? <img src={"/exercise-gifs/" + gif} alt={name} style={{width:"100%",height:"100%",objectFit:"cover"}}/> : <div style={{width:40,height:40,borderRadius:"50%",background:"rgba(76,175,80,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.8rem",fontWeight:300,color:"#4CAF50"}}>{index+1}</div>}
      </div>
      <div style={{padding:"10px 12px",flex:1}}>
        <p style={{fontSize:"0.82rem",fontWeight:400,color:"#fff",margin:"0 0 2px"}}>{name}</p>
        {duration&&<p style={{fontSize:"0.68rem",color:"#4CAF50",fontWeight:600,margin:"0 0 4px"}}>{duration}</p>}
        {instruction&&<p style={{fontSize:"0.68rem",color:"#b0b0b0",margin:0,lineHeight:1.5}}>{instruction}</p>}
      </div>
    </div>
  );
}

function ExpandedDetail({ item }) {
  let parsed;try{parsed=JSON.parse(item.content);}catch{parsed=null;}
  if(item.type==='rest_day'){const stretchIds=parsed?.stretch_ids||[];const exercises=parsed?.exercises||(Array.isArray(parsed)?parsed:[]);if(stretchIds.length>0)return(<StretchIdList ids={stretchIds}/>);return(
    <div style={{marginTop:'1rem',paddingTop:'1rem',borderTop:`1px solid ${BORDER}`,display:'flex',flexDirection:'column',gap:'12px'}}>
      {exercises.map((ex,i)=>(
        <div key={i} style={{background:'#1a1a1a',borderRadius:12,overflow:'hidden',border:`1px solid ${BORDER}`,marginBottom:4}}>
          <ExerciseWithGif name={ex.name} duration={ex.duration} instruction={ex.instruction} index={i}/>
        </div>





      ))}
    </div>
  );}
  const sections=parsed?.sections||[],body=parsed?.body||(Array.isArray(parsed)?parsed:[]),keyPoints=parsed?.key_points||[];
  return(
    <div style={{marginTop:'1rem',paddingTop:'1rem',borderTop:`1px solid ${BORDER}`,display:'flex',flexDirection:'column',gap:'12px'}}>
      {sections.map((s,i)=>(
        <div key={i}>
          {s.heading&&<p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.875rem',fontWeight:400,color:TEXT,margin:'0 0 4px'}}>{s.heading}</p>}
          <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.78rem',color:'#b0b0b0',margin:0,lineHeight:1.65}}>{s.body}</p>
        </div>
      ))}
      {body.map((para,i)=><p key={i} style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.78rem',color:'#b0b0b0',margin:0,lineHeight:1.65}}>{para}</p>)}
      {keyPoints.length>0&&(
        <div style={{backgroundColor:'#1a1a1a',borderRadius:'8px',padding:'0.875rem'}}>
          <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.78rem',fontWeight:400,color:TEXT,margin:'0 0 0.5rem'}}>Key Takeaways</p>
          {keyPoints.map((kp,i)=>(
            <div key={i} style={{display:'flex',alignItems:'flex-start',gap:'8px',marginBottom:'6px'}}>
              <span style={{color:ORANGE,flexShrink:0,marginTop:'2px'}}>›</span>
              <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.75rem',color:'#b0b0b0',margin:0,lineHeight:1.6}}>{kp}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ContentCard({ item, tab, expanded, onToggleExpand, onStart, onStartRoutine }) {
  const typeInfo=TYPES.find(t=>t.key===tab)||TYPES[0];
  const Icon=typeInfo.icon;
  const isInteractive=tab==='mindfulness'||tab==='breathing';
  const isStretchRoutine=tab==='rest_day'&&onStartRoutine;

  return (
    <div style={{backgroundColor:SURFACE,borderRadius:'12px',padding:'1.1rem',border:`1px solid ${BORDER}`,borderLeft:`3px solid ${typeInfo.color}`}}>
      <div style={{display:'flex',alignItems:'flex-start',gap:'12px'}}>
        <div style={{padding:'8px',borderRadius:'8px',backgroundColor:typeInfo.bg,flexShrink:0}}>
          <Icon size={18} color={typeInfo.color}/>
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'8px',marginBottom:'6px'}}>
            <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'1rem',fontWeight:400,color:TEXT,letterSpacing:'-0.01em',margin:0,lineHeight:1.6}}>{item.title}</p>
            {item.duration_minutes>0&&(
              <span style={{display:'flex',alignItems:'center',gap:'4px',fontFamily:"'DM Sans',system-ui",fontSize:'0.78rem',fontWeight:400,color:typeInfo.color,flexShrink:0}}>
                <Clock size={12}/>{item.duration_minutes}m
              </span>
            )}
          </div>
          {item.description&&<p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.75rem',color:'#b0b0b0',margin:'0 0 8px',lineHeight:1.6}}>{item.description}</p>}
          <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
            {item.difficulty&&(
              <span style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.62rem',fontWeight:400,letterSpacing:'0.08em',textTransform:'uppercase',padding:'2px 8px',borderRadius:'4px',backgroundColor:`${item.difficulty==='beginner'?GREEN:item.difficulty==='intermediate'?ORANGE:'#ef4444'}18`,color:item.difficulty==='beginner'?GREEN:item.difficulty==='intermediate'?ORANGE:'#ef4444'}}>
                {item.difficulty}
              </span>
            )}
          </div>
        </div>
      </div>
      <div style={{marginTop:'0.875rem'}}>
        {isInteractive?(
          <button onClick={onStart} style={{width:'100%',padding:'0.8rem',background:`linear-gradient(135deg,${ORANGE},${YELLOW})`,border:'none',borderRadius:'8px',color:'#000',fontFamily:"'DM Sans',system-ui",fontSize:'0.875rem',fontWeight:300,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',minHeight:'auto'}}>
            <Play size={14}/>{tab==='breathing'?'Start Breathing Exercise':'Begin Session'}
          </button>
        ):isStretchRoutine?(
          <>
              <button onClick={onStartRoutine} style={{width:'100%',padding:'0.8rem',background:`linear-gradient(135deg,${GREEN},#2d8a30)`,border:'none',borderRadius:'8px',color:'#fff',fontSize:'0.875rem',fontWeight:400,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',minHeight:'auto',marginBottom:8}}><Play size={14}/> Start Routine</button>
            <button onClick={onToggleExpand} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',fontSize:'0.75rem',color:MUTED,background:'none',border:'none',cursor:'pointer',padding:'6px 0',minHeight:'auto'}} onMouseEnter={e=>e.currentTarget.style.color=TEXT} onMouseLeave={e=>e.currentTarget.style.color=MUTED}><span>{expanded?'Hide exercises':'Preview exercises'}</span>{expanded?<ChevronUp size={14}/>:<ChevronDown size={14}/>}</button>
            {expanded&&<ExpandedDetail item={item}/>}
          </>
        ):(
          <>
            <button onClick={onToggleExpand} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',fontFamily:"'DM Sans',system-ui",fontSize:'0.75rem',color:MUTED,background:'none',border:'none',cursor:'pointer',padding:'6px 0',minHeight:'auto',transition:'color 0.15s'}} onMouseEnter={e=>e.currentTarget.style.color=TEXT} onMouseLeave={e=>e.currentTarget.style.color=MUTED}><span>{expanded?'Hide details':'View details'}</span>{expanded?<ChevronUp size={14}/>:<ChevronDown size={14}/>}</button>
            {expanded&&<ExpandedDetail item={item}/>}
          </>
        )}
      </div>
    </div>
  );
}


const STRETCH_QUOTES = [
  "Flexibility is not just about your body, it is about your mindset too.",
  "Recovery is where the magic happens. You showed up for yourself today.",
  "Every stretch brings you closer to the best version of yourself.",
  "Rest is not weakness. It is wisdom.",
  "Your body just thanked you. Well done.",
  "Progress is not always visible, but today you moved forward.",
  "Consistency beats intensity. Keep showing up.",
  "A flexible body builds a resilient mind.",
];

function StretchRoutinePlayer({ item, onClose }) {
  const [stretches, setStretches] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isActive, setIsActive] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [quote] = useState(STRETCH_QUOTES[Math.floor(Math.random() * STRETCH_QUOTES.length)]);
  const totalTime = 45;
  let parsed; try { parsed = JSON.parse(item.content); } catch { parsed = {}; }
  const ids = parsed?.stretch_ids || [];

  useEffect(() => {
    Promise.all(ids.map(id => api.get("/stretches/" + id).then(r => r.data).catch(() => null)))
      .then(results => setStretches(results.filter(Boolean)));
  }, []);

  useEffect(() => {
    if (!isActive || isDone) return;
    if (timeLeft <= 0) {
      if (currentIdx < stretches.length - 1) {
        setCurrentIdx(i => i + 1);
        setTimeLeft(45);
      } else {
        setIsDone(true);
        setIsActive(false);
      }
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [isActive, timeLeft, currentIdx, stretches.length, isDone]);

  const current = stretches[currentIdx];
  const progress = stretches.length > 0 ? (currentIdx / stretches.length) * 100 : 0;
  const circumference = 2 * Math.PI * 54;

  if (stretches.length === 0) return (
    <div style={{position:"fixed",inset:0,zIndex:50,background:"#0d0d0d",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:24,height:24,border:"2px solid #4CAF50",borderTop:"2px solid transparent",borderRadius:"50%",animation:"spin 1s linear infinite"}}/>
    </div>
  );

  if (isDone) return (
    <div style={{position:"fixed",inset:0,zIndex:50,background:"linear-gradient(180deg,#0d0d0d,#0a1a0a)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"2rem"}}>
      <div style={{fontSize:64,marginBottom:24}}>🌿</div>
      <p style={{fontSize:"0.65rem",fontWeight:400,letterSpacing:"0.2em",color:"#4CAF50",textTransform:"uppercase",margin:"0 0 12px"}}>Complete</p>
      <h2 style={{fontSize:"2rem",fontWeight:300,color:"#fff",letterSpacing:"-0.03em",margin:"0 0 24px",textAlign:"center"}}>{item.title}</h2>
      <div style={{background:"rgba(76,175,80,0.1)",border:"1px solid rgba(76,175,80,0.2)",borderRadius:16,padding:"1.5rem",maxWidth:340,marginBottom:32,textAlign:"center"}}>
        <p style={{fontSize:"1rem",fontWeight:300,color:"#fff",lineHeight:1.7,margin:0,fontStyle:"italic"}}>"{quote}"</p>
      </div>
      <div style={{display:"flex",gap:12,width:"100%",maxWidth:320}}>
        <button onClick={()=>{setCurrentIdx(0);setTimeLeft(45);setIsActive(false);setIsDone(false);}} style={{flex:1,padding:"14px",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,color:"#fff",fontSize:"0.875rem",cursor:"pointer"}}>Restart</button>
        <button onClick={onClose} style={{flex:2,padding:"14px",background:"linear-gradient(135deg,#4CAF50,#2d8a30)",border:"none",borderRadius:12,color:"#fff",fontSize:"0.875rem",cursor:"pointer"}}>Finish</button>
      </div>
    </div>
  );

  return (
    <div style={{position:"fixed",inset:0,zIndex:50,background:"#0d0d0d",display:"flex",flexDirection:"column",overflowY:"auto"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"1rem 1.25rem",flexShrink:0}}>
        <div>
          <p style={{fontSize:"0.6rem",fontWeight:400,letterSpacing:"0.18em",color:"#4CAF50",textTransform:"uppercase",margin:0}}>{item.title}</p>
          <p style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.4)",margin:"2px 0 0"}}>{currentIdx + 1} of {stretches.length}</p>
        </div>
        <button onClick={onClose} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:"50%",width:36,height:36,cursor:"pointer",color:"rgba(255,255,255,0.6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.1rem"}}>✕</button>
      </div>
      <div style={{height:2,background:"rgba(255,255,255,0.08)",flexShrink:0}}>
        <div style={{height:"100%",background:"#4CAF50",width:progress+"%",transition:"width 0.5s ease"}}/>
      </div>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",minHeight:280}}>
        {current && (
          <div style={{width:"100%",maxWidth:320,aspectRatio:"1",borderRadius:20,overflow:"hidden",background:"#1a1a1a"}}>
            <img src={"/exercise-gifs/" + current.gif_file} alt={current.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          </div>
        )}
      </div>
      <div style={{padding:"0 1.5rem 2rem",flexShrink:0,textAlign:"center"}}>
        <p style={{fontSize:"0.65rem",fontWeight:400,letterSpacing:"0.15em",color:"#4CAF50",textTransform:"uppercase",margin:"0 0 6px"}}>{current?.muscle_group}</p>
        <h2 style={{fontSize:"1.5rem",fontWeight:300,color:"#fff",letterSpacing:"-0.03em",margin:"0 0 24px",lineHeight:1.2}}>{current?.name}</h2>
        <div style={{position:"relative",width:140,height:140,margin:"0 auto 24px"}}>
          <svg width="140" height="140" viewBox="0 0 120 120" style={{transform:"rotate(-90deg)"}}>
            <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6"/>
            <circle cx="60" cy="60" r="54" fill="none" stroke="#4CAF50" strokeWidth="6" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={circumference * (1 - timeLeft / totalTime)}
              style={{transition:"stroke-dashoffset 1s linear"}}/>
          </svg>
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
            <p style={{fontSize:"2.2rem",fontWeight:300,color:"#fff",margin:0,lineHeight:1}}>{timeLeft}</p>
            <p style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.4)",margin:0}}>seconds</p>
          </div>
        </div>
        <div style={{display:"flex",gap:10,marginBottom:8}}>
          <button onClick={()=>{if(currentIdx>0){setCurrentIdx(i=>i-1);setTimeLeft(45);}}} disabled={currentIdx===0}
            style={{flex:1,padding:"13px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,color:currentIdx===0?"rgba(255,255,255,0.2)":"#fff",fontSize:"0.85rem",cursor:currentIdx===0?"default":"pointer"}}>
            Prev
          </button>
          <button onClick={()=>setIsActive(a=>!a)}
            style={{flex:2,padding:"13px",background:isActive?"rgba(255,107,43,0.15)":"linear-gradient(135deg,#4CAF50,#2d8a30)",border:isActive?"1px solid rgba(255,107,43,0.3)":"none",borderRadius:12,color:"#fff",fontSize:"0.95rem",cursor:"pointer"}}>
            {isActive ? "Pause" : timeLeft === totalTime ? "Start" : "Resume"}
          </button>
          <button onClick={()=>{if(currentIdx<stretches.length-1){setCurrentIdx(i=>i+1);setTimeLeft(45);}else{setIsDone(true);}}}
            style={{flex:1,padding:"13px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,color:"#fff",fontSize:"0.85rem",cursor:"pointer"}}>
            Next
          </button>
        </div>
        <p style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.25)",margin:0}}>Hold the stretch. Breathe deeply.</p>
      </div>
    </div>
  );
}

export default function ClientWellness() {
  const { user }=useAuth();
  const navigate=useNavigate();
  const isPro=user?.isPro;
  const [tab,setTab]=useState('mindfulness');
  const [content,setContent]=useState([]);
  const [isLimited,setIsLimited]=useState(false);
  const [loading,setLoading]=useState(true);
  const [expanded,setExpanded]=useState(null);
  const [activeSession,setActiveSession]=useState(null);
  const [breathingSession,setBreathingSession]=useState(null);
  const [stretchRoutineSession,setStretchRoutineSession]=useState(null);
  const [stretches,setStretches]=useState([]);
  const [stretchGroup,setStretchGroup]=useState("All");
  const [stretchSearch,setStretchSearch]=useState("");
  const [stretchGroups,setStretchGroups]=useState(["All"]);
  const [selectedStretch,setSelectedStretch]=useState(null);

  useEffect(()=>{
    api.get('/wellness/mind').then(res=>{
      if(res.data.isLimited){setContent(res.data.preview);setIsLimited(true);}
      else{setContent(res.data);setIsLimited(false);}
    }).catch(()=>toast.error('Failed to load wellness content')).finally(()=>setLoading(false));
  },[]);

  useEffect(()=>{
    if(tab==="rest_day"){
      api.get("/stretches").then(r=>{
        setStretches(r.data);
        const groups=["All",...new Set(r.data.map(s=>s.muscle_group))];
        setStretchGroups(groups);
      }).catch(()=>{});
    }
  },[tab]);
  const tabContent=content.filter(c=>c.type===tab);
  const sectionInfo=SECTION_INFO[tab];

  if(loading) return(
    <div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'60vh',backgroundColor:BG}}>
      <div style={{width:'20px',height:'20px',border:`2px solid ${ORANGE}`,borderTop:'2px solid transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
    </div>
  );

  return (
    <div style={{backgroundColor:BG,minHeight:'100vh',paddingBottom:'6rem'}}>
      <div style={{maxWidth:'800px',margin:'0 auto',padding:'2rem 1.25rem'}}>
        <BackButton to="/client"/>

        {/* Header */}
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',margin:'1.25rem 0 1.5rem'}}>
          <div>
            <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.65rem',fontWeight:400,letterSpacing:'0.18em',color:ORANGE,textTransform:'uppercase',margin:'0 0 0.4rem'}}>Recovery</p>
            <h1 style={{fontFamily:"'DM Sans',system-ui",fontSize:'2rem',fontWeight:400,color:TEXT,letterSpacing:'-0.04em',margin:'0 0 0.25rem'}}>Mind & Wellness</h1>
            <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.82rem',color:MUTED,margin:0}}>Mental performance & recovery</p>
          </div>
          {isPro?(
            <span style={{display:'flex',alignItems:'center',gap:'4px',fontSize:'0.72rem',fontWeight:400,padding:'4px 12px',borderRadius:'20px',background:`linear-gradient(135deg,${YELLOW},${ORANGE})`,color:'#000'}}>
              <Crown size={12}/> Pro
            </span>
          ):(
            <button onClick={()=>navigate('/client/upgrade')} style={{display:'flex',alignItems:'center',gap:'4px',fontSize:'0.72rem',fontWeight:400,color:YELLOW,border:`1px solid ${YELLOW}44`,borderRadius:'20px',padding:'4px 12px',background:'none',cursor:'pointer',minHeight:'auto'}}>
              <Crown size={12}/> Upgrade
            </button>
          )}
        </div>

        {/* Type tabs */}
        <div style={{display:'flex',gap:'6px',overflowX:'auto',paddingBottom:'4px',marginBottom:'1rem'}}>
          {TYPES.map(({key,label,icon:Icon})=>{const active=tab===key;const ti=TYPES.find(t=>t.key===key);return(
            <button key={key} onClick={()=>{setTab(key);setExpanded(null);}} style={{flexShrink:0,display:'flex',alignItems:'center',gap:'6px',padding:'7px 14px',borderRadius:'8px',border:`1px solid ${active?ti.color:BORDER}`,backgroundColor:active?`${ti.color}20`:'transparent',color:active?ti.color:MUTED,fontFamily:"'DM Sans',system-ui",fontSize:'0.78rem',fontWeight:400,cursor:'pointer',minHeight:'auto',whiteSpace:'nowrap',transition:'all 0.15s'}}>
              <Icon size={13}/>{label}
            </button>
          );})}
        </div>

        {/* Section info */}
        {sectionInfo&&(
          <div style={{display:'flex',alignItems:'center',gap:'12px',padding:'0.875rem 1rem',backgroundColor:SURFACE,borderRadius:'10px',border:`1px solid ${BORDER}`,marginBottom:'1rem'}}>
            <span style={{fontSize:'1.25rem',flexShrink:0}}>{sectionInfo.emoji}</span>
            <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.78rem',color:'#b0b0b0',margin:0,lineHeight:1.6}}>{sectionInfo.text}</p>
          </div>
        )}

        {/* Pro hint */}
        {!isPro&&isLimited&&(
          <div style={{display:'flex',alignItems:'center',gap:'10px',padding:'0.75rem 1rem',backgroundColor:`${YELLOW}10`,border:`1px solid ${YELLOW}22`,borderRadius:'8px',marginBottom:'1rem'}}>
            <Crown size={14} color={YELLOW}/>
            <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.75rem',color:YELLOW,margin:0}}>
              Showing 1 preview. <button onClick={()=>navigate('/client/upgrade')} style={{background:'none',border:'none',color:YELLOW,fontWeight:400,cursor:'pointer',textDecoration:'underline',padding:0,minHeight:'auto'}}>Upgrade to Pro</button> for the full library.
            </p>
          </div>
        )}

        {/* Content */}
        {tab==="rest_day"?(
          <div>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:"1.5rem"}}>
              {tabContent.map(item=>(
                <ContentCard key={item.id} item={item} tab={tab}
                  expanded={expanded===item.id}
                  onToggleExpand={()=>setExpanded(expanded===item.id?null:item.id)}
                  onStart={()=>{if(item.type==="breathing")setBreathingSession(item);else setActiveSession(item);}}/>
              ))}
            </div>
            <div style={{borderTop:`1px solid ${BORDER}`,paddingTop:"1.25rem",marginBottom:"1rem"}}>
            <p style={{fontSize:"0.6rem",fontWeight:400,letterSpacing:"0.18em",color:GREEN,textTransform:"uppercase",margin:"0 0 0.75rem"}}>Browse All Stretches</p>
            <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:8,marginBottom:12}}>
              {stretchGroups.map(g=>(
                <button key={g} onClick={()=>setStretchGroup(g)} style={{flexShrink:0,padding:"6px 14px",borderRadius:8,border:`1px solid ${stretchGroup===g?GREEN:BORDER}`,background:stretchGroup===g?`${GREEN}22`:"transparent",color:stretchGroup===g?GREEN:MUTED,fontSize:"0.75rem",fontWeight:400,cursor:"pointer",minHeight:"auto",whiteSpace:"nowrap"}}>{g}</button>
              ))}
            </div>
            <div style={{marginBottom:12}}>
              <input value={stretchSearch} onChange={e=>setStretchSearch(e.target.value)} placeholder="Search stretches..." style={{width:"100%",background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:10,color:TEXT,padding:"10px 14px",fontSize:14,boxSizing:"border-box",outline:"none"}}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
              {stretches.filter(s=>(stretchGroup==="All"||s.muscle_group===stretchGroup)&&(stretchSearch===""||s.name.toLowerCase().includes(stretchSearch.toLowerCase()))).map(s=>(
                <div key={s.id} onClick={()=>setSelectedStretch(selectedStretch?.id===s.id?null:s)} style={{background:SURFACE,borderRadius:12,overflow:"hidden",border:`1px solid ${selectedStretch?.id===s.id?GREEN:BORDER}`,cursor:"pointer",transition:"all 0.2s"}}>
                  <div style={{background:"#1a1a1a",aspectRatio:"1",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
                    <img src={`/exercise-gifs/${s.gif_file}`} alt={s.name} style={{width:"100%",height:"100%",objectFit:"cover"}} loading="lazy"/>
                  </div>
                  <div style={{padding:"8px 10px"}}>
                    <p style={{fontSize:"0.72rem",fontWeight:400,color:TEXT,margin:"0 0 2px",lineHeight:1.3}}>{s.name}</p>
                    <p style={{fontSize:"0.62rem",color:GREEN,fontWeight:600,margin:0}}>{s.muscle_group}</p>
                  </div>
                </div>
              ))}
            </div>
            </div>
            {selectedStretch&&(
              <div style={{position:"fixed",inset:0,zIndex:50,background:"rgba(0,0,0,0.9)",display:"flex",alignItems:"center",justifyContent:"center",padding:"1.5rem"}} onClick={()=>setSelectedStretch(null)}>
                <div style={{background:SURFACE,borderRadius:16,overflow:"hidden",maxWidth:380,width:"100%",border:`1px solid ${BORDER}`}} onClick={e=>e.stopPropagation()}>
                  <img src={`/exercise-gifs/${selectedStretch.gif_file}`} alt={selectedStretch.name} style={{width:"100%",aspectRatio:"1",objectFit:"cover"}}/>
                  <div style={{padding:"1rem"}}>
                    <p style={{fontSize:"1rem",fontWeight:300,color:TEXT,margin:"0 0 4px"}}>{selectedStretch.name}</p>
                    <p style={{fontSize:"0.78rem",color:GREEN,fontWeight:600,margin:"0 0 12px"}}>{selectedStretch.muscle_group}</p>
                    <button onClick={()=>setSelectedStretch(null)} style={{width:"100%",padding:"12px",background:`linear-gradient(135deg,${GREEN},#2d8a30)`,border:"none",borderRadius:10,color:"#fff",fontWeight:300,fontSize:"0.875rem",cursor:"pointer"}}>Got it</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ):tabContent.length===0?(
          <div style={{textAlign:'center',padding:'3rem 0'}}>
            <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.875rem',color:MUTED}}>No content available yet</p>
          </div>
        ):(
          <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
            {tabContent.map(item=>(
              <ContentCard key={item.id} item={item} tab={tab}
                expanded={expanded===item.id}
                onToggleExpand={()=>setExpanded(expanded===item.id?null:item.id)}
                onStart={()=>{if(item.type==='breathing')setBreathingSession(item);else setActiveSession(item);}}/>
            ))}
            {isLimited&&(
              <div style={{backgroundColor:SURFACE,border:`1px solid ${YELLOW}22`,borderRadius:'12px',padding:'2rem',textAlign:'center'}}>
                <Crown size={24} color={YELLOW} style={{marginBottom:'0.75rem'}}/>
                <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'1rem',fontWeight:400,color:TEXT,letterSpacing:'-0.04em',margin:'0 0 0.4rem'}}>Unlock Full Library</p>
                <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.78rem',color:MUTED,margin:'0 0 1rem',lineHeight:1.6}}>Get unlimited access to all sessions with BrazilFit Pro.</p>
                <button onClick={()=>navigate('/client/upgrade')} style={{padding:'0.8rem 2rem',background:`linear-gradient(135deg,${ORANGE},${YELLOW})`,border:'none',borderRadius:'8px',color:'#000',fontFamily:"'DM Sans',system-ui",fontSize:'0.875rem',fontWeight:300,cursor:'pointer',minHeight:'auto'}}>Upgrade to Pro</button>
              </div>
            )}
          </div>
        )}
      </div>

      {activeSession&&<MindfulnessPlayer session={activeSession} onClose={()=>setActiveSession(null)}/>}
      {breathingSession&&<BreathingPlayer exercise={breathingSession} onClose={()=>setBreathingSession(null)}/> }
      {stretchRoutineSession&&<StretchRoutinePlayer item={stretchRoutineSession} onClose={()=>setStretchRoutineSession(null)}/>}
    </div>
  );
}
