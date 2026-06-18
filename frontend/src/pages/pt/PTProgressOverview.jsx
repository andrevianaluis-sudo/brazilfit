import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';

const GREEN = '#4CAF50';
const ORANGE = '#FF6B2B';
const MUTED = '#707070';

export default function PTProgressOverview() {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api.get('/pt/progress-summary')
      .then(r => { setSummary(r.data.summary || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const withData = summary.filter(s => s.entryCount > 0);
  const without = summary.filter(s => s.entryCount === 0);

  const metric = (label, val, unit) => {
    if (val === null || val === undefined || val === '') return null;
    return (
      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '8px 10px', minWidth: '70px' }}>
        <div style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.08em', color: MUTED, textTransform: 'uppercase' }}>{label}</div>
        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginTop: '2px' }}>{val}{unit}</div>
      </div>
    );
  };

  return (
    <div style={{ padding: '1.25rem', maxWidth: '760px', margin: '0 auto' }}>
      <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.2em', color: ORANGE, textTransform: 'uppercase', margin: '0 0 4px' }}>PT DASHBOARD</p>
      <h1 style={{ fontFamily: "'DM Sans', system-ui", fontSize: '1.6rem', fontWeight: 800, color: '#fff', margin: '0 0 1.5rem' }}>Client Progress</h1>

      {loading ? (
        <p style={{ color: MUTED }}>Loading…</p>
      ) : (
        <>
          {withData.length === 0 && (
            <p style={{ color: MUTED, textAlign: 'center', padding: '2rem' }}>No progress entries yet.</p>
          )}

          {withData.map(s => {
            const isOpen = expanded === s.clientId;
            const l = s.latest;
            return (
              <div key={s.clientId} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', marginBottom: '10px', overflow: 'hidden' }}>
                <div onClick={() => setExpanded(isOpen ? null : s.clientId)} style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{s.clientName}</div>
                    <div style={{ fontSize: '0.7rem', color: MUTED, marginTop: '2px' }}>
                      {s.entryCount} {s.entryCount === 1 ? 'entry' : 'entries'} · latest {l.entry_date}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {s.weightChange !== null && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.8rem', fontWeight: 700, color: s.weightChange < 0 ? GREEN : s.weightChange > 0 ? ORANGE : MUTED }}>
                        {s.weightChange < 0 ? <TrendingDown size={14} /> : s.weightChange > 0 ? <TrendingUp size={14} /> : null}
                        {s.weightChange > 0 ? '+' : ''}{s.weightChange}kg
                      </span>
                    )}
                    {isOpen ? <ChevronUp size={16} color={MUTED} /> : <ChevronDown size={16} color={MUTED} />}
                  </div>
                </div>

                {isOpen && (
                  <div style={{ padding: '4px 16px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    {s.weightChange !== null && (
                      <p style={{ fontSize: '0.8rem', color: '#ccc', margin: '10px 0 14px' }}>
                        {s.weightChange < 0
                          ? `Down ${Math.abs(s.weightChange)}kg since starting — great progress.`
                          : s.weightChange > 0
                          ? `Up ${s.weightChange}kg since starting.`
                          : 'No weight change since starting.'}
                      </p>
                    )}
                    {s.entries.map(e => (
                      <div key={e.id} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: ORANGE, marginBottom: '6px' }}>{e.entry_date}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {metric('Weight', e.weight_kg, 'kg')}
                          {metric('Waist', e.waist_cm, 'cm')}
                          {metric('Hips', e.hips_cm, 'cm')}
                          {metric('Chest', e.chest_cm, 'cm')}
                          {metric('Body Fat', e.body_fat_pct, '%')}
                        </div>
                        {e.notes && <p style={{ fontSize: '0.78rem', color: '#bbb', margin: '8px 0 0', fontStyle: 'italic' }}>“{e.notes}”</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {without.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <p style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', color: MUTED, textTransform: 'uppercase', marginBottom: '8px' }}>No progress logged yet</p>
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
