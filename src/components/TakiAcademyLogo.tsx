import React from 'react';

interface TakiAcademyLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'full' | 'icon' | 'badge' | 'avatar';
  showUrl?: boolean;
}

/**
 * Taki Academy Official Vector Logo Component
 * Recreated with precise vector paths matching the official Taki Academy logo:
 * - Blue speech-bubble / book icon with bottom tail
 * - Palestine flag ribbon waving on top-left
 * - Red bookmark ribbon waving on top-right
 * - Calligraphic Arabic 'ق' with two dots and dynamic page swoosh
 * - Modern typography: "Taki Academy" and "www.takiacademy.com"
 */
export const TakiAcademyLogo: React.FC<TakiAcademyLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'icon',
  showUrl = true,
}) => {
  // Dimension presets
  const sizeMap = {
    xs: { icon: 20, container: 'w-5 h-5' },
    sm: { icon: 28, container: 'w-7 h-7' },
    md: { icon: 40, container: 'w-10 h-10' },
    lg: { icon: 56, container: 'w-14 h-14' },
    xl: { icon: 72, container: 'w-18 h-18' },
    '2xl': { icon: 110, container: 'w-28 h-28' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // Render raw SVG emblem
  const renderEmblem = () => (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full select-none"
      aria-label="شعار Taki Academy"
    >
      {/* Subtle circular background highlight if needed */}
      <circle cx="100" cy="100" r="96" fill="#FFFFFF" fillOpacity="0.05" />

      <g transform="translate(10, 8)">
        {/* ================= 1. Top Left Palestine Flag Ribbon ================= */}
        {/* Ribbon base shape */}
        <g id="palestine-ribbon">
          {/* Black top stripe */}
          <path
            d="M 32 40 C 42 35 52 28 60 22 C 64 24 67 29 64 35 C 56 40 45 45 36 49 Z"
            fill="#050505"
          />
          {/* White middle stripe */}
          <path
            d="M 36 49 C 45 45 56 40 64 35 C 62 41 61 46 59 52 C 50 56 40 60 33 63 Z"
            fill="#FFFFFF"
            stroke="#E5E7EB"
            strokeWidth="0.5"
          />
          {/* Green bottom stripe */}
          <path
            d="M 33 63 C 40 60 50 56 59 52 C 58 57 56 62 54 67 C 45 69 36 71 30 73 Z"
            fill="#0F8B44"
          />
          {/* Red triangle on the left */}
          <path
            d="M 30 38 L 46 53 L 28 73 C 26 62 26 48 30 38 Z"
            fill="#E02424"
          />
        </g>

        {/* ================= 2. Top Right Red Ribbon Bookmark ================= */}
        <g id="red-bookmark">
          <path
            d="M 128 44 C 136 42 144 48 150 56 C 151 64 148 70 144 73 C 141 65 137 57 128 54 Z"
            fill="#C81E1E"
          />
          <path
            d="M 130 52 C 138 52 145 60 148 68 C 144 67 138 64 130 60 Z"
            fill="#9B1C1C"
          />
        </g>

        {/* ================= 3. Main Blue Book / Speech Bubble Body ================= */}
        <g id="blue-book-bubble">
          {/* Main rounded rectangular body with speech bubble pointer */}
          <path
            d="M 45 32 
               H 128 
               C 134 32 138 36 138 42 
               V 122 
               C 138 128 134 132 128 132 
               H 90 
               L 77 148 
               L 75 132 
               H 45 
               C 39 132 35 128 35 122 
               V 42 
               C 35 36 39 32 45 32 Z"
            fill="#029BE5"
          />
          {/* Subtle 3D gradient overlay */}
          <path
            d="M 45 32 H 128 C 134 32 138 36 138 42 V 122 C 138 128 134 132 128 132 H 90 L 77 148 L 75 132 H 45 C 39 132 35 128 35 122 V 42 C 35 36 39 32 45 32 Z"
            fill="url(#taki_blue_grad)"
          />

          {/* Book Spine / Page border vertical groove on the right */}
          <rect
            x="132"
            y="40"
            width="3.5"
            height="86"
            rx="1.75"
            fill="#FFFFFF"
            fillOpacity="0.95"
          />
          <rect
            x="139"
            y="44"
            width="2.5"
            height="78"
            rx="1.25"
            fill="#0288D1"
            fillOpacity="0.8"
          />
        </g>

        {/* ================= 4. Arabic 'ق' and Page Dynamic Swoosh ================= */}
        <g id="taki-calligraphy-qaf">
          {/* Two dots above 'ق' (tilted slightly, characteristic of Taki Academy) */}
          <rect
            x="68"
            y="56"
            width="6.5"
            height="6.5"
            rx="1.5"
            transform="rotate(-18 68 56)"
            fill="#FFFFFF"
          />
          <rect
            x="76"
            y="53.5"
            width="6.5"
            height="6.5"
            rx="1.5"
            transform="rotate(-18 76 53.5)"
            fill="#FFFFFF"
          />

          {/* Letter 'ق' loop & dynamic swoosh */}
          <path
            d="M 74 67
               C 70 67 66 70 66 76
               C 66 82 71 85 77 85
               C 83 85 86 80 85 74
               C 84 69 80 67 74 67 Z
               M 75 73
               C 77 73 78 75 78 77
               C 78 79 76 81 74 81
               C 72 81 71 79 71 77
               C 71 75 73 73 75 73 Z"
            fill="#FFFFFF"
          />

          {/* The dynamic white swoosh / page line curving down and up to checkmark */}
          <path
            d="M 35 96
               C 44 98 56 100 70 99
               C 78 98 81 92 81 83
               L 86 83
               C 86 92 88 99 94 107
               L 132 58
               L 133 67
               L 95 116
               C 92 119 88 120 84 117
               C 80 113 76 107 72 106
               C 58 106 45 103 35 101 Z"
            fill="#FFFFFF"
          />
        </g>
      </g>

      {/* Gradients */}
      <defs>
        <linearGradient id="taki_blue_grad" x1="35" y1="32" x2="138" y2="148" gradientUnits="userSpaceOnUse">
          <stop stopColor="#29B6F6" stopOpacity="0.25" />
          <stop offset="0.6" stopColor="#0288D1" stopOpacity="0" />
          <stop offset="1" stopColor="#01579B" stopOpacity="0.2" />
        </linearGradient>
      </defs>
    </svg>
  );

  // Variant: Icon only
  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${currentSize.container} ${className}`}>
        {renderEmblem()}
      </div>
    );
  }

  // Variant: Circular Avatar
  if (variant === 'avatar') {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-full bg-white dark:bg-stone-900 border-2 border-sky-400/80 shadow-[0_4px_12px_rgba(2,155,229,0.25)] p-1 shrink-0 ${currentSize.container} ${className}`}
      >
        {renderEmblem()}
      </div>
    );
  }

  // Variant: Badge (Icon + Text horizontal)
  if (variant === 'badge') {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white dark:bg-stone-900 border border-sky-200 dark:border-sky-800/60 shadow-[3px_4px_12px_rgba(2,155,229,0.12),inset_1.5px_1.5px_2px_rgba(255,255,255,0.8)] ${className}`}
      >
        <div className="w-7 h-7 shrink-0">
          {renderEmblem()}
        </div>
        <div className="flex flex-col text-right">
          <span className="font-black text-xs text-[#0288D1] dark:text-sky-300 leading-tight">
            Taki Academy
          </span>
          {showUrl && (
            <span className="text-[9px] font-medium text-sky-600 dark:text-sky-400 leading-tight dir-ltr">
              takiacademy.com
            </span>
          )}
        </div>
      </div>
    );
  }

  // Variant: Full Circular/Card Logo (matching user image exactly)
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-4 bg-white dark:bg-stone-900 rounded-3xl border border-sky-100 dark:border-sky-950 shadow-[0_8px_24px_rgba(2,155,229,0.12)] ${className}`}
    >
      {/* Central Blue Book Emblem */}
      <div className={`${size === '2xl' ? 'w-28 h-28' : size === 'xl' ? 'w-24 h-24' : 'w-20 h-20'} mb-2`}>
        {renderEmblem()}
      </div>

      {/* Typography: Taki Academy */}
      <div className="text-xl sm:text-2xl font-black text-[#0288D1] dark:text-sky-400 tracking-tight leading-tight">
        Taki Academy
      </div>

      {/* Official URL */}
      {showUrl && (
        <a
          href="https://www.takiacademy.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs sm:text-sm font-semibold text-[#00A0E3] hover:text-[#0277BD] dark:text-sky-300 dark:hover:text-white transition-colors mt-0.5 dir-ltr tracking-normal"
        >
          www.takiacademy.com
        </a>
      )}
    </div>
  );
};
