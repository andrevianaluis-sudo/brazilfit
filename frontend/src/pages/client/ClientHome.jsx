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
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '48px' }}>
        <div style={{ width: '32px', height: '32px', border: '4px solid #2d7a5c', borderTop: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const nextSession = sessions?.upcoming?.[0];
  const sessionsRemaining = sessions?.sessionsRemaining || 0;
  const sessionsUsed = sessions?.sessionsUsed || 0;
  const blockProgress = (sessionsUsed / (sessionsUsed + sessionsRemaining)) * 100 || 0;

  const getSessionsColor = () => {
    if (sessionsRemaining === 0) return '#E74C3C';
    if (sessionsRemaining <= 2) return '#E67E22';
    if (sessionsRemaining <= 5) return '#F39C12';
    return '#1a1a1a';
  };

  const getSessionsMessage = () => {
    if (sessionsRemaining === 0) return 'Contact your PT to renew';
    if (sessionsRemaining <= 2) return 'Almost there — renew soon';
    if (sessionsRemaining <= 5) return 'Going strong';
    return 'Great progress';
  };

  const hour = new Date().getHours();
  let greeting = 'GOOD EVENING';
  if (hour < 12) greeting = 'GOOD MORNING';
  else if (hour < 18) greeting = 'GOOD AFTERNOON';

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // Quick links data
  const quickLinks = [
    { icon: Calendar, label: 'My Sessions', to: '/client/sessions' },
    { icon: TrendingUp, label: 'Progress', to: '/client/progress' },
    { icon: Heart, label: 'Wellness', to: '/client/wellness' },
    { icon: Apple, label: 'Nutrition', to: '/client/nutrition' },
    { icon: MessageSquare, label: 'Messages', to: '/client/messages' },
    { icon: CheckSquare, label: 'Check-in', to: '/client/checkin' },
  ];

  return (
    <div style={{ width: '100%', backgroundColor: '#f8faf9', minHeight: '100vh', paddingBottom: '100px' }}>
      {/* Hero Banner */}
      <div className="dashboard-hero">
        <div style={{ maxWidth: '700px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <p className="dashboard-hero-subtitle" style={{ marginBottom: '1rem' }}>
            {greeting}
          </p>
          <div style={{ marginBottom: '1.5rem' }}>
            <h1 className="dashboard-hero-title">
              Welcome, {user?.name?.split(' ')[0] || 'Client'}
            </h1>
            <p className="dashboard-hero-subtitle">
              {dateStr}
            </p>
          </div>
          {user?.isPro && (
            <div
              style={{
                display: 'inline-block',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              ✓ PRO MEMBER
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem 1.25rem' }}>
        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {/* Sessions Left */}
          <div className="stat-card">
            <p className="stat-card-label">Sessions Left</p>
            <p className="stat-card-value" style={{ color: getSessionsColor() }}>
              {sessionsRemaining}
            </p>
            <p className="stat-card-subtitle">
              of {sessionsRemaining + sessionsUsed}
            </p>
          </div>

          {/* Streak */}
          <div className="stat-card">
            <p className="stat-card-label">Streak</p>
            <p className="stat-card-value">5</p>
            <p className="stat-card-subtitle">weeks</p>
          </div>

          {/* Next Session */}
          <div className="stat-card">
            <p className="stat-card-label">Next Session</p>
            <p className="stat-card-value" style={{ fontSize: 'clamp(1.25rem, 5vw, 1.75rem)' }}>
              {nextSession ? nextSession.scheduled_time : '—'}
            </p>
            <p className="stat-card-subtitle">
              {nextSession ? new Date(nextSession.scheduled_date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }) : 'None'}
            </p>
          </div>
        </div>

        {/* Session Block Progress */}
        <div style={{
          backgroundColor: 'var(--color-card)',
          borderRadius: 'var(--radius-md)',
          padding: '1.75rem',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--color-grey-light)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <p style={{
              fontFamily: "'Satoshi', system-ui, sans-serif",
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#1a1a1a',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              margin: 0
            }}>
              Block Progress
            </p>
            <p style={{
              fontFamily: "'Clash Display', system-ui, sans-serif",
              fontSize: '1rem',
              fontWeight: 700,
              color: '#1a4a3a',
              margin: 0
            }}>
              {Math.round(blockProgress)}%
            </p>
          </div>
          <div className="premium-progress-bar">
            <div
              className="premium-progress-fill"
              style={{ width: `${blockProgress}%` }}
            />
          </div>
          <p style={{
            fontFamily: "'Satoshi', system-ui, sans-serif",
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#6b7280',
            margin: '0.75rem 0 0 0'
          }}>
            {sessions?.blocks?.used || 0} of {sessions?.blocks?.total || 10} sessions completed
          </p>
        </div>

        {/* Quick Links Grid */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 className="section-header">Quick Links</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
          }}>
            {quickLinks.map((link, idx) => {
              const Icon = link.icon;
              return (
                <button
                  key={idx}
                  onClick={() => navigate(link.to)}
                  className="quick-link-button"
                  style={{
                    backgroundColor: 'var(--color-card)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    border: '1px solid var(--color-grey-light)',
                    cursor: 'pointer'
                  }}
                >
                  <Icon size={24} className="quick-link-icon" />
                  <p className="quick-link-label">
                    {link.label}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Motivational Quote Card */}
        <div className="motivation-card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: '3px',
                  height: '3px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-mint)',
                }}
              />
            ))}
          </div>
          <p className="motivation-quote">
            "{quote.text}"
          </p>
          <p className="motivation-author">
            — {quote.author}
          </p>
        </div>
      </div>
    </div>
  );
}
