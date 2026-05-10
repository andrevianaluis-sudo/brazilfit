import { useState, useEffect } from 'react';
import api from '../utils/api';

const GROUPS = ['All','Arms','Back','Calves','Chest','Full Body','Hips','Legs','Neck','Shoulders'];

export default function ExerciseLibrary() {
  const [stretches, setStretches] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [group, setGroup] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get('/stretches').then(r => {
      setStretches(r.data);
      setFiltered(r.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let f = stretches;
    if (group !== 'All') f = f.filter(s => s.muscle_group === group);
    if (search) f = f.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
    setFiltered(f);
  }, [group, search, stretches]);

  return (
    <div>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search stretches..." className="w-full bg-dark-grey-100 border border-white/10 rounded-lg px-4 py-2 text-white mb-4 outline-none" />
      <div className="flex gap-2 flex-wrap mb-4">
        {GROUPS.map(g => <button key={g} onClick={() => setGroup(g)} className={`px-3 py-1 rounded-full text-sm border ${group === g ? 'border-brazil-green bg-brazil-green/20 text-brazil-green' : 'border-white/10 text-grey-200'}`}>{g}</button>)}
      </div>
      <p className="text-grey-200 text-sm mb-4">{filtered.length} of {stretches.length} stretches</p>
      {loading ? <p className="text-grey-200 text-center py-8">Loading...</p> : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(s => (
            <div key={s.id} onClick={() => setSelected(selected?.id === s.id ? null : s)} className="bg-dark-grey-100 rounded-xl overflow-hidden border border-white/5 cursor-pointer hover:border-brazil-green/30 transition">
              <div className="aspect-square bg-black/20 overflow-hidden">
                <img src={`/exercise-gifs/${s.gif_file}`} alt={s.name} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="p-2">
                <p className="text-white text-xs font-medium leading-tight">{s.name}</p>
                <p className="text-brazil-green text-xs mt-1">{s.muscle_group}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-dark-grey-100 rounded-xl overflow-hidden max-w-sm w-full border border-white/10" onClick={e => e.stopPropagation()}>
            <img src={`/exercise-gifs/${selected.gif_file}`} alt={selected.name} className="w-full aspect-square object-cover" />
            <div className="p-4">
              <p className="text-white font-medium">{selected.name}</p>
              <p className="text-brazil-green text-sm mt-1">{selected.muscle_group}</p>
              <button onClick={() => setSelected(null)} className="w-full mt-3 py-2 bg-brazil-green text-white rounded-lg text-sm">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}