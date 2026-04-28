import { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical, X, ChevronDown, Users, Dumbbell, Check, Edit2 } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

function ExercisePickerModal({ onSelect, onClose }) {
  const [exercises, setExercises] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  // Strength exercises hidden until GIFs are added
  const STRETCHING_CATS = ['All', 'Neck', 'Shoulders', 'Back', 'Arms', 'Chest', 'Hips', 'Legs', 'Calves', 'Full Body'];

  useEffect(() => {
    // Load only stretching exercises
    api.get('/exercises/stretching/all').then(r => setExercises(r.data || [])).catch(() => {});
  }, []);

  const filtered = exercises.filter(e => {
    if (category !== 'All' && e.category !== category) return false;
    if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 px-4 pb-4 sm:pb-0">
      <div className="w-full max-w-md bg-dark-grey-100 rounded-[12px] border border-white/10 shadow-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
          <p className="font-semibold text-sm">Pick Stretching Exercise</p>
          <button onClick={onClose}><X className="w-4 h-4 text-grey-100" /></button>
        </div>
        <div className="px-4 py-3 space-y-2 flex-shrink-0">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
            style={{ color: '#1a1a2e', backgroundColor: '#ffffff' }}
            className="w-full border border-gray-300 rounded-[8px] px-3 py-2 text-sm focus:outline-none" />
          <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
            {STRETCHING_CATS.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full transition-all ${category === c ? 'bg-brazil-green text-white' : 'bg-grey-100 text-grey-200'}`}>{c}</button>
            ))}
          </div>
        </div>
        <div className="overflow-y-auto flex-1 px-4 pb-4 space-y-1.5">
          {filtered.map(ex => {
            return (
              <button key={ex.id} onClick={() => onSelect(ex)}
                className="w-full text-left px-3 py-2.5 rounded-[8px] bg-grey-100 hover:bg-grey-100 transition-colors">
                <p className="text-sm font-medium">{ex.name}</p>
                <p className="text-xs text-grey-100">{ex.category}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DayEditor({ day, dayIndex, onUpdate, onRemove }) {
  const [showPicker, setShowPicker] = useState(false);

  const addExercise = (exercise) => {
    const newEx = {
      exercise_id: exercise.id,
      exercise_name: exercise.name,
      sets: 3,
      reps: '10',
      rest_seconds: 60,
      notes: '',
    };
    onUpdate(dayIndex, { ...day, exercises: [...(day.exercises || []), newEx] });
    setShowPicker(false);
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
      <div className="flex items-center gap-3 px-4 py-3 bg-grey-100">
        <input
          value={day.day_name}
          onChange={e => onUpdate(dayIndex, { ...day, day_name: e.target.value })}
          style={{ color: '#1a1a2e', backgroundColor: '#ffffff' }}
          className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-sm font-bold focus:outline-none"
          placeholder="Day name (e.g. Push Day)"
        />
        <button onClick={() => onRemove(dayIndex)} className="p-1 text-grey-100 hover:text-red-400 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Exercises */}
      <div className="px-4 py-3 space-y-3">
        {(day.exercises || []).map((ex, exIdx) => (
          <div key={exIdx} className="bg-dark-grey-100 rounded-[8px] p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-sm">{ex.exercise_name}</p>
              <button onClick={() => removeExercise(exIdx)} className="p-1 text-grey-200 hover:text-red-400 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[9px] text-grey-100 block mb-1">SETS</label>
                <input
                  type="number" min="1" max="10"
                  value={ex.sets}
                  onChange={e => updateExercise(exIdx, 'sets', parseInt(e.target.value) || 1)}
                  style={{ color: '#1a1a2e', backgroundColor: '#ffffff' }}
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] text-grey-100 block mb-1">REPS</label>
                <input
                  value={ex.reps}
                  onChange={e => updateExercise(exIdx, 'reps', e.target.value)}
                  style={{ color: '#1a1a2e', backgroundColor: '#ffffff' }}
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none"
                  placeholder="10"
                />
              </div>
              <div>
                <label className="text-[9px] text-grey-100 block mb-1">REST (s)</label>
                <input
                  type="number" min="0" step="15"
                  value={ex.rest_seconds}
                  onChange={e => updateExercise(exIdx, 'rest_seconds', parseInt(e.target.value) || 0)}
                  style={{ color: '#1a1a2e', backgroundColor: '#ffffff' }}
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none"
                />
              </div>
            </div>
            <input
              value={ex.notes}
              onChange={e => updateExercise(exIdx, 'notes', e.target.value)}
              placeholder="Notes (optional)..."
              style={{ color: '#1a1a2e', backgroundColor: '#ffffff' }}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
            />
          </div>
        ))}

        <button
          onClick={() => setShowPicker(true)}
          className="w-full py-2.5 border border-dashed border-white/15 rounded-[8px] text-xs text-grey-100 hover:text-grey-200 hover:border-white/25 transition-all flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> Add exercise
        </button>
      </div>

      {showPicker && <ExercisePickerModal onSelect={addExercise} onClose={() => setShowPicker(false)} />}
    </div>
  );
}

export default function PTWorkoutBuilder() {
  const [plans, setPlans] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null); // plan being edited
  const [saving, setSaving] = useState(false);

  // New plan form
  const [form, setForm] = useState({ client_id: '', name: '', description: '', days: [] });

  const loadData = async () => {
    try {
      const [plansRes, clientsRes] = await Promise.all([
        api.get('/workouts/plans'),
        api.get('/pt/clients'),
      ]);
      setPlans(plansRes.data);
      setClients(clientsRes.data || []);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const addDay = () => {
    setForm(f => ({
      ...f,
      days: [...f.days, { day_name: `Day ${f.days.length + 1}`, exercises: [] }]
    }));
  };

  const updateDay = (idx, day) => {
    setForm(f => {
      const days = [...f.days];
      days[idx] = day;
      return { ...f, days };
    });
  };

  const removeDay = (idx) => {
    setForm(f => ({ ...f, days: f.days.filter((_, i) => i !== idx) }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Plan name is required');
    if (!form.client_id) return toast.error('Select a client');
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
      toast.success('Plan deactivated');
      loadData();
    } catch {
      toast.error('Failed to deactivate plan');
    }
  };

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-brazil-green border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // Plan editor view
  if (creating) {
    return (
      <div className="px-4 py-4 animate-fade-in space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black">{editingPlan ? 'Edit Plan' : 'New Plan'}</h1>
          </div>
          <button onClick={() => { setCreating(false); setEditingPlan(null); setForm({ client_id: '', name: '', description: '', days: [] }); }}
            className="p-2 rounded-[8px] hover:bg-grey-100"><X className="w-5 h-5 text-grey-100" /></button>
        </div>

        {/* Plan details */}
        <div className="card-dark space-y-3">
          <div>
            <label className="text-xs text-grey-100 mb-1 block">Plan Name *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              style={{ color: '#1a1a2e', backgroundColor: '#ffffff' }}
              className="w-full border border-gray-300 rounded-[8px] px-3 py-2.5 text-sm focus:outline-none focus:border-brazil-green" placeholder="e.g. Beginner Strength Block" />
          </div>
          <div>
            <label className="text-xs text-grey-100 mb-1 block">Assign to Client *</label>
            <select value={form.client_id} onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))}
              style={{ color: '#1a1a2e', backgroundColor: '#ffffff' }}
              className="w-full border border-gray-300 rounded-[8px] px-3 py-2.5 text-sm focus:outline-none focus:border-brazil-green appearance-none">
              <option value="">Select client...</option>
              {clients.map(c => <option key={c.id} value={c.id} style={{ color: '#1a1a2e', backgroundColor: '#ffffff' }}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-grey-100 mb-1 block">Description (optional)</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
              style={{ color: '#1a1a2e', backgroundColor: '#ffffff' }}
              className="w-full border border-gray-300 rounded-[8px] px-3 py-2.5 text-sm focus:outline-none resize-none"
              placeholder="What is this plan for?" />
          </div>
        </div>

        {/* Days */}
        <div className="space-y-3">
          {form.days.map((day, i) => (
            <DayEditor key={i} day={day} dayIndex={i} onUpdate={updateDay} onRemove={removeDay} />
          ))}
          <button onClick={addDay}
            className="w-full py-3 border border-dashed border-brazil-green/30 rounded-[12px] text-sm text-brazil-green/60 hover:text-brazil-green hover:border-brazil-green/50 transition-all flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Add training day
          </button>
        </div>

        <button onClick={handleSave} disabled={saving}
          className="w-full py-4 bg-brazil-green rounded-[12px] font-black text-white text-lg disabled:opacity-50 flex items-center justify-center gap-2">
          {saving ? 'Saving...' : <><Check className="w-5 h-5" /> {editingPlan ? 'Update Plan' : 'Save Plan'}</>}
        </button>
      </div>
    );
  }

  // Plans list view
  return (
    <div className="px-4 py-4 animate-fade-in space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">Workout Plans</h1>
        <button onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 bg-brazil-green text-white text-sm font-semibold px-3 py-2 rounded-[8px] active:scale-95 transition-transform">
          <Plus className="w-4 h-4" /> New Plan
        </button>
      </div>

      {plans.length === 0 ? (
        <div className="text-center py-12">
          <Dumbbell className="w-12 h-12 text-grey-200 mx-auto mb-3" />
          <p className="text-grey-200 font-semibold">No workout plans yet</p>
          <p className="text-xs text-grey-100 mt-1">Create a plan and assign it to a client.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {plans.map(plan => (
            <div key={plan.id} className="card-dark">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{plan.name}</p>
                  {plan.client_name && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <Users className="w-3 h-3 text-brazil-green/60" />
                      <p className="text-xs text-grey-200">{plan.client_name}</p>
                    </div>
                  )}
                  {plan.description && <p className="text-xs text-grey-100 mt-1">{plan.description}</p>}
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => handleEdit(plan)}
                    className="p-1.5 rounded-lg bg-grey-100 hover:bg-white/15 text-grey-100 hover:text-white transition-all">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDeactivate(plan.id)}
                    className="p-1.5 rounded-lg bg-grey-100 hover:bg-red-500/10 text-grey-200 hover:text-red-400 transition-all">
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
