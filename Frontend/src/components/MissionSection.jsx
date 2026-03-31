import React from 'react';
import { motion } from 'framer-motion';
import ScrollReveal from './ScrollReveal';

// Shared scroll-in animation wrapper
function FadeIn({ children, delay = 0, direction = 'up', className }) {
  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 24 : direction === 'down' ? -24 : 0,
      x: direction === 'left' ? 24 : direction === 'right' ? -24 : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: { duration: 0.65, delay, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export { FadeIn };

export function MissionSection() {
  return (
    <section id="about" className="relative w-full bg-background py-20 px-6 flex flex-col items-center">
      {/* Section label */}
      <FadeIn className="mb-10">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-4 py-1.5 text-xs font-body text-muted-foreground tracking-widest uppercase">
          Our Mission
        </div>
      </FadeIn>

      <FadeIn delay={0.1} className="w-full max-w-4xl text-center">
        <ScrollReveal
          baseOpacity={0.1}
          baseRotation={3}
          blurStrength={4}
          containerClassName="mx-auto"
          textClassName="font-display tracking-tight text-foreground"
        >
          A Web3-powered healthcare ecosystem where patients fully own their medical data as NFTs granting time-bound access to doctors via smart contracts while completely eliminating insurance claim fraud through immutable blockchain verification.
        </ScrollReveal>
      </FadeIn>
    </section>
  );
}
