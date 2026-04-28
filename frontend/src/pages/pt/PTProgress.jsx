import { useState, useEffect } from 'react';
import { TrendingDown, TrendingUp, Minus, Search } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function PTProgress() {
  const [clients, setClients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/pt/progress').then(r => {
      setClients(r.data);
      setLoading(false);
    }).catch(() => {
      toast.error('Failed to load progress data');
      setLoading(false);
    });
  }, []);

  const loadDetail = async (clientId) => {
    try {
      const res = await api.get(`/progress/${clientId}`);
      setDetail(res.data);
    } catch {
      toast.error('Failed to load detail');
    }
  };

  const handleSelect = (client) => {
    if (selected?.id === client.id) {
      setSelected(null);
      setDetail(null);
    } else {
      setSelected(client);
      loadDetail(client.id);
    }
  };

  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-brazil-green border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="px-4 py-4 animate-fade-in">
      <h1 className="text-2xl font-black mb-1">Client Progress</h1>
      <p className="text-grey-200 text-sm mb-4">Track weight and measurements</p>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-100" />
        <input className="input pl-10" placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="space-y-2">
        {filtered.map(c => {
          const change = c.start_weight && c.current_weight ? (c.current_weight - c.start_weight).toFixed(1) : null;
          const isSelected = selected?.id === c.id;
          return (
            <div key={c.id}>
              <button
                onClick={() => handleSelect(c)}
                className={`w-full card-dark flex items-center gap-3 text-left transition-all ${isSelected ? 'border-brazil-green/40 border' : ''}`}
              >
                <div className="w-10 h-10 rounded-full bg-brazil-green/20 text-brazil-green flex items-center justify-center font-bold flex-shrink-0">
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{c.name}</p>
                  <p className="text-xs text-grey-200">
                    {c.entry_count} entries · Last: {c.last_entry || 'No data'}
                  </p>
                </div>
                {change !== null && (
                  <div className="flex items-center gap-1 text-sm font-bold">
                    {parseFloat(change) < 0 ? (
                      <><TrendingDown className="w-4 h-4 text-brazil-green" /><span className="text-brazil-green">{change}kg</span></>
                    ) : parseFloat(change) > 0 ? (
                      <><TrendingUp className="w-4 h-4 text-orange-400" /><span className="text-orange-400">+{change}kg</span></>
                    ) : (
                      <><Minus className="w-4 h-4 text-grey-200" /><span className="text-grey-200">0kg</span></>
                    )}
                  </div>
                )}
              </button>

              {isSelected && detail && (
                <div className="card-dark border border-brazil-green/20 mt-1 mb-2">
                  {/* Weight Chart */}
                  {detail.entries?.length > 1 && (
                    <div className="mb-4">
                      <p className="text-xs text-grey-200 mb-2">Weight Over Time (kg)</p>
                      <ResponsiveContainer width="100%" height={150}>
                        <LineChart data={detail.entries?.map(e => ({ date: e.entry_date.slice(5), weight: e.weight_kg }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                          <YAxis domain={['auto', 'auto']} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                          <Tooltip contentStyle={{ background: '#111111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                          <Line type="monotone" dataKey="weight" stroke="#27AE60" strokeWidth={2} dot={{ fill: '#27AE60', r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-grey-100 rounded-[8px] p-2 text-center">
                      <p className="text-sm font-bold">{detail.startWeight || '—'}kg</p>
                      <p className="text-[10px] text-grey-200">Start</p>
                    </div>
                    <div className="bg-grey-100 rounded-[8px] p-2 text-center">
                      <p className="text-sm font-bold text-brazil-green">{detail.currentWeight || '—'}kg</p>
                      <p className="text-[10px] text-grey-200">Current</p>
                    </div>
                    <div className="bg-grey-100 rounded-[8px] p-2 text-center">
                      <p className={`text-sm font-bold ${parseFloat(detail.weightChange) < 0 ? 'text-brazil-green' : 'text-orange-400'}`}>
                        {detail.weightChange ? `${parseFloat(detail.weightChange) > 0 ? '+' : ''}${detail.weightChange}kg` : '—'}
                      </p>
                      <p className="text-[10px] text-grey-200">Change</p>
                    </div>
                  </div>

                  {/* Latest measurements */}
                  {detail.latestEntry && (
                    <div className="grid grid-cols-3 gap-2 text-xs text-center">
                      {detail.latestEntry.waist_cm && (
                        <div className="bg-grey-100 rounded-lg p-2">
                          <p className="font-bold">{detail.latestEntry.waist_cm}cm</p>
                          <p className="text-grey-100">Waist</p>
                        </div>
                      )}
                      {detail.latestEntry.hips_cm && (
                        <div className="bg-grey-100 rounded-lg p-2">
                          <p className="font-bold">{detail.latestEntry.hips_cm}cm</p>
                          <p className="text-grey-100">Hips</p>
                        </div>
                      )}
                      {detail.latestEntry.chest_cm && (
                        <div className="bg-grey-100 rounded-lg p-2">
                          <p className="font-bold">{detail.latestEntry.chest_cm}cm</p>
                          <p className="text-grey-100">Chest</p>
                        </div>
                      )}
                    </div>
                  )}

                  {!detail.entries?.length && (
                    <p className="text-center text-grey-100 text-sm py-4">No progress data yet</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
