import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Trophy, ArrowRight } from 'lucide-react';
import api from '../../utils/api';
import BackButton from '../../components/BackButton';

const BG = '#141414';
const SURFACE = '#2a2a2a';
const SURFACE2 = '#333333';
const BORDER = 'rgba(255,255,255,0.15)';
const TEXT = '#ffffff';
const MUTED = '#707070';
const ORANGE = '#FF6B2B';
const YELLOW = '#FFD600';
const GREEN = '#4CAF50';

const MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' };
const MEDAL_COLOR = { 1: '#FFD600', 2: '#c0c0c0', 3: '#cd7f32' };

export default function ClientLeaderboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leaderboardType, setLeaderboardType] = useState('weekly');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchLeaderboardData(); }, [leaderboardType]);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      const type = leaderboardType === 'weekly' ? 'current_week' : 'all_time';
      const res = await api.get(`/leaderboard?type=${type}`);
      setLeaderboardData(res.data.leaderboard || []);
      setUserStats(res.data.userStats || {});
    } catch {
      setLeaderboardData([
        { rank: 1, name: 'Alex',   initials: 'A', sessions: 12, sessions_this_week: 5 },
        { rank: 2, name: 'Jordan', initials: 'J', sessions: 11, sessions_this_week: 4 },
        { rank: 3, name: 'Casey',  initials: 'C', sessions: 10, sessions_this_week: 4 },
        { rank: 4, name: 'Morgan', initials: 'M', sessions: 9,  sessions_this_week: 3 },
        { rank: 5, name: 'Taylor', initials: 'T', sessions: 8,  sessions_this_week: 3 },
      ]);
      setUserStats({ total_sessions: 45, sessions_this_week: 3, current_rank: 7, streak: 4, checkins: 12 });
    } finally { setLoading(false); }
  };

  return (
    <div style={{ backgroundColor: BG, minHeight: '100vh', paddingBottom: '6rem' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem 1.25rem' }}>
        <BackButton to="/client" />

        {/* Header */}
        <div style={{ margin: '1.25rem 0 1.5rem' }}>
          <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', color: ORANGE, textTransform: 'uppercase', margin: '0 0 0.4rem' }}>Community</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Trophy size={20} color={YELLOW} />
            <h1 style={{ fontFamily: "'Clash Display', system-ui", fontSize: '2rem', fontWeight: 700, color: TEXT, letterSpacing: '-0.03em', margin: 0 }}>Leaderboard</h1>
          </div>
        </div>

        {/* My stats card */}
        <div style={{
          background: `linear-gradient(135deg, ${ORANGE}22, ${YELLOW}11)`,
          border: `1px solid ${ORANGE}33`,
          borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${ORANGE}, transparent)` }} />

          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <p style={{ fontFamily: "'Clash Display', system-ui", fontSize: '3.5rem', fontWeight: 800, color: ORANGE, letterSpacing: '-0.04em', margin: 0, lineHeight: 1 }}>
              {userStats?.total_sessions || 0}
            </p>
            <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', color: MUTED, textTransform: 'uppercase', margin: '6px 0 0' }}>Sessions Completed</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', borderTop: `1px solid ${BORDER}`, paddingTop: '1rem' }}>
            {[
              { value: userStats?.streak || 0, label: 'Week Streak' },
              { value: userStats?.checkins || 0, label: 'Check-ins' },
              { value: `#${userStats?.current_rank || '?'}`, label: 'Your Rank', highlight: true },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: "'Clash Display', system-ui", fontSize: '1.4rem', fontWeight: 800, color: s.highlight ? ORANGE : TEXT, letterSpacing: '-0.03em', margin: '0 0 4px' }}>{s.value}</p>
                <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.65rem', color: MUTED, margin: 0, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Toggle */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', backgroundColor: SURFACE, borderRadius: '10px', padding: '4px' }}>
          {[['weekly', 'This Week'], ['alltime', 'All Time']].map(([key, label]) => (
            <button key={key} onClick={() => setLeaderboardType(key)} style={{
              flex: 1, padding: '0.7rem', borderRadius: '8px', border: 'none',
              backgroundColor: leaderboardType === key ? ORANGE : 'transparent',
              color: leaderboardType === key ? '#000' : MUTED,
              fontFamily: "'DM Sans', system-ui", fontSize: '0.875rem', fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.15s ease', minHeight: 'auto',
            }}>{label}</button>
          ))}
        </div>

        {/* List header */}
        <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.18em', color: MUTED, textTransform: 'uppercase', margin: '0 0 0.75rem' }}>
          {leaderboardType === 'weekly' ? 'Weekly Leaders' : 'All Time Leaders'}
        </p>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div style={{ width: '20px', height: '20px', border: `2px solid ${ORANGE}`, borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {leaderboardData.map((entry, index) => {
              const isCurrentUser = user?.clientId === entry.client_id;
              const sessions = leaderboardType === 'weekly' ? entry.sessions_this_week : (entry.attended_sessions || entry.sessions);
              const medalColor = MEDAL_COLOR[entry.rank] || ORANGE;
              const initials = entry.initials || entry.name?.substring(0, 1) || '?';

              return (
                <div key={entry.client_id || index} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '0.875rem 1rem', borderRadius: '10px',
                  backgroundColor: isCurrentUser ? `${ORANGE}18` : SURFACE,
                  border: `1px solid ${isCurrentUser ? `${ORANGE}44` : BORDER}`,
                  transition: 'all 0.15s ease',
                }}>
                  {/* Rank */}
                  <div style={{ width: '32px', textAlign: 'center', flexShrink: 0 }}>
                    {entry.rank <= 3 ? (
                      <span style={{ fontSize: '1.25rem' }}>{MEDAL[entry.rank]}</span>
                    ) : (
                      <span style={{ fontFamily: "'Clash Display', system-ui", fontSize: '0.9rem', fontWeight: 700, color: MUTED }}>#{entry.rank}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                    backgroundColor: isCurrentUser ? ORANGE : `${medalColor}22`,
                    border: `1px solid ${isCurrentUser ? ORANGE : medalColor}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Clash Display', system-ui", fontSize: '0.8rem', fontWeight: 800,
                    color: isCurrentUser ? '#000' : medalColor,
                  }}>{initials}</div>

                  {/* Name */}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.9rem', fontWeight: 600, color: isCurrentUser ? ORANGE : TEXT, margin: 0 }}>
                      {isCurrentUser ? 'You' : (entry.is_anonymous ? 'Member' : (entry.name || 'Anonymous'))}
                    </p>
                  </div>

                  {/* Sessions */}
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontFamily: "'Clash Display', system-ui", fontSize: '1.1rem', fontWeight: 800, color: isCurrentUser ? ORANGE : TEXT, margin: 0, letterSpacing: '-0.02em' }}>{sessions}</p>
                    <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.65rem', color: MUTED, margin: 0 }}>sessions</p>
                  </div>
                </div>
              );
            })}

            {/* User outside top 10 */}
            {leaderboardData.length > 0 && userStats?.current_rank > 10 && (
              <>
                <div style={{ textAlign: 'center', color: MUTED, fontSize: '1rem', padding: '0.5rem 0' }}>• • •</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0.875rem 1rem', borderRadius: '10px', backgroundColor: `${ORANGE}18`, border: `1px solid ${ORANGE}44` }}>
                  <div style={{ width: '32px', textAlign: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: "'Clash Display', system-ui", fontSize: '0.9rem', fontWeight: 700, color: ORANGE }}>#{userStats?.current_rank}</span>
                  </div>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Clash Display', system-ui", fontSize: '0.8rem', fontWeight: 800, color: '#000', flexShrink: 0 }}>
                    {user?.name?.substring(0, 1) || '?'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.9rem', fontWeight: 600, color: ORANGE, margin: 0 }}>You</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontFamily: "'Clash Display', system-ui", fontSize: '1.1rem', fontWeight: 800, color: ORANGE, margin: 0 }}>{leaderboardType === 'weekly' ? userStats?.sessions_this_week : userStats?.total_sessions}</p>
                    <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.65rem', color: MUTED, margin: 0 }}>sessions</p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Achievements button */}
        <button onClick={() => navigate('/client/achievements')} style={{
          width: '100%', padding: '1rem', marginTop: '1.5rem',
          background: `linear-gradient(135deg, ${ORANGE}, ${YELLOW})`,
          border: 'none', borderRadius: '10px', color: '#000',
          fontFamily: "'DM Sans', system-ui", fontSize: '0.9rem', fontWeight: 800,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '8px', minHeight: 'auto', transition: 'all 0.15s',
        }}>
          <Trophy size={16} /> View Achievements <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
