import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Crown, AlertTriangle, X, Ban, FileText, Check, ArrowRight } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import BackButton from '../../components/BackButton';
import { fmtDate, fmtDateTimeFull, fmtDateTime, fmtDateShort, sortOldestFirst, sortNewestFirst } from '../../utils/dateUtils';

function hoursUntil(date, time) {
  const dt = new Date(`${date}T${time}:00`);
  return (dt - new Date()) / (1000 * 60 * 60);
}

function fmt(date) { return fmtDateShort(date); }

const Label = ({ children }) => (
  <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.18em', color: '#3a3a3a', textTransform: 'uppercase', margin: '0 0 0.4rem 0' }}>{children}</p>
);

const Line = () => <div style={{ height: '1px', backgroundColor: '#141414' }} />;

// ── Session Notes Modal ───────────────────────────────────────────────────────
function SessionNoteModal({ session, onClose }) {
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/sessions/${session.id}/note`)
      .then(r => { setNote(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [session.id]);

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.8)', padding: '1rem' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '480px', backgroundColor: '#111111', borderRadius: '16px', border: '1px solid #1e1e1e', overflow: 'hidden', marginBottom: '1rem' }}>
        
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Label>Session Notes</Label>
            <p style={{ fontFamily: "'Clash Display', system-ui, sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>{fmt(session.scheduled_date)} · {session.scheduled_time}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3a3a3a', padding: '4px', display: 'flex', minHeight: 'auto', minWidth: 'auto' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = '#3a3a3a'}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '1.25rem 1.5rem', maxHeight: '60vh', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <div style={{ width: '20px', height: '20px', border: '2px solid #4CAF50', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : !note ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <FileText size={32} color="#2a2a2a" style={{ marginBottom: '0.75rem' }} />
              <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.9rem', color: '#3a3a3a', margin: 0 }}>No notes yet — your PT will add them after the session.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { key: 'what_we_worked_on', label: 'What we worked on' },
                { key: 'what_went_well', label: 'What went well' },
                { key: 'what_to_improve', label: 'Focus areas' },
                { key: 'focus_next_session', label: 'Next session focus' },
              ].filter(f => note[f.key]).map(f => (
                <div key={f.key} style={{ backgroundColor: '#0e0e0e', borderLeft: '2px solid #4CAF50', borderRadius: '6px', padding: '1rem' }}>
                  <Label>{f.label}</Label>
                  <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.85rem', color: '#a0a0a0', margin: 0, lineHeight: 1.6 }}>{note[f.key]}</p>
                </div>
              ))}
              {note.injuries_concerns && (
                <div style={{ backgroundColor: '#1a0a0a', borderLeft: '2px solid #ef4444', borderRadius: '6px', padding: '1rem' }}>
                  <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.18em', color: '#ef4444', textTransform: 'uppercase', margin: '0 0 0.4rem' }}>Injuries / Concerns</p>
                  <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.85rem', color: '#ef4444', margin: 0, lineHeight: 1.6 }}>{note.injuries_concerns}</p>
                </div>
              )}
              <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.65rem', color: '#4CAF50', textAlign: 'right', letterSpacing: '0.08em', margin: '0.5rem 0 0' }}>Written by your PT</p>
            </div>
          )}
        </div>

        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #1a1a1a' }}>
          <button onClick={onClose} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#1a1a1a', border: '1px solid #242424', borderRadius: '6px', color: '#fff', fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>Close</button>
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
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.8)', padding: '1rem' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '380px', backgroundColor: '#111111', borderRadius: '16px', border: '1px solid #1e1e1e', overflow: 'hidden' }}>
        
        <div style={{ padding: '1.5rem' }}>
          <Label>{canCancel ? 'Cancel Session' : 'Cannot Cancel'}</Label>
          <h3 style={{ fontFamily: "'Clash Display', system-ui, sans-serif", fontSize: '1.3rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 0.3rem' }}>
            {canCancel ? 'Are you sure?' : '24-Hour Policy'}
          </h3>
          <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.8rem', color: '#3a3a3a', margin: '0 0 1.25rem' }}>
            {fmtDateTime(session.scheduled_date, session.scheduled_time)}
          </p>

          {canCancel ? (
            <div style={{ backgroundColor: '#0e0e0e', borderLeft: '2px solid #4CAF50', borderRadius: '6px', padding: '1rem' }}>
              <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.85rem', color: '#a0a0a0', margin: 0, lineHeight: 1.6 }}>
                This session will be <strong style={{ color: '#fff' }}>returned to your block</strong> and will not count as used. You have {Math.floor(hours)}h notice — within policy.
              </p>
            </div>
          ) : (
            <div style={{ backgroundColor: '#1a0a0a', borderLeft: '2px solid #ef4444', borderRadius: '6px', padding: '1rem' }}>
              <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.85rem', color: '#a0a0a0', margin: 0, lineHeight: 1.6 }}>
                This session is in <strong style={{ color: '#fff' }}>{Math.max(0, hours).toFixed(1)} hours</strong>. Cancellations require at least 24 hours notice. Contact your PT directly for emergencies.
              </p>
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px solid #1a1a1a', display: 'flex' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '1rem', backgroundColor: 'transparent', border: 'none', borderRight: '1px solid #1a1a1a', color: '#a0a0a0', fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>
            {canCancel ? 'Keep Session' : 'Got It'}
          </button>
          {canCancel && (
            <button onClick={onConfirm} disabled={loading} style={{ flex: 1, padding: '1rem', backgroundColor: 'transparent', border: 'none', color: '#ef4444', fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.875rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1, minHeight: 'auto' }}>
              {loading ? 'Cancelling…' : 'Yes, Cancel'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
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
      setCancelTarget(null);
      loadData();
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.error === 'cancellation_blocked') {
        toast.error('Cancellation blocked — less than 24 hours notice.');
      } else {
        toast.error(err.response?.data?.message || 'Failed to cancel session');
      }
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', backgroundColor: '#0a0a0a' }}>
      <div style={{ width: '20px', height: '20px', border: '2px solid #4CAF50', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  const upcoming = sortOldestFirst(data?.upcoming || [], 'scheduled_date', 'scheduled_time');
  const history = sortNewestFirst(data?.history || [], 'scheduled_date', 'scheduled_time');
  const sessionsUsed = data?.sessionsUsed || 0;
  const sessionsRemaining = data?.sessionsRemaining || 0;
  const attended = history.filter(s => s.status === 'attended').length;
  const missed = history.filter(s => s.status === 'missed').length;
  const cancelled = history.filter(s => s.status === 'cancelled').length;
  const totalSessions = sessionsUsed + sessionsRemaining;
  const pct = totalSessions > 0 ? (sessionsUsed / totalSessions) * 100 : 0;
  const limitedHistory = user?.isPro ? history : history.slice(0, 5);

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', paddingBottom: '100px', width: '100%' }}>

      {/* Header */}
      <div style={{ padding: '2rem 2rem 1.5rem' }}>
        <BackButton to="/client" />
        <h1 style={{ fontFamily: "'Clash Display', system-ui, sans-serif", fontSize: '2rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', margin: '1rem 0 0' }}>My Sessions</h1>
      </div>

      <Line />

      {/* Block Summary */}
      <div style={{ padding: '1.5rem 2rem' }}>
        <Label>Block {user?.blockNumber || 1}</Label>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.82rem', color: '#3a3a3a', margin: 0, fontWeight: 500 }}>
            {sessionsUsed} of {totalSessions} sessions completed
          </p>
          <p style={{ fontFamily: "'Clash Display', system-ui, sans-serif", fontSize: '1.4rem', fontWeight: 800, color: '#4CAF50', letterSpacing: '-0.03em', margin: 0 }}>{Math.round(pct)}%</p>
        </div>
        <div style={{ width: '100%', height: '2px', backgroundColor: '#1a1a1a', borderRadius: '1px', marginBottom: '1.5rem' }}>
          <div style={{ height: '100%', width: `${pct}%`, backgroundColor: '#4CAF50', borderRadius: '1px', transition: 'width 0.8s ease' }} />
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0' }}>
          {[
            { value: attended, label: 'Attended', color: '#4CAF50' },
            { value: missed, label: 'Missed', color: '#ef4444' },
            { value: sessionsRemaining, label: 'Remaining', color: '#FFD600' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '1rem 0.75rem', borderRight: i < 2 ? '1px solid #141414' : 'none', textAlign: i === 0 ? 'left' : i === 1 ? 'center' : 'right' }}>
              <p style={{ fontFamily: "'Clash Display', system-ui, sans-serif", fontSize: '1.8rem', fontWeight: 800, color: s.color, letterSpacing: '-0.03em', lineHeight: 1, margin: '0 0 0.3rem' }}>{s.value}</p>
              <Label>{s.label}</Label>
            </div>
          ))}
        </div>

        {/* Low sessions warning */}
        {sessionsRemaining <= 3 && sessionsRemaining > 0 && (
          <div style={{ marginTop: '1rem', backgroundColor: '#0e0e0e', borderLeft: '2px solid #FFD600', borderRadius: '6px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.82rem', fontWeight: 600, color: '#fff', margin: '0 0 2px' }}>Block almost complete</p>
              <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.72rem', color: '#3a3a3a', margin: 0 }}>{sessionsRemaining} session{sessionsRemaining !== 1 ? 's' : ''} remaining</p>
            </div>
            <ArrowRight size={14} color="#FFD600" />
          </div>
        )}
      </div>

      <Line />

      {/* Upcoming Sessions */}
      {upcoming.length > 0 && (
        <>
          <div style={{ padding: '1.5rem 2rem 0.75rem' }}>
            <Label>Upcoming Sessions</Label>
          </div>
          {upcoming.map((s, i) => {
            const hrs = hoursUntil(s.scheduled_date, s.scheduled_time);
            const locked = hrs >= 0 && hrs < 24;
            const sessionsLeftAfter = Math.max(0, sessionsRemaining - i - 1);
            return (
              <div key={s.id}>
                <div style={{ padding: '1.1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: locked ? '#ef4444' : '#4CAF50', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.9rem', fontWeight: 600, color: '#fff', margin: '0 0 2px', letterSpacing: '-0.01em' }}>
                        {fmtDateTimeFull(s.scheduled_date, s.scheduled_time)}
                      </p>
                      <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.72rem', color: '#3a3a3a', margin: 0, fontWeight: 500 }}>
                        {sessionsLeftAfter} session{sessionsLeftAfter !== 1 ? 's' : ''} left after this
                        {locked && <span style={{ color: '#ef4444', marginLeft: '8px' }}>· Within 24h policy</span>}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCancelTarget(s)}
                    style={{
                      padding: '6px 14px',
                      backgroundColor: 'transparent',
                      border: `1px solid ${locked ? '#2a2a2a' : '#1e1e1e'}`,
                      borderRadius: '6px',
                      color: locked ? '#2a2a2a' : '#3a3a3a',
                      fontFamily: "'Satoshi', system-ui, sans-serif",
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: locked ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      flexShrink: 0,
                      minHeight: 'auto',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => { if (!locked) { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; } }}
                    onMouseLeave={e => { if (!locked) { e.currentTarget.style.borderColor = '#1e1e1e'; e.currentTarget.style.color = '#3a3a3a'; } }}
                  >
                    {locked ? <Ban size={12} /> : <X size={12} />}
                    {locked ? 'Locked' : 'Cancel'}
                  </button>
                </div>
                {i < upcoming.length - 1 && <Line />}
              </div>
            );
          })}
          <Line />
        </>
      )}

      {/* Session History */}
      <div style={{ padding: '1.5rem 2rem 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Label>Session History</Label>
        {!user?.isPro && history.length > 5 && (
          <button onClick={() => navigate('/client/upgrade')} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.65rem', fontWeight: 700, color: '#FFD600', letterSpacing: '0.08em', textTransform: 'uppercase', minHeight: 'auto', padding: 0 }}>
            <Crown size={11} /> See all {history.length}
          </button>
        )}
      </div>

      {limitedHistory.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.85rem', color: '#2a2a2a' }}>No session history yet</p>
        </div>
      ) : (
        limitedHistory.map((s, i) => {
          const isAttended = s.status === 'attended';
          const isCancelled = s.status === 'cancelled';
          const statusColor = isAttended ? '#4CAF50' : isCancelled ? '#3a3a3a' : '#ef4444';
          return (
            <div key={s.id}>
              <div style={{ padding: '1.1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: statusColor, flexShrink: 0 }} />
                  <div>
                    <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.9rem', fontWeight: 600, color: isAttended ? '#fff' : '#3a3a3a', margin: '0 0 2px', letterSpacing: '-0.01em' }}>
                      {fmtDateTime(s.scheduled_date, s.scheduled_time)}
                    </p>
                    {s.status === 'missed' && (
                      <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.72rem', color: '#ef4444', margin: 0, fontWeight: 500 }}>Missed · block preserved</p>
                    )}
                    {isCancelled && s.session_carried_over === 1 && (
                      <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.72rem', color: '#3a3a3a', margin: 0, fontWeight: 500 }}>
                        Cancelled · session returned to block
                        {s.cancellation_notice_hours != null && ` · ${Math.floor(s.cancellation_notice_hours)}h notice`}
                      </p>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  {isAttended && (
                    <button onClick={() => setNoteTarget(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3a3a3a', padding: '4px', display: 'flex', minHeight: 'auto', minWidth: 'auto', transition: 'color 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#4CAF50'}
                      onMouseLeave={e => e.currentTarget.style.color = '#3a3a3a'}>
                      <FileText size={14} />
                    </button>
                  )}
                  <span style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: statusColor }}>
                    {s.status}
                  </span>
                </div>
              </div>
              {i < limitedHistory.length - 1 && <Line />}
            </div>
          );
        })
      )}

      {!user?.isPro && history.length > 5 && (
        <>
          <Line />
          <div style={{ padding: '1.25rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => navigate('/client/upgrade')}>
            <div>
              <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.85rem', fontWeight: 600, color: '#3a3a3a', margin: '0 0 2px' }}>{history.length - 5} more sessions</p>
              <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.72rem', color: '#2a2a2a', margin: 0 }}>Upgrade to Pro to see full history</p>
            </div>
            <Crown size={14} color="#FFD600" />
          </div>
        </>
      )}

      {cancelTarget && <CancelModal session={cancelTarget} onConfirm={handleCancelConfirm} onClose={() => setCancelTarget(null)} loading={cancelLoading} />}
      {noteTarget && <SessionNoteModal session={noteTarget} onClose={() => setNoteTarget(null)} />}
    </div>
  );
}
