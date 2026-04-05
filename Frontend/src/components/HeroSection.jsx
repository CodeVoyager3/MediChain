import React from 'react';
import { motion } from 'framer-motion';
import { createThirdwebClient } from "thirdweb";
import { ConnectButton, lightTheme } from "thirdweb/react";
import { inAppWallet, createWallet } from "thirdweb/wallets";

/* ─── Font injection ─── */
if (!document.head.querySelector('[data-fonts="hero"]')) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.setAttribute('data-fonts', 'hero');
  link.href =
    'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500&display=swap';
  document.head.appendChild(link);
}

/* ─── Thirdweb ─── */
const customTheme = lightTheme({
  colors: {
    primaryButtonBg: "hsl(144, 21%, 85%)",
    primaryButtonText: "hsl(220, 41%, 32%)",
    accentButtonBg: "hsl(144, 21%, 85%)",
    accentButtonText: "hsl(220, 41%, 32%)",
  },
});

const client = createThirdwebClient({
  clientId: import.meta.env.VITE_CLIENT_ID,
});

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  inAppWallet({
    auth: { options: ["email", "google", "apple", "facebook", "phone"] },
  }),
];

/* ─── Animation helpers ─── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] },
});

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.6, delay },
});

export function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Background image — theme aware */}
      <div
        className="absolute inset-0 z-0 scale-105"
        style={{
          backgroundImage: 'var(--hero-url)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.9) contrast(1.1)',
        }}
      />

      {/* Gradient overlay — symmetrical for centered text legibility */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            'radial-gradient(circle at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.65) 60%, rgba(0,0,0,0.7) 100%)',
        }}
      />



      {/* ── Main content ── */}
      <div
        className="relative z-10 flex flex-col items-center w-full mx-auto pt-32 md:pt-40 pb-16"
        style={{ paddingLeft: 'clamp(1rem, 5vw, 2.5rem)', paddingRight: 'clamp(1rem, 5vw, 2.5rem)', maxWidth: '75rem', minHeight: '100vh' }}
      >


        {/* ── Headline block ── */}
        <div
          className="text-center"
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            lineHeight: 0.9,
            letterSpacing: '0.02em',
          }}
        >
          {/* Line 1 */}
          <motion.div className="overflow-hidden" {...fadeUp(0.15)}>
            <span
              className="block text-white"
              style={{ fontSize: 'clamp(4rem, 11vw, 10rem)' }}
            >
              Your Health
            </span>
          </motion.div>

          {/* Line 2 — "Data," in mint accent */}
          <motion.div className="overflow-hidden" {...fadeUp(0.25)}>
            <span
              className="block"
              style={{ fontSize: 'clamp(4rem, 11vw, 10rem)' }}
            >
              <span style={{ color: 'hsl(152, 55%, 72%)' }}>Data,</span>
            </span>
          </motion.div>

          {/* Line 3 — "Truly" outlined ghost + "Yours." solid */}
          <motion.div className="overflow-hidden" {...fadeUp(0.35)}>
            <span
              className="block"
              style={{ fontSize: 'clamp(4rem, 11vw, 10rem)' }}
            >
              <span
                style={{
                  WebkitTextStroke: '2px rgba(255,255,255,0.45)',
                  color: 'transparent',
                  marginRight: '0.12em',
                }}
              >
                Truly
              </span>
              <span className="text-white">Yours.</span>
            </span>
          </motion.div>
        </div>

        {/* Thin divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: 'center center', width: '100%', maxWidth: '18rem' }}
          className="mt-6 mb-5 h-px bg-white/25 mx-auto"
        />

        {/* Body copy */}
        <motion.p
          {...fadeUp(0.5)}
          className="text-white/65 leading-relaxed font-light text-center"
          style={{
            fontSize: 'clamp(0.9rem, 1.2vw, 1.05rem)',
            maxWidth: '45ch',
          }}
        >
          Control your medical history with patient-owned NFT records. Grant
          instant access to doctors and eliminate insurance fraud with immutable
          blockchain verification.
        </motion.p>

        {/* CTA row */}
        <motion.div {...fadeUp(0.6)} className="mt-7 flex items-center justify-center gap-5">
          <ConnectButton
            client={client}
            wallets={wallets}
            theme={customTheme}
            connectModal={{ size: 'wide' }}
            connectButton={{
              label: 'Connect Wallet',
              className: 'btn-connect-navbar',
            }}
            className="!rounded-full overflow-hidden shadow-xl h-12"
          />
          <button
            className="text-sm text-white/55 hover:text-white/90 transition-colors duration-200 flex items-center gap-1.5"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            How it works <span className="opacity-60 text-xs">→</span>
          </button>
        </motion.div>

        {/* Stat strip */}
        <motion.div
          {...fadeIn(0.9)}
          className="mt-10 flex items-center justify-center gap-0 w-full"
        >
          {[
            { value: '100%', label: 'Patient-owned' },
            { value: '0ms', label: 'Verification lag' },
            { value: '∞', label: 'Immutable records' },
          ].map(({ value, label }, i) => (
            <React.Fragment key={label}>
              {i > 0 && <div className="w-px h-9 bg-white/20 mx-7 shrink-0" />}
              <div className="flex flex-col">
                <span
                  className="text-white"
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 'clamp(1.5rem, 2.2vw, 2rem)',
                    letterSpacing: '0.04em',
                    lineHeight: 1,
                  }}
                >
                  {value}
                </span>
                <span
                  className="text-white/40 uppercase tracking-widest mt-1"
                  style={{ fontSize: '0.6rem' }}
                >
                  {label}
                </span>
              </div>
            </React.Fragment>
          ))}
        </motion.div>
      </div>
    </section>
  );
}