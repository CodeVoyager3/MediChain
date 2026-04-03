# MediChain Frontend — Project Context

> **Last Updated:** 2026-04-04
> **Status:** Active Development (Hackathon — Code Veda 2.0, ADGIPS)
> **Live Dev Server:** `http://localhost:5173` via `npm run dev`

---

## 1. What is MediChain?

MediChain is a **decentralized patient health records platform** powered by blockchain. It reimagines healthcare data management by:

- Minting every medical record as an **ERC-721 NFT** owned by the patient
- Storing encrypted files on **IPFS/Filecoin**
- Managing doctor permissions via **time-bound smart contracts** on **Polygon**
- Enabling **zero-fraud insurance verification** through on-chain hash checks

The system serves three user personas: **Patients**, **Doctors**, and **Insurers**.

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | React | 19.2.4 |
| **Build Tool** | Vite | 8.0.1 |
| **Styling** | TailwindCSS | 3.4.19 |
| **Component Library** | shadcn/ui (JSX, default style, slate base) | via `shadcn` CLI |
| **Animations** | Framer Motion | 12.38.0 |
| **Scroll Animations** | GSAP + ScrollTrigger | 3.14.2 |
| **Charts** | Chart.js + react-chartjs-2 | 4.5.1 / 5.3.1 |
| **Web3 / Wallet** | Thirdweb SDK | 5.119.3 |
| **Routing** | React Router DOM | 7.14.0 |
| **Icons** | Lucide React + Radix UI Icons | latest |
| **Typography** | Google Fonts: `Instrument Serif` (display) + `Inter` (body) | — |

---

## 3. Project Structure

```
Frontend/
├── index.html                  # Entry HTML — dark mode by default (class="dark")
├── .env                        # SECRET_KEY + VITE_CLIENT_ID (Thirdweb)
├── vite.config.js              # React plugin + "@" alias → ./src
├── tailwind.config.js          # Design tokens, custom animations (marquee, shimmer, etc.)
├── components.json             # shadcn/ui config (JSX, no RSC, slate base, CSS vars)
├── postcss.config.js           # PostCSS (tailwindcss + autoprefixer)
├── public/
│   ├── logo.png                # MediChain logo
│   ├── favicon.svg             # Favicon
│   └── icons.svg               # Icon sprite
└── src/
    ├── main.jsx                # React entry — StrictMode + ThirdwebProvider
    ├── App.jsx                 # BrowserRouter + Routes + conditional Navbar
    ├── index.css               # Tailwind directives + CSS custom properties (light/dark)
    ├── lib/
    │   └── utils.js            # cn() helper (clsx + tailwind-merge)
    ├── assets/                 # react.svg, vite.svg (unused defaults)
    └── components/
        ├── Navbar.jsx
        ├── HeroSection.jsx
        ├── DashboardPreview.jsx
        ├── MissionSection.jsx
        ├── ChallengesSection.jsx
        ├── CoreFeaturesSection.jsx
        ├── PlatformEcosystemSection.jsx
        ├── StatsSection.jsx
        ├── ArchitectureSection.jsx
        ├── HowItWorksSection.jsx
        ├── TestimonialsSection.jsx
        ├── CtaBannerSection.jsx
        ├── SiteFooter.jsx
        ├── ScrollReveal.jsx
        ├── ui/                 # shadcn/ui primitives
        │   ├── button.jsx
        │   ├── card.jsx
        │   ├── badge.jsx
        │   └── table.jsx
        ├── magicui/            # MagicUI / ReactBits components
        │   ├── animated-beam.jsx
        │   ├── animated-theme-toggler.jsx
        │   ├── bento-grid.jsx
        │   ├── magic-card.jsx
        │   ├── marquee.jsx
        │   ├── number-ticker.jsx
        │   ├── shimmer-button.jsx
        │   └── text-reveal.jsx
        └── dashboard/
            ├── PatientDashboard.jsx   # ✅ Fully built (646 lines)
            ├── DoctorDashboard.jsx    # ⚠️  Placeholder only
            └── InsurerDashboard.jsx   # ⚠️  Placeholder only
```

---

## 4. Routing

| Path | Component | Status |
|------|-----------|--------|
| `/` | `LandingPage` (full marketing page) | ✅ Complete |
| `/patient` | `PatientDashboard` | ✅ Fully built |
| `/doctor` | `DoctorDashboard` | ⚠️ Placeholder |
| `/insurer` | `InsurerDashboard` | ⚠️ Placeholder |

- The **Navbar** is only rendered on the landing page (`/`).
- Dashboard routes have their own internal sidebar navigation.

---

## 5. Design System

### Typography
- **Display font:** `Instrument Serif` (serif, used in headings — `font-display`)
- **Body font:** `Inter` (sans-serif, used everywhere else — `font-body`)

### Color Tokens (CSS Custom Properties via HSL)
| Token | Light | Dark |
|-------|-------|------|
| `--background` | `0 0% 100%` (white) | `222 20% 9%` (deep navy) |
| `--foreground` | `210 14% 17%` (dark gray) | `210 20% 96%` (off-white) |
| `--accent` | `239 84% 67%` (indigo/violet) | same |
| `--border` | `0 0% 90%` | `222 15% 18%` |
| `--muted` | `0 0% 96%` | `222 15% 14%` |

### Accent Color Palette Used in Components
- Violet/Purple: `#8B5CF6`, `#7C3AED` — primary accent, buttons, progress bars
- Blue: `#60a5fa` — doctor persona, architecture beam
- Emerald: `#34d399` — insurer persona, backend beam
- Amber: `#fbbf24` — warnings, IPFS node
- Rose/Red: error states, challenges section

### Animations (Tailwind Config)
- `fade-up` — scroll entrance
- `marquee` / `marquee-reverse` — testimonial marquee
- `shimmer-slide` + `spin-around` — shimmer button effect
- `shiny-text` — text shimmer animation

---

## 6. Landing Page Sections (in order)

1. **Navbar** — Fixed, glassmorphism, theme toggle, Thirdweb ConnectButton, mobile hamburger
2. **HeroSection** — Background video (CloudFront CDN), headline, ConnectButton CTA, DashboardPreview mockup
3. **MissionSection** — GSAP ScrollReveal word-by-word text animation
4. **ChallengesSection** — 4 problem cards in 3-col grid (2-1-1-2 span pattern)
5. **CoreFeaturesSection** — 3 MagicCard solution cards with gradient mouse-follow effect
6. **PlatformEcosystemSection** — 3 persona cards (Patient/Doctor/Insurer) with workflow lists
7. **StatsSection** — 3-stat row with NumberTicker animated counters
8. **ArchitectureSection** — AnimatedBeam diagram (React → Spring Boot → IPFS/Polygon)
9. **HowItWorksSection** — 4-step cards (Connect → Mint → Access → Verify)
10. **TestimonialsSection** — Dual-row Marquee with 6 testimonial cards
11. **CtaBannerSection** — Final CTA with ConnectButton + "Schedule a Demo", trust bar
12. **FooterSection** — Logo, nav links, social icons (Twitter, GitHub, Discord, LinkedIn)

---

## 7. Patient Dashboard (Deep Dive)

The Patient Dashboard (`/patient`) is the most developed internal page (~646 lines). It features:

### Layout
- **Sidebar** (240px, left) — Logo, collapsible, nav groups (Main/Features/General), "Blockchain Secured" CTA card
- **Header** (top) — Welcome greeting, date, Export button, search, notification bell, theme toggle, user avatar
- **Main content** (scrollable) — 2-row grid layout

### Row 1
- **Left (42%)** — MagicCard: Total Records count (NumberTicker), Upload Record (ShimmerButton), Grant Access, recent records list
- **Right (58%)** — Two stat cards (Verified Records, Active Access) + Bar Chart (Chart.js, monthly record overview)

### Row 2
- **Left (42%)** — Access Control card with doctor grants, progress bars, "Grant new access" CTA
- **Right (58%)** — Audit Log table with activity, date, doctor, and status badges

### Data
- All data is **mock/hardcoded** — no API calls or smart contract interactions yet
- Uses `useActiveAccount()` from Thirdweb to detect connected wallet

---

## 8. Web3 Integration

### Thirdweb SDK
- **Client ID:** Stored in `.env` as `VITE_CLIENT_ID`
- **Provider:** `ThirdwebProvider` wraps the entire app in `main.jsx`
- **ConnectButton** appears in: Navbar, HeroSection, CtaBannerSection
- **Supported wallets:**
  - MetaMask (`io.metamask`)
  - Coinbase Wallet (`com.coinbase.wallet`)
  - In-App Wallet (email, Google, Apple, Facebook, phone)
- **Hook used:** `useActiveAccount()` in PatientDashboard to detect connected wallet

### Smart Contracts (from README — not yet wired to frontend)
- `MedRecordNFT.sol` — ERC-721 medical record minting
- `AccessRegistry.sol` — Time-bound doctor access permissions
- `ClaimVerifier.sol` — Insurance claim hash verification
- **Chain:** Polygon Mumbai testnet

---

## 9. Key Dependencies

| Package | Purpose |
|---------|---------|
| `thirdweb` | Web3 wallet connection + blockchain interaction |
| `framer-motion` | Page animations, scroll-triggered entrances, AnimatePresence |
| `gsap` | ScrollTrigger-based word-by-word text reveal (ScrollReveal.jsx) |
| `chart.js` + `react-chartjs-2` | Bar chart in PatientDashboard |
| `lucide-react` | Primary icon set (used extensively) |
| `@radix-ui/react-icons` | Social icons in footer (Twitter, GitHub, Discord, LinkedIn) |
| `class-variance-authority` | shadcn/ui variant system for Button, Badge, etc. |
| `clsx` + `tailwind-merge` | `cn()` utility for conditional class merging |

---

## 10. What's Built vs. What's Missing

### ✅ Completed
- Full landing page with 12 polished sections
- Dark/light theme toggle with CSS variable system
- Responsive design (mobile hamburger menu, responsive grids)
- Thirdweb wallet connection (MetaMask, Coinbase, social login)
- Patient Dashboard with mock data, charts, sidebar nav
- Custom animation components (MagicCard, AnimatedBeam, Marquee, ScrollReveal, NumberTicker, ShimmerButton)

### ⚠️  Incomplete / Placeholder
- **Doctor Dashboard** — empty placeholder component
- **Insurer Dashboard** — empty placeholder component
- **No real API integration** — all data is hardcoded mock
- **No smart contract calls** — MedRecordNFT, AccessRegistry, ClaimVerifier not wired
- **No IPFS upload/retrieval** — no file encryption or storage
- **No backend connection** — Spring Boot backend not connected
- **No authentication flow** — wallet is connected but no JWT/session logic
- **No record minting flow** — Upload Record button is non-functional
- **No access grant/revoke flow** — UI exists but no on-chain transactions
- **Nav link anchors** — some hash links (`#about`, `#how`, etc.) may not scroll correctly

---

## 11. Environment Variables

| Variable | Purpose |
|----------|---------|
| `SECRET_KEY` | App secret (not prefixed with VITE_, not exposed to client) |
| `VITE_CLIENT_ID` | Thirdweb client ID for wallet connection |

---

## 12. How to Run

```bash
cd Frontend
npm install
npm run dev        # Starts Vite dev server at http://localhost:5173
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # ESLint
```

---

## 13. Conventions & Patterns

1. **Named exports** for landing page sections, **default exports** for dashboard pages
2. **shadcn/ui components** in `src/components/ui/` — Button, Card, Badge, Table
3. **MagicUI components** in `src/components/magicui/` — special effect components
4. **FadeIn wrapper** in `MissionSection.jsx` — reusable scroll-triggered Framer Motion animation (also exported)
5. **Stagger pattern** — container + child variants for grid animations
6. **Section labeling** — each section has a pill badge ("Our Mission", "Core Capabilities", etc.)
7. **Heading pattern** — `font-display` h2 with one `<span className="italic">` word for emphasis
8. **Thirdweb client** is instantiated per-component (Navbar, Hero, CTA) rather than shared — could be centralized
9. **Theme detection** in PatientDashboard uses `MutationObserver` on `<html>` class for real-time dark mode sync
