import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showTagline = false
}) => {
  const sizeMap = {
    sm: { icon: 24, text: 'text-xl', sub: 'text-[9px]' },
    md: { icon: 34, text: 'text-2xl', sub: 'text-[11px]' },
    lg: { icon: 44, text: 'text-3xl', sub: 'text-xs' },
    xl: { icon: 60, text: 'text-5xl', sub: 'text-sm' }
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Bull-horn outline logo icon */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          width={currentSize.icon}
          height={currentSize.icon}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-[#D7141A] transition-transform duration-200 hover:scale-105"
        >
          {/* Sweeping sharp bull horns */}
          <path
            d="M 12,20 C 18,36 32,54 44,60 C 34,50 26,38 24,22 C 22,12 14,8 12,20 Z"
            fill="currentColor"
          />
          <path
            d="M 88,20 C 82,36 68,54 56,60 C 66,50 74,38 76,22 C 78,12 86,8 88,20 Z"
            fill="currentColor"
          />
          {/* Muscular bull head & brow */}
          <path
            d="M 28,32 C 38,36 62,36 72,32 C 68,44 64,54 62,70 C 60,78 54,84 50,86 C 46,84 40,78 38,70 C 36,54 32,44 28,32 Z"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinejoin="round"
            fill="#1A1A1A"
          />
          {/* Piercing brow ridge & nostrils */}
          <path
            d="M 38,46 L 50,54 L 62,46"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="44" cy="74" r="2.5" fill="currentColor" />
          <circle cx="56" cy="74" r="2.5" fill="currentColor" />
        </svg>
      </div>

      <div className="flex flex-col">
        <span
          className={`font-display italic font-extrabold tracking-wider text-[#D7141A] leading-none ${currentSize.text} uppercase drop-shadow-sm`}
        >
          POWERMEAT
        </span>
        {showTagline && (
          <span className={`text-neutral-400 font-sans tracking-tight font-medium ${currentSize.sub}`}>
            Meat so good, it hits different!
          </span>
        )}
      </div>
    </div>
  );
};
