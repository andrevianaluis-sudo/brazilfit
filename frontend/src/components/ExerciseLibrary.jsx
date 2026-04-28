import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import api from '../utils/api';
import StretchDetailModal from './StretchDetailModal';

// Strength exercises hidden until GIFs are added
const STRETCHING_CATEGORIES = [
  'All',
  'Neck',
  'Shoulders',
  'Back',
  'Arms',
  'Chest',
  'Hips',
  'Legs',
  'Calves',
  'Full Body'
];

export default function ExerciseLibrary() {
  const [stretchingExercises, setStretchingExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    filterExercises();
  }, [stretchingExercises, selectedCategory, searchTerm]);

  useEffect(() => {
    window.addEventListener('exerciseLibraryRefresh', loadExercises);
    return () => window.removeEventListener('exerciseLibraryRefresh', loadExercises);
  }, []);

  async function loadExercises() {
    try {
      setLoading(true);

      // Load stretching exercises from database with GIF filenames
      const stretchRes = await api.get('/exercises/stretching/all');
      const gifRes = await fetch('/exercise-gifs/mapping.json');
      const gifMapping = await gifRes.json();

      // Create a map of exercise names to filenames
      const nameToFilename = {};
      gifMapping.forEach(item => {
        nameToFilename[item.exerciseName] = item.filename;
      });

      const stretchingExercises = (stretchRes.data || []).map(ex => ({
        ...ex,
        type: 'stretching',
        filename: nameToFilename[ex.name] || null
      }));

      setStretchingExercises(stretchingExercises);
    } catch (err) {
      console.error('Failed to load exercises:', err);
    } finally {
      setLoading(false);
    }
  }

  function filterExercises() {
    let filtered = [...stretchingExercises];

    // Filter by category (only for stretching)
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(ex => ex.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(ex => ex.name.toLowerCase().includes(term));
    }

    setFilteredExercises(filtered);
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-grey-100" />
        <input
          type="text"
          placeholder="Search stretching exercises..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-grey-100 rounded-lg focus:outline-none focus:border-brazil-green/50"
        />
      </div>

      {/* Category Filter - Stretching only */}
      <div className="flex gap-2 flex-wrap">
        {STRETCHING_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              selectedCategory === cat
                ? 'bg-brazil-green text-white'
                : 'bg-white border border-grey-100 text-grey-200 hover:bg-grey-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Exercise Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-grey-200">Loading stretching exercises...</p>
        </div>
      ) : filteredExercises.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center border border-grey-100">
          <p className="text-grey-200">No stretching exercises found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExercises.map((exercise, idx) => (
            <div
              key={`${exercise.id}-${exercise.filename}`}
              style={{ animationDelay: `${idx * 30}ms` }}
              className="bg-white rounded-[12px] overflow-hidden border border-grey-100 cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:shadow-brazil-green/20 transition-all duration-300 exercise-card-enter"
              onClick={() => setSelectedExercise(exercise)}
            >
              {/* Animated GIF - Fixed 160px height, crisp rendering */}
              <div className="w-full h-[160px] bg-white flex items-center justify-center overflow-hidden border-b border-grey-100">
                {exercise.filename && (
                  <img
                    src={`/exercise-gifs/${exercise.filename}`}
                    alt={exercise.name}
                    className="w-full h-full object-contain bg-white"
                    style={{ imageRendering: 'crisp-edges' }}
                    loading="lazy"
                  />
                )}
              </div>

              {/* Card Content */}
              <div className="p-4">
                <h3 className="font-bold text-black text-sm leading-tight mb-3">
                  {exercise.name}
                </h3>

                {/* Muscle Group Badge */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-brazil-green/20 text-brazil-green px-3 py-1.5 rounded-full font-semibold">
                    {exercise.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedExercise && (
        <StretchDetailModal stretch={selectedExercise} onClose={() => setSelectedExercise(null)} />
      )}
    </div>
  );
}
