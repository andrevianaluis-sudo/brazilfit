import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Check, Plus, Trophy, AlertCircle, Target, Calendar, Lock, ArrowRight } from 'lucide-react';
import BackButton from '../../components/BackButton';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import EmptyState from '../../components/EmptyState';

export default function ClientCheckIn() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentCheckIn, setCurrentCheckIn] = useState(null);
  const [currentWeek, setCurrentWeek] = useState('');
  const [mondayDate, setMondayDate] = useState('');

  const [formData, setFormData] = useState({
    goals_achieved: '',
    goals_barrier: '',
    workouts_completed: 'all',
    workouts_felt: '',
    workouts_notes: '',
    sleep_hours: 7,
    water_glasses: 8,
    daily_steps: 8000,
    alcohol_free: false,
    ate_breakfast: false,
    limited_processed: false,
    motivation_score: 7,
    stress_score: 5,
    overall_mood: '',
    motivation_factors: '',
    wins: ['', '', ''],
    challenges: ['', '', ''],
    next_week_goals: ['', '', ''],
  });

  const tickRef = useRef(null);

  useEffect(() => {
    fetchCheckIn();
  }, []);

  useEffect(() => {
    if (submitted) {
      animateTick();
    }
  }, [submitted]);

  const fetchCheckIn = async () => {
    try {
      setLoading(true);
      const res = await api.get('/checkins/current');
      setCurrentWeek(res.data.currentWeek);
      setMondayDate(res.data.mondayDate);

      if (res.data.checkin) {
        setCurrentCheckIn(res.data.checkin);
        setSubmitted(true);
      }
    } catch (err) {
      console.error('Error fetching check-in:', err);
    } finally {
      setLoading(false);
    }
  };

  const animateTick = () => {
    if (tickRef.current) {
      tickRef.current.style.animation = 'none';
      setTimeout(() => {
        if (tickRef.current) {
          tickRef.current.style.animation = 'drawTick 0.8s ease-in-out';
        }
      }, 10);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate wins
    const filledWins = formData.wins.filter(w => w.trim());
    if (filledWins.length < 1) {
      toast.error('Please add at least 1 win for this week');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/checkins/submit', {
        checkin_week: currentWeek,
        ...formData,
        wins: JSON.stringify(filledWins),
        challenges: JSON.stringify(formData.challenges.filter(c => c.trim())),
        next_week_goals: JSON.stringify(formData.next_week_goals.filter(g => g.trim())),
        workouts_felt: formData.workouts_felt || null,
        overall_mood: formData.overall_mood || null,
      });

      setSubmitted(true);
      toast.success('Check-in submitted!');
      setTimeout(() => fetchCheckIn(), 1000);
    } catch (err) {
      console.error('Error submitting:', err);
      toast.error(err.response?.data?.error || 'Failed to submit check-in');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-brazil-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Success Screen
  if (submitted && currentCheckIn) {
    // Declare all variables needed for success screen with fallback values
    const streak = currentCheckIn?.streak || 0;
    const currentRank = currentCheckIn?.rank || 7;
    const checkInDate = currentCheckIn?.checkin_date ? new Date(currentCheckIn.checkin_date).toLocaleDateString() : new Date().toLocaleDateString();

    return (
      <div style={{ backgroundColor: 'white', minHeight: '100vh', padding: '24px 20px', paddingBottom: '100px' }}>
        <style>{`
          @keyframes pulse-scale {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          @keyframes confetti-fall {
            0% { transform: translateY(-100px) rotate(0deg); opacity: 1; }
            100% { transform: translateY(800px) rotate(360deg); opacity: 0; }
          }
          .pulse-circle { animation: pulse-scale 2s ease-in-out infinite; }
        `}</style>

        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {/* Confetti Container */}
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'fixed',
                left: `${Math.random() * 100}%`,
                top: '-20px',
                width: `${Math.random() > 0.5 ? 4 : 12}px`,
                height: `${Math.random() > 0.5 ? 4 : 2}px`,
                backgroundColor: '#27AE60',
                borderRadius: '2px',
                animation: `confetti-fall ${2 + Math.random() * 1}s ease-in forwards`,
                animationDelay: `${Math.random() * 0.5}s`,
                pointerEvents: 'none',
              }}
            />
          ))}

          {/* Hero Section */}
          <div style={{ textAlign: 'center', paddingTop: '40px', paddingBottom: '40px' }}>
            {/* Animated Gradient Circle */}
            <div className="pulse-circle" style={{ width: '100px', height: '100px', margin: '0 auto 24px', background: 'linear-gradient(135deg, #27AE60 0%, #0d5c30 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '48px', fontWeight: 'bold', color: 'white' }}>✓</span>
            </div>

            <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#000', marginBottom: '12px', margin: '0 0 12px 0' }}>
              Check-in Submitted
            </h2>
            <p style={{ fontSize: '18px', fontWeight: 500, color: '#27AE60', marginBottom: '8px', margin: '0 0 8px 0' }}>
              Great work this week
            </p>
            <p style={{ fontSize: '14px', color: '#999999', margin: 0 }}>
              Your PT will review your answers and respond soon
            </p>
          </div>

          {/* Streak Motivation Card */}
          <div style={{
            background: 'linear-gradient(135deg, #27AE60 0%, #1a8a4a 50%, #0d5c30 100%)',
            borderRadius: '16px',
            padding: '28px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            color: 'white',
            minHeight: '100px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Gold shimmer line */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.6), transparent)',
            }} />

            {/* Left side */}
            <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔥</div>
              <div style={{ fontSize: '42px', fontWeight: 'bold', lineHeight: 1 }}>{streak || 0}</div>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '8px', opacity: 0.8 }}>Week Streak</div>
            </div>

            {/* Right side */}
            <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>🏆</div>
              <p style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 6px 0' }}>Keep it up — you are building something special</p>
              <p style={{ fontSize: '12px', fontStyle: 'italic', margin: 0, opacity: 0.9 }}>Your PT can see your consistency — it matters</p>
            </div>
          </div>

          {/* Leaderboard Teaser Card */}
          <div style={{ backgroundColor: '#1A1A2E', borderRadius: '16px', padding: '24px', marginBottom: '24px', color: 'white' }}>
            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '20px', marginRight: '8px' }}>👑</span>
              <p style={{ fontSize: '10px', fontWeight: 600, color: '#FFD700', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>Community Leaderboard</p>
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', margin: '0 0 20px 0' }}>You are climbing the ranks</h3>

            {/* Mini Leaderboard */}
            <div style={{ marginBottom: '20px', fontSize: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '18px' }}>🥇</span>
                <span style={{ flex: 1 }}>Anonymous Client</span>
                <span style={{ fontWeight: 'bold' }}>487 pts</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '18px' }}>🥈</span>
                <span style={{ flex: 1 }}>Anonymous Client</span>
                <span style={{ fontWeight: 'bold' }}>456 pts</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '18px' }}>🥉</span>
                <span style={{ flex: 1 }}>Anonymous Client</span>
                <span style={{ fontWeight: 'bold' }}>421 pts</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'rgba(39, 174, 96, 0.2)', padding: '12px', borderRadius: '8px', marginTop: '8px' }}>
                <span style={{ color: '#27AE60' }}>📍</span>
                <span style={{ flex: 1 }}>Your Position: #{currentRank}</span>
                <span style={{ fontWeight: 'bold', color: '#27AE60' }}>324 pts</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/client/leaderboard')}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#27AE60',
                color: 'white',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#1a8a4a';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#27AE60';
              }}
            >
              View Full Leaderboard
            </button>
          </div>

          {/* Why It Matters Section */}
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', borderLeft: '4px solid #27AE60', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#27AE60', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px', margin: '0 0 16px 0' }}>Why Consistency Matters</p>

            {[
              'Clients who check in weekly see 3x better results — research backed',
              'Your PT uses your answers to personalise next week\'s programme',
              'Habit streaks are the number one predictor of long term fitness success',
              'Every check-in brings you closer to your next achievement badge'
            ].map((benefit, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: i < 3 ? '12px' : 0 }}>
                <span style={{ color: '#27AE60', fontWeight: 'bold', flexShrink: 0 }}>✓</span>
                <p style={{ fontSize: '14px', color: '#666666', margin: 0 }}>{benefit}</p>
              </div>
            ))}
          </div>

          {/* Your Answers Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '16px', margin: '0 0 16px 0' }}>Your Answers</h3>

            {currentCheckIn && [
              { q: 'What were your goals last week?', a: currentCheckIn.goals_achieved || '—' },
              { q: 'Did you complete all your assigned workouts?', a: currentCheckIn.workouts_completed || '—' },
              { q: 'Sleep hours per night', a: `${currentCheckIn.sleep_hours || '—'} h` },
              { q: 'Water glasses per day', a: currentCheckIn.water_glasses || '—' },
              { q: 'Daily steps', a: currentCheckIn.daily_steps || '—' },
              { q: 'Motivation level', a: `${currentCheckIn.motivation_score || '—'}/10` },
              { q: 'Stress level', a: `${currentCheckIn.stress_score || '—'}/10` },
              { q: 'What contributed to your motivation and stress levels?', a: currentCheckIn.motivation_factors || '—' }
            ].map((item, i) => (
              <div key={i} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#27AE60', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px', margin: '0 0 6px 0' }}>Q{i + 1}</p>
                <p style={{ fontSize: '14px', color: '#999999', marginBottom: '8px', margin: '0 0 8px 0' }}>{item.q}</p>
                <p style={{ fontSize: '15px', fontWeight: 'bold', color: '#000' }}>{item.a}</p>
              </div>
            ))}
          </div>

          {/* Bottom Actions */}
          <button
            onClick={() => {
              setSubmitted(false);
              setCurrentCheckIn(null);
              window.scrollTo(0, 0);
            }}
            style={{
              width: '100%',
              padding: '0',
              height: '56px',
              backgroundColor: 'white',
              border: '2px solid #27AE60',
              color: '#27AE60',
              fontWeight: '600',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '16px',
              marginBottom: '12px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#F0FFF0';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'white';
            }}
          >
            View Full Form
          </button>

          <button
            onClick={() => navigate('/client/home')}
            style={{
              width: '100%',
              padding: '0',
              height: '56px',
              background: 'linear-gradient(135deg, #27AE60 0%, #1a8a4a 100%)',
              color: 'white',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.target.style.opacity = '1';
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'white', minHeight: '100vh', padding: '24px 20px' }}>
      <style>{`
        @keyframes drawTick {
          from {
            stroke-dasharray: 100;
            stroke-dashoffset: 100;
          }
          to {
            stroke-dasharray: 100;
            stroke-dashoffset: 0;
          }
        }
      `}</style>

      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <BackButton to="/client/home" />
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 300, color: '#000', marginBottom: '12px' }}>
            Weekly Check-in
          </h1>
          <p style={{ fontSize: '14px', color: '#999999', marginBottom: '16px', fontWeight: 400 }}>
            Takes about 5 minutes · Helps your PT support you better
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={16} color="#27AE60" />
            <p style={{ fontSize: '14px', color: '#27AE60', fontWeight: 500, margin: 0 }}>
              Week of {new Date(mondayDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '40px', justifyContent: 'center' }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: i === 0 ? '#27AE60' : i < 1 ? '#1A1A2E' : '#E0E0E0',
                  transition: 'all 0.3s ease',
                  boxShadow: i === 0 ? '0 2px 8px rgba(39, 174, 96, 0.3)' : 'none',
                }}
              />
              {i < 7 && (
                <div
                  style={{
                    width: '12px',
                    height: '2px',
                    backgroundColor: '#E0E0E0',
                    marginLeft: '8px',
                    marginRight: '8px',
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Q1: Goals Review */}
          <QuestionCard label="GOAL REVIEW" title="What were your goals last week?">
            <textarea
              value={formData.goals_achieved}
              onChange={(e) => setFormData({ ...formData, goals_achieved: e.target.value })}
              placeholder="What were your goals for this week"
              rows={3}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1px solid #E8E8E8',
                borderRadius: '10px',
                fontSize: '15px',
                fontFamily: 'inherit',
                marginBottom: '16px',
                outline: 'none',
                backgroundColor: 'white',
                color: '#1A1A1A',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#27AE60', e.target.style.boxShadow = '0 0 0 3px rgba(39, 174, 96, 0.1)')}
              onBlur={(e) => (e.target.style.borderColor = '#E8E8E8', e.target.style.boxShadow = 'none')}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              {['YES', 'NO'].map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFormData({ ...formData, goals_achieved: option })}
                  style={{
                    padding: '0 16px',
                    height: '48px',
                    border: formData.goals_achieved === option ? 'none' : `1.5px solid ${option === 'YES' ? '#27AE60' : '#E74C3C'}`,
                    backgroundColor: formData.goals_achieved === option ? (option === 'YES' ? '#27AE60' : '#E74C3C') : 'white',
                    color: formData.goals_achieved === option ? 'white' : (option === 'YES' ? '#27AE60' : '#E74C3C'),
                    fontWeight: '600',
                    borderRadius: '24px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {option}
                </button>
              ))}
            </div>

            {formData.goals_achieved === 'NO' && (
              <textarea
                value={formData.goals_barrier}
                onChange={(e) => setFormData({ ...formData, goals_barrier: e.target.value })}
                placeholder="Tell us what got in the way — we can work on it together"
                rows={2}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid #E8E8E8',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  backgroundColor: 'white',
                  color: '#1A1A1A',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#27AE60', e.target.style.boxShadow = '0 0 0 3px rgba(39, 174, 96, 0.1)')}
                onBlur={(e) => (e.target.style.borderColor = '#E8E8E8', e.target.style.boxShadow = 'none')}
              />
            )}
          </QuestionCard>

          {/* Q2: Workout Compliance */}
          <QuestionCard label="WORKOUTS" title="Did you complete all your assigned workouts?">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              {['All of them', 'Most of them', 'Some of them', 'None of them'].map((option, idx) => {
                const colors = ['#27AE60', '#F59E0B', '#F97316', '#EF4444'];
                const isSelected = formData.workouts_completed === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFormData({ ...formData, workouts_completed: option })}
                    style={{
                      padding: '0',
                      height: '52px',
                      border: isSelected ? 'none' : '1px solid #D0D0D0',
                      backgroundColor: isSelected ? colors[idx] : 'white',
                      color: isSelected ? 'white' : '#333333',
                      fontWeight: isSelected ? '600' : '500',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      paddingLeft: '12px',
                      paddingRight: '12px',
                    }}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            <textarea
              value={formData.workouts_notes}
              onChange={(e) => setFormData({ ...formData, workouts_notes: e.target.value })}
              placeholder="Tell us more — what got in the way if you missed any"
              rows={2}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1px solid #E8E8E8',
                borderRadius: '10px',
                fontSize: '15px',
                fontFamily: 'inherit',
                outline: 'none',
                backgroundColor: 'white',
                color: '#1A1A1A',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#27AE60', e.target.style.boxShadow = '0 0 0 3px rgba(39, 174, 96, 0.1)')}
              onBlur={(e) => (e.target.style.borderColor = '#E8E8E8', e.target.style.boxShadow = 'none')}
            />
          </QuestionCard>

          {/* Q2.5: How workouts felt */}
          <QuestionCard label="WORKOUT FEEL" title="How did your workouts feel this week?">
            <EmojiSelector
              emojis={['😫', '😕', '😊', '💪', '🔥']}
              labels={['Tough', 'Meh', 'Good', 'Strong', 'On Fire!']}
              selected={formData.workouts_felt}
              onChange={(emoji) => setFormData({ ...formData, workouts_felt: emoji })}
            />
          </QuestionCard>

          {/* Q3: Lifestyle Habits */}
          <QuestionCard label="LIFESTYLE" title="How were your daily habits this week on average?">
            <LifestyleSliders formData={formData} setFormData={setFormData} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
              {[
                { key: 'alcohol_free', label: 'Alcohol-free most days' },
                { key: 'ate_breakfast', label: 'Ate breakfast daily' },
                { key: 'limited_processed', label: 'Limited processed food' },
              ].map(item => (
                <label
                  key={item.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    padding: '8px',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData[item.key] || false}
                    onChange={(e) => setFormData({ ...formData, [item.key]: e.target.checked })}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                      accentColor: '#27AE60',
                    }}
                  />
                  <span style={{ fontSize: '14px', color: '#333' }}>{item.label}</span>
                  {formData[item.key] && <Check style={{ width: '16px', height: '16px', color: '#27AE60' }} />}
                </label>
              ))}
            </div>
          </QuestionCard>

          {/* Q4: Motivation and Stress */}
          <QuestionCard label="MINDSET" title="Rate your motivation and stress levels this week">
            <MindsetScales formData={formData} setFormData={setFormData} />
          </QuestionCard>

          {/* Q4.5: Overall Mood */}
          <QuestionCard label="MOOD" title="What's your overall mood this week?">
            <EmojiSelector
              emojis={['😔', '😐', '🙂', '😄', '🤩']}
              labels={['Down', 'Neutral', 'Happy', 'Very Happy', 'Amazing!']}
              selected={formData.overall_mood}
              onChange={(emoji) => setFormData({ ...formData, overall_mood: emoji })}
            />
          </QuestionCard>

          {/* Q5: Factors */}
          <QuestionCard label="INSIGHT" title="What contributed to your motivation and stress levels?">
            <textarea
              value={formData.motivation_factors}
              onChange={(e) => setFormData({ ...formData, motivation_factors: e.target.value })}
              placeholder="Share what helped you stay motivated or what caused stress this week. Your PT reads every word."
              rows={5}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1px solid #E8E8E8',
                borderRadius: '10px',
                fontSize: '15px',
                fontFamily: 'inherit',
                outline: 'none',
                resize: 'vertical',
                backgroundColor: 'white',
                color: '#1A1A1A',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#27AE60', e.target.style.boxShadow = '0 0 0 3px rgba(39, 174, 96, 0.1)')}
              onBlur={(e) => (e.target.style.borderColor = '#E8E8E8', e.target.style.boxShadow = 'none')}
            />
            <p style={{ fontSize: '12px', color: '#999999', marginTop: '8px', textAlign: 'right', margin: '8px 0 0 0' }}>
              {formData.motivation_factors.length} of 500
            </p>
          </QuestionCard>

          {/* Q6: Wins */}
          <QuestionCard label="CELEBRATE" title="🏆 List 3 to 5 wins or milestones from this week">
            <DynamicInputList
              items={formData.wins}
              setItems={(wins) => setFormData({ ...formData, wins })}
              placeholder="I completed all my sessions"
              bullet="🏆"
              maxItems={5}
              label="Add Another Win"
            />
          </QuestionCard>

          {/* Q7: Challenges */}
          <QuestionCard label="CHALLENGES" title="What challenges did you face this week?">
            <DynamicInputList
              items={formData.challenges}
              setItems={(challenges) => setFormData({ ...formData, challenges })}
              placeholder="I struggled with evening cravings"
              bullet="⚠️"
              maxItems={5}
              label="Add Another Challenge"
            />
          </QuestionCard>

          {/* Q8: Next Week Goals */}
          <QuestionCard label="LOOKING AHEAD" title="🎯 What are your goals for next week?">
            <DynamicInputList
              items={formData.next_week_goals}
              setItems={(goals) => setFormData({ ...formData, next_week_goals: goals })}
              placeholder="I will complete all 3 sessions"
              bullet="🎯"
              maxItems={5}
              label="Add Another Goal"
            />
          </QuestionCard>

          {/* Submit */}
          <div style={{ marginTop: '40px' }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                height: '56px',
                backgroundColor: '#27AE60',
                color: 'white',
                fontWeight: '600',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => !submitting && (e.target.style.backgroundColor = '#229653')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = '#27AE60')}
            >
              {submitting ? 'Submitting...' : 'Submit My Weekly Check-in'}
              {!submitting && <ArrowRight size={20} />}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '16px', justifyContent: 'center' }}>
              <Lock size={14} color="#999999" />
              <p style={{ fontSize: '12px', color: '#999999', margin: 0 }}>
                Your responses are private and shared only with your PT
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function QuestionCard({ label, title, children }) {
  return (
    <div
      style={{
        backgroundColor: 'white',
        border: 'none',
        borderRadius: '16px',
        padding: '28px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}
    >
      <p style={{ fontSize: '10px', fontWeight: '500', color: '#4CAF50', letterSpacing: '3px', marginBottom: '12px', textTransform: 'uppercase', margin: 0 }}>
        {label}
      </p>
      <h3 style={{ fontSize: '18px', fontWeight: 500, color: '#1A1A1A', marginBottom: '20px', margin: '0 0 20px 0' }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function LifestyleSliders({ formData, setFormData }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {[
        { key: 'sleep_hours', label: 'Sleep hours per night', min: 0, max: 12, step: 0.5, unit: 'h' },
        { key: 'water_glasses', label: 'Water glasses per day', min: 0, max: 15, step: 1, unit: '' },
        { key: 'daily_steps', label: 'Daily steps', min: 0, max: 20000, step: 500, unit: 'k', format: (v) => (v / 1000).toFixed(0) },
      ].map(item => (
        <div key={item.key}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#333333' }}>{item.label}</label>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#27AE60' }}>
              {item.format ? item.format(formData[item.key]) : formData[item.key]}{item.unit}
            </span>
          </div>
          <input
            type="range"
            min={item.min}
            max={item.max}
            step={item.step}
            value={formData[item.key]}
            onChange={(e) => setFormData({ ...formData, [item.key]: parseFloat(e.target.value) })}
            style={{
              width: '100%',
              height: '4px',
              borderRadius: '2px',
              backgroundColor: '#E8E8E8',
              outline: 'none',
              accentColor: '#27AE60',
              cursor: 'pointer',
              WebkitAppearance: 'none',
              appearance: 'none',
            }}
          />
          <style>{`
            input[type="range"]::-webkit-slider-thumb {
              appearance: none;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: white;
              border: 2px solid #27AE60;
              cursor: pointer;
              box-shadow: 0 2px 6px rgba(0,0,0,0.1);
            }
            input[type="range"]::-moz-range-thumb {
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: white;
              border: 2px solid #27AE60;
              cursor: pointer;
              box-shadow: 0 2px 6px rgba(0,0,0,0.1);
            }
          `}</style>
          <p style={{ fontSize: '12px', color: '#999999', marginTop: '8px', margin: '8px 0 0 0' }}>
          </p>
        </div>
      ))}
    </div>
  );
}

function MindsetScales({ formData, setFormData }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {[
        { key: 'motivation_score', label: 'Motivation', color: '#27AE60' },
        { key: 'stress_score', label: 'Stress', color: '#F59E0B' },
      ].map(item => (
        <div key={item.key}>
          <p style={{ fontSize: '14px', fontWeight: '500', marginBottom: '16px', color: '#333333', margin: '0 0 16px 0' }}>{item.label}</p>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', justifyContent: 'space-between' }}>
            {[...Array(10)].map((_, i) => {
              const num = i + 1;
              const isSelected = formData[item.key] === num;
              const color = item.key === 'stress_score' && num >= 7 ? '#F97316' : item.color;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => setFormData({ ...formData, [item.key]: num })}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: isSelected ? color : 'white',
                    color: isSelected ? 'white' : '#CCCCCC',
                    fontWeight: isSelected ? 'bold' : '500',
                    fontSize: isSelected ? '13px' : '12px',
                    border: `1px solid ${isSelected ? color : '#E0E0E0'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                  }}
                >
                  {num}
                </button>
              );
            })}
          </div>
          <p style={{ fontSize: '12px', color: '#999999', margin: '0' }}>1 is Low · 10 is High</p>
        </div>
      ))}
    </div>
  );
}

function DynamicInputList({ items, setItems, placeholder, bullet, maxItems, label }) {
  const addItem = () => {
    if (items.length < maxItems) {
      setItems([...items, '']);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {items.map((item, idx) => (
        <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #E8E8E8' }}>
          <span style={{ fontSize: '18px', minWidth: '24px', flexShrink: 0 }}>{bullet}</span>
          <input
            type="text"
            value={item}
            onChange={(e) => {
              const newItems = [...items];
              newItems[idx] = e.target.value;
              setItems(newItems);
            }}
            placeholder={placeholder}
            style={{
              flex: 1,
              padding: '0',
              border: 'none',
              borderRadius: '0',
              fontSize: '15px',
              outline: 'none',
              backgroundColor: 'transparent',
              color: '#1A1A1A',
            }}
          />
        </div>
      ))}
      {items.length < maxItems && (
        <button
          type="button"
          onClick={addItem}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#27AE60',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            paddingTop: '12px',
            padding: '12px 0 0 0',
          }}
        >
          <Plus style={{ width: '16px', height: '16px' }} />
          {label}
        </button>
      )}
    </div>
  );
}

function EmojiSelector({ emojis, labels, selected, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
      {emojis.map((emoji, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => onChange(emoji)}
          style={{
            flex: '1 1 calc(20% - 10px)',
            minWidth: '60px',
            padding: '12px',
            backgroundColor: selected === emoji ? 'rgba(39, 174, 96, 0.1)' : 'white',
            border: selected === emoji ? '2px solid #27AE60' : '1px solid #E0E0E0',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.borderColor = '#27AE60';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.borderColor = selected === emoji ? '#27AE60' : '#E0E0E0';
          }}
        >
          <span style={{ fontSize: '32px' }}>{emoji}</span>
          <span style={{
            fontSize: '11px',
            fontWeight: '500',
            color: selected === emoji ? '#27AE60' : '#999999',
            textAlign: 'center'
          }}>{labels[idx]}</span>
        </button>
      ))}
    </div>
  );
}

function CheckInSummary({ checkin }) {
  return (
    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '28px', marginBottom: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#999999', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px', margin: '0 0 20px 0' }}>
        Your Answers
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px', color: '#333' }}>
        {checkin.goals_achieved && <div style={{ display: 'flex', gap: '8px' }}><span>💭</span><div><strong>Goals Achieved:</strong><br />{checkin.goals_achieved}</div></div>}
        {checkin.workouts_completed && <div style={{ display: 'flex', gap: '8px' }}><span>🏋️</span><div><strong>Workouts:</strong> {checkin.workouts_completed}</div></div>}
        {checkin.workouts_felt && <div style={{ display: 'flex', gap: '8px' }}><span>{checkin.workouts_felt}</span><div><strong>How It Felt:</strong> {checkin.workouts_felt}</div></div>}
        {checkin.sleep_hours && <div style={{ display: 'flex', gap: '8px' }}><span>😴</span><div><strong>Sleep:</strong> {checkin.sleep_hours}h</div></div>}
        {checkin.motivation_score && <div style={{ display: 'flex', gap: '8px' }}><span>⚡</span><div><strong>Motivation:</strong> {checkin.motivation_score}/10</div></div>}
        {checkin.stress_score && <div style={{ display: 'flex', gap: '8px' }}><span>😓</span><div><strong>Stress:</strong> {checkin.stress_score}/10</div></div>}
        {checkin.overall_mood && <div style={{ display: 'flex', gap: '8px' }}><span>{checkin.overall_mood}</span><div><strong>Overall Mood:</strong> {checkin.overall_mood}</div></div>}
      </div>
    </div>
  );
}
