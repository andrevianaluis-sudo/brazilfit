// frontend/src/components/ExercisePickerModal.jsx
import { useState, useEffect, useCallback } from 'react';
import { X, Plus, Search } from 'lucide-react';
import api from '../utils/api';

const CATEGORIES = [
  { key: '', label: 'All' },
  { key: 'Push', label: 'Push' },
  { key: 'Pull', label: 'Pull' },
  { key: 'Legs', label: 'Legs' },
  { key: 'Core', label: 'Core' },
  { key: 'Cardio', label: 'Cardio' },
  { key: 'Stretching', label: '🧘 Stretching' },
  { key: 'Neck', label: 'Neck' },
  { key: 'Shoulders', label: 'Shoulders' },
  { key: 'Back', label: 'Back' },
  { key: 'Hips', label: 'Hips' },
  { key: 'Thighs', label: 'Thighs' },
  { key: 'Calves', label: 'Calves' },
];

const STRETCHING_CATS = ['Stretching', 'Neck', 'Shoulders', 'Back', 'Hips', 'Thighs', 'Calves',
  'Forearms', 'Waist', 'Chest', 'Upper Arms', 'Articulations'];

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

  const getGifUrl = (ex) => {
    if (ex.gif_url) return ex.gif_url;
    return null;
  };

  const isStretching = (ex) => STRETCHING_CATS.includes(ex.category);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 px-4 pb-4 sm:pb-0">
      <div className="w-full max-w-lg bg-dark-grey-100 rounded-[16px] border border-white/10 shadow-2xl max-h-[88vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
          <div>
            <p className="font-bold text-base">Add Exercise</p>
            <p className="text-xs text-grey-200 mt-0.5">Search from your full library</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-5 h-5 text-grey-200" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pt-3 pb-2 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-200" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search exercises..."
              className="w-full bg-grey-100 border border-white/10 rounded-[10px] pl-9 pr-4 py-2.5 text-sm text-white placeholder-grey-200 focus:outline-none focus:border-brazil-orange"
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1.5 overflow-x-auto hide-scrollbar px-4 pb-3 flex-shrink-0">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                category === cat.key
                  ? ['Stretching','Neck','Shoulders','Back','Hips','Thighs','Calves'].includes(cat.key)
                    ? 'bg-blue-500 text-white'
                    : 'bg-brazil-orange text-white'
                  : 'bg-white/10 text-grey-200 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Exercise list */}
        <div className="overflow-y-auto flex-1 px-4 pb-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-4 border-brazil-orange border-t-transparent rounded-full animate-spin" />
            </div>
          ) : exercises.length === 0 ? (
            <div className="text-center py-10 text-grey-200 text-sm">No exercises found</div>
          ) : (
            <div className="space-y-1.5">
              {exercises.map(ex => {
                const gifUrl = getGifUrl(ex);
                const added = addedIds.has(ex.id);
                const stretching = isStretching(ex);
                return (
                  <button
                    key={ex.id}
                    onClick={() => !added && onSelect(ex)}
                    disabled={added}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-[10px] transition-all group ${
                      added ? 'bg-brazil-green/10 cursor-default' : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className={`w-12 h-12 rounded-[8px] overflow-hidden flex-shrink-0 flex items-center justify-center ${
                      gifUrl ? 'bg-white' : 'bg-white/10'
                    }`}>
                      {gifUrl ? (
                        <img
                          src={gifUrl}
                          alt={ex.name}
                          className="w-full h-full object-contain"
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <span className="text-xl">{stretching ? '🧘' : '💪'}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-white truncate">{ex.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-bold ${stretching ? 'text-blue-400' : 'text-brazil-orange'}`}>
                          {ex.category}
                        </span>
                        {ex.muscle_groups && (
                          <span className="text-[10px] text-grey-200 truncate">{ex.muscle_groups}</span>
                        )}
                      </div>
                    </div>

                    {/* Action */}
                    {added ? (
                      <span className="text-brazil-green text-xs font-bold flex-shrink-0">✓ Added</span>
                    ) : (
                      <Plus className="w-4 h-4 text-grey-200 group-hover:text-white flex-shrink-0 transition-colors" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
