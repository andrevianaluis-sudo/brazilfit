import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import api from '../../utils/api';

const MOTIVATIONAL_QUOTES = [
  { text: 'Progress is progress no matter how small.', author: 'Unknown' },
  { text: 'The only bad workout is the one that did not happen.', author: 'Unknown' },
  { text: 'Your body can stand almost anything. It is your mind you have to convince.', author: 'Unknown' },
  { text: 'Train hard, recover harder.', author: 'Unknown' },
  { text: 'The pain you feel today will be the strength you feel tomorrow.', author: 'Unknown' },
  { text: "Don't wish for it. Work for it.", author: 'Unknown' },
  { text: 'It never gets easier. You just get better.', author: 'Unknown' },
  { text: 'Fall in love with taking care of yourself.', author: 'Unknown' },
  { text: 'Success is usually the culmination of controlling failure.', author: 'Sylvester Stallone' },
  { text: "Whether you think you can or you think you cannot — you're right.", author: 'Henry Ford' },
];

const Tag = ({ children }) => (
  <p style={{
    fontFamily: "'Satoshi', system-ui, sans-serif",
    fontSize: '0.62rem',
    fontWeight: 700,
    letterSpacing: '0.16em',
    color: '#484848',
    textTransform: 'uppercase',
    margin: '0 0 0.5rem 0',
  }}>{children}</p>
);

const Divider = () => (
  <div style={{ height: '1px', backgroundColor: '#161616', width: '100%' }} />
);

export default function ClientHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState(MOTIVATIONAL_QUOTES[0]);

  useEffect(() => {
    if (!user?.clientId) return;
    api.get(`/sessions/client/${user.clientId}`)
      .then(res => setSessions(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    setQuote(MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length]);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#0a0a0a' }}>
        <div style={{ width: '24px', height: '24px', border: '2px solid #4CAF50', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const nextSession = sessions?.upcoming?.[0];
  const sessionsRemaining = sessions?.sessionsRemaining || 0;
  const sessionsUsed = sessions?.sessionsUsed || 0;
  const totalSessions = sessionsUsed + sessionsRemaining;
  const blockProgress = totalSessions > 0 ? (sessionsUsed / totalSessions) * 100 : 0;

  const getSessionsColor = () => {
    if (sessionsRemaining === 0) return '#ef4444';
    if (sessionsRemaining <= 2) return '#FF6B2B';
    if (sessionsRemaining <= 5) return '#FFD600';
    return '#4CAF50';
  };

  const hour = new Date().getHours();
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 18) greeting = 'Good afternoon';

  const firstName = user?.name?.split(' ')[0] || 'Athlete';

  const quickLinks = [
    { label: 'My Sessions', sub: 'Book & manage', to: '/client/sessions' },
    { label: 'Progress', sub: 'Track results', to: '/client/progress' },
    { label: 'Wellness', sub: 'Check in daily', to: '/client/wellness' },
    { label: 'Nutrition', sub: 'Food diary', to: '/client/nutrition' },
    { label: 'Messages', sub: 'Chat with PT', to: '/client/messages' },
    { label: 'Check-in', sub: 'Weekly review', to: '/client/checkin' },
    { label: 'Workouts', sub: 'Browse library', to: '/client/workouts' },
    { label: 'Leaderboard', sub: 'See rankings', to: '/client/leaderboard' },
  ];

  return (
    <div style={{ width: '100%', backgroundColor: '#0a0a0a', minHeight: '100vh', paddingBottom: '120px' }}>

      <div style={{ padding: '3rem 2rem 2.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '260px', height: '260px', background: 'radial-gradient(circle, rgba(76,175,80,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', color: '#4CAF50', textTransform: 'uppercase', margin: '0 0 0.75rem 0' }}>{greeting}</p>
        <h1 style={{ fontFamily: "'Clash Display', system-ui, sans-serif", fontSize: 'clamp(3.5rem, 12vw, 6rem)', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.05em', lineHeight: 0.9, margin: '0 0 2rem 0' }}>{firstName}</h1>
        {user?.isPro && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'linear-gradient(135deg, #FF6B2B, #FFD600)', padding: '4px 10px', borderRadius: '2px', fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.14em', color: '#000', textTransform: 'uppercase' }}>PRO MEMBER</span>
        )}
      </div>

      <Divider />

      {nextSession ? (
        <>
          <div onClick={() => navigate('/client/sessions')} style={{ padding: '1.75rem 2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', transition: 'background 0.15s ease' }} onMouseEnter={e => e.currentTarget.style.background = '#0d0d0d'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div style={{ flex: 1 }}>
              <Tag>Next session</Tag>
              <h2 style={{ fontFamily: "'Clash Display', system-ui, sans-serif", fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', margin: '0.3rem 0 0.4rem', lineHeight: 1.1 }}>{nextSession.title || 'Training Session'}</h2>
              <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.82rem', color: '#484848', margin: 0, fontWeight: 500 }}>{nextSession.scheduled_time} · {new Date(nextSession.scheduled_date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
            </div>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', border: '1px solid #242424', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ArrowRight size={15} color="#4CAF50" />
            </div>
          </div>
          <Divider />
        </>
      ) : (
        <>
          <div style={{ padding: '1.75rem 2rem' }}>
            <Tag>Next session</Tag>
            <p style={{ fontFamily: "'Clash Display', system-ui, sans-serif", fontSize: '1.5rem', fontWeight: 700, color: '#2a2a2a', letterSpacing: '-0.03em', margin: '0.3rem 0 0' }}>None booked yet</p>
          </div>
          <Divider />
        </>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {[
          { value: sessionsRemaining, label: 'Sessions left', color: getSessionsColor() },
          { value: 5, label: 'Week streak', color: '#FF6B2B' },
          { value: sessionsUsed, label: 'Completed', color: '#FFD600' },
        ].map((stat, i) => (
          <div key={i} style={{ padding: '1.75rem 1.25rem', borderRight: i < 2 ? '1px solid #161616' : 'none' }}>
            <p style={{ fontFamily: "'Clash Display', system-ui, sans-serif", fontSize: 'clamp(2.5rem, 8vw, 3.5rem)', fontWeight: 800, color: stat.color, letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 0.4rem 0' }}>{stat.value}</p>
            <Tag>{stat.label}</Tag>
          </div>
        ))}
      </div>

      <Divider />

      <div style={{ padding: '1.75rem 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <Tag>Block progress</Tag>
            <p style={{ fontFamily: "'Clash Display', system-ui, sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', margin: '0.3rem 0 0' }}>{sessionsUsed} of {totalSessions} sessions</p>
          </div>
          <p style={{ fontFamily: "'Clash Display', system-ui, sans-serif", fontSize: '2rem', fontWeight: 800, color: '#4CAF50', letterSpacing: '-0.04em', margin: 0, lineHeight: 1 }}>{Math.round(blockProgress)}%</p>
        </div>
        <div style={{ width: '100%', height: '3px', backgroundColor: '#1a1a1a', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${blockProgress}%`, background: 'linear-gradient(90deg, #4CAF50, #66BB6A)', borderRadius: '2px', transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }} />
        </div>
      </div>

      <Divider />

      <div style={{ padding: '1.5rem 2rem 0.5rem' }}>
        <Tag>Quick access</Tag>
      </div>

      <div>
        {quickLinks.map((link, i) => (
          <div key={i}>
            <div onClick={() => navigate(link.to)} style={{ padding: '1.1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'background 0.15s ease' }} onMouseEnter={e => e.currentTarget.style.background = '#0d0d0d'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div>
                <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.95rem', fontWeight: 600, color: '#ffffff', margin: '0 0 2px 0', letterSpacing: '-0.01em' }}>{link.label}</p>
                <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.75rem', color: '#484848', margin: 0, fontWeight: 500 }}>{link.sub}</p>
              </div>
              <ArrowRight size={14} color="#2a2a2a" />
            </div>
            {i < quickLinks.length - 1 && <Divider />}
          </div>
        ))}
      </div>

      <Divider />

      <div style={{ padding: '2rem 2rem 1rem' }}>
        <Tag>Today's motivation</Tag>
        <p style={{ fontFamily: "'Clash Display', system-ui, sans-serif", fontSize: 'clamp(1.1rem, 3.5vw, 1.4rem)', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.3, margin: '0.75rem 0 0.75rem' }}>"{quote.text}"</p>
        <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', color: '#4CAF50', textTransform: 'uppercase', margin: 0 }}>— {quote.author}</p>
      </div>

    </div>
  );
}
