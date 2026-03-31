import React from 'react';
import { motion } from 'framer-motion';
import { UserCircle, Stethoscope, Building2, ChevronRight } from 'lucide-react';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const personas = [
  {
    role: 'The Patient',
    subtitle: 'The Owner',
    Icon: UserCircle,
    iconColor: 'text-violet-400',
    iconBg: 'bg-violet-400/10 border-violet-400/20',
    workflows: [
      'Logs in using a Web3 wallet — no passwords or emails required.',
      'Views all medical history in one unified, beautiful dashboard.',
      'Grants time-bound access to doctors & revokes with one click.',
    ],
    accentBar: 'bg-violet-400',
  },
  {
    role: 'The Doctor',
    subtitle: 'The Contributor',
    Icon: Stethoscope,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-400/10 border-blue-400/20',
    workflows: [
      'Must be a verified medical professional to join the network.',
      'Requests patient history access prior to consultations.',
      'Uploads new records that auto-encrypt, store & mint as NFTs.',
    ],
    accentBar: 'bg-blue-400',
  },
  {
    role: 'The Insurer',
    subtitle: 'The Verifier',
    Icon: Building2,
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-400/10 border-emerald-400/20',
    workflows: [
      'Scans the MediChain QR code from the patient or hospital.',
      'Instantly audits the immutable, tamper-proof blockchain trail.',
      'Automates genuine payouts and flags fraudulent claims instantly.',
    ],
    accentBar: 'bg-emerald-400',
  },
];

export function PlatformEcosystemSection() {
  return (
    <section className="w-full bg-background py-24 px-6 flex justify-center">
      <div className="w-full max-w-5xl">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-4 py-1.5 text-xs text-muted-foreground font-body tracking-widest uppercase mb-5">
            Platform Ecosystem
          </div>
          <h2 className="font-display text-4xl md:text-5xl text-foreground leading-tight">
            Built for Every{' '}
            <span className="italic">Stakeholder</span>
          </h2>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {personas.map((persona) => (
            <motion.div
              key={persona.role}
              variants={cardVariants}
              className="relative group rounded-2xl border border-border/60 bg-background p-7 flex flex-col overflow-hidden
                hover:border-border transition-all duration-300 hover:shadow-lg"
            >
              {/* Top accent bar */}
              <div className={`absolute top-0 left-0 right-0 h-[2px] ${persona.accentBar} opacity-50 group-hover:opacity-100 transition-opacity duration-300`} />

              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl border ${persona.iconBg} flex items-center justify-center mb-5
                group-hover:scale-105 transition-transform duration-300`}>
                <persona.Icon className={`w-6 h-6 ${persona.iconColor}`} />
              </div>

              {/* Label */}
              <h3 className="font-display text-2xl text-foreground mb-1">{persona.role}</h3>
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-body mb-6 font-semibold block">
                {persona.subtitle}
              </span>

              {/* Workflows */}
              <ul className="space-y-3 flex-1">
                {persona.workflows.map((wf, idx) => (
                  <li key={idx} className="flex gap-2.5 text-sm font-body text-muted-foreground">
                    <ChevronRight className={`w-4 h-4 shrink-0 mt-0.5 ${persona.iconColor} opacity-70`} />
                    <span>{wf}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
