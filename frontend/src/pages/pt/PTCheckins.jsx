import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { ClipboardCheck, ChevronDown, ChevronUp } from 'lucide-react';

const GREEN = '#4CAF50';
const ORANGE = '#FF6B2B';
const MUTED = '#707070';

export default function PTCheckins() {
  const [summary, setSummary] = useState([]);
  const [currentWeek, setCurrentWeek] = useState('');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api.get('/checkins/pt/summary')
      .then(r => { setSummary(r.data.summary || []); setCurrentWeek(r.data.currentWeek || ''); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const withCheckins = summary.filter(s => s.latestCheckin);
  const without = summary.filter(s => !s.latestCheckin);

  const field = (label, val) => {
    if (val === null || val === undefined || val === '') return null;
    return (
      <div style={{ marginBottom: '8px' }}>
        <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', color: MUTED, textTransform: 'uppercase', marginBottom: '2px' }}>{label}</div>
        <div style={{ fontSize: '0.82rem', color: '#ddd' }}>{val}</div>
      </div>
    );
  };

  return (
    <div style={{ padding: '1.25rem', maxWidth: '760px', margin: '0 auto' }}>
      <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.2em', color: ORANGE, textTransform: 'uppercase', margin: '0 0 4px' }}>PT DASHBOARD</p>
      <h1 style={{ fontFamily: "'DM Sans', system-ui", fontSize: '1.6rem', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>Check-ins</h1>
      <p style={{ fontSize: '0.8rem', color: MUTED, margin: '0 0 1.5rem' }}>Current week: {currentWeek || '—'}</p>

      {loading ? (
        <p style={{ color: MUTED }}>Loading…</p>
      ) : (
        <>
          {withCheckins.length === 0 && (
            <p style={{ color: MUTED, textAlign: 'center', padding: '2rem' }}>No check-ins submitted yet.</p>
          )}

          {withCheckins.map(s => {
            const c = s.latestCheckin;
            const isOpen = expanded === s.clientId;
            return (
              <div key={s.clientId} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', marginBottom: '10px', overflow: 'hidden' }}>
                <div onClick={() => setExpanded(isOpen ? null : s.clientId)} style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{s.clientName}</div>
                    <div style={{ fontSize: '0.7rem', color: MUTED, marginTop: '2px' }}>{c.checkin_week} · {c.checkin_date}{s.hasResponded ? '' : ' · not yet replied'}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {!s.hasResponded && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: ORANGE }} />}
                    {isOpen ? <ChevronUp size={16} color={MUTED} /> : <ChevronDown size={16} color={MUTED} />}
                  </div>
                </div>
                {isOpen && (
                  <div style={{ padding: '4px 16px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    {field('Wins', c.wins || c.what_went_well)}
                    {field('Challenges', c.challenges || c.what_was_challenging)}
                    {field('Goals for next week', c.next_week_goals)}
                    {field('How workouts felt', c.workouts_felt)}
                    {field('Overall mood', c.overall_mood || c.mood_rating)}
                    {field('Motivation', c.motivation_score != null ? c.motivation_score + '/10' : null)}
                    {field('Stress', c.stress_score != null ? c.stress_score + '/10' : null)}
                    {field('Energy', c.energy_level)}
                    {field('Sleep quality', c.sleep_quality)}
                    {field('Sleep hours', c.sleep_hours)}
                    {field('Water (glasses)', c.water_glasses)}
                    {field('Daily steps', c.daily_steps)}
                    {field('Nutrition goals hit', c.nutrition_goals_hit)}
                    {field('Insight', c.insight)}
                  </div>
                )}
              </div>
            );
          })}

          {without.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <p style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', color: MUTED, textTransform: 'uppercase', marginBottom: '8px' }}>No check-in yet</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {without.map(s => (
                  <span key={s.clientId} style={{ fontSize: '0.75rem', color: MUTED, background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: '6px' }}>{s.clientName}</span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
