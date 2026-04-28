import { X, Share2 } from 'lucide-react';

export default function BadgeDetailModal({ badge, BadgeComponent, onClose }) {
  if (!badge) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end"
      onClick={onClose}
    >
      <div
        className="w-full bg-white rounded-t-[24px] p-6 pt-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center mb-6">
          <div className="w-8 h-1 bg-grey-300 rounded-full" />
        </div>

        {/* Badge icon */}
        <div className="flex justify-center mb-8">
          {BadgeComponent ? (
            <BadgeComponent earned={badge.earned} number={badge.number} size={120} />
          ) : (
            <div className={`w-28 h-28 rounded-full ${badge.earned ? badge.color : 'bg-grey-300'} flex items-center justify-center`}>
              {badge.icon && <badge.icon className={`w-14 h-14 ${badge.earned ? 'text-white' : 'text-grey-200'}`} />}
            </div>
          )}
        </div>

        {/* Badge name */}
        <h2 className="text-2xl font-black text-black text-center uppercase mb-3">
          {badge.name}
        </h2>

        {/* Description */}
        <p className="text-grey-200 text-sm text-center mb-8 px-4">
          {badge.description}
        </p>

        {/* Progress or earned date */}
        {badge.earned ? (
          <div className="mb-8 text-center">
            <p className="text-brazil-green text-sm font-bold">✓ EARNED</p>
            <p className="text-grey-200 text-xs mt-2">
              {new Date(badge.earnedDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        ) : badge.progress !== undefined ? (
          <div className="mb-8">
            <div className="w-full bg-grey-300 h-1 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-brazil-green transition-all"
                style={{ width: `${(badge.progress / badge.total) * 100}%` }}
              />
            </div>
            <p className="text-grey-200 text-xs text-center">
              {badge.progress} of {badge.total}
            </p>
          </div>
        ) : null}

        {/* Share button for earned badges */}
        {badge.earned && (
          <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brazil-green hover:bg-brazil-green-dark text-black font-bold rounded-[8px] transition-all active:scale-95 mb-4">
            <Share2 className="w-4 h-4" />
            SHARE ACHIEVEMENT
          </button>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full px-6 py-3 bg-grey-300 hover:bg-grey-100 text-black font-bold rounded-[8px] transition-all active:scale-95"
        >
          CLOSE
        </button>
      </div>
    </div>
  );
}
