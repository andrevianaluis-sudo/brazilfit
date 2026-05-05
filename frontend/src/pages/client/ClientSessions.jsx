import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Crown, AlertTriangle, X, Ban, FileText, ArrowRight } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import BackButton from '../../components/BackButton';
import { fmtDate, fmtDateTimeFull, fmtDateTime, fmtDateShort, sortOldestFirst, sortNewestFirst } from '../../utils/dateUtils';

const BG = '#141414';
const SURFACE = '#2a2a2a';
const SURFACE2 = '#333333';
const BORDER = 'rgba(255,255,255,0.15)';
const TEXT = '#ffffff';
const MUTED = '#707070';
const ORANGE = '#FF6B2B';
const YELLOW = '#FFD600';
const GREEN = '#4CAF50';

function hoursUntil(date, time) {
  return (new Date(`${date}T${time}:00`) - new Date()) / 3600000;
}

function SectionLabel({ children, color = MUTED }) {
  return <p style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.18em', color, textTransform:'uppercase', margin:'0 0 0.75rem' }}>{children}</p>;
}

// ── Notes Modal ───────────────────────────────────────────────────────────────
function SessionNoteModal({ session, onClose }) {
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/sessions/${session.id}/note`)
      .then(r => { setNote(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [session.id]);

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'flex-end', justifyContent:'center', backgroundColor:'rgba(0,0,0,0.85)', padding:'1rem' }}>
      <div onClick={e => e.stopPropagation()} style={{ width:'100%', maxWidth:'480px', backgroundColor:'#111', borderRadius:'16px', border:`1px solid ${BORDER}`, overflow:'hidden', marginBottom:'1rem' }}>
        <div style={{ padding:'1.25rem 1.5rem', borderBottom:`1px solid ${BORDER}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <SectionLabel color={ORANGE}>Session Notes</SectionLabel>
            <p style={{ fontFamily:"'Clash Display', system-ui", fontSize:'1.1rem', fontWeight:700, color:TEXT, letterSpacing:'-0.02em', margin:0 }}>{fmtDateShort(session.scheduled_date)} · {session.scheduled_time}</p>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:MUTED, padding:'4px', minHeight:'auto', minWidth:'auto' }}><X size={16} /></button>
        </div>
        <div style={{ padding:'1.25rem 1.5rem', maxHeight:'60vh', overflowY:'auto' }}>
          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', padding:'2rem' }}>
              <div style={{ width:'20px', height:'20px', border:`2px solid ${ORANGE}`, borderTop:'2px solid transparent', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
            </div>
          ) : !note ? (
            <div style={{ textAlign:'center', padding:'2rem 0' }}>
              <FileText size={28} color={MUTED} style={{ marginBottom:'0.75rem', opacity:0.4 }} />
              <p style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.85rem', color:MUTED, margin:0 }}>No notes yet — your PT will add them after the session.</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              {[
                { key:'what_we_worked_on', label:'What we worked on', color:ORANGE },
                { key:'what_went_well',    label:'What went well',    color:GREEN },
                { key:'what_to_improve',   label:'Focus areas',       color:YELLOW },
                { key:'focus_next_session',label:'Next session focus', color:'#60a5fa' },
              ].filter(f => note[f.key]).map(f => (
                <div key={f.key} style={{ backgroundColor:SURFACE2, borderLeft:`2px solid ${f.color}`, borderRadius:'6px', padding:'1rem' }}>
                  <p style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.14em', color:f.color, textTransform:'uppercase', margin:'0 0 0.4rem' }}>{f.label}</p>
                  <p style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.85rem', color:'#b0b0b0', margin:0, lineHeight:1.6 }}>{note[f.key]}</p>
                </div>
              ))}
              {note.injuries_concerns && (
                <div style={{ backgroundColor:'rgba(239,68,68,0.08)', borderLeft:'2px solid #ef4444', borderRadius:'6px', padding:'1rem' }}>
                  <p style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.14em', color:'#ef4444', textTransform:'uppercase', margin:'0 0 0.4rem' }}>Injuries / Concerns</p>
                  <p style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.85rem', color:'#ef4444', margin:0, lineHeight:1.6 }}>{note.injuries_concerns}</p>
                </div>
              )}
              <p style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.65rem', color:GREEN, textAlign:'right', margin:'0.25rem 0 0' }}>Written by your PT</p>
            </div>
          )}
        </div>
        <div style={{ padding:'1rem 1.5rem', borderTop:`1px solid ${BORDER}` }}>
          <button onClick={onClose} style={{ width:'100%', padding:'0.8rem', backgroundColor:SURFACE2, border:`1px solid ${BORDER}`, borderRadius:'8px', color:TEXT, fontFamily:"'DM Sans', system-ui", fontSize:'0.875rem', fontWeight:600, cursor:'pointer', minHeight:'auto' }}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Cancel Modal ──────────────────────────────────────────────────────────────
function CancelModal({ session, onConfirm, onClose, loading }) {
  const hours = hoursUntil(session.scheduled_date, session.scheduled_time);
  const canCancel = hours >= 24;

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:'rgba(0,0,0,0.85)', padding:'1rem' }}>
      <div onClick={e => e.stopPropagation()} style={{ width:'100%', maxWidth:'380px', backgroundColor:'#111', borderRadius:'16px', border:`1px solid ${BORDER}`, overflow:'hidden' }}>
        <div style={{ padding:'1.5rem' }}>
          <SectionLabel color={canCancel ? ORANGE : '#ef4444'}>{canCancel ? 'Cancel Session' : 'Cannot Cancel'}</SectionLabel>
          <h3 style={{ fontFamily:"'Clash Display', system-ui", fontSize:'1.3rem', fontWeight:700, color:TEXT, letterSpacing:'-0.02em', margin:'0 0 0.3rem' }}>{canCancel ? 'Are you sure?' : '24-Hour Policy'}</h3>
          <p style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.8rem', color:MUTED, margin:'0 0 1.25rem' }}>{fmtDateTime(session.scheduled_date, session.scheduled_time)}</p>
          <div style={{ backgroundColor:SURFACE2, borderLeft:`2px solid ${canCancel ? GREEN : '#ef4444'}`, borderRadius:'6px', padding:'1rem' }}>
            <p style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.85rem', color:'#b0b0b0', margin:0, lineHeight:1.6 }}>
              {canCancel
                ? <>This session will be <strong style={{ color:TEXT }}>returned to your block</strong>. You have {Math.floor(hours)}h notice — within policy.</>
                : <>This session is in <strong style={{ color:TEXT }}>{Math.max(0, hours).toFixed(1)} hours</strong>. Cancellations require at least 24 hours notice.</>}
            </p>
          </div>
        </div>
        <div style={{ borderTop:`1px solid ${BORDER}`, display:'flex' }}>
          <button onClick={onClose} style={{ flex:1, padding:'1rem', backgroundColor:'transparent', border:'none', borderRight:`1px solid ${BORDER}`, color:MUTED, fontFamily:"'DM Sans', system-ui", fontSize:'0.875rem', fontWeight:600, cursor:'pointer', minHeight:'auto' }}>
            {canCancel ? 'Keep Session' : 'Got It'}
          </button>
          {canCancel && (
            <button onClick={onConfirm} disabled={loading} style={{ flex:1, padding:'1rem', backgroundColor:'transparent', border:'none', color:'#ef4444', fontFamily:"'DM Sans', system-ui", fontSize:'0.875rem', fontWeight:700, cursor:loading?'not-allowed':'pointer', opacity:loading?0.5:1, minHeight:'auto' }}>
              {loading ? 'Cancelling…' : 'Yes, Cancel'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ClientSessions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [noteTarget, setNoteTarget] = useState(null);

  const loadData = () => {
    if (!user?.clientId) return;
    api.get(`/sessions/client/${user.clientId}`)
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [user]);

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    setCancelLoading(true);
    try {
      await api.post(`/sessions/${cancelTarget.id}/cancel`);
      toast.success('Session cancelled — returned to your block.');
      setCancelTarget(null); loadData();
    } catch (err) {
      toast.error(err.response?.status === 403 ? 'Cancellation blocked — less than 24 hours notice.' : err.response?.data?.message || 'Failed to cancel');
    } finally { setCancelLoading(false); }
  };

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh', backgroundColor:BG }}>
      <div style={{ width:'20px', height:'20px', border:`2px solid ${ORANGE}`, borderTop:'2px solid transparent', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
    </div>
  );

  const upcoming = sortOldestFirst(data?.upcoming || [], 'scheduled_date', 'scheduled_time');
  const history = sortNewestFirst(data?.history || [], 'scheduled_date', 'scheduled_time');
  const sessionsUsed = data?.sessionsUsed || 0;
  const sessionsRemaining = data?.sessionsRemaining || 0;
  const totalSessions = sessionsUsed + sessionsRemaining;
  const pct = totalSessions > 0 ? (sessionsUsed / totalSessions) * 100 : 0;
  const attended = history.filter(s => s.status === 'attended').length;
  const missed = history.filter(s => s.status === 'missed').length;
  const limitedHistory = user?.isPro ? history : history.slice(0, 5);

  return (
    <div style={{ backgroundColor:BG, minHeight:'100vh', paddingBottom:'6rem' }}>
      <div style={{ maxWidth:'800px', margin:'0 auto', padding:'2rem 1.25rem' }}>
        <BackButton to="/client" />

        {/* Header */}
        <div style={{ margin:'1.25rem 0 1.5rem' }}>
          <p style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.18em', color:ORANGE, textTransform:'uppercase', margin:'0 0 0.4rem' }}>Training</p>
          <h1 style={{ fontFamily:"'Clash Display', system-ui", fontSize:'2rem', fontWeight:700, color:TEXT, letterSpacing:'-0.03em', margin:0 }}>My Sessions</h1>
        </div>

        {/* Stats cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'8px', marginBottom:'1rem' }}>
          {[
            { value: attended,          label: 'Attended',   color: GREEN },
            { value: missed,            label: 'Missed',     color: '#ef4444' },
            { value: sessionsRemaining, label: 'Remaining',  color: YELLOW },
          ].map((s, i) => (
            <div key={i} style={{ backgroundColor:SURFACE, borderRadius:'12px', padding:'1.1rem', border:`1px solid ${BORDER}`, textAlign:'center' }}>
              <p style={{ fontFamily:"'Clash Display', system-ui", fontSize:'2rem', fontWeight:800, color:s.color, letterSpacing:'-0.03em', lineHeight:1, margin:'0 0 0.35rem' }}>{s.value}</p>
              <p style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.1em', color:MUTED, textTransform:'uppercase', margin:0 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Block progress */}
        <div style={{ backgroundColor:SURFACE, borderRadius:'12px', padding:'1.1rem 1.25rem', border:`1px solid ${BORDER}`, marginBottom:'1rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem' }}>
            <div>
              <SectionLabel>Block {user?.blockNumber || 1} Progress</SectionLabel>
              <p style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.78rem', color:MUTED, margin:0 }}>{sessionsUsed} of {totalSessions} sessions completed</p>
            </div>
            <p style={{ fontFamily:"'Clash Display', system-ui", fontSize:'1.5rem', fontWeight:800, color:GREEN, letterSpacing:'-0.03em', margin:0 }}>{Math.round(pct)}%</p>
          </div>
          <div style={{ width:'100%', height:'4px', backgroundColor:SURFACE2, borderRadius:'2px', overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${pct}%`, background:`linear-gradient(90deg, ${ORANGE}, ${YELLOW})`, borderRadius:'2px', transition:'width 0.8s ease' }} />
          </div>
          {sessionsRemaining <= 3 && sessionsRemaining > 0 && (
            <div style={{ marginTop:'0.875rem', backgroundColor:`${YELLOW}12`, borderLeft:`2px solid ${YELLOW}`, borderRadius:'6px', padding:'0.75rem 1rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <p style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.82rem', fontWeight:700, color:YELLOW, margin:'0 0 2px' }}>Block almost complete</p>
                <p style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.72rem', color:MUTED, margin:0 }}>{sessionsRemaining} session{sessionsRemaining!==1?'s':''} remaining</p>
              </div>
              <ArrowRight size={14} color={YELLOW} />
            </div>
          )}
        </div>

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <div style={{ marginBottom:'1rem' }}>
            <SectionLabel>Upcoming Sessions</SectionLabel>
            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              {upcoming.map((s, i) => {
                const hrs = hoursUntil(s.scheduled_date, s.scheduled_time);
                const locked = hrs >= 0 && hrs < 24;
                const sessionsLeftAfter = Math.max(0, sessionsRemaining - i - 1);
                return (
                  <div key={s.id} style={{ backgroundColor:SURFACE, borderRadius:'10px', padding:'0.875rem 1rem', border:`1px solid ${locked ? 'rgba(239,68,68,0.25)' : BORDER}`, display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px', flex:1 }}>
                      <div style={{ width:'7px', height:'7px', borderRadius:'50%', backgroundColor:locked?'#ef4444':GREEN, flexShrink:0, boxShadow:`0 0 6px ${locked?'#ef4444':GREEN}66` }} />
                      <div>
                        <p style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.875rem', fontWeight:600, color:TEXT, margin:'0 0 2px' }}>{fmtDateTimeFull(s.scheduled_date, s.scheduled_time)}</p>
                        <p style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.7rem', color:MUTED, margin:0 }}>
                          {sessionsLeftAfter} session{sessionsLeftAfter!==1?'s':''} left after this
                          {locked && <span style={{ color:'#ef4444', marginLeft:'8px' }}>· Within 24h</span>}
                        </p>
                      </div>
                    </div>
                    {hrs >= 24 && <button onClick={() => setCancelTarget(s)} style={{
                      padding:'5px 12px', backgroundColor:'transparent',
                      border:`1px solid ${locked?SURFACE2:BORDER}`,
                      borderRadius:'6px', color:locked?SURFACE2:MUTED,
                      fontFamily:"'DM Sans', system-ui", fontSize:'0.72rem', fontWeight:600,
                      cursor:locked?'not-allowed':'pointer', display:'flex', alignItems:'center', gap:'4px',
                      minHeight:'auto', transition:'all 0.15s',
                    }}
                      onMouseEnter={e => { if(!locked) { e.currentTarget.style.borderColor='#ef4444'; e.currentTarget.style.color='#ef4444'; }}}
                      onMouseLeave={e => { if(!locked) { e.currentTarget.style.borderColor=BORDER; e.currentTarget.style.color=MUTED; }}}>
                      {locked ? <Ban size={11}/> : <X size={11}/>}
                      {locked ? 'Locked' : 'Cancel'}
                    </button>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* History */}
        <div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.75rem' }}>
            <SectionLabel>Session History</SectionLabel>
            {!user?.isPro && history.length > 5 && (
              <button onClick={() => navigate('/client/upgrade')} style={{ display:'flex', alignItems:'center', gap:'4px', background:'none', border:'none', cursor:'pointer', fontFamily:"'DM Sans', system-ui", fontSize:'0.65rem', fontWeight:700, color:YELLOW, letterSpacing:'0.08em', textTransform:'uppercase', minHeight:'auto', padding:0 }}>
                <Crown size={11}/> See all {history.length}
              </button>
            )}
          </div>

          {limitedHistory.length === 0 ? (
            <div style={{ backgroundColor:SURFACE, borderRadius:'10px', padding:'2rem', textAlign:'center', border:`1px solid ${BORDER}` }}>
              <p style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.85rem', color:MUTED, margin:0 }}>No session history yet</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              {limitedHistory.map((s) => {
                const isAttended = s.status === 'attended';
                const isCancelled = s.status === 'cancelled';
                const statusColor = isAttended ? GREEN : isCancelled ? MUTED : '#ef4444';
                return (
                  <div key={s.id} style={{ backgroundColor:SURFACE, borderRadius:'10px', padding:'0.875rem 1rem', border:`1px solid ${BORDER}`, display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px', opacity: isCancelled ? 0.7 : 1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px', flex:1 }}>
                      <div style={{ width:'7px', height:'7px', borderRadius:'50%', backgroundColor:statusColor, flexShrink:0 }} />
                      <div>
                        <p style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.875rem', fontWeight:600, color:isAttended?TEXT:'#808080', margin:'0 0 2px' }}>{fmtDateTime(s.scheduled_date, s.scheduled_time)}</p>
                        {s.status === 'missed' && <p style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.7rem', color:'#ef4444', margin:0 }}>Missed · block preserved</p>}
                        {isCancelled && s.session_carried_over === 1 && <p style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.7rem', color:MUTED, margin:0 }}>Cancelled · returned to block{s.cancellation_notice_hours!=null?` · ${Math.floor(s.cancellation_notice_hours)}h notice`:''}</p>}
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px', flexShrink:0 }}>
                      {isAttended && (
                        <button onClick={() => setNoteTarget(s)} style={{ background:'none', border:'none', cursor:'pointer', color:MUTED, padding:'4px', minHeight:'auto', minWidth:'auto', transition:'color 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.color=ORANGE}
                          onMouseLeave={e => e.currentTarget.style.color=MUTED}>
                          <FileText size={14}/>
                        </button>
                      )}
                      <span style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:statusColor, backgroundColor:`${statusColor}15`, padding:'2px 7px', borderRadius:'4px' }}>{s.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!user?.isPro && history.length > 5 && (
            <div onClick={() => navigate('/client/upgrade')} style={{ marginTop:'8px', backgroundColor:SURFACE, borderRadius:'10px', padding:'0.875rem 1rem', border:`1px solid ${BORDER}`, display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer' }}>
              <div>
                <p style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.85rem', fontWeight:600, color:MUTED, margin:'0 0 2px' }}>{history.length - 5} more sessions</p>
                <p style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.72rem', color:MUTED, margin:0, opacity:0.7 }}>Upgrade to Pro to see full history</p>
              </div>
              <Crown size={14} color={YELLOW}/>
            </div>
          )}
        </div>
      </div>

      {cancelTarget && <CancelModal session={cancelTarget} onConfirm={handleCancelConfirm} onClose={() => setCancelTarget(null)} loading={cancelLoading}/>}
      {noteTarget && <SessionNoteModal session={noteTarget} onClose={() => setNoteTarget(null)}/>}
    </div>
  );
}
