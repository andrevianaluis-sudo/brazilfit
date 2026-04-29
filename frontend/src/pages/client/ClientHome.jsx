import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, TrendingUp, Heart, Apple, MessageSquare, CheckSquare } from 'lucide-react';
import api from '../../utils/api';

const MOTIVATIONAL_QUOTES = [
  { text: 'Progress is progress no matter how small.', author: 'Unknown' },
  { text: 'The only bad workout is the one that did not happen.', author: 'Unknown' },
  { text: 'Your body can stand almost anything. It is your mind you have to convince.', author: 'Unknown' },
  { text: 'Train hard, recover harder.', author: 'Unknown' },
  { text: 'The pain you feel today will be the strength you feel tomorrow.', author: 'Unknown' },
  { text: 'Don\'t wish for it. Work for it.', author: 'Unknown' },
  { text: 'It never gets easier. You just get better.', author: 'Unknown' },
  { text: 'Fall in love with taking care of yourself.', author: 'Unknown' },
  { text: 'Success is usually the culmination of controlling failure.', author: 'Sylvester Stallone' },
  { text: 'Whether you think you can or you think you cannot — you\'re right.', author: 'Henry Ford' },
];

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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#0f0f0f' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid #4CAF50', borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#606060', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>Loading</p>
        </div>
      </div>
    );
  }

  const nextSession = sessions?.upcoming?.[0];
  const sessionsRemaining = sessions?.sessionsRemaining || 0;
  const sessionsUsed = sessions?.sessionsUsed || 0;
  const blockProgress = (sessionsUsed / (sessionsUsed + sessionsRemaining)) * 100 || 0;

  const getSessionsColor = () => {
    if (sessionsRemaining === 0) return '#FF4444';
    if (sessionsRemaining <= 2) return '#FF6B2B';
    if (sessionsRemaining <= 5) return '#FFD600';
    return '#4CAF50';
  };

  const hour = new Date().getHours();
  let greeting = 'GOOD EVENING';
  if (hour < 12) greeting = 'GOOD MORNING';
  else if (hour < 18) greeting = 'GOOD AFTERNOON';

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  const quickLinks = [
    { icon: Calendar, label: 'My Sessions', to: '/client/sessions', accent: '#4CAF50' },
    { icon: TrendingUp, label: 'Progress', to: '/client/progress', accent: '#FF6B2B' },
    { icon: Heart, label: 'Wellness', to: '/client/wellness', accent: '#FF6B2B' },
    { icon: Apple, label: 'Nutrition', to: '/client/nutrition', accent: '#FFD600' },
    { icon: MessageSquare, label: 'Messages', to: '/client/messages', accent: '#4CAF50' },
    { icon: CheckSquare, label: 'Check-in', to: '/client/checkin', accent: '#FFD600' },
  ];

  const firstName = user?.name?.split(' ')[0] || 'Client';
  const initials = firstName.charAt(0).toUpperCase();

  return (
    <div style={{ width: '100%', backgroundColor: '#0f0f0f', minHeight: '100vh', paddingBottom: '100px' }}>

      {/* Hero Banner */}
      <div className="dashboard-hero">
        <div style={{ maxWidth: '700px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <div>
              <p className="dashboard-hero-subtitle" style={{ marginBottom: '0.5rem' }}>
                {greeting}
              </p>
              <h1 className="dashboard-hero-title">
                {firstName}
              </h1>
              <p style={{ margin: '0.4rem 0 0', fontSize: '0.85rem', color: '#606060' }}>
                {dateStr}
              </p>
            </div>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              fontWeight: 800,
              color: '#000',
              flexShrink: 0,
              boxShadow: '0 4px 16px rgba(76,175,80,0.3)'
            }}>
              {initials}
            </div>
          </div>

          {user?.isPro && (
            <div className="pro-badge" style={{ marginTop: '1rem' }}>
              ✓ PRO MEMBER
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '1.5rem 1.25rem' }}>

        {/* Next Session Banner */}
        {nextSession && (
          <div
            className="next-session-card"
            style={{ marginBottom: '1.5rem', cursor: 'pointer' }}
            onClick={() => navigate('/client/sessions')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p className="next-session-label">Next Session</p>
                <p className="next-session-title">{nextSession.title || 'Training Session'}</p>
                <p className="next-session-time">
                  {nextSession.scheduled_time} · {new Date(nextSession.scheduled_date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                </p>
              </div>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
                flexShrink: 0
              }}>
                ▶
              </div>
            </div>
          </div>
        )}

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div className="stat-card">
            <p className="stat-card-label">Sessions</p>
            <p className="stat-card-value" style={{ color: getSessionsColor() }}>
              {sessionsRemaining}
            </p>
            <p className="stat-card-subtitle">remaining</p>
          </div>
          <div className="stat-card">
            <p className="stat-card-label">Streak</p>
            <p className="stat-card-value" style={{ color: '#FF6B2B' }}>5</p>
            <p className="stat-card-subtitle">weeks</p>
          </div>
          <div className="stat-card">
            <p className="stat-card-label">Done</p>
            <p className="stat-card-value" style={{ color: '#FFD600' }}>{sessionsUsed}</p>
            <p className="stat-card-subtitle">sessions</p>
          </div>
        </div>

        {/* Block Progress */}
        <div className="block-progress-card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <p style={{ fontFamily: "'Satoshi', system-ui", fontSize: '0.7rem', fontWeight: 700, color: '#606060', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
              Block Progress
            </p>
            <p style={{ fontFamily: "'Clash Display', system-ui", fontSize: '1.1rem', fontWeight: 800, color: '#4CAF50', margin: 0 }}>
              {Math.round(blockProgress)}%
            </p>
          </div>
          <div className="premium-progress-bar">
            <div className="premium-progress-fill" style={{ width: `${blockProgress}%` }} />
          </div>
          <p style={{ fontFamily: "'Satoshi', system-ui", fontSize: '0.8rem', color: '#606060', margin: '0.75rem 0 0', fontWeight: 500 }}>
            {sessionsUsed} of {sessionsUsed + sessionsRemaining} sessions completed
          </p>
        </div>

        {/* Quick Links */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 className="section-header">Quick Access</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            {quickLinks.map((link, idx) => {
              const Icon = link.icon;
              return (
                <button
                  key={idx}
                  onClick={() => navigate(link.to)}
                  className="quick-link-button"
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: `${link.accent}18`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Icon size={18} style={{ color: link.accent }} />
                  </div>
                  <p className="quick-link-label">{link.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Motivational Quote */}
        <div className="motivation-card">
          <p className="motivation-quote">"{quote.text}"</p>
          <p className="motivation-author">— {quote.author}</p>
        </div>

      </div>
    </div>
  );
}
