import React from 'react';
import { motion } from 'framer-motion';

const TOP_PATHS = [
  'M173.017 117L173.017 60.0005L188.017 43.9851L188.017 20.1159',
  'M150.517 16.0005L150.517 29.9928L167.017 45.6313L167.017 122.5',
  'M148.017 17.6466L148.017 62.9159L163.017 78.5543L162.517 123',
];

const BOT_PATHS = [
  'M163.019 265L163.019 322L148.019 338.016L148.019 361.885',
  'M185.519 366L185.519 352.008L169.019 336.37L169.019 259.5',
  'M188.019 364.354L188.019 319.085L173.019 303.447L173.519 259',
];

export function MissionBentoCognito({ className }) {
  const uid = React.useId().replace(/:/g, '');

  return (
    <svg
      width="342"
      height="367"
      viewBox="0 0 342 367"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <filter id={`${uid}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <linearGradient id={`${uid}-h0`} x1="316.909" y1="271.348" x2="93.2853" y2="140.921" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(var(--foreground) / 0.15)" stopOpacity="0.5" />
          <stop offset="1" stopColor="hsl(var(--primary) / 0.08)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${uid}-h1`} x1="266.813" y1="237.922" x2="99.5815" y2="145.553" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(var(--muted-foreground) / 0.85)" />
          <stop offset="1" stopColor="hsl(var(--card))" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${uid}-h2`} x1="181.665" y1="30.9864" x2="180.764" y2="235.279" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(var(--foreground) / 0.15)" stopOpacity="0.5" />
          <stop offset="1" stopColor="hsl(var(--primary) / 0.08)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${uid}-h3`} x1="178.587" y1="78.4123" x2="181.445" y2="229.148" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(var(--muted-foreground) / 0.85)" />
          <stop offset="1" stopColor="hsl(var(--card))" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${uid}-inner`} x1="153.204" y1="210.839" x2="174.738" y2="130.426" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(var(--muted) / 0.95)" />
          <stop offset="1" stopColor="hsl(var(--primary) / 0.2)" />
        </linearGradient>
        <linearGradient id={`${uid}-chip`} x1="151.515" y1="181.648" x2="193.017" y2="148.75" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(var(--muted-foreground) / 0.45)" />
          <stop offset="1" stopColor="hsl(var(--primary) / 0.25)" />
        </linearGradient>
        <linearGradient id={`${uid}-chipStroke`} x1="156.07" y1="186.709" x2="188.462" y2="154.824" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(var(--border))" />
          <stop offset="1" stopColor="hsl(var(--primary) / 0.35)" />
        </linearGradient>
      </defs>

      {TOP_PATHS.map((d) => (
        <path key={`t-${d.slice(0, 12)}`} d={d} className="stroke-muted-foreground/80 dark:stroke-[#4B5A5D]" strokeLinecap="round" />
      ))}
      {TOP_PATHS.map((d, i) => (
        <motion.path
          key={`ta-${i}`}
          d={d}
          className="stroke-foreground dark:stroke-white"
          strokeWidth="2"
          strokeLinecap="round"
          style={{ filter: `url(#${uid}-glow)` }}
          initial={{ pathLength: 0.15, pathOffset: 0 }}
          animate={{ pathOffset: 1 }}
          transition={{ duration: 2 + i * 0.5, repeat: Infinity, ease: 'linear', delay: i * 0.4 }}
        />
      ))}

      {BOT_PATHS.map((d) => (
        <path key={`b-${d.slice(0, 12)}`} d={d} className="stroke-muted-foreground/80 dark:stroke-[#4B5A5D]" strokeLinecap="round" />
      ))}
      {BOT_PATHS.map((d, i) => (
        <motion.path
          key={`ba-${i}`}
          d={d}
          className="stroke-foreground dark:stroke-white"
          strokeWidth="2"
          strokeLinecap="round"
          style={{ filter: `url(#${uid}-glow)` }}
          initial={{ pathLength: 0.15, pathOffset: 0 }}
          animate={{ pathOffset: 1 }}
          transition={{ duration: 2 + i * 0.5, repeat: Infinity, ease: 'linear', delay: i * 0.4 }}
        />
      ))}

      <path
        d="M219.058 62.4092C227.632 62.4092 235.555 66.9836 239.843 74.4092L288.395 158.505C292.682 165.931 292.682 175.08 288.395 182.505L239.842 266.601C235.555 274.027 227.632 278.601 219.058 278.601L121.952 278.601C113.378 278.601 105.455 274.027 101.168 266.601L52.6148 182.505C48.3277 175.08 48.3277 165.931 52.6148 158.505L101.168 74.4092C105.455 66.9836 113.378 62.4092 121.952 62.4092L219.058 62.4092Z"
        fill={`url(#${uid}-h0)`}
        fillOpacity="0.25"
        stroke={`url(#${uid}-h1)`}
      />
      <path
        d="M78.9419 182.832C74.6547 175.406 74.6547 166.258 78.9419 158.832L114.335 97.5285C118.623 90.1029 126.546 85.5285 135.12 85.5285L205.907 85.5285C214.482 85.5285 222.405 90.1029 226.692 97.5285L262.085 158.832C266.373 166.258 266.373 175.406 262.085 182.832L226.692 244.136C222.405 251.561 214.482 256.136 205.907 256.136L135.12 256.136C126.546 256.136 118.623 251.561 114.335 244.136L78.9419 182.832Z"
        fill={`url(#${uid}-h2)`}
        fillOpacity="0.25"
        stroke={`url(#${uid}-h3)`}
      />

      <path
        d="M108.942 178.832C104.655 171.406 104.655 162.258 108.942 154.832L128.335 121.241C132.623 113.816 140.546 109.241 149.12 109.241L187.907 109.241C196.482 109.241 204.405 113.816 208.692 121.241L228.085 154.832C232.373 162.258 232.373 171.406 228.085 178.832L208.692 212.423C204.405 219.848 196.482 224.423 187.907 224.423L149.12 224.423C140.546 224.423 132.623 219.848 128.335 212.423L108.942 178.832Z"
        fill={`url(#${uid}-inner)`}
        className="stroke-[hsl(var(--foreground)/0.2)] dark:stroke-[#1B2526]"
        strokeWidth="3"
        style={{ filter: 'drop-shadow(0 22px 28px rgba(0,0,0,0.2))' }}
      />

      <path
        d="M147.172 172.72C145.118 169.162 145.118 164.778 147.172 161.22L152.968 151.181C155.022 147.623 158.819 145.431 162.928 145.431L174.52 145.431C178.628 145.431 182.424 147.623 184.479 151.181L190.274 161.22C192.329 164.778 192.329 169.162 190.274 172.72L184.479 182.759C182.424 186.317 178.628 188.509 174.52 188.509L162.928 188.509C158.819 188.509 155.022 186.317 152.968 182.759L147.172 172.72Z"
        fill={`url(#${uid}-chip)`}
        stroke={`url(#${uid}-chipStroke)`}
        style={{ filter: 'drop-shadow(0 18px 14px rgba(0,0,0,0.25))' }}
      />

      {[
        [155.945, 172.998, 24.7144],
        [155.945, 168.584, 24.7144],
        [155.945, 164.171, 24.7144],
        [160.358, 159.757, 15.8878],
      ].map(([x, y, w], i) => (
        <rect
          key={i}
          x={x}
          y={y}
          width={w}
          height="2.64797"
          rx="1.32398"
          className="fill-muted-foreground/50 dark:fill-[#80949A]"
        />
      ))}
    </svg>
  );
}
