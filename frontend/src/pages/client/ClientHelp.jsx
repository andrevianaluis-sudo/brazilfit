import { useState } from 'react';
import { Search, ChevronDown, MessageCircle, AlertCircle } from 'lucide-react';

export default function ClientHelp() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const faqs = [
    {
      id: 1,
      category: 'Getting Started',
      question: 'How do I book a session?',
      answer: `Open your calendar, select available time slots with your PT, and confirm. Sessions appear on your dashboard 24 hours after booking.`
    },
    {
      id: 2,
      category: 'Getting Started',
      question: 'How do sessions work?',
      answer: `Sessions are 60-minute workouts with your PT. You'll receive a reminder 24 hours before. Start the session in the app to access your workout plan and timer.`
    },
    {
      id: 3,
      category: 'Getting Started',
      question: 'What is a 10 session block?',
      answer: `A block is a package of sessions with your PT. After purchasing 10 sessions, you have flexibility to schedule them whenever works best for you.`
    },
    {
      id: 4,
      category: 'Getting Started',
      question: 'How do I cancel a session?',
      answer: `Go to your Sessions tab, find the session, and tap Cancel. You have up to 24 hours before the session to cancel without penalty.`
    },
    {
      id: 5,
      category: 'Billing & Payments',
      question: 'How do I pay for my block?',
      answer: `Tap the "Purchase Block" button to securely pay via Stripe. Blocks are prepaid and non-refundable, but you can transfer unused sessions.`
    },
    {
      id: 6,
      category: 'Billing & Payments',
      question: 'What is BrazilFit Pro?',
      answer: `Pro unlocks progress photos, advanced analytics, nutrition tracking, and challenges. Upgrade anytime for £4.99/month or £49.99/year.`
    },
    {
      id: 7,
      category: 'Billing & Payments',
      question: 'How do I cancel Pro?',
      answer: `Go to Settings > Subscription and tap "Cancel Pro". Your access continues through the end of your billing period.`
    },
    {
      id: 8,
      category: 'Billing & Payments',
      question: 'Can I get a refund?',
      answer: `Session blocks are non-refundable. Pro subscriptions can be canceled anytime and refunded within 30 days of purchase.`
    },
    {
      id: 9,
      category: 'Sessions & Tracking',
      question: 'Why did my session count go down?',
      answer: `Completed sessions count toward your history. If you cancel a session, the count decreases. Contact your PT if you think there's an error.`
    },
    {
      id: 10,
      category: 'Sessions & Tracking',
      question: 'What happens if I miss a session?',
      answer: `If you miss a scheduled session, you'll lose that session from your block. Your PT may offer a make-up option depending on your agreement.`
    },
    {
      id: 11,
      category: 'Sessions & Tracking',
      question: 'How do I log a workout?',
      answer: `After completing a session, tap "Complete Session" and answer the quick feedback. Your progress syncs to your activity history.`
    },
    {
      id: 12,
      category: 'Sessions & Tracking',
      question: 'What are habit streaks?',
      answer: `Streaks track consecutive days of logging habits (water, sleep, nutrition, etc.). The longer your streak, the more badges you unlock!`
    },
    {
      id: 13,
      category: 'Technical',
      question: 'The app is not loading',
      answer: `Try: 1) Force-close the app and reopen, 2) Check your internet connection, 3) Update to the latest version, 4) Clear app cache in Settings.`
    },
    {
      id: 14,
      category: 'Technical',
      question: 'I cannot log in',
      answer: `Ensure you're using the correct email/password. Tap "Forgot Password" to reset. If issues persist, contact your PT.`
    },
    {
      id: 15,
      category: 'Technical',
      question: 'How do I connect my Apple Watch?',
      answer: `Go to Settings > Connected Apps > Apple Health and follow the authorization flow. Data syncs automatically every hour.`
    },
    {
      id: 16,
      category: 'Technical',
      question: 'How do I change my password?',
      answer: `Go to Settings > Account > Change Password. Enter your current password and new password. Password must be 8+ characters.`
    },
  ];

  const categories = ['Getting Started', 'Billing & Payments', 'Sessions & Tracking', 'Technical'];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedFaqs = categories.reduce((acc, cat) => {
    acc[cat] = filteredFaqs.filter(f => f.category === cat);
    return acc;
  }, {});

  return (
    <div className="w-full bg-white min-h-screen pb-24 animate-fade-in">
      <div className="sticky top-0 bg-white z-40 border-b border-grey-100 px-5 py-4">
        <h1 className="text-2xl font-black text-black uppercase mb-4">Help & FAQ</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-grey-300 rounded-[8px] px-4 py-2 pl-10 text-black text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brazil-green"
          />
        </div>
      </div>

      <div className="px-5 py-6 space-y-6">
        {Object.entries(groupedFaqs).map(([category, items]) =>
          items.length > 0 && (
            <div key={category}>
              <p className="text-grey-200 text-xs uppercase tracking-widest mb-3 font-bold">{category}</p>
              <div className="space-y-2">
                {items.map(faq => (
                  <button
                    key={faq.id}
                    onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                    className="w-full bg-grey-300 rounded-[12px] p-4 text-left hover:bg-white transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-black font-bold text-sm flex-1">{faq.question}</p>
                      <ChevronDown
                        className={`w-5 h-5 text-grey-200 flex-shrink-0 transition transform ${
                          expandedId === faq.id ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                    {expandedId === faq.id && (
                      <p className="text-grey-200 text-sm mt-3 leading-relaxed">{faq.answer}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )
        )}

        {filteredFaqs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-grey-200 text-sm">No topics found. Try a different search.</p>
          </div>
        )}

        {/* Contact Section */}
        <div className="border-t border-grey-100 pt-6 space-y-3">
          <p className="text-grey-200 text-xs uppercase tracking-widest font-bold">Can't find what you need?</p>
          <button className="w-full flex items-center justify-center gap-2 bg-brazil-green rounded-[12px] p-4 text-black font-bold uppercase text-xs tracking-widest hover:bg-brazil-green-dark transition">
            <MessageCircle className="w-4 h-4" />
            Contact Your PT
          </button>
          <button className="w-full flex items-center justify-center gap-2 bg-grey-300 rounded-[12px] p-4 text-black font-bold uppercase text-xs tracking-widest hover:bg-white transition">
            <AlertCircle className="w-4 h-4" />
            Report a Problem
          </button>
        </div>
      </div>
    </div>
  );
}
