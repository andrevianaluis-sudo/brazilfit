import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const proFeatures = [
  { name: 'Meditation & Wellness', desc: 'Full library with reminders' },
  { name: 'Progress Tracking', desc: 'Weight, measurements, photos' },
  { name: 'Food & Mood Diary', desc: 'Track meals and mood patterns' },
  { name: 'Custom Workout Plans', desc: 'Personalized programming' },
  { name: 'Nutrition Library', desc: 'Full meal & recipe access' },
  { name: 'PT Messaging', desc: 'Direct chat with your trainer' },
  { name: 'Weekly Check-ins', desc: 'Progress check & PT feedback' },
  { name: 'Achievement Badges', desc: 'Unlock fitness milestones' },
  { name: 'Wearable Integration', desc: 'Apple Watch, Garmin, Oura' },
];

export default function ProUpgradeModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleStartTrial = async () => {
    setIsLoading(true);
    try {
      window.location.href = '/api/subscriptions/checkout?plan=monthly&trial=7';
    } catch (err) {
      console.error('Checkout error:', err);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-grey-1000 flex items-end justify-center z-50 p-0 safe-bottom">
      <div className="bg-white w-full max-w-lg max-h-[95vh] overflow-y-auto flex flex-col">
        {/* Close button */}
        <div className="flex justify-end p-4 border-b border-grey-100">
          <button onClick={onClose} className="p-2 rounded-[8px] hover:bg-grey-300 transition">
            <X size={24} className="text-black" />
          </button>
        </div>

        <div className="flex-1 px-5 py-8 space-y-8">
          {/* Logo and title */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black text-black uppercase tracking-tight">BRAZILFIT PRO</h2>
            <p className="text-grey-200 text-sm">Everything you need for peak performance</p>
          </div>

          {/* Price Section */}
          <div className="text-center space-y-3">
            <p className="text-grey-200 text-sm">Start your free trial</p>
            <div className="text-5xl font-black text-brazil-green">9.99</div>
            <p className="text-grey-200 text-sm">/month after 7-day trial</p>
            <p className="text-grey-100 text-xs">Cancel anytime, no commitment</p>
          </div>

          {/* Features List with green checkmarks */}
          <div className="space-y-3">
            {proFeatures.map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-brazil-green flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-black text-sm">{feature.name}</p>
                  <p className="text-grey-200 text-xs">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Trial Info Card */}
          <div className="bg-grey-300 rounded-[12px] p-4 space-y-2">
            <p className="text-sm text-black font-bold">7-day free trial includes:</p>
            <p className="text-xs text-grey-200 leading-relaxed">
              Try all Pro features with no credit card required. After 7 days, your subscription begins at 9.99/month. Cancel anytime.
            </p>
          </div>
        </div>

        {/* Bottom buttons - fixed at bottom */}
        <div className="px-5 py-5 space-y-3 border-t border-grey-100 mt-8">
          <button
            onClick={handleStartTrial}
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? 'Loading...' : 'Start 7-Day Free Trial'}
          </button>
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Maybe Later
          </button>
          <p className="text-center text-xs text-grey-100">No credit card required</p>
        </div>
      </div>
    </div>
  );
}

