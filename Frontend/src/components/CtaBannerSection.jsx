import React from 'react';
import { motion } from 'framer-motion';
import { ShimmerButton } from './magicui/shimmer-button';
import { ArrowUpRight, CalendarDays } from 'lucide-react';
import { createThirdwebClient } from "thirdweb";
import { ConnectButton } from "thirdweb/react";
import { inAppWallet, createWallet } from "thirdweb/wallets";

const client = createThirdwebClient({
  clientId: import.meta.env.VITE_CLIENT_ID
});

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  inAppWallet({
    auth: {
      options: ["email", "google", "apple", "facebook", "phone"],
    },
  }),
];

export function CtaBannerSection() {
  return (
    <section
      id="cta"
      className="relative w-full z-10"
    >
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-28 flex flex-col items-center text-center gap-8">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-xs text-muted-foreground font-body tracking-widest uppercase shadow-sm"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Powered by Polygon
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65, delay: 0.1 }}
          className="font-display text-foreground leading-[0.95] tracking-tight"
          style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)' }}
        >
          Take Ownership of Your{' '}
          <span className="italic">Health Data</span> Today
        </motion.h2>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65, delay: 0.2 }}
          className="text-muted-foreground font-body text-base max-w-md leading-relaxed"
        >
          Join thousands of patients and doctors building a transparent, fraud-free healthcare system — powered by blockchain.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <ConnectButton
            client={client}
            wallets={wallets}
            theme="light"
            connectModal={{ size: 'wide' }}
            connectButton={{ label: 'Connect Wallet' }}
            className="inline-flex justify-center items-center rounded-full px-8 h-12 text-sm font-medium font-body bg-primary text-primary-foreground hover:opacity-90 transition-all duration-200 shadow-lg"
          />

          <button className="flex items-center gap-2 px-7 h-12 rounded-full border border-border text-muted-foreground text-sm font-body font-normal hover:border-foreground/45 hover:text-foreground transition-all duration-200">
            <CalendarDays className="w-4 h-4" />
            Schedule a Demo
          </button>
        </motion.div>

        {/* Trust bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="flex flex-wrap items-center justify-center gap-6 text-xs font-body text-muted-foreground mt-2"
        >
          {['No credit card required', 'HIPAA compliant', 'Polygon mainnet', 'IPFS encrypted storage'].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-border" />
              {t}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
