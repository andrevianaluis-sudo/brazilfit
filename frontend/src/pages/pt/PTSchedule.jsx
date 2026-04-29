import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, AlertTriangle, AlertCircle, CheckCircle, Clock, Ban, FileText, X } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const BG = '#141414';
const SURFACE = '#1e1e1e';
const SURFACE2 = '#272727';
const BORDER = 'rgba(255,255,255,0.08)';
const TEXT = '#ffffff';
const MUTED = '#707070';
const ORANGE = '#FF6B2B';
const YELLOW = '#FFD600';
const GREEN = '#4CAF50';

const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const FULL_DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function getWorkingHours(dow) {
  const schedule = { 0:[], 1:[{start:7,end:20}], 2:[{start:7,end:20}], 3:[{start:7,end:14},{start:17,end:20}], 4:[{start:8,end:14}], 5:[{start:8,end:20}], 6:[] };
  return schedule[dow] || [];
}
function isInWorkingHours(hour, dow) {
  return getWorkingHours(dow).some(({start,end}) => hour >= start && hour < end);
}
function getRenewalStatus(rem) {
  if (rem <= 0) return { color: '#ef4444', label: 'RENEW NOW' };
  if (rem === 1) return { color: ORANGE, label: '1 LEFT' };
  if (rem === 2) return { color: YELLOW, label: '2 LEFT' };
  return null;
}
function getStatusBorder(status) {
  if (status === 'attended') return GREEN;
  if (status === 'missed') return '#ef4444';
  if (status === 'cancelled') return BORDER;
  return ORANGE;
}

// ── Notes Modal ───────────────────────────────────────────────────────────────
function PTNotesModal({ session, onClose }) {
  const [note, setNote] = useState({ what_we_worked_on:'', what_went_well:'', what_to_improve:'', focus_next_session:'', injuries_concerns:'' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/sessions/${session.id}/note`)
      .then(r => { if (r.data) setNote(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [session.id]);

  const handleSave = async () => {
    setSaving(true);
    try { await api.post(`/sessions/${session.id}/note`, note); toast.success('Notes saved!'); onClose(); }
    catch { toast.error('Failed to save notes'); } finally { setSaving(false); }
  };

  const fields = [
    { key: 'what_we_worked_on', label: 'What we worked on', color: '#c0c0c0' },
    { key: 'what_went_well', label: 'What went well', color: GREEN },
    { key: 'what_to_improve', label: 'What to improve', color: YELLOW },
    { key: 'focus_next_session', label: 'Focus next session', color: '#60a5fa' },
    { key: 'injuries_concerns', label: 'Injuries / Concerns', color: '#ef4444' },
  ];

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'flex-end', justifyContent:'center', backgroundColor:'rgba(0,0,0,0.8)', padding:'1rem' }}>
      <div onClick={e => e.stopPropagation()} style={{ width:'100%', maxWidth:'480px', backgroundColor:'#111', borderRadius:'16px', border:`1px solid ${BORDER}`, maxHeight:'90vh', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'1rem 1.25rem', borderBottom:`1px solid ${BORDER}`, display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <FileText size={15} color={ORANGE} />
            <div>
              <p style={{ fontFamily:"'Satoshi', system-ui", fontSize:'0.875rem', fontWeight:700, color:TEXT, margin:0 }}>Session Notes</p>
              <p style={{ fontFamily:"'Satoshi', system-ui", fontSize:'0.7rem', color:MUTED, margin:0 }}>{session.client_name} · {session.scheduled_date} {session.scheduled_time}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:MUTED, padding:'4px', minHeight:'auto', minWidth:'auto' }}><X size={16} /></button>
        </div>

        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:'2rem' }}>
            <div style={{ width:'20px', height:'20px', border:`2px solid ${ORANGE}`, borderTop:'2px solid transparent', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
          </div>
        ) : (
          <div style={{ overflowY:'auto', flex:1, padding:'1rem 1.25rem', display:'flex', flexDirection:'column', gap:'0.75rem' }}>
            {fields.map(({ key, label, color }) => (
              <div key={key}>
                <label style={{ fontFamily:"'Satoshi', system-ui", fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.14em', color, textTransform:'uppercase', display:'block', marginBottom:'0.4rem' }}>{label}</label>
                <textarea value={note[key] || ''} onChange={e => setNote(n => ({...n, [key]: e.target.value}))}
                  rows={key === 'injuries_concerns' ? 2 : 3} placeholder={`${label}...`}
                  style={{ width:'100%', backgroundColor:SURFACE2, border:`1px solid ${BORDER}`, borderRadius:'8px', padding:'0.65rem 0.875rem', color:TEXT, fontFamily:"'Satoshi', system-ui", fontSize:'0.85rem', outline:'none', resize:'none', boxSizing:'border-box', transition:'border-color 0.15s' }}
                  onFocus={e => e.target.style.borderColor = color}
                  onBlur={e => e.target.style.borderColor = BORDER} />
              </div>
            ))}
          </div>
        )}

        <div style={{ display:'flex', borderTop:`1px solid ${BORDER}`, flexShrink:0 }}>
          <button onClick={onClose} style={{ flex:1, padding:'0.9rem', background:'none', border:'none', color:MUTED, fontFamily:"'Satoshi', system-ui", fontSize:'0.875rem', cursor:'pointer', minHeight:'auto' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ flex:1, padding:'0.9rem', background:`linear-gradient(135deg, ${ORANGE}, ${YELLOW})`, border:'none', borderLeft:`1px solid ${BORDER}`, color:'#000', fontFamily:"'Satoshi', system-ui", fontSize:'0.875rem', fontWeight:800, cursor:saving?'not-allowed':'pointer', opacity:saving?0.7:1, minHeight:'auto' }}>
            {saving ? 'Saving…' : 'Save Notes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Session Slot ──────────────────────────────────────────────────────────────
function SessionSlot({ entry, onMarkAttended, onMarkMissed, onMarkUpcoming, onNotes }) {
  const isClass = entry.entryType === 'class';
  const isCancelled = entry.status === 'cancelled';
  const borderColor = isClass ? '#f472b6' : getStatusBorder(entry.status);
  const renewalStatus = !isClass && !isCancelled ? getRenewalStatus(entry.sessions_remaining) : null;

  if (isClass) return (
    <div style={{ borderRadius:'8px', padding:'0.6rem 0.875rem', backgroundColor:'rgba(244,114,182,0.1)', border:'1px solid rgba(244,114,182,0.25)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
      <div>
        <p style={{ fontFamily:"'Satoshi', system-ui", fontSize:'0.85rem', fontWeight:600, color:'#f9a8d4', margin:'0 0 2px' }}>{entry.name}</p>
        <p style={{ fontFamily:"'Satoshi', system-ui", fontSize:'0.7rem', color:'rgba(249,168,212,0.6)', margin:0 }}>{entry.scheduled_time} · {entry.payment_type === 'per_person' ? `£${entry.per_person_fee}/person` : `£${entry.flat_fee}`}</p>
      </div>
      <span style={{ fontFamily:"'Satoshi', system-ui", fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#f9a8d4', backgroundColor:'rgba(244,114,182,0.15)', padding:'2px 8px', borderRadius:'4px' }}>Class</span>
    </div>
  );

  if (isCancelled) return (
    <div style={{ borderRadius:'8px', padding:'0.6rem 0.875rem', backgroundColor:'rgba(255,255,255,0.03)', border:`1px solid ${BORDER}`, opacity:0.7 }}>
      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
        <Ban size={13} color={MUTED} />
        <p style={{ fontFamily:"'Satoshi', system-ui", fontSize:'0.85rem', fontWeight:600, color:MUTED, margin:0, textDecoration:'line-through' }}>{entry.client_name}</p>
        <span style={{ fontFamily:"'Satoshi', system-ui", fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.1em', color:MUTED, backgroundColor:'rgba(255,255,255,0.05)', padding:'2px 6px', borderRadius:'4px' }}>CANCELLED</span>
      </div>
      <p style={{ fontFamily:"'Satoshi', system-ui", fontSize:'0.7rem', color:MUTED, margin:'3px 0 0 21px' }}>
        {entry.scheduled_time}{entry.cancellation_notice_hours != null ? ` · ${Math.floor(entry.cancellation_notice_hours)}h notice · session carried over` : ''}
      </p>
    </div>
  );

  return (
    <div style={{ borderRadius:'8px', padding:'0.6rem 0.875rem', backgroundColor:`${borderColor}10`, border:`1px solid ${borderColor}40` }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'8px' }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap', marginBottom:'3px' }}>
            <p style={{ fontFamily:"'Satoshi', system-ui", fontSize:'0.875rem', fontWeight:700, color:TEXT, margin:0 }}>{entry.client_name}</p>
            {renewalStatus && <span style={{ fontFamily:"'Satoshi', system-ui", fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.1em', color:renewalStatus.color, backgroundColor:`${renewalStatus.color}18`, padding:'2px 6px', borderRadius:'4px' }}>{renewalStatus.label}</span>}
            {entry.client_type === 'Online' && <span style={{ fontFamily:"'Satoshi', system-ui", fontSize:'0.6rem', fontWeight:700, color:'#60a5fa', backgroundColor:'rgba(96,165,250,0.12)', padding:'2px 6px', borderRadius:'4px' }}>Online</span>}
          </div>
          <p style={{ fontFamily:"'Satoshi', system-ui", fontSize:'0.72rem', color:MUTED, margin:0 }}>{entry.scheduled_time} · Session {entry.sessions_used} of 10 · {entry.sessions_remaining} remaining</p>
        </div>
        <div style={{ display:'flex', gap:'4px', flexShrink:0 }}>
          {entry.status === 'attended' && (
            <button onClick={() => onNotes(entry)} style={{ width:'30px', height:'30px', borderRadius:'6px', backgroundColor:SURFACE2, border:`1px solid ${BORDER}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', minHeight:'auto', minWidth:'auto', transition:'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = ORANGE}
              onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}>
              <FileText size={13} color={MUTED} />
            </button>
          )}
          {entry.status !== 'attended' && (
            <button onClick={onMarkAttended} style={{ width:'30px', height:'30px', borderRadius:'6px', backgroundColor:`${GREEN}18`, border:`1px solid ${GREEN}44`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', minHeight:'auto', minWidth:'auto', transition:'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = `${GREEN}30`}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = `${GREEN}18`}>
              <CheckCircle size={13} color={GREEN} />
            </button>
          )}
          {entry.status === 'attended' && (
            <button onClick={onMarkUpcoming} style={{ width:'30px', height:'30px', borderRadius:'6px', backgroundColor:SURFACE2, border:`1px solid ${BORDER}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', minHeight:'auto', minWidth:'auto' }}>
              <Clock size={13} color={MUTED} />
            </button>
          )}
          {entry.status !== 'missed' && entry.status !== 'attended' && (
            <button onClick={onMarkMissed} style={{ width:'30px', height:'30px', borderRadius:'6px', backgroundColor:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.3)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', minHeight:'auto', minWidth:'auto', color:'#ef4444', fontWeight:700, fontSize:'0.85rem' }}>✕</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Week View ─────────────────────────────────────────────────────────────────
function WeekView({ data }) {
  if (!data) return null;
  const { weekDates, sessions, classes } = data;
  const days = weekDates?.slice(0,7) || [];
  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={{ overflowX:'auto', marginLeft:'-1.25rem', marginRight:'-1.25rem', padding:'0 1.25rem' }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:'4px', minWidth:'560px' }}>
        {days.map((date) => {
          const d = new Date(date + 'T12:00:00');
          const daySessions = sessions?.filter(s => s.scheduled_date === date) || [];
          const dayClasses = classes?.filter(c => c.day_of_week === d.getDay()) || [];
          const isToday = date === today;
          return (
            <div key={date} style={{ borderRadius:'8px', border:`1px solid ${isToday ? `${ORANGE}44` : BORDER}`, backgroundColor: isToday ? `${ORANGE}08` : SURFACE, padding:'0.5rem 0.4rem' }}>
              <p style={{ fontFamily:"'Satoshi', system-ui", fontSize:'0.65rem', fontWeight:700, textAlign:'center', color: isToday ? ORANGE : MUTED, margin:'0 0 6px', letterSpacing:'0.05em' }}>
                {DAY_NAMES[d.getDay()]}<br/><span style={{ fontWeight:400 }}>{d.getDate()}</span>
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:'3px' }}>
                {daySessions.map(s => (
                  <div key={s.id} style={{ backgroundColor:`${GREEN}18`, borderRadius:'4px', padding:'3px 5px' }}>
                    <p style={{ fontFamily:"'Satoshi', system-ui", fontSize:'0.6rem', fontWeight:600, color:GREEN, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.client_name}</p>
                    <p style={{ fontFamily:"'Satoshi', system-ui", fontSize:'0.58rem', color:MUTED, margin:0 }}>{s.scheduled_time}</p>
                  </div>
                ))}
                {dayClasses.map(c => (
                  <div key={c.id} style={{ backgroundColor:'rgba(244,114,182,0.15)', borderRadius:'4px', padding:'3px 5px' }}>
                    <p style={{ fontFamily:"'Satoshi', system-ui", fontSize:'0.6rem', fontWeight:600, color:'#f9a8d4', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.name}</p>
                    <p style={{ fontFamily:"'Satoshi', system-ui", fontSize:'0.58rem', color:'rgba(249,168,212,0.5)', margin:0 }}>{c.class_time}</p>
                  </div>
                ))}
                {!daySessions.length && !dayClasses.length && (
                  <p style={{ fontFamily:"'Satoshi', system-ui", fontSize:'0.6rem', color:MUTED, textAlign:'center', padding:'4px 0', opacity:0.5 }}>Free</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function PTSchedule() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduleData, setScheduleData] = useState(null);
  const [weekData, setWeekData] = useState(null);
  const [view, setView] = useState('day');
  const [loading, setLoading] = useState(true);
  const [notesSession, setNotesSession] = useState(null);

  useEffect(() => { view === 'day' ? loadDaySchedule() : loadWeekSchedule(); }, [selectedDate, view]);

  const loadDaySchedule = async () => {
    setLoading(true);
    try { const res = await api.get(`/pt/schedule/today?date=${selectedDate}`); setScheduleData(res.data); }
    catch { toast.error('Failed to load schedule'); } finally { setLoading(false); }
  };

  const loadWeekSchedule = async () => {
    setLoading(true);
    try {
      const d = new Date(selectedDate + 'T12:00:00');
      const day = d.getDay();
      const monday = new Date(d);
      monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
      const res = await api.get(`/pt/schedule/week?weekStart=${monday.toISOString().split('T')[0]}`);
      setWeekData(res.data);
    } catch { toast.error('Failed to load week'); } finally { setLoading(false); }
  };

  const markSession = async (sessionId, status) => {
    try {
      await api.put(`/sessions/${sessionId}/status`, { status });
      toast.success(status === 'attended' ? '✓ Marked attended' : '✗ Marked missed');
      loadDaySchedule();
    } catch { toast.error('Failed to update session'); }
  };

  const prevDay = () => { const d = new Date(selectedDate + 'T12:00:00'); d.setDate(d.getDate()-1); setSelectedDate(d.toISOString().split('T')[0]); };
  const nextDay = () => { const d = new Date(selectedDate + 'T12:00:00'); d.setDate(d.getDate()+1); setSelectedDate(d.toISOString().split('T')[0]); };

  const dateObj = new Date(selectedDate + 'T12:00:00');
  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const renewalAlerts = scheduleData?.ptSessions?.filter(s => s.sessions_remaining <= 2) || [];

  const buildTimeline = () => {
    const sessions = scheduleData?.ptSessions || [];
    const classes = scheduleData?.classes || [];
    const timeMap = {};
    sessions.forEach(s => { const k = s.scheduled_time.substring(0,5); if (!timeMap[k]) timeMap[k]=[]; timeMap[k].push({...s, entryType:'pt'}); });
    classes.forEach(c => { const k = c.scheduled_time.substring(0,5); if (!timeMap[k]) timeMap[k]=[]; timeMap[k].push({...c, entryType:'class'}); });
    const dow = dateObj.getDay();
    return Array.from({length:14}, (_,i) => {
      const h = i + 7;
      const timeKey = `${String(h).padStart(2,'0')}:00`;
      const entries = [...(timeMap[timeKey]||[])];
      ['15','30','45'].forEach(min => { const k=`${String(h).padStart(2,'0')}:${min}`; if(timeMap[k]){entries.push(...timeMap[k]);} });
      return { hour:h, timeKey, entries, isWorking: isInWorkingHours(h, dow) };
    });
  };

  const timeline = view === 'day' && scheduleData ? buildTimeline() : [];

  return (
    <div style={{ padding:'1.5rem 1.25rem', minHeight:'100vh' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'1.25rem' }}>
        <div>
          <p style={{ fontFamily:"'Satoshi', system-ui", fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.18em', color:ORANGE, textTransform:'uppercase', margin:'0 0 0.3rem' }}>PT Dashboard</p>
          <h1 style={{ fontFamily:"'Clash Display', system-ui", fontSize:'1.75rem', fontWeight:700, color:TEXT, letterSpacing:'-0.03em', margin:'0 0 0.25rem' }}>Schedule</h1>
          <p style={{ fontFamily:"'Satoshi', system-ui", fontSize:'0.8rem', color:MUTED, margin:0 }}>{FULL_DAYS[dateObj.getDay()]} · {format(dateObj, 'd MMM yyyy')}</p>
        </div>
        <div style={{ display:'flex', gap:'6px', backgroundColor:SURFACE, borderRadius:'10px', padding:'3px' }}>
          {[['day','Day'],['week','Week']].map(([k,l]) => (
            <button key={k} onClick={() => setView(k)} style={{ padding:'6px 14px', borderRadius:'8px', border:'none', backgroundColor: view===k ? ORANGE : 'transparent', color: view===k ? '#000' : MUTED, fontFamily:"'Satoshi', system-ui", fontSize:'0.8rem', fontWeight:700, cursor:'pointer', minHeight:'auto', transition:'all 0.15s' }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Date nav */}
      {view === 'day' && (
        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'1rem' }}>
          <button onClick={prevDay} style={{ width:'36px', height:'36px', borderRadius:'8px', border:`1px solid ${BORDER}`, backgroundColor:SURFACE, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:MUTED, minHeight:'auto', minWidth:'auto', transition:'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor=ORANGE; e.currentTarget.style.color=ORANGE; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor=BORDER; e.currentTarget.style.color=MUTED; }}>
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])} style={{
            flex:1, padding:'0.6rem', borderRadius:'8px', border:`1px solid ${isToday ? `${ORANGE}44` : BORDER}`,
            backgroundColor: isToday ? `${ORANGE}12` : SURFACE,
            color: isToday ? ORANGE : MUTED,
            fontFamily:"'Satoshi', system-ui", fontSize:'0.875rem', fontWeight:600, cursor:'pointer', minHeight:'auto', transition:'all 0.15s',
          }}>{isToday ? 'Today' : format(dateObj, 'EEE, d MMM')}</button>
          <button onClick={nextDay} style={{ width:'36px', height:'36px', borderRadius:'8px', border:`1px solid ${BORDER}`, backgroundColor:SURFACE, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:MUTED, minHeight:'auto', minWidth:'auto', transition:'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor=ORANGE; e.currentTarget.style.color=ORANGE; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor=BORDER; e.currentTarget.style.color=MUTED; }}>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Renewal alerts */}
      {renewalAlerts.length > 0 && (
        <div style={{ display:'flex', flexDirection:'column', gap:'6px', marginBottom:'1rem' }}>
          {renewalAlerts.map(s => (
            <div key={s.id} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'0.7rem 0.875rem', borderRadius:'8px', backgroundColor: s.sessions_remaining<=0 ? 'rgba(239,68,68,0.1)' : `${ORANGE}12`, border:`1px solid ${s.sessions_remaining<=0 ? 'rgba(239,68,68,0.3)' : `${ORANGE}33`}` }}>
              {s.sessions_remaining<=0 ? <AlertCircle size={14} color="#ef4444" /> : <AlertTriangle size={14} color={ORANGE} />}
              <p style={{ fontFamily:"'Satoshi', system-ui", fontSize:'0.82rem', fontWeight:600, color: s.sessions_remaining<=0 ? '#ef4444' : ORANGE, margin:0 }}>
                {s.client_name} — {s.sessions_remaining<=0 ? 'Block complete — renew now!' : `${s.sessions_remaining} session${s.sessions_remaining!==1?'s':''} remaining`}
              </p>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'3rem' }}>
          <div style={{ width:'20px', height:'20px', border:`2px solid ${ORANGE}`, borderTop:'2px solid transparent', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
        </div>
      ) : view === 'day' ? (
        <>
          {/* Timeline */}
          <div style={{ display:'flex', flexDirection:'column', gap:'3px' }}>
            {timeline.map(slot => (
              <div key={slot.hour} style={{ display:'flex', gap:'10px' }}>
                <div style={{ width:'42px', flexShrink:0, paddingTop:'6px', textAlign:'right' }}>
                  <span style={{ fontFamily:"'Satoshi', system-ui", fontSize:'0.65rem', color:MUTED, fontWeight:500 }}>{slot.timeKey}</span>
                </div>
                <div style={{ flex:1, minHeight:'44px' }}>
                  {slot.entries.length === 0 ? (
                    <div style={{ height:'44px', borderRadius:'6px', border:`1px solid ${slot.isWorking ? BORDER : 'rgba(255,255,255,0.03)'}`, borderStyle: slot.isWorking ? 'dashed' : 'solid', backgroundColor: slot.isWorking ? 'transparent' : 'rgba(255,255,255,0.01)', display:'flex', alignItems:'center', paddingLeft:'10px' }}>
                      <span style={{ fontFamily:"'Satoshi', system-ui", fontSize:'0.65rem', color: slot.isWorking ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)' }}>
                        {slot.isWorking ? 'Available' : 'Break'}
                      </span>
                    </div>
                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:'3px' }}>
                      {slot.entries.map((entry, idx) => (
                        <SessionSlot key={idx} entry={entry}
                          onMarkAttended={() => markSession(entry.id, 'attended')}
                          onMarkMissed={() => markSession(entry.id, 'missed')}
                          onMarkUpcoming={() => markSession(entry.id, 'upcoming')}
                          onNotes={setNotesSession} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          {scheduleData && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'8px', marginTop:'1.25rem' }}>
              {[
                { value: scheduleData.ptSessions?.length || 0, label: 'PT Sessions', color: GREEN },
                { value: scheduleData.classes?.length || 0, label: 'Classes', color: '#f472b6' },
                { value: (scheduleData.ptSessions?.length||0) + (scheduleData.classes?.length||0), label: 'Total', color: ORANGE },
              ].map((s,i) => (
                <div key={i} style={{ backgroundColor:SURFACE, borderRadius:'10px', padding:'0.875rem', border:`1px solid ${BORDER}`, textAlign:'center' }}>
                  <p style={{ fontFamily:"'Clash Display', system-ui", fontSize:'1.5rem', fontWeight:800, color:s.color, letterSpacing:'-0.03em', margin:'0 0 2px' }}>{s.value}</p>
                  <p style={{ fontFamily:"'Satoshi', system-ui", fontSize:'0.65rem', color:MUTED, margin:0, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase' }}>{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <WeekView data={weekData} />
      )}

      {notesSession && <PTNotesModal session={notesSession} onClose={() => setNotesSession(null)} />}
    </div>
  );
}
