import React from 'react';

const footerLinks = [
  { label: 'About', href: '#about' },
  { label: 'How It Works', href: '#how' },
  { label: 'Features', href: '#features' },
  { label: 'Patient Stories', href: '#stories' },
  { label: 'Docs', href: '#' },
  { label: 'Privacy', href: '#' },
  { label: 'Contact', href: '#' },
];

const socials = [
  { label: '𝕏', href: '#' },
  { label: 'GH', href: '#' },
  { label: 'DC', href: '#' },
  { label: 'in', href: '#' },
];

export function FooterSection() {
  return (
    <footer className="relative z-10 w-full pt-10 pb-8 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Top row */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-12">
          {/* Brand */}
          <div className="max-w-xs">
            <img src="/logo.png" alt="MediChain Logo" className="h-10 md:h-14 w-auto object-contain mb-4" />
            <p className="mt-2 text-sm font-body text-muted-foreground leading-relaxed">
              Decentralized health records. Patient-owned. Blockchain-verified.
            </p>
          </div>

          {/* Links */}
          <ul className="flex flex-wrap gap-x-7 gap-y-3">
            {footerLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-[0.8rem] font-body text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Socials */}
          <div className="flex items-center gap-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-background border border-border text-muted-foreground text-xs font-bold hover:bg-muted hover:text-foreground transition-all duration-200 shadow-sm"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="border-t border-border/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[0.72rem] font-body text-muted-foreground">
            © 2026 MediChain. All records are patient-owned.
          </span>
          <div className="flex items-center gap-2 border border-border/60 bg-background/50 rounded-full px-3 py-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
            <span className="text-[0.7rem] font-body text-muted-foreground">Built on Polygon</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
