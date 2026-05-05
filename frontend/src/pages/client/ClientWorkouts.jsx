import { useState, useEffect } from 'react';
import { Dumbbell, Calendar, Clock, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import WorkoutDetailModal from '../../components/WorkoutDetailModal';

const BG = '#141414';
const SURFACE = '#2a2a2a';
const SURFACE2 = '#333333';
const BORDER = 'rgba(255,255,255,0.15)';
const TEXT = '#ffffff';
const MUTED = '#707070';
const ORANGE = '#FF6B2B';
const YELLOW = '#FFD600';
const GREEN = '#4CAF50';

const statusConfig = {
  assigned:    { label: 'Assigned',    color: GREEN },
  in_progress: { label: 'In Progress', color: YELLOW },
  completed:   { label: 'Completed',   color: MUTED },
  missed:      { label: 'Missed',      color: '#ef4444' },
};

const difficultyConfig = {
  beginner:     { label: 'Beginner',     color: GREEN },
  intermediate: { label: 'Intermediate', color: YELLOW },
  advanced:     { label: 'Advanced',     color: ORANGE },
};

function SectionLabel({ children, color = MUTED }) {
  return <p style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.18em', color, textTransform:'uppercase', margin:'0 0 0.75rem' }}>{children}</p>;
}

export default function ClientWorkouts() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  useEffect(() => { if (user?.clientId) fetchWorkouts(); }, [user]);

  async function fetchWorkouts() {
    try {
      setLoading(true);
      const res = await api.get(`/assigned-workouts/client/${user.clientId}`);
      setWorkouts(res.data || []);
    } catch { toast.error('Failed to load workouts'); }
    finally { setLoading(false); }
  }

  async function handleMarkComplete(workoutId) {
    try {
      await api.patch(`/assigned-workouts/${workoutId}/complete`);
      toast.success('Workout marked as complete!');
      fetchWorkouts(); setSelectedWorkout(null);
    } catch { toast.error('Failed to mark complete'); }
  }

  const active = workouts.filter(w => w.status !== 'completed');
  const completed = workouts.filter(w => w.status === 'completed');

  return (
    <div style={{ backgroundColor:BG, minHeight:'100vh', paddingBottom:'6rem' }}>
      <div style={{ maxWidth:'800px', margin:'0 auto', padding:'2rem 1.25rem' }}>

        {/* Header */}
        <div style={{ marginBottom:'1.5rem' }}>
          <p style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.18em', color:ORANGE, textTransform:'uppercase', margin:'0 0 0.4rem' }}>Training</p>
          <h1 style={{ fontFamily:"'Clash Display', system-ui", fontSize:'2rem', fontWeight:700, color:TEXT, letterSpacing:'-0.03em', margin:'0 0 0.3rem' }}>My Workouts</h1>
          <p style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.8rem', color:MUTED, margin:0 }}>Assigned by your PT</p>
        </div>

        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:'4rem' }}>
            <div style={{ width:'20px', height:'20px', border:`2px solid ${ORANGE}`, borderTop:'2px solid transparent', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
          </div>
        ) : workouts.length === 0 ? (
          <div style={{ backgroundColor:SURFACE, borderRadius:'12px', padding:'3rem', textAlign:'center', border:`1px solid ${BORDER}` }}>
            <Dumbbell size={32} color={MUTED} style={{ marginBottom:'1rem', opacity:0.4 }} />
            <p style={{ fontFamily:"'Clash Display', system-ui", fontSize:'1.2rem', fontWeight:700, color:MUTED, letterSpacing:'-0.02em', margin:'0 0 0.5rem' }}>No workouts yet</p>
            <p style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.82rem', color:MUTED, margin:0, opacity:0.7 }}>Your PT will assign workouts soon.</p>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'8px', marginBottom:'1rem' }}>
              {[
                { value: workouts.length, label: 'Total',   color: TEXT },
                { value: active.length,   label: 'Active',  color: ORANGE },
                { value: completed.length,label: 'Done',    color: GREEN },
              ].map((s, i) => (
                <div key={i} style={{ backgroundColor:SURFACE, borderRadius:'12px', padding:'1.1rem', border:`1px solid ${BORDER}`, textAlign:'center' }}>
                  <p style={{ fontFamily:"'Clash Display', system-ui", fontSize:'2rem', fontWeight:800, color:s.color, letterSpacing:'-0.03em', lineHeight:1, margin:'0 0 0.35rem' }}>{s.value}</p>
                  <p style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.1em', color:MUTED, textTransform:'uppercase', margin:0 }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Active */}
            {active.length > 0 && (
              <div style={{ marginBottom:'1rem' }}>
                <SectionLabel color={ORANGE}>Active</SectionLabel>
                <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                  {active.map(workout => {
                    const status = statusConfig[workout.status] || statusConfig.assigned;
                    const diff = difficultyConfig[workout.difficulty] || difficultyConfig.beginner;
                    return (
                      <div key={workout.id} onClick={() => setSelectedWorkout(workout)} style={{
                        backgroundColor:SURFACE, borderRadius:'12px', border:`1px solid ${BORDER}`,
                        padding:'1.1rem', cursor:'pointer', transition:'all 0.15s',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor=`${ORANGE}44`; e.currentTarget.style.backgroundColor=SURFACE2; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor=BORDER; e.currentTarget.style.backgroundColor=SURFACE; }}
                      >
                        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'0.6rem' }}>
                          <div style={{ flex:1, marginRight:'1rem' }}>
                            <h3 style={{ fontFamily:"'Clash Display', system-ui", fontSize:'1.1rem', fontWeight:700, color:TEXT, letterSpacing:'-0.02em', margin:'0 0 0.25rem', lineHeight:1.2 }}>{workout.name}</h3>
                            {workout.description && <p style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.78rem', color:MUTED, margin:0, lineHeight:1.5 }}>{workout.description}</p>}
                          </div>
                          <ArrowRight size={14} color={MUTED} style={{ flexShrink:0, marginTop:'2px' }} />
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                            <Calendar size={11} color={MUTED} />
                            <span style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.7rem', color:MUTED }}>{new Date(workout.scheduled_date).toLocaleDateString('en-GB', { day:'numeric', month:'short' })}</span>
                          </div>
                          <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                            <Clock size={11} color={MUTED} />
                            <span style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.7rem', color:MUTED }}>{workout.estimated_duration_minutes} min</span>
                          </div>
                          <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                            <Dumbbell size={11} color={MUTED} />
                            <span style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.7rem', color:MUTED }}>{workout.exercises?.length || 0} exercises</span>
                          </div>
                          <div style={{ marginLeft:'auto', display:'flex', gap:'8px' }}>
                            <span style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:diff.color, backgroundColor:`${diff.color}15`, padding:'2px 7px', borderRadius:'4px' }}>{diff.label}</span>
                            <span style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:status.color, backgroundColor:`${status.color}15`, padding:'2px 7px', borderRadius:'4px' }}>{status.label}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Completed */}
            {completed.length > 0 && (
              <div>
                <SectionLabel>Completed</SectionLabel>
                <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                  {completed.map(workout => (
                    <div key={workout.id} onClick={() => setSelectedWorkout(workout)} style={{
                      backgroundColor:SURFACE, borderRadius:'10px', padding:'0.875rem 1rem',
                      border:`1px solid ${BORDER}`, cursor:'pointer', display:'flex',
                      alignItems:'center', justifyContent:'space-between', gap:'12px',
                      opacity:0.65, transition:'all 0.15s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.opacity='0.85'; }}
                      onMouseLeave={e => { e.currentTarget.style.opacity='0.65'; }}
                    >
                      <div style={{ flex:1 }}>
                        <p style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.875rem', fontWeight:600, color:MUTED, margin:'0 0 2px', textDecoration:'line-through' }}>{workout.name}</p>
                        <p style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.7rem', color:MUTED, margin:0, opacity:0.7 }}>
                          {new Date(workout.scheduled_date).toLocaleDateString('en-GB', { day:'numeric', month:'short' })} · {workout.estimated_duration_minutes} min
                        </p>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:'5px', flexShrink:0 }}>
                        <Check size={12} color={GREEN} />
                        <span style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:GREEN }}>Done</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {selectedWorkout && (
        <WorkoutDetailModal workout={selectedWorkout} onClose={() => setSelectedWorkout(null)} onComplete={() => handleMarkComplete(selectedWorkout.id)} />
      )}
    </div>
  );
}
