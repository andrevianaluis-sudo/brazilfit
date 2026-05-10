import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, X, Users, Dumbbell, Check, Edit2 } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const GIF_BASE = '/exercise-gifs/';

function getGifUrl(exercise) {
  if (!exercise) return null;
  if (exercise.gif_file) return GIF_BASE + exercise.gif_file;
  if (exercise.gif_url) return exercise.gif_url;
  return null;
  return slug ? `${GIF_BASE}${slug}.gif` : null;
}

// ─── Exercise Picker Modal ────────────────────────────────────────────────────
function ExercisePickerModal({ onSelect, onClose, alreadyAdded = [] }) {
  const [exercises, setExercises] = useState([]);
  const [all, setAll] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const CATEGORIES = ['All','Arms','Back','Calves','Chest','Full Body','Hips','Legs','Neck','Shoulders'];

  useEffect(() => {
    api.get('/stretches').then(r => {
      setAll(r.data || []);
      setExercises(r.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let f = all;
    if (category && category !== 'All') f = f.filter(s => s.muscle_group === category);
    if (search) f = f.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
    setExercises(f);
  }, [search, category, all]);

  const addedIds = new Set(alreadyAdded.map(e => e.exercise_id));



  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 px-4 pb-4 sm:pb-0">
      <div className="w-full max-w-md bg-dark-grey-100 rounded-[12px] border border-white/10 shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
          <p className="font-semibold text-sm">Add Exercise</p>
          <button onClick={onClose}><X className="w-4 h-4 text-grey-100" /></button>
        </div>

        {/* Search + filter */}
        <div className="px-4 py-3 space-y-2 flex-shrink-0">
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search exercises..."
            className="w-full rounded-[8px] px-3 py-2 text-sm focus:outline-none border border-white/10 bg-grey-100 text-white placeholder-grey-200"
          />
          <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-1">
            <button onClick={() => setCategory('')}
              className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full transition-all ${!category ? 'bg-brazil-orange text-white' : 'bg-grey-100 text-grey-200'}`}>
              All
            </button>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c === category ? '' : c)}
                className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full transition-all ${category === c ? 'bg-brazil-orange text-white' : 'bg-grey-100 text-grey-200'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise list */}
        <div className="overflow-y-auto flex-1 px-4 pb-4 space-y-1.5">
          {loading ? (
            <div className="text-center py-8 text-grey-200 text-sm">Loading...</div>
          ) : exercises.length === 0 ? (
            <div className="text-center py-8 text-grey-200 text-sm">No exercises found</div>
          ) : exercises.map(ex => {
            const gifUrl = getGifUrl(ex);
            const added = addedIds.has(ex.id);
            return (
              <button key={ex.id} onClick={() => !added && onSelect(ex)} disabled={added}
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-[8px] transition-colors ${added ? 'bg-brazil-green/10 cursor-default' : 'bg-grey-100 hover:bg-white/10'}`}>
                {/* GIF thumbnail */}
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 flex-shrink-0 flex items-center justify-center">
                  {gifUrl ? (
                    <img src={gifUrl} alt={ex.name} className="w-full h-full object-cover"
                      onError={e => { e.target.style.display = 'none'; }} />
                  ) : <span className="text-lg">💪</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{ex.name}</p>
                  <p className="text-xs text-grey-200">
                    {ex.category && <span className="text-brazil-orange mr-2">{ex.category}</span>}
                    {ex.muscle_groups}
                  </p>
                </div>
                {added ? (
                  <Check className="w-4 h-4 text-brazil-green flex-shrink-0" />
                ) : (
                  <Plus className="w-4 h-4 text-grey-200 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Day Editor ───────────────────────────────────────────────────────────────
function DayEditor({ day, dayIndex, onUpdate, onRemove }) {
  const [showPicker, setShowPicker] = useState(false);

  const addExercise = (exercise) => {
    const newEx = {
      exercise_id: exercise.id,
      exercise_name: exercise.name,
      gif_url: exercise.gif_url,
      sets: 3,
      reps: '10',
      rest_seconds: 60,
      notes: '',
    };
    onUpdate(dayIndex, { ...day, exercises: [...(day.exercises || []), newEx] });
    // keep modal open so they can add more
  };

  const updateExercise = (exIdx, field, value) => {
    const exercises = [...(day.exercises || [])];
    exercises[exIdx] = { ...exercises[exIdx], [field]: value };
    onUpdate(dayIndex, { ...day, exercises });
  };

  const removeExercise = (exIdx) => {
    const exercises = (day.exercises || []).filter((_, i) => i !== exIdx);
    onUpdate(dayIndex, { ...day, exercises });
  };

  return (
    <div className="bg-grey-100 rounded-[12px] border border-white/10 overflow-hidden">
      {/* Day header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white/5 border-b border-white/10">
        <div className="w-6 h-6 rounded-full bg-brazil-orange flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {dayIndex + 1}
        </div>
        <input
          value={day.day_name}
          onChange={e => onUpdate(dayIndex, { ...day, day_name: e.target.value })}
          className="flex-1 bg-transparent text-white text-sm font-bold focus:outline-none placeholder-grey-200"
          placeholder="Day name (e.g. Push Day)"
        />
        <button onClick={() => onRemove(dayIndex)} className="p-1 text-grey-200 hover:text-red-400 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Exercises */}
      <div className="px-4 py-3 space-y-2">
        {(day.exercises || []).map((ex, exIdx) => {
          const gifUrl = getGifUrl(ex);
          return (
            <div key={exIdx} className="bg-dark-grey-100 rounded-[8px] p-3 space-y-2">
              <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {/* GIF mini thumbnail */}
                  <div className="w-8 h-8 rounded-md overflow-hidden bg-white/5 flex-shrink-0 flex items-center justify-center">
                    {gifUrl ? (
                      <img src={gifUrl} alt={ex.exercise_name} className="w-full h-full object-cover"
                        onError={e => { e.target.style.display = 'none'; }} />
                    ) : <span className="text-sm">💪</span>}
                  </div>
                  <p className="font-semibold text-sm text-white truncate">{ex.exercise_name}</p>
                </div>
                <button onClick={() => removeExercise(exIdx)} className="p-1 text-grey-200 hover:text-red-400 transition-colors flex-shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[9px] text-grey-200 block mb-1">SETS</label>
                  <input type="number" min="1" max="10" value={ex.sets}
                    onChange={e => updateExercise(exIdx, 'sets', parseInt(e.target.value) || 1)}
                    className="w-full bg-white/10 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white text-center focus:outline-none focus:border-brazil-orange"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-grey-200 block mb-1">REPS</label>
                  <input value={ex.reps} onChange={e => updateExercise(exIdx, 'reps', e.target.value)}
                    className="w-full bg-white/10 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white text-center focus:outline-none focus:border-brazil-orange"
                    placeholder="10"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-grey-200 block mb-1">REST (s)</label>
                  <input type="number" min="0" step="15" value={ex.rest_seconds}
                    onChange={e => updateExercise(exIdx, 'rest_seconds', parseInt(e.target.value) || 0)}
                    className="w-full bg-white/10 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white text-center focus:outline-none focus:border-brazil-orange"
                  />
                </div>
              </div>

              <input value={ex.notes} onChange={e => updateExercise(exIdx, 'notes', e.target.value)}
                placeholder="Notes (optional)..."
                className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-grey-200 focus:outline-none"
              />
            </div>
          );
        })}

        <button onClick={() => setShowPicker(true)}
          className="w-full py-2.5 border border-dashed border-white/15 rounded-[8px] text-xs text-grey-200 hover:text-white hover:border-brazil-orange/50 transition-all flex items-center justify-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Add exercise
        </button>
      </div>

      {showPicker && (
        <ExercisePickerModal
          onSelect={addExercise}
          onClose={() => setShowPicker(false)}
          alreadyAdded={day.exercises || []}
        />
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PTWorkoutBuilder() {
  const [plans, setPlans] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ client_id: '', name: '', description: '', days: [] });

  const loadData = async () => {
    try {
      const [plansRes, clientsRes] = await Promise.all([
        api.get('/workouts/plans'),
        api.get('/pt/clients'),
      ]);
      setPlans(Array.isArray(plansRes.data) ? plansRes.data : []);
      setClients(clientsRes.data?.clients || clientsRes.data || []);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const addDay = () => {
    setForm(f => ({ ...f, days: [...f.days, { day_name: `Day ${f.days.length + 1}`, exercises: [] }] }));
  };

  const updateDay = (idx, day) => {
    setForm(f => { const days = [...f.days]; days[idx] = day; return { ...f, days }; });
  };

  const removeDay = (idx) => {
    setForm(f => ({ ...f, days: f.days.filter((_, i) => i !== idx) }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Plan name is required');
    if (form.days.length === 0) return toast.error('Add at least one day');
    setSaving(true);
    try {
      if (editingPlan) {
        await api.put(`/workouts/plans/${editingPlan.id}`, form);
        toast.success('Plan updated!');
      } else {
        await api.post('/workouts/plans', form);
        toast.success('Plan created!');
      }
      setCreating(false);
      setEditingPlan(null);
      setForm({ client_id: '', name: '', description: '', days: [] });
      loadData();
    } catch {
      toast.error('Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (plan) => {
    try {
      const res = await api.get(`/workouts/plans/${plan.id}`);
      const full = res.data;
      setForm({
        client_id: full.client_id || '',
        name: full.name,
        description: full.description || '',
        days: (full.days || []).map(d => ({
          day_name: d.day_name,
          exercises: (d.exercises || []).map(ex => ({
            exercise_id: ex.exercise_id,
            exercise_name: ex.exercise_name,
            gif_url: ex.gif_url,
            sets: ex.sets,
            reps: ex.reps,
            rest_seconds: ex.rest_seconds,
            notes: ex.notes || '',
          }))
        }))
      });
      setEditingPlan(full);
      setCreating(true);
    } catch {
      toast.error('Failed to load plan');
    }
  };

  const handleDeactivate = async (planId) => {
    try {
      await api.delete(`/workouts/plans/${planId}`);
      toast.success('Plan deleted');
      loadData();
    } catch {
      toast.error('Failed to delete plan');
    }
  };

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-brazil-orange border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // ── Plan editor ──
  if (creating) {
    return (
      <div className="px-4 py-4 animate-fade-in space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black">{editingPlan ? 'Edit Plan' : 'New Plan'}</h1>
          <button onClick={() => { setCreating(false); setEditingPlan(null); setForm({ client_id: '', name: '', description: '', days: [] }); }}
            className="p-2 rounded-[8px] hover:bg-white/10">
            <X className="w-5 h-5 text-grey-200" />
          </button>
        </div>

        {/* Plan details */}
        <div className="card-dark space-y-3">
          <div>
            <label className="text-xs text-grey-200 mb-1 block">Plan Name *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full bg-white/10 border border-white/10 rounded-[8px] px-3 py-2.5 text-sm text-white placeholder-grey-200 focus:outline-none focus:border-brazil-orange"
              placeholder="e.g. Beginner Strength Block" />
          </div>
          <div>
            <label className="text-xs text-grey-200 mb-1 block">Assign to Client (optional)</label>
            <select value={form.client_id} onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))}
              className="w-full bg-white/10 border border-white/10 rounded-[8px] px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brazil-orange appearance-none">
              <option value="" style={{ background: '#1a1a2e' }}>No client assigned yet</option>
              {clients.map(c => <option key={c.id} value={c.id} style={{ background: '#1a1a2e' }}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-grey-200 mb-1 block">Description (optional)</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
              className="w-full bg-white/10 border border-white/10 rounded-[8px] px-3 py-2.5 text-sm text-white placeholder-grey-200 focus:outline-none resize-none"
              placeholder="What is this plan for?" />
          </div>
        </div>

        {/* Days */}
        <div className="space-y-3">
          {form.days.map((day, i) => (
            <DayEditor key={i} day={day} dayIndex={i} onUpdate={updateDay} onRemove={removeDay} />
          ))}
          <button onClick={addDay}
            className="w-full py-3 border border-dashed border-brazil-orange/30 rounded-[12px] text-sm text-brazil-orange/60 hover:text-brazil-orange hover:border-brazil-orange/50 transition-all flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Add training day
          </button>
        </div>

        <button onClick={handleSave} disabled={saving}
          className="w-full py-4 bg-brazil-orange rounded-[12px] font-black text-white text-lg disabled:opacity-50 flex items-center justify-center gap-2">
          {saving ? 'Saving...' : <><Check className="w-5 h-5" /> {editingPlan ? 'Update Plan' : 'Save Plan'}</>}
        </button>
      </div>
    );
  }

  // ── Plans list ──
  return (
    <div className="px-4 py-4 animate-fade-in space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">Workout Plans</h1>
        <button onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 bg-brazil-orange text-white text-sm font-semibold px-3 py-2 rounded-[8px] active:scale-95 transition-transform">
          <Plus className="w-4 h-4" /> New Plan
        </button>
      </div>

      {plans.length === 0 ? (
        <div className="text-center py-12">
          <Dumbbell className="w-12 h-12 text-grey-200 mx-auto mb-3" />
          <p className="text-grey-200 font-semibold">No workout plans yet</p>
          <p className="text-xs text-grey-100 mt-1">Create a plan and assign it to a client.</p>
          <button onClick={() => setCreating(true)}
            className="mt-4 bg-brazil-orange text-white px-5 py-2.5 rounded-[8px] font-semibold text-sm">
            Create First Plan
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {plans.map(plan => (
            <div key={plan.id} className="card-dark">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{plan.name}</p>
                  {plan.client_name ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <Users className="w-3 h-3 text-brazil-green/60" />
                      <p className="text-xs text-brazil-green">{plan.client_name}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-grey-200 mt-1">Not assigned to a client</p>
                  )}
                  {plan.description && <p className="text-xs text-grey-100 mt-1">{plan.description}</p>}
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => handleEdit(plan)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-grey-200 hover:text-white transition-all">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDeactivate(plan.id)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-red-500/10 text-grey-200 hover:text-red-400 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
