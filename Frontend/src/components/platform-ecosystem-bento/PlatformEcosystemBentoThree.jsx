import React from 'react';

/**
 * Box-3 radar illustration — same geometry language as the reference (fan ticks, dual rings, blue nodes).
 * Kept programmatic to avoid a multi‑KB pasted SVG while preserving the visual pattern.
 */
export function PlatformEcosystemBentoThree({ className }) {
  const uid = React.useId().replace(/:/g, '');

  const tickMatrices = [
    'matrix(0.964347 0.107607 -0.101357 1.02381 5.83789 193.419)',
    'matrix(0.94847 0.214034 -0.201603 1.00695 8.03711 172.634)',
    'matrix(0.922201 0.318116 -0.299641 0.979062 12.2705 152.212)',
    'matrix(0.885828 0.418714 -0.394396 0.940446 18.4932 132.368)',
    'matrix(0.83975 0.514723 -0.48483 0.891527 26.6299 113.321)',
    'matrix(0.784471 0.605094 -0.569952 0.83284 36.5996 95.2861)',
    'matrix(0.720598 0.688834 -0.648829 0.765028 48.291 78.4541)',
    'matrix(0.648829 0.765028 -0.720598 0.688835 61.5781 63.0166)',
    'matrix(0.569952 0.83284 -0.784471 0.605094 76.3086 49.1299)',
    'matrix(0.48483 0.891527 -0.83975 0.514724 92.3271 36.958)',
    'matrix(0.394396 0.940447 -0.885828 0.418714 109.457 26.6299)',
    'matrix(0.299642 0.979063 -0.922202 0.318117 127.512 18.2627)',
    'matrix(0.201604 1.00695 -0.948471 0.214034 146.287 11.9385)',
    'matrix(0.101357 1.02381 -0.964348 0.107607 165.588 7.73926)',
    'matrix(-0.101357 1.02381 -0.964348 -0.107606 204.886 5.84863)',
    'matrix(-0.201604 1.00695 -0.948471 -0.214034 224.462 8.18457)',
    'matrix(-0.299641 0.979063 -0.922202 -0.318117 243.703 12.6768)',
    'matrix(-0.394396 0.940448 -0.885829 -0.418714 262.394 19.2783)',
    'matrix(-0.48483 0.891528 -0.839751 -0.514724 280.33 27.9229)',
    'matrix(-0.569952 0.832841 -0.784472 -0.605094 297.322 38.5088)',
    'matrix(-0.648829 0.765029 -0.720598 -0.688835 313.174 50.9229)',
    'matrix(-0.720598 0.688835 -0.64883 -0.765029 327.717 65.0244)',
    'matrix(-0.784472 0.605095 -0.569952 -0.832841 340.795 80.665)',
    'matrix(-0.839751 0.514724 -0.484831 -0.891528 352.26 97.6729)',
    'matrix(-0.885829 0.418715 -0.394397 -0.940448 361.987 115.86)',
    'matrix(-0.922202 0.318117 -0.299642 -0.979063 369.868 135.024)',
    'matrix(-0.948472 0.214035 -0.201604 -1.00695 375.822 154.958)',
    'matrix(-0.964349 0.107607 -0.101357 -1.02381 379.782 175.446)',
    'matrix(-0.964349 -0.107606 0.101357 -1.02381 381.562 217.173)',
  ];

  const accentIndices = new Set([4, 9, 13, 18, 23]);

  return (
    <svg
      width="388"
      height="357"
      viewBox="0 0 388 357"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <line x1="5.7002" y1="213.3" x2="40.6818" y2="213.3" stroke="hsl(var(--primary))" strokeWidth="2" />
      <g filter={`url(#${uid}_fb)`}>
        <line x1="5.7002" y1="213.3" x2="40.6818" y2="213.3" stroke="hsl(var(--primary))" strokeWidth="2" />
      </g>

      {tickMatrices.map((transform, i) => {
        const isAccent = accentIndices.has(i);
        const stroke = isAccent
          ? 'hsl(var(--primary))'
          : i > 19
            ? 'hsl(var(--muted-foreground) / 0.85)'
            : 'hsl(var(--border))';
        const sw = isAccent ? 2 : 1;
        return (
          <g key={i}>
            <line
              y1="-0.5"
              x2="36.0761"
              y2="-0.5"
              transform={transform}
              stroke={stroke}
              strokeWidth={sw}
            />
            <g filter={`url(#${uid}_ft)`}>
              <line
                y1="-0.5"
                x2="36.0761"
                y2="-0.5"
                transform={transform}
                stroke={stroke}
                strokeWidth={sw}
              />
            </g>
          </g>
        );
      })}

      <line x1="186.159" y1="5.7002" x2="186.159" y2="42.8387" stroke="hsl(var(--primary))" strokeWidth="2" />
      <g filter={`url(#${uid}_fb)`}>
        <line x1="186.159" y1="5.7002" x2="186.159" y2="42.8387" stroke="hsl(var(--primary))" strokeWidth="2" />
      </g>

      <line x1="381.7" y1="197.292" x2="346.719" y2="197.292" stroke="hsl(var(--muted-foreground) / 0.85)" strokeWidth="2" />
      <g filter={`url(#${uid}_ft)`}>
        <line x1="381.7" y1="197.292" x2="346.719" y2="197.292" stroke="hsl(var(--muted-foreground) / 0.85)" strokeWidth="2" />
      </g>

      <g filter={`url(#${uid}_fc1)`}>
        <circle cx="194.2" cy="202.2" r="133.5" fill="hsl(var(--muted))" />
      </g>
      <g filter={`url(#${uid}_fc2)`}>
        <circle cx="194.2" cy="202.2" r="90.5" fill="hsl(var(--muted))" />
      </g>
      <g opacity="0.52" filter={`url(#${uid}_fn)`}>
        <circle cx="250.2" cy="105.2" r="11.5" fill="hsl(var(--foreground) / 0.35)" />
      </g>
      <g filter={`url(#${uid}_fs)`}>
        <circle cx="250.2" cy="105.2" r="7.5" fill="hsl(var(--primary))" />
      </g>

      <defs>
        <filter
          id={`${uid}_ft`}
          x="-4"
          y="-4"
          width="44"
          height="44"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="2.85" result="blur" />
        </filter>
        <filter
          id={`${uid}_fb`}
          x="-8"
          y="-8"
          width="52"
          height="52"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="2.85" result="blur" />
        </filter>
        <filter
          id={`${uid}_fn`}
          x="231.2"
          y="86.2002"
          width="38"
          height="38"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="3.75" result="blur" />
        </filter>
        <filter
          id={`${uid}_fs`}
          x="241.7"
          y="96.7002"
          width="17"
          height="17"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="0.5" result="blur" />
        </filter>
        <filter
          id={`${uid}_fc1`}
          x="39.7002"
          y="47.7002"
          width="309"
          height="309"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="10.5" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.0784314 0 0 0 0 0.541176 0 0 0 0 0.882353 0 0 0 1 0"
          />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="16.05" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.976923 0 0 0 0 0.976923 0 0 0 0 0.976923 0 0 0 0.18 0"
          />
          <feBlend mode="normal" in2="shape" result="effect2_innerShadow" />
        </filter>
        <filter
          id={`${uid}_fc2`}
          x="82.1002"
          y="90.1002"
          width="224.2"
          height="224.2"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="10.8" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.18 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
          <feGaussianBlur stdDeviation="1.4" result="effect2_foregroundBlur" />
        </filter>
      </defs>
    </svg>
  );
}
