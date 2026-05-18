import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { parseGifFilename, getUniqueMuscleGroups } from '../utils/gifParser';
import StretchDetailModal from './StretchDetailModal';

export default function StretchingLibrary() {
  const [stretches, setStretches] = useState([]);
  const [filteredStretches, setFilteredStretches] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStretch, setSelectedStretch] = useState(null);
  const [muscleGroups, setMuscleGroups] = useState(['All']);

  useEffect(() => {
    loadGifs();
  }, []);

  useEffect(() => {
    filterStretches();
  }, [stretches, selectedCategory, searchTerm]);

  async function loadGifs() {
    try {
      const response = await fetch('/exercise-gifs/mapping.json');
      const gifMapping = await response.json();

      const parsed = gifMapping.map(item => ({
        ...item,
        ...parseGifFilename(item.filename)
      }));

      setStretches(parsed);
      setMuscleGroups(getUniqueMuscleGroups(parsed));
    } catch (err) {
      console.error('Failed to load GIFs:', err);
    }
  }

  function filterStretches() {
    let filtered = stretches;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s => s.name.toLowerCase().includes(term));
    }

    setFilteredStretches(filtered);
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-grey-100" />
        <input
          type="text"
          placeholder="Search stretches..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-grey-100 rounded-lg focus:outline-none focus:border-brazil-green/50"
        />
      </div>

      {/* Muscle Group Filter */}
      <div className="flex gap-2 flex-wrap">
        {muscleGroups.map(group => (
          <button
            key={group}
            onClick={() => setSelectedCategory(group)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              selectedCategory === group
                ? 'bg-brazil-green text-white'
                : 'bg-white border border-grey-100 text-grey-200 hover:bg-grey-100'
            }`}
          >
            {group}
          </button>
        ))}
      </div>

      {/* Stretch Grid - Compact Cards */}
      {stretches.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-grey-200">Loading stretches...</p>
        </div>
      ) : filteredStretches.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center border border-grey-100">
          <p className="text-grey-200">No stretches found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredStretches.map((stretch, idx) => (
            <div
              key={stretch.filename}
              style={{ animationDelay: `${idx * 30}ms` }}
              className="bg-white rounded-[8px] overflow-hidden border border-grey-100 cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all duration-200 exercise-card-enter"
              onClick={() => setSelectedStretch(stretch)}
            >
              {/* GIF Container - 180px max height */}
              <div className="w-full h-[180px] bg-white flex items-center justify-center overflow-hidden border-b border-grey-100">
                <img
                  src={`/exercise-gifs/${stretch.filename}`}
                  alt={stretch.name}
                  className="w-full h-full object-contain bg-white"
                  loading="lazy"
                />
              </div>

              {/* Card Content - Compact */}
              <div className="p-3">
                <h3 className="font-semibold text-black text-sm leading-tight mb-2">
                  {stretch.name}
                </h3>
                <span className="inline-block text-xs bg-[#e8f5f0] text-[#2d7a5c] px-2 py-1 rounded-full font-semibold">
                  {stretch.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedStretch && (
        <StretchDetailModal stretch={selectedStretch} onClose={() => setSelectedStretch(null)} />
      )}
    </div>
  );
}

