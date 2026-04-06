import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { createThirdwebClient } from "thirdweb";
import { ConnectButton, useActiveAccount, useActiveWalletChain, lightTheme, useDisconnect, useActiveWallet } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { polygonAmoy } from "thirdweb/chains";
import { useAuth } from '../context/AuthContext';
import { AnimatedThemeToggler } from './magicui/animated-theme-toggler';

const customTheme = lightTheme({
  colors: {
    primaryButtonBg: "hsl(144, 21%, 85%)", // Soft Mint / Creme
    primaryButtonText: "hsl(220, 41%, 32%)", // Steel Blue
    accentButtonBg: "hsl(144, 21%, 85%)",
    accentButtonText: "hsl(220, 41%, 32%)",
  },
});

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'How It Works', href: '#how' },
  { label: 'Features', href: '#features' },
  { label: 'Patient Stories', href: '#stories' },
  { label: 'Docs', href: '#docs' },
];

const client = createThirdwebClient({
  clientId: import.meta.env.VITE_CLIENT_ID
});

const wallets = [
  createWallet("io.metamask"),
];

export function Navbar({
  logo = "/logo.png",
  logoAlt = 'MediChain Logo',
  items = navLinks,
  className = '',
  ease = 'power3.easeOut',
  baseColor = '#fff',
  pillColor = '#060010',
  hoveredPillTextColor = '#060010',
  pillTextColor,
  initialLoadAnimation = true
}) {
  const resolvedPillTextColor = pillTextColor ?? baseColor;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const circleRefs = useRef([]);
  const tlRefs = useRef([]);
  const activeTweenRefs = useRef([]);
  const logoImgRef = useRef(null);
  const logoTweenRef = useRef(null);
  const hamburgerRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navItemsRef = useRef(null);
  const logoRef = useRef(null);

  // --- Start Business Logic Integration ---
  const { login, isAuthenticated, user, logout } = useAuth();
  const account = useActiveAccount();
  const activeChain = useActiveWalletChain();
  const wallet = useActiveWallet();
  const { disconnect } = useDisconnect();
  const navigate = useNavigate();

  // THE FIX: An immutable lock to stop React 18 from double-firing the signature
  const authLock = useRef(false);

  // ---------------------------------------------------------
  // THE BULLETPROOF AUTH LOGIC
  // ---------------------------------------------------------
  useEffect(() => {
    // 1. If disconnected or successfully logged in, release the lock and do nothing
    if (!account || isAuthenticated) {
      authLock.current = false;
      return;
    }

    // 2. Wait for the user to be on the correct network
    if (activeChain && activeChain.id !== polygonAmoy.id) return;

    // 3. React Strict Mode Trap: If we are already asking for a signature, IGNORE this render
    if (authLock.current) return;

    // Lock the doors! We are initiating the login sequence.
    authLock.current = true;

    const authenticate = async () => {
      try {
        console.log("Wallet detected, requesting backend signature...");
        const result = await login(account, client);

        if (result && result.role && result.role !== 'UNREGISTERED') {
          const roleRoutes = { PATIENT: '/patient', DOCTOR: '/doctor', INSURER: '/insurer' };
          navigate(roleRoutes[result.role] || '/');
        }
      } catch (err) {
        console.error('Signature rejected or login failed:', err);

        // Clear the ghost session cache
        localStorage.removeItem('medichain_jwt');
        if (logout) logout();

        // Sever the connection so they can try again fresh
        if (wallet) {
          disconnect(wallet);
        }
      }
    };

    authenticate();

  }, [account, activeChain, isAuthenticated, login, navigate, wallet, disconnect, logout]);

  // If user completes registration or is already logged in, redirect them
  useEffect(() => {
    if (isAuthenticated && user?.role && user.role !== 'UNREGISTERED') {
      const roleRoutes = { PATIENT: '/patient', DOCTOR: '/doctor', INSURER: '/insurer' };
      const target = roleRoutes[user.role];
      if (target) navigate(target);
    }
  }, [isAuthenticated, user?.role, navigate]);
  // --- End Business Logic Integration ---

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach(circle => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`
        });

        const label = pill.querySelector('.pill-label');
        const white = pill.querySelector('.pill-label-hover');

        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        const index = circleRefs.current.indexOf(circle);
        if (index === -1) return;

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: 'auto' }, 0);

        if (label) {
          tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: 'auto' }, 0);
        }

        if (white) {
          gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(white, { y: 0, opacity: 1, duration: 2, ease, overwrite: 'auto' }, 0);
        }

        tlRefs.current[index] = tl;
      });
    };

    layout();

    const onResize = () => layout();
    window.addEventListener('resize', onResize);

    if (document.fonts?.ready) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    const menu = mobileMenuRef.current;
    if (menu) {
      gsap.set(menu, { visibility: 'hidden', opacity: 0, scaleY: 1, y: 0 });
    }

    if (initialLoadAnimation) {
      const logoEl = logoRef.current;
      const navItems = navItemsRef.current;

      if (logoEl) {
        gsap.set(logoEl, { scale: 0 });
        gsap.to(logoEl, {
          scale: 1,
          duration: 0.6,
          ease
        });
      }

      if (navItems) {
        gsap.set(navItems, { width: 0, overflow: 'hidden' });
        gsap.to(navItems, {
          width: 'auto',
          duration: 0.6,
          ease
        });
      }
    }

    return () => window.removeEventListener('resize', onResize);
  }, [items, ease, initialLoadAnimation]);

  const handleEnter = i => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease,
      overwrite: 'auto'
    });
  };

  const handleLeave = i => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: 'auto'
    });
  };

  const handleLogoEnter = () => {
    const img = logoImgRef.current;
    if (!img) return;
    logoTweenRef.current?.kill();
    gsap.set(img, { rotate: 0 });
    logoTweenRef.current = gsap.to(img, {
      rotate: 360,
      duration: 0.2,
      ease,
      overwrite: 'auto'
    });
  };

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);

    const hamburger = hamburgerRef.current;
    const menu = mobileMenuRef.current;

    if (hamburger) {
      const lines = hamburger.querySelectorAll('.hamburger-line');
      if (newState) {
        gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease });
      } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease });
      }
    }

    if (menu) {
      if (newState) {
        gsap.set(menu, { visibility: 'visible' });
        gsap.fromTo(
          menu,
          { opacity: 0, y: 10, scaleY: 1 },
          {
            opacity: 1,
            y: 0,
            scaleY: 1,
            duration: 0.3,
            ease,
            transformOrigin: 'top center'
          }
        );
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: 10,
          scaleY: 1,
          duration: 0.2,
          ease,
          transformOrigin: 'top center',
          onComplete: () => {
            gsap.set(menu, { visibility: 'hidden' });
          }
        });
      }
    }
  };

  const isExternalLink = href =>
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('//') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('#');

  const isRouterLink = href => href && !isExternalLink(href);

  const cssVars = {
    ['--base']: 'hsl(var(--background))',
    ['--pill-bg']: 'hsl(var(--foreground))',
    ['--hover-text']: 'hsl(var(--foreground))',
    ['--pill-text']: 'hsl(var(--background))',
    ['--nav-h']: '48px',
    ['--logo']: '40px',
    ['--pill-pad-x']: '18px',
    ['--pill-gap']: '4px'
  };

  return (
    <div className="fixed top-[1.5em] z-[1000] w-full left-0 flex justify-center pointer-events-none">
      <nav
        className={`w-max flex items-center justify-between md:justify-start box-border px-4 md:px-0 pointer-events-auto ${className}`}
        aria-label="Primary"
        style={cssVars}
      >
        {/* Logo Section */}
        <Link
          to="/"
          aria-label="Home"
          onMouseEnter={handleLogoEnter}
          ref={el => {
            logoRef.current = el;
          }}
          className="rounded-full px-4 inline-flex items-center justify-center gap-2 overflow-hidden shadow-lg border border-black/5 dark:border-white/10"
          style={{
            height: 'var(--nav-h)',
            background: 'var(--base, #fff)'
          }}
        >
          <img src={logo} alt={logoAlt} ref={logoImgRef} className="h-8 w-8 object-contain block p-0.5" />
          <span className="text-xl font-bold tracking-tight hidden sm:block" style={{ fontFamily: 'var(--font-logo)', color: 'hsl(var(--foreground))' }}>MediChain</span>
        </Link>

        {/* Desktop Nav Items */}
        <div
          ref={navItemsRef}
          className="relative items-center rounded-full hidden md:flex ml-3 shadow-lg border border-black/5 dark:border-white/10"
          style={{
            height: 'var(--nav-h)',
            background: 'var(--base, #fff)'
          }}
        >
          <ul
            role="menubar"
            className="list-none flex items-stretch m-0 p-[4px] h-full"
            style={{ gap: 'var(--pill-gap)' }}
          >
            {items.map((item, i) => {
              const pillStyle = {
                background: 'var(--pill-bg, #060010)',
                color: 'var(--pill-text, #fff)',
                paddingLeft: 'var(--pill-pad-x)',
                paddingRight: 'var(--pill-pad-x)'
              };

              const PillContent = (
                <>
                  <span
                    className="hover-circle absolute left-1/2 bottom-0 rounded-full z-[1] block pointer-events-none"
                    style={{
                      background: 'var(--base, #fff)',
                      willChange: 'transform'
                    }}
                    aria-hidden="true"
                    ref={el => {
                      circleRefs.current[i] = el;
                    }}
                  />
                  <span className="label-stack relative inline-block leading-[1] z-[2]">
                    <span
                      className="pill-label relative z-[2] inline-block leading-[1]"
                      style={{ willChange: 'transform' }}
                    >
                      {item.label}
                    </span>
                    <span
                      className="pill-label-hover absolute left-0 top-0 z-[3] inline-block"
                      style={{
                        color: 'var(--hover-text, #060010)',
                        willChange: 'transform, opacity'
                      }}
                      aria-hidden="true"
                    >
                      {item.label}
                    </span>
                  </span>
                </>
              );

              const basePillClasses =
                'relative overflow-hidden inline-flex items-center justify-center h-full no-underline rounded-full box-border font-semibold text-[14px] leading-[0] uppercase tracking-[0.5px] whitespace-nowrap cursor-pointer px-0 transition-opacity hover:opacity-90';

              return (
                <li key={item.href} role="none" className="flex h-full">
                  {isRouterLink(item.href) ? (
                    <Link
                      role="menuitem"
                      to={item.href}
                      className={basePillClasses}
                      style={pillStyle}
                      aria-label={item.ariaLabel || item.label}
                      onMouseEnter={() => handleEnter(i)}
                      onMouseLeave={() => handleLeave(i)}
                    >
                      {PillContent}
                    </Link>
                  ) : (
                    <a
                      role="menuitem"
                      href={item.href}
                      className={basePillClasses}
                      style={pillStyle}
                      aria-label={item.ariaLabel || item.label}
                      onMouseEnter={() => handleEnter(i)}
                      onMouseLeave={() => handleLeave(i)}
                    >
                      {PillContent}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Desktop CTA & Theme Toggle */}
        <div 
          className="hidden md:flex items-center ml-3 rounded-full shadow-lg border border-black/5 dark:border-white/10 p-[4px]"
          style={{
            height: 'var(--nav-h)',
            background: 'var(--base, #fff)'
          }}
        >
          <div className="flex items-center gap-3 px-2">
            <AnimatedThemeToggler />
            <ConnectButton
              client={client}
              wallets={wallets}
              theme={customTheme}
              chain={polygonAmoy}
              connectModal={{ size: 'compact' }}
              connectButton={{ 
                label: 'Connect Wallet',
                className: "btn-connect-navbar"
              }}
              className="!rounded-full overflow-hidden shadow-md"
            />
          </div>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          ref={hamburgerRef}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
          className="md:hidden rounded-full border border-black/5 dark:border-white/10 flex flex-col items-center justify-center gap-1 cursor-pointer p-0 relative shadow-lg ml-2"
          style={{
            width: 'var(--nav-h)',
            height: 'var(--nav-h)',
            background: 'var(--base, #fff)'
          }}
        >
          <span
            className="hamburger-line w-4 h-0.5 rounded origin-center"
            style={{ background: 'var(--pill-bg)' }}
          />
          <span
            className="hamburger-line w-4 h-0.5 rounded origin-center"
            style={{ background: 'var(--pill-bg)' }}
          />
        </button>
      </nav>

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        className="md:hidden absolute top-[4.5em] left-4 right-4 rounded-[27px] shadow-2xl z-[998] origin-top border border-black/5 dark:border-white/10 pointer-events-auto"
        style={{
          background: 'var(--base, #fff)'
        }}
      >
        <ul className="list-none m-0 p-[6px] flex flex-col gap-[6px]">
          {items.map(item => {
            const defaultStyle = {
              background: 'var(--pill-bg)',
              color: 'var(--pill-text)'
            };

            const linkClasses =
              'block py-3 px-6 text-[15px] font-bold rounded-[50px] transition-all duration-200 ease-out uppercase tracking-wider text-center';

            return (
              <li key={item.href}>
                {isRouterLink(item.href) ? (
                  <Link
                    to={item.href}
                    className={linkClasses}
                    style={defaultStyle}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    className={linkClasses}
                    style={defaultStyle}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                )}
              </li>
            );
          })}
          <li className="flex flex-col items-center gap-4 py-4 border-t border-black/5 dark:border-white/10 mt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs uppercase font-bold tracking-tighter opacity-50">Theme</span>
              <AnimatedThemeToggler />
            </div>
            <ConnectButton
              client={client}
              wallets={wallets}
              theme={customTheme}
              chain={polygonAmoy}
              connectModal={{ size: 'compact' }}
              connectButton={{ 
                label: 'Connect Wallet',
                className: "btn-connect-navbar-mobile" 
              }}
              className="!rounded-full overflow-hidden shadow-md"
            />
          </li>
        </ul>
      </div>
    </div>
  );
}
