import React from 'react';
import { MagicCard } from './magicui/magic-card';
import { motion } from 'framer-motion';
import { ShieldCheck, Fingerprint, FileKey } from 'lucide-react';

const solutions = [
  {
    title: 'True Ownership',
    description:
      'Medical records are minted as NFTs securely stored on IPFS, inextricably tied to your wallet—not a hospital server.',
    Icon: Fingerprint,
    iconColor: 'text-violet-400',
    delay: 0,
  },
  {
    title: 'Smart Contract Access',
    description:
      'Doctors cannot view your records without explicit, time-bound cryptographic permission from you. Revoke access anytime with one click.',
    Icon: FileKey,
    iconColor: 'text-blue-400',
    delay: 0.12,
  },
  {
    title: 'Zero Fraud',
    description:
      'Insurance companies can instantly verify claims via blockchain hash. If it wasn\'t minted by a verified doctor, it doesn\'t pass.',
    Icon: ShieldCheck,
    iconColor: 'text-emerald-400',
    delay: 0.24,
  },
];

export function CoreFeaturesSection() {
  return (
    <section id="features" className="w-full bg-background py-24 px-6 flex flex-col items-center">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-5xl text-center mb-14"
      >
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-4 py-1.5 text-xs text-muted-foreground font-body tracking-widest uppercase mb-5">
          Core Capabilities
        </div>
        <h2 className="font-display text-4xl md:text-5xl text-foreground leading-tight mb-4">
          Built for True <span className="italic">Decentralization</span>
        </h2>
        <p className="text-muted-foreground font-body max-w-xl mx-auto text-base leading-relaxed">
          We flip the model by putting the patient at the center of the data economy.
          No middlemen. True web3 decentralization.
        </p>
      </motion.div>

      {/* Cards */}
      <div className="flex flex-col md:flex-row gap-5 w-full max-w-5xl">
        {solutions.map((item) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: item.delay, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex-1"
          >
            <MagicCard
              className="h-full p-8 flex flex-col gap-5 rounded-2xl border border-border/60 bg-background"
              gradientColor="rgba(0,0,0,0.04)"
              gradientFrom="#818cf8"
              gradientTo="#c084fc"
              gradientSize={180}
            >
              <div className="w-11 h-11 rounded-xl bg-muted/40 border border-border/40 flex items-center justify-center">
                <item.Icon className={`w-5 h-5 ${item.iconColor}`} />
              </div>
              <div>
                <h3 className="font-display text-xl text-foreground mb-2">{item.title}</h3>
                <p className="text-sm font-body text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            </MagicCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
