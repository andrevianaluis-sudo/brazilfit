import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, Dumbbell, TrendingUp, Heart, MessageSquare, ClipboardList, Trophy, Activity } from 'lucide-react';
import api from '../../utils/api';

const QUOTES = [
  { text: 'Progress is progress no matter how small.', author: 'Unknown' },
  { text: 'The only bad workout is the one that did not happen.', author: 'Unknown' },
  { text: 'Train hard, recover harder.', author: 'Unknown' },
];

const QUICK_LINKS = [
  { label: 'My Sessions',  sub: 'Book & manage',  to: '/client/sessions',    icon: 'Calendar',      color: '#FF6B2B' },
  { label: 'Progress',     sub: 'Track results',   to: '/client/progress',    icon: 'TrendingUp',    color: '#4CAF50' },
  { label: 'Wellness',     sub: 

$content = @'
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, Dumbbell, TrendingUp, Heart, MessageSquare, ClipboardList, Trophy, Activity } from 'lucide-react';
import api from '../../utils/api';

const QUOTES = [
  { text: 'Progress is progress no matter how small.', author: 'Unknown' },
  { text: 'The only bad workout is the one that did not happen.', author: 'Unknown' },
  { text: 'Train hard, recover harder.', author: 'Unknown' },
];

const QUICK_LINKS = [
  { label: 'My Sessions',  sub: 'Book & manage',  to: '/client/sessions',    icon: 'Calendar',      color: '#FF6B2B' },
  { label: 'Progress',     sub: 'Track results',   to: '/client/progress',    icon: 'TrendingUp',    color: '#4CAF50' },
  { label: 'Wellness',     sub: 'Daily check-in',  to: '/client/wellness',    icon: 'Heart',         color: '#a78bfa' },
  { label: 'Nutrition',    sub: 'Food & shopping', to: '/client/nutrition',   icon: 'Activity',      color: '#60a5fa' },
  { label: 'Messages',     sub: 'Chat with PT',    to: '/client/messages',    icon: 'MessageSquare', color: '#4CAF50' },
  { label: 'Check-in',     sub: 'Weekly review',   to: '/client/checkin',     icon: 'ClipboardList', color: '#FFD600' },
  { label: 'Workouts',     sub: 'Browse library',  to: '/client/workouts',    icon: 'Dumbbell',      color: '#FF6B2B' },
  { label: 'Leaderboard',  sub: 'See rankings',    to: '/client/leaderboard', icon: 'Trophy',        color: '#FFD600' },
];

export default function ClientHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState(QUOTES[0]);

  useEffect(() => {
    if (!user?.clientId) return;
    api.get(`/sessions/client/${user.clientId}`)
      .then(res => setSessions(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    const d = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    setQuote(QUOTES[d % QUOTES.length]);
  }, []);

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', background:'#141414' }}>
      <div style={{ width:'20px', height:'20px', border:'2px solid #FF6B2B', borderTop:'2px solid transparent', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
    </div>
  );

  const nextSession = sessions?.upcoming?.[0];
  const sessionsRemaining = sessions?.sessionsRemaining || 0;
  const sessionsUsed = sessions?.sessionsUsed || 0;
  const totalSessions = sessionsUsed + sessionsRemaining;
  const blockProgress = totalSessions > 0 ? (sessionsUsed / totalSessions) * 100 : 0;
  const sessionsColor = sessionsRemaining <= 2 ? '#ef4444' : sessionsRemaining <= 5 ? '#FF6B2B' : '#4CAF50';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || 'Athlete';
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const card = { backgroundColor: '#252525', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.12)', padding: '1.1rem 1.25rem' };

  const icons = { Calendar, Dumbbell, TrendingUp, Heart, MessageSquare, ClipboardList, Trophy, Activity };

  return (
    <div style={{ background: '#141414', minHeight: '100vh', paddingBottom: '6rem', fontFamily: "'Satoshi', system-ui, sans-serif" }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.25rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', color: '#FF6B2B', textTransform: 'uppercase', margin: '0 0 0.4rem' }}>{greeting}</p>
          <h1 style={{ fontFamily: "'Clash Display', system-ui", fontSize: '2.5rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.1, margin: '0 0 0.3rem' }}>{firstName}</h1>
          <p style={{ fontSize: '0.8rem', color: '#707070', margin: 0 }}>{today}</p>
        </div>
        <div onClick={() => navigate('/client/sessions')} style={{ background: 'linear-gradient(135deg, #FF6B2B, #FFD600)', borderRadius: '14px', padding: '1.25rem 1.5rem', marginBottom: '1rem', cursor: 'pointer' }}>
          <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.16em', color: 'rgba(0,0,0,0.55)', textTransform: 'uppercase', margin: '0 0 0.4rem' }}>Next Session</p>
          {nextSession ? (
            <p style={{ fontFamily: "'Clash Display', system-ui", fontSize: '1.3rem', fontWeight: 700, color: '#000', margin: 0 }}>{nextSession.title || 'Training Session'}</p>
          ) : (
            <p style={{ fontSize: '1rem', color: 'rgba(0,0,0,0.5)', margin: 0 }}>No session booked yet</p>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '1rem' }}>
          {[
            { value: sessionsRemaining, label: 'Sessions Left', color: sessionsColor },
            { value: 5, label: 'Week Streak', color: '#FF6B2B' },
            { value: sessionsUsed, label: 'Completed', color: '#FFD600' },
          ].map((stat, i) => (
            <div key={i} style={{ ...card, textAlign: 'center' }}>
              <p style={{ fontFamily: "'Clash Display', system-ui", fontSize: '2.2rem', fontWeight: 800, color: stat.color, letterSpacing: '-0.03em', lineHeight: 1, margin: '0 0 0.4rem' }}>{stat.value}</p>
              <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', color: '#707070', textTransform: 'uppercase', margin: 0 }}>{stat.label}</p>
            </div>
          ))}
        </div>
        <div style={{ ...card, marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div>
              <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.18em', color: '#FF6B2B', textTransform: 'uppercase', margin: '0 0 0.3rem' }}>Block Progress</p>
              <p style={{ fontSize: '0.78rem', color: '#707070', margin: 0 }}>{sessionsUsed} of {totalSessions} sessions done</p>
            </div>
            <p style={{ fontFamily: "'Clash Display', system-ui", fontSize: '1.6rem', fontWeight: 800, color: '#4CAF50', margin: 0 }}>{Math.round(blockProgress)}%</p>
          </div>
          <div style={{ width: '100%', height: '5px', backgroundColor: '#333', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${blockProgress}%`, background: 'linear-gradient(90deg, #FF6B2B, #FFD600)', borderRadius: '3px' }} />
          </div>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.18em', color: '#FF6B2B', textTransform: 'uppercase', margin: '0 0 0.75rem' }}>Quick Access</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {QUICK_LINKS.map((link, i) => {
              const Icon = icons[link.icon];
              return (
                <div key={i} onClick={() => navigate(link.to)} style={{ ...card, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <Icon size={18} color={link.color} />
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff', margin: '0 0 2px' }}>{link.label}</p>
                    <p style={{ fontSize: '0.7rem', color: '#707070', margin: 0 }}>{link.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ ...card, borderLeft: '3px solid #FF6B2B' }}>
          <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.18em', color: '#FF6B2B', textTransform: 'uppercase', margin: '0 0 0.75rem' }}>Today s Motivation</p>
          <p style={{ fontSize: '0.9rem', color: '#b0b0b0', lineHeight: 1.65, margin: '0 0 0.6rem', fontStyle: 'italic' }}>"{quote.text}"</p>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#FF6B2B', textTransform: 'uppercase', margin: 0 }}>- {quote.author}</p>
        </div>
      </div>
    </div>
  );
}
