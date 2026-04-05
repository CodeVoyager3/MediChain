import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Loader2 } from 'lucide-react';
import { AnimatedThemeToggler } from './magicui/animated-theme-toggler';
import { createThirdwebClient } from "thirdweb";
import { ConnectButton, useActiveAccount, useActiveWalletChain } from "thirdweb/react";
import { inAppWallet, createWallet } from "thirdweb/wallets";
import { polygonAmoy } from "thirdweb/chains";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'How It Works', href: '#how' },
  { label: 'Features', href: '#features' },
  { label: 'Patient Stories', href: '#stories' },
  { label: 'Docs', href: '#' },
];

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

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const { login, logout, isAuthenticated, user } = useAuth();
  const account = useActiveAccount();
  const activeChain = useActiveWalletChain();
  const navigate = useNavigate();

  // Scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // If wallet disconnects, clear backend session
  useEffect(() => {
    if (!account && isAuthenticated) {
      logout();
      navigate('/');
    }
  }, [account, isAuthenticated, logout, navigate]);

  // NEW LOGIC: Handle Backend Authentication Explicitly
  const handleBackendLogin = async () => {
    if (!account) return;

    setIsAuthenticating(true);
    try {
      // 1. Check network first before trying to log in
      if (activeChain?.id !== polygonAmoy.id) {
        alert("Please switch to the Polygon Amoy Testnet in your wallet first.");
        setIsAuthenticating(false);
        return;
      }

      const role = await login(account, client);

      // 2. Route based on role
      if (role && role !== 'UNREGISTERED') {
        const roleRoutes = { PATIENT: '/patient', DOCTOR: '/doctor', INSURER: '/insurer' };
        navigate(roleRoutes[role] || '/');
      }
      // If UNREGISTERED, RegisterModal handles it via AuthContext

    } catch (error) {
      console.error("Backend auth failed:", error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
            ? 'py-3 bg-white/90 backdrop-blur-xl border-b border-black/5 shadow-sm dark:bg-background/80 dark:border-border/60'
            : 'py-4 bg-white/70 backdrop-blur-md border-b border-black/5 dark:bg-background/40 dark:border-border/40'
          }`}
      >
        <div className="max-w-6xl mx-auto px-5 md:px-10 flex items-center justify-between">

          {/* Logo */}
          <a href="#" className="flex items-center">
            <img src="/logo.png" alt="MediChain Logo" className="h-[2.5rem] md:h-12 w-auto object-contain" />
          </a>

          {/* Desktop Nav Links */}
          <ul className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-[0.8rem] font-body text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white font-medium transition-colors duration-200"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Right side: theme toggle + CTA */}
          <div className="hidden md:flex items-center gap-3">
            <AnimatedThemeToggler />

            {/* Show Sign In button if connected to wallet but not authenticated with backend */}
            {account && !isAuthenticated && (
              <Button
                onClick={handleBackendLogin}
                disabled={isAuthenticating}
                className="bg-violet-600 hover:bg-violet-700 text-white rounded-full px-5 text-[0.8rem] font-body font-medium h-[44px]"
              >
                {isAuthenticating ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing In...</>
                ) : (
                  "Sign In to Dashboard"
                )}
              </Button>
            )}

            <ConnectButton
              client={client}
              wallets={wallets}
              theme="light"
              connectModal={{ size: 'wide' }}
              connectButton={{ label: 'Connect Wallet' }}
              autoConnect={isAuthenticated}
            />
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <AnimatedThemeToggler />
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-2 rounded-lg text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[60px] inset-x-0 z-40 bg-white/95 dark:bg-background/95 backdrop-blur-xl border-b border-border/40 shadow-lg px-5 py-4 md:hidden"
          >
            <ul className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="text-sm font-body text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white font-medium transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}

              <li className="flex flex-col gap-3 pt-2 border-t border-border/40">
                {account && !isAuthenticated && (
                  <Button
                    onClick={() => {
                      setMenuOpen(false);
                      handleBackendLogin();
                    }}
                    disabled={isAuthenticating}
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-full h-[44px]"
                  >
                    {isAuthenticating ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing In...</>
                    ) : (
                      "Sign In to Dashboard"
                    )}
                  </Button>
                )}

                <div className="w-full flex justify-center">
                  <ConnectButton
                    client={client}
                    wallets={wallets}
                    theme="light"
                    connectModal={{ size: 'wide' }}
                    connectButton={{ label: 'Connect Wallet' }}
                    autoConnect={isAuthenticated}
                  />
                </div>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}