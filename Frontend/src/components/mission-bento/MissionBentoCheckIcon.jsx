import React from 'react';
import { motion } from 'framer-motion';

export function MissionBentoCheckIcon({ className, status }) {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {status === 'loading' ? (
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '20px 20px' }}
        >
          <motion.path
            d="M20 6 A 14 14 0 1 1 19.99 6"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0.2 }}
            animate={{ pathLength: [0.1, 0.4, 0.1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.path
            d="M20 6 A 14 14 0 1 1 19.99 6"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            style={{ rotate: 120, transformOrigin: '20px 20px' }}
            initial={{ pathLength: 0.1 }}
            animate={{ pathLength: [0.05, 0.2, 0.05] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.2,
            }}
          />
        </motion.g>
      ) : (
        <motion.path
          d="M10 20L16.6667 26.6667L30 13.3333"
            stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      )}
    </svg>
  );
}
