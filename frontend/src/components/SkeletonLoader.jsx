// Skeleton Loaders with shimmer animation
export function SkeletonHeroCard() {
  return (
    <div className="px-5 pt-6 pb-8 animate-pulse">
      <div className="w-full h-64 bg-white rounded-[12px] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skeleton-shimmer" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="px-5 py-6 animate-pulse space-y-3">
      <div className="flex gap-3 overflow-x-auto pb-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex-shrink-0 w-48 h-24 bg-white rounded-[12px] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skeleton-shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-grey-300 rounded-[12px] p-4 animate-pulse relative overflow-hidden">
      <div className="space-y-2">
        <div className="h-4 bg-white rounded w-3/4">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skeleton-shimmer" />
        </div>
        <div className="h-3 bg-white rounded w-1/2">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ columns = 2 }) {
  return (
    <div className={`px-5 pt-6 pb-12 grid grid-cols-${columns} gap-3`}>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="bg-grey-300 rounded-[12px] h-32 animate-pulse relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skeleton-shimmer" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ count = 5 }) {
  return (
    <div className="px-5 py-6 space-y-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-grey-300 rounded-[12px] p-4 animate-pulse relative overflow-hidden">
          <div className="space-y-2">
            <div className="h-4 bg-white rounded w-3/4">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skeleton-shimmer" />
            </div>
            <div className="h-3 bg-white rounded w-1/2">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skeleton-shimmer" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonCircle() {
  return (
    <div className="w-12 h-12 rounded-full bg-white animate-pulse relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skeleton-shimmer" />
    </div>
  );
}

