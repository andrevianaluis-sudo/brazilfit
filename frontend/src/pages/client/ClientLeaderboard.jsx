import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import api from '../../utils/api';
import BackButton from '../../components/BackButton';

export default function ClientLeaderboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leaderboardType, setLeaderboardType] = useState('weekly');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboardData();
  }, [leaderboardType]);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      const type = leaderboardType === 'weekly' ? 'current_week' : 'all_time';
      const res = await api.get(`/leaderboard?type=${type}`);
      setLeaderboardData(res.data.leaderboard || []);
      setUserStats(res.data.userStats || {});
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
      setLeaderboardData([
        { rank: 1, name: 'Alex', initials: 'A', sessions: 12, sessions_this_week: 5 },
        { rank: 2, name: 'Jordan', initials: 'J', sessions: 11, sessions_this_week: 4 },
        { rank: 3, name: 'Casey', initials: 'C', sessions: 10, sessions_this_week: 4 },
        { rank: 4, name: 'Morgan', initials: 'M', sessions: 9, sessions_this_week: 3 },
        { rank: 5, name: 'Taylor', initials: 'T', sessions: 8, sessions_this_week: 3 },
      ]);
      setUserStats({ total_sessions: 45, sessions_this_week: 3, current_rank: 7 });
    } finally {
      setLoading(false);
    }
  };

  const getTopAccentColor = (rank) => {
    if (rank === 1) return '#f9c041'; // Gold
    if (rank === 2) return '#c0c0c0'; // Silver
    if (rank === 3) return '#cd7f32'; // Bronze
    return '#2d7a5c'; // Green for others
  };

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', paddingBottom: '100px' }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1a4a3a 0%, #7dd4a8 100%)',
          padding: '40px 20px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Trophy size={24} />
            <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9 }}>
              Leaderboard
            </span>
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'white', margin: '0 0 4px 0', lineHeight: 1.1 }}>
            See How You Rank
          </h1>
          <p style={{ fontSize: '13px', opacity: 0.9, margin: 0 }}>
            Train harder and climb the rankings
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '32px 20px' }}>
        {/* My Stats Card */}
        <div style={{
          background: 'linear-gradient(135deg, #1a4a3a 0%, #2d7a5c 100%)',
          borderRadius: '16px',
          padding: '28px',
          marginBottom: '32px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, rgba(125, 212, 168, 0.6), transparent)',
          }} />

          <div style={{ textAlign: 'center', marginBottom: '24px', position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: '48px', fontWeight: 800, margin: 0, lineHeight: 1 }}>
              {userStats?.total_sessions || 0}
            </p>
            <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8, margin: '8px 0 0 0' }}>
              Sessions Completed
            </p>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            borderTop: '1px solid rgba(125, 212, 168, 0.3)',
            paddingTop: '16px',
            position: 'relative',
            zIndex: 1,
          }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px 0' }}>
                {userStats?.streak || 0}
              </p>
              <p style={{ fontSize: '11px', opacity: 0.8, margin: 0 }}>Week Streak</p>
            </div>
            <div style={{ width: '1px', height: '30px', backgroundColor: 'rgba(125, 212, 168, 0.3)' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px 0' }}>
                {userStats?.checkins || 0}
              </p>
              <p style={{ fontSize: '11px', opacity: 0.8, margin: 0 }}>Check-ins</p>
            </div>
            <div style={{ width: '1px', height: '30px', backgroundColor: 'rgba(125, 212, 168, 0.3)' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px 0' }}>
                #{userStats?.current_rank || '?'}
              </p>
              <p style={{ fontSize: '11px', opacity: 0.8, margin: 0 }}>Your Rank</p>
            </div>
          </div>
        </div>

        {/* Toggle Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
          <button
            onClick={() => setLeaderboardType('weekly')}
            style={{
              flex: 1,
              padding: '12px 16px',
              backgroundColor: leaderboardType === 'weekly' ? '#1a4a3a' : '#f3f4f6',
              color: leaderboardType === 'weekly' ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '24px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (leaderboardType !== 'weekly') {
                e.target.style.backgroundColor = '#e5e7eb';
              }
            }}
            onMouseLeave={(e) => {
              if (leaderboardType !== 'weekly') {
                e.target.style.backgroundColor = '#f3f4f6';
              }
            }}
          >
            This Week
          </button>
          <button
            onClick={() => setLeaderboardType('alltime')}
            style={{
              flex: 1,
              padding: '12px 16px',
              backgroundColor: leaderboardType === 'alltime' ? '#1a4a3a' : '#f3f4f6',
              color: leaderboardType === 'alltime' ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '24px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (leaderboardType !== 'alltime') {
                e.target.style.backgroundColor = '#e5e7eb';
              }
            }}
            onMouseLeave={(e) => {
              if (leaderboardType !== 'alltime') {
                e.target.style.backgroundColor = '#f3f4f6';
              }
            }}
          >
            All Time
          </button>
        </div>

        {/* Leaderboard List */}
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a1a', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {leaderboardType === 'weekly' ? 'Weekly Leaders' : 'All Time Leaders'}
          </h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '4px solid #1a4a3a', borderTop: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : (
            <>
              {leaderboardData.map((entry, index) => {
                const isCurrentUser = user?.clientId === entry.client_id;
                const sessions = leaderboardType === 'weekly' ? entry.sessions_this_week : entry.attended_sessions || entry.sessions;
                const accentColor = getTopAccentColor(entry.rank);

                return (
                  <div
                    key={entry.client_id || index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '16px 16px',
                      backgroundColor: isCurrentUser ? '#1a4a3a' : 'white',
                      borderRadius: '12px',
                      marginBottom: '12px',
                      border: isCurrentUser ? '1px solid #2d7a5c' : '1px solid #f0f0f0',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {/* Rank */}
                    <div style={{
                      minWidth: '40px',
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <span style={{
                        fontSize: '16px',
                        fontWeight: 700,
                        color: isCurrentUser ? 'white' : accentColor,
                      }}>
                        {entry.rank <= 3 ? (
                          entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'
                        ) : (
                          `#${entry.rank}`
                        )}
                      </span>
                    </div>

                    {/* Avatar */}
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: accentColor,
                      border: `2px solid ${isCurrentUser ? '#7dd4a8' : 'transparent'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '14px',
                      marginLeft: '12px',
                      marginRight: '12px',
                      flexShrink: 0,
                    }}>
                      {entry.initials || entry.name?.substring(0, 1) || '?'}
                    </div>

                    {/* Name */}
                    <div style={{ flex: 1 }}>
                      <p style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: isCurrentUser ? 'white' : '#1a1a1a',
                        margin: 0,
                      }}>
                        {isCurrentUser ? 'You' : (entry.is_anonymous ? 'Member' : (entry.name || 'Anonymous'))}
                      </p>
                    </div>

                    {/* Sessions */}
                    <div style={{ textAlign: 'right' }}>
                      <p style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: isCurrentUser ? '#7dd4a8' : '#1a4a3a',
                        margin: 0,
                      }}>
                        {sessions}
                      </p>
                      <p style={{
                        fontSize: '11px',
                        color: isCurrentUser ? 'rgba(255, 255, 255, 0.7)' : '#6b7280',
                        margin: '2px 0 0 0',
                      }}>
                        sessions
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Current User Position if outside top 10 */}
              {leaderboardData.length > 0 && userStats?.current_rank > 10 && (
                <>
                  <div style={{ textAlign: 'center', color: '#d1d5db', fontSize: '14px', margin: '20px 0 20px 0' }}>
                    • • •
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '16px 16px',
                      backgroundColor: '#1a4a3a',
                      borderRadius: '12px',
                      border: '1px solid #2d7a5c',
                    }}
                  >
                    <div style={{
                      minWidth: '40px',
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: 'white',
                      }}>
                        #{userStats?.current_rank}
                      </span>
                    </div>

                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#2d7a5c',
                      border: '2px solid #7dd4a8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '14px',
                      marginLeft: '12px',
                      marginRight: '12px',
                      flexShrink: 0,
                    }}>
                      {user?.name?.substring(0, 1) || '?'}
                    </div>

                    <div style={{ flex: 1 }}>
                      <p style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: 'white',
                        margin: 0,
                      }}>
                        You
                      </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <p style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: '#7dd4a8',
                        margin: 0,
                      }}>
                        {leaderboardType === 'weekly' ? userStats?.sessions_this_week : userStats?.total_sessions}
                      </p>
                      <p style={{
                        fontSize: '11px',
                        color: 'rgba(255, 255, 255, 0.7)',
                        margin: '2px 0 0 0',
                      }}>
                        sessions
                      </p>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* View Achievements Button */}
        <button
          onClick={() => navigate('/client/achievements')}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: '#1a4a3a',
            color: 'white',
            fontWeight: 600,
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '15px',
            marginTop: '32px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#0f3a2a';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#1a4a3a';
          }}
        >
          View Achievements
        </button>
      </div>
    </div>
  );
}
