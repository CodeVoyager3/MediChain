import React from 'react';
import { motion } from 'framer-motion';
import { Database, Lock, ShieldAlert, FileWarning } from 'lucide-react';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const problems = [
  {
    name: 'Fragmented Data',
    description:
      "Patient history is scattered across different hospitals' centralized databases, leading to incomplete, inaccessible records at the point of care.",
    Icon: Database,
    accent: 'from-rose-500/8 to-transparent',
    iconColor: 'text-rose-400',
    span: 'md:col-span-2',
  },
  {
    name: 'No Patient Control',
    description:
      'Patients do not truly "own" their records—hospitals do. You need permission to access your own history.',
    Icon: Lock,
    accent: 'from-orange-400/8 to-transparent',
    iconColor: 'text-orange-400',
    span: 'md:col-span-1',
  },
  {
    name: 'Security & Privacy',
    description:
      'Centralized databases are honeypots for data breaches and unauthorized third-party access.',
    Icon: ShieldAlert,
    accent: 'from-amber-400/8 to-transparent',
    iconColor: 'text-amber-400',
    span: 'md:col-span-1',
  },
  {
    name: 'Insurance Fraud',
    description:
      'Fabricated prescriptions and manipulated billing cost the insurance industry billions every year with no reliable verification mechanism.',
    Icon: FileWarning,
    accent: 'from-red-500/8 to-transparent',
    iconColor: 'text-red-400',
    span: 'md:col-span-2',
  },
];

export function ChallengesSection() {
  return (
    <section className="w-full bg-background py-24 px-6 flex justify-center">
      <div className="w-full max-w-5xl">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-4 py-1.5 text-xs text-muted-foreground font-body tracking-widest uppercase mb-5">
            Current Challenges
          </div>
          <h2 className="font-display text-4xl md:text-5xl text-foreground leading-tight">
            Current Healthcare is{' '}
            <span className="italic">Broken</span>
          </h2>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {problems.map((p) => (
            <motion.div
              key={p.name}
              variants={cardVariants}
              className={`group relative overflow-hidden rounded-2xl border border-border/60 bg-background p-7 flex flex-col gap-4 cursor-default
                hover:border-border transition-all duration-300 hover:shadow-lg ${p.span}`}
            >
              {/* Accent glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${p.accent} pointer-events-none`} />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-foreground/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />

              <div className={`relative w-10 h-10 rounded-xl bg-muted/40 border border-border/40 flex items-center justify-center
                group-hover:scale-110 transition-transform duration-300`}>
                <p.Icon className={`w-5 h-5 ${p.iconColor}`} />
              </div>

              <div className="relative">
                <h3 className="font-display text-xl text-foreground mb-2">{p.name}</h3>
                <p className="text-sm font-body text-muted-foreground leading-relaxed">{p.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
