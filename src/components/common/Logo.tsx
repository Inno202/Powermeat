import React from 'react';

/* The Powermeat logo, redrawn from the shop sign: outlined bull horns whose left
   cheek frames the "P", and an upright, heavy condensed wordmark. Drawn as SVG so it
   stays sharp at any size and works on light and dark backgrounds. */

const HORNS =
  'M155 88 C130 120 105 175 120 225 C135 262 170 270 210 270 L585 270 C640 262 665 190 640 140 ' +
  'C625 112 605 95 585 88 C600 130 610 190 585 222 C575 236 560 240 545 240 L215 240 ' +
  'C180 240 160 215 158 175 C157 140 158 110 155 88 Z';
const CHEEK = 'M122 236 C140 285 190 300 272 302 L296 578 L440 578';

const RED = '#D7141A';
// On dark surfaces the sign's brighter red reads better.
const RED_ON_DARK = '#F2262B';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  /** Set when the logo sits on a dark surface (footer, staff header). */
  onDark?: boolean;
}

const HEIGHT = { sm: 34, md: 44, lg: 56, xl: 72 };

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showTagline = false, onDark = false }) => {
  const color = onDark ? RED_ON_DARK : RED;
  const height = HEIGHT[size];
  return (
    <span className={`inline-flex flex-col items-start gap-1.5 select-none ${className}`}>
      <svg
        viewBox="95 70 1790 525"
        height={height}
        width={(height * 1790) / 525}
        role="img"
        aria-label="Powermeat"
        className="block shrink-0"
      >
        <g fill="none" stroke={color} strokeWidth="18" strokeLinejoin="round" strokeLinecap="round">
          <path d={HORNS} />
          <path d={CHEEK} />
        </g>
        <text
          x="392"
          y="548"
          fill={color}
          fontSize="285"
          textLength="1475"
          lengthAdjust="spacingAndGlyphs"
          style={{ fontFamily: 'var(--font-logo)' }}
        >
          POWERMEAT
        </text>
      </svg>
      {showTagline && (
        <span className={`${onDark ? 'text-white/80' : 'text-ink-soft'} text-sm font-medium leading-tight`}>
          Meat so good, it hits different!
        </span>
      )}
    </span>
  );
};

/** The horns on their own, for empty photo frames and small spaces. */
export const LogoMark: React.FC<{ size?: number; className?: string }> = ({ size = 34, className = '' }) => (
  <svg
    viewBox="95 70 580 520"
    width={size}
    height={size}
    aria-hidden="true"
    className={className}
  >
    <g fill="none" stroke={RED} strokeWidth="22" strokeLinejoin="round" strokeLinecap="round">
      <path d={HORNS} />
      <path d={CHEEK} />
    </g>
  </svg>
);
