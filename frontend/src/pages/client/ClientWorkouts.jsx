import { useState, useEffect } from 'react';
import { Dumbbell, Calendar, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import WorkoutDetailModal from '../../components/WorkoutDetailModal';

export default function ClientWorkouts() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  useEffect(() => {
    if (user?.clientId) {
      fetchWorkouts();
    }
  }, [user]);

  async function fetchWorkouts() {
    try {
      setLoading(true);
      const res = await api.get(`/assigned-workouts/client/${user.clientId}`);
      setWorkouts(res.data || []);
    } catch (err) {
      console.error('Failed to fetch workouts:', err);
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
    } catch (err) {
      console.error('Failed to mark complete:', err);
      toast.error('Failed to mark workout as complete');
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      assigned: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      missed: 'bg-red-100 text-red-700'
    };
    return styles[status] || styles.assigned;
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'bg-green-100 text-green-700',
      intermediate: 'bg-yellow-100 text-yellow-700',
      advanced: 'bg-red-100 text-red-700'
    };
    return colors[difficulty] || colors.beginner;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8faf9', padding: '1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-header-title">My Workouts</h1>
        <p className="page-header-subtitle">Workouts assigned by your PT</p>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <p style={{ color: '#6b7280', fontFamily: "'Satoshi', system-ui, sans-serif" }}>Loading workouts...</p>
        </div>
      ) : workouts.length === 0 ? (
        <div className="empty-state-container">
          <Dumbbell className="empty-state-icon" />
          <p className="empty-state-title">No workouts assigned yet</p>
          <p className="empty-state-message">Check back soon! Your PT will assign workouts to you.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '700px', margin: '0 auto' }}>
          {workouts.map(workout => (
            <div
              key={workout.id}
              className="my-workout-card"
              onClick={() => setSelectedWorkout(workout)}
              style={{
                backgroundColor: 'var(--color-card)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--color-grey-light)',
                cursor: 'pointer',
                transition: 'var(--transition-normal)'
              }}
            >
              {/* Gradient Header Strip */}
              <div className="my-workout-header">
                <h3 className="my-workout-header-title">{workout.name}</h3>
                {workout.description && (
                  <p className="my-workout-header-meta">{workout.description}</p>
                )}
              </div>

              {/* Card Content */}
              <div className="my-workout-body">
                {/* Metadata */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
                    <Calendar className="w-4 h-4" />
                    {new Date(workout.scheduled_date).toLocaleDateString()}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
                    <Clock className="w-4 h-4" />
                    {workout.estimated_duration_minutes} min
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontWeight: 700,
                    backgroundColor: 'rgba(125, 212, 168, 0.15)',
                    color: '#1a4a3a',
                    textTransform: 'capitalize'
                  }}>
                    {workout.difficulty}
                  </span>
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontWeight: 700,
                    backgroundColor: '#f0f7f4',
                    color: '#1a4a3a',
                    marginLeft: 'auto'
                  }}>
                    {workout.status === 'in_progress' ? 'In Progress' : workout.status}
                  </span>
                </div>

                {/* Exercise Count */}
                <div style={{
                  fontFamily: "'Satoshi', system-ui, sans-serif",
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#1a4a3a',
                  marginBottom: '1rem'
                }}>
                  {workout.exercises?.length || 0} exercises
                </div>

                {/* Action Button */}
                {workout.status !== 'completed' && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleMarkComplete(workout.id);
                    }}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                  >
                    Mark as Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
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
