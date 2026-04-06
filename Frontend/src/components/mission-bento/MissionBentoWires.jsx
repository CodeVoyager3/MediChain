import React from 'react';
import { motion } from 'framer-motion';

export function MissionBentoWires({ className }) {
  const uid = React.useId().replace(/:/g, '');

  return (
    <svg
      width="97"
      height="85"
      viewBox="0 0 97 85"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M27.483 25.066H11.5V63.8962H29.1048C37.2896 63.8962 45.0087 67.7037 49.9902 74.1981C54.9717 80.6925 62.6907 84.5 70.8756 84.5H89.5V0.5H72.4974C63.3943 0.5 54.9153 5.12727 49.9902 12.783C45.0651 20.4388 36.5861 25.066 27.483 25.066Z"
        fill={`url(#${uid}-wp0)`}
        stroke={`url(#${uid}-wp1)`}
      />
      <path
        d="M5.88318 39.5H57.0234L71.3923 24.5H92.8077M96.5 62H83.9462L69.9154 45.5H0.948601M95.0231 64.5H54.4077L40.3769 49.5L0.500003 50"
        className="stroke-muted-foreground/80 dark:stroke-[#4B5A5D]"
        strokeLinecap="round"
      />
      {[
        'M5.88318 39.5H57.0234L71.3923 24.5H92.8077',
        'M96.5 62H83.9462L69.9154 45.5H0.948601',
        'M95.0231 64.5H54.4077L40.3769 49.5L0.500003 50',
      ].map((d, i) => (
        <React.Fragment key={i}>
          <motion.path
            d={d}
            className="stroke-foreground dark:stroke-white"
            strokeWidth="1.5"
            strokeLinecap="round"
            style={{ filter: `url(#${uid}-wglow)` }}
            initial={{ pathLength: 0.1, pathOffset: 0 }}
            animate={{ pathOffset: 1 }}
            transition={{
              duration: 2.5 + i * 0.5,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 0.8,
            }}
          />
          <motion.path
            d={d}
            className="stroke-foreground dark:stroke-white"
            strokeWidth="1.5"
            strokeLinecap="round"
            style={{ filter: `url(#${uid}-wglow)` }}
            initial={{ pathLength: 0.1, pathOffset: 0 }}
            animate={{ pathOffset: 1 }}
            transition={{
              duration: 2.5 + i * 0.5,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 0.8 + 1.5,
            }}
          />
        </React.Fragment>
      ))}
      <defs>
        <linearGradient id={`${uid}-wp0`} x1="-4.87037" y1="47.2547" x2="76.0172" y2="46.9237" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(var(--foreground) / 0.18)" stopOpacity="0.55" />
          <stop offset="1" stopColor="hsl(var(--primary) / 0.12)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${uid}-wp1`} x1="11.3418" y1="45.9426" x2="74.6261" y2="47.5446" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(var(--muted-foreground) / 0.9)" />
          <stop offset="1" stopColor="hsl(var(--card))" stopOpacity="0" />
        </linearGradient>
        <filter id={`${uid}-wglow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}
