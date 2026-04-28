import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Droplets, Smile, Frown, Meh, Edit3, Check, BookOpen } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { fmtDateFull } from '../../utils/dateUtils';

const MOOD_CONFIG = [
  { val: 1, label: 'Terrible', icon: Frown, color: 'text-red-400' },
  { val: 2, label: 'Bad', icon: Frown, color: 'text-orange-400' },
  { val: 3, label: 'Okay', icon: Meh, color: 'text-yellow-400' },
  { val: 4, label: 'Good', icon: Smile, color: 'text-lime-400' },
  { val: 5, label: 'Great', icon: Smile, color: 'text-brazil-green' },
];

const MEAL_TIMES = ['Breakfast', 'Morning Snack', 'Lunch', 'Afternoon Snack', 'Dinner', 'Evening Snack'];

function dateStr(d) {
  return d.toISOString().split('T')[0];
}

function MoodSelector({ label, value, onChange }) {
  return (
    <div>
      <label className="text-xs text-grey-100 mb-2 block">{label}</label>
      <div className="flex gap-2">
        {MOOD_CONFIG.map(m => {
          const Icon = m.icon;
          return (
            <button key={m.val} type="button" onClick={() => onChange(m.val)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-[8px] border transition-all active:scale-95 text-[10px]
                ${value === m.val ? `border-current bg-grey-100 ${m.color}` : 'border-grey-100 text-grey-100 hover:text-grey-200'}`}>
              <Icon className="w-5 h-5" />
              <span className="leading-none">{m.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WaterTracker({ value, onChange }) {
  return (
    <div>
      <label className="text-xs text-grey-100 mb-2 block">Water intake (each glass = 250ml)</label>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 8 }, (_, i) => (
          <button key={i} type="button" onClick={() => onChange(i + 1 === value ? i : i + 1)}
            className={`w-10 h-10 rounded-[8px] border-2 flex items-center justify-center transition-all active:scale-90
              ${i < value ? 'border-blue-400 bg-blue-400/20 text-blue-400' : 'border-white/15 text-grey-200 bg-grey-100'}`}>
            <Droplets className="w-4 h-4" />
          </button>
        ))}
      </div>
      <p className="text-xs text-grey-100 mt-1.5">
        {value} × 250ml = {(value * 0.25).toFixed(2)}L
      </p>
    </div>
  );
}

function MealRow({ meal, onChange, onDelete }) {
  const [expanded, setExpanded] = useState(!meal.food);
  return (
    <div className="bg-grey-100 rounded-[8px] border border-white/8 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-brazil-green">{meal.time}</p>
          {!expanded && meal.food && <p className="text-sm text-black truncate">{meal.food}</p>}
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          <button type="button" onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg hover:bg-grey-300 text-grey-100 text-xs">
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button type="button" onClick={onDelete}
            className="p-1.5 rounded-lg hover:bg-red-500/20 text-grey-100 hover:text-red-400">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-white/8 pt-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-grey-100 block mb-1">Food & drink consumed</label>
              <textarea value={meal.food || ''} onChange={e => onChange({ ...meal, food: e.target.value })}
                placeholder="e.g. Porridge with banana and honey..." rows={2}
                className="w-full bg-grey-100 border border-grey-100 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-brazil-green/50 resize-none placeholder:text-grey-200" />
            </div>
            <div>
              <label className="text-[10px] text-grey-100 block mb-1">Amount / portion</label>
              <input value={meal.amount || ''} onChange={e => onChange({ ...meal, amount: e.target.value })}
                placeholder="e.g. 80g oats, 1 banana"
                className="w-full bg-grey-100 border border-grey-100 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-brazil-green/50 placeholder:text-grey-200" />
              <label className="text-[10px] text-grey-100 block mb-1 mt-2">Place eaten</label>
              <input value={meal.place || ''} onChange={e => onChange({ ...meal, place: e.target.value })}
                placeholder="e.g. Home, office, café"
                className="w-full bg-grey-100 border border-grey-100 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-brazil-green/50 placeholder:text-grey-200" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-grey-100 block mb-1">Mood before eating</label>
              <div className="flex gap-1">
                {MOOD_CONFIG.map(m => (
                  <button key={m.val} type="button" onClick={() => onChange({ ...meal, mood_before: m.val })}
                    className={`flex-1 py-1.5 rounded-lg border text-[9px] transition-all ${meal.mood_before === m.val ? 'border-brazil-green/60 bg-brazil-green/20 text-brazil-green' : 'border-grey-100 text-grey-100'}`}>
                    {m.val}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-grey-100 block mb-1">Mood after eating</label>
              <div className="flex gap-1">
                {MOOD_CONFIG.map(m => (
                  <button key={m.val} type="button" onClick={() => onChange({ ...meal, mood_after: m.val })}
                    className={`flex-1 py-1.5 rounded-lg border text-[9px] transition-all ${meal.mood_after === m.val ? 'border-brazil-yellow/60 bg-brazil-yellow/20 text-brazil-yellow' : 'border-grey-100 text-grey-100'}`}>
                    {m.val}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClientFoodDiary() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [meals, setMeals] = useState([]);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [howFelt, setHowFelt] = useState('');
  const [foodReview, setFoodReview] = useState('');
  const [cravings, setCravings] = useState('');
  const [moods, setMoods] = useState('');
  const [behaviours, setBehaviours] = useState('');
  const [recentDates, setRecentDates] = useState([]);

  useEffect(() => { loadEntry(); }, [currentDate]);

  useEffect(() => {
    api.get('/onboarding/diary').then(r => setRecentDates(r.data)).catch(() => {});
  }, []);

  const loadEntry = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/onboarding/diary?date=${dateStr(currentDate)}`);
      const e = res.data;
      if (e) {
        setEntry(e);
        setMeals(JSON.parse(e.meals || '[]'));
        setWaterGlasses(e.water_glasses || 0);
        setHowFelt(e.how_felt_today || '');
        setFoodReview(e.food_review || '');
        setCravings(e.cravings || '');
        setMoods(e.moods || '');
        setBehaviours(e.behaviours || '');
      } else {
        setEntry(null);
        setMeals([]);
        setWaterGlasses(0);
        setHowFelt(''); setFoodReview(''); setCravings(''); setMoods(''); setBehaviours('');
      }
    } catch {
      toast.error('Failed to load diary');
    } finally {
      setLoading(false);
    }
  };

  const addMeal = (time) => {
    setMeals(m => [...m, { time, food: '', amount: '', place: '', mood_before: null, mood_after: null }]);
  };

  const updateMeal = (i, val) => setMeals(m => m.map((x, idx) => idx === i ? val : x));
  const removeMeal = (i) => setMeals(m => m.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/onboarding/diary', {
        entry_date: dateStr(currentDate),
        meals,
        water_glasses: waterGlasses,
        how_felt_today: howFelt,
        food_review: foodReview,
        cravings,
        moods,
        behaviours,
      });
      toast.success('Diary saved!');
      api.get('/onboarding/diary').then(r => setRecentDates(r.data)).catch(() => {});
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const isToday = dateStr(currentDate) === dateStr(new Date());
  const isFuture = currentDate > new Date();

  return (
    <div className="px-4 py-4 animate-fade-in space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Food & Mood Diary</h1>
          <p className="text-xs text-grey-100">Track what you eat and how you feel</p>
        </div>
        <BookOpen className="w-6 h-6 text-brazil-green" />
      </div>

      {/* Date navigator */}
      <div className="flex items-center gap-3 bg-grey-300 rounded-[8px] border border-grey-100 px-3 py-2.5">
        <button onClick={() => setCurrentDate(d => new Date(d.getTime() - 86400000))}
          className="p-1.5 rounded-lg hover:bg-grey-300 text-grey-200 transition-all active:scale-90">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 text-center">
          <p className="font-bold text-sm">{isToday ? 'Today' : fmtDateFull(dateStr(currentDate))}</p>
          <p className="text-xs text-grey-100">{dateStr(currentDate)}</p>
        </div>
        <button onClick={() => setCurrentDate(d => new Date(d.getTime() + 86400000))}
          disabled={isToday}
          className="p-1.5 rounded-lg hover:bg-grey-300 text-grey-200 transition-all active:scale-90 disabled:opacity-30">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><div className="w-6 h-6 border-4 border-brazil-green border-t-transparent rounded-full animate-spin" /></div>
      ) : isFuture ? (
        <div className="text-center py-8 text-grey-100 text-sm">You can only log past and current days.</div>
      ) : (
        <>
          {/* Meal log */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-sm">Food Log</h2>
              <div className="relative group">
                <button className="flex items-center gap-1.5 bg-brazil-green/20 text-brazil-green text-xs font-semibold px-3 py-1.5 rounded-lg active:scale-95">
                  <Plus className="w-3.5 h-3.5" /> Add Meal
                </button>
                <div className="absolute right-0 top-8 bg-grey-300 border border-grey-100 rounded-[8px] shadow-xl z-20 min-w-[160px] overflow-hidden hidden group-hover:block">
                  {MEAL_TIMES.map(t => (
                    <button key={t} type="button" onClick={() => addMeal(t)}
                      className="w-full text-left px-4 py-2.5 text-sm text-grey-200 hover:bg-grey-100 hover:text-black transition-colors">
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {meals.length === 0 ? (
                <div className="text-center py-6 text-grey-100 text-sm">
                  No meals logged yet. Tap "Add Meal" to start.
                </div>
              ) : (
                meals.map((m, i) => (
                  <MealRow key={i} meal={m} onChange={v => updateMeal(i, v)} onDelete={() => removeMeal(i)} />
                ))
              )}
            </div>
          </div>

          {/* Water */}
          <div className="card-dark">
            <WaterTracker value={waterGlasses} onChange={setWaterGlasses} />
          </div>

          {/* Daily Notes */}
          <div className="card-dark space-y-4">
            <h2 className="font-bold text-sm">Daily Notes</h2>

            <div>
              <label className="text-xs text-grey-100 mb-1.5 block">How did you feel today overall?</label>
              <textarea value={howFelt} onChange={e => setHowFelt(e.target.value)} rows={3}
                placeholder="Energy levels, general wellbeing, anything notable about today..."
                className="w-full bg-grey-100 border border-grey-100 rounded-[8px] px-3 py-2.5 text-sm focus:outline-none focus:border-brazil-green/50 resize-none placeholder:text-grey-200" />
            </div>

            <div>
              <label className="text-xs text-grey-100 mb-1.5 block">Review your food intake — did you eat well?</label>
              <textarea value={foodReview} onChange={e => setFoodReview(e.target.value)} rows={2}
                placeholder="Reflections on your food choices today..."
                className="w-full bg-grey-100 border border-grey-100 rounded-[8px] px-3 py-2.5 text-sm focus:outline-none focus:border-brazil-green/50 resize-none placeholder:text-grey-200" />
            </div>

            <div>
              <label className="text-xs text-grey-100 mb-1.5 block">Cravings today</label>
              <input value={cravings} onChange={e => setCravings(e.target.value)}
                placeholder="e.g. Chocolate mid-afternoon, salty snacks in the evening..."
                className="w-full bg-grey-100 border border-grey-100 rounded-[8px] px-3 py-2.5 text-sm focus:outline-none focus:border-brazil-green/50 placeholder:text-grey-200" />
            </div>

            <div>
              <label className="text-xs text-grey-100 mb-1.5 block">Moods throughout the day</label>
              <input value={moods} onChange={e => setMoods(e.target.value)}
                placeholder="e.g. Anxious in the morning, happy after lunch, tired by 4pm..."
                className="w-full bg-grey-100 border border-grey-100 rounded-[8px] px-3 py-2.5 text-sm focus:outline-none focus:border-brazil-green/50 placeholder:text-grey-200" />
            </div>

            <div>
              <label className="text-xs text-grey-100 mb-1.5 block">Noticeable behaviours or patterns</label>
              <textarea value={behaviours} onChange={e => setBehaviours(e.target.value)} rows={2}
                placeholder="e.g. Stress eating at desk, skipping meals, emotional eating..."
                className="w-full bg-grey-100 border border-grey-100 rounded-[8px] px-3 py-2.5 text-sm focus:outline-none focus:border-brazil-green/50 resize-none placeholder:text-grey-200" />
            </div>
          </div>

          {/* Save button */}
          <button onClick={handleSave} disabled={saving}
            className={`w-full py-4 rounded-[12px] font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all
              ${saving ? 'bg-grey-100 text-grey-100' : 'bg-brazil-green text-black hover:bg-brazil-green/90'}`}>
            {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</> : <><Check className="w-4 h-4" />Save Diary Entry</>}
          </button>

          {/* Recent entries */}
          {recentDates.length > 0 && (
            <div>
              <h2 className="font-bold text-sm mb-3 text-grey-200">Recent Entries</h2>
              <div className="space-y-2">
                {recentDates.slice(0, 7).map(e => (
                  <button key={e.id} type="button"
                    onClick={() => setCurrentDate(new Date(e.entry_date + 'T12:00:00'))}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-[8px] border transition-all active:scale-[0.99]
                      ${dateStr(currentDate) === e.entry_date ? 'border-brazil-green/40 bg-brazil-green/10' : 'border-white/8 bg-white/4 hover:bg-grey-100'}`}>
                    <p className="text-sm font-medium">{fmtDateFull(e.entry_date)}</p>
                    <div className="flex items-center gap-2">
                      <Droplets className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-xs text-blue-400">{e.water_glasses}/8</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
