import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import api from '../utils/api';
import StretchDetailModal from './StretchDetailModal';

const MUSCLE_GROUPS = [
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

export default function StretchLibrary() {
  const [stretches, setStretches] = useState([]);
  const [filteredStretches, setFilteredStretches] = useState([]);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStretch, setSelectedStretch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStretches();
  }, []);

  useEffect(() => {
    filterStretches();
  }, [stretches, selectedMuscleGroup, searchTerm]);

  async function fetchStretches() {
    try {
      setLoading(true);
      const res = await api.get('/stretches');
      setStretches(res.data || []);
    } catch (err) {
      console.error('Failed to fetch stretches:', err);
    } finally {
      setLoading(false);
    }
  }

  function filterStretches() {
    let filtered = stretches;

    if (selectedMuscleGroup !== 'All') {
      filtered = filtered.filter(s => s.muscle_group === selectedMuscleGroup);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s => s.name.toLowerCase().includes(term));
    }

    setFilteredStretches(filtered);
  }

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-grey-100" />
          <input
            type="text"
            placeholder="Search stretches..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
      </div>

      {/* Muscle Group Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar pb-2">
        {MUSCLE_GROUPS.map(group => (
          <button
            key={group}
            onClick={() => setSelectedMuscleGroup(group)}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap category-btn-transition ${
              selectedMuscleGroup === group
                ? 'bg-brazil-green text-white'
                : 'bg-white text-grey-200 border border-grey-100 hover:bg-grey-100'
            }`}
          >
            {group}
          </button>
        ))}
      </div>

      {/* Stretch Grid */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-grey-200">Loading stretches...</p>
        </div>
      ) : filteredStretches.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center border border-grey-100">
          <p className="text-grey-200">No stretches found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {filteredStretches.map((stretch, idx) => (
            <div
              key={stretch.id}
              style={{ animationDelay: `${idx * 50}ms` }}
              className="bg-white rounded-[16px] overflow-hidden border border-grey-100 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 exercise-card-enter"
              onClick={() => setSelectedStretch(stretch)}
            >
              {/* Stretch GIF */}
              <div className="w-full aspect-square bg-white flex items-center justify-center overflow-hidden">
                <img
                  src={`/exercise-gifs/${stretch.gif_file}`}
                  alt={stretch.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Card Content */}
              <div className="p-4">
                <h3 className="font-bold text-black mb-2 text-sm">{stretch.name}</h3>

                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-brazil-green/10 text-brazil-green px-2.5 py-1 rounded-full font-semibold">
                    {stretch.muscle_group}
                  </span>
                  <span className="text-xs bg-brazil-green/10 text-brazil-green px-2.5 py-1 rounded-full font-semibold">
                    {stretch.difficulty}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedStretch && (
        <StretchDetailModal
          stretch={selectedStretch}
          onClose={() => setSelectedStretch(null)}
        />
      )}
    </div>
  );
}
