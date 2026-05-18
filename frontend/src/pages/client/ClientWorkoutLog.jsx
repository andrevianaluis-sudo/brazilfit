import { useState, useEffect } from 'react';
import { Plus, X, ChevronDown, ChevronUp, Edit3, Check, ClipboardList, Loader2, Trash2 } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { fmtDate } from '../../utils/dateUtils';

const EMPTY_EXERCISE = { name: '', intensity_pct: '', reps_or_duration: '', sets: '', rest: '', completed_reps: '', completed_sets: '', completed_weight: '' };

function ExerciseTableRow({ ex, index, onChange, onDelete }) {
  return (
    <div className="bg-white/4 rounded-[8px] border border-white/8 mb-2 overflow-hidden">
      {/* Exercise name */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-grey-100">
        <span className="text-xs font-bold text-brazil-green w-5 flex-shrink-0">{index + 1}</span>
        <input value={ex.name} onChange={e => onChange({ ...ex, name: e.target.value })}
          placeholder="Exercise name"
          className="flex-1 bg-transparent text-sm font-medium focus:outline-none placeholder:text-grey-200" />
        <button type="button" onClick={onDelete}
          className="p-1 rounded hover:bg-red-500/20 text-grey-200 hover:text-red-400 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      {/* Grid */}
      <div className="grid grid-cols-2 gap-0 divide-x divide-white/5">
        <div className="px-3 py-2">
          <p className="text-[9px] text-grey-100 uppercase font-bold mb-1">PLANNED</p>
          <div className="space-y-1.5">
            <SmallInput label="Intensity % (1RM)" value={ex.intensity_pct} onChange={v => onChange({ ...ex, intensity_pct: v })} placeholder="e.g. 70%" />
            <SmallInput label="Reps / Duration" value={ex.reps_or_duration} onChange={v => onChange({ ...ex, reps_or_duration: v })} placeholder="e.g. 10 reps / 30s" />
            <SmallInput label="Sets" value={ex.sets} onChange={v => onChange({ ...ex, sets: v })} placeholder="e.g. 3" />
            <SmallInput label="Rest" value={ex.rest} onChange={v => onChange({ ...ex, rest: v })} placeholder="e.g. 60s" />
          </div>
        </div>
        <div className="px-3 py-2">
          <p className="text-[9px] text-brazil-green uppercase font-bold mb-1">COMPLETED</p>
          <div className="space-y-1.5">
            <SmallInput label="Weight used" value={ex.completed_weight} onChange={v => onChange({ ...ex, completed_weight: v })} placeholder="e.g. 60kg" />
            <SmallInput label="Actual reps" value={ex.completed_reps} onChange={v => onChange({ ...ex, completed_reps: v })} placeholder="e.g. 10" />
            <SmallInput label="Actual sets" value={ex.completed_sets} onChange={v => onChange({ ...ex, completed_sets: v })} placeholder="e.g. 3" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SmallInput({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-[9px] text-grey-200 block">{label}</label>
      <input value={value || ''} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-xs border-b border-grey-100 pb-0.5 focus:outline-none focus:border-brazil-green/50 placeholder:text-grey-200" />
    </div>
  );
}

function LogCard({ log, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  let exercises = [];
  try { exercises = JSON.parse(log.exercises || '[]'); } catch {}

  return (
    <div className="card-dark">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-[8px] bg-brazil-green/20 flex items-center justify-center flex-shrink-0">
          <span className="text-brazil-green font-black text-sm">#{log.session_number}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-sm">{fmtDate(log.session_date)}</p>
            <div className="flex gap-1">
              <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-lg hover:bg-grey-300 text-grey-100">
                {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => onDelete(log.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-grey-200 hover:text-red-400">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          {log.session_aims && <p className="text-xs text-grey-200 mt-0.5 line-clamp-1">{log.session_aims}</p>}
          <p className="text-xs text-grey-100 mt-0.5">{exercises.length} exercise{exercises.length !== 1 ? 's' : ''} logged</p>
        </div>
      </div>
      {expanded && (
        <div className="mt-3 pt-3 border-t border-white/8 space-y-3">
          {log.session_aims && (
            <div>
              <p className="text-[10px] text-grey-100 uppercase font-bold mb-1">Session Aims</p>
              <p className="text-xs text-grey-200">{log.session_aims}</p>
            </div>
          )}
          {exercises.length > 0 && (
            <div>
              <p className="text-[10px] text-grey-100 uppercase font-bold mb-2">Exercises</p>
              <div className="space-y-2">
                {exercises.map((ex, i) => (
                  <div key={i} className="bg-white/4 rounded-lg px-3 py-2.5 text-xs">
                    <p className="font-semibold text-black mb-1.5">{ex.name || `Exercise ${i+1}`}</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-grey-200">
                      {ex.sets && <span>Planned: {ex.sets} sets  {ex.reps_or_duration}</span>}
                      {ex.intensity_pct && <span>Intensity: {ex.intensity_pct}</span>}
                      {ex.completed_sets && <span className="text-brazil-green">Done: {ex.completed_sets} sets  {ex.completed_reps}</span>}
                      {ex.completed_weight && <span className="text-brazil-green">Weight: {ex.completed_weight}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {log.additional_comments && (
            <div>
              <p className="text-[10px] text-grey-100 uppercase font-bold mb-1">Comments</p>
              <p className="text-xs text-grey-200">{log.additional_comments}</p>
            </div>
          )}
          {log.changes_next_session && (
            <div>
              <p className="text-[10px] text-brazil-green uppercase font-bold mb-1">Changes for Next Session</p>
              <p className="text-xs text-grey-200">{log.changes_next_session}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ClientWorkoutLog() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionAims, setSessionAims] = useState('');
  const [exercises, setExercises] = useState([{ ...EMPTY_EXERCISE }]);
  const [comments, setComments] = useState('');
  const [changesNext, setChangesNext] = useState('');

  useEffect(() => { loadLogs(); }, []);

  const loadLogs = async () => {
    try {
      const res = await api.get('/onboarding/workoutlog');
      setLogs(res.data);
    } catch {
      toast.error('Failed to load workout log');
    } finally {
      setLoading(false);
    }
  };

  const addExercise = () => setExercises(ex => [...ex, { ...EMPTY_EXERCISE }]);
  const updateExercise = (i, val) => setExercises(ex => ex.map((e, idx) => idx === i ? val : e));
  const removeExercise = (i) => setExercises(ex => ex.filter((_, idx) => idx !== i));

  const resetForm = () => {
    setSessionDate(new Date().toISOString().split('T')[0]);
    setSessionAims('');
    setExercises([{ ...EMPTY_EXERCISE }]);
    setComments('');
    setChangesNext('');
  };

  const handleSave = async () => {
    if (!sessionAims.trim() && exercises.every(e => !e.name)) {
      return toast.error('Please add session aims or at least one exercise');
    }
    setSaving(true);
    try {
      await api.post('/onboarding/workoutlog', {
        session_date: sessionDate,
        session_aims: sessionAims,
        exercises: exercises.filter(e => e.name || e.reps_or_duration),
        additional_comments: comments,
        changes_next_session: changesNext,
      });
      toast.success('Workout log saved!');
      setShowForm(false);
      resetForm();
      loadLogs();
    } catch {
      toast.error('Failed to save workout log');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this workout log entry?')) return;
    try {
      await api.delete(`/onboarding/workoutlog/${id}`);
      setLogs(l => l.filter(x => x.id !== id));
      toast.success('Deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const nextSessionNum = (logs[0]?.session_number || 0) + 1;

  return (
    <div className="px-4 py-4 animate-fade-in space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Workout Log</h1>
          <p className="text-xs text-grey-100">Log your independent training sessions</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 bg-brazil-green text-black text-sm font-semibold px-3 py-2 rounded-[8px] active:scale-95 transition-transform">
            <Plus className="w-4 h-4" /> New Log
          </button>
        )}
      </div>

      {showForm && (
        <div className="card-dark space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p style={{fontWeight:700}}>Session #{nextSessionNum}</p>
              <p className="text-xs text-grey-100">{user?.name}</p>
            </div>
            <button onClick={() => { setShowForm(false); resetForm(); }}
              className="p-2 rounded-[8px] hover:bg-grey-300 text-grey-100">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="text-xs text-grey-100 mb-1.5 block">Session Date</label>
            <input type="date" value={sessionDate} onChange={e => setSessionDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full bg-grey-100 border border-grey-100 rounded-[8px] px-3 py-2.5 text-sm focus:outline-none focus:border-brazil-green/50" />
          </div>

          <div>
            <label className="text-xs text-grey-100 mb-1.5 block">Session Aims</label>
            <textarea value={sessionAims} onChange={e => setSessionAims(e.target.value)} rows={2}
              placeholder="What did you aim to achieve in this session?"
              className="w-full bg-grey-100 border border-grey-100 rounded-[8px] px-3 py-2.5 text-sm focus:outline-none focus:border-brazil-green/50 resize-none placeholder:text-grey-200" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-grey-100">Exercises</label>
              <button type="button" onClick={addExercise}
                className="flex items-center gap-1 text-xs text-brazil-green hover:text-brazil-green/80 active:scale-95">
                <Plus className="w-3 h-3" /> Add Exercise
              </button>
            </div>
            {exercises.map((ex, i) => (
              <ExerciseTableRow key={i} ex={ex} index={i}
                onChange={v => updateExercise(i, v)}
                onDelete={() => removeExercise(i)} />
            ))}
          </div>

          <div>
            <label className="text-xs text-grey-100 mb-1.5 block">Additional Comments</label>
            <textarea value={comments} onChange={e => setComments(e.target.value)} rows={2}
              placeholder="How did the session go? Any observations..."
              className="w-full bg-grey-100 border border-grey-100 rounded-[8px] px-3 py-2.5 text-sm focus:outline-none focus:border-brazil-green/50 resize-none placeholder:text-grey-200" />
          </div>

          <div>
            <label className="text-xs text-grey-100 mb-1.5 block">Changes for Next Session</label>
            <textarea value={changesNext} onChange={e => setChangesNext(e.target.value)} rows={2}
              placeholder="What would you do differently or progress next time?"
              className="w-full bg-grey-100 border border-grey-100 rounded-[8px] px-3 py-2.5 text-sm focus:outline-none focus:border-brazil-green/50 resize-none placeholder:text-grey-200" />
          </div>

          <div className="flex gap-3">
            <button onClick={() => { setShowForm(false); resetForm(); }}
              className="px-4 py-3 rounded-[8px] bg-grey-100 text-grey-200 text-sm font-medium hover:bg-white/12 active:scale-95 transition-all">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[8px] bg-brazil-green text-black font-bold text-sm active:scale-95 transition-all disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save Log
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><div className="w-6 h-6 border-4 border-brazil-green border-t-transparent rounded-full animate-spin" /></div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12">
          <ClipboardList className="w-12 h-12 text-grey-200 mx-auto mb-3" />
          <p className="text-grey-100 text-sm">No workout logs yet.</p>
          <p className="text-grey-200 text-xs mt-1">Tap "New Log" to record your first session.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-grey-100">{logs.length} session{logs.length !== 1 ? 's' : ''} logged</p>
          {logs.map(log => <LogCard key={log.id} log={log} onDelete={handleDelete} />)}
        </div>
      )}
    </div>
  );
}

