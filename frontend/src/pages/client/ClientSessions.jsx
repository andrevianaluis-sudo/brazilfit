import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Crown, AlertTriangle, X, Ban, FileText, ArrowRight, Zap, Calendar, MessageSquare } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import BackButton from '../../components/BackButton';
import { fmtDate, fmtDateTimeFull, fmtDateTime, fmtDateShort, sortOldestFirst, sortNewestFirst } from '../../utils/dateUtils';

const BG='#0f0f0f';const SURFACE='#1a1a1a';const SURFACE2='#222';const BORDER='rgba(255,255,255,0.08)';const TEXT='#ffffff';const MUTED='#606060';const ORANGE='#FF6B2B';const YELLOW='#FFD600';const GREEN='#4CAF50';

function hoursUntil(date,time){return(new Date(`${date}T${time}:00`)-new Date())/3600000;}

function SectionLabel({children,color=ORANGE}){
  return(
    <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'0.875rem'}}>
      <div style={{width:'3px',height:'14px',borderRadius:'2px',background:`linear-gradient(180deg,${color},${color}88)`}}/>
      <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.6rem',fontWeight:700,letterSpacing:'0.2em',color,textTransform:'uppercase',margin:0}}>{children}</p>
    </div>
  );
}

function SessionNoteModal({session,onClose}){
  const[note,setNote]=useState(null);const[loading,setLoading]=useState(true);
  useEffect(()=>{api.get(`/sessions/${session.id}/note`).then(r=>{setNote(r.data);setLoading(false);}).catch(()=>setLoading(false));},[session.id]);
  return(
    <div onClick={onClose} style={{position:'fixed',inset:0,zIndex:50,display:'flex',alignItems:'flex-end',justifyContent:'center',backgroundColor:'rgba(0,0,0,0.92)',padding:'1rem',backdropFilter:'blur(4px)'}}>
      <div onClick={e=>e.stopPropagation()} style={{width:'100%',maxWidth:'480px',backgroundColor:'#111',borderRadius:'20px',border:`1px solid ${BORDER}`,overflow:'hidden',marginBottom:'1rem'}}>
        <div style={{padding:'1.5rem',borderBottom:`1px solid ${BORDER}`,display:'flex',alignItems:'center',justifyContent:'space-between',background:'linear-gradient(135deg,#1a1a1a,#1e1a0a)'}}>
          <div>
            <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.55rem',fontWeight:700,letterSpacing:'0.2em',color:ORANGE,textTransform:'uppercase',margin:'0 0 4px'}}>Session Notes</p>
            <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'1.1rem',fontWeight:700,color:TEXT,letterSpacing:'-0.02em',margin:0}}>{fmtDateShort(session.scheduled_date)}  {session.scheduled_time}</p>
          </div>
          <button onClick={onClose} style={{background:'rgba(255,255,255,0.08)',border:'none',cursor:'pointer',color:TEXT,padding:'8px',borderRadius:'50%',minHeight:'auto',minWidth:'auto',display:'flex',alignItems:'center'}}><X size={16}/></button>
        </div>
        <div style={{padding:'1.25rem 1.5rem',maxHeight:'60vh',overflowY:'auto'}}>
          {loading?(
            <div style={{display:'flex',justifyContent:'center',padding:'2rem'}}><div style={{width:'20px',height:'20px',border:`2px solid ${ORANGE}`,borderTop:'2px solid transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}/></div>
          ):!note?(
            <div style={{textAlign:'center',padding:'2.5rem 0'}}>
              <div style={{width:'56px',height:'56px',borderRadius:'16px',background:'rgba(255,107,43,0.1)',border:`1px solid rgba(255,107,43,0.2)`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1rem'}}><FileText size={24} color={ORANGE}/></div>
              <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.85rem',color:MUTED,margin:0}}>No notes yet  your PT will add them after the session.</p>
            </div>
          ):(
            <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              {[
                {key:'what_we_worked_on',label:'What we worked on',color:ORANGE,icon:''},
                {key:'what_went_well',label:'What went well',color:GREEN,icon:''},
                {key:'what_to_improve',label:'Focus areas',color:YELLOW,icon:''},
                {key:'focus_next_session',label:'Next session focus',color:'#60a5fa',icon:''},
              ].filter(f=>note[f.key]).map(f=>(
                <div key={f.key} style={{background:`linear-gradient(135deg,${f.color}10,${SURFACE})`,borderLeft:`2px solid ${f.color}`,borderRadius:'10px',padding:'1rem'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'6px'}}>
                    <span style={{fontSize:'0.85rem'}}>{f.icon}</span>
                    <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.58rem',fontWeight:700,letterSpacing:'0.14em',color:f.color,textTransform:'uppercase',margin:0}}>{f.label}</p>
                  </div>
                  <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.85rem',color:'#c0c0c0',margin:0,lineHeight:1.65}}>{note[f.key]}</p>
                </div>
              ))}
              {note.injuries_concerns&&(
                <div style={{background:'rgba(239,68,68,0.08)',borderLeft:'2px solid #ef4444',borderRadius:'10px',padding:'1rem'}}>
                  <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.58rem',fontWeight:700,letterSpacing:'0.14em',color:'#ef4444',textTransform:'uppercase',margin:'0 0 6px'}}> Injuries / Concerns</p>
                  <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.85rem',color:'#ef4444',margin:0,lineHeight:1.65}}>{note.injuries_concerns}</p>
                </div>
              )}
              <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.65rem',color:GREEN,textAlign:'right',margin:'4px 0 0'}}> Written by your PT</p>
            </div>
          )}
        </div>
        <div style={{padding:'1rem 1.5rem',borderTop:`1px solid ${BORDER}`}}>
          <button onClick={onClose} style={{width:'100%',padding:'0.875rem',background:`linear-gradient(135deg,${ORANGE},${YELLOW})`,border:'none',borderRadius:'10px',color:'#000',fontFamily:"'DM Sans',system-ui",fontSize:'0.875rem',fontWeight:800,cursor:'pointer',minHeight:'auto'}}>Close</button>
        </div>
      </div>
    </div>
  );
}

function CancelModal({session,onConfirm,onClose,loading}){
  const hours=hoursUntil(session.scheduled_date,session.scheduled_time);const canCancel=hours>=24;
  return(
    <div onClick={onClose} style={{position:'fixed',inset:0,zIndex:50,display:'flex',alignItems:'center',justifyContent:'center',backgroundColor:'rgba(0,0,0,0.92)',padding:'1rem',backdropFilter:'blur(4px)'}}>
      <div onClick={e=>e.stopPropagation()} style={{width:'100%',maxWidth:'380px',backgroundColor:'#111',borderRadius:'20px',border:`1px solid ${canCancel?'rgba(255,107,43,0.3)':'rgba(239,68,68,0.3)'}`,overflow:'hidden'}}>
        <div style={{padding:'1.5rem',background:canCancel?'linear-gradient(135deg,#1e1a0a,#1a1a1a)':'linear-gradient(135deg,#1e0a0a,#1a1a1a)'}}>
          <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.55rem',fontWeight:700,letterSpacing:'0.2em',color:canCancel?ORANGE:'#ef4444',textTransform:'uppercase',margin:'0 0 8px'}}>{canCancel?'Cancel Session':'Cannot Cancel'}</p>
          <h3 style={{fontFamily:"'DM Sans',system-ui",fontSize:'1.5rem',fontWeight:800,color:TEXT,letterSpacing:'-0.03em',margin:'0 0 4px'}}>{canCancel?'Are you sure?':'24-Hour Policy'}</h3>
          <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.8rem',color:MUTED,margin:'0 0 1.25rem'}}>{fmtDateTime(session.scheduled_date,session.scheduled_time)}</p>
          <div style={{background:canCancel?'rgba(76,175,80,0.08)':'rgba(239,68,68,0.08)',borderLeft:`2px solid ${canCancel?GREEN:'#ef4444'}`,borderRadius:'10px',padding:'1rem'}}>
            <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.85rem',color:'#c0c0c0',margin:0,lineHeight:1.6}}>
              {canCancel?<>This session will be <strong style={{color:TEXT}}>returned to your block</strong>. You have {Math.floor(hours)}h notice  within policy.</>:<>This session is in <strong style={{color:TEXT}}>{Math.max(0,hours).toFixed(1)} hours</strong>. Cancellations require at least 24 hours notice.</>}
            </p>
          </div>
        </div>
        <div style={{borderTop:`1px solid ${BORDER}`,display:'flex'}}>
          <button onClick={onClose} style={{flex:1,padding:'1rem',backgroundColor:'transparent',border:'none',borderRight:`1px solid ${BORDER}`,color:MUTED,fontFamily:"'DM Sans',system-ui",fontSize:'0.875rem',fontWeight:600,cursor:'pointer',minHeight:'auto'}}>{canCancel?'Keep Session':'Got It'}</button>
          {canCancel&&<button onClick={onConfirm} disabled={loading} style={{flex:1,padding:'1rem',backgroundColor:'transparent',border:'none',color:'#ef4444',fontFamily:"'DM Sans',system-ui",fontSize:'0.875rem',fontWeight:700,cursor:loading?'not-allowed':'pointer',opacity:loading?0.5:1,minHeight:'auto'}}>{loading?'Cancelling':'Yes, Cancel'}</button>}
        </div>
      </div>
    </div>
  );
}

export default function ClientSessions(){
  const{user}=useAuth();const navigate=useNavigate();
  const[data,setData]=useState(null);const[loading,setLoading]=useState(true);
  const[cancelTarget,setCancelTarget]=useState(null);const[cancelLoading,setCancelLoading]=useState(false);
  const[noteTarget,setNoteTarget]=useState(null);

  const loadData=()=>{if(!user?.clientId)return;api.get(`/sessions/client/${user.clientId}`).then(r=>{setData(r.data);setLoading(false);}).catch(()=>setLoading(false));};
  useEffect(()=>{loadData();},[user]);

  const handleCancelConfirm=async()=>{
    if(!cancelTarget)return;setCancelLoading(true);
    try{await api.post(`/sessions/${cancelTarget.id}/cancel`);toast.success('Session cancelled  returned to your block.');setCancelTarget(null);loadData();}
    catch(err){toast.error(err.response?.status===403?'Cancellation blocked  less than 24 hours notice.':err.response?.data?.message||'Failed to cancel');}
    finally{setCancelLoading(false);}
  };

  if(loading)return(<div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'60vh',backgroundColor:BG}}><div style={{width:'24px',height:'24px',border:`2px solid ${ORANGE}`,borderTop:'2px solid transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}/></div>);

  const upcoming=sortOldestFirst(data?.upcoming||[],'scheduled_date','scheduled_time');
  const history=sortNewestFirst(data?.history||[],'scheduled_date','scheduled_time');
  const sessionsUsed=data?.sessionsUsed||0;const sessionsRemaining=data?.sessionsRemaining||0;
  const totalSessions=sessionsUsed+sessionsRemaining;const pct=totalSessions>0?(sessionsUsed/totalSessions)*100:0;
  const attended=history.filter(s=>s.status==='attended').length;
  const missed=history.filter(s=>s.status==='missed').length;
  const limitedHistory=user?.isPro?history:history.slice(0,5);

  return(
    <div style={{backgroundColor:BG,minHeight:'100vh',paddingBottom:'6rem',fontFamily:"'DM Sans',system-ui"}}>
      <div style={{maxWidth:'800px',margin:'0 auto',padding:'2rem 1.25rem'}}>
        <BackButton to="/client"/>

        {/* Header */}
        <div style={{margin:'1.5rem 0 2rem'}}>
          <p style={{fontSize:'0.6rem',fontWeight:700,letterSpacing:'0.2em',color:ORANGE,textTransform:'uppercase',margin:'0 0 6px'}}>Training</p>
          <h1 style={{fontFamily:"'DM Sans',system-ui",fontSize:'2.5rem',fontWeight:800,color:TEXT,letterSpacing:'-0.05em',margin:'0 0 4px',lineHeight:1}}>My Sessions</h1>
          <p style={{fontSize:'0.82rem',color:MUTED,margin:0}}>Track your training block progress</p>
        </div>

        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'10px',marginBottom:'1.25rem'}}>
          {[
            {value:attended, label:'Attended', color:GREEN,  bg:'rgba(76,175,80,0.1)',  border:'rgba(76,175,80,0.2)',  icon:''},
            {value:missed,   label:'Missed',   color:'#ef4444',bg:'rgba(239,68,68,0.1)',border:'rgba(239,68,68,0.2)', icon:''},
            {value:sessionsRemaining,label:'Remaining',color:YELLOW,bg:'rgba(255,214,0,0.1)',border:'rgba(255,214,0,0.2)',icon:''},
          ].map((s,i)=>(
            <div key={i} style={{borderRadius:'16px',padding:'1.1rem',background:s.bg,border:`1px solid ${s.border}`,textAlign:'center'}}>
              <p style={{fontSize:'1.1rem',margin:'0 0 2px'}}>{s.icon}</p>
              <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'2rem',fontWeight:800,color:s.color,letterSpacing:'-0.05em',lineHeight:1,margin:'0 0 4px'}}>{s.value}</p>
              <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.58rem',fontWeight:700,letterSpacing:'0.12em',color:s.color,textTransform:'uppercase',margin:0,opacity:0.8}}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Block tracker */}
        <div style={{borderRadius:'20px',padding:'1.5rem',marginBottom:'1.25rem',background:'linear-gradient(135deg,#1a2a1a,#1e1a0a,#1a1a1a)',border:'1px solid rgba(76,175,80,0.2)',boxShadow:'0 8px 32px rgba(76,175,80,0.06)',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:'-30px',right:'-30px',width:'120px',height:'120px',borderRadius:'50%',background:GREEN,opacity:0.04,pointerEvents:'none'}}/>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1.25rem'}}>
            <div>
              <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.58rem',fontWeight:700,letterSpacing:'0.2em',color:ORANGE,textTransform:'uppercase',margin:'0 0 5px'}}>Block {user?.blockNumber||1}</p>
              <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'1.1rem',fontWeight:800,color:TEXT,letterSpacing:'-0.02em',margin:0}}>{sessionsUsed} of {totalSessions||10} sessions</p>
              <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.75rem',color:MUTED,margin:'2px 0 0'}}>{sessionsRemaining} remaining in this block</p>
            </div>
            <div style={{textAlign:'right'}}>
              <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'2.5rem',fontWeight:300,color:GREEN,margin:0,lineHeight:1,letterSpacing:'-0.05em'}}>{Math.round(pct)}%</p>
              <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.6rem',color:MUTED,margin:'2px 0 0'}}>complete</p>
            </div>
          </div>

          {/* 10 dot session tracker */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(10,1fr)',gap:'6px',marginBottom:'14px'}}>
            {Array.from({length:totalSessions||10}).map((_,i)=>{
              const done=i<sessionsUsed;const next=i===sessionsUsed;const isNine=i===8;
              return(
                <div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'3px'}}>
                  <div style={{
                    width:'100%',aspectRatio:'1',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:'0.55rem',fontWeight:800,transition:'all 0.3s',
                    background:done?`linear-gradient(135deg,${GREEN},#2d8a30)`:next?`linear-gradient(135deg,${ORANGE},${YELLOW})`:'rgba(255,255,255,0.05)',
                    border:done?'none':next?`1.5px solid ${ORANGE}`:'1px solid rgba(255,255,255,0.08)',
                    color:done||next?'#000':'rgba(255,255,255,0.2)',
                    boxShadow:done?`0 2px 8px rgba(76,175,80,0.5)`:next?`0 2px 12px rgba(255,107,43,0.6)`:'none',
                  }}>
                    {done?'':i+1}
                  </div>
                  {isNine&&<span style={{fontSize:'0.45rem',lineHeight:1}}></span>}
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div style={{width:'100%',height:'5px',backgroundColor:'rgba(255,255,255,0.06)',borderRadius:'3px',overflow:'hidden',marginBottom:'0.875rem'}}>
            <div style={{height:'100%',width:`${pct}%`,background:`linear-gradient(90deg,${GREEN},${YELLOW})`,borderRadius:'3px',transition:'width 0.8s ease'}}/>
          </div>

          {/* Renewal warning */}
          {sessionsRemaining===1&&(
            <div style={{background:`linear-gradient(135deg,rgba(255,214,0,0.12),rgba(255,107,43,0.08))`,border:`1px solid rgba(255,214,0,0.3)`,borderRadius:'12px',padding:'0.875rem 1rem',display:'flex',alignItems:'center',gap:'10px'}}>
              <span style={{fontSize:'1.1rem'}}></span>
              <div style={{flex:1}}>
                <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.82rem',fontWeight:700,color:YELLOW,margin:'0 0 2px'}}>Last session remaining</p>
                <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.72rem',color:MUTED,margin:0}}>Contact your PT to renew your block</p>
              </div>
              <ArrowRight size={14} color={YELLOW}/>
            </div>
          )}
          {sessionsRemaining<=3&&sessionsRemaining>1&&(
            <div style={{background:'rgba(255,214,0,0.06)',border:'1px solid rgba(255,214,0,0.2)',borderRadius:'12px',padding:'0.875rem 1rem',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div>
                <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.82rem',fontWeight:700,color:YELLOW,margin:'0 0 2px'}}>Block almost complete</p>
                <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.72rem',color:MUTED,margin:0}}>{sessionsRemaining} session{sessionsRemaining!==1?'s':''} remaining</p>
              </div>
              <ArrowRight size={14} color={YELLOW}/>
            </div>
          )}
        </div>

        {/* Request Session */}
        <div style={{marginBottom:'1.25rem'}}>
          <button onClick={()=>navigate('/client/messages')} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',padding:'0.9rem',background:'linear-gradient(135deg,#1a1a1a,#1e1a0a)',border:'1px solid rgba(255,107,43,0.25)',borderRadius:'14px',color:ORANGE,fontFamily:"'DM Sans',system-ui",fontSize:'0.875rem',fontWeight:700,cursor:'pointer',minHeight:'auto',transition:'all 0.15s'}}
            onMouseEnter={e=>{e.currentTarget.style.background=`rgba(255,107,43,0.08)`;}}
            onMouseLeave={e=>{e.currentTarget.style.background='linear-gradient(135deg,#1a1a1a,#1e1a0a)';}}>
            <MessageSquare size={16}/>
            Request a Session from your PT
            <ArrowRight size={14}/>
          </button>
        </div>

        {/* Upcoming */}
        {upcoming.length>0&&(
          <div style={{marginBottom:'1.25rem'}}>
            <SectionLabel color={GREEN}>Upcoming Sessions</SectionLabel>
            <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
              {upcoming.map((s,i)=>{
                const hrs=hoursUntil(s.scheduled_date,s.scheduled_time);const locked=hrs>=0&&hrs<24;const sessionsLeftAfter=Math.max(0,sessionsRemaining-i-1);
                return(
                  <div key={s.id} style={{borderRadius:'14px',padding:'1rem 1.25rem',background:locked?'rgba(239,68,68,0.06)':'linear-gradient(135deg,rgba(76,175,80,0.06),rgba(26,26,26,1))',border:`1px solid ${locked?'rgba(239,68,68,0.2)':'rgba(76,175,80,0.2)'}`,display:'flex',alignItems:'center',justifyContent:'space-between',gap:'12px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'12px',flex:1}}>
                      <div style={{width:'38px',height:'38px',borderRadius:'10px',background:locked?'rgba(239,68,68,0.15)':'rgba(76,175,80,0.15)',border:`1px solid ${locked?'rgba(239,68,68,0.3)':'rgba(76,175,80,0.3)'}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        <Calendar size={16} color={locked?'#ef4444':GREEN}/>
                      </div>
                      <div>
                        <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.9rem',fontWeight:700,color:TEXT,margin:'0 0 3px',letterSpacing:'-0.01em'}}>{fmtDateTimeFull(s.scheduled_date,s.scheduled_time)}</p>
                        <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.7rem',color:MUTED,margin:0}}>
                          {sessionsLeftAfter} session{sessionsLeftAfter!==1?'s':''} left after this
                          {locked&&<span style={{color:'#ef4444',marginLeft:'8px',fontWeight:600}}> Within 24h</span>}
                        </p>
                      </div>
                    </div>
                    {hrs>=24&&(
                      <button onClick={()=>setCancelTarget(s)} style={{padding:'6px 14px',background:'transparent',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'8px',color:'rgba(239,68,68,0.6)',fontFamily:"'DM Sans',system-ui",fontSize:'0.72rem',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:'5px',minHeight:'auto',transition:'all 0.15s'}}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor='#ef4444';e.currentTarget.style.color='#ef4444';e.currentTarget.style.background='rgba(239,68,68,0.08)';}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(239,68,68,0.25)';e.currentTarget.style.color='rgba(239,68,68,0.6)';e.currentTarget.style.background='transparent';}}>
                        <X size={11}/>Cancel
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* History */}
        <div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'0.875rem'}}>
            <SectionLabel color={MUTED}>Session History</SectionLabel>
            {!user?.isPro&&history.length>5&&(
              <button onClick={()=>navigate('/client/upgrade')} style={{display:'flex',alignItems:'center',gap:'4px',background:'none',border:'none',cursor:'pointer',fontFamily:"'DM Sans',system-ui",fontSize:'0.65rem',fontWeight:700,color:YELLOW,letterSpacing:'0.08em',textTransform:'uppercase',minHeight:'auto',padding:0}}>
                <Crown size={11}/>See all {history.length}
              </button>
            )}
          </div>
          {limitedHistory.length===0?(
            <div style={{borderRadius:'16px',padding:'2.5rem',textAlign:'center',background:SURFACE,border:`1px solid ${BORDER}`}}>
              <p style={{fontSize:'2rem',margin:'0 0 8px'}}></p>
              <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.85rem',color:MUTED,margin:0}}>No session history yet</p>
            </div>
          ):(
            <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
              {limitedHistory.map(s=>{
                const isAttended=s.status==='attended';const isCancelled=s.status==='cancelled';
                const statusColor=isAttended?GREEN:isCancelled?MUTED:'#ef4444';
                const statusBg=isAttended?'rgba(76,175,80,0.1)':isCancelled?'rgba(255,255,255,0.04)':'rgba(239,68,68,0.08)';
                const statusLabel=isAttended?' Attended':isCancelled?'Cancelled':'Missed';
                return(
                  <div key={s.id} style={{borderRadius:'14px',padding:'1rem 1.25rem',background:statusBg,border:`1px solid ${isAttended?'rgba(76,175,80,0.15)':isCancelled?BORDER:'rgba(239,68,68,0.15)'}`,display:'flex',alignItems:'center',justifyContent:'space-between',gap:'12px',opacity:isCancelled?0.6:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:'12px',flex:1}}>
                      <div style={{width:'34px',height:'34px',borderRadius:'10px',background:`${statusColor}18`,border:`1px solid ${statusColor}30`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:'0.9rem'}}>
                        {isAttended?'':isCancelled?'':''}
                      </div>
                      <div>
                        <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.875rem',fontWeight:700,color:isAttended?TEXT:'#808080',margin:'0 0 3px',letterSpacing:'-0.01em'}}>{fmtDateTime(s.scheduled_date,s.scheduled_time)}</p>
                        <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.7rem',color:MUTED,margin:0}}>
                          {s.status==='missed'&&'Missed  session preserved'}
                          {isCancelled&&s.session_carried_over===1&&`Cancelled  returned to block${s.cancellation_notice_hours!=null?`  ${Math.floor(s.cancellation_notice_hours)}h notice`:''}`}
                        </p>
                      </div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:'8px',flexShrink:0}}>
                      {isAttended&&(
                        <button onClick={()=>setNoteTarget(s)} style={{background:'rgba(255,107,43,0.1)',border:'1px solid rgba(255,107,43,0.2)',borderRadius:'8px',cursor:'pointer',color:ORANGE,padding:'6px 10px',minHeight:'auto',minWidth:'auto',display:'flex',alignItems:'center',gap:'4px',transition:'all 0.15s',fontSize:'0.7rem',fontWeight:700}}
                          onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,107,43,0.2)';}}
                          onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,107,43,0.1)';}}>
                          <FileText size={12}/>Notes
                        </button>
                      )}
                      <span style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.62rem',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:statusColor,backgroundColor:`${statusColor}15`,border:`1px solid ${statusColor}25`,padding:'3px 10px',borderRadius:'20px',whiteSpace:'nowrap'}}>{statusLabel}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {!user?.isPro&&history.length>5&&(
            <div onClick={()=>navigate('/client/upgrade')} style={{marginTop:'8px',borderRadius:'14px',padding:'1rem 1.25rem',background:'rgba(255,214,0,0.06)',border:'1px solid rgba(255,214,0,0.2)',display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer'}}>
              <div>
                <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.85rem',fontWeight:700,color:YELLOW,margin:'0 0 2px'}}>{history.length-5} more sessions</p>
                <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.72rem',color:MUTED,margin:0}}>Upgrade to Pro to see full history</p>
              </div>
              <Crown size={14} color={YELLOW}/>
            </div>
          )}
        </div>
      </div>
      {cancelTarget&&<CancelModal session={cancelTarget} onConfirm={handleCancelConfirm} onClose={()=>setCancelTarget(null)} loading={cancelLoading}/>}
      {noteTarget&&<SessionNoteModal session={noteTarget} onClose={()=>setNoteTarget(null)}/>}
    </div>
  );
}

