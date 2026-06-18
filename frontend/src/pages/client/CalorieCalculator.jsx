import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const SURFACE = '#1a1a1a';
const BORDER = 'rgba(255,255,255,0.08)';
const TEXT = '#ffffff';
const MUTED = '#707070';
const ORANGE = '#FF6B2B';
const GREEN = '#4CAF50';

const ACTIVITY = [
  { key: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
  { key: 'light', label: 'Light', desc: 'Exercise 1–3 days/week' },
  { key: 'moderate', label: 'Moderate', desc: 'Exercise 3–5 days/week' },
  { key: 'active', label: 'Active', desc: 'Exercise 6–7 days/week' },
  { key: 'very_active', label: 'Very active', desc: 'Hard exercise daily / physical job' },
];

export default function CalorieCalculator() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ height_cm: '', age: '', sex: '', activity_level: '', deficit_preference: 500, calorie_goal: 'lose', weight_kg: null });
  const [calories, setCalories] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.clientId) return;
    api.get('/progress/calorie-profile/' + user.clientId)
      .then(r => {
        const p = r.data.profile || {};
        setProfile({
          height_cm: p.height_cm || '',
          age: p.age || '',
          sex: p.sex || '',
          activity_level: p.activity_level || '',
          deficit_preference: p.deficit_preference || 500,
          calorie_goal: p.calorie_goal || 'lose',
          weight_kg: p.weight_kg || null,
        });
        setCalories(r.data.calories);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  const save = async () => {
    if (!profile.height_cm || !profile.age || !profile.sex || !profile.activity_level) {
      toast.error('Please fill in all fields');
      return;
    }
    setSaving(true);
    try {
      const r = await api.post('/progress/calorie-profile/' + user.clientId, profile);
      setCalories(r.data.calories);
      if (r.data.profile) setProfile(p => ({ ...p, weight_kg: r.data.profile.weight_kg }));
      toast.success('Calculated!');
    } catch (e) {
      toast.error('Failed to calculate');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = { width: '100%', padding: '0.65rem', background: '#0f0f0f', border: `1px solid ${BORDER}`, borderRadius: 8, color: TEXT, fontSize: '0.9rem', boxSizing: 'border-box' };
  const labelStyle = { fontSize: 11, color: MUTED, display: 'block', marginBottom: 5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' };

  const isGain = profile.calorie_goal === 'gain';
  // Pace options depend on goal: lose -300/-500, gain +250/+500
  const paceOptions = isGain
    ? [{ v: 250, l: 'Gentle', d: '~0.25kg/week gain' }, { v: 500, l: 'Moderate', d: '~0.5kg/week gain' }]
    : [{ v: 300, l: 'Gentle', d: '~0.3kg/week loss' }, { v: 500, l: 'Moderate', d: '~0.5kg/week loss' }];

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem 0', color: MUTED }}>Loading...</div>;

  return (
    <div>
      {/* Result card */}
      {calories && (
        <div style={{ background: `linear-gradient(135deg, rgba(76,175,80,0.12), rgba(255,107,43,0.08))`, border: `1px solid rgba(76,175,80,0.3)`, borderRadius: 16, padding: '1.5rem', marginBottom: '1.25rem' }}>
          <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.2em', color: GREEN, textTransform: 'uppercase', margin: '0 0 12px' }}>Your daily target</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: '2.8rem', fontWeight: 800, color: TEXT, lineHeight: 1, letterSpacing: '-0.04em' }}>{calories.target}</span>
            <span style={{ fontSize: '0.9rem', color: MUTED, fontWeight: 600 }}>kcal / day</span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 12px' }}>
              <div style={{ fontSize: '0.58rem', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>BMR (at rest)</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: TEXT, marginTop: 2 }}>{calories.bmr}</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 12px' }}>
              <div style={{ fontSize: '0.58rem', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Maintenance</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: TEXT, marginTop: 2 }}>{calories.tdee}</div>
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#aaa', margin: '14px 0 0' }}>
            {calories.goal === 'gain'
              ? `Based on a ${calories.deficit} kcal daily surplus for steady, lean muscle gain.`
              : `Based on a ${calories.deficit} kcal daily deficit for steady, sustainable fat loss.`}
          </p>
        </div>
      )}

      {/* Input form */}
      <div style={{ background: SURFACE, borderRadius: 16, padding: '1.5rem', border: `1px solid ${BORDER}`, marginBottom: '1.25rem' }}>
        <h3 style={{ color: TEXT, fontWeight: 600, fontSize: '1.05rem', margin: '0 0 4px' }}>Your details</h3>
        <p style={{ color: MUTED, fontSize: 13, margin: '0 0 1.25rem' }}>
          We use your latest logged weight{profile.weight_kg ? ` (${profile.weight_kg}kg)` : ''} plus the details below.
        </p>

        {!profile.weight_kg && (
          <div style={{ background: 'rgba(255,107,43,0.1)', border: '1px solid rgba(255,107,43,0.3)', borderRadius: 8, padding: '10px 12px', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.78rem', color: ORANGE, margin: 0 }}>Log a weight entry first (tap “Add” on the Stats tab) so we can calculate your target.</p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={labelStyle}>Height (cm)</label>
            <input type="number" value={profile.height_cm} onChange={e => setProfile({ ...profile, height_cm: e.target.value })} placeholder="170" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Age</label>
            <input type="number" value={profile.age} onChange={e => setProfile({ ...profile, age: e.target.value })} placeholder="35" style={inputStyle} />
          </div>
        </div>

        <label style={labelStyle}>Sex</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {['male', 'female'].map(s => (
            <button key={s} onClick={() => setProfile({ ...profile, sex: s })} style={{
              flex: 1, padding: '0.6rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, textTransform: 'capitalize',
              background: profile.sex === s ? 'rgba(76,175,80,0.18)' : 'rgba(255,255,255,0.04)',
              color: profile.sex === s ? GREEN : '#aaa',
              border: profile.sex === s ? '1px solid rgba(76,175,80,0.4)' : `1px solid ${BORDER}`,
            }}>{s}</button>
          ))}
        </div>

        <label style={labelStyle}>Activity level</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
          {ACTIVITY.map(a => (
            <button key={a.key} onClick={() => setProfile({ ...profile, activity_level: a.key })} style={{
              padding: '0.6rem 0.8rem', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
              background: profile.activity_level === a.key ? 'rgba(76,175,80,0.18)' : 'rgba(255,255,255,0.04)',
              border: profile.activity_level === a.key ? '1px solid rgba(76,175,80,0.4)' : `1px solid ${BORDER}`,
            }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: profile.activity_level === a.key ? GREEN : TEXT }}>{a.label}</span>
              <span style={{ fontSize: '0.72rem', color: MUTED, marginLeft: 8 }}>{a.desc}</span>
            </button>
          ))}
        </div>

        {/* Goal: lose or gain */}
        <label style={labelStyle}>Your goal</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {[{ k: 'lose', l: 'Lose weight' }, { k: 'gain', l: 'Gain weight' }].map(g => (
            <button key={g.k} onClick={() => setProfile({ ...profile, calorie_goal: g.k, deficit_preference: g.k === 'gain' ? 250 : 300 })} style={{
              flex: 1, padding: '0.7rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700,
              background: profile.calorie_goal === g.k ? 'rgba(76,175,80,0.18)' : 'rgba(255,255,255,0.04)',
              color: profile.calorie_goal === g.k ? GREEN : '#aaa',
              border: profile.calorie_goal === g.k ? '1px solid rgba(76,175,80,0.4)' : `1px solid ${BORDER}`,
            }}>{g.l}</button>
          ))}
        </div>

        <label style={labelStyle}>{isGain ? 'Gain pace' : 'Loss pace'}</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {paceOptions.map(o => (
            <button key={o.v} onClick={() => setProfile({ ...profile, deficit_preference: o.v })} style={{
              flex: 1, padding: '0.7rem', borderRadius: 8, cursor: 'pointer',
              background: profile.deficit_preference === o.v ? 'rgba(76,175,80,0.18)' : 'rgba(255,255,255,0.04)',
              border: profile.deficit_preference === o.v ? '1px solid rgba(76,175,80,0.4)' : `1px solid ${BORDER}`,
            }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: profile.deficit_preference === o.v ? GREEN : TEXT }}>{o.l}</div>
              <div style={{ fontSize: '0.7rem', color: MUTED, marginTop: 2 }}>{o.d}</div>
            </button>
          ))}
        </div>

        <button onClick={save} disabled={saving} style={{
          width: '100%', padding: '0.85rem', background: `linear-gradient(135deg,${ORANGE},#FFD600)`, border: 'none', borderRadius: 12, color: '#000', fontSize: '0.9rem', fontWeight: 800, cursor: 'pointer',
        }}>{saving ? 'Calculating…' : 'Calculate my target'}</button>
      </div>

      {/* Disclaimer */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '1rem 1.2rem' }}>
        <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: MUTED, textTransform: 'uppercase', margin: '0 0 6px' }}>Please note</p>
        <p style={{ fontSize: '0.78rem', color: '#999', lineHeight: 1.6, margin: 0 }}>
          This is an estimate for general guidance only, calculated using the Mifflin-St Jeor equation. Individual needs vary. It is not medical or dietary advice — please consult a qualified healthcare or nutrition professional before making significant changes to your diet.
        </p>
      </div>
    </div>
  );
}
