import { useState, useEffect } from 'react';
import { X, CheckCircle, Calendar, Dumbbell, Play, Clock, ChevronDown } from 'lucide-react';
import ExerciseImageDisplay from './ExerciseImageDisplay';
import MuscleDiagram from './MuscleDiagram';
import ExerciseTimer from './ExerciseTimer';
import { getExerciseMuscles } from '../data/exerciseMuscleMap';

const Label = ({ children, color }) => (
  <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.18em', color: color || '#3a3a3a', textTransform: 'uppercase', margin: '0 0 0.4rem 0' }}>{children}</p>
);

const Line = () => <div style={{ height: '1px', backgroundColor: '#1a1a1a' }} />;

export default function WorkoutDetailModal({ workout, onClose, onComplete }) {
  const isCompleted = workout.status === 'completed';
  const [gifMapping, setGifMapping] = useState({});
  const [timerExercise, setTimerExercise] = useState(null);
  const [expandedEx, setExpandedEx] = useState(0);

  useEffect(() => {
    fetch('/exercise-gifs/mapping.json')
      .then(res => res.json())
      .then(data => {
        const mapping = {};
        data.forEach(item => { mapping[item.exerciseName] = item.filename; });
        setGifMapping(mapping);
      })
      .catch(err => console.error('Failed to load GIF mapping:', err));
  }, []);

  const getExerciseImage = (exercise) => {
    if (exercise.type === 'stretching' && gifMapping[exercise.name]) {
      return { type: 'gif', filename: gifMapping[exercise.name] };
    }
    return { type: 'muscles' };
  };

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.85)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: '520px', backgroundColor: '#0e0e0e', borderRadius: '20px 20px 0 0', border: '1px solid #1a1a1a', borderBottom: 'none', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
      >

        {/* Header */}
        <div style={{ padding: '1.5rem 1.5rem 1.25rem', borderBottom: '1px solid #1a1a1a', position: 'relative', flexShrink: 0 }}>
          {/* Orange accent bar */}
          <div style={{ position: 'absolute', top: 0, left: '1.5rem', right: '1.5rem', height: '3px', background: 'linear-gradient(90deg, #FF6B2B, #FFD600)', borderRadius: '0 0 3px 3px' }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: '0.5rem' }}>
            <div style={{ flex: 1, marginRight: '1rem' }}>
              <Label color="#FF6B2B">Workout</Label>
              <h2 style={{ fontFamily: "'Clash Display', system-ui, sans-serif", fontSize: '1.4rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', margin: '0.25rem 0 0.25rem', lineHeight: 1.1 }}>{workout.name}</h2>
              {workout.pt_name && (
                <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.75rem', color: '#3a3a3a', margin: 0, fontWeight: 500 }}>By {workout.pt_name}</p>
              )}
            </div>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3a3a3a', padding: '4px', display: 'flex', minHeight: 'auto', minWidth: 'auto', transition: 'color 0.15s', flexShrink: 0 }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = '#3a3a3a'}
            >
              <X size={20} />
            </button>
          </div>

          {/* Stats strip */}
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
            {[
              { value: `${workout.estimated_duration_minutes}m`, label: 'Duration' },
              { value: workout.difficulty, label: 'Level', cap: true },
              { value: workout.exercises?.length || 0, label: 'Exercises' },
            ].map((s, i) => (
              <div key={i}>
                <p style={{ fontFamily: "'Clash Display', system-ui, sans-serif", fontSize: '1.1rem', fontWeight: 800, color: i === 0 ? '#FF6B2B' : i === 1 ? '#FFD600' : '#4CAF50', letterSpacing: '-0.02em', margin: 0, textTransform: s.cap ? 'capitalize' : 'none' }}>{s.value}</p>
                <Label>{s.label}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>

          {/* Description */}
          {workout.description && (
            <>
              <div style={{ padding: '1.25rem 1.5rem' }}>
                <Label>Description</Label>
                <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.85rem', color: '#606060', margin: 0, lineHeight: 1.65 }}>{workout.description}</p>
              </div>
              <Line />
            </>
          )}

          {/* Status card */}
          <div style={{ padding: '1.25rem 1.5rem' }}>
            {isCompleted ? (
              <div style={{ backgroundColor: '#0a1a0a', borderLeft: '2px solid #4CAF50', borderRadius: '6px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle size={16} color="#4CAF50" />
                <div>
                  <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.82rem', fontWeight: 700, color: '#4CAF50', margin: '0 0 2px' }}>Completed</p>
                  {workout.completed_date && <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.72rem', color: '#3a3a3a', margin: 0 }}>{new Date(workout.completed_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>}
                </div>
              </div>
            ) : (
              <div style={{ backgroundColor: '#1a1000', borderLeft: '2px solid #FF6B2B', borderRadius: '6px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={16} color="#FF6B2B" />
                <div>
                  <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.82rem', fontWeight: 700, color: '#FF6B2B', margin: '0 0 2px' }}>Scheduled</p>
                  <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.72rem', color: '#3a3a3a', margin: 0 }}>{new Date(workout.scheduled_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
            )}
          </div>

          <Line />

          {/* Exercise list */}
          <div style={{ padding: '1.25rem 1.5rem 0.75rem' }}>
            <Label color="#FF6B2B">Exercises</Label>
          </div>

          {workout.exercises?.map((ex, idx) => {
            const muscles = getExerciseMuscles(ex.name);
            const imageInfo = getExerciseImage(ex);
            const isExpanded = expandedEx === idx;

            return (
              <div key={idx}>
                {/* Exercise row */}
                <div
                  onClick={() => setExpandedEx(isExpanded ? null : idx)}
                  style={{ padding: '1rem 1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#141414'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Number */}
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: `1px solid ${isExpanded ? '#FF6B2B' : '#1e1e1e'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'border-color 0.15s' }}>
                    <span style={{ fontFamily: "'Clash Display', system-ui, sans-serif", fontSize: '0.75rem', fontWeight: 700, color: isExpanded ? '#FF6B2B' : '#3a3a3a' }}>{idx + 1}</span>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.9rem', fontWeight: 600, color: '#fff', margin: '0 0 2px', letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.name}</p>
                    <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.72rem', color: '#3a3a3a', margin: 0, fontWeight: 500 }}>
                      {ex.sets} sets · {ex.reps} reps · {ex.rest_seconds}s rest{ex.weight_kg ? ` · ${ex.weight_kg}kg` : ''}
                    </p>
                  </div>

                  <ChevronDown size={14} color="#2a2a2a" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div style={{ backgroundColor: '#0a0a0a', borderTop: '1px solid #141414', borderBottom: '1px solid #141414' }}>

                    {/* Visual */}
                    {imageInfo.type === 'gif' ? (
                      <div style={{ width: '100%', height: '200px', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        <img src={`/exercise-gifs/${imageInfo.filename}`} alt={ex.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} loading="lazy" />
                      </div>
                    ) : (muscles.primary.length > 0 || muscles.secondary.length > 0) ? (
                      <div style={{ display: 'flex', height: '180px', backgroundColor: '#0a0a0a' }}>
                        <div style={{ flex: 1 }}>
                          <MuscleDiagram primaryMuscles={muscles.primary} secondaryMuscles={muscles.secondary} view="front" size="medium" />
                        </div>
                        <div style={{ flex: 1, borderLeft: '1px solid #141414' }}>
                          <MuscleDiagram primaryMuscles={muscles.primary} secondaryMuscles={muscles.secondary} view="back" size="medium" />
                        </div>
                      </div>
                    ) : null}

                    <div style={{ padding: '1.25rem 1.5rem' }}>
                      {/* Stat pills */}
                      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${ex.weight_kg ? 4 : 3}, 1fr)`, gap: '0.5rem', marginBottom: '1rem' }}>
                        {[
                          { label: 'Sets', value: ex.sets, color: '#FF6B2B' },
                          { label: 'Reps', value: ex.reps, color: '#FFD600' },
                          { label: 'Rest', value: `${ex.rest_seconds}s`, color: '#4CAF50' },
                          ...(ex.weight_kg ? [{ label: 'Weight', value: `${ex.weight_kg}kg`, color: '#FF6B2B' }] : []),
                        ].map((s, i) => (
                          <div key={i} style={{ backgroundColor: '#111', borderRadius: '8px', padding: '0.75rem', textAlign: 'center', border: '1px solid #1a1a1a' }}>
                            <p style={{ fontFamily: "'Clash Display', system-ui, sans-serif", fontSize: '1.1rem', fontWeight: 800, color: s.color, letterSpacing: '-0.02em', margin: '0 0 2px', lineHeight: 1 }}>{s.value}</p>
                            <Label>{s.label}</Label>
                          </div>
                        ))}
                      </div>

                      {/* Muscles */}
                      {muscles.primary.length > 0 && (
                        <div style={{ marginBottom: '0.75rem' }}>
                          <Label color="#FF6B2B">Primary muscles</Label>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {muscles.primary.map(m => (
                              <span key={m} style={{ backgroundColor: 'rgba(255,107,43,0.12)', color: '#FF6B2B', padding: '3px 10px', borderRadius: '3px', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'capitalize' }}>{m.replace(/_/g, ' ')}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {muscles.secondary.length > 0 && (
                        <div style={{ marginBottom: '0.75rem' }}>
                          <Label>Secondary muscles</Label>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {muscles.secondary.map(m => (
                              <span key={m} style={{ backgroundColor: '#141414', color: '#3a3a3a', padding: '3px 10px', borderRadius: '3px', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'capitalize' }}>{m.replace(/_/g, ' ')}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Start button for stretching */}
                      {ex.type === 'stretching' && gifMapping[ex.name] && (
                        <button
                          onClick={() => setTimerExercise(ex)}
                          style={{ width: '100%', padding: '0.8rem', background: 'linear-gradient(135deg, #FF6B2B, #FFD600)', border: 'none', borderRadius: '8px', color: '#000', fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.875rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', letterSpacing: '0.02em', marginBottom: '0.75rem', minHeight: 'auto' }}>
                          <Play size={14} style={{ fill: '#000' }} /> Start Exercise
                        </button>
                      )}

                      {/* Notes */}
                      {ex.notes && (
                        <div style={{ backgroundColor: '#111', borderLeft: '2px solid #FFD600', borderRadius: '6px', padding: '0.75rem' }}>
                          <Label color="#FFD600">Notes</Label>
                          <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.8rem', color: '#606060', margin: 0, lineHeight: 1.6 }}>{ex.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <Line />
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 }}>
          {!isCompleted && (
            <button
              onClick={onComplete}
              style={{ width: '100%', padding: '0.9rem', background: 'linear-gradient(135deg, #FF6B2B, #FFD600)', border: 'none', borderRadius: '8px', color: '#000', fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.875rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', letterSpacing: '0.02em', minHeight: 'auto' }}>
              <CheckCircle size={16} /> Mark as Complete
            </button>
          )}
          <button
            onClick={onClose}
            style={{ width: '100%', padding: '0.8rem', backgroundColor: 'transparent', border: '1px solid #1a1a1a', borderRadius: '8px', color: '#3a3a3a', fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', minHeight: 'auto', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.color = '#3a3a3a'; }}
          >
            Close
          </button>
        </div>
      </div>

      {timerExercise && (
        <ExerciseTimer
          exerciseName={timerExercise.name}
          gifUrl={gifMapping[timerExercise.name] ? `/exercise-gifs/${gifMapping[timerExercise.name]}` : null}
          sets={timerExercise.sets}
          reps={timerExercise.reps}
          restSeconds={timerExercise.rest_seconds}
          onDone={() => {}}
          onClose={() => setTimerExercise(null)}
        />
      )}
    </div>
  );
}
