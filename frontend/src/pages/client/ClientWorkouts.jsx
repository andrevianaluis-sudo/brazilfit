import { useState, useEffect } from 'react';
import { Dumbbell, Calendar, Clock, ArrowRight, Check, ChevronDown, ChevronUp, Play, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import WorkoutDetailModal from '../../components/WorkoutDetailModal';

const Label = ({ children }) => (
  <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.18em', color: '#3a3a3a', textTransform: 'uppercase', margin: '0 0 0.4rem 0' }}>{children}</p>
);

const Line = () => <div style={{ height: '1px', backgroundColor: '#141414' }} />;

const statusConfig = {
  assigned:    { label: 'Assigned',    color: '#4CAF50' },
  in_progress: { label: 'In Progress', color: '#FFD600' },
  completed:   { label: 'Completed',   color: '#3a3a3a' },
  missed:      { label: 'Missed',      color: '#ef4444' },
};

const difficultyConfig = {
  beginner:     { label: 'Beginner',     color: '#4CAF50' },
  intermediate: { label: 'Intermediate', color: '#FFD600' },
  advanced:     { label: 'Advanced',     color: '#FF6B2B' },
};

export default function ClientWorkouts() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  useEffect(() => {
    if (user?.clientId) fetchWorkouts();
  }, [user]);

  async function fetchWorkouts() {
    try {
      setLoading(true);
      const res = await api.get(`/assigned-workouts/client/${user.clientId}`);
      setWorkouts(res.data || []);
    } catch (err) {
      toast.error('Failed to load workouts');
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkComplete(workoutId) {
    try {
      await api.patch(`/assigned-workouts/${workoutId}/complete`);
      toast.success('Workout marked as complete!');
      fetchWorkouts();
      setSelectedWorkout(null);
    } catch {
      toast.error('Failed to mark workout as complete');
    }
  }

  // Group workouts by status
  const active = workouts.filter(w => w.status !== 'completed');
  const completed = workouts.filter(w => w.status === 'completed');

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', paddingBottom: '100px', width: '100%' }}>

      {/* Header */}
      <div style={{ padding: '2rem 2rem 1.5rem' }}>
        <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', color: '#4CAF50', textTransform: 'uppercase', margin: '0 0 0.4rem' }}>Training</p>
        <h1 style={{ fontFamily: "'Clash Display', system-ui, sans-serif", fontSize: '2rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', margin: '0 0 0.3rem' }}>My Workouts</h1>
        <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.8rem', color: '#3a3a3a', margin: 0, fontWeight: 500 }}>Assigned by your PT</p>
      </div>

      <Line />

      {/* Loading */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem' }}>
          <div style={{ width: '20px', height: '20px', border: '2px solid #4CAF50', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>

      /* Empty state */
      ) : workouts.length === 0 ? (
        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <Dumbbell size={32} color="#2a2a2a" style={{ marginBottom: '1rem' }} />
          <p style={{ fontFamily: "'Clash Display', system-ui, sans-serif", fontSize: '1.2rem', fontWeight: 700, color: '#2a2a2a', letterSpacing: '-0.02em', margin: '0 0 0.5rem' }}>No workouts yet</p>
          <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.82rem', color: '#2a2a2a', margin: 0 }}>Your PT will assign workouts soon.</p>
        </div>

      ) : (
        <>
          {/* Summary bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {[
              { value: workouts.length, label: 'Total', color: '#fff' },
              { value: active.length, label: 'Active', color: '#4CAF50' },
              { value: completed.length, label: 'Done', color: '#3a3a3a' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '1.25rem 1.5rem', borderRight: i < 2 ? '1px solid #141414' : 'none' }}>
                <p style={{ fontFamily: "'Clash Display', system-ui, sans-serif", fontSize: '1.8rem', fontWeight: 800, color: s.color, letterSpacing: '-0.03em', lineHeight: 1, margin: '0 0 0.3rem' }}>{s.value}</p>
                <Label>{s.label}</Label>
              </div>
            ))}
          </div>

          <Line />

          {/* Active workouts */}
          {active.length > 0 && (
            <>
              <div style={{ padding: '1.5rem 2rem 0.75rem' }}>
                <Label>Active</Label>
              </div>
              {active.map((workout, i) => {
                const status = statusConfig[workout.status] || statusConfig.assigned;
                const diff = difficultyConfig[workout.difficulty] || difficultyConfig.beginner;
                return (
                  <div key={workout.id}>
                    <div
                      onClick={() => setSelectedWorkout(workout)}
                      style={{ padding: '1.25rem 2rem', cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#0d0d0d'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Top row */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                        <div style={{ flex: 1, marginRight: '1rem' }}>
                          <h3 style={{ fontFamily: "'Clash Display', system-ui, sans-serif", fontSize: '1.15rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 0.25rem', lineHeight: 1.2 }}>{workout.name}</h3>
                          {workout.description && (
                            <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.78rem', color: '#3a3a3a', margin: 0, fontWeight: 500, lineHeight: 1.5 }}>{workout.description}</p>
                          )}
                        </div>
                        <ArrowRight size={16} color="#2a2a2a" style={{ flexShrink: 0, marginTop: '2px' }} />
                      </div>

                      {/* Meta row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Calendar size={11} color="#2a2a2a" />
                          <span style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.72rem', color: '#3a3a3a', fontWeight: 500 }}>{new Date(workout.scheduled_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Clock size={11} color="#2a2a2a" />
                          <span style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.72rem', color: '#3a3a3a', fontWeight: 500 }}>{workout.estimated_duration_minutes} min</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Dumbbell size={11} color="#2a2a2a" />
                          <span style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.72rem', color: '#3a3a3a', fontWeight: 500 }}>{workout.exercises?.length || 0} exercises</span>
                        </div>
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: diff.color }}>{diff.label}</span>
                          <span style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: status.color }}>{status.label}</span>
                        </div>
                      </div>
                    </div>
                    {i < active.length - 1 && <Line />}
                  </div>
                );
              })}
            </>
          )}

          {/* Completed workouts */}
          {completed.length > 0 && (
            <>
              <Line />
              <div style={{ padding: '1.5rem 2rem 0.75rem' }}>
                <Label>Completed</Label>
              </div>
              {completed.map((workout, i) => (
                <div key={workout.id}>
                  <div
                    onClick={() => setSelectedWorkout(workout)}
                    style={{ padding: '1.1rem 2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#0d0d0d'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.88rem', fontWeight: 600, color: '#2a2a2a', margin: '0 0 2px', letterSpacing: '-0.01em', textDecoration: 'line-through' }}>{workout.name}</p>
                      <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.7rem', color: '#2a2a2a', margin: 0, fontWeight: 500 }}>{new Date(workout.scheduled_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · {workout.estimated_duration_minutes} min</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      <Check size={12} color="#3a3a3a" />
                      <span style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3a3a3a' }}>Done</span>
                    </div>
                  </div>
                  {i < completed.length - 1 && <Line />}
                </div>
              ))}
            </>
          )}
        </>
      )}

      {/* Detail Modal */}
      {selectedWorkout && (
        <WorkoutDetailModal
          workout={selectedWorkout}
          onClose={() => setSelectedWorkout(null)}
          onComplete={() => handleMarkComplete(selectedWorkout.id)}
        />
      )}
    </div>
  );
}
