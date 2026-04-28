import { useState, useEffect } from 'react';
import { X, Search, Plus } from 'lucide-react';
import api from '../utils/api';

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

export default function ExercisePickerModal({ onSelect, onClose }) {
  const [stretchingExercises, setStretchingExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExercises();
  }, []);

  useEffect(() => {
    filterExercises();
  }, [stretchingExercises, selectedCategory, searchTerm]);

  async function fetchExercises() {
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
      console.error('Failed to fetch exercises:', err);
    } finally {
      setLoading(false);
    }
  }

  function filterExercises() {
    let filtered = stretchingExercises;

    // Filter by stretching category
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
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60">
      <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl border border-grey-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-grey-100">
          <h2 className="text-xl font-black text-black">Select Stretching Exercise</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-grey-100 rounded-lg transition-all"
          >
            <X className="w-6 h-6 text-grey-200" />
          </button>
        </div>

        {/* Search */}
        <div className="p-5 border-b border-grey-100 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-100" />
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-grey-100 rounded-lg focus:outline-none focus:border-brazil-green/50"
            />
          </div>

          {/* Category Filter - Stretching only */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {STRETCHING_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded text-xs font-semibold whitespace-nowrap category-btn-transition ${
                  selectedCategory === cat
                    ? 'bg-brazil-green text-white'
                    : 'bg-grey-100 text-grey-200 hover:bg-grey-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise List with GIFs */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-grey-200">Loading exercises...</p>
            </div>
          ) : filteredExercises.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-grey-200">No stretching exercises found</p>
            </div>
          ) : (
            <div className="divide-y divide-grey-100">
              {filteredExercises.map(exercise => (
                <div
                  key={exercise.id}
                  className="p-4 hover:bg-grey-100 transition-all cursor-pointer group"
                  onClick={() => onSelect(exercise)}
                >
                  {/* GIF thumbnail - Crisp rendering */}
                  {exercise.filename && (
                    <div className="w-full h-24 bg-white rounded-lg mb-2 flex items-center justify-center overflow-hidden border border-grey-100">
                      <img
                        src={`/exercise-gifs/${exercise.filename}`}
                        alt={exercise.name}
                        className="w-full h-full object-contain"
                        style={{ imageRendering: 'crisp-edges' }}
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Exercise info */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-black group-hover:text-brazil-green transition-all text-sm">
                        {exercise.name}
                      </h4>
                      <p className="text-xs text-grey-200 mt-1">
                        {exercise.category}
                      </p>
                    </div>
                    <Plus className="w-5 h-5 text-grey-100 group-hover:text-brazil-green transition-all ml-2 flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
