import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Users, Check } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const GIF_BASE = '/exercise-gifs/';
const GROUPS = ['All','Arms','Back','Calves','Chest','Full Body','Hips','Legs','Neck','Shoulders'];

function ExercisePickerModal({ onSelect, onClose, alreadyAdded = [] }) {
  const [all, setAll] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState('All');
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    api.get('/stretches').then(r => {
      setAll(r.data || []);
      setFiltered(r.data || []);
    }).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let f = all;
    if (group !== 'All') f = f.filter(s => s.muscle_group === group);
    if (search) f = f.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
    setFiltered(f);
  }, [search, group, all]);

  const addedIds = new Set(alreadyAdded.map(e => e.exercise_id));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 px-4 pb-4 sm:pb-0">
      <div className="w-full max-w-md bg-dark-grey-100 rounded-[12px] border border-white/10 shadow-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
          <p className="font-semibold text-sm">Add Exercise ({filtered.length})</p>
          <button onClick={onClose}><X className="w-4 h-4 text-grey-100" /></button>
        </div>
        <div className="px-4 pt-3 flex-shrink-0">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search stretches..." className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none mb-2" />
          <div className="flex gap-1 flex-wrap mb-2">
            {GROUPS.map(g => <button key={g} onClick={() => setGroup(g)} className={`px-2 py-1 rounded-full text-xs border ${group === g ? 'border-brazil-green bg-brazil-green/20 text-brazil-green' : 'border-white/10 text-grey-200'}`}>{g}</button>)}
          </div>
        </div>
        <div className="overflow-y-auto flex-1 px-4 pb-4">
          {loading ? <p className="text-center text-grey-200 py-8 text-sm">Loading stretches...</p> : filtered.length === 0 ? <p className="text-center text-grey-200 py-8 text-sm">No stretches found</p> : filtered.map(ex => {
            const isAdded = addedIds.has(ex.id);
            const isPreviewing = preview?.id === ex.id;
            return (
              <div key={ex.id} className="mb-2">
                <div className="flex items-center gap-3 p-2 rounded-lg border border-white/5 hover:border-white/20 transition cursor-pointer" onClick={() => setPreview(isPreviewing ? null : ex)}>
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-black/30 flex-shrink-0">
                    <img src={GIF_BASE + ex.gif_file} alt={ex.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{ex.name}</p>
                    <p className="text-xs text-brazil-green">{ex.muscle_group}</p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); if (!isAdded) onSelect(ex); }} className={`px-3 py-1 rounded-lg text-xs font-semibold flex-shrink-0 ${isAdded ? 'bg-white/10 text-grey-200 cursor-not-allowed' : 'bg-brazil-green text-white hover:bg-brazil-green/80'}`} disabled={isAdded}>{isAdded ? 'Added' : '+ Add'}</button>
                </div>
                {isPreviewing && <div className="mt-1 mb-2 rounded-lg overflow-hidden"><img src={GIF_BASE + ex.gif_file} alt={ex.name} className="w-full max-h-48 object-contain bg-black/30" /></div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function PTWorkoutBuilder() {
  const [workouts, setWorkouts] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', difficulty: 'beginner', assignTo: '' });
  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/workout-templates'),
      api.get('/pt/clients')
    ]).then(([wRes, cRes]) => {
      setWorkouts(Array.isArray(wRes.data) ? wRes.data : []);
      setClients(cRes.data?.clients || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error('Workout title required');
    if (exercises.length === 0) return toast.error('Add at least one exercise');
    try {
      const payload = { ...form, exercises: exercises.map((e, i) => ({ exercise_id: e.id, exercise_name: e.name, gif_file: e.gif_file, muscle_group: e.muscle_group, order_index: i, sets: e.sets || 3, reps: e.reps || 10, duration_seconds: e.duration_seconds || 30, rest_seconds: e.rest_seconds || 30 })) };
      if (editingWorkout) {
        await api.put(`/workout-templates/${editingWorkout.id}`, payload);
        toast.success('Workout updated!');
      } else {
        await api.post('/workout-templates', payload);
        toast.success('Workout created!');
      }
      if (form.assignTo) {
        const wRes = await api.get('/workout-templates');
        const newWorkout = wRes.data[wRes.data.length - 1];
        await api.post('/assigned-workouts', { client_id: form.assignTo, workout_template_id: newWorkout.id });
        toast.success('Assigned to client!');
      }
      const wRes = await api.get('/workout-templates');
      setWorkouts(Array.isArray(wRes.data) ? wRes.data : []);
      setShowBuilder(false);
      setForm({ title: '', description: '', difficulty: 'beginner', assignTo: '' });
      setExercises([]);
      setEditingWorkout(null);
    } catch { toast.error('Failed to save workout'); }
  };

  const addExercise = (ex) => {
    setExercises(prev => [...prev, { ...ex, sets: 3, reps: 10, duration_seconds: 30, rest_seconds: 30 }]);
    setShowPicker(false);
  };

  const removeExercise = (idx) => setExercises(prev => prev.filter((_, i) => i !== idx));

  if (loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-brazil-green border-t-transparent rounded-full animate-spin"/></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-grey-200 text-sm">{workouts.length} workout{workouts.length !== 1 ? 's' : ''}</p>
        <button onClick={() => { setShowBuilder(true); setEditingWorkout(null); setForm({ title: '', description: '', difficulty: 'beginner', assignTo: '' }); setExercises([]); }} className="flex items-center gap-2 bg-brazil-green text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brazil-green/90 transition"><Plus className="w-4 h-4" />New Workout</button>
      </div>

      {workouts.length === 0 ? <div className="text-center py-12 text-grey-200"><p>No workouts yet. Create your first one!</p></div> : workouts.map(w => (
        <div key={w.id} className="bg-dark-grey-100 rounded-xl border border-white/5 p-4">
          <div className="flex items-start justify-between">
            <div><p className="font-semibold text-white">{w.title}</p><p className="text-grey-200 text-sm mt-1">{w.description}</p><p className="text-brazil-green text-xs mt-2">{w.exercises?.length || 0} exercises · {w.difficulty}</p></div>
            <div className="flex gap-2">
              <button onClick={async () => { try { await api.delete(`/workout-templates/${w.id}`); setWorkouts(prev => prev.filter(x => x.id !== w.id)); toast.success('Deleted'); } catch { toast.error('Failed'); } }} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition"><Trash2 className="w-4 h-4"/></button>
            </div>
          </div>
        </div>
      ))}

      {showBuilder && (
        <div className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-dark-grey-100 rounded-xl border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <p className="font-semibold">{editingWorkout ? 'Edit Workout' : 'New Workout'}</p>
              <button onClick={() => setShowBuilder(false)}><X className="w-5 h-5 text-grey-200"/></button>
            </div>
            <div className="p-4 space-y-3">
              <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="Workout title" className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none"/>
              <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="Description (optional)" className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none resize-none h-20"/>
              <select value={form.difficulty} onChange={e => setForm(f => ({...f, difficulty: e.target.value}))} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <select value={form.assignTo} onChange={e => setForm(f => ({...f, assignTo: e.target.value}))} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none">
                <option value="">Assign to client (optional)</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-white font-medium">Exercises ({exercises.length})</p>
                  <button onClick={() => setShowPicker(true)} className="text-brazil-green text-sm flex items-center gap-1"><Plus className="w-3 h-3"/>Add Exercise</button>
                </div>
                {exercises.length === 0 ? <p className="text-grey-200 text-xs py-4 text-center border border-white/5 rounded-lg">No exercises added yet</p> : exercises.map((ex, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 bg-black/20 rounded-lg mb-2 border border-white/5">
                    <img src={GIF_BASE + ex.gif_file} alt={ex.name} className="w-10 h-10 rounded object-cover bg-black/30"/>
                    <div className="flex-1 min-w-0"><p className="text-sm text-white truncate">{ex.name}</p><p className="text-xs text-brazil-green">{ex.muscle_group}</p></div>
                    <button onClick={() => removeExercise(i)} className="text-red-400 hover:bg-red-400/10 p-1 rounded"><Trash2 className="w-3 h-3"/></button>
                  </div>
                ))}
              </div>
              <button onClick={handleSave} className="w-full py-3 bg-brazil-green text-white rounded-lg font-semibold hover:bg-brazil-green/90 transition"><Check className="w-4 h-4 inline mr-2"/>Save Workout</button>
            </di