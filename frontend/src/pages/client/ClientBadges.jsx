import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Zap, Star, Flame, Sun, Calendar, Trophy, CheckCircle, Users, X, Share2 } from 'lucide-react';

// Badge definitions matching Nike Training Club style
const BADGES = [
  { id: 1, name: 'First Session', description: 'Completed your first PT session', icon: Zap, color: 'bg-brazil-green', earned: true, earnedDate: '2026-01-15' },
  { id: 2, name: 'Block Complete', description: 'Completed a full session block', icon: Star, color: 'bg-brazil-green', earned: true, earnedDate: '2026-02-10' },
  { id: 3, name: '5 Sessions', description: 'Completed 5 sessions', icon: Zap, color: 'bg-brazil-green', earned: false, progress: 4, total: 5 },
  { id: 4, name: '10 Sessions', description: 'Completed 10 sessions', icon: Star, color: 'bg-brazil-green', earned: false, progress: 4, total: 10 },
  { id: 5, name: '30 Day Streak', description: '30 consecutive days of activity', icon: Flame, color: 'bg-brazil-green', earned: false, progress: 15, total: 30 },
  { id: 6, name: '60 Day Streak', description: '60 consecutive days of activity', icon: Flame, color: 'bg-yellow-500', earned: false, progress: 15, total: 60 },
  { id: 7, name: 'Early Bird', description: '5 sessions before 9 AM', icon: Sun, color: 'bg-brazil-green', earned: false, progress: 2, total: 5 },
  { id: 8, name: 'Consistent', description: '4 weeks with no missed sessions', icon: Calendar, color: 'bg-brazil-green', earned: false, progress: 1, total: 4 },
  { id: 9, name: 'Wellness Warrior', description: '10 meditation sessions', icon: Flame, color: 'bg-brazil-green', earned: false, progress: 0, total: 10 },
  { id: 10, name: 'Personal Best', description: 'Set a new personal record', icon: Trophy, color: 'bg-brazil-green', earned: false },
  { id: 11, name: 'Check-in Champion', description: '8 weekly check-ins completed', icon: CheckCircle, color: 'bg-brazil-green', earned: false, progress: 0, total: 8 },
  { id: 12, name: 'Community', description: 'Joined 5 challenges', icon: Users, color: 'bg-brazil-green', earned: false, progress: 0, total: 5 },
];

const CATEGORIES = ['ALL', 'TRAINING', 'WELLNESS', 'CONSISTENCY', 'MILESTONES'];

export default function ClientBadges() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [badges, setBadges] = useState(BADGES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading badges from API
    setTimeout(() => setLoading(false), 500);
  }, []);

  const earnedCount = badges.filter(b => b.earned).length;
  const filteredBadges = selectedCategory === 'ALL' ? badges : badges;

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-brazil-green border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="w-full bg-white min-h-screen pb-24 animate-fade-in">
      {/* Header */}
      <div className="px-5 pt-6 pb-8 border-b border-grey-100">
        <h1 className="text-3xl font-black text-black uppercase mb-4">MY ACHIEVEMENTS</h1>
        <div className="text-sm">
          <p className="text-grey-200">{earnedCount} of {badges.length} badges earned</p>
          <div className="w-full bg-white h-1 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-brazil-green transition-all duration-500"
              style={{ width: `${(earnedCount / badges.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category filters */}
      <div className="px-5 pt-6 pb-6 border-b border-grey-100 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-brazil-green text-white'
                  : 'bg-grey-300 text-grey-200 hover:bg-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Badge grid */}
      <div className="px-5 pt-6 pb-12">
        <div className="grid grid-cols-3 gap-4">
          {filteredBadges.map((badge) => {
            const Icon = badge.icon;
            return (
              <button
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className={`flex flex-col items-center gap-2 p-4 rounded-[12px] transition-all active:scale-95 ${
                  badge.earned
                    ? 'bg-grey-300 hover:bg-white'
                    : 'bg-white opacity-60 hover:opacity-80'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    badge.earned ? badge.color : 'bg-grey-300'
                  }`}
                >
                  <Icon className={`w-6 h-6 ${badge.earned ? 'text-white' : 'text-grey-200'}`} />
                </div>
                <p className={`text-xs text-center font-bold ${badge.earned ? 'text-white' : 'text-grey-200'}`}>
                  {badge.name}
                </p>
                {!badge.earned && badge.progress !== undefined && (
                  <p className="text-[10px] text-grey-200">
                    {badge.progress}/{badge.total}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Badge detail modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 bg-white/95 flex flex-col items-center justify-center animate-fade-in">
          <button
            onClick={() => setSelectedBadge(null)}
            className="absolute top-6 right-6 p-2 hover:bg-grey-300 transition rounded-full"
          >
            <X className="w-6 h-6 text-black" />
          </button>

          <div className="text-center">
            {/* Large badge icon */}
            <div className={`w-24 h-24 rounded-full ${selectedBadge.earned ? selectedBadge.color : 'bg-white'} flex items-center justify-center mx-auto mb-6`}>
              {selectedBadge.icon && <selectedBadge.icon className={`w-12 h-12 ${selectedBadge.earned ? 'text-white' : 'text-grey-200'}`} />}
            </div>

            {/* Badge name */}
            <h2 className="text-3xl font-black text-black uppercase mb-2">{selectedBadge.name}</h2>

            {/* Description */}
            <p className="text-grey-200 text-sm mb-6 max-w-xs">{selectedBadge.description}</p>

            {/* Progress or earned date */}
            {selectedBadge.earned ? (
              <div className="mb-6">
                <p className="text-brazil-green text-sm font-bold">✓ EARNED</p>
                <p className="text-grey-200 text-xs mt-1">{new Date(selectedBadge.earnedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
            ) : selectedBadge.progress !== undefined ? (
              <div className="mb-6 w-48 mx-auto">
                <div className="w-full bg-white h-1 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-brazil-green transition-all"
                    style={{ width: `${(selectedBadge.progress / selectedBadge.total) * 100}%` }}
                  />
                </div>
                <p className="text-grey-200 text-xs">{selectedBadge.progress} of {selectedBadge.total}</p>
              </div>
            ) : null}

            {/* Share button for earned badges */}
            {selectedBadge.earned && (
              <button className="flex items-center gap-2 mx-auto px-6 py-2 bg-brazil-green hover:bg-brazil-green-dark text-black font-bold rounded-[8px] transition-all active:scale-95">
                <Share2 className="w-4 h-4" />
                SHARE
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
