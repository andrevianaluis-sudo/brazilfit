import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Droplets, Moon, Footprints, Leaf, Crown, Flame, Check, Heart, TrendingUp, Activity, Apple } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import BackButton from '../../components/BackButton';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const MOODS = [
  { emoji: '😔', label: 'Exhausted' },
  { emoji: '😐', label: 'Tired' },
  { emoji: '🙂', label: 'Okay' },
  { emoji: '😊', label: 'Good' },
  { emoji: '🤩', label: 'Great' },
];

const ENERGY_EMOJIS = ['😴', '😴', '😕', '😕', '😊', '😊', '💪', '💪', '🔥', '🔥'];

export default function ClientHabits() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [habitData, setHabitData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    water_glasses: 0,
    sleep_hours: 7,
    steps: 0,
    veg_portions: 0,
    alcohol_free: false,
    mood_rating: 3,
    resting_heart_rate: null,
    hrv: null,
    energy_score: 5,
    blood_oxygen: 98,
    stress_level: 5,
    active_minutes: 0,
    nutrition_score: 5,
  });

  useEffect(() => {
    if (!user?.clientId) return;
    api.get(`/habits/${user.clientId}`)
      .then(r => {
        setHabitData(r.data);
        if (r.data.todayLog) {
          const l = r.data.todayLog;
          setForm({
            water_glasses: l.water_glasses || 0,
            sleep_hours: l.sleep_hours || 7,
            steps: l.steps || 0,
            veg_portions: l.veg_portions || 0,
            alcohol_free: l.alcohol_free === 1,
            mood_rating: l.mood_rating || 3,
            resting_heart_rate: l.resting_heart_rate || null,
            hrv: l.hrv || null,
            energy_score: l.energy_score || 5,
            blood_oxygen: l.blood_oxygen || 98,
            stress_level: l.stress_level || 5,
            active_minutes: l.active_minutes || 0,
            nutrition_score: l.nutrition_score || 5,
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  // Calculate wellness score
  const calculateWellness = () => {
    const metrics = [
      (form.sleep_hours || 0) / 8 * 10,
      form.energy_score || 0,
      (form.steps || 0) / 10000 * 10,
      (form.veg_portions || 0) / 5 * 10,
      (100 - (form.stress_level || 5)) / 10,
      (form.active_minutes || 0) / 60 * 10,
      form.nutrition_score || 0,
    ];
    const valid = metrics.filter(m => m > 0);
    return valid.length ? Math.round(valid.reduce((a, b) => a + b, 0) / valid.length) : 50;
  };

  // Generate insights
  const generateInsights = () => {
    const insights = [];
    if (habitData?.weeklyAverages) {
      const avg = habitData.weeklyAverages;

      if (parseFloat(avg.sleep) >= 7.5) {
        insights.push({ text: `Great sleep this week! Average ${avg.sleep} hours 🌙`, type: 'positive' });
      } else if (parseFloat(avg.sleep) < 6) {
        insights.push({ text: `Try to get more sleep – averaging ${avg.sleep} hours 😴`, type: 'warning' });
      }

      if (form.energy_score >= 7) {
        insights.push({ text: 'Your energy is high today – keep it up! 💪', type: 'positive' });
      } else if (form.energy_score <= 3) {
        insights.push({ text: 'Consider prioritizing rest today 🛏️', type: 'warning' });
      }

      if (parseInt(avg.steps) >= 8000) {
        insights.push({ text: `Excellent activity! ${Math.round(parseInt(avg.steps) / 1000)}k steps this week 🎯`, type: 'positive' });
      }
    }
    return insights.slice(0, 3);
  };

  const saveHabits = async () => {
    setSaving(true);
    try {
      await api.post('/habits', {
        ...form,
        alcohol_free: form.alcohol_free ? 1 : 0,
      });
      toast.success('Health metrics logged! 🎉');
      const res = await api.get(`/habits/${user.clientId}`);
      setHabitData(res.data);
    } catch {
      toast.error('Failed to save habits');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-brazil-green border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const streak = habitData?.streak || 0;
  const weekAvg = habitData?.weeklyAverages;
  const logs = habitData?.logs || [];
  const today = new Date().toISOString().split('T')[0];
  const wellnessScore = calculateWellness();
  const wellnessColor = wellnessScore >= 70 ? '#27AE60' : wellnessScore >= 40 ? '#F59E0B' : '#EF4444';

  // Chart data (last 7 days)
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const log = logs.find(l => l.log_date === dateStr);
    return {
      date: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }),
      sleep: log?.sleep_hours || 0,
      energy: log?.energy_score || 0,
      steps: log ? Math.round(log.steps / 1000) : 0,
      heart: log?.resting_heart_rate || 0,
      stress: log?.stress_level || 0,
    };
  });

  const getStreakMessage = () => {
    if (streak === 0) return { text: 'Every journey starts with a single step', color: '#999999' };
    if (streak <= 2) return { text: 'Every journey starts with a single step', color: '#999999' };
    if (streak <= 6) return { text: 'You are building momentum — keep going', color: '#F59E0B' };
    if (streak <= 13) return { text: 'One week strong — you are creating real habits', color: '#27AE60' };
    if (streak < 30) return { text: 'Two weeks of consistency — incredible', color: '#27AE60', bold: true };
    return { text: 'Elite level consistency — you are unstoppable', color: '#D4A574', bold: true };
  };

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const hasLog = logs.some(l => l.log_date === dateStr);
    return { date: dateStr, hasLog, isToday: dateStr === today };
  });

  const streakMsg = getStreakMessage();
  const insights = generateInsights();

  return (
    <div style={{ padding: '24px 20px', minHeight: '100vh', backgroundColor: 'white' }}>
      <BackButton to="/client/home" />
      <h1 style={{ fontSize: '32px', fontWeight: 300, color: '#000', marginBottom: '24px' }}>
        Health & Wellness
      </h1>

      {/* Wellness Score Card - TOP */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '28px',
        marginBottom: '24px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '12px', fontWeight: '600', color: '#999999', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px', margin: '0 0 16px 0' }}>
          Today's Wellness Score
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              border: `6px solid ${wellnessColor}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              fontWeight: 'bold',
              color: wellnessColor,
              position: 'relative',
              background: `conic-gradient(${wellnessColor} 0% ${wellnessScore}%, #E8E8E8 ${wellnessScore}% 100%)`
            }}>
              <div style={{
                width: '108px',
                height: '108px',
                borderRadius: '50%',
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '44px',
                fontWeight: 'bold',
                color: wellnessColor
              }}>
                {wellnessScore}
              </div>
            </div>
            <p style={{ fontSize: '12px', color: '#999999', marginTop: '8px', margin: '8px 0 0 0' }}>out of 100</p>
          </div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#333333', marginBottom: '8px', margin: '0 0 8px 0' }}>
              {wellnessScore >= 70 ? '🟢 Excellent' : wellnessScore >= 40 ? '🟡 Good' : '🔴 Needs attention'}
            </p>
            <p style={{ fontSize: '12px', color: '#999999', margin: 0, maxWidth: '200px' }}>
              {wellnessScore >= 70 ? 'Keep up your healthy habits!' : 'Focus on sleep and movement today'}
            </p>
          </div>
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {insights.map((insight, i) => (
            <div key={i} style={{
              backgroundColor: insight.type === 'positive' ? '#E8F5F0' : '#FFF8E8',
              borderLeft: `4px solid ${insight.type === 'positive' ? '#27AE60' : '#F59E0B'}`,
              borderRadius: '8px',
              padding: '12px 16px'
            }}>
              <p style={{ fontSize: '13px', color: '#333333', margin: 0 }}>{insight.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Motivational Banner */}
      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '28px', marginBottom: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <p style={{ fontSize: '20px', fontWeight: 400, color: '#666666', fontStyle: 'italic', marginBottom: '12px', margin: '0 0 12px 0' }}>
          Small daily habits create extraordinary results.
        </p>
        <p style={{ fontSize: '14px', color: '#999999', margin: 0 }}>
          Track all your health metrics and watch your wellness transform.
        </p>
      </div>

      {/* Streak Card */}
      <div style={{
        background: 'linear-gradient(135deg, #27AE60 0%, #1a8a4a 50%, #0d5c30 100%)',
        borderRadius: '16px',
        padding: '28px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        color: 'white',
        minHeight: '120px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.6), transparent)',
        }} />
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>🔥</div>
          <div style={{ fontSize: '48px', fontWeight: 'bold', lineHeight: 1 }}>{streak}</div>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '3px', marginTop: '8px', color: 'white', opacity: 0.8 }}>Day Streak</div>
        </div>
        <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', justifyContent: 'center' }}>
            {last7.map(({ date, hasLog, isToday }) => (
              <div key={date} style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: hasLog ? 'white' : 'transparent',
                border: isToday ? '2px solid rgba(255, 255, 255, 0.8)' : hasLog ? 'none' : '2px solid rgba(255, 255, 255, 0.3)',
                boxShadow: isToday ? '0 0 12px rgba(39, 174, 96, 0.4)' : 'none',
              }} />
            ))}
          </div>
          <p style={{ fontSize: '13px', color: 'white', fontStyle: 'italic', textAlign: 'center', margin: 0, opacity: 0.9 }}>
            {streakMsg.text}
          </p>
        </div>
      </div>

      {/* Weekly Summary Cards */}
      {weekAvg && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          <MetricCard icon="💧" label="Water" value={weekAvg.water} unit="glasses" color="#3B82F6" />
          <MetricCard icon="😴" label="Sleep" value={weekAvg.sleep} unit="h" color="#A78BFA" />
          <MetricCard icon="👟" label="Steps" value={Math.round(weekAvg.steps / 1000)} unit="k" color="#F59E0B" />
          <MetricCard icon="🥗" label="Veg" value={weekAvg.veg} unit="portions" color="#27AE60" />
          <MetricCard icon="❤️" label="Resting HR" value={weekAvg.heartRate} unit="bpm" color="#EF4444" />
          <MetricCard icon="⚡" label="Energy" value={weekAvg.energy} unit="/10" color="#27AE60" />
        </div>
      )}

      {/* Weekly Trends Charts */}
      <div style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <ChartContainer title="Sleep" color="#A78BFA">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" />
              <XAxis dataKey="date" stroke="#999999" style={{ fontSize: '12px' }} />
              <YAxis stroke="#999999" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#F5F5F5', border: 'none', borderRadius: '8px' }} />
              <Bar dataKey="sleep" fill="#A78BFA" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Energy Score" color="#27AE60">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" />
              <XAxis dataKey="date" stroke="#999999" style={{ fontSize: '12px' }} />
              <YAxis stroke="#999999" style={{ fontSize: '12px' }} domain={[0, 10]} />
              <Tooltip contentStyle={{ backgroundColor: '#F5F5F5', border: 'none', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="energy" stroke="#27AE60" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Daily Steps" color="#F59E0B">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" />
              <XAxis dataKey="date" stroke="#999999" style={{ fontSize: '12px' }} />
              <YAxis stroke="#999999" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#F5F5F5', border: 'none', borderRadius: '8px' }} formatter={v => `${v}k`} />
              <Bar dataKey="steps" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Resting Heart Rate" color="#EF4444">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" />
              <XAxis dataKey="date" stroke="#999999" style={{ fontSize: '12px' }} />
              <YAxis stroke="#999999" style={{ fontSize: '12px' }} domain={[40, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#F5F5F5', border: 'none', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="heart" stroke="#EF4444" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Today's Check-in */}
      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '28px', marginBottom: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <p style={{ fontSize: '10px', fontWeight: '600', color: '#1A1A2E', textTransform: 'uppercase', letterSpacing: '3px', margin: '0' }}>TODAY</p>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#27AE60' }} />
        </div>
        <p style={{ fontSize: '14px', color: '#999999', marginBottom: '24px', margin: '0 0 24px 0' }}>
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Original metrics */}
          <SliderContainer
            icon="💧"
            label="Water"
            educationText="Staying hydrated boosts energy and recovery"
            value={form.water_glasses}
            onChange={v => setForm(f => ({ ...f, water_glasses: v }))}
            min={0} max={12} step={1} unit="glasses" color="#3B82F6"
          />
          <SliderContainer
            icon="😴"
            label="Sleep"
            educationText="Quality sleep is when your body repairs"
            value={form.sleep_hours}
            onChange={v => setForm(f => ({ ...f, sleep_hours: v }))}
            min={0} max={12} step={0.5} unit="hours" color="#A78BFA"
          />
          <SliderContainer
            icon="👟"
            label="Steps"
            educationText="Daily movement accelerates results"
            value={form.steps}
            onChange={v => setForm(f => ({ ...f, steps: v }))}
            min={0} max={20000} step={500} unit="" color="#F59E0B"
          />
          <SliderContainer
            icon="🥗"
            label="Vegetables"
            educationText="Micronutrients from vegetables fuel your body"
            value={form.veg_portions}
            onChange={v => setForm(f => ({ ...f, veg_portions: v }))}
            min={0} max={10} step={1} unit="portions" color="#27AE60"
          />

          {/* New health metrics */}
          <div style={{ paddingTop: '12px', borderTop: '1px solid #E8E8E8' }}>
            <p style={{ fontSize: '12px', fontWeight: '600', color: '#27AE60', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', margin: '0 0 16px 0' }}>
              Advanced Metrics
            </p>
          </div>

          <NumberInput
            icon="❤️"
            label="Resting Heart Rate"
            educationText="Lower is generally better (60-100 bpm optimal)"
            value={form.resting_heart_rate}
            onChange={v => setForm(f => ({ ...f, resting_heart_rate: v }))}
            min={40} max={120} unit="bpm" color="#EF4444"
          />

          <NumberInput
            icon="💓"
            label="Heart Rate Variability"
            educationText="Higher HRV indicates better recovery (20-120 ms)"
            value={form.hrv}
            onChange={v => setForm(f => ({ ...f, hrv: v }))}
            min={20} max={120} unit="ms" color="#EF4444"
          />

          <SliderWithEmoji
            icon="⚡"
            label="Energy/Recovery Score"
            educationText="How recovered and energized do you feel?"
            value={form.energy_score}
            onChange={v => setForm(f => ({ ...f, energy_score: v }))}
            min={1} max={10} unit="/10" color="#27AE60"
          />

          <NumberInput
            icon="🩸"
            label="Blood Oxygen (SpO2)"
            educationText="Normal range is 95-100%"
            value={form.blood_oxygen}
            onChange={v => setForm(f => ({ ...f, blood_oxygen: v }))}
            min={90} max={100} unit="%" color="#3B82F6"
          />

          <SliderContainer
            icon="😌"
            label="Stress Level"
            educationText="1=very calm, 10=very stressed"
            value={form.stress_level}
            onChange={v => setForm(f => ({ ...f, stress_level: v }))}
            min={1} max={10} step={1} unit="/10" color="#F59E0B"
          />

          <NumberInput
            icon="🏃"
            label="Active Minutes"
            educationText="Minutes of intentional movement today"
            value={form.active_minutes}
            onChange={v => setForm(f => ({ ...f, active_minutes: v }))}
            min={0} max={300} unit="mins" color="#27AE60"
          />

          <SliderContainer
            icon="🍎"
            label="Nutrition Score"
            educationText="How well did you eat today?"
            value={form.nutrition_score}
            onChange={v => setForm(f => ({ ...f, nutrition_score: v }))}
            min={1} max={10} step={1} unit="/10" color="#27AE60"
          />

          {/* Alcohol Free Button */}
          <button
            onClick={() => setForm(f => ({ ...f, alcohol_free: !f.alcohol_free }))}
            style={{
              width: '100%',
              height: '56px',
              backgroundColor: form.alcohol_free ? '#27AE60' : 'white',
              color: form.alcohol_free ? 'white' : '#999999',
              fontWeight: '600',
              border: form.alcohol_free ? 'none' : '1px solid #D0D0D0',
              borderRadius: '28px',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
          >
            {form.alcohol_free && <Check size={20} />}
            Alcohol free today {form.alcohol_free ? 'confirmed' : 'tap to confirm'}
          </button>

          {/* Mood Selector */}
          <div style={{ paddingTop: '8px' }}>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#333333', marginBottom: '16px', margin: '0 0 16px 0' }}>How are you feeling?</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
              {MOODS.map((mood, i) => (
                <button
                  key={i}
                  onClick={() => setForm(f => ({ ...f, mood_rating: i + 1 }))}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: form.mood_rating === i + 1 ? ['#FF6B6B', '#FFA500', '#FFD700', '#27AE60', '#6366F1'][i] : 'white',
                    border: '2px solid #E0E0E0',
                    fontSize: '24px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {mood.emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button onClick={saveHabits} disabled={saving}
          style={{
            width: '100%',
            height: '56px',
            background: 'linear-gradient(135deg, #27AE60 0%, #1a8a4a 100%)',
            color: 'white',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
            marginTop: '28px',
            transition: 'all 0.2s ease',
          }}>
          {saving ? 'Saving...' : 'Save All Health Metrics'}
        </button>
        <p style={{ fontSize: '11px', color: '#999999', textAlign: 'center', marginTop: '12px', margin: '12px 0 0 0' }}>
          Your PT uses this data to optimize your programme
        </p>
      </div>

      {/* Why Habits Matter Section */}
      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderTop: '3px solid #27AE60', marginBottom: '40px' }}>
        <p style={{ fontSize: '10px', fontWeight: '600', color: '#27AE60', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '24px', margin: '0 0 24px 0' }}>
          Why Health Metrics Matter
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <HabitBenefit title="Sleep and recovery" desc="Determine 40% of your fitness results" />
          <HabitBenefit title="Daily movement" desc="Accelerates fat loss and improves recovery" />
          <HabitBenefit title="Nutrition tracking" desc="Helps you optimize your eating patterns" />
          <HabitBenefit title="Stress management" desc="Affects hormones, sleep and recovery" />
          <HabitBenefit title="Heart rate variability" desc="Indicates your autonomic nervous system health" />
          <HabitBenefit title="Your PT uses this" desc="The more complete your data, the better your programme" />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, unit, color }) {
  return (
    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontSize: '24px', marginBottom: '8px' }}>{icon}</div>
      <p style={{ fontSize: '20px', fontWeight: 'bold', color, marginBottom: '4px', margin: '0 0 4px 0' }}>{value} {unit}</p>
      <p style={{ fontSize: '11px', color: '#999999', margin: 0 }}>{label}</p>
    </div>
  );
}

function ChartContainer({ title, color, children }) {
  return (
    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      <p style={{ fontSize: '12px', fontWeight: '600', color: color, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', margin: '0 0 16px 0' }}>
        {title}
      </p>
      {children}
    </div>
  );
}

function SliderContainer({ icon, label, educationText, value, onChange, min, max, step, unit, color }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{ fontSize: '20px' }}>{icon}</span>
        <label style={{ fontSize: '15px', fontWeight: '600', color: '#333333' }}>{label}</label>
      </div>
      <p style={{ fontSize: '12px', color: '#999999', fontStyle: 'italic', marginBottom: '12px', margin: '0 0 12px 0' }}>
        {educationText}
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div />
        <span style={{ fontSize: '16px', fontWeight: 'bold', color }}>
          {value || 0} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value || 0}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{
          width: '100%',
          height: '3px',
          borderRadius: '2px',
          backgroundColor: '#E8E8E8',
          outline: 'none',
          accentColor: color,
          cursor: 'pointer',
          WebkitAppearance: 'none',
          appearance: 'none',
        }}
      />
      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: white;
          border: 2px solid ${color};
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: white;
          border: 2px solid ${color};
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}

function SliderWithEmoji({ icon, label, educationText, value, onChange, min, max, unit, color }) {
  const emoji = ENERGY_EMOJIS[Math.max(0, Math.min(value - 1, 9))];
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{ fontSize: '20px' }}>{icon}</span>
        <label style={{ fontSize: '15px', fontWeight: '600', color: '#333333' }}>{label}</label>
      </div>
      <p style={{ fontSize: '12px', color: '#999999', fontStyle: 'italic', marginBottom: '12px', margin: '0 0 12px 0' }}>
        {educationText}
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '24px' }}>{emoji}</span>
        <span style={{ fontSize: '16px', fontWeight: 'bold', color }}>
          {value || 0} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value || 0}
        onChange={e => onChange(parseInt(e.target.value))}
        style={{
          width: '100%',
          height: '3px',
          borderRadius: '2px',
          backgroundColor: '#E8E8E8',
          outline: 'none',
          accentColor: color,
          cursor: 'pointer',
          WebkitAppearance: 'none',
          appearance: 'none',
        }}
      />
      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: white;
          border: 2px solid ${color};
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}

function NumberInput({ icon, label, educationText, value, onChange, min, max, unit, color }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{ fontSize: '20px' }}>{icon}</span>
        <label style={{ fontSize: '15px', fontWeight: '600', color: '#333333' }}>{label}</label>
      </div>
      <p style={{ fontSize: '12px', color: '#999999', fontStyle: 'italic', marginBottom: '12px', margin: '0 0 12px 0' }}>
        {educationText}
      </p>
      <input
        type="number"
        min={min}
        max={max}
        value={value || ''}
        onChange={e => onChange(e.target.value ? parseInt(e.target.value) : null)}
        placeholder={`${min}-${max} ${unit}`}
        style={{
          width: '100%',
          height: '48px',
          border: '1px solid #D0D0D0',
          borderRadius: '12px',
          padding: '0 16px',
          fontSize: '16px',
          fontWeight: '600',
          color: color,
          outline: 'none',
          transition: 'all 0.2s ease'
        }}
        onFocus={e => e.target.style.borderColor = color}
        onBlur={e => e.target.style.borderColor = '#D0D0D0'}
      />
    </div>
  );
}

function HabitBenefit({ title, desc }) {
  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      <div style={{ marginTop: '2px', flexShrink: 0, fontSize: '20px', color: '#27AE60' }}>✓</div>
      <div>
        <p style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A1A', marginBottom: '4px', margin: '0 0 4px 0' }}>{title}</p>
        <p style={{ fontSize: '13px', color: '#999999', margin: 0 }}>{desc}</p>
      </div>
    </div>
  );
}
