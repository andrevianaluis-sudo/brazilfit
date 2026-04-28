import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Crown, AlertTriangle, X, Ban, FileText, Check } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import BackButton from '../../components/BackButton';

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 pb-4 sm:pb-0" onClick={onClose}>
      <div className="w-full max-w-sm bg-white rounded-[12px] border-t-4 border-t-brazil-green shadow-lg shadow-black/10 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4" style={{ backgroundColor: '#27AE60' }}>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-white" />
            <p className="font-black text-white text-base">Session Notes</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-green-600 transition-all">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-4 h-4 text-brazil-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-black text-black">{fmt(session.scheduled_date)} at {session.scheduled_time}</p>
          </div>
          {loading ? (
            <div className="flex justify-center py-6"><div className="w-6 h-6 border-4 border-brazil-green border-t-transparent rounded-full animate-spin" /></div>
          ) : !note ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-brazil-green mx-auto mb-3" />
              <p className="text-black font-black text-base">No notes for this session yet.</p>
              <p className="text-sm mt-1" style={{ color: '#666666' }}>Your PT will add notes after the session.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {note.what_we_worked_on && (
                <div className="bg-white border-l-4 border-l-brazil-green rounded-[8px] px-4 py-3">
                  <p className="text-[10px] font-bold text-brazil-green uppercase tracking-wide mb-2">What we worked on</p>
                  <p className="text-sm text-grey-200">{note.what_we_worked_on}</p>
                </div>
              )}
              {note.what_went_well && (
                <div className="bg-white border-l-4 border-l-brazil-green rounded-[8px] px-4 py-3">
                  <p className="text-[10px] font-bold text-brazil-green uppercase tracking-wide mb-2">What went well</p>
                  <p className="text-sm text-grey-200">{note.what_went_well}</p>
                </div>
              )}
              {note.what_to_improve && (
                <div className="bg-white border-l-4 border-l-brazil-green rounded-[8px] px-4 py-3">
                  <p className="text-[10px] font-bold text-brazil-green uppercase tracking-wide mb-2">Focus areas</p>
                  <p className="text-sm text-grey-200">{note.what_to_improve}</p>
                </div>
              )}
              {note.focus_next_session && (
                <div className="bg-white border-l-4 border-l-brazil-green rounded-[8px] px-4 py-3">
                  <p className="text-[10px] font-bold text-brazil-green uppercase tracking-wide mb-2">Next session focus</p>
                  <p className="text-sm text-grey-200">{note.focus_next_session}</p>
                </div>
              )}
              {note.injuries_concerns && (
                <div className="bg-red-50 border-l-4 border-l-red-400 rounded-[8px] px-4 py-3">
                  <p className="text-[10px] font-bold text-red-600 uppercase tracking-wide mb-2">Injuries / Concerns</p>
                  <p className="text-sm text-red-600">{note.injuries_concerns}</p>
                </div>
              )}
              <p className="text-xs text-brazil-green text-right mt-4">Written by your PT</p>
            </div>
          )}
        </div>
        <div className="border-t border-grey-100 p-4">
          <button onClick={onClose} className="w-full h-11 flex items-center justify-center text-base font-bold text-white rounded-lg transition-all" style={{ backgroundColor: '#27AE60' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

import { fmtDate, fmtDateTimeFull, fmtDateTime, fmtDateShort, sortOldestFirst, sortNewestFirst } from '../../utils/dateUtils';

// Returns hours until a session (negative = in the past)
function hoursUntil(date, time) {
  const dt = new Date(`${date}T${time}:00`);
  return (dt - new Date()) / (1000 * 60 * 60);
}

function fmt(date) {
  return fmtDateShort(date);
}

// ── Cancel Modal ──────────────────────────────────────────────────────────────

function CancelModal({ session, onConfirm, onClose, loading }) {
  const hours = hoursUntil(session.scheduled_date, session.scheduled_time);
  const canCancel = hours >= 24;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="w-full max-w-sm bg-white rounded-2xl overflow-hidden" style={{ maxWidth: '380px', boxShadow: '0 2px 20px rgba(0,0,0,0.08)' }} onClick={(e) => e.stopPropagation()}>
        {canCancel ? (
          <>
            <div style={{ padding: '24px' }}>
              <div className="mb-6">
                <p className="text-xl font-black text-black" style={{ fontSize: '20px', lineHeight: 1.2 }}>Cancel Session?</p>
                <p className="text-sm mt-1" style={{ color: '#888888', fontWeight: 400, fontSize: '14px' }}>
                  {fmtDateTime(session.scheduled_date, session.scheduled_time)}
                </p>
              </div>
              <div className="rounded-lg p-3.5 mb-4" style={{ backgroundColor: '#F8F8F8', borderLeft: '3px solid #27AE60', padding: '14px' }}>
                <p className="font-black text-black mb-2" style={{ fontSize: '15px' }}>Session will be carried over</p>
                <p style={{ color: '#666666', fontWeight: 400, fontSize: '13px', lineHeight: 1.5 }}>
                  This session will be returned to your block and will <u className="font-black text-black">not</u> count as used.
                </p>
              </div>
              <div className="flex items-center gap-2" style={{ color: '#444444', fontSize: '13px', fontWeight: 400 }}>
                <Check className="w-4 h-4 flex-shrink-0" style={{ color: '#27AE60' }} />
                {Math.floor(hours)} hours notice — within policy
              </div>
            </div>
            <div style={{ borderTop: '1px solid #e8e8e8' }}>
              <div className="flex">
                <button
                  onClick={onClose}
                  className="flex-1 transition-all"
                  style={{
                    backgroundColor: 'white',
                    color: 'black',
                    height: '52px',
                    fontSize: '15px',
                    fontWeight: 500,
                    border: 'none',
                    borderRight: '1px solid #e8e8e8',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f5f5f5';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'white';
                  }}
                >
                  Keep Session
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className="flex-1 transition-all disabled:opacity-50"
                  style={{
                    backgroundColor: 'white',
                    color: '#E74C3C',
                    height: '52px',
                    fontSize: '15px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) e.target.style.backgroundColor = '#f5f5f5';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'white';
                  }}
                >
                  {loading ? 'Cancelling…' : 'Yes, Cancel'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={{ padding: '24px' }}>
              <div className="mb-6">
                <p className="text-xl font-black text-black" style={{ fontSize: '20px', lineHeight: 1.2 }}>Cannot Cancel</p>
                <p className="text-sm mt-1" style={{ color: '#888888', fontWeight: 400, fontSize: '14px' }}>
                  {fmtDateTime(session.scheduled_date, session.scheduled_time)}
                </p>
              </div>
              <div className="rounded-lg p-3.5 mb-4" style={{ backgroundColor: '#FFF5F5', borderLeft: '3px solid #E74C3C', padding: '14px' }}>
                <p className="font-black text-red-600 mb-2" style={{ fontSize: '15px' }}>24-Hour Cancellation Policy</p>
                <p style={{ color: '#666666', fontWeight: 400, fontSize: '13px', lineHeight: 1.5 }}>
                  Sorry — cancellations must be made at least 24 hours before your session.
                  This session is in <strong className="text-black font-bold">{Math.max(0, hours).toFixed(1)} hours</strong> and cannot be cancelled.
                  It will count toward your block regardless.
                </p>
              </div>
              <p style={{ color: '#888888', fontSize: '13px', fontWeight: 400 }}>
                If you have a genuine emergency, please contact your PT directly.
              </p>
            </div>
            <div style={{ borderTop: '1px solid #e8e8e8' }}>
              <button
                onClick={onClose}
                className="w-full transition-all"
                style={{
                  backgroundColor: 'white',
                  color: '#E74C3C',
                  height: '52px',
                  fontSize: '15px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f5f5f5';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white';
                }}
              >
                OK, Got It
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function ClientSessions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null); // session being cancelled
  const [cancelLoading, setCancelLoading] = useState(false);
  const [noteTarget, setNoteTarget] = useState(null);

  const loadData = () => {
    if (!user?.clientId) return;
    api.get(`/sessions/client/${user.clientId}`)
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [user]); // eslint-disable-line

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    setCancelLoading(true);
    try {
      await api.post(`/sessions/${cancelTarget.id}/cancel`);
      toast.success('Session cancelled — it has been returned to your block.');
      setCancelTarget(null);
      loadData();
    } catch (err) {
      const msg = err.response?.data?.message;
      if (err.response?.status === 403 && err.response?.data?.error === 'cancellation_blocked') {
        toast.error('Cancellation blocked — less than 24 hours notice.');
      } else {
        toast.error(msg || 'Failed to cancel session');
      }
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-brazil-green border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const rawUpcoming = data?.upcoming || [];
  const rawHistory = data?.history || [];
  // upcoming: chronological (nearest first), history: reverse-chronological (most recent first)
  const upcoming = sortOldestFirst(rawUpcoming, 'scheduled_date', 'scheduled_time');
  const history = sortNewestFirst(rawHistory, 'scheduled_date', 'scheduled_time');
  const sessionsUsed = data?.sessionsUsed || 0;
  const sessionsRemaining = data?.sessionsRemaining || 0;
  const attended = history.filter(s => s.status === 'attended').length;
  const missed = history.filter(s => s.status === 'missed').length;
  const cancelled = history.filter(s => s.status === 'cancelled').length;
  const pct = Math.min(100, (sessionsUsed / 10) * 100);
  const limitedHistory = user?.isPro ? history : history.slice(0, 5);

  return (
    <div className="px-4 py-4 animate-fade-in space-y-5">
      <BackButton to="/client/home" />
      <h1 className="text-4xl font-black text-black">My Sessions</h1>

      {/* Block summary - Premium white card */}
      <div className="bg-white border-t-4 border-t-brazil-green rounded-lg p-5 shadow-sm shadow-grey-200/50">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="font-black text-black text-xl">Block {user?.blockNumber || 1}</p>
            <p className="text-sm text-grey-300">Started {user?.blockStartDate || '—'}</p>
          </div>
          <div className="text-right">
            <p className="text-5xl font-black text-brazil-green">{sessionsUsed}</p>
            <p className="text-grey-200 text-xs font-medium">Sessions Used</p>
          </div>
        </div>
        {/* Enhanced progress bar */}
        <div className="bg-gray-100 rounded-full h-2 mb-5" style={{ backgroundColor: '#F0F0F0' }}>
          <div className="h-full rounded-full bg-brazil-green transition-all" style={{ width: `${pct}%` }} />
        </div>
        {/* Premium stat cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-lg p-4 text-center" style={{ backgroundColor: '#27AE60' }}>
            <p className="text-3xl font-black text-white">{attended}</p>
            <p className="text-xs font-bold text-white mt-1">Attended</p>
          </div>
          <div className="rounded-lg p-4 text-center" style={{ backgroundColor: '#E74C3C' }}>
            <p className="text-3xl font-black text-white">{missed}</p>
            <p className="text-xs font-bold text-white mt-1">Missed</p>
          </div>
          <div className="rounded-lg p-4 text-center" style={{ backgroundColor: '#1A1A2E' }}>
            <p className="text-3xl font-black text-white">{sessionsRemaining}</p>
            <p className="text-xs font-bold text-white mt-1">Sessions Left</p>
          </div>
        </div>
        {/* Renewal reminder */}
        {sessionsRemaining <= 3 && sessionsRemaining > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-black text-sm">Your block is almost complete</p>
              <p className="text-xs text-yellow-700 mt-1">{sessionsRemaining} session{sessionsRemaining !== 1 ? 's' : ''} remaining</p>
            </div>
            <button className="bg-brazil-green text-white font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-green-700 transition-all flex-shrink-0">
              Contact PT
            </button>
          </div>
        )}
        {sessionsRemaining <= 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="font-bold text-black text-sm">✓ Block Complete</p>
            <p className="text-xs text-yellow-700 mt-1">Your PT will arrange your next renewal</p>
          </div>
        )}
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div>
          <p className="section-header">Upcoming Sessions</p>
          <div className="space-y-2">
            {upcoming.map((s, i) => {
              const hrs = hoursUntil(s.scheduled_date, s.scheduled_time);
              const isWithin24Hours = hrs >= 0 && hrs < 24;
              const sessionsLeftAfter = Math.max(0, sessionsRemaining - i - 1);
              const sessionLabel = sessionsLeftAfter === 1 ? 'session' : 'sessions';
              return (
                <div key={s.id} className="bg-white border border-grey-200 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 flex-shrink-0" style={{ color: isWithin24Hours ? '#E74C3C' : '#27AE60', minWidth: '20px' }} />
                    <div className="flex-1">
                      <p style={{ color: isWithin24Hours ? '#333333' : '#1A1A1A', fontSize: '15px', fontWeight: '600', margin: '0', lineHeight: '1.2' }}>
                        {fmtDateTimeFull(s.scheduled_date, s.scheduled_time)}
                      </p>
                      <p style={{ color: '#666666', fontSize: '13px', fontWeight: '400', margin: '4px 0 0 0' }}>{sessionsLeftAfter} {sessionLabel} left after this</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setCancelTarget(s)}
                        style={{
                          backgroundColor: isWithin24Hours ? '#FFF5F5' : 'white',
                          border: isWithin24Hours ? '1px solid #E74C3C' : '1px solid #CCCCCC',
                          borderRadius: '6px',
                          padding: '6px 14px',
                          fontSize: '13px',
                          fontWeight: isWithin24Hours ? '600' : '500',
                          color: isWithin24Hours ? '#E74C3C' : '#333333',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: isWithin24Hours ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {isWithin24Hours ? (
                          <>
                            <Ban className="w-4 h-4" style={{ color: '#E74C3C', flexShrink: 0 }} />
                            <span style={{ color: '#E74C3C' }}>Locked</span>
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4" style={{ color: '#333333', flexShrink: 0 }} />
                            <span style={{ color: '#333333' }}>Cancel</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  {isWithin24Hours && (
                    <p style={{ color: '#E74C3C', fontSize: '12px', fontWeight: '600', margin: '8px 0 0 32px' }}>
                      Within 24-hour policy — cannot be cancelled
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* History */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-7 bg-brazil-green rounded-full" />
            <p className="text-xl font-black text-black">Session History</p>
          </div>
          {!user?.isPro && history.length > 5 && (
            <button onClick={() => navigate('/client/upgrade')} className="text-xs text-brazil-yellow flex items-center gap-1">
              <Crown className="w-3 h-3" /> See all {history.length}
            </button>
          )}
        </div>
        <div className="space-y-2">
          {limitedHistory.map(s => {
            const isCancelled = s.status === 'cancelled';
            const isAttended = s.status === 'attended';
            return (
              <div key={s.id} className={`flex items-center gap-3 rounded-lg px-4 py-3 ${
                isAttended
                  ? 'border border-green-200'
                  : isCancelled
                  ? 'border border-red-200'
                  : 'border border-red-300'
              }`} style={{
                backgroundColor: isAttended ? '#F0FFF4' : isCancelled ? '#FFF0F0' : '#FFE5E5'
              }}>
                {isAttended
                  ? <CheckCircle className="w-6 h-6 text-brazil-green flex-shrink-0" />
                  : isCancelled
                  ? <XCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#E74C3C' }} />
                  : <XCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#E74C3C' }} />}
                <div className="flex-1">
                  <p className={`text-sm ${
                    isAttended
                      ? 'font-black text-black'
                      : isCancelled
                      ? 'font-black text-grey-400'
                      : 'font-black text-black'
                  }`} style={{
                    color: isAttended ? '#1A1A1A' : isCancelled ? '#333333' : '#1A1A1A'
                  }}>
                    {fmtDateTime(s.scheduled_date, s.scheduled_time)}
                  </p>
                  {s.status === 'missed' && (
                    <p className="text-xs font-bold" style={{ color: '#E74C3C' }}>Missed — carried over, block preserved</p>
                  )}
                  {isCancelled && s.session_carried_over === 1 && (
                    <p className="text-xs font-semibold" style={{ color: '#E74C3C' }}>
                      Cancelled — session returned to your block
                      {s.cancellation_notice_hours != null && (
                        <span style={{ color: '#E57373' }}> · {Math.floor(s.cancellation_notice_hours)}h notice</span>
                      )}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {isAttended && (
                    <button
                      onClick={() => setNoteTarget(s)}
                      className="p-1.5 rounded-lg transition-all"
                      style={{ backgroundColor: '#F0FFF4', color: '#27AE60' }}
                      title="View session notes"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                    isAttended ? 'bg-brazil-green text-white' :
                    isCancelled ? 'text-grey-400 border border-grey-300' :
                    'badge-red'
                  }`} style={{
                    backgroundColor: isAttended ? '#27AE60' : isCancelled ? '#F0F0F0' : '#FFE5E5',
                    color: isAttended ? 'white' : isCancelled ? '#666666' : '#E74C3C'
                  }}>
                    {s.status}
                  </span>
                </div>
              </div>
            );
          })}
          {!user?.isPro && history.length > 5 && (
            <div className="card-dark text-center py-3 border border-dashed border-grey-100">
              <Crown className="w-5 h-5 text-brazil-yellow mx-auto mb-1" />
              <p className="text-xs text-grey-200">{history.length - 5} more sessions in full history</p>
              <button onClick={() => navigate('/client/upgrade')} className="text-xs text-brazil-yellow mt-1 hover:underline">Upgrade to Pro to see all</button>
            </div>
          )}
          {history.length === 0 && (
            <p className="text-center text-grey-100 text-sm py-6">No session history yet</p>
          )}
        </div>
      </div>

      {/* Cancel modal */}
      {cancelTarget && (
        <CancelModal
          session={cancelTarget}
          onConfirm={handleCancelConfirm}
          onClose={() => setCancelTarget(null)}
          loading={cancelLoading}
        />
      )}

      {/* Notes modal */}
      {noteTarget && (
        <SessionNoteModal
          session={noteTarget}
          onClose={() => setNoteTarget(null)}
        />
      )}
    </div>
  );
}
