import { useState, useEffect } from 'react';
import { format, addDays, subDays, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, AlertTriangle, AlertCircle, CheckCircle, Clock, Ban, FileText, X } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

// ── Session Notes Modal (PT) ──────────────────────────────────────────────────

function PTNotesModal({ session, onClose }) {
  const [note, setNote] = useState({ what_we_worked_on: '', what_went_well: '', what_to_improve: '', focus_next_session: '', injuries_concerns: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);

  useEffect(() => {
    api.get(`/sessions/${session.id}/note`)
      .then(r => { if (r.data) setNote(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [session.id]);

  const fillTemplate = () => {
    setNote(prev => ({
      what_we_worked_on: prev.what_we_worked_on || 'Strength & conditioning work',
      what_went_well: prev.what_went_well || 'Good energy and focus throughout',
      what_to_improve: prev.what_to_improve || 'Form on compound lifts',
      focus_next_session: prev.focus_next_session || 'Progressive overload on main lifts',
      injuries_concerns: prev.injuries_concerns || '',
    }));
    setShowTemplate(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post(`/sessions/${session.id}/note`, note);
      toast.success('Notes saved!');
      onClose();
    } catch {
      toast.error('Failed to save notes');
    } finally {
      setSaving(false);
    }
  };

  const set = (k, v) => setNote(n => ({ ...n, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 px-4 pb-4 sm:pb-0">
      <div className="w-full max-w-md bg-dark-grey-100 rounded-[12px] border border-white/10 shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-brazil-green" />
            <div>
              <p className="font-bold text-sm">Session Notes</p>
              <p className="text-xs text-grey-100">{session.client_name} · {session.scheduled_date} {session.scheduled_time}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowTemplate(!showTemplate)} className="text-xs text-grey-100 hover:text-grey-200 border border-white/10 rounded-lg px-2 py-1">
              Template
            </button>
            <button onClick={onClose}><X className="w-4 h-4 text-grey-100" /></button>
          </div>
        </div>
        {showTemplate && (
          <div className="mx-5 mt-3 bg-brazil-green/10 border border-brazil-green/20 rounded-[8px] p-3 flex-shrink-0">
            <p className="text-xs text-brazil-green mb-2 font-medium">Quick fill template?</p>
            <div className="flex gap-2">
              <button onClick={fillTemplate} className="text-xs bg-brazil-green/20 text-brazil-green px-3 py-1.5 rounded-lg">Fill template</button>
              <button onClick={() => setShowTemplate(false)} className="text-xs text-grey-100 px-3 py-1.5">Cancel</button>
            </div>
          </div>
        )}
        {loading ? (
          <div className="flex justify-center py-8"><div className="w-6 h-6 border-4 border-brazil-green border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
            {[
              { key: 'what_we_worked_on', label: 'What we worked on', color: 'text-grey-100' },
              { key: 'what_went_well', label: 'What went well', color: 'text-brazil-green/70' },
              { key: 'what_to_improve', label: 'What to improve', color: 'text-brazil-yellow/70' },
              { key: 'focus_next_session', label: 'Focus next session', color: 'text-blue-400/70' },
              { key: 'injuries_concerns', label: 'Injuries / Concerns', color: 'text-red-400/70' },
            ].map(({ key, label, color }) => (
              <div key={key}>
                <label className={`text-[10px] font-bold uppercase tracking-wide mb-1.5 block ${color}`}>{label}</label>
                <textarea
                  value={note[key] || ''}
                  onChange={e => set(key, e.target.value)}
                  rows={key === 'injuries_concerns' ? 2 : 3}
                  className="w-full bg-grey-100 border border-white/10 rounded-[8px] px-3 py-2.5 text-sm focus:outline-none focus:border-brazil-green/40 resize-none placeholder:text-grey-200"
                  placeholder={`${label}...`}
                />
              </div>
            ))}
          </div>
        )}
        <div className="flex border-t border-white/10 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-3.5 text-sm text-grey-200 hover:text-white hover:bg-grey-100">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-3.5 text-sm font-bold text-white bg-brazil-green/20 hover:bg-brazil-green/30 border-l border-white/10 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Notes'}
          </button>
        </div>
      </div>
    </div>
  );
}

const WORK_HOURS = Array.from({ length: 14 }, (_, i) => {
  const h = i + 7;
  return `${String(h).padStart(2, '0')}:00`;
});

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FULL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getStatusColor(status) {
  if (status === 'attended') return 'bg-brazil-green/20 border-brazil-green/40 text-brazil-green';
  if (status === 'missed') return 'bg-red-500/20 border-red-500/40 text-red-400';
  if (status === 'cancelled') return 'bg-white/4 border-white/8 text-grey-200';
  return 'bg-grey-100 border-white/20 text-white';
}

function getRenewalStatus(sessionsRemaining) {
  if (sessionsRemaining <= 0) return { color: 'text-red-400', bg: 'bg-red-500/20', label: 'RENEW NOW' };
  if (sessionsRemaining === 1) return { color: 'text-orange-400', bg: 'bg-orange-500/20', label: '1 LEFT' };
  if (sessionsRemaining === 2) return { color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: '2 LEFT' };
  return null;
}

export default function PTSchedule() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduleData, setScheduleData] = useState(null);
  const [weekData, setWeekData] = useState(null);
  const [view, setView] = useState('day');
  const [loading, setLoading] = useState(true);
  const [notesSession, setNotesSession] = useState(null);

  useEffect(() => {
    if (view === 'day') loadDaySchedule();
    else loadWeekSchedule();
  }, [selectedDate, view]);

  const loadDaySchedule = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/pt/schedule/today?date=${selectedDate}`);
      setScheduleData(res.data);
    } catch (e) {
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const loadWeekSchedule = async () => {
    setLoading(true);
    try {
      const d = new Date(selectedDate + 'T12:00:00');
      const day = d.getDay();
      const monday = new Date(d);
      monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
      const weekStart = monday.toISOString().split('T')[0];
      const res = await api.get(`/pt/schedule/week?weekStart=${weekStart}`);
      setWeekData(res.data);
    } catch (e) {
      toast.error('Failed to load week');
    } finally {
      setLoading(false);
    }
  };

  const markSession = async (sessionId, status) => {
    try {
      await api.put(`/sessions/${sessionId}/status`, { status });
      toast.success(status === 'attended' ? '✓ Marked attended' : '✗ Marked missed');
      loadDaySchedule();
    } catch {
      toast.error('Failed to update session');
    }
  };

  const prevDay = () => {
    const d = new Date(selectedDate + 'T12:00:00');
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const nextDay = () => {
    const d = new Date(selectedDate + 'T12:00:00');
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const dateObj = new Date(selectedDate + 'T12:00:00');
  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  // Renewal alerts
  const renewalAlerts = scheduleData?.ptSessions?.filter(s => {
    const rem = s.sessions_remaining;
    return rem <= 2;
  }) || [];

  // Build timeline for day view
  const buildTimeline = () => {
    const slots = [];
    const sessions = scheduleData?.ptSessions || [];
    const classes = scheduleData?.classes || [];

    // Create a map of time -> entries
    const timeMap = {};
    sessions.forEach(s => {
      const key = s.scheduled_time.substring(0, 5);
      if (!timeMap[key]) timeMap[key] = [];
      timeMap[key].push({ ...s, entryType: 'pt' });
    });
    classes.forEach(c => {
      const key = c.scheduled_time.substring(0, 5);
      if (!timeMap[key]) timeMap[key] = [];
      timeMap[key].push({ ...c, entryType: 'class' });
    });

    // Working hours for this day
    const dow = dateObj.getDay();
    const workingHours = getWorkingHours(dow);

    for (let h = 7; h <= 20; h++) {
      const timeKey = `${String(h).padStart(2, '0')}:00`;
      const entries = timeMap[timeKey] || [];

      // Check 15-min slots too
      ['15', '30', '45'].forEach(min => {
        const k = `${String(h).padStart(2, '0')}:${min}`;
        if (timeMap[k]) {
          entries.push(...timeMap[k]);
          delete timeMap[k];
        }
      });

      // Determine slot type
      let slotType = 'free';
      if (!isInWorkingHours(h, dow)) slotType = 'break';

      slots.push({ hour: h, timeKey, entries, slotType, isWorking: isInWorkingHours(h, dow) });
    }

    return slots;
  };

  const timeline = view === 'day' && scheduleData ? buildTimeline() : [];

  return (
    <div className="px-4 py-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-black">Schedule</h1>
          <p className="text-grey-200 text-sm">{FULL_DAYS[dateObj.getDay()]} · {format(dateObj, 'd MMM yyyy')}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView('day')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${view === 'day' ? 'bg-brazil-green text-white' : 'bg-grey-100 text-grey-200'}`}
          >Day</button>
          <button
            onClick={() => setView('week')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${view === 'week' ? 'bg-brazil-green text-white' : 'bg-grey-100 text-grey-200'}`}
          >Week</button>
        </div>
      </div>

      {/* Date Navigation */}
      {view === 'day' && (
        <div className="flex items-center gap-3 mb-4">
          <button onClick={prevDay} className="p-2 bg-grey-100 rounded-[8px] hover:bg-white/20 transition-all active:scale-95">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className={`flex-1 text-center py-2 rounded-[8px] text-sm font-medium transition-all ${isToday ? 'bg-brazil-green/20 text-brazil-green border border-brazil-green/40' : 'bg-grey-100 text-grey-200'}`}
          >
            {isToday ? 'Today' : format(dateObj, 'EEE, d MMM')}
          </button>
          <button onClick={nextDay} className="p-2 bg-grey-100 rounded-[8px] hover:bg-white/20 transition-all active:scale-95">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Renewal Alerts */}
      {renewalAlerts.length > 0 && (
        <div className="mb-4 space-y-2">
          {renewalAlerts.map(s => {
            const rem = s.sessions_remaining;
            return (
              <div key={s.id} className={`flex items-center gap-3 rounded-[8px] px-4 py-3 ${rem <= 0 ? 'bg-red-500/15 border border-red-500/30' : 'bg-orange-500/15 border border-orange-500/30'}`}>
                {rem <= 0 ? <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" /> : <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0" />}
                <div>
                  <p className={`font-semibold text-sm ${rem <= 0 ? 'text-red-400' : 'text-orange-400'}`}>
                    {s.client_name} — {rem <= 0 ? 'Block complete — renew now!' : `Session ${s.sessions_used} of 10 — ${rem} remaining`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-brazil-green border-t-transparent rounded-full animate-spin" />
        </div>
      ) : view === 'day' ? (
        <>
          {/* Legend */}
          <div className="flex gap-4 mb-4 text-xs text-grey-200">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-brazil-green/60 inline-block" />PT Session</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-pink-500/60 inline-block" />Class</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-white/20 inline-block" />Available</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-grey-100 inline-block" />Break</span>
          </div>

          {/* Timeline */}
          <div className="space-y-1">
            {timeline.map(slot => (
              <div key={slot.hour} className="flex gap-3">
                {/* Time label */}
                <div className="w-14 flex-shrink-0 text-right">
                  <span className="text-xs text-grey-100 font-mono">{slot.timeKey}</span>
                </div>

                {/* Slot content */}
                <div className="flex-1 min-h-[56px]">
                  {slot.entries.length === 0 ? (
                    <div className={`h-full min-h-[56px] rounded-[8px] border flex items-center px-3
                      ${!slot.isWorking
                        ? 'bg-white/3 border-white/5'
                        : 'bg-grey-100 border-white/10 border-dashed'
                      }`}>
                      {!slot.isWorking ? (
                        <span className="text-xs text-grey-200 font-medium">Break / Off</span>
                      ) : (
                        <span className="text-xs text-grey-100">Available</span>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {slot.entries.map((entry, idx) => (
                        <SessionSlot
                          key={idx}
                          entry={entry}
                          onMarkAttended={() => markSession(entry.id, 'attended')}
                          onMarkMissed={() => markSession(entry.id, 'missed')}
                          onMarkUpcoming={() => markSession(entry.id, 'upcoming')}
                          onNotes={setNotesSession}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Stats for today */}
          {scheduleData && (
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="card-dark text-center p-3">
                <p className="text-xl font-black text-brazil-green">{scheduleData.ptSessions?.length || 0}</p>
                <p className="text-xs text-grey-200">PT Sessions</p>
              </div>
              <div className="card-dark text-center p-3">
                <p className="text-xl font-black text-pink-400">{scheduleData.classes?.length || 0}</p>
                <p className="text-xs text-grey-200">Classes</p>
              </div>
              <div className="card-dark text-center p-3">
                <p className="text-xl font-black text-brazil-yellow">{(scheduleData.ptSessions?.length || 0) + (scheduleData.classes?.length || 0)}</p>
                <p className="text-xs text-grey-200">Total</p>
              </div>
            </div>
          )}
        </>
      ) : (
        <WeekView data={weekData} />
      )}

      {notesSession && (
        <PTNotesModal
          session={notesSession}
          onClose={() => setNotesSession(null)}
        />
      )}
    </div>
  );
}

function SessionSlot({ entry, onMarkAttended, onMarkMissed, onMarkUpcoming, onNotes }) {
  const isClass = entry.entryType === 'class';
  const isCancelled = entry.status === 'cancelled';
  const renewalStatus = !isClass && !isCancelled ? getRenewalStatus(entry.sessions_remaining) : null;

  if (isClass) {
    return (
      <div className="rounded-[8px] border bg-pink-500/15 border-pink-500/30 px-3 py-2 flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm text-pink-300">{entry.name}</p>
          <p className="text-xs text-pink-400/70">{entry.scheduled_time} · {entry.payment_type === 'per_person' ? `£${entry.per_person_fee}/person · ${entry.max_people} people` : `£${entry.flat_fee}`}</p>
        </div>
        <span className="text-xs bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded-full">Class</span>
      </div>
    );
  }

  // Cancelled session — grey read-only display
  if (isCancelled) {
    const noticeHours = entry.cancellation_notice_hours;
    const byPT = entry.cancelled_by === 'pt_override';
    return (
      <div className="rounded-[8px] border bg-white/4 border-white/8 px-3 py-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-sm text-grey-100 truncate line-through">{entry.client_name}</p>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-grey-100 text-grey-100 flex items-center gap-0.5">
                <Ban className="w-2.5 h-2.5" /> CANCELLED
              </span>
              {byPT && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500/15 text-orange-400/70">PT Override</span>
              )}
            </div>
            <p className="text-xs text-grey-100">
              {entry.scheduled_time}
              {noticeHours != null && (
                <span> · {Math.floor(noticeHours)}h notice · session carried over</span>
              )}
            </p>
            {entry.pt_override_note && (
              <p className="text-xs text-grey-200 italic mt-0.5">"{entry.pt_override_note}"</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-[8px] border px-3 py-2 ${getStatusColor(entry.status)}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-sm truncate">{entry.client_name}</p>
            {renewalStatus && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${renewalStatus.bg} ${renewalStatus.color}`}>
                {renewalStatus.label}
              </span>
            )}
            {entry.client_type === 'Online' && (
              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full">Online</span>
            )}
          </div>
          <p className="text-xs opacity-70">{entry.scheduled_time} · Session {entry.sessions_used} of 10 · {entry.sessions_remaining} remaining</p>
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          {entry.status === 'attended' && (
            <button onClick={() => onNotes(entry)} title="Session notes"
              className="w-8 h-8 rounded-lg bg-grey-100 hover:bg-white/15 flex items-center justify-center transition-all active:scale-90">
              <FileText className="w-4 h-4 text-grey-200" />
            </button>
          )}
          {entry.status !== 'attended' && (
            <button onClick={onMarkAttended} title="Mark attended"
              className="w-8 h-8 rounded-lg bg-brazil-green/20 hover:bg-brazil-green/40 flex items-center justify-center transition-all active:scale-90">
              <CheckCircle className="w-4 h-4 text-brazil-green" />
            </button>
          )}
          {entry.status === 'attended' && (
            <button onClick={onMarkUpcoming} title="Unmark"
              className="w-8 h-8 rounded-lg bg-grey-100 hover:bg-white/20 flex items-center justify-center transition-all active:scale-90">
              <Clock className="w-4 h-4 text-grey-200" />
            </button>
          )}
          {entry.status !== 'missed' && entry.status !== 'attended' && (
            <button onClick={onMarkMissed} title="Mark missed"
              className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center transition-all active:scale-90">
              <span className="text-red-400 font-bold text-sm">✕</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function WeekView({ data }) {
  if (!data) return null;
  const { weekDates, sessions, classes } = data;
  const days = weekDates?.slice(0, 7) || [];

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <div className="grid grid-cols-7 gap-1 min-w-[560px]">
        {days.map((date, idx) => {
          const d = new Date(date + 'T12:00:00');
          const daySessions = sessions?.filter(s => s.scheduled_date === date) || [];
          const dayClasses = classes?.filter(c => c.day_of_week === d.getDay()) || [];
          const isToday = date === new Date().toISOString().split('T')[0];

          return (
            <div key={date} className={`rounded-[8px] border ${isToday ? 'border-brazil-green/40 bg-brazil-green/5' : 'border-white/10 bg-white/3'} p-2`}>
              <p className={`text-xs font-bold text-center mb-2 ${isToday ? 'text-brazil-green' : 'text-grey-200'}`}>
                {DAY_NAMES[d.getDay()]}
                <br />
                <span className="font-normal">{d.getDate()}</span>
              </p>
              <div className="space-y-1">
                {daySessions.map(s => (
                  <div key={s.id} className="bg-brazil-green/20 rounded-lg px-1.5 py-1">
                    <p className="text-[9px] font-semibold text-brazil-green truncate">{s.client_name}</p>
                    <p className="text-[9px] text-grey-200">{s.scheduled_time}</p>
                  </div>
                ))}
                {dayClasses.map(c => (
                  <div key={c.id} className="bg-pink-500/20 rounded-lg px-1.5 py-1">
                    <p className="text-[9px] font-semibold text-pink-300 truncate">{c.name}</p>
                    <p className="text-[9px] text-pink-400/70">{c.class_time}</p>
                  </div>
                ))}
                {daySessions.length === 0 && dayClasses.length === 0 && (
                  <p className="text-[9px] text-grey-200 text-center py-2">Free</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getWorkingHours(dow) {
  // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  const schedule = {
    0: [], // Sunday
    1: [{ start: 7, end: 20 }], // Monday
    2: [{ start: 7, end: 20 }], // Tuesday
    3: [{ start: 7, end: 14 }, { start: 17, end: 20 }], // Wednesday
    4: [{ start: 8, end: 14 }], // Thursday
    5: [{ start: 8, end: 20 }], // Friday
    6: [], // Saturday (classes only, handled separately)
  };
  return schedule[dow] || [];
}

function isInWorkingHours(hour, dow) {
  const hours = getWorkingHours(dow);
  return hours.some(({ start, end }) => hour >= start && hour < end);
}
