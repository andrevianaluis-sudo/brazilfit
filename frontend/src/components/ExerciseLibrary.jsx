// frontend/src/components/ExerciseLibrary.jsx
import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const TABS = [
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

function ExerciseCard({ exercise, onAdd }) {
  const [imgError, setImgError] = useState(false);
  const hasGif = exercise.gif_url && !imgError;
  const isStretching = exercise.category === 'Stretching' ||
    ['Neck', 'Shoulders', 'Back', 'Hips', 'Thighs', 'Calves', 'Forearms',
     'Waist', 'Chest', 'Upper Arms', 'Articulations', 'Pilates', 'Yoga'].includes(exercise.category);

  return (
    <div className="bg-dark-grey-100 rounded-[12px] overflow-hidden border border-white/5 hover:border-white/15 transition-all group">
      {/* GIF / Placeholder */}
      <div className="relative w-full aspect-square bg-grey-100 overflow-hidden">
        {hasGif ? (
          <img
            src={exercise.gif_url}
            alt={exercise.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <span className="text-4xl">{isStretching ? '🧘' : '💪'}</span>
            <span className="text-xs text-grey-200 text-center px-2">{exercise.category}</span>
          </div>
        )}
        {/* Category badge */}
        <div className="absolute top-2 left-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            isStretching
              ? 'bg-blue-500/80 text-white'
              : 'bg-brazil-orange/80 text-white'
          }`}>
            {exercise.category}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="font-bold text-sm text-white leading-tight mb-1">{exercise.name}</p>
        {exercise.muscle_groups && (
          <p className="text-xs text-grey-200 mb-2">{exercise.muscle_groups}</p>
        )}
        <div className="flex items-center gap-2">
          {exercise.difficulty && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
              exercise.difficulty === 'beginner' ? 'bg-brazil-green/20 text-brazil-green' :
              exercise.difficulty === 'advanced' ? 'bg-red-500/20 text-red-400' :
              'bg-yellow-500/20 text-yellow-400'
            }`}>
              {exercise.difficulty}
            </span>
          )}
          {exercise.equipment && exercise.equipment !== 'bodyweight' && (
            <span className="text-[10px] text-grey-200">{exercise.equipment}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ExerciseLibrary() {
  const [activeTab, setActiveTab] = useState('');
  const [search, setSearch] = useState('');
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const LIMIT = 30;

  const fetchExercises = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (activeTab) params.set('category', activeTab);
      params.set('limit', LIMIT);
      params.set('offset', reset ? 0 : page * LIMIT);

      const res = await api.get(`/exercises?${params}`);
      const data = res.data;
      const list = data.exercises || data || [];
      const tot = data.total || list.length;

      setTotal(tot);
      if (reset) {
        setExercises(list);
        setPage(0);
      } else {
        setExercises(prev => [...prev, ...list]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, activeTab, page]);

  // Reset and fetch when tab or search changes
  useEffect(() => {
    setPage(0);
    fetchExercises(true);
  }, [activeTab, search]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
  };

  useEffect(() => {
    if (page > 0) fetchExercises(false);
  }, [page]);

  return (
    <div>
      {/* Search */}
      <div className="mb-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search exercises..."
          className="w-full bg-dark-grey-100 border border-white/10 rounded-[10px] px-4 py-3 text-sm text-white placeholder-grey-200 focus:outline-none focus:border-brazil-orange transition-colors"
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-3 mb-5">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-shrink-0 text-xs font-semibold px-3 py-2 rounded-full transition-all ${
              activeTab === tab.key
                ? tab.key === 'Stretching' || ['Neck','Shoulders','Back','Hips','Thighs','Calves'].includes(tab.key)
                  ? 'bg-blue-500 text-white'
                  : 'bg-brazil-orange text-white'
                : 'bg-dark-grey-100 text-grey-200 hover:text-white border border-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-grey-200">
          {loading && exercises.length === 0 ? 'Loading...' : `${exercises.length}${total > exercises.length ? ` of ${total}` : ''} exercises`}
        </p>
        {activeTab === 'Stretching' || ['Neck','Shoulders','Back','Hips','Thighs','Calves'].includes(activeTab) ? (
          <span className="text-xs text-blue-400 font-semibold">🧘 Stretching & Mobility</span>
        ) : null}
      </div>

      {/* Grid */}
      {loading && exercises.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-dark-grey-100 rounded-[12px] aspect-square animate-pulse" />
          ))}
        </div>
      ) : exercises.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-grey-200 text-sm">No exercises found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {exercises.map(ex => (
              <ExerciseCard key={ex.id} exercise={ex} />
            ))}
          </div>

          {/* Load more */}
          {exercises.length < total && (
            <button
              onClick={loadMore}
              disabled={loading}
              className="w-full mt-5 py-3 border border-dashed border-white/15 rounded-[10px] text-sm text-grey-200 hover:text-white hover:border-white/30 transition-all disabled:opacity-50"
            >
              {loading ? 'Loading...' : `Load more (${total - exercises.length} remaining)`}
            </button>
          )}
        </>
      )}
    </div>
  );
}
