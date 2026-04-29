import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Check, Plus, Trophy, AlertCircle, Target, Calendar, Lock, ArrowRight } from 'lucide-react';
import BackButton from '../../components/BackButton';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const BG = '#141414';
const SURFACE = '#1e1e1e';
const SURFACE2 = '#272727';
const BORDER = 'rgba(255,255,255,0.1)';
const TEXT = '#ffffff';
const MUTED = '#707070';
const ORANGE = '#FF6B2B';
const GREEN = '#4CAF50';
const YELLOW = '#FFD600';

function QuestionCard({ label, title, children }) {
  return (
    <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '16px', padding: '1.5rem', borderLeft: `3px solid ${ORANGE}` }}>
      <p style={{ fontFamily: "'Satoshi', system-ui", fontSize: '0.6rem', fontWeight: 700, color: ORANGE, letterSpacing: '0.18em', textTransform: 'uppercase', margin: '0 0 0.5rem' }}>{label}</p>
      <h3 style={{ fontFamily: "'Clash Display', system-ui", fontSize: '1.1rem', fontWeight: 700, color: TEXT, letterSpacing: '-0.02em', margin: '0 0 1.25rem' }}>{title}</h3>
      {children}
    </div>
  );
}

function EmojiSelector({ emojis, labels, selected, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
      {emojis.map((emoji, idx) => (
        <button key={idx} type="button" onClick={() => onChange(emoji)} style={{
          flex: '1 1 calc(20% - 8px)', minWidth: '56px', padding: '10px 4px',
          backgroundColor: selected === emoji ? `${ORANGE}22` : SURFACE2,
          border: `1px solid ${selected === emoji ? ORANGE : BORDER}`,
          borderRadius: '10px', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
          transition: 'all 0.15s ease', minHeight: 'auto',
        }}>
          <span style={{ fontSize: '1.75rem' }}>{emoji}</span>
          <span style={{ fontFamily: "'Satoshi', system-ui", fontSize: '0.65rem', fontWeight: 600, color: selected === emoji ? ORANGE : MUTED, textAlign: 'center' }}>{labels[idx]}</span>
        </button>
      ))}
    </div>
  );
}

function LifestyleSliders({ formData, setFormData }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {[
        { key: 'sleep_hours', label: 'Sleep hours per night', min: 0, max: 12, step: 0.5, unit: 'h', format: v => v },
        { key: 'water_glasses', label: 'Water glasses per day', min: 0, max: 15, step: 1, unit: '', format: v => v },
        { key: 'daily_steps', label: 'Daily steps', min: 0, max: 20000, step: 500, unit: 'k', format: v => (v/1000).toFixed(0) },
      ].map(item => (
        <div key={item.key}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <label style={{ fontFamily: "'Satoshi', system-ui", fontSize: '0.875rem', fontWeight: 500, color: '#c0c0c0' }}>{item.label}</label>
            <span style={{ fontFamily: "'Clash Display', system-ui", fontSize: '1.2rem', fontWeight: 800, color: ORANGE }}>{item.format(formData[item.key])}{item.unit}</span>
          </div>
          <input type="range" min={item.min} max={item.max} step={item.step} value={formData[item.key]}
            onChange={e => setFormData({ ...formData, [item.key]: parseFloat(e.target.value) })}
            style={{ width: '100%', accentColor: ORANGE, cursor: 'pointer', background: 'transparent' }} />
        </div>
      ))}
    </div>
  );
}

function MindsetScales({ formData, setFormData }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {[
        { key: 'motivation_score', label: 'Motivation', color: GREEN },
        { key: 'stress_score', label: 'Stress', color: YELLOW },
      ].map(item => (
        <div key={item.key}>
          <p style={{ fontFamily: "'Satoshi', system-ui", fontSize: '0.875rem', fontWeight: 600, color: '#c0c0c0', margin: '0 0 0.75rem' }}>{item.label}</p>
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'space-between' }}>
            {[...Array(10)].map((_, i) => {
              const num = i + 1;
              const isSelected = formData[item.key] === num;
              return (
                <button key={num} type="button" onClick={() => setFormData({ ...formData, [item.key]: num })} style={{
                  width: '34px', height: '34px', borderRadius: '50%', border: `1px solid ${isSelected ? item.color : BORDER}`,
                  backgroundColor: isSelected ? item.color : SURFACE2,
                  color: isSelected ? '#000' : MUTED,
                  fontWeight: isSelected ? 800 : 500, fontSize: '0.8rem',
                  cursor: 'pointer', transition: 'all 0.15s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: 0, minHeight: 'auto', minWidth: 'auto',
                }}>{num}</button>
              );
            })}
          </div>
          <p style={{ fontFamily: "'Satoshi', system-ui", fontSize: '0.7rem', color: MUTED, margin: '0.5rem 0 0' }}>1 is Low · 10 is High</p>
        </div>
      ))}
    </div>
  );
}

function DynamicInputList({ items, setItems, placeholder, bullet, maxItems, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {items.map((item, idx) => (
        <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center', paddingBottom: '12px', marginBottom: '12px', borderBottom: `1px solid ${BORDER}` }}>
          <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{bullet}</span>
          <input type="text" value={item}
            onChange={e => { const n = [...items]; n[idx] = e.target.value; setItems(n); }}
            placeholder={placeholder}
            style={{
              flex: 1, padding: '0', border: 'none', borderRadius: '0',
              backgroundColor: 'transparent', color: TEXT,
              fontFamily: "'Satoshi', system-ui", fontSize: '0.9rem', outline: 'none',
            }} />
        </div>
      ))}
      {items.length < maxItems && (
        <button type="button" onClick={() => setItems([...items, ''])} style={{
          display: 'flex', alignItems: 'center', gap: '6px', color: ORANGE,
          backgroundColor: 'transparent', border: 'none', cursor: 'pointer',
          fontFamily: "'Satoshi', system-ui", fontSize: '0.85rem', fontWeight: 600,
          padding: '8px 0 0', minHeight: 'auto',
        }}>
          <Plus size={14} /> {label}
        </button>
      )}
    </div>
  );
}

export default function ClientCheckIn() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentCheckIn, setCurrentCheckIn] = useState(null);
  const [currentWeek, setCurrentWeek] = useState('');
  const [mondayDate, setMondayDate] = useState('');

  const [formData, setFormData] = useState({
    goals_achieved: '', goals_barrier: '',
    workouts_completed: 'all', workouts_felt: '', workouts_notes: '',
    sleep_hours: 7, water_glasses: 8, daily_steps: 8000,
    alcohol_free: false, ate_breakfast: false, limited_processed: false,
    motivation_score: 7, stress_score: 5,
    overall_mood: '', motivation_factors: '',
    wins: ['', '', ''], challenges: ['', '', ''], next_week_goals: ['', '', ''],
  });

  useEffect(() => { fetchCheckIn(); }, []);

  const fetchCheckIn = async () => {
    try {
      setLoading(true);
      const res = await api.get('/checkins/current');
      setCurrentWeek(res.data.currentWeek);
      setMondayDate(res.data.mondayDate);
      if (res.data.checkin) { setCurrentCheckIn(res.data.checkin); setSubmitted(true); }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const filledWins = formData.wins.filter(w => w.trim());
    if (filledWins.length < 1) { toast.error('Please add at least 1 win'); return; }
    try {
      setSubmitting(true);
      await api.post('/checkins/submit', {
        checkin_week: currentWeek, ...formData,
        wins: JSON.stringify(filledWins),
        challenges: JSON.stringify(formData.challenges.filter(c => c.trim())),
        next_week_goals: JSON.stringify(formData.next_week_goals.filter(g => g.trim())),
        workouts_felt: formData.workouts_felt || null,
        overall_mood: formData.overall_mood || null,
      });
      setSubmitted(true);
      toast.success('Check-in submitted!');
      setTimeout(() => fetchCheckIn(), 1000);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit check-in');
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', backgroundColor: BG }}>
      <div style={{ width: '20px', height: '20px', border: `2px solid ${ORANGE}`, borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  // Success screen
  if (submitted && currentCheckIn) {
    const streak = currentCheckIn?.streak || 0;
    const currentRank = currentCheckIn?.rank || 7;
    return (
      <div style={{ backgroundColor: BG, minHeight: '100vh', padding: '2rem 1.25rem', paddingBottom: '6rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>

          {/* Hero */}
          <div style={{ textAlign: 'center', padding: '2rem 0 2.5rem' }}>
            <div style={{
              width: '80px', height: '80px', margin: '0 auto 1.25rem',
              background: `linear-gradient(135deg, ${ORANGE}, ${YELLOW})`,
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 8px 32px ${ORANGE}44`,
            }}>
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#000' }}>✓</span>
            </div>
            <h2 style={{ fontFamily: "'Clash Display', system-ui", fontSize: '1.75rem', fontWeight: 700, color: TEXT, letterSpacing: '-0.03em', margin: '0 0 0.5rem' }}>Check-in Submitted!</h2>
            <p style={{ fontFamily: "'Satoshi', system-ui", fontSize: '0.9rem', color: ORANGE, fontWeight: 600, margin: '0 0 0.35rem' }}>Great work this week</p>
            <p style={{ fontFamily: "'Satoshi', system-ui", fontSize: '0.8rem', color: MUTED, margin: 0 }}>Your PT will review your answers and respond soon</p>
          </div>

          {/* Streak card */}
          <div style={{ background: `linear-gradient(135deg, ${ORANGE}22, ${YELLOW}11)`, border: `1px solid ${ORANGE}33`, borderRadius: '16px', padding: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '4px' }}>🔥</div>
              <div style={{ fontFamily: "'Clash Display', system-ui", fontSize: '2.5rem', fontWeight: 800, color: ORANGE, lineHeight: 1 }}>{streak}</div>
              <div style={{ fontFamily: "'Satoshi', system-ui", fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: MUTED, marginTop: '4px' }}>Week Streak</div>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: "'Satoshi', system-ui", fontSize: '0.9rem', fontWeight: 600, color: TEXT, margin: '0 0 4px' }}>Keep it up — you're building something special</p>
              <p style={{ fontFamily: "'Satoshi', system-ui", fontSize: '0.78rem', color: MUTED, margin: 0, fontStyle: 'italic' }}>Your PT can see your consistency — it matters</p>
            </div>
          </div>

          {/* Leaderboard */}
          <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '16px', padding: '1.5rem', marginBottom: '1rem' }}>
            <p style={{ fontFamily: "'Satoshi', system-ui", fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.18em', color: YELLOW, textTransform: 'uppercase', margin: '0 0 0.75rem' }}>👑 Community Leaderboard</p>
            <h3 style={{ fontFamily: "'Clash Display', system-ui", fontSize: '1.1rem', fontWeight: 700, color: TEXT, letterSpacing: '-0.02em', margin: '0 0 1rem' }}>You are climbing the ranks</h3>
            <div style={{ marginBottom: '1rem' }}>
              {[['🥇', 'Anonymous Client', '487 pts'], ['🥈', 'Anonymous Client', '456 pts'], ['🥉', 'Anonymous Client', '421 pts']].map(([medal, name, pts], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: `1px solid ${BORDER}` }}>
                  <span>{medal}</span>
                  <span style={{ flex: 1, fontFamily: "'Satoshi', system-ui", fontSize: '0.875rem', color: '#c0c0c0' }}>{name}</span>
                  <span style={{ fontFamily: "'Clash Display', system-ui", fontSize: '0.9rem', fontWeight: 700, color: TEXT }}>{pts}</span>
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', backgroundColor: `${ORANGE}15`, borderRadius: '8px', marginTop: '8px' }}>
                <span style={{ color: ORANGE }}>📍</span>
                <span style={{ flex: 1, fontFamily: "'Satoshi', system-ui", fontSize: '0.875rem', color: '#c0c0c0' }}>Your Position: #{currentRank}</span>
                <span style={{ fontFamily: "'Clash Display', system-ui", fontSize: '0.9rem', fontWeight: 700, color: ORANGE }}>324 pts</span>
              </div>
            </div>
            <button onClick={() => navigate('/client/leaderboard')} style={{
              width: '100%', padding: '0.8rem', background: `linear-gradient(135deg, ${ORANGE}, ${YELLOW})`,
              border: 'none', borderRadius: '10px', color: '#000', fontFamily: "'Satoshi', system-ui",
              fontSize: '0.875rem', fontWeight: 800, cursor: 'pointer', minHeight: 'auto',
            }}>View Full Leaderboard</button>
          </div>

          {/* Why it matters */}
          <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${GREEN}`, borderRadius: '16px', padding: '1.5rem', marginBottom: '1rem' }}>
            <p style={{ fontFamily: "'Satoshi', system-ui", fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.18em', color: GREEN, textTransform: 'uppercase', margin: '0 0 1rem' }}>Why Consistency Matters</p>
            {[
              'Clients who check in weekly see 3x better results — research backed',
              'Your PT uses your answers to personalise next week\'s programme',
              'Habit streaks are the number one predictor of long term fitness success',
              'Every check-in brings you closer to your next achievement badge',
            ].map((benefit, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: i < 3 ? '10px' : 0 }}>
                <span style={{ color: GREEN, fontWeight: 700, flexShrink: 0 }}>✓</span>
                <p style={{ fontFamily: "'Satoshi', system-ui", fontSize: '0.82rem', color: '#b0b0b0', margin: 0, lineHeight: 1.6 }}>{benefit}</p>
              </div>
            ))}
          </div>

          {/* Your answers */}
          <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <p style={{ fontFamily: "'Satoshi', system-ui", fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.18em', color: MUTED, textTransform: 'uppercase', margin: '0 0 1rem' }}>Your Answers</p>
            {[
              { q: 'Goals last week', a: currentCheckIn.goals_achieved },
              { q: 'Workouts completed', a: currentCheckIn.workouts_completed },
              { q: 'Sleep', a: `${currentCheckIn.sleep_hours}h` },
              { q: 'Water', a: `${currentCheckIn.water_glasses} glasses` },
              { q: 'Motivation', a: `${currentCheckIn.motivation_score}/10` },
              { q: 'Stress', a: `${currentCheckIn.stress_score}/10` },
            ].filter(i => i.a).map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${BORDER}` }}>
                <p style={{ fontFamily: "'Satoshi', system-ui", fontSize: '0.8rem', color: MUTED, margin: 0 }}>{item.q}</p>
                <p style={{ fontFamily: "'Satoshi', system-ui", fontSize: '0.8rem', fontWeight: 700, color: TEXT, margin: 0 }}>{item.a}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button onClick={() => { setSubmitted(false); setCurrentCheckIn(null); window.scrollTo(0,0); }} style={{
              width: '100%', padding: '0.9rem', backgroundColor: 'transparent',
              border: `1px solid ${BORDER}`, borderRadius: '10px',
              color: TEXT, fontFamily: "'Satoshi', system-ui", fontSize: '0.875rem', fontWeight: 600,
              cursor: 'pointer', minHeight: 'auto',
            }}>View Full Form</button>
            <button onClick={() => navigate('/client')} style={{
              width: '100%', padding: '0.9rem',
              background: `linear-gradient(135deg, ${ORANGE}, ${YELLOW})`,
              border: 'none', borderRadius: '10px', color: '#000',
              fontFamily: "'Satoshi', system-ui", fontSize: '0.875rem', fontWeight: 800,
              cursor: 'pointer', minHeight: 'auto',
            }}>Back to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  const inputStyle = {
    width: '100%', padding: '0.8rem 1rem',
    border: `1px solid ${BORDER}`, borderRadius: '8px',
    backgroundColor: SURFACE2, color: TEXT,
    fontFamily: "'Satoshi', system-ui", fontSize: '0.9rem', outline: 'none',
    transition: 'border-color 0.15s ease',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ backgroundColor: BG, minHeight: '100vh', paddingBottom: '6rem' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem 1.25rem' }}>
        <BackButton to="/client" />

        {/* Header */}
        <div style={{ margin: '1.25rem 0 2rem' }}>
          <p style={{ fontFamily: "'Satoshi', system-ui", fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', color: ORANGE, textTransform: 'uppercase', margin: '0 0 0.4rem' }}>Weekly Review</p>
          <h1 style={{ fontFamily: "'Clash Display', system-ui", fontSize: '2rem', fontWeight: 700, color: TEXT, letterSpacing: '-0.03em', margin: '0 0 0.4rem' }}>Weekly Check-in</h1>
          <p style={{ fontFamily: "'Satoshi', system-ui", fontSize: '0.82rem', color: MUTED, margin: '0 0 0.75rem' }}>Takes about 5 minutes · Helps your PT support you better</p>
          {mondayDate && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={13} color={GREEN} />
              <p style={{ fontFamily: "'Satoshi', system-ui", fontSize: '0.8rem', color: GREEN, fontWeight: 600, margin: 0 }}>
                Week of {new Date(mondayDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Goals */}
          <QuestionCard label="Goal Review" title="What were your goals last week?">
            <textarea value={formData.goals_achieved} onChange={e => setFormData({ ...formData, goals_achieved: e.target.value })}
              placeholder="What were your goals for this week" rows={3}
              style={{ ...inputStyle, resize: 'vertical', marginBottom: '1rem' }}
              onFocus={e => { e.target.style.borderColor = ORANGE; e.target.style.boxShadow = `0 0 0 3px ${ORANGE}22`; }}
              onBlur={e => { e.target.style.borderColor = BORDER; e.target.style.boxShadow = 'none'; }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1rem' }}>
              {['YES', 'NO'].map(option => (
                <button key={option} type="button" onClick={() => setFormData({ ...formData, goals_achieved: option })} style={{
                  padding: '0.75rem', border: `1px solid ${formData.goals_achieved === option ? (option === 'YES' ? GREEN : '#ef4444') : BORDER}`,
                  backgroundColor: formData.goals_achieved === option ? (option === 'YES' ? `${GREEN}22` : 'rgba(239,68,68,0.15)') : SURFACE2,
                  color: formData.goals_achieved === option ? (option === 'YES' ? GREEN : '#ef4444') : '#c0c0c0',
                  fontWeight: 700, borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem',
                  transition: 'all 0.15s ease', minHeight: 'auto',
                }}>{option}</button>
              ))}
            </div>
            {formData.goals_achieved === 'NO' && (
              <textarea value={formData.goals_barrier} onChange={e => setFormData({ ...formData, goals_barrier: e.target.value })}
                placeholder="Tell us what got in the way" rows={2}
                style={{ ...inputStyle, resize: 'vertical' }}
                onFocus={e => { e.target.style.borderColor = ORANGE; e.target.style.boxShadow = `0 0 0 3px ${ORANGE}22`; }}
                onBlur={e => { e.target.style.borderColor = BORDER; e.target.style.boxShadow = 'none'; }} />
            )}
          </QuestionCard>

          {/* Workouts */}
          <QuestionCard label="Workouts" title="Did you complete all your assigned workouts?">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '1rem' }}>
              {['All of them', 'Most of them', 'Some of them', 'None of them'].map((option, idx) => {
                const colors = [GREEN, '#F59E0B', '#F97316', '#ef4444'];
                const isSelected = formData.workouts_completed === option;
                return (
                  <button key={option} type="button" onClick={() => setFormData({ ...formData, workouts_completed: option })} style={{
                    padding: '0.75rem', border: `1px solid ${isSelected ? colors[idx] : BORDER}`,
                    backgroundColor: isSelected ? `${colors[idx]}22` : SURFACE2,
                    color: isSelected ? colors[idx] : '#c0c0c0',
                    fontWeight: isSelected ? 700 : 500, borderRadius: '8px', cursor: 'pointer',
                    fontSize: '0.82rem', transition: 'all 0.15s ease', minHeight: 'auto',
                  }}>{option}</button>
                );
              })}
            </div>
            <textarea value={formData.workouts_notes} onChange={e => setFormData({ ...formData, workouts_notes: e.target.value })}
              placeholder="Tell us more — what got in the way if you missed any" rows={2}
              style={{ ...inputStyle, resize: 'vertical' }}
              onFocus={e => { e.target.style.borderColor = ORANGE; e.target.style.boxShadow = `0 0 0 3px ${ORANGE}22`; }}
              onBlur={e => { e.target.style.borderColor = BORDER; e.target.style.boxShadow = 'none'; }} />
          </QuestionCard>

          {/* Workout feel */}
          <QuestionCard label="Workout Feel" title="How did your workouts feel this week?">
            <EmojiSelector emojis={['😫', '😕', '😊', '💪', '🔥']} labels={['Tough', 'Meh', 'Good', 'Strong', 'On Fire!']}
              selected={formData.workouts_felt} onChange={emoji => setFormData({ ...formData, workouts_felt: emoji })} />
          </QuestionCard>

          {/* Lifestyle */}
          <QuestionCard label="Lifestyle" title="How were your daily habits this week?">
            <LifestyleSliders formData={formData} setFormData={setFormData} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '1.25rem' }}>
              {[{ key: 'alcohol_free', label: 'Alcohol-free most days' }, { key: 'ate_breakfast', label: 'Ate breakfast daily' }, { key: 'limited_processed', label: 'Limited processed food' }].map(item => (
                <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '6px 0' }}>
                  <input type="checkbox" checked={formData[item.key] || false}
                    onChange={e => setFormData({ ...formData, [item.key]: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: ORANGE, cursor: 'pointer' }} />
                  <span style={{ fontFamily: "'Satoshi', system-ui", fontSize: '0.875rem', color: '#c0c0c0' }}>{item.label}</span>
                  {formData[item.key] && <Check size={14} color={GREEN} />}
                </label>
              ))}
            </div>
          </QuestionCard>

          {/* Mindset */}
          <QuestionCard label="Mindset" title="Rate your motivation and stress levels this week">
            <MindsetScales formData={formData} setFormData={setFormData} />
          </QuestionCard>

          {/* Mood */}
          <QuestionCard label="Mood" title="What's your overall mood this week?">
            <EmojiSelector emojis={['😔', '😐', '🙂', '😄', '🤩']} labels={['Down', 'Neutral', 'Happy', 'Very Happy', 'Amazing!']}
              selected={formData.overall_mood} onChange={emoji => setFormData({ ...formData, overall_mood: emoji })} />
          </QuestionCard>

          {/* Insight */}
          <QuestionCard label="Insight" title="What contributed to your motivation and stress levels?">
            <textarea value={formData.motivation_factors} onChange={e => setFormData({ ...formData, motivation_factors: e.target.value })}
              placeholder="Share what helped you stay motivated or what caused stress this week. Your PT reads every word." rows={4}
              style={{ ...inputStyle, resize: 'vertical' }}
              onFocus={e => { e.target.style.borderColor = ORANGE; e.target.style.boxShadow = `0 0 0 3px ${ORANGE}22`; }}
              onBlur={e => { e.target.style.borderColor = BORDER; e.target.style.boxShadow = 'none'; }} />
            <p style={{ fontFamily: "'Satoshi', system-ui", fontSize: '0.7rem', color: MUTED, margin: '6px 0 0', textAlign: 'right' }}>{formData.motivation_factors.length} of 500</p>
          </QuestionCard>

          {/* Wins */}
          <QuestionCard label="Celebrate" title="🏆 List 3 to 5 wins or milestones from this week">
            <DynamicInputList items={formData.wins} setItems={wins => setFormData({ ...formData, wins })}
              placeholder="I completed all my sessions" bullet="🏆" maxItems={5} label="Add Another Win" />
          </QuestionCard>

          {/* Challenges */}
          <QuestionCard label="Challenges" title="What challenges did you face this week?">
            <DynamicInputList items={formData.challenges} setItems={challenges => setFormData({ ...formData, challenges })}
              placeholder="I struggled with evening cravings" bullet="⚠️" maxItems={5} label="Add Another Challenge" />
          </QuestionCard>

          {/* Next week */}
          <QuestionCard label="Looking Ahead" title="🎯 What are your goals for next week?">
            <DynamicInputList items={formData.next_week_goals} setItems={goals => setFormData({ ...formData, next_week_goals: goals })}
              placeholder="I will complete all 3 sessions" bullet="🎯" maxItems={5} label="Add Another Goal" />
          </QuestionCard>

          {/* Submit */}
          <div style={{ marginTop: '1rem' }}>
            <button type="submit" disabled={submitting} style={{
              width: '100%', padding: '1rem',
              background: `linear-gradient(135deg, ${ORANGE}, ${YELLOW})`,
              border: 'none', borderRadius: '10px', color: '#000',
              fontFamily: "'Satoshi', system-ui", fontSize: '0.9rem', fontWeight: 800,
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              minHeight: 'auto', transition: 'all 0.15s ease',
            }}>
              {submitting ? 'Submitting...' : <><span>Submit My Weekly Check-in</span><ArrowRight size={16} /></>}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', justifyContent: 'center' }}>
              <Lock size={12} color={MUTED} />
              <p style={{ fontFamily: "'Satoshi', system-ui", fontSize: '0.72rem', color: MUTED, margin: 0 }}>Your responses are private and shared only with your PT</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
