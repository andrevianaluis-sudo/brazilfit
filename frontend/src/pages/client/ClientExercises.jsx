import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search, X, Sliders } from 'lucide-react';

const CATEGORIES = ['ALL', 'STRENGTH', 'CARDIO', 'PILATES', 'MOBILITY', 'HIIT', 'DANCE', 'MEDITATION'];

const WORKOUTS = [
  { id: 1, category: 'STRENGTH', title: 'Power Session', duration: 45, difficulty: 'advanced', equipment: 'Full gym' },
  { id: 2, category: 'CARDIO', title: 'HIIT Burnout', duration: 30, difficulty: 'advanced', equipment: 'No equipment' },
  { id: 3, category: 'PILATES', title: 'Flow & Stretch', duration: 40, difficulty: 'intermediate', equipment: 'No equipment' },
  { id: 4, category: 'STRENGTH', title: 'Compound Lifts', duration: 50, difficulty: 'advanced', equipment: 'Full gym' },
  { id: 5, category: 'MOBILITY', title: 'Mobility Work', duration: 30, difficulty: 'beginner', equipment: 'No equipment' },
  { id: 6, category: 'HIIT', title: 'Interval Training', duration: 25, difficulty: 'advanced', equipment: 'No equipment' },
];

export default function ClientExercises() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedCategories, setSelectedCategories] = useState(['ALL']);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [durationFilter, setDurationFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  const toggleCategory = (cat) => {
    if (cat === 'ALL') {
      setSelectedCategories(['ALL']);
    } else {
      let newCategories = selectedCategories.filter(c => c !== 'ALL');
      if (newCategories.includes(cat)) {
        newCategories = newCategories.filter(c => c !== cat);
      } else {
        newCategories.push(cat);
      }
      setSelectedCategories(newCategories.length === 0 ? ['ALL'] : newCategories);
    }
  };

  const filteredWorkouts = WORKOUTS.filter(w => {
    const matchesCategory = selectedCategories.includes('ALL') || selectedCategories.includes(w.category);
    const matchesDuration =
      durationFilter === 'all' ||
      (durationFilter === '<15' && w.duration < 15) ||
      (durationFilter === '15-30' && w.duration >= 15 && w.duration <= 30) ||
      (durationFilter === '30-45' && w.duration > 30 && w.duration <= 45) ||
      (durationFilter === '>45' && w.duration > 45);
    const matchesDifficulty = difficultyFilter === 'all' || w.difficulty === difficultyFilter;
    return matchesCategory && matchesDuration && matchesDifficulty;
  });

  return (
    <div className="w-full bg-white min-h-screen pb-24 animate-fade-in">
      {/* Featured card with Pilates image */}
      <div className="px-5 pt-6 pb-6">
        <div
          className="relative w-full h-40 rounded-[12px] overflow-hidden mb-6"
          style={{
            backgroundImage: 'url(/images/newcastle-86.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-grey-1005" />
        </div>
      </div>

      {/* Search bar and filters header */}
      <div className="px-5 pb-6 border-b border-grey-100 space-y-4">
        {/* Search bar */}
        <button
          onClick={() => navigate('/client/search')}
          className="w-full flex items-center gap-3 bg-grey-300 hover:bg-white rounded-full px-4 py-3 transition-colors"
        >
          <Search className="w-5 h-5 text-grey-200" />
          <p className="text-grey-200 text-sm">Search workouts...</p>
        </button>

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase transition-all whitespace-nowrap ${
                selectedCategories.includes(cat)
                  ? 'bg-brazil-green text-white'
                  : 'bg-grey-300 text-grey-200 hover:bg-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Advanced filters button */}
        <button
          onClick={() => setShowFilters(true)}
          className="w-full flex items-center justify-center gap-2 bg-grey-300 hover:bg-white text-black px-4 py-2 rounded-[8px] transition-colors text-sm font-bold"
        >
          <Sliders className="w-4 h-4" />
          ADVANCED FILTERS
        </button>
      </div>

      {/* Workout grid */}
      <div className="px-5 pt-6 pb-12">
        <div className="grid grid-cols-2 gap-3">
          {filteredWorkouts.map((workout) => (
            <button
              key={workout.id}
              onClick={() => setSelectedWorkout(workout)}
              className="exercise-card"
              style={{
                backgroundColor: 'var(--color-card)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                border: '1px solid var(--color-grey-light)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'var(--transition-normal)'
              }}
            >
              <p className="exercise-category-badge">{workout.category}</p>
              <p className="exercise-title">{workout.title}</p>
              <p className="exercise-meta">{workout.duration} min</p>
              <p className="exercise-meta" style={{ textTransform: 'capitalize' }}>{workout.difficulty}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Detail modal */}
      {selectedWorkout && (
        <div className="workout-modal">
          <div className="workout-modal-content">
            <button
              onClick={() => setSelectedWorkout(null)}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                padding: '0.5rem',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#6b7280',
                transition: 'color var(--transition-fast)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#1a1a1a'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
            >
              <X className="w-6 h-6" />
            </button>
            <div style={{ textAlign: 'center', paddingTop: '1rem' }}>
              <h2 className="workout-modal-title" style={{ textTransform: 'uppercase' }}>{selectedWorkout.title}</h2>
              <p className="workout-modal-meta">{selectedWorkout.duration} min • {selectedWorkout.difficulty}</p>
              <button className="btn btn-primary">
                START WORKOUT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Filters Bottom Sheet */}
      {showFilters && (
        <div className="fixed inset-0 z-50 bg-grey-1000 flex items-end">
          <div className="w-full bg-white rounded-t-[16px] p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-black">Filters</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 hover:bg-grey-300 transition rounded-full"
              >
                <X className="w-5 h-5 text-black" />
              </button>
            </div>

            {/* Duration */}
            <div>
              <h3 className="text-black text-sm font-bold mb-3">Duration</h3>
              <div className="space-y-2">
                {[
                  { label: 'All', value: 'all' },
                  { label: 'Under 15 min', value: '<15' },
                  { label: '15 to 30 min', value: '15-30' },
                  { label: '30 to 45 min', value: '30-45' },
                  { label: 'Over 45 min', value: '>45' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setDurationFilter(opt.value)}
                    className={`w-full text-left px-4 py-2 rounded-[8px] transition-colors ${
                      durationFilter === opt.value
                        ? 'bg-brazil-green text-white'
                        : 'bg-grey-300 text-grey-200 hover:bg-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <h3 className="text-black text-sm font-bold mb-3">Difficulty</h3>
              <div className="space-y-2">
                {[
                  { label: 'All', value: 'all' },
                  { label: 'Beginner', value: 'beginner' },
                  { label: 'Intermediate', value: 'intermediate' },
                  { label: 'Advanced', value: 'advanced' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setDifficultyFilter(opt.value)}
                    className={`w-full text-left px-4 py-2 rounded-[8px] transition-colors ${
                      difficultyFilter === opt.value
                        ? 'bg-brazil-green text-white'
                        : 'bg-grey-300 text-grey-200 hover:bg-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setDurationFilter('all');
                  setDifficultyFilter('all');
                }}
                className="flex-1 bg-grey-300 hover:bg-white text-black font-bold py-3 rounded-[8px] transition-colors"
              >
                RESET
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 bg-brazil-green hover:bg-brazil-green-dark text-black font-bold py-3 rounded-[8px] transition-colors"
              >
                APPLY
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
