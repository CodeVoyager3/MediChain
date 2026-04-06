import React from 'react';
import { TwitterLogoIcon, GitHubLogoIcon, DiscordLogoIcon, LinkedInLogoIcon } from '@radix-ui/react-icons';

const footerLinks = [
  { label: 'About', href: '#about' },
  { label: 'How It Works', href: '#how' },
  { label: 'Features', href: '#features' },
  { label: 'Patient Stories', href: '#stories' },
  { label: 'Docs', href: '#docs' },
  { label: 'Privacy', href: '#' },
  { label: 'Contact', href: '#' },
];

const socials = [
  { name: 'X/Twitter', icon: TwitterLogoIcon, href: '#' },
  { name: 'GitHub', icon: GitHubLogoIcon, href: '#' },
  { name: 'Discord', icon: DiscordLogoIcon, href: '#' },
  { name: 'LinkedIn', icon: LinkedInLogoIcon, href: '#' },
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
                key={s.name}
                href={s.href}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-background border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 shadow-sm"
              >
                <s.icon className="hidden md:block w-4 h-4" />
                <s.icon className="md:hidden w-3.5 h-3.5" />
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
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-[0.7rem] font-body text-muted-foreground">Built on Polygon</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
