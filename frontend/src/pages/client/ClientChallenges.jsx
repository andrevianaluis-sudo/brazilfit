import { useState } from 'react';
import { Trophy, Users, Calendar, TrendingUp } from 'lucide-react';

export default function ClientChallenges() {
  const [challenges] = useState([
    {
      id: 1,
      title: '7-Day Strength Challenge',
      description: 'Complete 7 strength workouts in 7 days',
      progress: 5,
      total: 7,
      participants: 127,
      reward: '500 XP',
      timeLeft: '2 days',
      joined: true,
      difficulty: 'MEDIUM',
    },
    {
      id: 2,
      title: 'Push Your Limits',
      description: 'Do 100 push-ups throughout the week',
      progress: 67,
      total: 100,
      participants: 89,
      reward: '750 XP',
      timeLeft: '5 days',
      joined: true,
      difficulty: 'HARD',
    },
    {
      id: 3,
      title: 'Consistency King',
      description: 'Log a check-in for 14 consecutive days',
      progress: 8,
      total: 14,
      participants: 234,
      reward: '1000 XP',
      timeLeft: '6 days',
      joined: false,
      difficulty: 'EASY',
    },
    {
      id: 4,
      title: 'Nutrition Perfect Week',
      description: 'Log meals every day this week',
      progress: 3,
      total: 7,
      participants: 156,
      reward: '600 XP',
      timeLeft: '4 days',
      joined: true,
      difficulty: 'EASY',
    },
  ]);

  const [joinedChallenges, setJoinedChallenges] = useState(
    challenges.filter(c => c.joined).map(c => c.id)
  );

  const toggleChallenge = (id) => {
    if (joinedChallenges.includes(id)) {
      setJoinedChallenges(joinedChallenges.filter(cid => cid !== id));
    } else {
      setJoinedChallenges([...joinedChallenges, id]);
    }
  };

  const activeCount = joinedChallenges.length;
  const totalXP = challenges
    .filter(c => joinedChallenges.includes(c.id))
    .reduce((sum, c) => sum + parseInt(c.reward), 0);

  return (
    <div className="w-full bg-white min-h-screen pb-24 animate-fade-in">
      <div className="px-5 py-6 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-black uppercase mb-1">Challenges</h1>
          <p className="text-grey-200 text-xs uppercase tracking-widest">Push yourself further</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-grey-300 rounded-[12px] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-brazil-green" />
              <p className="text-grey-200 text-xs font-bold uppercase">Active</p>
            </div>
            <p className="text-3xl font-black text-black">{activeCount}</p>
            <p className="text-xs text-grey-200 mt-1">Challenges</p>
          </div>
          <div className="bg-grey-300 rounded-[12px] p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-orange-400" />
              <p className="text-grey-200 text-xs font-bold uppercase">XP</p>
            </div>
            <p className="text-3xl font-black text-orange-400">{totalXP}</p>
            <p className="text-xs text-grey-200 mt-1">Potential</p>
          </div>
        </div>

        {/* Challenge List */}
        <div className="space-y-3">
          {challenges.map((challenge) => {
            const isJoined = joinedChallenges.includes(challenge.id);
            const progressPercent = (challenge.progress / challenge.total) * 100;

            return (
              <div key={challenge.id} className="bg-grey-300 rounded-[12px] p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <h3 className="text-black font-bold text-sm mb-1">{challenge.title}</h3>
                    <p className="text-grey-200 text-xs mb-2">{challenge.description}</p>
                    <div className="flex gap-2 text-xs mb-3">
                      <span className={`px-2 py-1 rounded-full font-bold ${
                        challenge.difficulty === 'EASY' ? 'bg-green-500/20 text-green-400' :
                        challenge.difficulty === 'MEDIUM' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {challenge.difficulty}
                      </span>
                      <span className="bg-grey-100 text-black px-2 py-1 rounded-full">
                        {challenge.timeLeft}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleChallenge(challenge.id)}
                    className={`px-3 py-2 rounded-[8px] font-bold uppercase text-xs tracking-widest whitespace-nowrap transition flex-shrink-0 ${
                      isJoined
                        ? 'bg-brazil-green text-black hover:bg-brazil-green-dark'
                        : 'bg-white text-grey-200 hover:bg-white'
                    }`}
                  >
                    {isJoined ? 'Joined' : 'Join'}
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="text-grey-200 text-xs">{challenge.progress}/{challenge.total}</p>
                    <p className="text-brazil-green text-xs font-bold">{challenge.reward}</p>
                  </div>
                  <div className="w-full bg-white h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brazil-green transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Participants */}
                <div className="flex items-center gap-1 text-grey-200 text-xs">
                  <Users className="w-3 h-3" />
                  <span>{challenge.participants} participants</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Leaderboard Preview */}
        <div className="bg-grey-300 rounded-[12px] p-4">
          <h3 className="text-black font-bold text-sm mb-4">Leaderboard</h3>
          <div className="space-y-3">
            {[
              { rank: 1, name: 'Marcus Johnson', xp: 3450, crown: '👑' },
              { rank: 2, name: 'You', xp: 2890, crown: '🎯' },
              { rank: 3, name: 'Sarah Williams', xp: 2650, crown: '🥉' },
              { rank: 4, name: 'James Brown', xp: 2340, crown: '' },
            ].map((user) => (
              <div key={user.rank} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-grey-200 w-5">#{user.rank}</span>
                  <span className="text-sm">{user.crown}</span>
                  <span className={`text-sm font-bold ${user.name === 'You' ? 'text-brazil-green' : 'text-black'}`}>
                    {user.name}
                  </span>
                </div>
                <span className="text-sm font-bold text-orange-400">{user.xp} XP</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
