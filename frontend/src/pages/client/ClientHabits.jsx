import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import BackButton from '../../components/BackButton';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const BG='#0f0f0f';
const SURFACE='#1a1a1a';
const SURFACE2='#222';
const BORDER='rgba(255,255,255,0.08)';
const TEXT = '#ffffff';
const MUTED='#606060';
const ORANGE = '#FF6B2B';
const YELLOW = '#FFD600';
const GREEN = '#4CAF50';

const MOODS = [
  { emoji: '', label: 'Exhausted' },
  { emoji: '', label: 'Tired' },
  { emoji: '', label: 'Okay' },
  { emoji: '', label: 'Good' },
  { emoji: '', label: 'Great' },
];

const ENERGY_EMOJIS = ['','','','','','','','','',''];

function Label({ children }) {
  return <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.18em', color: MUTED, textTransform: 'uppercase', margin: '0 0 0.4rem' }}>{children}</p>;
}

function Card({ children, style = {} }) {
  return <div style={{ backgroundColor: SURFACE, borderRadius: '14px', padding: '1.5rem', border: `1px solid ${BORDER}`, ...style }}>{children}</div>;
}

function SliderField({ icon, label, hint, value, onChange, min, max, step, unit, color, emoji }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <span style={{ fontSize: '1.1rem' }}>{icon}</span>
        <label style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.9rem', fontWeight: 600, color: '#c0c0c0' }}>{label}</label>
      </div>
      {hint && <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.72rem', color: MUTED, fontStyle: 'italic', margin: '0 0 0.6rem' }}>{hint}</p>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        {emoji ? <span style={{ fontSize: '1.25rem' }}>{emoji}</span> : <span />}
        <span style={{ fontFamily: "'DM Sans', system-ui", fontSize: '1.1rem', fontWeight: 800, color }}>{value || 0} {unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value || 0}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: color, cursor: 'pointer', background: 'transparent' }} />
    </div>
  );
}

function NumberField({ icon, label, hint, value, onChange, min, max, unit, color }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <span style={{ fontSize: '1.1rem' }}>{icon}</span>
        <label style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.9rem', fontWeight: 600, color: '#c0c0c0' }}>{label}</label>
      </div>
      {hint && <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.72rem', color: MUTED, fontStyle: 'italic', margin: '0 0 0.6rem' }}>{hint}</p>}
      <input type="number" min={min} max={max} value={value || ''} placeholder={`${min}${max} ${unit}`}
        onChange={e => onChange(e.target.value ? parseInt(e.target.value) : null)}
        style={{
          width: '100%', padding: '0.7rem 1rem', border: `1px solid ${BORDER}`, borderRadius: '8px',
          backgroundColor: SURFACE2, color, fontFamily: "'DM Sans', system-ui", fontSize: '1rem', fontWeight: 700,
          outline: 'none', transition: 'border-color 0.15s', boxSizing: 'border-box',
        }}
        onFocus={e => e.target.style.borderColor = color}
        onBlur={e => e.target.style.borderColor = BORDER} />
    </div>
  );
}

function MetricCard({ icon, label, value, unit, color }) {
  return (
    <div style={{ borderRadius: '16px', padding: '1rem', border: `1px solid ${color}30`, textAlign: 'center', background:`linear-gradient(135deg,${color}10,#1a1a1a)` }}>
      <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>{icon}</div>
      <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '1.4rem', fontWeight: 800, color, margin: '0 0 2px', letterSpacing: '-0.03em' }}>{value} <span style={{ fontSize: '0.75rem', opacity:0.7 }}>{unit}</span></p>
      <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.58rem', color: MUTED, margin: 0, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</p>
    </div>
  );
}

function ChartCard({ title, color, children }) {
  return (
    <div style={{ background:'#1a1a1a', borderRadius: '16px', padding: '1.25rem', border: `1px solid rgba(255,255,255,0.08)` }}>
      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'1rem' }}>
        <div style={{ width:'3px', height:'14px', borderRadius:'2px', background:`linear-gradient(180deg,${color},${color}88)` }}/>
        <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.16em', color, textTransform: 'uppercase', margin: 0 }}>{title}</p>
      </div>
      {children}
    </div>
  );
}

const tooltipStyle = { backgroundColor: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: '8px', color: TEXT, fontFamily: "'DM Sans', system-ui", fontSize: '0.75rem' };

export default function ClientHabits() {
  const { user } = useAuth();
  const [habitData, setHabitData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    water_glasses: 0, sleep_hours: 7, steps: 0, veg_portions: 0,
    alcohol_free: false, mood_rating: 3, resting_heart_rate: null,
    hrv: null, energy_score: 5, blood_oxygen: 98, stress_level: 5,
    active_minutes: 0, nutrition_score: 5,
  });

  useEffect(() => {
    if (!user?.clientId) return;
    Promise.all([
      api.get(`/habits/${user.clientId}`),
      api.get('/checkins/streak').catch(() => ({ data: { streak: 0 } })),
    ]).then(([habitsRes, streakRes]) => {
        setHabitData({ ...habitsRes.data, streak: streakRes.data.streak || 0 });
        if (habitsRes.data.todayLog) {
          const l = habitsRes.data.todayLog;
          setForm({
            water_glasses: l.water_glasses || 0, sleep_hours: l.sleep_hours || 7,
            steps: l.steps || 0, veg_portions: l.veg_portions || 0,
            alcohol_free: l.alcohol_free === 1, mood_rating: l.mood_rating || 3,
            resting_heart_rate: l.resting_heart_rate || null, hrv: l.hrv || null,
            energy_score: l.energy_score || 5, blood_oxygen: l.blood_oxygen || 98,
            stress_level: l.stress_level || 5, active_minutes: l.active_minutes || 0,
            nutrition_score: l.nutrition_score || 5,
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const calculateWellness = () => {
    const metrics = [
      (form.sleep_hours || 0) / 8 * 10, form.energy_score || 0,
      (form.steps || 0) / 10000 * 10, (form.veg_portions || 0) / 5 * 10,
      (10 - (form.stress_level || 5)), (form.active_minutes || 0) / 60 * 10,
      form.nutrition_score || 0,
    ];
    const valid = metrics.filter(m => m > 0);
    return valid.length ? Math.round(valid.reduce((a, b) => a + b) / valid.length * 10) : 50;
  };

  const saveHabits = async () => {
    setSaving(true);
    try {
      await api.post('/habits', { ...form, alcohol_free: form.alcohol_free ? 1 : 0 });
      toast.success('Health metrics logged! ');
      const res = await api.get(`/habits/${user.clientId}`);
      setHabitData(res.data);
    } catch { toast.error('Failed to save habits'); } finally { setSaving(false); }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', backgroundColor: BG }}>
      <div style={{ width: '20px', height: '20px', border: `2px solid ${ORANGE}`, borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  const streak = habitData?.streak || 0;
  const weekAvg = habitData?.weeklyAverages;
  const logs = habitData?.logs || [];
  const today = new Date().toISOString().split('T')[0];
  const wellnessScore = calculateWellness();
  const wellnessColor = wellnessScore >= 70 ? GREEN : wellnessScore >= 40 ? ORANGE : '#ef4444';

  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const log = logs.find(l => l.log_date === dateStr);
    return {
      date: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }),
      sleep: log?.sleep_hours || 0, energy: log?.energy_score || 0,
      steps: log ? Math.round(log.steps / 1000) : 0, heart: log?.resting_heart_rate || 0,
    };
  });

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    return { date: dateStr, hasLog: logs.some(l => l.log_date === dateStr), isToday: dateStr === today };
  });

  const insights = [];
  if (weekAvg) {
    if (parseFloat(weekAvg.sleep) >= 7.5) insights.push({ text: `Great sleep! Avg ${weekAvg.sleep}h this week `, type: 'positive' });
    else if (parseFloat(weekAvg.sleep) < 6) insights.push({ text: `Try to sleep more  averaging ${weekAvg.sleep}h `, type: 'warn' });
    if (form.energy_score >= 7) insights.push({ text: 'Your energy is high today  keep it up! ', type: 'positive' });
    if (parseInt(weekAvg.steps) >= 8000) insights.push({ text: `Excellent activity! ${Math.round(parseInt(weekAvg.steps)/1000)}k steps this week `, type: 'positive' });
  }

  return (
    <div style={{ backgroundColor: BG, minHeight: '100vh', paddingBottom: '6rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.25rem' }}>
        <BackButton to="/client" />

        {/* Header */}
        <div style={{ margin: '1.25rem 0 1.5rem' }}>
          <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.2em', color: ORANGE, textTransform: 'uppercase', margin: '0 0 6px' }}>Daily Tracking</p>
          <h1 style={{ fontFamily: "'DM Sans', system-ui", fontSize: '2.5rem', fontWeight: 800, color: TEXT, letterSpacing: '-0.05em', margin: 0, lineHeight: 1 }}>Health & Habits</h1>
        </div>

        {/* Wellness Score */}
        <Card style={{ marginBottom: '1rem', textAlign: 'center' }}>
          <Label>Today's Wellness Score</Label>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
            <div style={{ position: 'relative', width: '100px', height: '100px' }}>
              <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" fill="none" stroke={SURFACE2} strokeWidth="8" />
                <circle cx="50" cy="50" r="44" fill="none" stroke={wellnessColor} strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${2*Math.PI*44}`}
                  strokeDashoffset={`${2*Math.PI*44*(1-wellnessScore/100)}`}
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '1.75rem', fontWeight: 800, color: wellnessColor, margin: 0, lineHeight: 1 }}>{wellnessScore}</p>
                <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.6rem', color: MUTED, margin: 0 }}>/ 100</p>
              </div>
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.9rem', fontWeight: 700, color: wellnessColor, margin: '0 0 4px' }}>
                {wellnessScore >= 70 ? ' Excellent' : wellnessScore >= 40 ? ' Good' : ' Needs attention'}
              </p>
              <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.78rem', color: MUTED, margin: 0, maxWidth: '200px' }}>
                {wellnessScore >= 70 ? 'Keep up your healthy habits!' : 'Focus on sleep and movement today'}
              </p>
            </div>
          </div>
        </Card>

        {/* Insights */}
        {insights.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1rem' }}>
            {insights.map((ins, i) => (
              <div key={i} style={{ backgroundColor: ins.type === 'positive' ? `${GREEN}12` : `${ORANGE}12`, borderLeft: `3px solid ${ins.type === 'positive' ? GREEN : ORANGE}`, borderRadius: '8px', padding: '0.75rem 1rem' }}>
                <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.82rem', color: '#c0c0c0', margin: 0 }}>{ins.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* Streak */}
        <Card style={{ marginBottom: '1rem', background: `linear-gradient(135deg, ${ORANGE}18, ${YELLOW}08)`, borderColor: `${ORANGE}33` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '4px' }}></div>
              <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '2.5rem', fontWeight: 800, color: ORANGE, margin: 0, lineHeight: 1 }}>{streak}</p>
              <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.14em', color: MUTED, textTransform: 'uppercase', margin: '4px 0 0' }}>Check-in Streak</p>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', justifyContent: 'center' }}>
                {last7.map(({ date, hasLog, isToday }) => (
                  <div key={date} style={{
                    width: '26px', height: '26px', borderRadius: '50%',
                    backgroundColor: hasLog ? ORANGE : 'transparent',
                    border: `1px solid ${isToday ? ORANGE : hasLog ? ORANGE : BORDER}`,
                    boxShadow: isToday ? `0 0 8px ${ORANGE}66` : 'none',
                    opacity: hasLog ? 1 : 0.4,
                  }} />
                ))}
              </div>
              <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.8rem', color: '#c0c0c0', fontStyle: 'italic', textAlign: 'center', margin: 0 }}>
                {streak === 0 ? 'Every journey starts with a single step' :
                 streak <= 6 ? 'Building momentum  keep going!' :
                 streak <= 13 ? 'One week strong  real habits forming' :
                 'Elite consistency  you are unstoppable '}
              </p>
            </div>
          </div>
        </Card>

        {/* Weekly Summary */}
        {weekAvg && (
          <div style={{ marginBottom: '1rem' }}>
            <Label>Weekly Averages</Label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
              <MetricCard icon="" label="Water" value={weekAvg.water} unit="glasses" color="#60a5fa" />
              <MetricCard icon="" label="Sleep" value={weekAvg.sleep} unit="h" color="#a78bfa" />
              <MetricCard icon="" label="Steps" value={Math.round(weekAvg.steps/1000)} unit="k" color={YELLOW} />
              <MetricCard icon="" label="Veg" value={weekAvg.veg} unit="portions" color={GREEN} />
              <MetricCard icon="" label="Resting HR" value={weekAvg.heartRate} unit="bpm" color="#ef4444" />
              <MetricCard icon="" label="Energy" value={weekAvg.energy} unit="/10" color={ORANGE} />
            </div>
          </div>
        )}

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
          <ChartCard title="Sleep (hours)" color="#a78bfa">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                <XAxis dataKey="date" stroke={MUTED} style={{ fontSize: '11px' }} />
                <YAxis stroke={MUTED} style={{ fontSize: '11px' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="sleep" fill="#a78bfa" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Energy Score" color={ORANGE}>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                <XAxis dataKey="date" stroke={MUTED} style={{ fontSize: '11px' }} />
                <YAxis stroke={MUTED} style={{ fontSize: '11px' }} domain={[0,10]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="energy" stroke={ORANGE} dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Daily Steps (k)" color={YELLOW}>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                <XAxis dataKey="date" stroke={MUTED} style={{ fontSize: '11px' }} />
                <YAxis stroke={MUTED} style={{ fontSize: '11px' }} />
                <Tooltip contentStyle={tooltipStyle} formatter={v => `${v}k`} />
                <Bar dataKey="steps" fill={YELLOW} radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Resting Heart Rate" color="#ef4444">
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                <XAxis dataKey="date" stroke={MUTED} style={{ fontSize: '11px' }} />
                <YAxis stroke={MUTED} style={{ fontSize: '11px' }} domain={[40,100]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="heart" stroke="#ef4444" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Today's log */}
        <Card style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
            <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.18em', color: ORANGE, textTransform: 'uppercase', margin: 0 }}>Today</p>
            <div style={{ flex: 1, height: '1px', background: `linear-gradient(90deg, ${ORANGE}, transparent)` }} />
            <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.75rem', color: MUTED, margin: 0 }}>{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <SliderField icon="" label="Water" hint="Staying hydrated boosts energy and recovery" value={form.water_glasses} onChange={v => setForm(f => ({...f, water_glasses: v}))} min={0} max={12} step={1} unit="glasses" color="#60a5fa" />
            <SliderField icon="" label="Sleep" hint="Quality sleep is when your body repairs" value={form.sleep_hours} onChange={v => setForm(f => ({...f, sleep_hours: v}))} min={0} max={12} step={0.5} unit="hours" color="#a78bfa" />
            <SliderField icon="" label="Steps" hint="Daily movement accelerates results" value={form.steps} onChange={v => setForm(f => ({...f, steps: v}))} min={0} max={20000} step={500} unit="" color={YELLOW} />
            <SliderField icon="" label="Vegetables" hint="Micronutrients from veg fuel your body" value={form.veg_portions} onChange={v => setForm(f => ({...f, veg_portions: v}))} min={0} max={10} step={1} unit="portions" color={GREEN} />

            <div style={{ height: '1px', backgroundColor: BORDER }} />
            <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.16em', color: ORANGE, textTransform: 'uppercase', margin: 0 }}>Advanced Metrics</p>

            <NumberField icon="" label="Resting Heart Rate" hint="Lower is generally better (60100 bpm)" value={form.resting_heart_rate} onChange={v => setForm(f => ({...f, resting_heart_rate: v}))} min={40} max={120} unit="bpm" color="#ef4444" />
            <NumberField icon="" label="Heart Rate Variability" hint="Higher HRV = better recovery (20120 ms)" value={form.hrv} onChange={v => setForm(f => ({...f, hrv: v}))} min={20} max={120} unit="ms" color="#ef4444" />
            <SliderField icon="" label="Energy / Recovery" hint="How recovered and energized do you feel?" value={form.energy_score} onChange={v => setForm(f => ({...f, energy_score: v}))} min={1} max={10} step={1} unit="/10" color={ORANGE} emoji={ENERGY_EMOJIS[Math.max(0, Math.min(form.energy_score-1, 9))]} />
            <NumberField icon="" label="Blood Oxygen (SpO2)" hint="Normal range is 95100%" value={form.blood_oxygen} onChange={v => setForm(f => ({...f, blood_oxygen: v}))} min={90} max={100} unit="%" color="#60a5fa" />
            <SliderField icon="" label="Stress Level" hint="1 = very calm, 10 = very stressed" value={form.stress_level} onChange={v => setForm(f => ({...f, stress_level: v}))} min={1} max={10} step={1} unit="/10" color={YELLOW} />
            <NumberField icon="" label="Active Minutes" hint="Minutes of intentional movement today" value={form.active_minutes} onChange={v => setForm(f => ({...f, active_minutes: v}))} min={0} max={300} unit="mins" color={GREEN} />
            <SliderField icon="" label="Nutrition Score" hint="How well did you eat today?" value={form.nutrition_score} onChange={v => setForm(f => ({...f, nutrition_score: v}))} min={1} max={10} step={1} unit="/10" color={GREEN} />

            <div style={{ height: '1px', backgroundColor: BORDER }} />

            {/* Alcohol free */}
            <button onClick={() => setForm(f => ({...f, alcohol_free: !f.alcohol_free}))} style={{
              width: '100%', padding: '0.875rem',
              backgroundColor: form.alcohol_free ? `${GREEN}22` : SURFACE2,
              border: `1px solid ${form.alcohol_free ? GREEN : BORDER}`,
              borderRadius: '10px', color: form.alcohol_free ? GREEN : MUTED,
              fontFamily: "'DM Sans', system-ui", fontSize: '0.875rem', fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '8px', transition: 'all 0.15s ease', minHeight: 'auto',
            }}>
              {form.alcohol_free && <Check size={16} />}
              {form.alcohol_free ? 'Alcohol free today ' : 'Tap to confirm alcohol free'}
            </button>

            {/* Mood */}
            <div>
              <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.875rem', fontWeight: 600, color: '#c0c0c0', margin: '0 0 0.75rem' }}>How are you feeling?</p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
                {MOODS.map((mood, i) => {
                  const colors = ['#ef4444','#FF6B2B','#FFD600','#4CAF50','#a78bfa'];
                  const isSelected = form.mood_rating === i + 1;
                  return (
                    <button key={i} onClick={() => setForm(f => ({...f, mood_rating: i+1}))} style={{
                      flex: 1, padding: '10px 4px', borderRadius: '10px',
                      backgroundColor: isSelected ? `${colors[i]}22` : SURFACE2,
                      border: `1px solid ${isSelected ? colors[i] : BORDER}`,
                      fontSize: '1.5rem', cursor: 'pointer', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: '4px', transition: 'all 0.15s ease', minHeight: 'auto',
                    }}>
                      <span>{mood.emoji}</span>
                      <span style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.6rem', color: isSelected ? colors[i] : MUTED, fontWeight: 600 }}>{mood.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Save */}
          <button onClick={saveHabits} disabled={saving} style={{
            width: '100%', padding: '1rem', marginTop: '1.5rem',
            background: `linear-gradient(135deg, ${ORANGE}, ${YELLOW})`,
            border: 'none', borderRadius: '10px', color: '#000',
            fontFamily: "'DM Sans', system-ui", fontSize: '0.9rem', fontWeight: 800,
            cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
            minHeight: 'auto', transition: 'all 0.15s',
          }}>
            {saving ? 'Saving...' : 'Save All Health Metrics'}
          </button>
          <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.7rem', color: MUTED, textAlign: 'center', margin: '10px 0 0' }}>Your PT uses this data to optimise your programme</p>
        </Card>

        {/* Why it matters */}
        <Card style={{ borderTop: `3px solid ${ORANGE}` }}>
          <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.18em', color: ORANGE, textTransform: 'uppercase', margin: '0 0 1rem' }}>Why Health Metrics Matter</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {[
              ['Sleep and recovery', 'Determines 40% of your fitness results'],
              ['Daily movement', 'Accelerates fat loss and improves recovery'],
              ['Nutrition tracking', 'Helps optimise your eating patterns'],
              ['Stress management', 'Affects hormones, sleep and recovery'],
              ['Heart rate variability', 'Indicates your autonomic nervous system health'],
              ['Your PT uses this data', 'The more complete your data, the better your programme'],
            ].map(([title, desc], i) => (
              <div key={i} style={{ display: 'flex', gap: '10px' }}>
                <span style={{ color: ORANGE, fontWeight: 700, flexShrink: 0, marginTop: '2px' }}></span>
                <div>
                  <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.875rem', fontWeight: 700, color: TEXT, margin: '0 0 2px' }}>{title}</p>
                  <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.78rem', color: MUTED, margin: 0 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}


