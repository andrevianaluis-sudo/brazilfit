import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Filter, X, Star, Flame, Sun, Calendar, Trophy, Users, Cake, Moon, CheckCircle, Flower2 } from 'lucide-react';
import api from '../../utils/api';
import TabBar from '../../components/TabBar';
import BadgeDetailModal from '../../components/BadgeDetailModal';
import BadgeUnlockAnimation from '../../components/BadgeUnlockAnimation';
import {
  DiamondBadge,
  TrophyBadge,
  ShieldBadge,
  KettlebellBadge,
  StarBadge,
  SunBadge,
  CalendarBadge,
  LotusFlowerBadge,
  PeopleBadge,
  CakeBadge,
  MoonBadge,
  CheckmarkBadge,
} from '../../components/BadgeSvg';

const TROPHY_BADGES = [
  { id: 1, name: 'First Session', description: 'Completed your first PT session', icon: Star, component: StarBadge, earned: true, earnedDate: '2026-01-15' },
  { id: 2, name: 'Block Complete', description: 'Completed a full session block', icon: Trophy, component: TrophyBadge, earned: true, earnedDate: '2026-02-10' },
  { id: 3, name: 'Early Bird', description: '5 sessions before 9 AM', icon: Sun, component: SunBadge, earned: false, progress: 2, total: 5 },
  { id: 4, name: 'Consistent', description: '4 weeks with no missed sessions', icon: Calendar, component: CalendarBadge, earned: false, progress: 1, total: 4 },
  { id: 5, name: 'Wellness Warrior', description: '10 meditation sessions', icon: Flower2, component: LotusFlowerBadge, earned: false, progress: 0, total: 10 },
  { id: 6, name: 'Community', description: 'Joined 5 challenges', icon: Users, component: PeopleBadge, earned: false, progress: 0, total: 5 },
  { id: 7, name: 'Birthday', description: 'Celebrated a birthday with us', icon: Cake, component: CakeBadge, earned: false },
  { id: 8, name: 'Night Owl', description: '5 evening sessions after 6 PM', icon: Moon, component: MoonBadge, earned: false, progress: 1, total: 5 },
  { id: 9, name: 'Check-in Champion', description: '8 weekly check-ins completed', icon: CheckCircle, component: CheckmarkBadge, earned: false, progress: 0, total: 8 },
];

const MILESTONE_COUNTS = [1, 3, 5, 7, 10, 15, 20, 25, 30, 40, 50, 75, 100];

const WORKOUTS_SHIELDS = [
  { id: 'w2', number: '2x', earned: false, progress: 1, total: 2 },
  { id: 'w3', number: '3x', earned: false, progress: 0, total: 3 },
  { id: 'w4', number: '4x', earned: false, progress: 0, total: 4 },
  { id: 'w5', number: '5x', earned: false, progress: 0, total: 5 },
  { id: 'w6', number: '6x', earned: false, progress: 0, total: 6 },
  { id: 'w7', number: '7x', earned: false, progress: 0, total: 7 },
];

const STREAK_WEEKS = [2, 3, 4, 5, 6, 7];
const STREAK_MONTHS = [2, 3, 4, 6, 8, 10];

export default function ClientActivity() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('HISTORY');
  const [sessions, setSessions] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);

  useEffect(() => {
    if (!user?.clientId) return;
    Promise.all([
      api.get(`/sessions/client/${user.clientId}`).catch(() => ({ data: { completed: [] } })),
      api.get('/progress/stats').catch(() => ({ data: { totalSessions: 0, thisMonth: 0, streak: 0 } })),
    ]).then(([sessRes, statsRes]) => {
      setSessions(sessRes.data);
      setStats(statsRes.data);
    }).finally(() => setLoading(false));
  }, [user]);

  const groupSessionsByMonth = (sessions = []) => {
    const groups = {};
    (sessions?.completed || []).forEach((session) => {
      const date = new Date(session.scheduled_date);
      const key = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(session);
    });
    return groups;
  };

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-brazil-green border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="w-full bg-white min-h-screen pb-24 animate-fade-in">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between border-b border-grey-100">
        <div className="w-10 h-10 rounded-full bg-grey-300" />
        <h1 className="text-2xl font-black text-black uppercase">Activity</h1>
        <button className="p-2 hover:bg-grey-300 rounded-full transition">
          <Filter className="w-5 h-5 text-black" />
        </button>
      </div>

      {/* Tabs */}
      <TabBar tabs={['HISTORY', 'ACHIEVEMENTS']} activeTab={activeTab} onChange={setActiveTab} />

      {/* Content */}
      {activeTab === 'HISTORY' ? (
        <div className="px-5 pb-12">
          {/* Stats */}
          <div className="py-8 text-center border-b border-grey-100">
            <p className="text-6xl font-black text-black">{stats?.totalSessions || 0}</p>
            <p className="text-grey-200 text-sm mt-2 uppercase font-bold">Total Sessions</p>
            <p className="text-grey-200 text-xs mt-4">{stats?.thisMonth || 0} this month  {stats?.streak || 0} day streak</p>
          </div>

          {/* Sessions by month */}
          <div className="mt-8">
            <h3 className="text-xs font-bold uppercase text-grey-200 tracking-widest mb-4">BrazilFit Activity</h3>
            {Object.entries(groupSessionsByMonth(sessions)).map(([month, monthSessions]) => (
              <div key={month}>
                <h4 className="text-xs font-bold uppercase text-black mt-6 mb-3">{month}</h4>
                <div className="space-y-2">
                  {monthSessions.map((session, i) => (
                    <div key={i} className="flex gap-3 pb-3 border-b border-grey-100">
                      <div className="w-12 h-12 bg-grey-300 rounded-[8px] flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-black font-bold text-sm">{session.pt_name || 'PT Session'}</p>
                        <p className="text-grey-200 text-xs mt-0.5">
                          {new Date(session.scheduled_date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-grey-200 text-xs">45 min</p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-brazil-green flex-shrink-0 mt-1" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-5 pb-12">
          {/* Latest achievements */}
          <div className="mt-8">
            <h3 className="text-xs font-bold uppercase text-grey-200 tracking-widest mb-4">Latest Achievements</h3>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {TROPHY_BADGES.filter(b => b.earned).slice(0, 2).map((badge) => (
                <button
                  key={badge.id}
                  onClick={() => setSelectedBadge(badge)}
                  className="bg-black rounded-[12px] p-4 text-center transition-all active:scale-95"
                >
                  <div className="flex justify-center mb-3">
                    <badge.component earned={true} size={60} />
                  </div>
                  <p className="text-white text-xs font-bold">{badge.name}</p>
                  <p className="text-brazil-green text-[10px] mt-1 font-bold">NEW</p>
                </button>
              ))}
              {TROPHY_BADGES.filter(b => !b.earned).length > 0 && (
                <div className="bg-grey-300 rounded-[12px] p-4 flex items-center justify-center col-span-2">
                  <p className="text-grey-200 text-xs font-bold text-center">
                    COMPLETE SESSIONS TO EARN MORE ACHIEVEMENTS
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* All achievements */}
          <h3 className="text-xs font-bold uppercase text-grey-200 tracking-widest mb-4">All Achievements</h3>

          {/* Trophies */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <h4 className="text-sm font-black text-black uppercase">Trophies</h4>
              <Trophy className="w-4 h-4 text-black" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {TROPHY_BADGES.map((badge) => (
                <button
                  key={badge.id}
                  onClick={() => setSelectedBadge(badge)}
                  className={`p-3 rounded-[12px] transition-all active:scale-95 ${
                    badge.earned ? 'bg-grey-300' : 'bg-white'
                  }`}
                >
                  <div className="flex justify-center mb-2">
                    <badge.component earned={badge.earned} size={60} />
                  </div>
                  <p className={`text-[10px] font-bold text-center ${badge.earned ? 'text-black' : 'text-grey-200'}`}>
                    {badge.name}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Milestones */}
          <div className="mb-10">
            <h4 className="text-sm font-black text-black uppercase mb-4">Milestones</h4>
            <div className="grid grid-cols-3 gap-3">
              {MILESTONE_COUNTS.map((count) => (
                <button
                  key={count}
                  onClick={() => setSelectedBadge({
                    id: `m${count}`,
                    name: `${count} Sessions`,
                    description: `Completed ${count} PT sessions`,
                    component: DiamondBadge,
                    earned: count <= 5,
                    number: count,
                    earnedDate: '2026-03-15',
                  })}
                  className={`p-3 rounded-[12px] transition-all active:scale-95 relative ${
                    count <= 5 ? 'bg-grey-300' : 'bg-white'
                  }`}
                >
                  <div className="flex justify-center mb-2">
                    <DiamondBadge earned={count <= 5} number={count} size={60} />
                  </div>
                  {count <= 5 && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-brazil-green rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Workouts in a week */}
          <div className="mb-10">
            <h4 className="text-sm font-black text-black uppercase mb-4">Workouts in a Week</h4>
            <div className="grid grid-cols-3 gap-3">
              {WORKOUTS_SHIELDS.map((shield) => (
                <button
                  key={shield.id}
                  onClick={() => setSelectedBadge({
                    id: shield.id,
                    name: `${shield.number} Sessions Per Week`,
                    description: `Complete ${shield.number} sessions in a week`,
                    component: ShieldBadge,
                    earned: false,
                    number: shield.number,
                    progress: shield.progress,
                    total: shield.total,
                  })}
                  className="p-3 rounded-[12px] bg-white transition-all active:scale-95"
                >
                  <div className="flex justify-center mb-2">
                    <ShieldBadge earned={false} number={shield.number} size={60} />
                  </div>
                  <p className="text-[10px] font-bold text-center text-grey-200">{shield.number}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Streaks */}
          <div className="mb-10">
            <h4 className="text-sm font-black text-black uppercase mb-4">Streaks</h4>

            <div className="mb-6">
              <p className="text-xs font-bold text-grey-200 uppercase mb-3">Weeks in a Row</p>
              <div className="grid grid-cols-3 gap-3">
                {STREAK_WEEKS.map((weeks) => (
                  <button
                    key={`week-${weeks}`}
                    onClick={() => setSelectedBadge({
                      id: `week-${weeks}`,
                      name: `${weeks} Weeks in a Row`,
                      description: `${weeks} consecutive weeks of activity`,
                      component: KettlebellBadge,
                      earned: false,
                      number: weeks,
                      progress: 1,
                      total: weeks,
                    })}
                    className="p-3 rounded-[12px] bg-white transition-all active:scale-95"
                  >
                    <div className="flex justify-center mb-2">
                      <KettlebellBadge earned={false} number={weeks} size={60} />
                    </div>
                    <p className="text-[10px] font-bold text-center text-grey-200">{weeks}w</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-grey-200 uppercase mb-3">Months in a Row</p>
              <div className="grid grid-cols-3 gap-3">
                {STREAK_MONTHS.map((months) => (
                  <button
                    key={`month-${months}`}
                    onClick={() => setSelectedBadge({
                      id: `month-${months}`,
                      name: `${months} Months in a Row`,
                      description: `${months} consecutive months of activity`,
                      component: TrophyBadge,
                      earned: false,
                      earnedDate: null,
                    })}
                    className="p-3 rounded-[12px] bg-white transition-all active:scale-95"
                  >
                    <div className="flex justify-center mb-2">
                      <TrophyBadge earned={false} size={60} />
                    </div>
                    <p className="text-[10px] font-bold text-center text-grey-200">{months}m</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Badge detail modal */}
      {selectedBadge && (
        <BadgeDetailModal
          badge={selectedBadge}
          BadgeComponent={selectedBadge.component}
          onClose={() => setSelectedBadge(null)}
        />
      )}

      {/* Badge unlock animation */}
      {showUnlockAnimation && (
        <BadgeUnlockAnimation
          badge={selectedBadge}
          BadgeComponent={selectedBadge?.component}
          onDone={() => setShowUnlockAnimation(false)}
          onShare={() => alert('Share functionality coming soon!')}
        />
      )}
    </div>
  );
}

