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

const Label = ({ children }) => (
  <p style={{
    fontFamily: "'Satoshi', system-ui, sans-serif",
    fontSize: '0.6rem',
    fontWeight: 700,
    letterSpacing: '0.18em',
    color: '#3a3a3a',
    textTransform: 'uppercase',
    margin: '0 0 0.4rem 0',
  }}>{children}</p>
);

const Line = () => <div style={{ height: '1px', backgroundColor: '#141414' }} />;

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
        <div style={{ width: '20px', height: '20px', border: '2px solid #4CAF50', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
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
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  const quickLinks = [
    { label: 'My Sessions', sub: 'Book & manage', to: '/client/sessions' },
    { label: 'Progress', sub: 'Track results', to: '/client/progress' },
    { label: 'Wellness', sub: 'Daily check-in', to: '/client/wellness' },
    { label: 'Nutrition', sub: 'Food diary', to: '/client/nutrition' },
    { label: 'Messages', sub: 'Chat with PT', to: '/client/messages' },
    { label: 'Check-in', sub: 'Weekly review', to: '/client/checkin' },
    { label: 'Workouts', sub: 'Browse library', to: '/client/workouts' },
    { label: 'Leaderboard', sub: 'See rankings', to: '/client/leaderboard' },
  ];

  return (
    <div style={{ width: '100%', backgroundColor: '#0a0a0a', minHeight: '100vh', paddingBottom: '100px', maxWidth: '900px', margin: '0 auto' }}>

      {/* GREETING */}
      <div style={{ padding: '2.5rem 2rem 2rem' }}>
        <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.16em', color: '#4CAF50', textTransform: 'uppercase', margin: '0 0 0.5rem' }}>{greeting}</p>
        <h1 style={{ fontFamily: "'Clash Display', system-ui, sans-serif", fontSize: '2.2rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 0.3rem' }}>{firstName}</h1>
        <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.8rem', color: '#3a3a3a', margin: 0, fontWeight: 500 }}>{today}</p>
      </div>

      <Line />

      {/* NEXT SESSION */}
      <div
        onClick={() => navigate('/client/sessions')}
        style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'background 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.background = '#0e0e0e'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <div>
          <Label>Next session</Label>
          {nextSession ? (
            <>
              <p style={{ fontFamily: "'Clash Display', system-ui, sans-serif", fontSize: '1.25rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 0.25rem', lineHeight: 1.2 }}>
                {nextSession.title || 'Training Session'}
              </p>
              <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.78rem', color: '#3a3a3a', margin: 0, fontWeight: 500 }}>
                {nextSession.scheduled_time} · {new Date(nextSession.scheduled_date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
              </p>
            </>
          ) : (
            <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '1rem', color: '#2a2a2a', margin: 0, fontWeight: 500 }}>None booked yet</p>
          )}
        </div>
        <ArrowRight size={16} color="#3a3a3a" />
      </div>

      <Line />

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {[
          { value: sessionsRemaining, label: 'Sessions left', color: getSessionsColor() },
          { value: 5, label: 'Week streak', color: '#FF6B2B' },
          { value: sessionsUsed, label: 'Completed', color: '#FFD600' },
        ].map((stat, i) => (
          <div key={i} style={{ padding: '1.5rem 1.25rem', borderRight: i < 2 ? '1px solid #141414' : 'none' }}>
            <p style={{ fontFamily: "'Clash Display', system-ui, sans-serif", fontSize: '2.2rem', fontWeight: 800, color: stat.color, letterSpacing: '-0.03em', lineHeight: 1, margin: '0 0 0.35rem' }}>{stat.value}</p>
            <Label>{stat.label}</Label>
          </div>
        ))}
      </div>

      <Line />

      {/* BLOCK PROGRESS */}
      <div style={{ padding: '1.5rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem' }}>
          <div>
            <Label>Block progress</Label>
            <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.82rem', color: '#3a3a3a', margin: '0.3rem 0 0', fontWeight: 500 }}>{sessionsUsed} of {totalSessions} sessions done</p>
          </div>
          <p style={{ fontFamily: "'Clash Display', system-ui, sans-serif", fontSize: '1.4rem', fontWeight: 800, color: '#4CAF50', letterSpacing: '-0.03em', margin: 0 }}>{Math.round(blockProgress)}%</p>
        </div>
        <div style={{ width: '100%', height: '2px', backgroundColor: '#1a1a1a', borderRadius: '1px' }}>
          <div style={{ height: '100%', width: `${blockProgress}%`, backgroundColor: '#4CAF50', borderRadius: '1px', transition: 'width 0.8s ease' }} />
        </div>
      </div>

      <Line />

      {/* QUICK ACCESS */}
      <div style={{ padding: '1.5rem 2rem 0.75rem' }}>
        <Label>Quick access</Label>
      </div>

      {quickLinks.map((link, i) => (
        <div key={i}>
          <div
            onClick={() => navigate(link.to)}
            style={{ padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#0e0e0e'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div>
              <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.9rem', fontWeight: 600, color: '#d0d0d0', margin: '0 0 2px', letterSpacing: '-0.01em' }}>{link.label}</p>
              <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.72rem', color: '#3a3a3a', margin: 0, fontWeight: 500 }}>{link.sub}</p>
            </div>
            <ArrowRight size={13} color="#2a2a2a" />
          </div>
          {i < quickLinks.length - 1 && <Line />}
        </div>
      ))}

      <Line />

      {/* QUOTE */}
      <div style={{ padding: '1.75rem 2rem' }}>
        <Label>Today's motivation</Label>
        <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.95rem', fontWeight: 500, color: '#888', lineHeight: 1.65, margin: '0.6rem 0 0.6rem', fontStyle: 'italic' }}>"{quote.text}"</p>
        <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', color: '#4CAF50', textTransform: 'uppercase', margin: 0 }}>— {quote.author}</p>
      </div>

    </div>
  );
}
