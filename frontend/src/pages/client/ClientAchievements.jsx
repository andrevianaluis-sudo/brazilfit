import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import BackButton from '../../components/BackButton';

export default function ClientAchievements() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, [user?.clientId]);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/achievements/${user?.clientId}`);
      setAchievements(res.data || {});
    } catch (err) {
      console.error('Failed to fetch achievements:', err);
      setAchievements({
        trophies: [],
        milestones: [],
        streaks: [],
        workouts: [],
        latest: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const trophyBadges = [
    { id: 'first-session', name: 'First Session', icon: '⚡' },
    { id: 'block-complete', name: 'Block Complete', icon: '⭐' },
    { id: 'early-bird', name: 'Early Bird', icon: '🌅' },
    { id: 'consistent', name: 'Consistent Attender', icon: '📅' },
    { id: 'wellness', name: 'Wellness Warrior', icon: '🌸' },
    { id: 'community', name: 'Community Champion', icon: '👥' },
    { id: 'birthday', name: 'Birthday', icon: '🎂' },
    { id: 'night-owl', name: 'Night Owl', icon: '🌙' },
    { id: 'checkin', name: 'Check-in Champion', icon: '✓' },
    { id: 'habit', name: 'Habit Hero', icon: '🔥' },
  ];

  const milestones = [1, 3, 5, 7, 10, 15, 20, 25, 30, 40, 50, 75, 100];

  const streakBadges = [
    { type: 'weeks', label: 'Weeks', count: 2 },
    { type: 'weeks', label: 'Weeks', count: 3 },
    { type: 'weeks', label: 'Weeks', count: 4 },
    { type: 'weeks', label: 'Weeks', count: 5 },
    { type: 'weeks', label: 'Weeks', count: 6 },
    { type: 'weeks', label: 'Weeks', count: 7 },
    { type: 'months', label: 'Months', count: 2 },
    { type: 'months', label: 'Months', count: 3 },
    { type: 'months', label: 'Months', count: 4 },
    { type: 'months', label: 'Months', count: 5 },
  ];

  const workoutBadges = [3, 4, 5, 6, 7];

  const isEarned = (badgeId, type) => {
    if (type === 'trophy') return achievements?.trophies?.includes(badgeId);
    if (type === 'milestone') return achievements?.milestones?.includes(badgeId);
    if (type === 'streak') return achievements?.streaks?.includes(badgeId);
    if (type === 'workout') return achievements?.workouts?.includes(badgeId);
    return false;
  };

  const getFirstEarnedIndex = (type) => {
    if (type === 'trophy') return trophyBadges.findIndex(b => isEarned(b.id, 'trophy'));
    if (type === 'milestone') return milestones.findIndex((m, i) => isEarned(`milestone-${m}`, 'milestone'));
    if (type === 'workout') return workoutBadges.findIndex((w, i) => isEarned(`workout-${w}`, 'workout'));
    if (type === 'weeks') return streakBadges.findIndex(b => b.type === 'weeks' && isEarned(`streak-${b.type}-${b.count}`, 'streak'));
    if (type === 'months') return streakBadges.findIndex(b => b.type === 'months' && isEarned(`streak-${b.type}-${b.count}`, 'streak'));
    return -1;
  };

  // Diamond shape for milestones
  const DiamondBadge = ({ num, earned }) => (
    <div style={{ position: 'relative' }}>
      <svg width="90" height="90" viewBox="0 0 90 90" style={{ margin: '0 auto' }}>
        <defs>
          <linearGradient id={`diamond-${num}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a4a3a" />
            <stop offset="100%" stopColor="#2d7a5c" />
          </linearGradient>
          <filter id={`glow-${num}`}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <polygon
          points="45,5 85,45 45,85 5,45"
          fill={earned ? `url(#diamond-${num})` : '#e8e8e8'}
          stroke="none"
          filter={earned ? `url(#glow-${num})` : 'none'}
          opacity={earned ? 1 : 0.6}
        />
        <text
          x="45"
          y="50"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="24"
          fontWeight="bold"
          fill={earned ? 'white' : '#c0c0c0'}
        >
          {num}
        </text>
      </svg>
    </div>
  );

  // Shield shape for workouts
  const ShieldBadge = ({ num, earned }) => (
    <div style={{ position: 'relative' }}>
      <svg width="90" height="90" viewBox="0 0 90 90" style={{ margin: '0 auto' }}>
        <defs>
          <linearGradient id={`shield-${num}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a4a3a" />
            <stop offset="100%" stopColor="#2d7a5c" />
          </linearGradient>
          <filter id={`glow-shield-${num}`}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M 45 5 L 75 20 L 75 50 Q 45 80 45 80 Q 15 50 15 50 L 15 20 Z"
          fill={earned ? `url(#shield-${num})` : '#e8e8e8'}
          stroke="none"
          filter={earned ? `url(#glow-shield-${num})` : 'none'}
          opacity={earned ? 1 : 0.6}
        />
        <text
          x="45"
          y="45"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="20"
          fontWeight="bold"
          fill={earned ? 'white' : '#c0c0c0'}
        >
          {num}x
        </text>
      </svg>
    </div>
  );

  // Badge shape for week streaks (downward pointing)
  const WeekStreakBadge = ({ count, earned }) => (
    <div style={{ position: 'relative' }}>
      <svg width="90" height="90" viewBox="0 0 90 90" style={{ margin: '0 auto' }}>
        <defs>
          <linearGradient id={`week-${count}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a4a3a" />
            <stop offset="100%" stopColor="#2d7a5c" />
          </linearGradient>
          <filter id={`glow-week-${count}`}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M 15 15 L 75 15 L 75 55 L 45 85 L 15 55 Z"
          fill={earned ? `url(#week-${count})` : '#e8e8e8'}
          stroke="none"
          filter={earned ? `url(#glow-week-${count})` : 'none'}
          opacity={earned ? 1 : 0.6}
        />
        <text
          x="45"
          y="42"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="20"
          fontWeight="bold"
          fill={earned ? 'white' : '#c0c0c0'}
        >
          {count}w
        </text>
      </svg>
    </div>
  );

  // Trophy shape for month streaks
  const MonthStreakBadge = ({ count, earned }) => (
    <div style={{ position: 'relative' }}>
      <svg width="90" height="90" viewBox="0 0 90 90" style={{ margin: '0 auto' }}>
        <defs>
          <linearGradient id={`month-${count}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a4a3a" />
            <stop offset="100%" stopColor="#2d7a5c" />
          </linearGradient>
          <filter id={`glow-month-${count}`}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Cup body */}
        <ellipse cx="45" cy="25" rx="20" ry="18" fill={earned ? `url(#month-${count})` : '#e8e8e8'} filter={earned ? `url(#glow-month-${count})` : 'none'} opacity={earned ? 1 : 0.6} />
        {/* Cup handles */}
        <path d="M 65 20 Q 75 25 75 35" stroke={earned ? '#1a4a3a' : '#c0c0c0'} strokeWidth="4" fill="none" />
        <path d="M 25 20 Q 15 25 15 35" stroke={earned ? '#1a4a3a' : '#c0c0c0'} strokeWidth="4" fill="none" />
        {/* Base */}
        <rect x="25" y="43" width="40" height="8" fill={earned ? `url(#month-${count})` : '#e8e8e8'} filter={earned ? `url(#glow-month-${count})` : 'none'} opacity={earned ? 1 : 0.6} />
        {/* Stem */}
        <rect x="40" y="51" width="10" height="15" fill={earned ? `url(#month-${count})` : '#e8e8e8'} filter={earned ? `url(#glow-month-${count})` : 'none'} opacity={earned ? 1 : 0.6} />
        {/* Base platform */}
        <ellipse cx="45" cy="70" rx="18" ry="8" fill={earned ? `url(#month-${count})` : '#e8e8e8'} filter={earned ? `url(#glow-month-${count})` : 'none'} opacity={earned ? 1 : 0.6} />
        <text
          x="45"
          y="70"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="16"
          fontWeight="bold"
          fill={earned ? 'white' : '#c0c0c0'}
        >
          {count}m
        </text>
      </svg>
    </div>
  );

  // Circular badge for trophies
  const CircularBadge = ({ icon, earned }) => (
    <div
      style={{
        width: '90px',
        height: '90px',
        borderRadius: '50%',
        background: earned ? 'linear-gradient(135deg, #1a4a3a 0%, #2d7a5c 100%)' : '#e8e8e8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '36px',
        margin: '0 auto',
        boxShadow: earned ? '0 0 20px rgba(122, 212, 168, 0.4)' : 'none',
        opacity: earned ? 1 : 0.6,
      }}
    >
      {icon}
    </div>
  );

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', padding: '24px 20px', paddingBottom: '100px' }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <BackButton to="/client/leaderboard" label="Back to Leaderboard" />

        {/* Header */}
        <div style={{ marginBottom: '40px', marginTop: '24px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#1a1a1a', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
            Achievements
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            Earn badges as you train harder
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '48px' }}>
            <div style={{ width: '32px', height: '32px', border: '4px solid #1a4a3a', borderTop: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <>
            {/* Milestones Section */}
            <div style={{ marginBottom: '48px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1a1a1a', margin: '0 0 24px 0', letterSpacing: '-0.5px' }}>
                Milestones
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {milestones.map((num, idx) => {
                  const earned = isEarned(`milestone-${num}`, 'milestone');
                  const isFirstEarned = idx === getFirstEarnedIndex('milestone');
                  return (
                    <div key={num} style={{ textAlign: 'center' }}>
                      <DiamondBadge num={num} earned={earned} />
                      {isFirstEarned && earned && (
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#2d7a5c',
                          margin: '8px auto 0',
                        }} />
                      )}
                      <p style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        color: earned ? '#1a1a1a' : '#9ca3af',
                        margin: '12px 0 0 0',
                      }}>
                        {num} Sessions
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Workouts in a Week Section */}
            <div style={{ marginBottom: '48px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1a1a1a', margin: '0 0 24px 0', letterSpacing: '-0.5px' }}>
                Workouts in a Week
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {workoutBadges.map((num, idx) => {
                  const earned = isEarned(`workout-${num}`, 'workout');
                  const isFirstEarned = idx === getFirstEarnedIndex('workout');
                  return (
                    <div key={num} style={{ textAlign: 'center' }}>
                      <ShieldBadge num={num} earned={earned} />
                      {isFirstEarned && earned && (
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#2d7a5c',
                          margin: '8px auto 0',
                        }} />
                      )}
                      <p style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        color: earned ? '#1a1a1a' : '#9ca3af',
                        margin: '12px 0 0 0',
                      }}>
                        {num}x Week
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Streaks - Weeks Section */}
            <div style={{ marginBottom: '48px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1a1a1a', margin: '0 0 24px 0', letterSpacing: '-0.5px' }}>
                Week Streaks
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {streakBadges.filter(b => b.type === 'weeks').map((badge, idx) => {
                  const earned = isEarned(`streak-${badge.type}-${badge.count}`, 'streak');
                  const isFirstEarned = idx === getFirstEarnedIndex('weeks');
                  return (
                    <div key={`week-${badge.count}`} style={{ textAlign: 'center' }}>
                      <WeekStreakBadge count={badge.count} earned={earned} />
                      {isFirstEarned && earned && (
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#2d7a5c',
                          margin: '8px auto 0',
                        }} />
                      )}
                      <p style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        color: earned ? '#1a1a1a' : '#9ca3af',
                        margin: '12px 0 0 0',
                      }}>
                        {badge.count} Weeks
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Streaks - Months Section */}
            <div style={{ marginBottom: '48px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1a1a1a', margin: '0 0 24px 0', letterSpacing: '-0.5px' }}>
                Month Streaks
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {streakBadges.filter(b => b.type === 'months').map((badge, idx) => {
                  const earned = isEarned(`streak-${badge.type}-${badge.count}`, 'streak');
                  const isFirstEarned = idx === getFirstEarnedIndex('months');
                  return (
                    <div key={`month-${badge.count}`} style={{ textAlign: 'center' }}>
                      <MonthStreakBadge count={badge.count} earned={earned} />
                      {isFirstEarned && earned && (
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#2d7a5c',
                          margin: '8px auto 0',
                        }} />
                      )}
                      <p style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        color: earned ? '#1a1a1a' : '#9ca3af',
                        margin: '12px 0 0 0',
                      }}>
                        {badge.count} Months
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trophies Section */}
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1a1a1a', margin: '0 0 24px 0', letterSpacing: '-0.5px' }}>
                Trophies
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {trophyBadges.map((badge, idx) => {
                  const earned = isEarned(badge.id, 'trophy');
                  const isFirstEarned = idx === getFirstEarnedIndex('trophy');
                  return (
                    <div key={badge.id} style={{ textAlign: 'center' }}>
                      <CircularBadge icon={badge.icon} earned={earned} />
                      {isFirstEarned && earned && (
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#2d7a5c',
                          margin: '8px auto 0',
                        }} />
                      )}
                      <p style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        color: earned ? '#1a1a1a' : '#9ca3af',
                        margin: '12px 0 0 0',
                      }}>
                        {badge.name}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
