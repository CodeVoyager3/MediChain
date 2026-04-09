import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { MissionBentoCards } from './mission-bento/MissionBentoCards';

/* ─── Pill badge ──────────────────────────────────────────── */
function Badge({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-4 py-1.5 mb-10"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
      <span className="text-[11px] font-body font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {children}
      </span>
    </motion.div>
  );
}

/* ─── Animated word-by-word reveal ───────────────────────── */
function SplitReveal({ text, className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-15% 0px' });

  const words = text.split(' ');

  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.28em]"
          initial={{ opacity: 0, y: 22, filter: 'blur(0px)' }}
          animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{
            duration: 0.55,
            delay: i * 0.028,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {word}
        </motion.span>
      ))}
    </p>
  );
}

/* ─── Separator line with center dot ─────────────────────── */
function OrnamentalDivider() {
  return (
    <div className="flex items-center gap-3 w-full max-w-xs mx-auto my-10">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-border" />
      <div className="w-1.5 h-1.5 rounded-full bg-border" />
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-border" />
    </div>
  );
}

/* ─── Main Section ────────────────────────────────────────── */
export function MissionSection() {
  return (
    <section
      id="about"
      className="relative w-full bg-background overflow-hidden"
    >
      {/* ── Subtle background texture ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 70% 50% at 50% 0%, hsl(var(--primary) / 0.05) 0%, transparent 65%)',
        }}
      />
      {/* Top thin accent line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent via-border to-transparent" />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 pb-20 pt-8 text-center">

        {/* Badge */}
        <Badge>Our Mission</Badge>

        {/* Big editorial headline with inline keyword highlights */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 max-w-3xl"
        >
          <h2
            className="font-display leading-[1.1] tracking-tight text-foreground"
            style={{ fontSize: 'clamp(2rem, 4.5vw, 3.4rem)' }}
          >
            Healthcare where{' '}
            <span className="italic relative inline-block">
              patients
              <svg
                className="absolute -bottom-1 left-0 w-full"
                height="4"
                viewBox="0 0 200 4"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path
                  d="M0 3 Q50 0 100 2 Q150 4 200 1"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>{' '}
            are the{' '}
            <span className="relative">
              <span className="text-gradient relative z-10 font-display">
                owners
              </span>
            </span>
          </h2>
        </motion.div>

        {/* Animated body text */}
        <div className="max-w-2xl mb-4">
          <SplitReveal
            text="A Web3-powered healthcare ecosystem where patients fully own their medical data as NFTs — granting time-bound access to doctors via smart contracts while completely eliminating insurance claim fraud through immutable blockchain verification."
            className="font-body text-base md:text-[1.05rem] leading-[1.85] text-muted-foreground"
          />
        </div>

        {/* CTA link */}
        <motion.a
          href="#features"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="group inline-flex items-center gap-2 text-sm font-body font-medium text-foreground/70 hover:text-foreground transition-colors duration-200 mt-2"
        >
          See how it works
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </motion.a>

        {/* Ornamental divider */}
        <OrnamentalDivider />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-5%' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full"
        >
          <MissionBentoCards />
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 flex flex-wrap justify-center gap-x-10 gap-y-4"
        >
          {[
            { value: '100%', label: 'Patient Data Ownership' },
            { value: 'Zero', label: 'Centralised Honeypots' },
            { value: '∞', label: 'Immutable Records' },
          ].map(stat => (
            <div key={stat.label} className="flex flex-col items-center gap-0.5">
              <span className="text-gradient font-display text-2xl">
                {stat.value}
              </span>
              <span className="font-body text-[0.72rem] text-muted-foreground uppercase tracking-widest">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>

      </div>

      {/* Bottom thin accent line */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-t from-transparent via-border to-transparent" />
    </section>
  );
}