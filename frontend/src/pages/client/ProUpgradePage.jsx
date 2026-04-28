import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Crown, Check, Gift, Star } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const PRO_FEATURES = {
  TRAINING: [
    'Full unlimited session history',
    'Complete exercise library (1000+ exercises)',
    'Custom workout plans from your PT',
    'Video exercise demonstrations',
  ],
  WELLNESS: [
    'Complete nutrition tips library (all 6 categories)',
    'All meal ideas — save & filter by goal',
    'Weight & measurements tracker with progress charts',
    'Daily readiness score & recovery recommendations',
  ],
  TRACKING: [
    'Full habit tracker: water, sleep, steps, veg, mood',
    '7-day streak tracker & weekly averages',
    'Wearable sync: Apple Watch, Garmin, Oura Ring',
    'PDF progress report export',
  ],
  COMMUNITY: [
    'Community leaderboard & weekly challenges',
    'Access to success stories & transformations',
    'Priority support from your PT',
    'Exclusive member community chat',
  ],
};

const FREE_FEATURES = [
  'View session schedule & next session',
  'Block progress (sessions used & remaining)',
  'Last 5 sessions history',
  'One nutrition tip per week (featured tip only)',
  'Basic habit tracker (water & steps only)',
  'View PT messages & notes',
];

const TESTIMONIALS = [
  {
    name: 'Sarah M.',
    initials: 'SM',
    quote: 'BrazilFit Pro transformed how I track my fitness. The wearable integration is game-changing.',
    stars: 5,
  },
  {
    name: 'James L.',
    initials: 'JL',
    quote: 'My PT can now see all my data in real-time. The custom plans make every session count.',
    stars: 5,
  },
  {
    name: 'Emma T.',
    initials: 'ET',
    quote: 'The nutrition library and meal ideas kept me consistent. Best investment in my fitness.',
    stars: 5,
  },
];

export default function ProUpgradePage({ success }) {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('monthly');

  useEffect(() => {
    api.get('/subscriptions/status').then(r => setStatus(r.data));
  }, []);

  useEffect(() => {
    if (success && user?.isPro) {
      toast.success('Welcome to BrazilFit Pro! 🎉');
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
      const res = await api.post('/subscriptions/trial');
      toast.success('7-day free trial activated! 🎉');
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
      <div className="px-4 py-8 animate-fade-in text-center">
        <Crown className="w-16 h-16 text-brazil-yellow mx-auto mb-4" />
        <h1 className="text-2xl font-black mb-2">You're a Pro Member!</h1>
        <p className="text-grey-200 mb-2">You have full access to all BrazilFit Pro features.</p>
        {user?.proExpiresAt && (
          <p className="text-sm text-grey-100 mb-6">Your access is active until {user.proExpiresAt}</p>
        )}
        <button onClick={() => navigate('/client')} className="btn-primary px-8">Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in bg-white">
      {/* Hero Section with Background Image */}
      <div className="relative h-80 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/images/newcastle-62.jpg)',
          }}
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
        {/* Hero text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 px-4 text-center">
          <p className="text-xs font-black text-brazil-green uppercase tracking-widest mb-2">Unlock Your Potential</p>
          <h1 className="text-4xl font-black text-white mb-2">BrazilFit Pro</h1>
          <p className="text-grey-300 text-base">Everything you need to reach your goals</p>
        </div>
      </div>

      <div className="px-4 space-y-6 pb-8">
        {/* Free Trial Card */}
        {!status?.proTrialUsed && !user?.isPro && (
          <div className="rounded-lg p-6 text-center mt-6" style={{ backgroundColor: '#1A1A2E' }}>
            <Gift className="w-8 h-8 mx-auto mb-3" style={{ color: '#FFD700' }} />
            <p className="text-2xl font-black text-white mb-1">7 Days Free</p>
            <p className="text-grey-300 text-sm mb-4">Try all Pro features free — no payment needed</p>
            <button
              onClick={handleStartTrial}
              disabled={loading}
              className="w-full py-3 bg-brazil-green text-white font-bold rounded-full transition-all disabled:opacity-50 hover:bg-green-700"
            >
              {loading ? 'Starting trial...' : 'Start Free Trial'}
            </button>
          </div>
        )}

        {/* Pricing Cards Section */}
        <div>
          <p className="text-center text-grey-200 text-sm font-bold mb-4">Choose Your Plan</p>
          <div className="grid grid-cols-2 gap-4">
            {/* Monthly Card */}
            <button
              onClick={() => setSelectedPlan('monthly')}
              className={`rounded-lg p-5 text-center transition-all border-2 ${
                selectedPlan === 'monthly'
                  ? 'border-brazil-green bg-white'
                  : 'border-grey-200 bg-white hover:border-brazil-green'
              }`}
            >
              <p className="text-xs font-bold text-grey-200 uppercase mb-2">Monthly</p>
              <p className="text-3xl font-black text-black mb-1">£9.99</p>
              <p className="text-xs text-grey-200">per month</p>
            </button>

            {/* Annual Card */}
            <button
              onClick={() => setSelectedPlan('annual')}
              className={`rounded-lg p-5 text-center transition-all border-2 relative ${
                selectedPlan === 'annual'
                  ? 'border-brazil-green'
                  : 'border-grey-200 hover:border-brazil-green'
              }`}
              style={{ backgroundColor: selectedPlan === 'annual' ? '#1A1A2E' : '#1A1A2E' }}
            >
              <div
                className="absolute -top-3 right-4 px-2 py-0.5 rounded text-xs font-black text-black"
                style={{ backgroundColor: '#FFD700' }}
              >
                BEST VALUE
              </div>
              <p className="text-xs font-bold text-white uppercase mb-2">Annual</p>
              <p className="text-3xl font-black text-white mb-1">£29.99</p>
              <p className="text-xs text-grey-300">per year</p>
              <p className="text-xs font-bold text-brazil-green mt-2">Save 67%</p>
            </button>
          </div>
        </div>

        {/* Main CTA Button */}
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full text-white font-bold text-base transition-all disabled:opacity-50 rounded-lg"
          style={{
            backgroundColor: '#27AE60',
            height: '52px',
            boxShadow: '0 0 30px rgba(39, 174, 96, 0.4)',
          }}
        >
          {loading ? 'Processing...' : selectedPlan === 'annual' ? 'Get Pro — £29.99/year' : 'Get Pro — £9.99/month'}
        </button>

        <p className="text-center text-xs text-grey-100">Secure payment via Stripe · Cancel anytime</p>

        {/* Pro Features Section */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-6">
            <Crown className="w-5 h-5" style={{ color: '#FFD700' }} />
            <h2 className="text-2xl font-black text-black">Pro Features</h2>
          </div>

          {Object.entries(PRO_FEATURES).map(([category, features]) => (
            <div key={category} className="mb-8">
              <p className="text-xs font-bold text-grey-200 uppercase tracking-wider mb-4">{category}</p>
              <div className="space-y-3">
                {features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-brazil-green flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-black">{feature}</p>
                  </div>
                ))}
              </div>
              {category !== 'COMMUNITY' && <div className="border-b border-grey-200 my-6" />}
            </div>
          ))}
        </div>

        {/* Social Proof Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-black text-black text-center mb-6">What Our Clients Say</h2>
          <div className="space-y-4">
            {TESTIMONIALS.map((testimonial, i) => (
              <div key={i} className="rounded-lg p-5" style={{ backgroundColor: '#1A1A2E' }}>
                <p className="text-white text-sm italic mb-4">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: '#27AE60' }}
                  >
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">{testimonial.name}</p>
                    <div className="flex gap-1">
                      {Array(testimonial.stars)
                        .fill(0)
                        .map((_, j) => (
                          <Star key={j} className="w-3 h-3" fill="#FFD700" style={{ color: '#FFD700' }} />
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Free Tier Comparison */}
        <div className="mt-8 bg-grey-100 rounded-lg p-5">
          <p className="font-bold text-grey-200 mb-4 text-sm">Free Tier Includes</p>
          <div className="space-y-3">
            {FREE_FEATURES.map((f, i) => (
              <div key={i} className="flex items-start gap-2">
                <Check className="w-4 h-4 text-grey-200 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-grey-200">{f}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA Banner */}
        <div className="mt-8 rounded-lg p-8 text-center text-white" style={{ backgroundColor: '#1A1A2E' }}>
          <h3 className="text-3xl font-black mb-2">Join BrazilFit Pro Today</h3>
          <p className="text-grey-300 text-sm mb-6">Start your 7 day free trial — no payment needed</p>
          <button
            onClick={handleStartTrial}
            disabled={loading}
            className="mx-auto block px-8 py-3 bg-brazil-green text-white font-bold rounded-full transition-all disabled:opacity-50 hover:bg-green-700"
          >
            {loading ? 'Starting trial...' : 'Start Free Trial'}
          </button>
        </div>

        <button onClick={() => navigate('/client')} className="w-full text-grey-200 text-sm py-4 hover:text-black transition-all">
          Maybe later →
        </button>
      </div>
    </div>
  );
}
