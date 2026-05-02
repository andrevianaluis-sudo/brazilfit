// frontend/src/components/ExercisePickerModal.jsx
import { useState, useEffect, useCallback } from 'react';
import { X, Plus, Search, Check } from 'lucide-react';
import api from '../utils/api';

const CATEGORIES = [
  { key: '', label: 'All' },
  { key: 'Push', label: 'Push' },
  { key: 'Pull', label: 'Pull' },
  { key: 'Legs', label: 'Legs' },
  { key: 'Core', label: 'Core' },
  { key: 'Cardio', label: 'Cardio' },
  { key: 'Stretching', label: '🧘 Stretch' },
  { key: 'Neck', label: 'Neck' },
  { key: 'Shoulders', label: 'Shoulders' },
  { key: 'Back', label: 'Back' },
  { key: 'Hips', label: 'Hips' },
  { key: 'Thighs', label: 'Thighs' },
  { key: 'Calves', label: 'Calves' },
];

const STRETCH_CATS = ['Stretching','Neck','Shoulders','Back','Hips','Thighs','Calves','Forearms','Waist','Upper Arms'];

export default function ExercisePickerModal({ onSelect, onClose, alreadyAdded = [] }) {
  const [exercises, setExercises] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchExercises = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      params.set('limit', '100');
      const res = await api.get(`/exercises?${params}`);
      setExercises(res.data?.exercises || res.data || []);
    } catch (err) {
      console.error('Failed to fetch exercises:', err);
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => { fetchExercises(); }, [fetchExercises]);

  const addedIds = new Set((alreadyAdded || []).map(e => e.exercise_id || e.id));
  const isStretch = (ex) => STRETCH_CATS.includes(ex.category);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'flex-end',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.75)',
      padding: '0 0 0 0'
    }}>
      <div style={{
        width: '100%', maxWidth: 480,
        background: '#1a1a1a',
        borderRadius: '16px 16px 0 0',
        border: '1px solid #2a2a2a',
        maxHeight: '88vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.5)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px 12px',
          borderBottom: '1px solid #2a2a2a'
        }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 16, color: '#fff', margin: 0 }}>Add Exercise</p>
            <p style={{ fontSize: 12, color: '#888', margin: '3px 0 0' }}>Search from your full library</p>
          </div>
          <button onClick={onClose} style={{
            background: '#2a2a2a', border: 'none', color: '#aaa',
            borderRadius: 8, width: 32, height: 32, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
          }}>✕</button>
        </div>

        {/* Search */}
        <div style={{ padding: '12px 16px 8px' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#666', fontSize: 16 }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search exercises..."
              style={{
                width: '100%', background: '#2a2a2a', border: '1px solid #333',
                borderRadius: 10, paddingLeft: 38, paddingRight: 14, paddingTop: 10, paddingBottom: 10,
                fontSize: 14, color: '#fff', outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Category tabs */}
        <div style={{
          display: 'flex', gap: 6, overflowX: 'auto', padding: '4px 16px 12px',
          scrollbarWidth: 'none'
        }}>
          {CATEGORIES.map(cat => {
            const isActive = category === cat.key;
            const isStretchTab = ['Stretching','Neck','Shoulders','Back','Hips','Thighs','Calves'].includes(cat.key);
            return (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                style={{
                  flexShrink: 0, fontSize: 12, fontWeight: 600,
                  padding: '6px 12px', borderRadius: 20, border: 'none',
                  cursor: 'pointer', transition: 'all 0.15s',
                  background: isActive
                    ? isStretchTab ? '#3B82F6' : '#FF6B2B'
                    : '#2a2a2a',
                  color: isActive ? '#fff' : '#888',
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Exercise list */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '0 12px 16px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 32 }}>
              <div style={{
                width: 28, height: 28, border: '3px solid #FF6B2B',
                borderTopColor: 'transparent', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite', margin: '0 auto'
              }} />
            </div>
          ) : exercises.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', padding: 32, fontSize: 14 }}>No exercises found</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {exercises.map(ex => {
                const added = addedIds.has(ex.id);
                const stretch = isStretch(ex);
                const accentColor = stretch ? '#3B82F6' : '#FF6B2B';
                return (
                  <button
                    key={ex.id}
                    onClick={() => !added && onSelect(ex)}
                    disabled={added}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 12px', borderRadius: 12, border: 'none',
                      background: added ? '#1a2a1a' : '#242424',
                      cursor: added ? 'default' : 'pointer',
                      textAlign: 'left', transition: 'background 0.15s',
                      width: '100%'
                    }}
                    onMouseEnter={e => { if (!added) e.currentTarget.style.background = '#2e2e2e'; }}
                    onMouseLeave={e => { if (!added) e.currentTarget.style.background = '#242424'; }}
                  >
                    {/* Thumbnail */}
                    <div style={{
                      width: 48, height: 48, borderRadius: 10, overflow: 'hidden',
                      background: ex.gif_url ? '#fff' : '#2a2a2a',
                      flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {ex.gif_url ? (
                        <img src={ex.gif_url} alt={ex.name}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          onError={e => { e.target.style.display = 'none'; }} />
                      ) : (
                        <span style={{ fontSize: 22 }}>{stretch ? '🧘' : '💪'}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: 14, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ex.name}
                      </p>
                      <div style={{ display: 'flex', gap: 6, marginTop: 3, alignItems: 'center' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: accentColor }}>
                          {ex.category}
                        </span>
                        {ex.muscle_groups && (
                          <span style={{ fontSize: 11, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {ex.muscle_groups}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action */}
                    {added ? (
                      <span style={{ color: '#4CAF50', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>✓</span>
                    ) : (
                      <div style={{
                        width: 28, height: 28, borderRadius: 8, background: accentColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                        <span style={{ color: '#fff', fontSize: 18, lineHeight: 1 }}>+</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
