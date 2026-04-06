import React from 'react';
import { motion } from 'framer-motion';
import { PlatformEcosystemBentoGrid } from './platform-ecosystem-bento/PlatformEcosystemBentoGrid';

export function PlatformEcosystemSection() {
  return (
    <section id="docs" className="flex w-full justify-center bg-background px-3 py-24 sm:px-6">
      <div className="w-full max-w-[1400px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center md:mb-12"
        >
          <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-4 py-1.5 font-body text-xs uppercase tracking-widest text-muted-foreground">
            Platform Ecosystem
          </div>
          <h2 className="font-display text-4xl leading-tight text-foreground md:text-5xl">
            Built for Every <span className="italic">Stakeholder</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full overflow-hidden rounded-3xl border border-border/60 shadow-sm dark:border-white/10 dark:shadow-none"
        >
          <PlatformEcosystemBentoGrid className="rounded-3xl border-0 shadow-none" />
        </motion.div>
      </div>
    </section>
  );
}
