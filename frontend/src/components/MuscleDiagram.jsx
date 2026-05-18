import React from 'react';

export default function MuscleDiagram({ primaryMuscles = [], secondaryMuscles = [], view = 'front', size = 'large' }) {
  const sizeClass = size === 'large' ? 'w-full h-64' : 'w-full h-40';

  const getMuscleColor = (muscleKey) => {
    if (primaryMuscles.includes(muscleKey)) {
      return '#e74c3c'; // Red-orange for primary
    }
    if (secondaryMuscles.includes(muscleKey)) {
      return '#e8956d'; // Light orange for secondary
    }
    return '#d0d0d0'; // Light grey for non-targeted
  };

  const getPrimaryOpacity = (muscleKey) => {
    if (primaryMuscles.includes(muscleKey)) return 0.85;
    if (secondaryMuscles.includes(muscleKey)) return 0.6;
    return 0.3;
  };

  return (
    <div className={`${sizeClass} bg-black rounded-lg overflow-hidden flex`}>
      {view === 'front' && <FrontView primaryMuscles={primaryMuscles} secondaryMuscles={secondaryMuscles} getMuscleColor={getMuscleColor} getPrimaryOpacity={getPrimaryOpacity} />}
      {view === 'back' && <BackView primaryMuscles={primaryMuscles} secondaryMuscles={secondaryMuscles} getMuscleColor={getMuscleColor} getPrimaryOpacity={getPrimaryOpacity} />}
      {view === 'both' && (
        <>
          <div className="flex-1">
            <FrontView primaryMuscles={primaryMuscles} secondaryMuscles={secondaryMuscles} getMuscleColor={getMuscleColor} getPrimaryOpacity={getPrimaryOpacity} />
          </div>
          <div className="flex-1">
            <BackView primaryMuscles={primaryMuscles} secondaryMuscles={secondaryMuscles} getMuscleColor={getMuscleColor} getPrimaryOpacity={getPrimaryOpacity} />
          </div>
        </>
      )}
    </div>
  );
}

function FrontView({ primaryMuscles, secondaryMuscles, getMuscleColor, getPrimaryOpacity }) {
  return (
    <svg viewBox="0 0 200 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {/* Body Outline */}
      <g>
        {/* Head */}
        <circle cx="100" cy="50" r="20" fill="#888888" opacity="0.7" />

        {/* Chest / Pectorals */}
        <path
          d="M 70 80 Q 70 100 75 130 L 85 140 L 85 160 L 115 160 L 115 140 L 125 130 Q 130 100 130 80 Z"
          fill={getMuscleColor('chest')}
          opacity={getPrimaryOpacity('chest')}
        />

        {/* Front Shoulders (Anterior Deltoids) */}
        <ellipse cx="65" cy="85" rx="15" ry="20" fill={getMuscleColor('front_shoulders')} opacity={getPrimaryOpacity('front_shoulders')} />
        <ellipse cx="135" cy="85" rx="15" ry="20" fill={getMuscleColor('front_shoulders')} opacity={getPrimaryOpacity('front_shoulders')} />

        {/* Biceps */}
        <path
          d="M 60 95 Q 55 120 60 150 L 70 155 Q 70 120 65 95 Z"
          fill={getMuscleColor('biceps')}
          opacity={getPrimaryOpacity('biceps')}
        />
        <path
          d="M 140 95 Q 145 120 140 150 L 130 155 Q 130 120 135 95 Z"
          fill={getMuscleColor('biceps')}
          opacity={getPrimaryOpacity('biceps')}
        />

        {/* Forearms */}
        <rect x="55" y="155" width="15" height="50" fill={getMuscleColor('forearms')} opacity={getPrimaryOpacity('forearms')} />
        <rect x="130" y="155" width="15" height="50" fill={getMuscleColor('forearms')} opacity={getPrimaryOpacity('forearms')} />

        {/* Abs (Rectus Abdominis) */}
        <path
          d="M 85 160 L 115 160 L 110 240 L 90 240 Z"
          fill={getMuscleColor('abs')}
          opacity={getPrimaryOpacity('abs')}
        />

        {/* Obliques */}
        <path
          d="M 75 170 Q 70 190 75 230 L 85 240 Q 85 190 80 170 Z"
          fill={getMuscleColor('obliques')}
          opacity={getPrimaryOpacity('obliques')}
        />
        <path
          d="M 125 170 Q 130 190 125 230 L 115 240 Q 115 190 120 170 Z"
          fill={getMuscleColor('obliques')}
          opacity={getPrimaryOpacity('obliques')}
        />

        {/* Hip Flexors */}
        <rect x="80" y="235" width="40" height="20" fill={getMuscleColor('hip_flexors')} opacity={getPrimaryOpacity('hip_flexors')} />

        {/* Quads (Quadriceps) */}
        <path
          d="M 80 255 L 95 255 L 100 380 L 85 380 Z"
          fill={getMuscleColor('quads')}
          opacity={getPrimaryOpacity('quads')}
        />
        <path
          d="M 105 255 L 120 255 L 115 380 L 100 380 Z"
          fill={getMuscleColor('quads')}
          opacity={getPrimaryOpacity('quads')}
        />

        {/* Calves */}
        <path
          d="M 85 380 L 100 380 L 95 460 L 85 460 Z"
          fill={getMuscleColor('calves')}
          opacity={getPrimaryOpacity('calves')}
        />
        <path
          d="M 100 380 L 115 380 L 115 460 L 105 460 Z"
          fill={getMuscleColor('calves')}
          opacity={getPrimaryOpacity('calves')}
        />
      </g>
    </svg>
  );
}

function BackView({ primaryMuscles, secondaryMuscles, getMuscleColor, getPrimaryOpacity }) {
  return (
    <svg viewBox="0 0 200 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {/* Body Outline */}
      <g>
        {/* Head */}
        <circle cx="100" cy="50" r="20" fill="#888888" opacity="0.7" />

        {/* Traps (Trapezius) */}
        <path
          d="M 80 70 Q 100 60 120 70 L 115 110 L 100 115 L 85 110 Z"
          fill={getMuscleColor('traps')}
          opacity={getPrimaryOpacity('traps')}
        />

        {/* Back Shoulders (Posterior Deltoids) */}
        <ellipse cx="65" cy="85" rx="15" ry="20" fill={getMuscleColor('back_shoulders')} opacity={getPrimaryOpacity('back_shoulders')} />
        <ellipse cx="135" cy="85" rx="15" ry="20" fill={getMuscleColor('back_shoulders')} opacity={getPrimaryOpacity('back_shoulders')} />

        {/* Lats (Latissimus Dorsi) */}
        <path
          d="M 70 110 L 60 180 L 70 200 L 85 190 L 90 130 Z"
          fill={getMuscleColor('lats')}
          opacity={getPrimaryOpacity('lats')}
        />
        <path
          d="M 130 110 L 140 180 L 130 200 L 115 190 L 110 130 Z"
          fill={getMuscleColor('lats')}
          opacity={getPrimaryOpacity('lats')}
        />

        {/* Triceps */}
        <path
          d="M 60 95 Q 55 120 60 150 L 70 155 Q 70 120 65 95 Z"
          fill={getMuscleColor('triceps')}
          opacity={getPrimaryOpacity('triceps')}
        />
        <path
          d="M 140 95 Q 145 120 140 150 L 130 155 Q 130 120 135 95 Z"
          fill={getMuscleColor('triceps')}
          opacity={getPrimaryOpacity('triceps')}
        />

        {/* Lower Back */}
        <path
          d="M 85 190 L 115 190 L 110 250 L 90 250 Z"
          fill={getMuscleColor('lower_back')}
          opacity={getPrimaryOpacity('lower_back')}
        />

        {/* Glutes */}
        <path
          d="M 80 240 Q 75 270 80 290 L 100 295 Q 100 270 100 240 Z"
          fill={getMuscleColor('glutes')}
          opacity={getPrimaryOpacity('glutes')}
        />
        <path
          d="M 120 240 Q 125 270 120 290 L 100 295 Q 100 270 100 240 Z"
          fill={getMuscleColor('glutes')}
          opacity={getPrimaryOpacity('glutes')}
        />

        {/* Hamstrings */}
        <path
          d="M 80 290 L 95 290 L 100 380 L 85 380 Z"
          fill={getMuscleColor('hamstrings')}
          opacity={getPrimaryOpacity('hamstrings')}
        />
        <path
          d="M 105 290 L 120 290 L 115 380 L 100 380 Z"
          fill={getMuscleColor('hamstrings')}
          opacity={getPrimaryOpacity('hamstrings')}
        />

        {/* Calves */}
        <path
          d="M 85 380 L 100 380 L 95 460 L 85 460 Z"
          fill={getMuscleColor('calves')}
          opacity={getPrimaryOpacity('calves')}
        />
        <path
          d="M 100 380 L 115 380 L 115 460 L 105 460 Z"
          fill={getMuscleColor('calves')}
          opacity={getPrimaryOpacity('calves')}
        />
      </g>
    </svg>
  );
}

