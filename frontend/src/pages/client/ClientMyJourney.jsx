import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ChevronRight, Calendar, Droplets, Moon, Footprints, Salad, Heart, MessageSquare, CheckCircle, X, Phone, Check, Clock, Flame, Star } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const PILLS = ['Sessions', 'Progress', 'Habits', 'Food Diary', 'Wellness', 'Nutrition', 'Messages', 'Check-in'];
const PRO_ONLY_PILLS = ['Wellness', 'Food Diary', 'Messages', 'Check-in'];

export default function ClientMyJourney() {
  const { user } = useAuth();
  const [activePill, setActivePill] = useState('Sessions');
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [habits, setHabits] = useState(null);
  const [showProModal, setShowProModal] = useState(false);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (!user?.clientId) return;
    Promise.all([
      api.get(`/sessions/client/${user.clientId}`).catch(() => ({ data: {} })),
      api.get(`/progress/client/${user.clientId}`).catch(() => ({ data: [] })),
      api.get(`/habits/client/${user.clientId}`).catch(() => ({ data: null })),
    ]).then(([sessRes, progRes, habRes]) => {
      setSessions(sessRes.data);
      setMeasurements(progRes.data);
      setHabits(habRes.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handlePillClick = (pill) => {
    if (!user?.isPro && PRO_ONLY_PILLS.includes(pill)) {
      setShowProModal(true);
    } else {
      setActivePill(pill);
      setShowProModal(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-brazil-green border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const blockProgress = sessions?.blocks ? (sessions.blocks.used / sessions.blocks.total) * 100 : 0;
  const sessionsRemaining = sessions?.blocks ? sessions.blocks.total - sessions.blocks.used : 0;
  const latestMeasurement = measurements?.[0];
  const previousMeasurement = measurements?.[measurements.length - 1];
  const weightChange = latestMeasurement && previousMeasurement ? latestMeasurement.weight - previousMeasurement.weight : 0;

  return (
    <div className="w-full bg-white min-h-screen pb-24 animate-fade-in">
      <div className="px-5 pt-6 pb-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-black uppercase mb-1">My Journey</h1>
          <p className="text-grey-200 text-xs uppercase tracking-widest">Your fitness progress</p>
        </div>

        {/* Horizontal Scrollable Pills */}
        <div ref={scrollContainerRef} className="overflow-x-auto -mx-5 px-5 pb-2">
          <div className="flex gap-2 min-w-max">
            {PILLS.map(pill => {
              const isProOnly = PRO_ONLY_PILLS.includes(pill);
              const isActive = activePill === pill;
              return (
                <button
                  key={pill}
                  onClick={() => handlePillClick(pill)}
                  className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-black text-white'
                      : 'bg-grey-300 text-grey-200 hover:text-black'
                  } ${isProOnly && !user?.isPro ? 'opacity-60' : ''}`}
                >
                  {pill} {isProOnly && !user?.isPro ? '' : ''}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Sections */}
        {showProModal && (
          <ProUpgradeModal onClose={() => { setShowProModal(false); setActivePill('Sessions'); }} />
        )}

        {!showProModal && activePill === 'Sessions' && (
          <SessionsContent sessions={sessions} sessionsRemaining={sessionsRemaining} blockProgress={blockProgress} />
        )}

        {!showProModal && activePill === 'Progress' && (
          <ProgressContent measurements={measurements} weightChange={weightChange} latestMeasurement={latestMeasurement} />
        )}

        {!showProModal && activePill === 'Habits' && (
          <HabitsContent habits={habits} />
        )}

        {!showProModal && activePill === 'Food Diary' && (
          <FoodDiaryContent />
        )}

        {!showProModal && activePill === 'Wellness' && (
          <WellnessContent />
        )}

        {!showProModal && activePill === 'Nutrition' && (
          <NutritionContent />
        )}

        {!showProModal && activePill === 'Messages' && (
          <MessagesContent />
        )}

        {!showProModal && activePill === 'Check-in' && (
          <CheckInContent />
        )}
      </div>
    </div>
  );
}

function SessionsContent({ sessions, sessionsRemaining, blockProgress }) {
  return (
    <div className="space-y-5">
      {/* Sessions Remaining */}
      <div className="bg-grey-300 rounded-[12px] p-5">
        <p className="text-4xl font-black text-black mb-2">{sessionsRemaining}</p>
        <p className="text-grey-200 text-sm font-medium mb-4">sessions remaining out of 10</p>
        <div className="w-full h-3 bg-grey-100 rounded-full overflow-hidden">
          <div className="h-full bg-brazil-green transition-all" style={{ width: `${blockProgress}%` }} />
        </div>
        {sessions?.blocks?.start_date && (
          <p className="text-grey-200 text-xs mt-3">Started {new Date(sessions.blocks.start_date).toLocaleDateString()}</p>
        )}
      </div>

      {/* Upcoming Sessions */}
      <div>
        <p className="text-sm font-black text-black mb-3 uppercase tracking-widest">Upcoming Sessions</p>
        {sessions?.upcoming?.length ? (
          <div className="space-y-1">
            {sessions.upcoming.slice(0, 3).map((session, i) => (
              <div key={session.id} className={`px-5 py-3 text-sm ${i < sessions.upcoming.length - 1 ? 'border-b border-grey-100' : ''}`}>
                <p className="font-bold text-black">{session.scheduled_time}</p>
                <p className="text-grey-200 text-xs">{new Date(session.scheduled_date).toLocaleDateString()}  {session.type || 'Session'}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-grey-300 rounded-[12px]">
            <Calendar className="w-8 h-8 text-grey-200 mx-auto mb-2" />
            <p className="text-grey-100 text-sm">No upcoming sessions</p>
          </div>
        )}
      </div>

      {/* Session History */}
      <div>
        <p className="text-sm font-black text-black mb-3 uppercase tracking-widest">Session History</p>
        {sessions?.completed?.length ? (
          <div className="space-y-1">
            {sessions.completed.slice(0, 5).map((session, i) => (
              <div key={session.id} className={`px-5 py-3 text-sm flex items-center gap-3 ${i < sessions.completed.length - 1 ? 'border-b border-grey-100' : ''}`}>
                <Check className="w-4 h-4 text-brazil-green flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-black">{session.type || 'Session'}</p>
                  <p className="text-grey-200 text-xs">{new Date(session.scheduled_date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-grey-300 rounded-[12px]">
            <CheckCircle className="w-8 h-8 text-grey-200 mx-auto mb-2" />
            <p className="text-grey-100 text-sm">No completed sessions</p>
          </div>
        )}
      </div>

      {/* Renewal Reminder */}
      {sessionsRemaining <= 2 && (
        <div className="bg-green-50 border border-brazil-green rounded-[12px] p-4">
          <p className="font-black text-black mb-2">Your block is almost complete</p>
          <button className="w-full bg-brazil-green text-white font-bold py-3 rounded-full hover:bg-green-700 transition-all active:scale-95 flex items-center justify-center gap-2">
            <Phone className="w-4 h-4" />
            Contact PT to Renew
          </button>
        </div>
      )}
    </div>
  );
}

function ProgressContent({ measurements, weightChange, latestMeasurement }) {
  return (
    <div className="space-y-5">
      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-grey-300 rounded-[12px] p-4">
          <p className="text-grey-200 text-xs font-bold uppercase mb-2">Start Weight</p>
          <p className="text-2xl font-black text-black">{measurements?.[measurements.length - 1]?.weight || '-'}</p>
          <p className="text-xs text-grey-200 mt-1">kg</p>
        </div>
        <div className="bg-grey-300 rounded-[12px] p-4">
          <p className="text-grey-200 text-xs font-bold uppercase mb-2">Current</p>
          <p className="text-2xl font-black text-black">{latestMeasurement?.weight || '-'}</p>
          <p className="text-xs text-grey-200 mt-1">kg</p>
        </div>
        <div className="bg-grey-300 rounded-[12px] p-4">
          <p className="text-grey-200 text-xs font-bold uppercase mb-2">Change</p>
          <p className={`text-2xl font-black ${weightChange < 0 ? 'text-green-500' : 'text-orange-500'}`}>
            {weightChange < 0 ? '' : ''} {Math.abs(weightChange).toFixed(1)}
          </p>
          <p className="text-xs text-grey-200 mt-1">kg</p>
        </div>
      </div>

      {/* Weight Chart */}
      <div className="bg-grey-300 rounded-[12px] p-4">
        <p className="text-sm font-black text-black mb-3">Weight Progress</p>
        <div className="h-32 flex items-end gap-2">
          {measurements.slice(-7).map((m, i) => (
            <div
              key={i}
              className="flex-1 bg-brazil-green rounded-t-[4px]"
              style={{ height: `${(m.weight / Math.max(...measurements.map(x => x.weight))) * 100}%` }}
            />
          ))}
        </div>
      </div>

      {/* Measurements */}
      {measurements.length > 0 && (
        <div className="bg-grey-300 rounded-[12px] p-4">
          <p className="text-sm font-black text-black mb-3">Measurements</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-grey-100">
                <th className="text-left py-2 font-bold text-grey-200 text-xs">Area</th>
                <th className="text-right py-2 font-bold text-grey-200 text-xs">Current</th>
                <th className="text-right py-2 font-bold text-grey-200 text-xs">Start</th>
              </tr>
            </thead>
            <tbody>
              {['waist', 'hips', 'chest'].map(area => (
                <tr key={area} className="border-b border-grey-100 last:border-0">
                  <td className="py-2 font-bold text-black capitalize">{area}</td>
                  <td className="text-right py-2 text-black font-bold">{latestMeasurement?.[area] || '-'}</td>
                  <td className="text-right py-2 text-grey-200">{measurements[measurements.length - 1]?.[area] || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PT Notes */}
      <div className="bg-green-50 border-l-4 border-brazil-green rounded-[12px] p-4">
        <p className="text-xs font-bold text-brazil-green uppercase mb-1">PT Notes</p>
        <p className="text-sm text-black font-bold">Great progress on form!</p>
        <p className="text-xs text-grey-200 mt-1">Your PT will add notes after sessions</p>
      </div>

      {/* Log This Week */}
      <button className="w-full bg-black text-white font-bold py-3 rounded-[12px] hover:bg-grey-300 transition-all active:scale-95">
        Log This Week
      </button>
    </div>
  );
}

function HabitsContent({ habits }) {
  const [streak, setStreak] = useState(5);
  const [water, setWater] = useState(5);
  const [sleep, setSleep] = useState(7);
  const [steps, setSteps] = useState(8500);
  const [veg, setVeg] = useState(3);
  const [mood, setMood] = useState('');

  return (
    <div className="space-y-5">
      {/* Streak Card */}
      <div className="bg-grey-300 rounded-[12px] p-5">
        <div className="flex items-baseline gap-2 mb-4">
          <p className="text-5xl font-black text-black">{streak}</p>
          <p className="text-grey-200 text-sm font-medium">day streak </p>
        </div>
        <div className="flex gap-1">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full ${i < streak ? 'bg-brazil-green' : 'bg-grey-100'}`}
            />
          ))}
        </div>
      </div>

      {/* Daily Check-in */}
      <div>
        <p className="text-sm font-black text-black mb-3 uppercase tracking-widest">TODAY</p>
        <div className="bg-grey-300 rounded-[12px] p-4 space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-bold text-black flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-500" />
                Water
              </label>
              <span className="text-xs font-bold text-grey-200">{water}/12</span>
            </div>
            <input
              type="range"
              min="0"
              max="12"
              value={water}
              onChange={(e) => setWater(Number(e.target.value))}
              className="w-full h-2 bg-grey-100 rounded-full accent-brazil-green"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-bold text-black flex items-center gap-2">
                <Moon className="w-4 h-4 text-purple-500" />
                Sleep
              </label>
              <span className="text-xs font-bold text-grey-200">{sleep}/12 hours</span>
            </div>
            <input
              type="range"
              min="0"
              max="12"
              value={sleep}
              onChange={(e) => setSleep(Number(e.target.value))}
              className="w-full h-2 bg-grey-100 rounded-full accent-brazil-green"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-bold text-black flex items-center gap-2">
                <Footprints className="w-4 h-4 text-orange-500" />
                Steps
              </label>
              <span className="text-xs font-bold text-grey-200">{steps.toLocaleString()}/10000</span>
            </div>
            <input
              type="range"
              min="0"
              max="20000"
              value={steps}
              onChange={(e) => setSteps(Number(e.target.value))}
              className="w-full h-2 bg-grey-100 rounded-full accent-brazil-green"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-bold text-black flex items-center gap-2">
                <Salad className="w-4 h-4 text-green-500" />
                Veg Portions
              </label>
              <span className="text-xs font-bold text-grey-200">{veg}/10</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={veg}
              onChange={(e) => setVeg(Number(e.target.value))}
              className="w-full h-2 bg-grey-100 rounded-full accent-brazil-green"
            />
          </div>
        </div>
      </div>

      {/* Checkboxes */}
      <div className="bg-grey-300 rounded-[12px] p-4 space-y-2">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" defaultChecked className="w-5 h-5 accent-brazil-green rounded" />
          <span className="text-sm font-bold text-black">Alcohol-free today</span>
        </label>
      </div>

      {/* Mood Rating */}
      <div className="bg-grey-300 rounded-[12px] p-4">
        <p className="text-sm font-black text-black mb-3">How are you feeling?</p>
        <div className="flex gap-2 justify-between">
          {['', '', '', '', ''].map((emoji, i) => (
            <button
              key={i}
              onClick={() => setMood(emoji)}
              className={`text-2xl hover:scale-110 transition-transform ${mood === emoji ? 'ring-2 ring-brazil-green rounded-lg p-1' : ''}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <button className="w-full bg-brazil-green text-white font-bold py-3 rounded-full hover:bg-green-700 transition-all active:scale-95">
        Save Today
      </button>

      {/* Weekly Averages */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-grey-300 rounded-[12px] p-3">
          <p className="text-xs font-bold text-grey-200 uppercase mb-1">Avg Sleep</p>
          <p className="text-xl font-black text-black">7.2h</p>
        </div>
        <div className="bg-grey-300 rounded-[12px] p-3">
          <p className="text-xs font-bold text-grey-200 uppercase mb-1">Avg Steps</p>
          <p className="text-xl font-black text-black">9.1k</p>
        </div>
      </div>
    </div>
  );
}

function FoodDiaryContent() {
  const [waterIntake, setWaterIntake] = useState(5);
  const [foodEntries, setFoodEntries] = useState([
    { time: '08:00', food: 'Breakfast', mood: '' },
  ]);

  return (
    <div className="space-y-5">
      {/* Date Selector */}
      <div className="flex items-center justify-between px-4 py-3 bg-grey-300 rounded-[12px]">
        <button className="p-2 hover:bg-grey-100 rounded-full transition"></button>
        <p className="font-bold text-black">Today</p>
        <button className="p-2 hover:bg-grey-100 rounded-full transition"></button>
      </div>

      {/* Water Tracker */}
      <div className="bg-grey-300 rounded-[12px] p-4">
        <p className="text-sm font-bold text-black mb-3 flex items-center gap-2">
          <Droplets className="w-4 h-4 text-blue-500" />
          Water Intake
        </p>
        <div className="flex gap-2">
          {[...Array(8)].map((_, i) => (
            <button
              key={i}
              onClick={() => setWaterIntake(i + 1)}
              className={`flex-1 h-10 rounded-full border-2 transition-all ${
                i < waterIntake ? 'bg-blue-500 border-blue-500 text-white' : 'border-grey-200'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <p className="text-xs text-grey-200 mt-3">{waterIntake} / 8 glasses</p>
      </div>

      {/* Food Log */}
      <div>
        <button className="w-full bg-brazil-green text-white font-bold py-3 rounded-full hover:bg-green-700 transition-all active:scale-95 mb-3">
          + Add Entry
        </button>
        <div className="space-y-2">
          {foodEntries.map((entry, i) => (
            <div key={i} className="px-4 py-3 bg-grey-300 rounded-[12px] flex items-center justify-between border-b border-grey-100 last:border-0">
              <div>
                <p className="font-bold text-black text-sm">{entry.food}</p>
                <p className="text-xs text-grey-200">{entry.time}</p>
              </div>
              <span className="text-lg">{entry.mood}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <textarea
        placeholder="How did you feel today?"
        className="w-full px-4 py-3 bg-grey-300 text-black placeholder-grey-200 rounded-[12px] border border-grey-100 focus:outline-none focus:border-brazil-green resize-none"
        rows="3"
      />

      {/* Save Button */}
      <button className="w-full bg-brazil-green text-white font-bold py-3 rounded-full hover:bg-green-700 transition-all active:scale-95">
        Save Day
      </button>
    </div>
  );
}

function WellnessContent() {
  return (
    <div className="space-y-5">
      <p className="text-xs font-bold text-grey-200 uppercase tracking-widest">Featured</p>

      {/* Meditation */}
      <button className="w-full bg-grey-300 rounded-[12px] p-5 text-left hover:bg-grey-100 transition-all active:scale-95">
        <p className="text-black font-bold text-lg">Morning Meditation</p>
        <p className="text-brazil-green text-sm font-bold mt-1">10 min</p>
        <p className="text-grey-200 text-xs mt-2">MINDFULNESS</p>
      </button>

      {/* Breathing Exercises */}
      <button className="w-full bg-grey-300 rounded-[12px] p-5 text-left hover:bg-grey-100 transition-all active:scale-95">
        <p className="text-black font-bold text-lg">Breathwork</p>
        <p className="text-brazil-green text-sm font-bold mt-1">5 min</p>
        <p className="text-grey-200 text-xs mt-2">BREATHING</p>
      </button>

      {/* Tips */}
      <div className="bg-green-50 border-l-4 border-brazil-green rounded-[12px] p-4">
        <p className="text-xs font-bold text-brazil-green uppercase mb-1">Wellness Tip</p>
        <p className="text-sm text-black font-bold">Rest and Recovery</p>
        <p className="text-xs text-grey-200 mt-1">Take time to stretch after workouts to improve flexibility.</p>
      </div>

      {/* Rest Day */}
      <div className="bg-green-50 border border-brazil-green rounded-[12px] p-4">
        <p className="font-bold text-black mb-1">Today is a Rest Day</p>
        <p className="text-sm text-grey-200">Focus on recovery and mental wellbeing. You've earned it!</p>
      </div>
    </div>
  );
}

function NutritionContent() {
  return (
    <div className="space-y-5">
      {/* Featured Tip */}
      <div className="bg-green-50 border-l-4 border-brazil-green rounded-[12px] p-4">
        <p className="text-xs font-bold text-brazil-green uppercase mb-1">Tip of the Week</p>
        <p className="text-lg font-bold text-black">Stay Hydrated</p>
        <p className="text-sm text-grey-200 mt-2">Drinking water boosts metabolism and aids recovery. Aim for 2-3 litres daily.</p>
      </div>

      {/* Tips Library */}
      <div>
        <p className="text-xs font-bold text-grey-200 uppercase tracking-widest mb-3">Tips by Category</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {['Pre-workout', 'Hydration', 'Recovery', 'Weight loss', 'Muscle gain'].map(cat => (
            <button
              key={cat}
              className="px-3 py-1.5 bg-grey-300 text-grey-200 text-xs font-bold rounded-full hover:text-black transition-all"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Meal Ideas */}
      <div>
        <p className="text-xs font-bold text-grey-200 uppercase tracking-widest mb-3">Meal Ideas</p>
        {[
          { emoji: '', name: 'Grilled Chicken & Rice', cal: '450cal', goal: 'Muscle Gain' },
          { emoji: '', name: 'Salmon with Veg', cal: '520cal', goal: 'Recovery' },
          { emoji: '', name: 'Protein Smoothie', cal: '380cal', goal: 'Recovery' },
        ].map((meal, i) => (
          <div key={i} className="bg-grey-300 rounded-[12px] p-3 mb-2 flex items-center justify-between">
            <div>
              <p className="text-xl mb-1">{meal.emoji}</p>
              <p className="font-bold text-black text-sm">{meal.name}</p>
              <p className="text-grey-200 text-xs">{meal.cal}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-brazil-green text-white text-[10px] font-bold px-2 py-1 rounded-full">{meal.goal}</span>
              <button className="text-grey-200 hover:text-black transition"></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MessagesContent() {
  const [messages, setMessages] = useState([
    { from: 'PT', text: 'Great session today! Keep up the intensity.' },
    { from: 'You', text: 'Thanks! Feeling stronger each week.' },
  ]);
  const [newMessage, setNewMessage] = useState('');

  return (
    <div className="space-y-5 h-[500px] flex flex-col">
      <div className="flex items-center gap-2 pb-3 border-b border-grey-100">
        <div className="w-8 h-8 rounded-full bg-brazil-green flex items-center justify-center text-white text-xs font-bold">PT</div>
        <div className="flex-1">
          <p className="font-bold text-black text-sm">Andre Viana</p>
          <p className="text-green-500 text-xs flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Online</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.from === 'You' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs px-4 py-2 rounded-2xl ${
                msg.from === 'You'
                  ? 'bg-brazil-green text-white'
                  : 'bg-grey-300 text-black'
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <p className={`text-xs mt-1 ${msg.from === 'You' ? 'text-white/70' : 'text-grey-200'}`}>2:30 PM</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-3 border-t border-grey-100">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 bg-grey-300 rounded-full border border-grey-100 text-black placeholder-grey-200 focus:outline-none"
        />
        <button className="bg-brazil-green text-white px-4 py-2 rounded-full hover:bg-green-700 transition-all active:scale-95">
          
        </button>
      </div>
    </div>
  );
}

function CheckInContent() {
  const [overallFeeling, setOverallFeeling] = useState(null);
  const [nutritionGoal, setNutritionGoal] = useState(null);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [sleepQuality, setSleepQuality] = useState(5);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-lg font-black text-black uppercase tracking-widest mb-5">How was your week</p>

        {/* Overall Feeling */}
        <div className="mb-5">
          <p className="text-sm font-bold text-black mb-3">How do you feel overall?</p>
          <div className="flex gap-2 justify-between">
            {['', '', '', '', ''].map((emoji, i) => (
              <button
                key={i}
                onClick={() => setOverallFeeling(emoji)}
                className={`text-3xl hover:scale-110 transition-transform ${
                  overallFeeling === emoji ? 'ring-2 ring-brazil-green rounded-lg p-2' : ''
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Nutrition Goals */}
        <div className="mb-5">
          <p className="text-sm font-bold text-black mb-2">Did you hit your nutrition goals?</p>
          <div className="flex gap-3">
            <button
              onClick={() => setNutritionGoal('yes')}
              className={`flex-1 py-3 font-bold rounded-full transition-all ${
                nutritionGoal === 'yes'
                  ? 'bg-brazil-green text-white'
                  : 'bg-grey-300 text-black hover:bg-grey-100'
              }`}
            >
              YES
            </button>
            <button
              onClick={() => setNutritionGoal('no')}
              className={`flex-1 py-3 font-bold rounded-full transition-all ${
                nutritionGoal === 'no'
                  ? 'bg-red-500 text-white'
                  : 'bg-grey-300 text-black hover:bg-grey-100'
              }`}
            >
              NO
            </button>
          </div>
        </div>

        {/* Energy & Sleep Sliders */}
        <div className="mb-5">
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <label className="text-sm font-bold text-black">Energy Levels</label>
              <span className="text-sm font-bold text-grey-200">{energyLevel}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={energyLevel}
              onChange={(e) => setEnergyLevel(Number(e.target.value))}
              className="w-full h-2 bg-grey-100 rounded-full accent-brazil-green"
            />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-bold text-black">Sleep Quality</label>
              <span className="text-sm font-bold text-grey-200">{sleepQuality}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={sleepQuality}
              onChange={(e) => setSleepQuality(Number(e.target.value))}
              className="w-full h-2 bg-grey-100 rounded-full accent-brazil-green"
            />
          </div>
        </div>

        {/* Text Areas */}
        <div className="space-y-3 mb-5">
          <textarea
            placeholder="Any injuries or pain?"
            className="w-full px-4 py-3 bg-grey-300 text-black placeholder-grey-200 rounded-[12px] border border-grey-100 focus:outline-none resize-none"
            rows="2"
          />
          <textarea
            placeholder="What went well?"
            className="w-full px-4 py-3 bg-grey-300 text-black placeholder-grey-200 rounded-[12px] border border-grey-100 focus:outline-none resize-none"
            rows="2"
          />
          <textarea
            placeholder="What was challenging?"
            className="w-full px-4 py-3 bg-grey-300 text-black placeholder-grey-200 rounded-[12px] border border-grey-100 focus:outline-none resize-none"
            rows="2"
          />
        </div>

        {/* Rating Stars */}
        <div className="mb-5">
          <p className="text-sm font-bold text-black mb-2">Rate your sessions</p>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <button key={i} className="text-2xl hover:scale-110 transition-transform"></button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button className="w-full bg-brazil-green text-white font-bold py-3 rounded-full hover:bg-green-700 transition-all active:scale-95">
          Submit Check-in
        </button>
      </div>
    </div>
  );
}

function ProUpgradeModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end animate-fade-in">
      <div className="w-full bg-white rounded-t-3xl p-8 animate-slide-up max-h-[80vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-5 p-2 hover:bg-grey-300 rounded-full transition"
        >
          <X className="w-6 h-6 text-black" />
        </button>

        <div className="text-center mt-6">
          <p className="text-xs font-bold text-grey-200 uppercase mb-2">Unlock More</p>
          <h2 className="text-4xl font-black text-black uppercase mb-6">BrazilFit Pro</h2>

          <div className="space-y-2 mb-6 text-left">
            {[
              'Advanced wellness & meditation',
              'Personalized nutrition plans',
              'Direct messaging with PT',
              'Weekly check-ins & coaching',
              'Progress photo tracking',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <Check className="w-5 h-5 text-brazil-green flex-shrink-0" />
                <p className="text-black text-sm">{feature}</p>
              </div>
            ))}
          </div>

          <p className="text-4xl font-black text-brazil-green mb-2">9.99</p>
          <p className="text-grey-200 text-xs mb-6">per month</p>

          <button className="w-full bg-brazil-green text-white font-bold py-3 rounded-full hover:bg-green-700 transition-all active:scale-95 mb-2">
            Start 7 Day Free Trial
          </button>

          <p className="text-grey-200 text-xs">Cancel anytime</p>
        </div>
      </div>
    </div>
  );
}

