import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { PlatformEcosystemBentoOne } from './PlatformEcosystemBentoOne';
import { PlatformEcosystemBentoTwo } from './PlatformEcosystemBentoTwo';
import { PlatformEcosystemBentoThree } from './PlatformEcosystemBentoThree';

const LOOPING_TEXTS = ['Advanced', 'Fastest', 'Performance'];

function LoopingText() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % LOOPING_TEXTS.length);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className={cn(
        'mx-auto flex w-28 translate-y-[11.25rem] items-center justify-center overflow-hidden rounded-full px-4 py-2 text-sm font-medium',
        'bg-muted text-foreground ring-1 ring-inset ring-border/60 dark:ring-border/40',
      )}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={LOOPING_TEXTS[index]}
          initial={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 1.1, filter: 'blur(4px)' }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="whitespace-nowrap"
        >
          {LOOPING_TEXTS[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function GradientFrame({ children, className }) {
  return (
    <div
      className={cn(
        'w-full min-w-0 flex-1 basis-0 rounded-2xl bg-gradient-to-t p-px',
        'md:min-w-[300px] md:flex-none md:snap-center',
        'lg:min-w-0 lg:flex-1',
        'from-primary/35 via-border/60 to-muted/80',
        'dark:from-primary/25 dark:via-border/50 dark:to-card/90',
        className,
      )}
    >
      {children}
    </div>
  );
}

function InnerCard({ className, ...props }) {
  return (
    <Card
      className={cn(
        'relative flex h-[400px] w-full flex-col justify-between gap-0 overflow-hidden rounded-[15px] border-0 bg-card p-0 text-card-foreground shadow-none ring-0',
        className,
      )}
      {...props}
    />
  );
}

export function PlatformEcosystemBentoGrid({ className }) {
  const twoUid = React.useId().replace(/:/g, '');

  return (
    <div
      className={cn(
        'relative flex w-full items-center justify-center px-2 py-10 sm:px-4 lg:px-6',
        'bg-muted/25 dark:bg-muted/10',
        className,
      )}
    >
      <div
        className={cn(
          'mx-auto flex h-full w-full max-w-[1400px] flex-col items-stretch justify-center gap-6',
          'md:flex-row md:flex-nowrap md:gap-4 md:overflow-x-auto md:pb-2 md:snap-x md:snap-mandatory md:[scrollbar-width:thin]',
          'lg:overflow-visible lg:pb-0 xl:gap-6',
        )}
      >
        {/* Box-1 */}
        <GradientFrame>
          <InnerCard>
            <div className="absolute -top-[7.5rem] left-0 origin-top-left scale-[0.85] sm:scale-100">
              <PlatformEcosystemBentoOne className="size-[36.25rem] max-w-none text-muted-foreground" />
            </div>
            <CardFooter className="relative z-20 mt-auto w-full flex-col items-start border-none bg-transparent px-8 pb-8 pt-0">
              <CardTitle className="text-xl font-bold text-foreground">
                Your wallet, your record
              </CardTitle>
              <CardDescription className="mt-4 text-[14px] font-medium text-muted-foreground">
                Connect once and carry a unified, patient-owned history—minted, encrypted, and tied to you—not a siloed
                hospital login.
              </CardDescription>
            </CardFooter>
          </InnerCard>
        </GradientFrame>

        {/* Box-2 */}
        <GradientFrame>
          <InnerCard>
            <CardContent className="absolute left-0 top-0 z-30 h-[250px] w-full origin-top p-0 sm:scale-100">
              <PlatformEcosystemBentoTwo uid={twoUid} className="h-full w-full" />
            </CardContent>
            <div className="absolute left-1/2 top-40 h-10 w-[min(90vw,22.5rem)] -translate-x-1/2 rounded-full bg-primary/35 blur-2xl dark:bg-primary/40" />
            <div className="absolute left-1/2 top-40 h-10 w-[min(90vw,22.5rem)] -translate-x-1/2 rounded-full bg-primary/70 blur-2xl dark:bg-primary/85" />
            <img
              src="https://assets.watermelon.sh/Globe.svg"
              alt=""
              className="absolute left-1/2 top-40 z-20 size-80 -translate-x-1/2 -translate-y-1/2 opacity-90"
            />
            <CardFooter className="relative z-20 mt-auto w-full flex-col items-start border-none bg-transparent px-8 pb-8 pt-0">
              <CardTitle className="text-xl font-bold text-foreground">
                One mesh, every stakeholder
              </CardTitle>
              <CardDescription className="mt-4 text-[14px] font-medium text-muted-foreground">
                Patients, clinicians, and payers move on the same rails—time-bound access, verifiable events, and a
                shared source of truth on-chain.
              </CardDescription>
            </CardFooter>
          </InnerCard>
        </GradientFrame>

        {/* Box-3 */}
        <GradientFrame>
          <InnerCard>
            <CardContent className="absolute -top-20 left-1/2 origin-top -translate-x-1/2 scale-[0.85] p-0 sm:scale-100">
              <div
                className="mx-auto h-20 w-full translate-y-72 bg-card sm:h-16 sm:translate-y-[17.5rem]"
                style={{
                  maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
                }}
              />
              <LoopingText />
              <PlatformEcosystemBentoThree className="size-80" />
            </CardContent>

            <CardFooter className="relative z-30 mt-auto w-full flex-col items-start border-none bg-card px-8 pb-8 pt-6">
              <CardTitle className="text-xl font-bold text-foreground">
                Performance you can trust
              </CardTitle>
              <CardDescription className="mt-4 text-[14px] font-medium text-muted-foreground">
                From waiting-room check-in to insurer verification—fast reads, crisp UX, and an audit trail that stays
                intact as care scales.
              </CardDescription>
            </CardFooter>
          </InnerCard>
        </GradientFrame>
      </div>
    </div>
  );
}
