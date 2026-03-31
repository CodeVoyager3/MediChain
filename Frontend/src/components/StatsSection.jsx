import React from 'react';
import { motion } from 'framer-motion';
import { NumberTicker } from './magicui/number-ticker';

const stats = [
  { value: 10000, suffix: '+', label: 'Patients Onboarded', prefix: '' },
  { value: 0, suffix: '', label: 'Data Breaches', prefix: '', word: 'Zero' },
  { value: 3, suffix: '', label: 'Chains Supported', prefix: '' },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export function StatsSection() {
  return (
    <section id="stats" className="w-full bg-background py-24 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-1.5 text-xs text-muted-foreground font-body tracking-widest uppercase mb-5">
            Platform Metrics
          </div>
          <h2 className="font-display text-4xl md:text-5xl text-foreground leading-tight">
            Numbers That <span className="italic">Speak</span>
          </h2>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border overflow-hidden rounded-2xl border border-border bg-background shadow-sm"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="flex flex-col items-center justify-center gap-3 py-14 px-8 hover:bg-muted/40 transition-colors duration-300"
            >
              <div className="font-display text-5xl md:text-6xl text-foreground leading-none tracking-tight">
                {stat.word ? (
                  stat.word
                ) : (
                  <>
                    {stat.prefix}
                    <NumberTicker
                      value={stat.value}
                      className="text-foreground font-display text-5xl md:text-6xl tracking-tight"
                    />
                    {stat.suffix}
                  </>
                )}
              </div>
              <p className="text-[0.72rem] font-body text-muted-foreground uppercase tracking-widest text-center">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
