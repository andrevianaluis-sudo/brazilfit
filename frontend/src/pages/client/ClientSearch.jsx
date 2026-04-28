import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Clock } from 'lucide-react';

const RECENT_SEARCHES = ['Push-ups', 'Yoga', 'HIIT Cardio'];
const POPULAR_SEARCHES = ['Pilates', 'Meditation', 'Strength', 'Flexibility', 'Dance', 'Core'];

const MOCK_DATA = {
  exercises: [
    { id: 1, name: 'Push-ups', category: 'STRENGTH', icon: '💪' },
    { id: 2, name: 'Yoga Flow', category: 'YOGA', icon: '🧘' },
    { id: 3, name: 'HIIT Cardio', category: 'CARDIO', icon: '🏃' },
    { id: 4, name: 'Pilates Core', category: 'PILATES', icon: '🤸' },
  ],
  classes: [
    { id: 1, name: 'Morning Pilates', category: 'CLASS', icon: '👥' },
    { id: 2, name: 'Dance Cardio', category: 'CLASS', icon: '💃' },
  ],
  nutrition: [
    { id: 1, name: 'High Protein Meal Prep', category: 'NUTRITION', icon: '🥗' },
    { id: 2, name: 'Pre-Workout Nutrition', category: 'NUTRITION', icon: '🍌' },
  ],
};

export default function ClientSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    const filtered = {
      exercises: MOCK_DATA.exercises.filter(e => e.name.toLowerCase().includes(query.toLowerCase())),
      classes: MOCK_DATA.classes.filter(c => c.name.toLowerCase().includes(query.toLowerCase())),
      nutrition: MOCK_DATA.nutrition.filter(n => n.name.toLowerCase().includes(query.toLowerCase())),
    };

    setResults(filtered);
  }, [query]);

  return (
    <div className="fixed inset-0 bg-white w-full h-full z-50 flex flex-col pb-24">
      {/* Search Bar */}
      <div className="px-5 pt-4 pb-6 border-b border-grey-100 sticky top-0 bg-white z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-grey-300 transition rounded-full flex-shrink-0">
            <X className="w-6 h-6 text-black" />
          </button>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-grey-200" />
            <input
              type="text"
              placeholder="Search workouts, classes..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
              className="w-full bg-grey-300 border-0 text-black placeholder-gray-400 rounded-full pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brazil-green/50"
            />
          </div>
        </div>
      </div>

      {/* Results or Empty State */}
      <div className="flex-1 overflow-y-auto">
        {!query.trim() ? (
          <div className="px-5 py-6">
            {/* Recent Searches */}
            <div className="mb-8">
              <h3 className="text-black text-xs font-bold uppercase tracking-widest mb-3 text-grey-200">Recent</h3>
              <div className="flex flex-wrap gap-2">
                {RECENT_SEARCHES.map((search, i) => (
                  <button
                    key={i}
                    onClick={() => setQuery(search)}
                    className="flex items-center gap-2 bg-grey-300 hover:bg-white text-black px-3 py-2 rounded-full text-sm active:scale-95 transition-transform"
                  >
                    <Clock className="w-3 h-3 text-grey-200" />
                    {search}
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Searches */}
            <div>
              <h3 className="text-black text-xs font-bold uppercase tracking-widest mb-3 text-grey-200">Popular</h3>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((search, i) => (
                  <button
                    key={i}
                    onClick={() => setQuery(search)}
                    className="bg-transparent border border-gray-600 hover:border-brazil-green text-grey-200 hover:text-black px-3 py-2 rounded-full text-sm active:scale-95 transition-all"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : results ? (
          <div className="px-5 py-6 space-y-6">
            {/* Exercises */}
            {results.exercises.length > 0 && (
              <div>
                <h4 className="text-grey-200 text-xs font-bold uppercase tracking-widest mb-3">Exercises</h4>
                <div className="space-y-2">
                  {results.exercises.map(item => (
                    <button
                      key={item.id}
                      onClick={() => navigate('/client/exercises')}
                      className="w-full flex items-center gap-3 p-3 bg-grey-300 hover:bg-white rounded-[8px] active:scale-95 transition-transform text-left"
                    >
                      <span className="text-xl">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-black font-bold text-sm">{item.name}</p>
                        <p className="text-grey-200 text-xs">{item.category}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Classes */}
            {results.classes.length > 0 && (
              <div>
                <h4 className="text-grey-200 text-xs font-bold uppercase tracking-widest mb-3">Classes</h4>
                <div className="space-y-2">
                  {results.classes.map(item => (
                    <button
                      key={item.id}
                      onClick={() => navigate('/client/exercises')}
                      className="w-full flex items-center gap-3 p-3 bg-grey-300 hover:bg-white rounded-[8px] active:scale-95 transition-transform text-left"
                    >
                      <span className="text-xl">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-black font-bold text-sm">{item.name}</p>
                        <p className="text-grey-200 text-xs">{item.category}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Nutrition */}
            {results.nutrition.length > 0 && (
              <div>
                <h4 className="text-grey-200 text-xs font-bold uppercase tracking-widest mb-3">Nutrition Tips</h4>
                <div className="space-y-2">
                  {results.nutrition.map(item => (
                    <button
                      key={item.id}
                      onClick={() => navigate('/client/exercises')}
                      className="w-full flex items-center gap-3 p-3 bg-grey-300 hover:bg-white rounded-[8px] active:scale-95 transition-transform text-left"
                    >
                      <span className="text-xl">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-black font-bold text-sm">{item.name}</p>
                        <p className="text-grey-200 text-xs">{item.category}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {Object.values(results).every(arr => arr.length === 0) && (
              <div className="text-center py-12">
                <p className="text-grey-200 text-sm">No results found for "{query}"</p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
