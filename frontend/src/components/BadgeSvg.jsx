// SVG Badge Components - Clean geometric shapes matching Nike Training Club style

export const DiamondBadge = ({ earned = false, number, size = 80 }) => {
  const color = earned ? '#1C1C1E' : '#CCCCCC';
  const strokeColor = earned ? '#1C1C1E' : '#CCCCCC';

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-sm">
      {/* Diamond shape */}
      <path
        d="M50 10 L90 50 L50 90 L10 50 Z"
        fill={earned ? color : 'none'}
        stroke={strokeColor}
        strokeWidth={earned ? '0' : '2'}
        style={earned ? { filter: 'drop-shadow(0 2px 4px rgba(28,28,30,0.3))' } : {}}
      />
      {/* Number inside */}
      <text
        x="50"
        y="55"
        textAnchor="middle"
        fontSize={earned ? '32' : '28'}
        fontWeight="bold"
        fill={earned ? 'white' : strokeColor}
        fontFamily="Inter, sans-serif"
      >
        {number}
      </text>
    </svg>
  );
};

export const TrophyBadge = ({ earned = false, size = 80 }) => {
  const color = earned ? '#1C1C1E' : '#CCCCCC';
  const strokeColor = earned ? '#1C1C1E' : '#CCCCCC';

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-sm">
      {/* Trophy base */}
      <rect x="20" y="75" width="60" height="8" fill={color} stroke={strokeColor} strokeWidth="1" />
      {/* Trophy stem */}
      <rect x="40" y="65" width="20" height="10" fill={color} stroke={strokeColor} strokeWidth="1" />
      {/* Trophy cup */}
      <circle cx="50" cy="45" r="18" fill={color} stroke={strokeColor} strokeWidth={earned ? '0' : '2'} />
      {/* Trophy handles */}
      <path d="M32 40 Q25 35 28 25" fill="none" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
      <path d="M68 40 Q75 35 72 25" fill="none" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
};

export const ShieldBadge = ({ earned = false, number, size = 80 }) => {
  const color = earned ? '#1C1C1E' : '#CCCCCC';
  const strokeColor = earned ? '#1C1C1E' : '#CCCCCC';

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-sm">
      {/* Shield shape */}
      <path
        d="M50 10 L80 30 L80 55 C80 75 50 90 50 90 C50 90 20 75 20 55 L20 30 Z"
        fill={earned ? color : 'none'}
        stroke={strokeColor}
        strokeWidth={earned ? '0' : '2'}
        style={earned ? { filter: 'drop-shadow(0 2px 4px rgba(28,28,30,0.3))' } : {}}
      />
      {/* X or number inside */}
      <text
        x="50"
        y="58"
        textAnchor="middle"
        fontSize={earned ? '28' : '24'}
        fontWeight="bold"
        fill={earned ? 'white' : strokeColor}
        fontFamily="Inter, sans-serif"
      >
        {number}x
      </text>
    </svg>
  );
};

export const KettlebellBadge = ({ earned = false, number, size = 80 }) => {
  const color = earned ? '#1C1C1E' : '#CCCCCC';
  const strokeColor = earned ? '#1C1C1E' : '#CCCCCC';

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-sm">
      {/* Kettlebell handle */}
      <path
        d="M35 25 Q35 15 50 15 Q65 15 65 25"
        fill="none"
        stroke={strokeColor}
        strokeWidth={earned ? '3' : '2'}
        strokeLinecap="round"
      />
      {/* Kettlebell body (circle) */}
      <circle
        cx="50"
        cy="55"
        r="22"
        fill={earned ? color : 'none'}
        stroke={strokeColor}
        strokeWidth={earned ? '0' : '2'}
        style={earned ? { filter: 'drop-shadow(0 2px 4px rgba(28,28,30,0.3))' } : {}}
      />
      {/* Number */}
      <text
        x="50"
        y="62"
        textAnchor="middle"
        fontSize={earned ? '24' : '20'}
        fontWeight="bold"
        fill={earned ? 'white' : strokeColor}
        fontFamily="Inter, sans-serif"
      >
        {number}
      </text>
    </svg>
  );
};

export const StarBadge = ({ earned = false, size = 80 }) => {
  const color = earned ? '#1C1C1E' : '#CCCCCC';
  const strokeColor = earned ? '#1C1C1E' : '#CCCCCC';

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-sm">
      {/* Star shape (5 points) */}
      <path
        d="M50 15 L61 40 L88 40 L67 58 L78 85 L50 67 L22 85 L33 58 L12 40 L39 40 Z"
        fill={earned ? color : 'none'}
        stroke={strokeColor}
        strokeWidth={earned ? '0' : '2'}
        style={earned ? { filter: 'drop-shadow(0 2px 4px rgba(28,28,30,0.3))' } : {}}
      />
    </svg>
  );
};

export const SunBadge = ({ earned = false, size = 80 }) => {
  const color = earned ? '#1C1C1E' : '#CCCCCC';
  const strokeColor = earned ? '#1C1C1E' : '#CCCCCC';

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-sm">
      {/* Sun center circle */}
      <circle
        cx="50"
        cy="50"
        r="18"
        fill={earned ? color : 'none'}
        stroke={strokeColor}
        strokeWidth={earned ? '0' : '2'}
        style={earned ? { filter: 'drop-shadow(0 2px 4px rgba(28,28,30,0.3))' } : {}}
      />
      {/* Rays */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 50 + 28 * Math.cos(rad);
        const y1 = 50 + 28 * Math.sin(rad);
        const x2 = 50 + 36 * Math.cos(rad);
        const y2 = 50 + 36 * Math.sin(rad);
        return (
          <line
            key={angle}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
};

export const CalendarBadge = ({ earned = false, size = 80 }) => {
  const color = earned ? '#1C1C1E' : '#CCCCCC';
  const strokeColor = earned ? '#1C1C1E' : '#CCCCCC';

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-sm">
      {/* Calendar background */}
      <rect
        x="20"
        y="25"
        width="60"
        height="55"
        fill={earned ? color : 'none'}
        stroke={strokeColor}
        strokeWidth={earned ? '0' : '2'}
        rx="4"
        style={earned ? { filter: 'drop-shadow(0 2px 4px rgba(28,28,30,0.3))' } : {}}
      />
      {/* Calendar top bar */}
      <rect x="20" y="25" width="60" height="12" fill={strokeColor} rx="4" />
      {/* Day circles (calendar grid) */}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <circle
          key={i}
          cx={32 + i * 8}
          cy={45}
          r="2.5"
          fill={earned ? 'white' : strokeColor}
        />
      ))}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <circle
          key={`r2-${i}`}
          cx={32 + i * 8}
          cy={58}
          r="2.5"
          fill={earned ? 'white' : strokeColor}
        />
      ))}
    </svg>
  );
};

export const LotusFlowerBadge = ({ earned = false, size = 80 }) => {
  const color = earned ? '#1C1C1E' : '#CCCCCC';
  const strokeColor = earned ? '#1C1C1E' : '#CCCCCC';

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-sm">
      {/* Center circle */}
      <circle
        cx="50"
        cy="50"
        r="12"
        fill={earned ? color : 'none'}
        stroke={strokeColor}
        strokeWidth={earned ? '0' : '1'}
      />
      {/* Petals (6 around center) */}
      {[0, 60, 120, 180, 240, 300].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x = 50 + 26 * Math.cos(rad);
        const y = 50 + 26 * Math.sin(rad);
        return (
          <ellipse
            key={angle}
            cx={x}
            cy={y}
            rx="10"
            ry="14"
            fill={earned ? color : 'none'}
            stroke={strokeColor}
            strokeWidth={earned ? '0' : '2'}
            transform={`rotate(${angle} ${x} ${y})`}
            style={earned ? { filter: 'drop-shadow(0 1px 2px rgba(28,28,30,0.2))' } : {}}
          />
        );
      })}
    </svg>
  );
};

export const PeopleBadge = ({ earned = false, size = 80 }) => {
  const color = earned ? '#1C1C1E' : '#CCCCCC';
  const strokeColor = earned ? '#1C1C1E' : '#CCCCCC';

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-sm">
      {/* Left person */}
      <circle cx="35" cy="30" r="8" fill={earned ? color : 'none'} stroke={strokeColor} strokeWidth={earned ? '0' : '2'} />
      <path d="M28 42 L42 42 L40 58 L30 58 Z" fill={earned ? color : 'none'} stroke={strokeColor} strokeWidth={earned ? '0' : '2'} />
      {/* Right person */}
      <circle cx="65" cy="30" r="8" fill={earned ? color : 'none'} stroke={strokeColor} strokeWidth={earned ? '0' : '2'} />
      <path d="M58 42 L72 42 L70 58 L60 58 Z" fill={earned ? color : 'none'} stroke={strokeColor} strokeWidth={earned ? '0' : '2'} />
      {/* Center person (tall) */}
      <circle cx="50" cy="25" r="9" fill={earned ? color : 'none'} stroke={strokeColor} strokeWidth={earned ? '0' : '2'} />
      <path d="M42 38 L58 38 L55 65 L45 65 Z" fill={earned ? color : 'none'} stroke={strokeColor} strokeWidth={earned ? '0' : '2'} />
    </svg>
  );
};

export const CakeBadge = ({ earned = false, size = 80 }) => {
  const color = earned ? '#1C1C1E' : '#CCCCCC';
  const strokeColor = earned ? '#1C1C1E' : '#CCCCCC';

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-sm">
      {/* Cake layers */}
      <rect x="25" y="55" width="50" height="20" fill={earned ? color : 'none'} stroke={strokeColor} strokeWidth={earned ? '0' : '2'} />
      <rect x="28" y="42" width="44" height="15" fill={earned ? color : 'none'} stroke={strokeColor} strokeWidth={earned ? '0' : '2'} />
      {/* Candle */}
      <rect x="47" y="25" width="6" height="18" fill={strokeColor} />
      {/* Flame */}
      <path d="M50 20 Q48 15 50 10 Q52 15 50 20" fill={earned ? '#F59E0B' : '#CCCCCC'} />
    </svg>
  );
};

export const MoonBadge = ({ earned = false, size = 80 }) => {
  const color = earned ? '#1C1C1E' : '#CCCCCC';
  const strokeColor = earned ? '#1C1C1E' : '#CCCCCC';

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-sm">
      {/* Crescent moon shape */}
      <path
        d="M50 20 C35 20 25 30 25 50 C25 70 35 80 50 80 C40 80 30 70 30 50 C30 30 40 20 50 20 Z"
        fill={earned ? color : 'none'}
        stroke={strokeColor}
        strokeWidth={earned ? '0' : '2'}
        style={earned ? { filter: 'drop-shadow(0 2px 4px rgba(28,28,30,0.3))' } : {}}
      />
      {/* Stars */}
      {[
        { x: 70, y: 35 },
        { x: 75, y: 50 },
        { x: 70, y: 65 },
      ].map((star, i) => (
        <circle key={i} cx={star.x} cy={star.y} r="2.5" fill={strokeColor} />
      ))}
    </svg>
  );
};

export const CheckmarkBadge = ({ earned = false, size = 80 }) => {
  const color = earned ? '#1C1C1E' : '#CCCCCC';
  const strokeColor = earned ? '#1C1C1E' : '#CCCCCC';

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-sm">
      {/* Circle background */}
      <circle
        cx="50"
        cy="50"
        r="35"
        fill={earned ? color : 'none'}
        stroke={strokeColor}
        strokeWidth={earned ? '0' : '2'}
        style={earned ? { filter: 'drop-shadow(0 2px 4px rgba(28,28,30,0.3))' } : {}}
      />
      {/* Checkmark */}
      <path
        d="M35 50 L45 60 L65 40"
        fill="none"
        stroke={earned ? 'white' : strokeColor}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
