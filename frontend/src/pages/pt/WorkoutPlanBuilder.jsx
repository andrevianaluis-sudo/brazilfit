// frontend/src/pages/pt/WorkoutPlanBuilder.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || '';

const GIF_BASE = '/exercise-gifs/';

function getGifUrl(exercise) {
  if (!exercise) return null;
  if (exercise.gif_url) return exercise.gif_url;
  const slug = (exercise.name || exercise.exercise_name || '')
    .toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return slug ? `${GIF_BASE}${slug}.gif` : null;
}

// ─── Exercise Search Modal ────────────────────────────────────────────────────
function ExerciseSearchModal({ onAdd, onClose, alreadyAdded = [] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set('search', query);
      if (category) params.set('category', category);
      params.set('limit', '40');
      const res = await fetch(`${API}/api/exercises?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setExercises(data.exercises || data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [query, category]);

  useEffect(() => { search(); }, [search]);

  const addedIds = new Set(alreadyAdded.map(e => e.exercise_id));

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#1a1a1a', borderRadius: 16, width: '100%', maxWidth: 660, maxHeight: '88vh', display: 'flex', flexDirection: 'column', border: '1px solid #2a2a2a', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>Add Exercise</div>
            <div style={{ color: '#888', fontSize: 12, marginTop: 2 }}>Pick from your exercise library</div>
          </div>
          <button onClick={onClose} style={{ background: '#2a2a2a', border: 'none', color: '#aaa', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        {/* Search */}
        <div style={{ padding: '12px 20px', display: 'flex', gap: 8, borderBottom: '1px solid #222' }}>
          <input
            value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search exercises..."
            style={{ flex: 1, background: '#2a2a2a', border: '1px solid #333', borderRadius: 8, color: '#fff', padding: '9px 12px', fontSize: 14, outline: 'none' }}
          />
          <select value={category} onChange={e => setCategory(e.target.value)}
            style={{ background: '#2a2a2a', border: '1px solid #333', borderRadius: 8, color: category ? '#fff' : '#888', padding: '9px 12px', fontSize: 14, cursor: 'pointer' }}>
            <option value="">All</option>
            {['Push', 'Pull', 'Legs', 'Core', 'Cardio', 'Compound', 'Isolation'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* List */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 32, color: '#888' }}>Loading...</div>
          ) : exercises.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32, color: '#888' }}>No exercises found</div>
          ) : exercises.map(ex => {
            const gifUrl = getGifUrl(ex);
            const added = addedIds.has(ex.id);
            return (
              <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderBottom: '1px solid #1e1e1e', background: added ? '#1a2a1a' : 'transparent', transition: 'background 0.15s', cursor: added ? 'default' : 'pointer' }}
                onMouseEnter={e => { if (!added) e.currentTarget.style.background = '#222'; }}
                onMouseLeave={e => { if (!added) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ width: 46, height: 46, borderRadius: 8, overflow: 'hidden', background: '#2a2a2a', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {gifUrl ? <img src={gifUrl} alt={ex.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} /> : <span style={{ fontSize: 20 }}>💪</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.name}</div>
                  <div style={{ fontSize: 12, marginTop: 2 }}>
                    {ex.category && <span style={{ color: '#FF6B2B', marginRight: 8 }}>{ex.category}</span>}
                    <span style={{ color: '#666' }}>{ex.muscle_groups}</span>
                  </div>
                </div>
                <button onClick={() => !added && onAdd(ex)} style={{ background: added ? '#1e3a1e' : '#FF6B2B', color: added ? '#4CAF50' : '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 700, cursor: added ? 'default' : 'pointer', flexShrink: 0 }}>
                  {added ? '✓' : '+ Add'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Exercise Row ─────────────────────────────────────────────────────────────
function ExerciseRow({ ex, index, total, onChange, onRemove, onMoveUp, onMoveDown }) {
  const gifUrl = getGifUrl(ex);
  return (
    <div style={{ background: '#242424', borderRadius: 10, padding: 12, display: 'flex', gap: 10, alignItems: 'flex-start', border: '1px solid #2e2e2e' }}>
      {/* Order controls */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, paddingTop: 2, minWidth: 20 }}>
        <span style={{ color: '#FF6B2B', fontWeight: 700, fontSize: 12 }}>{index + 1}</span>
        <button onClick={onMoveUp} disabled={index === 0} style={{ background: 'none', border: 'none', color: index === 0 ? '#333' : '#666', cursor: index === 0 ? 'default' : 'pointer', padding: 0, fontSize: 14, lineHeight: 1 }}>▲</button>
        <button onClick={onMoveDown} disabled={index === total - 1} style={{ background: 'none', border: 'none', color: index === total - 1 ? '#333' : '#666', cursor: index === total - 1 ? 'default' : 'pointer', padding: 0, fontSize: 14, lineHeight: 1 }}>▼</button>
      </div>

      {/* GIF */}
      <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', background: '#2a2a2a', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {gifUrl ? <img src={gifUrl} alt={ex.exercise_name || ex.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} /> : <span style={{ fontSize: 22 }}>💪</span>}
      </div>

      {/* Info + inputs */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: '#fff', fontWeight: 600, fontSize: 14, marginBottom: 8 }}>{ex.exercise_name || ex.name}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
          <div>
            <div style={{ color: '#666', fontSize: 10, marginBottom: 3 }}>SETS</div>
            <input type="number" min="1" max="20" value={ex.sets}
              onChange={e => onChange({ ...ex, sets: parseInt(e.target.value) || 1 })}
              style={{ width: '100%', background: '#1a1a1a', border: '1px solid #333', borderRadius: 6, color: '#fff', padding: '6px 8px', fontSize: 13, boxSizing: 'border-box' }} />
          </div>
          <div>
            <div style={{ color: '#666', fontSize: 10, marginBottom: 3 }}>REPS</div>
            <input type="text" value={ex.reps} placeholder="10"
              onChange={e => onChange({ ...ex, reps: e.target.value })}
              style={{ width: '100%', background: '#1a1a1a', border: '1px solid #333', borderRadius: 6, color: '#fff', padding: '6px 8px', fontSize: 13, boxSizing: 'border-box' }} />
          </div>
          <div>
            <div style={{ color: '#666', fontSize: 10, marginBottom: 3 }}>REST (s)</div>
            <input type="number" min="0" step="15" value={ex.rest_seconds}
              onChange={e => onChange({ ...ex, rest_seconds: parseInt(e.target.value) || 0 })}
              style={{ width: '100%', background: '#1a1a1a', border: '1px solid #333', borderRadius: 6, color: '#fff', padding: '6px 8px', fontSize: 13, boxSizing: 'border-box' }} />
          </div>
        </div>
        <input type="text" value={ex.notes || ''} placeholder="Notes (optional)..."
          onChange={e => onChange({ ...ex, notes: e.target.value })}
          style={{ marginTop: 6, width: '100%', background: '#1a1a1a', border: '1px solid #333', borderRadius: 6, color: '#fff', padding: '6px 8px', fontSize: 12, boxSizing: 'border-box' }} />
      </div>

      <button onClick={onRemove} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 16, paddingTop: 2 }}
        onMouseEnter={e => e.target.style.color = '#ff4444'}
        onMouseLeave={e => e.target.style.color = '#555'}>✕</button>
    </div>
  );
}

// ─── Day Card ─────────────────────────────────────────────────────────────────
function DayCard({ day, dayIndex, totalDays, onChange, onRemove, onMoveUp, onMoveDown }) {
  const [showSearch, setShowSearch] = useState(false);

  const addExercise = (ex) => {
    const updated = {
      ...day,
      exercises: [...day.exercises, {
        exercise_id: ex.id,
        exercise_name: ex.name,
        name: ex.name,
        gif_url: ex.gif_url,
        muscle_groups: ex.muscle_groups,
        category: ex.category,
        sets: 3,
        reps: '10',
        rest_seconds: 60,
        notes: ''
      }]
    };
    onChange(updated);
  };

  const updateExercise = (idx, updated) => {
    onChange({ ...day, exercises: day.exercises.map((e, i) => i === idx ? updated : e) });
  };

  const removeExercise = (idx) => {
    onChange({ ...day, exercises: day.exercises.filter((_, i) => i !== idx) });
  };

  const moveExercise = (idx, dir) => {
    const arr = [...day.exercises];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    onChange({ ...day, exercises: arr });
  };

  return (
    <div style={{ background: '#1a1a1a', borderRadius: 14, border: '1px solid #2a2a2a', overflow: 'hidden', marginBottom: 12 }}>
      {/* Day Header */}
      <div style={{ background: '#1e1e1e', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #2a2a2a' }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: '#FF6B2B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
          {dayIndex + 1}
        </div>
        <input
          value={day.day_name}
          onChange={e => onChange({ ...day, day_name: e.target.value })}
          placeholder="Day name (e.g. Push Day, Legs)"
          style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: 15, fontWeight: 600, outline: 'none' }}
        />
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={onMoveUp} disabled={dayIndex === 0} style={{ background: 'none', border: 'none', color: dayIndex === 0 ? '#333' : '#666', cursor: dayIndex === 0 ? 'default' : 'pointer', fontSize: 14 }}>▲</button>
          <button onClick={onMoveDown} disabled={dayIndex === totalDays - 1} style={{ background: 'none', border: 'none', color: dayIndex === totalDays - 1 ? '#333' : '#666', cursor: dayIndex === totalDays - 1 ? 'default' : 'pointer', fontSize: 14 }}>▼</button>
          <button onClick={onRemove} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 16, marginLeft: 4 }}
            onMouseEnter={e => e.target.style.color = '#ff4444'}
            onMouseLeave={e => e.target.style.color = '#555'}>🗑</button>
        </div>
      </div>

      {/* Exercises */}
      <div style={{ padding: 12 }}>
        {day.exercises.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '16px 0', color: '#555', fontSize: 13 }}>No exercises yet — add some below</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
            {day.exercises.map((ex, idx) => (
              <ExerciseRow key={`${ex.exercise_id}-${idx}`} ex={ex} index={idx} total={day.exercises.length}
                onChange={updated => updateExercise(idx, updated)}
                onRemove={() => removeExercise(idx)}
                onMoveUp={() => moveExercise(idx, -1)}
                onMoveDown={() => moveExercise(idx, 1)}
              />
            ))}
          </div>
        )}
        <button onClick={() => setShowSearch(true)}
          style={{ width: '100%', background: 'transparent', border: '1px dashed #333', borderRadius: 8, color: '#888', padding: '8px', fontSize: 13, cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
          onMouseEnter={e => { e.target.style.borderColor = '#FF6B2B'; e.target.style.color = '#FF6B2B'; }}
          onMouseLeave={e => { e.target.style.borderColor = '#333'; e.target.style.color = '#888'; }}>
          + Add Exercise
        </button>
      </div>

      {showSearch && (
        <ExerciseSearchModal
          onAdd={ex => { addExercise(ex); }}
          onClose={() => setShowSearch(false)}
          alreadyAdded={day.exercises}
        />
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function WorkoutPlanBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [planName, setPlanName] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState('');
  const [clients, setClients] = useState([]);
  const [days, setDays] = useState([{ day_name: 'Day 1', exercises: [] }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Load clients for assignment dropdown
  useEffect(() => {
    fetch(`${API}/api/pt/clients`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(r => r.json()).then(data => setClients(data.clients || data || [])).catch(console.error);
  }, []);

  // Load existing plan if editing
  useEffect(() => {
    if (!isEditing) return;
    fetch(`${API}/api/workouts/plans/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(r => r.json()).then(data => {
      setPlanName(data.name || '');
      setDescription(data.description || '');
      setClientId(data.client_id || '');
      setDays((data.days || []).map(d => ({
        day_name: d.day_name,
        exercises: (d.exercises || []).map(ex => ({
          exercise_id: ex.exercise_id,
          exercise_name: ex.exercise_name,
          name: ex.exercise_name,
          sets: ex.sets,
          reps: ex.reps,
          rest_seconds: ex.rest_seconds,
          notes: ex.notes || ''
        }))
      })));
    }).catch(console.error);
  }, [id, isEditing]);

  const addDay = () => {
    setDays(prev => [...prev, { day_name: `Day ${prev.length + 1}`, exercises: [] }]);
  };

  const updateDay = (idx, updated) => setDays(prev => prev.map((d, i) => i === idx ? updated : d));
  const removeDay = (idx) => setDays(prev => prev.filter((_, i) => i !== idx));
  const moveDay = (idx, dir) => {
    const arr = [...days];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    setDays(arr);
  };

  const totalExercises = days.reduce((sum, d) => sum + d.exercises.length, 0);

  const handleSave = async () => {
    if (!planName.trim()) { setError('Plan name is required'); return; }
    if (days.length === 0) { setError('Add at least one day'); return; }
    setError('');
    setSaving(true);
    try {
      const payload = {
        name: planName,
        description,
        client_id: clientId || null,
        days
      };
      const url = isEditing ? `${API}/api/workouts/plans/${id}` : `${API}/api/workouts/plans`;
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed');
      navigate('/pt/workouts');
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#141414', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      {/* Sticky Header */}
      <div style={{ background: '#1a1a1a', borderBottom: '1px solid #2a2a2a', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, position: 'sticky', top: 0, zIndex: 100 }}>
        <button onClick={() => navigate('/pt/workouts')}
          style={{ background: '#2a2a2a', border: 'none', color: '#fff', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 16 }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>{isEditing ? 'Edit Plan' : 'New Workout Plan'}</div>
          <div style={{ color: '#888', fontSize: 12 }}>{days.length} day{days.length !== 1 ? 's' : ''} · {totalExercises} exercise{totalExercises !== 1 ? 's' : ''}</div>
        </div>
        <button onClick={handleSave} disabled={saving}
          style={{ background: saving ? '#333' : '#FF6B2B', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 22px', fontSize: 14, fontWeight: 700, cursor: saving ? 'default' : 'pointer' }}>
          {saving ? 'Saving...' : isEditing ? 'Update' : 'Save Plan'}
        </button>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '20px 16px' }}>
        {error && (
          <div style={{ background: '#3a1515', border: '1px solid #ff4444', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#ff8080', fontSize: 14 }}>⚠️ {error}</div>
        )}

        {/* Plan Details */}
        <div style={{ background: '#1e1e1e', borderRadius: 14, padding: 18, marginBottom: 18, border: '1px solid #2a2a2a' }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Plan Details</div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ color: '#888', fontSize: 11, marginBottom: 5 }}>PLAN NAME *</div>
            <input value={planName} onChange={e => setPlanName(e.target.value)} placeholder="e.g. 4-Week Strength Program"
              style={{ width: '100%', background: '#2a2a2a', border: '1px solid #333', borderRadius: 8, color: '#fff', padding: '10px 12px', fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ color: '#888', fontSize: 11, marginBottom: 5 }}>DESCRIPTION</div>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
              placeholder="What's the goal of this plan?"
              style={{ width: '100%', background: '#2a2a2a', border: '1px solid #333', borderRadius: 8, color: '#fff', padding: '10px 12px', fontSize: 13, boxSizing: 'border-box', resize: 'vertical', outline: 'none', fontFamily: 'inherit' }} />
          </div>

          <div>
            <div style={{ color: '#888', fontSize: 11, marginBottom: 5 }}>ASSIGN TO CLIENT (optional)</div>
            <select value={clientId} onChange={e => setClientId(e.target.value)}
              style={{ width: '100%', background: '#2a2a2a', border: '1px solid #333', borderRadius: 8, color: clientId ? '#fff' : '#888', padding: '10px 12px', fontSize: 14, cursor: 'pointer', boxSizing: 'border-box' }}>
              <option value="">No client assigned yet</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {/* Days */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Training Days <span style={{ color: '#FF6B2B' }}>({days.length})</span></div>
          <button onClick={addDay}
            style={{ background: '#2a2a2a', border: 'none', color: '#fff', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Add Day</button>
        </div>

        {days.length === 0 ? (
          <div style={{ border: '2px dashed #2a2a2a', borderRadius: 14, padding: 40, textAlign: 'center', color: '#555' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>No days yet</div>
            <div style={{ fontSize: 13 }}>Click "+ Add Day" to start building</div>
          </div>
        ) : (
          days.map((day, idx) => (
            <DayCard key={idx} day={day} dayIndex={idx} totalDays={days.length}
              onChange={updated => updateDay(idx, updated)}
              onRemove={() => removeDay(idx)}
              onMoveUp={() => moveDay(idx, -1)}
              onMoveDown={() => moveDay(idx, 1)}
            />
          ))
        )}

        {days.length > 0 && (
          <button onClick={addDay}
            style={{ width: '100%', background: 'transparent', border: '2px dashed #2a2a2a', borderRadius: 12, color: '#666', padding: 14, fontSize: 14, cursor: 'pointer', fontWeight: 600, marginBottom: 20, transition: 'all 0.2s' }}
            onMouseEnter={e => { e.target.style.borderColor = '#FF6B2B'; e.target.style.color = '#FF6B2B'; }}
            onMouseLeave={e => { e.target.style.borderColor = '#2a2a2a'; e.target.style.color = '#666'; }}>
            + Add Another Day
          </button>
        )}

        {/* Bottom save */}
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button onClick={() => navigate('/pt/workouts')}
            style={{ flex: 1, background: '#2a2a2a', border: 'none', color: '#fff', borderRadius: 12, padding: 14, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
          <button onClick={handleSave} disabled={saving}
            style={{ flex: 2, background: saving ? '#333' : '#FF6B2B', border: 'none', color: '#fff', borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 700, cursor: saving ? 'default' : 'pointer' }}>
            {saving ? 'Saving...' : isEditing ? '✓ Update Plan' : '✓ Save Plan'}
          </button>
        </div>
      </div>
    </div>
  );
}
