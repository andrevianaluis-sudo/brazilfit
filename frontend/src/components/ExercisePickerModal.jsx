// frontend/src/components/ExercisePickerModal.jsx
import { useState, useEffect, useCallback } from 'react';
import { X, Plus, Search, ChevronLeft } from 'lucide-react';
import api from '../utils/api';

const CATEGORIES = [
  { key: '', label: 'All' },
  { key: 'Arms', label: 'Arms' },
  { key: 'Back', label: 'Back' },
  { key: 'Calves', label: 'Calves' },
  { key: 'Chest', label: 'Chest' },
  { key: 'Full Body', label: 'Full Body' },
  { key: 'Hips', label: 'Hips' },
  { key: 'Legs', label: 'Legs' },
  { key: 'Neck', label: 'Neck' },
  { key: 'Shoulders', label: 'Shoulders' },
  { key: 'Shoulders', label: 'Shoulders' },
];



const STRETCH_CATS = ['Stretching','Neck','Shoulders','Back','Hips','Thighs','Calves','Forearms','Waist','Upper Arms'];

// ─── Exercise Detail Preview ──────────────────────────────────────────────────
function ExerciseDetail({ exercise, onAdd, onBack, alreadyAdded }) {
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState('10');
  const [rest, setRest] = useState(60);
  const added = alreadyAdded;
  const stretch = STRETCH_CATS.includes(exercise.category);
  const accent = stretch ? '#3B82F6' : '#FF6B2B';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Back button */}
      <div style={{ padding: '12px 16px 0', flexShrink: 0 }}>
        <button onClick={onBack} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 14, fontWeight: 600
        }}>
          <ChevronLeft size={18} /> Back to list
        </button>
      </div>

      {/* Scrollable content */}
      <div style={{ overflowY: 'auto', flex: 1, padding: '12px 16px 16px' }}>
        {/* GIF */}
        <div style={{
          width: '100%', aspectRatio: '1', maxHeight: 280,
          borderRadius: 16, overflow: 'hidden', background: exercise.gif_url ? '#fff' : '#2a2a2a',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16
        }}>
          {exercise.gif_file ? (
            <img src={'/exercise-gifs/' + exercise.gif_file} alt={exercise.name}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              onError={e => { e.target.style.display = 'none'; }} />
          ) : (
            <span style={{ fontSize: 64 }}>{stretch ? '🧘' : '💪'}</span>
          )}
        </div>

        {/* Name & category */}
        <h3 style={{ color: '#fff', fontWeight: 800, fontSize: 20, margin: '0 0 4px' }}>{exercise.name}</h3>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: accent }}>{exercise.category}</span>
          {exercise.muscle_groups && (
            <span style={{ fontSize: 12, color: '#666' }}>{exercise.muscle_groups}</span>
          )}
          {exercise.difficulty && (
            <span style={{ fontSize: 11, fontWeight: 600, color: '#888', background: '#2a2a2a', padding: '2px 8px', borderRadius: 20 }}>{exercise.difficulty}</span>
          )}
        </div>

        {/* Sets/Reps/Rest inputs */}
        <div style={{ background: '#242424', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <p style={{ color: '#888', fontSize: 12, fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Configure</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ color: '#666', fontSize: 11, display: 'block', marginBottom: 5 }}>SETS</label>
              <input type="number" min="1" max="20" value={sets}
                onChange={e => setSets(parseInt(e.target.value) || 1)}
                style={{ width: '100%', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#fff', padding: '10px 8px', fontSize: 16, textAlign: 'center', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ color: '#666', fontSize: 11, display: 'block', marginBottom: 5 }}>REPS</label>
              <input type="text" value={reps}
                onChange={e => setReps(e.target.value)}
                style={{ width: '100%', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#fff', padding: '10px 8px', fontSize: 16, textAlign: 'center', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ color: '#666', fontSize: 11, display: 'block', marginBottom: 5 }}>REST (s)</label>
              <input type="number" min="0" step="15" value={rest}
                onChange={e => setRest(parseInt(e.target.value) || 0)}
                style={{ width: '100%', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#fff', padding: '10px 8px', fontSize: 16, textAlign: 'center', boxSizing: 'border-box' }} />
            </div>
          </div>
        </div>

        {/* Instructions if available */}
        {exercise.instructions && exercise.instructions !== '[]' && (
          <div style={{ background: '#242424', borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <p style={{ color: '#888', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Instructions</p>
            <p style={{ color: '#ccc', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{exercise.instructions}</p>
          </div>
        )}
      </div>

      {/* Add button */}
      <div style={{ padding: '12px 16px 20px', flexShrink: 0, borderTop: '1px solid #2a2a2a' }}>
        {added ? (
          <div style={{ background: '#1a2a1a', borderRadius: 12, padding: 16, textAlign: 'center', color: '#4CAF50', fontWeight: 700 }}>
            ✓ Already in workout
          </div>
        ) : (
          <button
            onClick={() => onAdd(exercise, { sets, reps, rest_seconds: rest })}
            style={{
              width: '100%', background: accent, color: '#fff', border: 'none',
              borderRadius: 12, padding: '16px', fontSize: 16, fontWeight: 800,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}
          >
            <Plus size={20} /> Add to Workout
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function ExercisePickerModal({ onSelect, onClose, alreadyAdded = [] }) {
  const [exercises, setExercises] = useState([]);
  const [search, setSearch] = useState('');
  const [allStretches, setAllStretches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [category, setCategory] = useState('');
  useEffect(() => {
    api.get('/stretches').then(r => { setAllStretches(r.data||[]); setExercises(r.data||[]); }).catch(()=>{});
  }, []);

  useEffect(() => {
    let f = allStretches;
    if (category) f = f.filter(s => s.muscle_group === category);
    if (search) f = f.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
    setExercises(f);
  }, [category, search, allStretches]);








  const addedIds = new Set((alreadyAdded || []).map(e => e.exercise_id || e.id));
  const isStretch = (ex) => STRETCH_CATS.includes(ex.category);

  const handleAdd = (exercise, config) => {
    onSelect({ ...exercise, ...config });
    setSelected(null);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      background: 'rgba(0,0,0,0.75)'
    }}>
      <div style={{
        width: '100%', maxWidth: 480,
        background: '#1a1a1a',
        borderRadius: '16px 16px 0 0',
        border: '1px solid #2a2a2a',
        maxHeight: '92vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.5)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px 12px', borderBottom: '1px solid #2a2a2a', flexShrink: 0
        }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 16, color: '#fff', margin: 0 }}>
              {selected ? selected.name : 'Add Exercise'}
            </p>
            <p style={{ fontSize: 12, color: '#888', margin: '3px 0 0' }}>
              {selected ? 'Configure and add to workout' : 'Tap an exercise to preview'}
            </p>
          </div>
          <button onClick={onClose} style={{
            background: '#2a2a2a', border: 'none', color: '#aaa',
            borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16
          }}>✕</button>
        </div>

        {/* Detail view or list view */}
        {selected ? (
          <ExerciseDetail
            exercise={selected}
            onAdd={handleAdd}
            onBack={() => setSelected(null)}
            alreadyAdded={addedIds.has(selected.id)}
          />
        ) : (
          <>
            {/* Search */}
            <div style={{ padding: '12px 16px 8px', flexShrink: 0 }}>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search exercises..."
                style={{
                  width: '100%', background: '#2a2a2a', border: '1px solid #333',
                  borderRadius: 10, padding: '10px 14px', fontSize: 14, color: '#fff',
                  outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Category tabs - wrap */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 6,
              padding: '4px 16px 10px', flexShrink: 0
            }}>
              {CATEGORIES.map(cat => {
                const isActive = category === cat.key;
                const isStretchTab = ['Stretching','Neck','Shoulders','Back','Hips','Thighs','Calves'].includes(cat.key);
                return (
                  <button key={cat.key} onClick={() => setCategory(cat.key)} style={{
                    flexShrink: 0, fontSize: 12, fontWeight: 600,
                    padding: '5px 11px', borderRadius: 20, border: 'none', cursor: 'pointer',
                    background: isActive ? (isStretchTab ? '#3B82F6' : '#FF6B2B') : '#2a2a2a',
                    color: isActive ? '#fff' : '#888',
                  }}>
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Exercise list */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '0 12px 16px' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: 32, color: '#666' }}>Loading...</div>
              ) : exercises.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#666', padding: 32 }}>No exercises found</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {exercises.map(ex => {
                    const added = addedIds.has(ex.id);
                    const stretch = isStretch(ex);
                    const accent = stretch ? '#3B82F6' : '#FF6B2B';
                    return (
                      <button key={ex.id} onClick={() => setSelected(ex)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '10px 12px', borderRadius: 12, border: 'none',
                          background: added ? '#1a2a1a' : '#242424',
                          cursor: 'pointer', textAlign: 'left', width: '100%',
                          transition: 'background 0.15s'
                        }}
                        onMouseEnter={e => { if (!added) e.currentTarget.style.background = '#2e2e2e'; }}
                        onMouseLeave={e => { if (!added) e.currentTarget.style.background = added ? '#1a2a1a' : '#242424'; }}
                      >
                        {/* Thumbnail */}
                        <div style={{
                          width: 52, height: 52, borderRadius: 10, overflow: 'hidden',
          background: ex.gif_file ? '#fff' : '#2a2a2a',
                          flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
          {ex.gif_file ? (
            <img src={'/exercise-gifs/' + ex.gif_file} alt={ex.name}
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                              onError={e => { e.target.style.display = 'none'; }} />
                          ) : (
                            <span style={{ fontSize: 24 }}>{stretch ? '🧘' : '💪'}</span>
                          )}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 600, fontSize: 14, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.name}</p>
                          <div style={{ display: 'flex', gap: 6, marginTop: 3 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: accent }}>{ex.category}</span>
                            {ex.muscle_groups && <span style={{ fontSize: 11, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.muscle_groups}</span>}
                          </div>
                        </div>

                        {/* Status */}
                        {added ? (
                          <span style={{ color: '#4CAF50', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>✓</span>
                        ) : (
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ color: '#888', fontSize: 18 }}>›</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
