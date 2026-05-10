// frontend/src/pages/pt/WorkoutBuilder.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || '';

const DIFFICULTY_OPTIONS = ['beginner', 'intermediate', 'advanced'];

const GIF_BASE = '/exercise-gifs/';

function getGifUrl(exercise) {
  if (!exercise) return null;
  if (exercise.gif_url) return exercise.gif_url;
  // Try to build from name
  const slug = exercise.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return slug ? `${GIF_BASE}${slug}.gif` : null;
}

// ─── Exercise Search Modal ────────────────────────────────────────────────────
function ExerciseSearchModal({ onAdd, onClose, alreadyAdded }) {
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
      const res = await fetch('/api/stretches', { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });
      const data = await res.json();
      setExercises(Array.isArray(data) ? data : []);



    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [query, category]);

  useEffect(() => { search(); }, [search]);

  const addedIds = new Set(alreadyAdded.map(e => e.exercise_id));

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#1a1a1a', borderRadius: 16, width: '100%', maxWidth: 680,
        maxHeight: '85vh', display: 'flex', flexDirection: 'column',
        border: '1px solid #2a2a2a', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ color: '#fff', margin: 0, fontSize: 18, fontWeight: 700 }}>Add Exercise</h3>
            <p style={{ color: '#888', margin: '4px 0 0', fontSize: 13 }}>Search from your exercise library</p>
          </div>
          <button onClick={onClose} style={{ background: '#2a2a2a', border: 'none', color: '#fff', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>

        {/* Filters */}
        <div style={{ padding: '16px 24px', display: 'flex', gap: 10, borderBottom: '1px solid #2a2a2a' }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search exercises..."
            style={{
              flex: 1, background: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: 8,
              color: '#fff', padding: '10px 14px', fontSize: 14, outline: 'none'
            }}
          />
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            style={{
              background: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: 8,
              color: category ? '#fff' : '#888', padding: '10px 14px', fontSize: 14, cursor: 'pointer'
            }}
          >
          <option value=''>All Stretches</option>




        </div>

        {/* Exercise List */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Searching...</div>
          ) : exercises.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>No exercises found</div>
          ) : (
            exercises.map(ex => {
              const gifUrl = getGifUrl(ex);
              const alreadyIn = addedIds.has(ex.id);
              return (
                <div key={ex.id} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 24px', borderBottom: '1px solid #222',
                  transition: 'background 0.15s',
                  background: alreadyIn ? '#1f2a1f' : 'transparent',
                  cursor: alreadyIn ? 'default' : 'pointer'
                }}
                  onMouseEnter={e => { if (!alreadyIn) e.currentTarget.style.background = '#222'; }}
                  onMouseLeave={e => { if (!alreadyIn) e.currentTarget.style.background = 'transparent'; }}
                >
                  {/* GIF thumbnail */}
                  <div style={{
                    width: 52, height: 52, borderRadius: 8, overflow: 'hidden',
                    background: '#2a2a2a', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {gifUrl ? (
                      <img src={gifUrl} alt={ex.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { e.target.style.display = 'none'; }} />
                    ) : (
                      <span style={{ fontSize: 22 }}>💪</span>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ex.name}</div>
                    <div style={{ color: '#888', fontSize: 12, marginTop: 2 }}>
                      {ex.category && <span style={{ color: '#FF6B2B', marginRight: 8 }}>{ex.category}</span>}
                      {ex.muscle_groups && <span>{ex.muscle_groups}</span>}
                    </div>
                  </div>

                  {/* Add button */}
                  <button
                    onClick={() => !alreadyIn && onAdd(ex)}
                    style={{
                      background: alreadyIn ? '#2a3a2a' : '#FF6B2B',
                      color: alreadyIn ? '#4CAF50' : '#fff',
                      border: 'none', borderRadius: 8, padding: '8px 16px',
                      fontSize: 13, fontWeight: 600, cursor: alreadyIn ? 'default' : 'pointer',
                      flexShrink: 0, transition: 'background 0.2s'
                    }}
                  >
                    {alreadyIn ? '✓ Added' : '+ Add'}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Exercise Row in Builder ──────────────────────────────────────────────────
function ExerciseRow({ ex, index, total, onChange, onRemove, onMoveUp, onMoveDown }) {
  const gifUrl = getGifUrl(ex);

  return (
    <div style={{
      background: '#1e1e1e', borderRadius: 12, padding: 16, border: '1px solid #2a2a2a',
      display: 'flex', gap: 14, alignItems: 'flex-start'
    }}>
      {/* Order + Move */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, paddingTop: 4 }}>
        <span style={{ color: '#FF6B2B', fontWeight: 700, fontSize: 13 }}>{index + 1}</span>
        <button onClick={onMoveUp} disabled={index === 0}
          style={{ background: 'none', border: 'none', color: index === 0 ? '#444' : '#888', cursor: index === 0 ? 'default' : 'pointer', padding: 0, fontSize: 16, lineHeight: 1 }}>▲</button>
        <button onClick={onMoveDown} disabled={index === total - 1}
          style={{ background: 'none', border: 'none', color: index === total - 1 ? '#444' : '#888', cursor: index === total - 1 ? 'default' : 'pointer', padding: 0, fontSize: 16, lineHeight: 1 }}>▼</button>
      </div>

      {/* GIF */}
      <div style={{ width: 56, height: 56, borderRadius: 8, overflow: 'hidden', background: '#2a2a2a', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {gifUrl ? (
          <img src={gifUrl} alt={ex.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { e.target.style.display = 'none'; }} />
        ) : <span style={{ fontSize: 24 }}>💪</span>}
      </div>

      {/* Details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 10 }}>{ex.name}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {/* Sets */}
          <div>
            <label style={{ color: '#888', fontSize: 11, display: 'block', marginBottom: 4 }}>SETS</label>
            <input
              type="number" min="1" max="20"
              value={ex.sets}
              onChange={e => onChange({ ...ex, sets: parseInt(e.target.value) || 1 })}
              style={{ width: '100%', background: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: 6, color: '#fff', padding: '7px 10px', fontSize: 14, boxSizing: 'border-box' }}
            />
          </div>
          {/* Reps */}
          <div>
            <label style={{ color: '#888', fontSize: 11, display: 'block', marginBottom: 4 }}>REPS</label>
            <input
              type="text"
              value={ex.reps}
              onChange={e => onChange({ ...ex, reps: e.target.value })}
              placeholder="10 or 8-12"
              style={{ width: '100%', background: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: 6, color: '#fff', padding: '7px 10px', fontSize: 14, boxSizing: 'border-box' }}
            />
          </div>
          {/* Rest */}
          <div>
            <label style={{ color: '#888', fontSize: 11, display: 'block', marginBottom: 4 }}>REST (sec)</label>
            <input
              type="number" min="0" step="15"
              value={ex.rest_seconds}
              onChange={e => onChange({ ...ex, rest_seconds: parseInt(e.target.value) || 0 })}
              style={{ width: '100%', background: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: 6, color: '#fff', padding: '7px 10px', fontSize: 14, boxSizing: 'border-box' }}
            />
          </div>
        </div>
        {/* Notes */}
        <input
          type="text"
          value={ex.notes || ''}
          onChange={e => onChange({ ...ex, notes: e.target.value })}
          placeholder="Notes (optional)..."
          style={{ marginTop: 8, width: '100%', background: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: 6, color: '#fff', padding: '7px 10px', fontSize: 13, boxSizing: 'border-box' }}
        />
      </div>

      {/* Remove */}
      <button onClick={onRemove}
        style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 18, paddingTop: 4, flexShrink: 0 }}
        onMouseEnter={e => e.target.style.color = '#ff4444'}
        onMouseLeave={e => e.target.style.color = '#666'}
      >✕</button>
    </div>
  );
}

// ─── Main WorkoutBuilder Page ─────────────────────────────────────────────────
export default function WorkoutBuilder() {
  const { id } = useParams(); // If editing
  const navigate = useNavigate();
  const isEditing = !!id;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [duration, setDuration] = useState(45);
  const [exercises, setExercises] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Load existing workout if editing
  useEffect(() => {
    if (!isEditing) return;
    fetch(`${API}/api/workouts/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(r => r.json())
      .then(data => {
        const w = data.workout;
        setName(w.name);
        setDescription(w.description || '');
        setDifficulty(w.difficulty || 'intermediate');
        setDuration(w.estimated_duration || 45);
        setExercises((w.exercises || []).map(ex => ({
          exercise_id: ex.exercise_id,
          name: ex.name,
          gif_url: ex.gif_url,
          muscle_groups: ex.muscle_groups,
          category: ex.category,
          sets: ex.sets,
          reps: ex.reps,
          rest_seconds: ex.rest_seconds,
          notes: ex.notes || ''
        })));
      })
      .catch(console.error);
  }, [id, isEditing]);

  const addExercise = (ex) => {
    setExercises(prev => [...prev, {
      exercise_id: ex.id,
      name: ex.name,
      gif_url: ex.gif_url,
      muscle_groups: ex.muscle_groups,
      category: ex.category,
      sets: 3,
      reps: ex.default_sets_reps ? ex.default_sets_reps.split('x')[1] || '10' : '10',
      rest_seconds: 60,
      notes: ''
    }]);
  };

  const updateExercise = (index, updated) => {
    setExercises(prev => prev.map((e, i) => i === index ? updated : e));
  };

  const removeExercise = (index) => {
    setExercises(prev => prev.filter((_, i) => i !== index));
  };

  const moveExercise = (index, direction) => {
    const newArr = [...exercises];
    const target = index + direction;
    if (target < 0 || target >= newArr.length) return;
    [newArr[index], newArr[target]] = [newArr[target], newArr[index]];
    setExercises(newArr);
  };

  const handleSave = async () => {
    if (!name.trim()) { setError('Workout name is required'); return; }
    if (exercises.length === 0) { setError('Add at least one exercise'); return; }
    setError('');
    setSaving(true);
    try {
      const payload = { name, description, difficulty, estimated_duration: duration, exercises };
      const url = isEditing ? `${API}/api/workouts/${id}` : `${API}/api/workouts`;
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to save');
      navigate('/pt/workouts');
    } catch (err) {
      setError('Failed to save workout. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const estimatedTime = exercises.reduce((acc, ex) => {
    const setTime = (ex.sets || 3) * 45; // ~45s per set
    const restTime = (ex.sets - 1) * (ex.rest_seconds || 60);
    return acc + setTime + restTime;
  }, 0);

  return (
    <div style={{ minHeight: '100vh', background: '#141414', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#1a1a1a', borderBottom: '1px solid #2a2a2a', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16, position: 'sticky', top: 0, zIndex: 100 }}>
        <button onClick={() => navigate('/pt/workouts')}
          style={{ background: '#2a2a2a', border: 'none', color: '#fff', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 16 }}>←</button>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
            {isEditing ? 'Edit Workout' : 'Create Workout'}
          </h1>
          <p style={{ margin: '2px 0 0', color: '#888', fontSize: 13 }}>
            {exercises.length} exercise{exercises.length !== 1 ? 's' : ''} · ~{Math.round(estimatedTime / 60)} min
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            background: saving ? '#333' : '#FF6B2B', color: '#fff', border: 'none',
            borderRadius: 10, padding: '10px 24px', fontSize: 15, fontWeight: 700,
            cursor: saving ? 'default' : 'pointer', transition: 'background 0.2s'
          }}
        >
          {saving ? 'Saving...' : isEditing ? 'Update' : 'Save Workout'}
        </button>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
        {/* Error */}
        {error && (
          <div style={{ background: '#3a1515', border: '1px solid #ff4444', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#ff6b6b', fontSize: 14 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Workout Info */}
        <div style={{ background: '#1e1e1e', borderRadius: 14, padding: 20, marginBottom: 20, border: '1px solid #2a2a2a' }}>
          <h2 style={{ color: '#fff', margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>Workout Details</h2>

          <div style={{ marginBottom: 14 }}>
            <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 6 }}>WORKOUT NAME *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Upper Body Power"
              style={{ width: '100%', background: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: 8, color: '#fff', padding: '11px 14px', fontSize: 15, boxSizing: 'border-box', outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 6 }}>DESCRIPTION</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What's this workout for? Any notes for the client..."
              rows={2}
              style={{ width: '100%', background: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: 8, color: '#fff', padding: '11px 14px', fontSize: 14, boxSizing: 'border-box', resize: 'vertical', outline: 'none', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 6 }}>DIFFICULTY</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value)}
                style={{ width: '100%', background: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: 8, color: '#fff', padding: '11px 14px', fontSize: 14, cursor: 'pointer', boxSizing: 'border-box' }}
              >
                {DIFFICULTY_OPTIONS.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 6 }}>EST. DURATION (min)</label>
              <input
                type="number" min="5" max="180"
                value={duration}
                onChange={e => setDuration(parseInt(e.target.value) || 45)}
                style={{ width: '100%', background: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: 8, color: '#fff', padding: '11px 14px', fontSize: 14, boxSizing: 'border-box' }}
              />
            </div>
          </div>
        </div>

        {/* Exercise List */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ color: '#fff', margin: 0, fontSize: 16, fontWeight: 700 }}>
              Exercises <span style={{ color: '#FF6B2B' }}>({exercises.length})</span>
            </h2>
            <button
              onClick={() => setShowSearch(true)}
              style={{
                background: '#FF6B2B', color: '#fff', border: 'none', borderRadius: 10,
                padding: '9px 18px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              + Add Exercise
            </button>
          </div>

          {exercises.length === 0 ? (
            <div style={{
              border: '2px dashed #2a2a2a', borderRadius: 14, padding: 40,
              textAlign: 'center', color: '#555'
            }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🏋️</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No exercises yet</div>
              <div style={{ fontSize: 13 }}>Click "+ Add Exercise" to build your workout</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {exercises.map((ex, idx) => (
                <ExerciseRow
                  key={`${ex.exercise_id}-${idx}`}
                  ex={ex}
                  index={idx}
                  total={exercises.length}
                  onChange={updated => updateExercise(idx, updated)}
                  onRemove={() => removeExercise(idx)}
                  onMoveUp={() => moveExercise(idx, -1)}
                  onMoveDown={() => moveExercise(idx, 1)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add more button at bottom */}
        {exercises.length > 0 && (
          <button
            onClick={() => setShowSearch(true)}
            style={{
              width: '100%', background: '#1e1e1e', border: '2px dashed #3a3a3a',
              color: '#888', borderRadius: 12, padding: '14px', fontSize: 14,
              cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.target.style.borderColor = '#FF6B2B'; e.target.style.color = '#FF6B2B'; }}
            onMouseLeave={e => { e.target.style.borderColor = '#3a3a3a'; e.target.style.color = '#888'; }}
          >
            + Add Another Exercise
          </button>
        )}

        {/* Save at bottom too */}
        <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/pt/workouts')}
            style={{ flex: 1, background: '#2a2a2a', border: 'none', color: '#fff', borderRadius: 12, padding: 14, fontSize: 15, cursor: 'pointer', fontWeight: 600 }}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ flex: 2, background: saving ? '#333' : '#FF6B2B', border: 'none', color: '#fff', borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 700, cursor: saving ? 'default' : 'pointer' }}
          >
            {saving ? 'Saving...' : isEditing ? '✓ Update Workout' : '✓ Save Workout'}
          </button>
        </div>
      </div>

      {/* Exercise Search Modal */}
      {showSearch && (
        <ExerciseSearchModal
          onAdd={(ex) => { addExercise(ex); }}
          onClose={() => setShowSearch(false)}
          alreadyAdded={exercises}
        />
      )}
    </div>
  );
}
