import { useState, useEffect } from 'react';
import { Plus, Calendar } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function PTClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logForm, setLogForm] = useState({ classId: null, session_date: new Date().toISOString().split('T')[0], attendees: '' });
  const [showLogForm, setShowLogForm] = useState(null);

  useEffect(() => {
    api.get('/classes').then(r => {
      setClasses(r.data);
      setLoading(false);
    }).catch(() => {
      toast.error('Failed to load classes');
      setLoading(false);
    });
  }, []);

  const logSession = async (classId) => {
    try {
      const cls = classes.find(c => c.id === classId);
      await api.post(`/classes/${classId}/sessions`, {
        session_date: logForm.session_date,
        attendees: logForm.attendees || cls?.max_people,
      });
      toast.success('Class session logged!');
      setShowLogForm(null);
      // Reload
      const res = await api.get('/classes');
      setClasses(res.data);
    } catch {
      toast.error('Failed to log session');
    }
  };

  const totalEarned = classes.reduce((s, c) => s + (c.total_earned || 0), 0);
  const totalTax = Math.round(totalEarned * 0.2);
  const totalNet = totalEarned - totalTax;

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-brazil-green border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="animate-fade-in">
      {/* Hero image */}
      <div
        className="w-full h-48 mb-6"
        style={{
          backgroundImage: 'url(/images/newcastle-86.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Dark overlay 55% */}
        <div className="absolute inset-0 bg-black/55" />
      </div>

      <div className="px-4 py-4">
        <h1 className="text-2xl font-black mb-1">Weekly Classes</h1>
        <p className="text-grey-200 text-sm mb-4">{classes.length} recurring classes</p>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="metric-card text-center">
          <p className="text-xl font-black text-brazil-yellow">£{totalEarned}</p>
          <p className="text-xs text-grey-200">Gross</p>
        </div>
        <div className="metric-card text-center">
          <p className="text-xl font-black text-red-400">£{totalTax}</p>
          <p className="text-xs text-grey-200">Tax (20%)</p>
        </div>
        <div className="metric-card text-center">
          <p className="text-xl font-black text-brazil-green">£{totalNet}</p>
          <p className="text-xs text-grey-200">Net</p>
        </div>
      </div>

      <div className="space-y-3">
        {classes.map(cls => {
          const fee = cls.payment_type === 'per_person'
            ? `£${cls.per_person_fee}/person × ${cls.max_people} = £${cls.per_person_fee * cls.max_people}/session`
            : `£${cls.flat_fee} flat rate`;

          return (
            <div key={cls.id} className="card-dark">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{cls.name}</p>
                    <span className="text-xs text-pink-400 bg-pink-500/20 px-1.5 py-0.5 rounded-full">Class</span>
                  </div>
                  <p className="text-xs text-grey-200">{DAY_NAMES[cls.day_of_week]} · {cls.class_time} · {fee}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-brazil-yellow">£{cls.total_earned || 0}</p>
                  <p className="text-xs text-grey-100">{cls.sessions_run || 0} sessions</p>
                </div>
              </div>

              {showLogForm === cls.id ? (
                <div className="space-y-2 mt-2">
                  <input
                    type="date"
                    value={logForm.session_date}
                    onChange={e => setLogForm(f => ({ ...f, session_date: e.target.value }))}
                    className="input text-sm"
                  />
                  {cls.payment_type === 'per_person' && (
                    <input
                      type="number"
                      value={logForm.attendees}
                      onChange={e => setLogForm(f => ({ ...f, attendees: e.target.value }))}
                      className="input text-sm"
                      placeholder={`Attendees (max ${cls.max_people})`}
                    />
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => logSession(cls.id)} className="btn-primary flex-1 text-sm py-2">Log Session</button>
                    <button onClick={() => setShowLogForm(null)} className="btn-secondary px-4 text-sm py-2">Cancel</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => { setShowLogForm(cls.id); setLogForm(f => ({ ...f, classId: cls.id })); }}
                  className="btn-secondary w-full text-sm py-2 flex items-center justify-center gap-2 mt-1"
                >
                  <Calendar className="w-4 h-4" /> Log This Week's Session
                </button>
              )}
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}
