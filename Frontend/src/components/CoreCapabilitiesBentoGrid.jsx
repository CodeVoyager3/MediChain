import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

function BentoCard({ children, className, title, description }) {
  return (
    <Card
      className={cn(
        'group relative min-h-[340px] cursor-pointer overflow-hidden rounded-xl border p-0 shadow-none',
        'border-border/60 bg-card/90 backdrop-blur-sm',
        'dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-none',
        className,
      )}
    >
      <CardContent className="mb-6 flex h-[250px] w-full flex-1 items-center justify-center pt-2">
        {children}
      </CardContent>

      <CardFooter className="z-10 flex flex-col items-center justify-center gap-2 border-none bg-transparent pb-4 text-center">
        <h3 className="mx-auto line-clamp-2 text-center text-3xl font-medium leading-tight tracking-tight text-foreground dark:text-neutral-200">
          {title}
        </h3>

        <p className="mx-auto max-w-[280px] text-xs leading-tight text-muted-foreground dark:text-neutral-500">
          {description}
        </p>
      </CardFooter>
    </Card>
  );
}

function GlowingOrb({ color, className }) {
  return (
    <div
      className={cn(
        'absolute flex h-64 w-64 items-center justify-center transition-all duration-300 ease-out',
        className,
      )}
    >
      <motion.div
        className="absolute h-[152px] w-[152px] rounded-full opacity-10"
        style={{ backgroundColor: color }}
        animate={{
          opacity: [0, 0.1, 0],
        }}
        transition={{
          duration: 1,
          delay: 0.5,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatDelay: 0.5,
        }}
      />

      <motion.div
        className="absolute h-32 w-32 rounded-full opacity-15"
        style={{ backgroundColor: color }}
        animate={{
          opacity: [0, 0.15, 0],
        }}
        transition={{
          duration: 1,
          delay: 0.2,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatDelay: 0.5,
        }}
      />

      <div className="absolute h-[104px] w-[104px] rounded-full bg-neutral-800 shadow-lg dark:bg-black" />

      <div
        className="absolute h-20 w-20 rounded-full shadow-[inset_0px_4px_8px_0px_rgba(255,255,255,0.25),inset_0px_2px_1px_rgba(0,0,0,0.56),1px_2px_4px_2px_rgba(0,0,0,0.25)] dark:shadow-[inset_0px_4px_8px_0px_rgba(255,255,255,0.25),inset_0px_2px_1px_rgba(0,0,0,0.56),1px_2px_4px_2px_rgba(0,0,0,0.25)]"
        style={{
          background: `linear-gradient(to bottom, ${color}, ${color}90 )`,
        }}
      />
    </div>
  );
}

function KeysList() {
  return (
    <div className="grid grid-cols-6 gap-2 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_80%)]">
      {Array(18)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className="rounded-sm bg-gradient-to-b from-foreground/15 to-foreground/5 p-[1.5px] shadow-sm dark:from-white/20 dark:to-white/5 dark:shadow-[0_0_4px_rgba(0,0,0,0.5)]"
          >
            <div className="h-12 w-12 rounded-sm bg-muted dark:bg-neutral-900" />
          </div>
        ))}
    </div>
  );
}

function ArrowIcon(props) {
  return (
    <svg width="18" height="19" viewBox="0 0 18 19" fill="none" {...props}>
      <path
        d="M4.97062 18.3755L0.303955 0.375488L16.304 8.37549C8.30396 8.90882 5.41507 15.2644 4.97062 18.3755Z"
        className="fill-neutral-900 stroke-white dark:fill-black dark:stroke-white"
        strokeWidth="0.4"
      />
    </svg>
  );
}

function GetInfoButton() {
  return (
    <div className="relative flex items-center justify-center p-8">
      <div className="relative inline-flex items-center justify-center">
        <button
          type="button"
          className="relative z-10 rounded-full border-[8px] border-background bg-muted px-16 py-3 text-xl text-foreground shadow-[inset_2px_2px_8px_rgba(0,0,0,0.08),inset_1px_1px_1px_rgba(255,255,255,0.5)] dark:border-neutral-950 dark:bg-[#222325] dark:text-neutral-300 dark:shadow-[inset_2px_2px_8px_rgba(0,0,0,0.4),inset_1px_1px_1px_rgba(255,255,255,0.2)]"
        >
          Grant access
        </button>
      </div>
    </div>
  );
}

function BentoSource() {
  const [isHovering, setIsHovering] = React.useState(false);

  return (
    <Card
      className={cn(
        'group relative min-h-[340px] cursor-pointer overflow-hidden rounded-xl border p-0 shadow-none',
        'border-border/60 bg-card/90 backdrop-blur-sm',
        'dark:border-white/10 dark:bg-white/5',
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <CardContent className="mb-6 flex h-[250px] w-full flex-1 items-center justify-center pt-2">
        <div className="relative w-full max-w-[200px]">
          <div className="rounded-xl border border-border/50 bg-muted/50 p-4 shadow-inner dark:border-white/10 dark:bg-white/5">
            <div className="mb-3 flex items-center gap-1">
              <div className="size-7 rounded-full bg-foreground/15 dark:bg-white/20" />
              <div className="h-2 w-12 rounded-full bg-foreground/15 dark:bg-white/20" />
              <div className="h-2 w-20 rounded-full bg-foreground/15 dark:bg-white/20" />
            </div>

            <div className="mb-2 h-2 w-full rounded-full bg-foreground/15 dark:bg-white/20" />
            <div className="mb-6 h-2 w-2/3 rounded-full bg-foreground/15 dark:bg-white/20" />
          </div>

          <div className="absolute -bottom-6 left-1/2 z-20 -translate-x-1/2">
            <div className="relative rounded-full p-1 shadow-[inset_0px_0px_4px_0px_rgba(0,0,0,0.08)] dark:shadow-[inset_0px_0px_4px_0px_rgba(255,255,255,0.5)]">
              <div className="h-12 w-12 rounded-full bg-gradient-to-b from-primary to-primary/60 shadow-[inset_5px_10px_20px_rgba(255,255,255,0.15),inset_-10px_-15px_20px_rgba(0,0,0,0.15)] dark:from-cyan-400 dark:to-cyan-500/50 dark:shadow-[inset_5px_10px_20px_rgba(255,255,255,0.1),inset_-10px_-15px_20px_rgba(0,0,0,0.2)]" />

              <motion.div
                className="absolute -right-2 -bottom-2"
                animate={{
                  y: isHovering ? -2 : 0,
                  x: isHovering ? -50 : 0,
                }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <motion.div
                  animate={{
                    rotate: isHovering ? 45 : 0,
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <ArrowIcon />
                </motion.div>
                <motion.div
                  className="absolute -right-12 rounded-tr-2xl rounded-b-2xl bg-gradient-to-b from-primary to-primary/80 px-4 py-1 text-[10px] font-bold text-primary-foreground dark:from-cyan-400 dark:to-cyan-400/70 dark:text-black"
                  animate={{
                    opacity: isHovering ? 1 : 0.8,
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  Verified
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="z-10 flex flex-col items-center justify-center gap-2 border-none bg-transparent pb-4 text-center">
        <h3 className="mx-auto line-clamp-2 text-center text-3xl font-medium leading-tight tracking-tight text-foreground dark:text-neutral-200">
          Verified at Source
        </h3>

        <p className="mx-auto max-w-[280px] text-xs leading-tight text-muted-foreground dark:text-neutral-500">
          Provider-signed records and hashes insurers can trust—elevate integrity in every claim and handoff.
        </p>
      </CardFooter>
    </Card>
  );
}

const interests1 = [
  'Patient',
  'Doctor',
  'Insurer',
  'Hospital',
  'Lab',
  'Pharmacy',
  'Researcher',
  'Care team',
  'Specialist',
  'Clinic',
  'Payer',
];

const interests2 = [
  'Patient',
  'Doctor',
  'Insurer',
  'Hospital',
  'Lab',
  'Pharmacy',
  'Researcher',
  'Care team',
  'Specialist',
  'Clinic',
  'Payer',
];

const interests3 = [
  'Patient',
  'Doctor',
  'Insurer',
  'Hospital',
  'Lab',
  'Pharmacy',
  'Researcher',
  'Care team',
  'Specialist',
  'Clinic',
  'Payer',
];

function Row({ reverse = false, items, highlight }) {
  const loopItems = [...items, ...items];

  return (
    <div className="w-full overflow-hidden">
      <motion.div
        animate={{
          x: reverse ? ['-50%', '0%'] : ['0%', '-50%'],
        }}
        transition={{
          duration: 35,
          ease: 'linear',
          repeat: Infinity,
        }}
        className="flex w-max gap-4"
      >
        {loopItems.map((item, i) => (
          <div
            key={`${item}-${i}`}
            className={cn(
              'flex items-center whitespace-nowrap rounded-full border px-6 py-3 text-sm',
              'border-border/60 bg-muted/90 text-muted-foreground',
              'dark:border-white/10 dark:bg-neutral-800/80 dark:text-neutral-400',
              item === highlight &&
                'border-primary/30 bg-gradient-to-r from-primary/25 to-primary/15 text-foreground dark:border-white/10 dark:from-blue-600/40 dark:to-blue-300/50 dark:text-white',
            )}
          >
            <span className="mr-3 h-4 w-4 rounded-full bg-primary dark:bg-orange-500" />
            {item}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function InterestsMarquee() {
  return (
    <div className="relative overflow-hidden py-3">
      <div
        className="space-y-4"
        style={{
          maskImage:
            'radial-gradient(ellipse 50% 100% at 50% 50%, black 30%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 60% 100% at 50% 50%, black 10%, transparent 80%)',
        }}
      >
        <div className="opacity-80 blur-[1px]">
          <Row items={interests1} highlight="Doctor" />
        </div>

        <Row reverse items={interests2} highlight="Doctor" />

        <div className="opacity-80 blur-[1px]">
          <Row items={interests3} highlight="Doctor" />
        </div>
      </div>
    </div>
  );
}

function AuroraSvgBackground() {
  const uid = React.useId().replace(/:/g, '');

  return (
    <div className="absolute h-full w-full">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 420 303"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMin slice"
        className="pointer-events-none absolute top-8 opacity-100"
        aria-hidden
      >
        <g filter={`url(#${uid}_f0)`}>
          <path d="M90.5631 86L0 -22H424L354.019 86H90.5631Z" fill="#38C764" />
          <path
            d="M90.5631 86L0 -22H424L354.019 86H90.5631Z"
            fill="none"
            className="stroke-neutral-900 dark:stroke-black"
            strokeWidth="1"
          />
        </g>
        <g filter={`url(#${uid}_f1)`}>
          <path
            d="M107.5 82L15.5 -31H-24V203L107.5 116V82Z"
            fill={`url(#${uid}_p0)`}
          />
        </g>
        <g filter={`url(#${uid}_f2)`}>
          <path
            d="M87.7766 83.2016L23.3766 4.10156H-4.27344V167.902L87.7766 107.002V83.2016Z"
            fill={`url(#${uid}_p1)`}
          />
        </g>
        <g filter={`url(#${uid}_f3)`}>
          <path
            d="M337 82L429 -31H468.5V203L337 116V82Z"
            fill={`url(#${uid}_p2)`}
          />
        </g>
        <g filter={`url(#${uid}_f4)`}>
          <path
            d="M356.723 83.2016L421.123 4.10156H448.773V167.902L356.723 107.002V83.2016Z"
            fill={`url(#${uid}_p3)`}
          />
        </g>
        <defs>
          <filter
            id={`${uid}_f0`}
            x="-31.0718"
            y="-52.5"
            width="485.992"
            height="169"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur stdDeviation="15" result="effect1_foregroundBlur" />
          </filter>
          <filter
            id={`${uid}_f1`}
            x="-124"
            y="-131"
            width="331.5"
            height="434"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur stdDeviation="50" result="effect1_foregroundBlur" />
          </filter>
          <filter
            id={`${uid}_f2`}
            x="-39.2734"
            y="-30.8984"
            width="162.05"
            height="233.8"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur stdDeviation="17.5" result="effect1_foregroundBlur" />
          </filter>
          <filter
            id={`${uid}_f3`}
            x="237"
            y="-131"
            width="331.5"
            height="434"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur stdDeviation="50" result="effect1_foregroundBlur" />
          </filter>
          <filter
            id={`${uid}_f4`}
            x="321.723"
            y="-30.8984"
            width="162.05"
            height="233.8"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur stdDeviation="17.5" result="effect1_foregroundBlur" />
          </filter>
          <linearGradient id={`${uid}_p0`} x1="41.75" y1="-31" x2="41.75" y2="203" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1DBDD1" />
            <stop offset="1" stopColor="#0D454C" />
          </linearGradient>
          <linearGradient id={`${uid}_p1`} x1="41.7516" y1="4.10156" x2="41.7516" y2="167.902" gradientUnits="userSpaceOnUse">
            <stop stopColor="#11ACC4" />
            <stop offset="1" stopColor="#075966" />
          </linearGradient>
          <linearGradient id={`${uid}_p2`} x1="402.75" y1="-31" x2="402.75" y2="203" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1DBDD1" />
            <stop offset="1" stopColor="#0D454C" />
          </linearGradient>
          <linearGradient id={`${uid}_p3`} x1="402.748" y1="4.10156" x2="402.748" y2="167.902" gradientUnits="userSpaceOnUse">
            <stop stopColor="#11ACC4" />
            <stop offset="1" stopColor="#075966" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export function CoreCapabilitiesBentoGrid() {
  return (
    <section id="features" className="relative w-full bg-background overflow-hidden">
      {/* ── Subtle background texture ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 70% 50% at 50% 0%, hsl(var(--primary) / 0.05) 0%, transparent 65%)',
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 pb-20 pt-24 text-center">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 max-w-2xl mx-auto"
        >
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground tracking-tight mb-4">
            Core Capabilities
          </h2>
          <p className="text-lg text-muted-foreground font-body">
            Built on blockchain technology to revolutionize healthcare data management, security, and interoperability.
          </p>
        </motion.div>

        <div className="w-full px-0 py-6 font-sans md:px-2 md:py-8">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <BentoCard
          title="True Ownership"
          description="Records are minted and tied to your wallet—not a hospital server. You decide who sees what."
        >
          <KeysList />
          <GlowingOrb className="left-1/2 -translate-x-1/2" color="#BB3EC5" />
        </BentoCard>

        <BentoCard
          title="Smart Contract Access"
          description="Time-bound, revocable permissions. Clinicians only view data you explicitly authorize."
        >
          <AuroraSvgBackground />
          <GetInfoButton />
        </BentoCard>

        <BentoCard
          title="Zero Fraud"
          description="Insurers verify claims against on-chain proof. If it was not minted by a verified provider, it does not pass."
        >
          <KeysList />
          <GlowingOrb className="left-1/2 -translate-x-1/2" color="#42E7FE" />
        </BentoCard>

        <BentoSource />

        <BentoCard
          className="md:col-span-2"
          title="Stakeholder-aware by design"
          description="Patients, clinicians, payers, and partners each get a focused experience—without sacrificing shared truth on the ledger."
        >
          <InterestsMarquee />
        </BentoCard>
        </div>
      </div>
      </div>
    </section>
  );
}
