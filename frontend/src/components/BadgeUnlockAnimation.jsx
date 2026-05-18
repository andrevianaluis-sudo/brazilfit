import { useState, useEffect } from 'react';
import { Share2 } from 'lucide-react';

function Confetti() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.3,
    duration: 2 + Math.random() * 0.5,
  }));

  return (
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute w-2 h-2 rounded-full animate-pulse"
          style={{
            left: `${p.left}%`,
            top: '-10px',
            backgroundColor: ['#27AE60', '#FFC107', '#FF6B6B', '#4169E1'][Math.floor(Math.random() * 4)],
            animation: `confetti-fall ${p.duration}s ease-out forwards`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}

export default function BadgeUnlockAnimation({ badge, BadgeComponent, onDone, onShare }) {
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    const timer = setTimeout(() => setScale(1), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(onDone, 3000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center">
      {/* Confetti */}
      <div className="absolute inset-0 pointer-events-none">
        <Confetti />
      </div>

      {/* Content */}
      <div className="relative flex flex-col items-center gap-6 z-10">
        {/* Badge animation */}
        <div
          style={{
            transform: `scale(${scale})`,
            transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {BadgeComponent ? (
            <BadgeComponent earned={true} number={badge.number} size={120} />
          ) : (
            <div className={`w-28 h-28 rounded-full ${badge.color} flex items-center justify-center`}>
              {badge.icon && <badge.icon className="w-14 h-14 text-white" />}
            </div>
          )}
        </div>

        {/* Achievement unlocked text */}
        <div className="text-center">
          <p className="text-brazil-green text-xs font-bold uppercase tracking-widest mb-2">
            achievement unlocked
          </p>
          <h2 className="text-4xl font-black text-white uppercase">
            {badge.name}
          </h2>
          <p className="text-grey-200 text-sm mt-3 max-w-xs">
            {badge.description}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onShare}
            className="flex items-center gap-2 px-6 py-3 bg-brazil-green hover:bg-brazil-green-dark text-black font-bold rounded-full transition-all active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            SHARE
          </button>
          <button
            onClick={onDone}
            className="px-8 py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-full transition-all active:scale-95"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
}

