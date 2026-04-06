import React from 'react';
import { motion } from 'framer-motion';

function getBezierPoints(p0, p1, p2, p3) {
  const pointsX = [];
  const pointsY = [];
  for (let t = 0; t <= 1; t += 0.1) {
    const x =
      (1 - t) ** 3 * p0.x +
      3 * (1 - t) ** 2 * t * p1.x +
      3 * (1 - t) * t ** 2 * p2.x +
      t ** 3 * p3.x;
    const y =
      (1 - t) ** 3 * p0.y +
      3 * (1 - t) ** 2 * t * p1.y +
      3 * (1 - t) * t ** 2 * p2.y +
      t ** 3 * p3.y;
    pointsX.push(x);
    pointsY.push(y);
  }
  return { x: pointsX, y: pointsY };
}

function FloatingDot({ name, pathType, duration, delay, uid }) {
  const pathData = {
    path1: getBezierPoints(
      { x: -34, y: 0.89 },
      { x: 14.37, y: 25.51 },
      { x: 264.02, y: 138.48 },
      { x: 514, y: 0.89 },
    ),
    path2: getBezierPoints(
      { x: -35, y: 200.89 },
      { x: 13.37, y: 176.27 },
      { x: 263.02, y: 63.29 },
      { x: 513, y: 200.89 },
    ),
    path3: getBezierPoints(
      { x: -118, y: 17.89 },
      { x: -54.78, y: 42.51 },
      { x: 271.39, y: 155.48 },
      { x: 598, y: 17.89 },
    ),
  };

  const { x, y } = pathData[pathType];

  return (
    <motion.g
      initial={{ x: x[0], y: y[0], opacity: 0 }}
      animate={{
        x,
        y,
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'linear',
        delay,
      }}
    >
      <circle r="12" fill={`url(#${uid}-dotGlow)`} />
      <circle r="3" className="fill-primary-foreground/90" />
      <circle r="3" className="fill-primary/60" opacity="0.6" style={{ filter: 'blur(1px)' }} />

      <g transform="translate(0, -22)" filter={`url(#${uid}-tagShadow)`}>
        <rect
          x="-24"
          y="-9"
          width="50"
          height="20"
          rx="3"
          className="fill-card stroke-border"
          strokeWidth="0.5"
        />
        <text
          x="0"
          y="4"
          className="fill-card-foreground"
          fontSize="12"
          textAnchor="middle"
          fontWeight="600"
          style={{ pointerEvents: 'none', letterSpacing: '0.02em' }}
        >
          {name}
        </text>
      </g>
    </motion.g>
  );
}

export function PlatformEcosystemBentoTwo({ className, uid }) {
  const path1 = 'M-34 0.891113C14.3787 25.5114 264.026 138.484 514 0.891113';
  const path2 = 'M-35 200.891C13.3787 176.271 263.026 63.2987 513 200.891';
  const path3 = 'M-118 17.8911C-54.7898 42.5114 271.392 155.484 598 17.8911';

  return (
    <svg
      width="484"
      height="202"
      viewBox="0 0 484 202"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ overflow: 'visible' }}
      aria-hidden
    >
      <defs>
        <radialGradient id={`${uid}-dotGlow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.85" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </radialGradient>
        <filter id={`${uid}-tagShadow`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.5" />
        </filter>
      </defs>

      <path d={path1} className="stroke-border" strokeWidth="2" />
      <path d={path2} className="stroke-border" strokeWidth="2" />
      <path d={path3} className="stroke-border" strokeWidth="2" />
      <path
        d="M-118 183.891C-54.7898 159.271 271.392 46.2987 598 183.891"
        className="stroke-border"
        strokeWidth="2"
      />
      <line y1="99.8911" x2="513" y2="99.8911" className="stroke-border" strokeWidth="2" />

      <FloatingDot name="Patient" pathType="path3" duration={7} delay={0} uid={uid} />
      <FloatingDot name="Doctor" pathType="path1" duration={5} delay={4} uid={uid} />
      <FloatingDot name="Insurer" pathType="path2" duration={8} delay={1} uid={uid} />
    </svg>
  );
}
