import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ChevronRight, Calendar, Droplets, Moon, Footprints, Salad, Heart, Coffee, TrendingUp, FileText, Plus } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const TABS = ['Sessions', 'Progress', 'Habits', 'Food Diary', 'Wellness', 'Nutrition'];

export default function ClientMyPlan() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Sessions');
  const scrollContainerRef = useRef(null);
  const [sessions, setSessions] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [habits, setHabits] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-brazil-green border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const blockProgress = sessions?.blocks ? (sessions.blocks.used / sessions.blocks.total) * 100 : 0;
  const sessionsRemaining = sessions?.blocks ? sessions.blocks.total - sessions.blocks.used : 0;
  const latestMeasurement = measurements?.[0];
  const previousMeasurement = measurements?.[measurements.length - 1];
  const weightChange = latestMeasurement && previousMeasurement
    ? latestMeasurement.weight - previousMeasurement.weight
    : 0;

  return (
    <div className="w-full bg-white min-h-screen pb-24 animate-fade-in">
      <div className="px-5 pt-6 pb-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-black uppercase mb-1">My Plan</h1>
          <p className="text-grey-200 text-xs uppercase tracking-widest">Your fitness journey</p>
        </div>

        {/* Sub Navigation - Horizontal Scrollable Pills */}
        <div ref={scrollContainerRef} className="overflow-x-auto -mx-5 px-5 pb-2">
          <div className="flex gap-2 min-w-max">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? 'bg-black text-white'
                    : 'bg-grey-300 text-grey-200 hover:text-black'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        {activeTab === 'Sessions' && (
          <div className="space-y-5">
            {/* Block Progress */}
            <div className="bg-grey-300 rounded-[12px] p-5">
              <p className="text-grey-200 text-xs font-bold uppercase mb-3">Session Block</p>
              <div className="mb-4">
                <div className="w-full h-3 bg-grey-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brazil-green transition-all"
                    style={{ width: `${blockProgress}%` }}
                  />
                </div>
              </div>
              <p className="text-4xl font-black text-black mb-1">{sessionsRemaining}</p>
              <p className="text-grey-200 text-xs">sessions remaining out of {sessions?.blocks?.total}</p>
            </div>

            {/* Upcoming Sessions */}
            <div>
              <p className="text-grey-200 text-xs font-bold uppercase mb-3">Upcoming Sessions</p>
              {sessions?.upcoming?.length ? (
                <div className="space-y-2">
                  {sessions.upcoming.slice(0, 3).map(session => (
                    <div key={session.id} className="bg-grey-300 rounded-[12px] p-4 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-black">{session.scheduled_time}</p>
                        <p className="text-xs text-grey-200">{new Date(session.scheduled_date).toLocaleDateString()}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-grey-200" />
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
              <p className="text-grey-200 text-xs font-bold uppercase mb-3">Recent Sessions</p>
              {sessions?.completed?.length ? (
                <div className="space-y-2">
                  {sessions.completed.slice(0, 3).map(session => (
                    <div key={session.id} className="bg-grey-300 rounded-[12px] p-4">
                      <p className="font-bold text-black">{session.scheduled_time}</p>
                      <p className="text-xs text-grey-200">{new Date(session.scheduled_date).toLocaleDateString()}</p>
                      <p className="text-xs text-brazil-green mt-1"> Completed</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-grey-300 rounded-[12px]">
                  <FileText className="w-8 h-8 text-grey-200 mx-auto mb-2" />
                  <p className="text-grey-100 text-sm">No sessions completed yet</p>
                </div>
              )}
            </div>

            {/* Renewal Reminder */}
            {sessionsRemaining <= 2 && (
              <div className="bg-brazil-yellow/10 border border-brazil-yellow rounded-[12px] p-4">
                <p className="font-bold text-black mb-1">Block Renewal Alert</p>
                <p className="text-sm text-grey-200">You have {sessionsRemaining} sessions left. Renew your block soon!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Progress' && (
          <div className="space-y-5">
            {/* Weight & Measurements */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-grey-300 rounded-[12px] p-4">
                <p className="text-grey-200 text-xs font-bold uppercase mb-2">Current Weight</p>
                <p className="text-3xl font-black text-black">{latestMeasurement?.weight || '-'}</p>
                {weightChange !== 0 && (
                  <p className={`text-xs mt-2 ${weightChange < 0 ? 'text-green-500' : 'text-orange-500'}`}>
                    {weightChange < 0 ? '' : ''} {Math.abs(weightChange).toFixed(1)} kg
                  </p>
                )}
              </div>
              <div className="bg-grey-300 rounded-[12px] p-4">
                <p className="text-grey-200 text-xs font-bold uppercase mb-2">Measurements</p>
                <p className="text-3xl font-black text-brazil-green">{measurements.length}</p>
                <p className="text-xs text-grey-200 mt-2">Logged</p>
              </div>
            </div>

            {/* Measurements Table */}
            {measurements.length > 0 && (
              <div className="bg-grey-300 rounded-[12px] p-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-grey-100">
                      <th className="text-left py-2 font-bold text-grey-100 text-xs">Date</th>
                      <th className="text-right py-2 font-bold text-grey-100 text-xs">Weight</th>
                      <th className="text-right py-2 font-bold text-grey-100 text-xs">Waist</th>
                    </tr>
                  </thead>
                  <tbody>
                    {measurements.map((m, i) => (
                      <tr key={i} className="border-b border-grey-100 last:border-0">
                        <td className="py-2 text-black">{new Date(m.date).toLocaleDateString()}</td>
                        <td className="text-right py-2 text-black font-bold">{m.weight}</td>
                        <td className="text-right py-2 text-black font-bold">{m.waist}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* PT Notes Card */}
            <div className="bg-brazil-green/10 border border-brazil-green rounded-[12px] p-4">
              <p className="font-bold text-black mb-2">Latest PT Notes</p>
              <p className="text-sm text-grey-200">Check your session notes for personalized feedback</p>
              <button className="text-xs font-bold text-brazil-green mt-3 hover:underline">View Notes</button>
            </div>

            {/* Log Button */}
            <button className="w-full bg-black text-white font-bold py-3 rounded-[12px] flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              Log This Week
            </button>
          </div>
        )}

        {activeTab === 'Habits' && (
          <div className="space-y-5">
            {/* 7-Day Streak */}
            <div className="bg-grey-300 rounded-[12px] p-4">
              <p className="text-grey-200 text-xs font-bold uppercase mb-4">7-Day Streak</p>
              <div className="flex gap-2 justify-between">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                  <div key={day} className="flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      i < 5 ? 'bg-brazil-green text-white' : 'bg-grey-100 text-grey-200'
                    }`}>
                      
                    </div>
                    <p className="text-[10px] font-bold text-grey-200">{day}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Habits Sliders */}
            <div className="bg-grey-300 rounded-[12px] p-4 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-black flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    Water Intake
                  </label>
                  <span className="text-xs font-bold text-grey-200">5/8 glasses</span>
                </div>
                <input type="range" min="0" max="8" defaultValue="5" className="w-full h-2 bg-grey-100 rounded-full" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-black flex items-center gap-2">
                    <Moon className="w-4 h-4 text-purple-500" />
                    Sleep Hours
                  </label>
                  <span className="text-xs font-bold text-grey-200">7/8 hours</span>
                </div>
                <input type="range" min="0" max="10" defaultValue="7" className="w-full h-2 bg-grey-100 rounded-full" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-black flex items-center gap-2">
                    <Footprints className="w-4 h-4 text-orange-500" />
                    Steps
                  </label>
                  <span className="text-xs font-bold text-grey-200">8500/10000</span>
                </div>
                <input type="range" min="0" max="15000" defaultValue="8500" className="w-full h-2 bg-grey-100 rounded-full" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-black flex items-center gap-2">
                    <Salad className="w-4 h-4 text-green-500" />
                    Vegetables
                  </label>
                  <span className="text-xs font-bold text-grey-200">3/5 portions</span>
                </div>
                <input type="range" min="0" max="10" defaultValue="3" className="w-full h-2 bg-grey-100 rounded-full" />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="bg-grey-300 rounded-[12px] p-4 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-5 h-5 accent-brazil-green rounded" />
                <span className="text-sm font-bold text-black">Alcohol-free today</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 accent-brazil-green rounded" />
                <span className="text-sm font-bold text-black">Medication taken</span>
              </label>
            </div>

            {/* Mood Rating */}
            <div className="bg-grey-300 rounded-[12px] p-4">
              <p className="text-sm font-bold text-black mb-3">How are you feeling today?</p>
              <div className="flex gap-2 justify-between">
                {['', '', '', '', ''].map((emoji, i) => (
                  <button key={i} className="text-2xl hover:scale-110 transition-transform">
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Food Diary' && (
          <div className="space-y-5">
            {/* Water Tracker */}
            <div className="bg-grey-300 rounded-[12px] p-4">
              <p className="text-sm font-bold text-black mb-3 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-500" />
                Water Intake
              </p>
              <div className="flex gap-2">
                {[...Array(8)].map((_, i) => (
                  <button key={i} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                    i < 5 ? 'bg-blue-500 border-blue-500 text-white' : 'border-grey-100'
                  }`}>
                    {i + 1}
                  </button>
                ))}
              </div>
              <p className="text-xs text-grey-200 mt-3">5 / 8 glasses</p>
            </div>

            {/* Daily Food Log */}
            <div>
              <p className="text-sm font-bold text-black mb-3 flex items-center gap-2">
                <Coffee className="w-4 h-4" />
                Today's Meals
              </p>
              <div className="space-y-2">
                {[
                  { time: '08:00', meal: 'Breakfast', mood: '' },
                  { time: '12:30', meal: 'Lunch', mood: '' },
                ].map((entry, i) => (
                  <div key={i} className="bg-grey-300 rounded-[12px] p-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-black text-sm">{entry.meal}</p>
                      <p className="text-xs text-grey-200">{entry.time}</p>
                    </div>
                    <span className="text-xl">{entry.mood}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Entry Button */}
            <button className="w-full bg-black text-white font-bold py-3 rounded-[12px] flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              Add Meal Entry
            </button>

            {/* Weekly History */}
            <div className="bg-grey-300 rounded-[12px] p-4">
              <p className="text-sm font-bold text-black mb-3">Weekly Average</p>
              <p className="text-grey-200 text-sm">3.2 meals per day  5.6 glasses water</p>
            </div>
          </div>
        )}

        {activeTab === 'Wellness' && (
          <div className="space-y-5">
            {/* Meditation */}
            <div className="bg-grey-300 rounded-[12px] p-5">
              <p className="text-sm font-bold text-black mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                Meditation
              </p>
              <p className="text-grey-200 text-xs mb-4">5 min guided breathing meditation</p>
              <button className="w-full bg-brazil-green text-white font-bold py-3 rounded-[12px] flex items-center justify-center gap-2">
                 Start Session
              </button>
            </div>

            {/* Breathing Exercise */}
            <div className="bg-grey-300 rounded-[12px] p-5">
              <p className="text-sm font-bold text-black mb-3">Breathing Exercise</p>
              <p className="text-grey-200 text-xs mb-4">4-7-8 breathing technique for calm</p>
              <div className="w-24 h-24 rounded-full border-4 border-brazil-green mx-auto mb-4 flex items-center justify-center">
                <p className="text-center text-sm font-bold">Breathe</p>
              </div>
              <button className="w-full bg-black text-white font-bold py-3 rounded-[12px]">Start Exercise</button>
            </div>

            {/* Wellness Tips */}
            <div className="bg-grey-300 rounded-[12px] p-4">
              <p className="text-sm font-bold text-black mb-3">Wellness Tip</p>
              <p className="text-sm text-grey-200">"Take 5 minutes to stretch after your workouts to improve flexibility and reduce soreness."</p>
            </div>

            {/* Rest Day */}
            <div className="bg-brazil-green/10 border border-brazil-green rounded-[12px] p-4">
              <p className="font-bold text-black mb-1">Today is a Rest Day</p>
              <p className="text-sm text-grey-200">Focus on recovery, hydration, and mental wellbeing. You've earned it!</p>
            </div>
          </div>
        )}

        {activeTab === 'Nutrition' && (
          <div className="space-y-5">
            {/* Featured Tip */}
            <div className="bg-gradient-to-br from-brazil-green to-brazil-green/80 rounded-[12px] p-5 text-white">
              <p className="text-xs font-bold uppercase mb-2 opacity-80">Tip of the Week</p>
              <h3 className="text-lg font-bold mb-2">Stay Hydrated</h3>
              <p className="text-sm opacity-90">Drinking enough water boosts metabolism and helps with recovery. Aim for 2-3 liters daily.</p>
            </div>

            {/* Meal Ideas */}
            <div>
              <p className="text-sm font-bold text-black mb-3">Meal Ideas</p>
              <div className="space-y-2">
                {[
                  { name: 'Grilled Chicken & Rice', protein: '35g', cal: '450cal' },
                  { name: 'Salmon with Vegetables', protein: '40g', cal: '520cal' },
                  { name: 'Protein Smoothie Bowl', protein: '28g', cal: '380cal' },
                ].map((meal, i) => (
                  <div key={i} className="bg-grey-300 rounded-[12px] p-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-black text-sm">{meal.name}</p>
                      <p className="text-xs text-grey-200">{meal.protein}  {meal.cal}</p>
                    </div>
                    <button className="text-grey-200 hover:text-black transition"></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Nutrition Tips Library */}
            <div className="bg-grey-300 rounded-[12px] p-4">
              <p className="text-sm font-bold text-black mb-3">Nutrition Tips</p>
              <div className="space-y-2">
                {['Eat protein with every meal', 'Meal prep for success', 'Read nutrition labels'].map((tip, i) => (
                  <button key={i} className="w-full text-left px-3 py-2 rounded-lg hover:bg-grey-100 transition text-sm text-grey-100">
                    {tip}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

