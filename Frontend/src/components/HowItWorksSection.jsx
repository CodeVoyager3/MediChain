import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, Eye, ShieldOff, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const steps = [
  {
    num: '01',
    title: 'Connect Your Wallet',
    desc: 'Sign in instantly with a Web3 wallet signature. No passwords, no forms. Your wallet is your identity.',
    Icon: Wallet,
    iconColor: 'text-violet-400',
    iconBg: 'bg-violet-400/10 border-violet-400/20',
  },
  {
    num: '02',
    title: 'Mint Your Records',
    desc: 'Each medical document becomes an encrypted NFT tied strictly to your wallet, not a centralized hospital server.',
    Icon: Eye,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-400/10 border-blue-400/20',
  },
  {
    num: '03',
    title: 'Smart Contract Access',
    desc: 'Grant time-bound cryptographic access to doctors. Revoke instantly with a single transaction.',
    Icon: ShieldOff,
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-400/10 border-emerald-400/20',
  },
  {
    num: '04',
    title: 'Zero-Fraud Verification',
    desc: 'Insurers instantly verify claims via blockchain hash. If the record wasn\'t signed by a verified doctor, it is rejected.',
    Icon: AlertTriangle,
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-400/10 border-amber-400/20',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how" className="w-full bg-background py-24 px-6 flex flex-col items-center">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-14 max-w-2xl"
      >
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-4 py-1.5 text-xs text-muted-foreground font-body tracking-widest uppercase mb-5">
          Our Process
        </div>
        <h2 className="font-display text-4xl md:text-5xl text-foreground leading-tight mb-4">
          How MediChain <span className="italic">Works</span>
        </h2>
        <p className="text-muted-foreground font-body text-base leading-relaxed">
          Seamlessly integrate into your workflow with zero friction. From passwordless login to cryptographically secure records.
        </p>
      </motion.div>

      {/* Steps grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-5xl"
      >
        {steps.map((step) => (
          <motion.div
            key={step.num}
            variants={cardVariants}
            className="group relative rounded-2xl border border-border/60 bg-background p-7 flex gap-5 overflow-hidden
              hover:border-border transition-all duration-300 hover:shadow-lg"
          >
            {/* Subtle hover fill */}
            <div className="absolute inset-0 bg-foreground/[0.015] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />

            {/* Icon */}
            <div className={`shrink-0 w-11 h-11 rounded-xl border ${step.iconBg} flex items-center justify-center
              group-hover:scale-110 transition-transform duration-300`}>
              <step.Icon className={`w-5 h-5 ${step.iconColor}`} />
            </div>

            {/* Text */}
            <div className="relative">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-[11px] font-body text-muted-foreground/60 font-semibold tracking-widest">{step.num}</span>
                <h3 className="font-display text-xl text-foreground">{step.title}</h3>
              </div>
              <p className="text-sm font-body text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-16 flex flex-col items-center gap-3"
      >
        <Button
          className="rounded-full px-10 h-12 text-sm font-medium font-body bg-foreground text-background
            hover:bg-foreground/90 shadow-lg hover:shadow-xl transition-shadow duration-300 border-0"
        >
          Launch Prototype Platform
        </Button>
        <p className="text-xs text-muted-foreground font-body">No signup required — connect your wallet to begin</p>
      </motion.div>
    </section>
  );
}

// Footer
export function FooterSection() {
  return (
    <footer className="w-full border-t border-border/40 bg-background py-10 px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <img src="/logo.png" alt="MediChain Logo" className="h-10 md:h-12 w-auto object-contain" />
        <p className="text-xs font-body text-muted-foreground text-center">
          © 2026 MediChain. All records are patient-owned. Built on Polygon.
        </p>
        <div className="flex items-center gap-4 text-xs font-body text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
          <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          <a href="#" className="hover:text-foreground transition-colors">Docs</a>
        </div>
      </div>
    </footer>
  );
}
