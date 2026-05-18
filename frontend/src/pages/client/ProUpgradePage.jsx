import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Zap, Check, Gift, ChevronLeft, Lock } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const BG = '#141414';
const SURFACE = '#1e1e1e';
const SURFACE2 = '#2a2a2a';
const BORDER = 'rgba(255,255,255,0.08)';
const ORANGE = '#FF6B2B';
const GREEN = '#4CAF50';
const YELLOW = '#FFD600';
const TEXT = '#ffffff';
const MUTED = '#888888';

const PRO_BENEFITS = [
  { emoji: '', text: 'Unlimited workout plans & exercise library' },
  { emoji: '', text: '85+ healthy meals with recipes & shopping lists' },
  { emoji: '', text: '200+ expert nutrition tips across all categories' },
  { emoji: '', text: 'Full progress tracking with charts & measurements' },
  { emoji: '', text: 'Complete habit tracker  water, sleep, steps & mood' },
  { emoji: '', text: 'Wearable sync  Apple Watch, Garmin & Oura Ring' },
  { emoji: '', text: 'Leaderboard, challenges & PT priority support' },
  { emoji: '', text: 'PDF progress reports & transformation tracking' },
];

export default function ProUpgradePage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('annual');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') setSuccess(true);
  }, []);

  useEffect(() => {
    if (success && user?.isPro) {
      toast.success('Welcome to BrazilFit Pro! ');
      setTimeout(() => navigate('/client'), 2000);
    }
  }, [success, user]);

  const handleUpgrade = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await api.post('/subscriptions/checkout', { plan: selectedPlan });
      if (res.data.demo) {
        toast.success(res.data.message);
        await refreshUser();
        navigate('/client');
      } else if (res.data.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      }
    } catch (e) {
      toast.error(e.response?.data?.error || 'Payment setup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrial = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await api.post('/subscriptions/trial');
      toast.success('7-day free trial activated! ');
      await refreshUser();
      navigate('/client');
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to start trial');
    } finally {
      setLoading(false);
    }
  };

  if (user?.isPro && !success) {
    return (
      <div style={{ backgroundColor: BG, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}></div>
        <h1 style={{ color: YELLOW, fontSize: '1.8rem', fontWeight: 800, margin: '0 0 8px' }}>You're Pro!</h1>
        <p style={{ color: MUTED, marginBottom: 24 }}>You already have full access to all features.</p>
        <button onClick={() => navigate('/client')} style={{ background: ORANGE, color: '#fff', border: 'none', borderRadius: 12, padding: '14px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          Go to Dashboard
        </button>
      </div>
    );
  }

  const annualMonthly = (29.99 / 12).toFixed(2);

  return (
    <div style={{ backgroundColor: BG, minHeight: '100vh', color: TEXT, fontFamily: 'system-ui, sans-serif', paddingBottom: 60 }}>

      {/* Back button */}
      <div style={{ padding: '16px 20px 0' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
          <ChevronLeft size={18} /> Back
        </button>
      </div>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '24px 24px 0' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 64, height: 64, borderRadius: 20,
          background: `linear-gradient(135deg, ${ORANGE}, ${YELLOW})`,
          marginBottom: 16,
        }}>
          <Zap size={32} color="#000" fill="#000" />
        </div>

        <h1 style={{
          fontFamily: "'DM Sans', system-ui",
          fontSize: '2rem', fontWeight: 800, margin: '0 0 10px',
          letterSpacing: '-0.03em',
        }}>
          BrazilFit <span style={{ color: ORANGE }}>Pro</span>
        </h1>

        {/* Single punchy benefit line */}
        <p style={{
          fontSize: '1.1rem', fontWeight: 600, color: YELLOW,
          margin: '0 0 6px', letterSpacing: '-0.01em',
        }}>
          Train smarter. Eat better. Track everything.
        </p>
        <p style={{ fontSize: '14px', color: MUTED, margin: 0 }}>
          Everything you need to reach your goals  all in one place.
        </p>
      </div>

      {/* Trial button */}
      {!user?.pro_trial_used && (
        <div style={{ padding: '24px 20px 0' }}>
          <button
            onClick={handleStartTrial}
            disabled={loading}
            style={{
              width: '100%', border: 'none', cursor: 'pointer',
              background: `linear-gradient(135deg, ${GREEN}, #2E7D32)`,
              borderRadius: 16, padding: '18px 24px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              fontSize: '16px', fontWeight: 800, color: '#fff',
              boxShadow: `0 4px 24px ${GREEN}44`,
            }}
          >
            <Gift size={20} />
            Start 7-Day Free Trial
          </button>
          <p style={{ textAlign: 'center', fontSize: 12, color: MUTED, marginTop: 8 }}>
            No credit card required  Cancel anytime
          </p>
        </div>
      )}

      {/* Benefits list */}
      <div style={{ padding: '24px 20px 0' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: ORANGE, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
          Everything included
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {PRO_BENEFITS.map((b, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              background: SURFACE, borderRadius: 12, padding: '12px 16px',
              border: `1px solid ${BORDER}`,
            }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{b.emoji}</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: TEXT }}>{b.text}</span>
              <Check size={16} color={GREEN} style={{ marginLeft: 'auto', flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </div>

      {/* Plan selector */}
      <div style={{ padding: '24px 20px 0' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: ORANGE, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
          Choose your plan
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>

          {/* Monthly */}
          <button
            onClick={() => setSelectedPlan('monthly')}
            style={{
              background: selectedPlan === 'monthly' ? SURFACE2 : SURFACE,
              border: `2px solid ${selectedPlan === 'monthly' ? ORANGE : BORDER}`,
              borderRadius: 16, padding: '18px 14px', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Monthly</span>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: TEXT, letterSpacing: '-0.03em' }}>9.99</span>
            <span style={{ fontSize: 12, color: MUTED }}>per month</span>
          </button>

          {/* Annual */}
          <button
            onClick={() => setSelectedPlan('annual')}
            style={{
              background: selectedPlan === 'annual' ? SURFACE2 : SURFACE,
              border: `2px solid ${selectedPlan === 'annual' ? ORANGE : BORDER}`,
              borderRadius: 16, padding: '18px 14px', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              position: 'relative', overflow: 'hidden',
              transition: 'all 0.2s',
            }}
          >
            {/* Best value badge */}
            <div style={{
              position: 'absolute', top: 0, right: 0,
              background: `linear-gradient(135deg, ${ORANGE}, ${YELLOW})`,
              padding: '3px 10px', borderBottomLeftRadius: 10,
              fontSize: 10, fontWeight: 800, color: '#000', letterSpacing: '0.05em',
            }}>
              BEST VALUE
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Annual</span>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: TEXT, letterSpacing: '-0.03em' }}>24.99</span>
            <span style={{ fontSize: 12, color: GREEN, fontWeight: 700 }}>Save 79% - £2.08/mo</span>
          </button>
        </div>
      </div>

      {/* CTA button */}
      <div style={{ padding: '20px 20px 0' }}>
        <button
          onClick={handleUpgrade}
          disabled={loading}
          style={{
            width: '100%', border: 'none', cursor: loading ? 'default' : 'pointer',
            background: loading ? SURFACE2 : `linear-gradient(135deg, ${ORANGE}, ${YELLOW})`,
            borderRadius: 16, padding: '18px 24px',
            fontSize: '16px', fontWeight: 800,
            color: loading ? MUTED : '#000',
            transition: 'all 0.2s',
            boxShadow: loading ? 'none' : `0 4px 24px ${ORANGE}44`,
          }}
        >
          {loading ? 'Processing...' : selectedPlan === 'annual' ? 'Get Pro  29.99/year' : 'Get Pro  9.99/month'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10 }}>
          <Lock size={12} color={MUTED} />
          <span style={{ fontSize: 12, color: MUTED }}>Secure payment via Stripe  Cancel anytime</span>
        </div>
      </div>

    </div>
  );
}



