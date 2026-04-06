import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { MissionBentoCheckIcon } from './MissionBentoCheckIcon';
import { MissionBentoWires } from './MissionBentoWires';
import { MissionBentoCognito } from './MissionBentoCognito';
import { MissionBentoStar, MissionBentoStarIcon } from './MissionBentoStar';

const CARD_BASE =
  'relative flex h-[30rem] w-full max-w-[340px] flex-col gap-0 rounded-3xl border p-0 text-foreground shadow-none ring-0 ' +
  'border-border/50 bg-gradient-to-br from-primary/[0.2] via-muted to-card ' +
  'dark:border-transparent dark:bg-gradient-to-br dark:from-[#304043] dark:via-[#454C4D] dark:to-[#273334] dark:text-white';

const DEVICE_OUTER =
  'relative flex h-[6.25rem] w-40 rounded-[30px] border-[3px] border-[hsl(var(--foreground)/0.12)] bg-gradient-to-br from-muted/95 to-primary/[0.06] ' +
  'shadow-[inset_3px_2px_4px_1px_rgba(255,255,255,0.35),0px_22px_28px_-4px_rgba(0,0,0,0.08)] ' +
  'dark:border-[#1B2526] dark:from-[#273439] dark:to-[#2C3D42] dark:shadow-[inset_3px_2px_4px_1px_rgba(255,255,255,0.25),0px_22px_28px_-4px_rgba(0,0,0,0.3)]';

const TITLE_CLS = 'text-lg font-medium text-foreground dark:text-white';
const DESC_CLS = 'text-base font-light text-muted-foreground dark:text-white/90';

export function MissionBentoCards() {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const cycle = setInterval(() => {
      setStatus((prev) => (prev === 'loading' ? 'complete' : 'loading'));
    }, 3000);
    return () => clearInterval(cycle);
  }, []);

  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 justify-items-center gap-8 md:grid-cols-2 lg:grid-cols-3">
      {/* Card 1 — Patient ownership */}
      <Card className={cn(CARD_BASE, 'overflow-hidden')}>
        <CardContent className="relative flex h-full w-full flex-col items-center justify-center p-0">
          <div className={cn(DEVICE_OUTER)}>
            <MissionBentoWires className="absolute top-1/2 -right-[6.25rem] -translate-y-1/2" />
            <MissionBentoWires className="absolute top-1/2 -left-[5.5rem] -translate-y-1/2 -scale-x-100" />

            <div className="my-auto ml-6 w-fit rounded-full bg-gradient-to-br from-primary/30 to-muted p-px dark:from-[#69797F] dark:to-[#27353A]">
              <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-muted-foreground/25 to-primary/15 text-foreground dark:from-[#535E61] dark:to-[#313E40] dark:text-white">
                <MissionBentoCheckIcon className="size-8" status={status} />
              </div>
            </div>

            <div className="absolute top-1/2 -right-6 flex h-fit -translate-y-1/2 items-center justify-center rounded-2xl border border-border bg-gradient-to-br from-muted/90 to-primary/[0.06] p-1 shadow-[0px_22px_28px_-4px_rgba(0,0,0,0.12),inset_-1px_0px_12px_1px_rgba(0,0,0,0.08)] dark:border-[#58696F] dark:from-[#273439] dark:to-[#2C3D42] dark:shadow-[0px_22px_28px_-4px_rgba(0,0,0,0.3),inset_-1px_0px_12.6px_1px_rgba(0,0,0,0.3)]">
              <div className="relative flex h-full w-full items-center justify-center">
                <motion.div
                  animate={{ x: status === 'loading' ? -43 : 0 }}
                  transition={{ type: 'spring', bounce: 0.3, duration: 1 }}
                  className="absolute top-1/2 right-0 -translate-y-1/2 rounded-xl border border-border bg-muted/90 px-[22px] py-7 shadow-[0px_22px_28px_-4px_rgba(0,0,0,0.12),inset_-1px_0px_12px_1px_rgba(0,0,0,0.08)] dark:border-[#A7B5BA] dark:bg-[#273439] dark:shadow-[0px_22px_28px_-4px_rgba(0,0,0,0.3),inset_-1px_0px_12.6px_1px_rgba(0,0,0,0.3)]"
                />
                <div className="relative z-40 px-4 py-4 text-xl text-foreground dark:text-white">A</div>
                <div className="relative z-40 px-4 py-4 text-xl text-foreground dark:text-white">B</div>
              </div>
            </div>
          </div>
          <div className="h-8 w-[3.75rem] bg-gradient-to-b from-foreground/[0.08] to-muted dark:from-[#131617] dark:to-[#283133]" />
        </CardContent>

        <CardHeader className="mt-auto w-full p-8">
          <CardTitle className={TITLE_CLS}>Patient ownership</CardTitle>
          <CardDescription className={DESC_CLS}>
            Records minted as ERC-721 NFTs — tied to your wallet, not a hospital server.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Card 2 — Smart contract access */}
      <Card className={cn(CARD_BASE, 'overflow-visible')}>
        <CardContent className="absolute -top-16 left-1/2 flex h-full w-full -translate-x-1/2 items-center justify-center p-0">
          <MissionBentoCognito className="max-h-[min(100%,380px)] w-full max-w-[340px]" />
        </CardContent>
        <CardHeader className="relative z-10 mt-auto w-full p-8">
          <CardTitle className={TITLE_CLS}>Smart contract access</CardTitle>
          <CardDescription className={DESC_CLS}>
            Doctors request time-bound, cryptographic access. Revoke instantly on-chain.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Card 3 — Zero fraud */}
      <Card className={cn(CARD_BASE, 'overflow-hidden md:col-span-2 lg:col-span-1')}>
        <CardContent className="relative flex h-full w-full items-center justify-center p-0">
          <MissionBentoStar className="max-h-[260px] max-w-[260px] text-foreground dark:text-inherit" />

          <div className="absolute flex flex-col items-center gap-8">
            <div className="rounded-full border border-border bg-gradient-to-br from-muted-foreground/25 to-primary/15 px-8 py-2 shadow-[0px_18px_14px_-3px_rgba(0,0,0,0.15)] dark:border-[#69797F] dark:from-[#535E61] dark:to-[#313E40] dark:shadow-[0px_18px_14px_-3px_rgba(0,0,0,0.4)]">
              <MissionBentoStarIcon className="size-4" />
            </div>

            <div className="relative flex h-[8.75rem] w-40 items-center justify-between rounded-[36px] border-[3px] border-[hsl(var(--foreground)/0.12)] bg-gradient-to-br from-muted/95 to-primary/[0.06] p-4 shadow-[inset_3px_2px_4px_1px_rgba(255,255,255,0.35),0px_22px_28px_-4px_rgba(0,0,0,0.08)] dark:border-[#1B2526] dark:from-[#273439] dark:to-[#2C3D42] dark:shadow-[inset_3px_2px_4px_1px_rgba(255,255,255,0.25),0px_22px_28px_-4px_rgba(0,0,0,0.3)]">
              <div className="relative h-[4.5rem] w-[3.75rem] rounded-xl border border-border bg-gradient-to-br from-muted-foreground/20 to-primary/10 shadow-[0px_18px_14px_-3px_rgba(0,0,0,0.12)] dark:border-[#69797F] dark:from-[#535E61] dark:to-[#313E40] dark:shadow-[0px_18px_14px_-3px_rgba(0,0,0,0.4)]">
                <div className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center text-foreground dark:text-white">
                  <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-8"
                    aria-hidden
                  >
                    <motion.path
                      d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"
                      stroke="currentColor"
                      initial={false}
                      animate={{
                        pathLength: [0, 1, 0],
                        fill: [
                          'rgba(96, 126, 188, 0)',
                          'rgba(96, 126, 188, 0.35)',
                          'rgba(96, 126, 188, 0)',
                        ],
                      }}
                      transition={{
                        duration: 2.2,
                        ease: 'easeInOut',
                        repeat: Infinity,
                        repeatType: 'loop',
                      }}
                    />
                    <motion.path
                      d="M20 2v4"
                      stroke="currentColor"
                      initial={false}
                      animate={{ pathLength: [0, 1, 0] }}
                      transition={{
                        duration: 1.2,
                        ease: 'easeInOut',
                        repeat: Infinity,
                        repeatType: 'loop',
                        delay: 0.2,
                      }}
                    />
                    <motion.path
                      d="M22 4h-4"
                      stroke="currentColor"
                      initial={false}
                      animate={{ pathLength: [0, 1, 0] }}
                      transition={{
                        duration: 1.2,
                        ease: 'easeInOut',
                        repeat: Infinity,
                        repeatType: 'loop',
                        delay: 0.2,
                      }}
                    />
                    <motion.circle
                      cx="4"
                      cy="20"
                      r="2"
                      fill="currentColor"
                      initial={false}
                      animate={{
                        r: [0, 2, 0],
                        fill: [
                          'rgba(96, 126, 188, 0)',
                          'rgba(96, 126, 188, 0.4)',
                          'rgba(96, 126, 188, 0)',
                        ],
                      }}
                      transition={{
                        duration: 1.6,
                        ease: 'easeInOut',
                        repeat: Infinity,
                        repeatType: 'loop',
                        delay: 0.5,
                      }}
                    />
                  </motion.svg>
                </div>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="h-1 w-8 rounded-full bg-muted-foreground/50 dark:bg-[#80949A]" />
                <div className="h-1 w-12 rounded-full bg-muted-foreground/35 dark:bg-[#535E61]" />
                <div className="h-1 w-12 rounded-full bg-muted-foreground/35 dark:bg-[#535E61]" />
                <div className="h-1 w-12 rounded-full bg-muted-foreground/35 dark:bg-[#535E61]" />
              </div>
            </div>

            <div className="flex flex-col items-center gap-0.5 rounded-full border border-border bg-gradient-to-br from-muted-foreground/20 to-primary/10 px-8 py-2 shadow-[0px_18px_14px_-3px_rgba(0,0,0,0.12)] dark:border-[#69797F] dark:from-[#535E61] dark:to-[#313E40] dark:shadow-[0px_18px_14px_-3px_rgba(0,0,0,0.4)]">
              <div className="h-1 w-8 rounded-full bg-muted-foreground/50 dark:bg-[#80949A]" />
              <div className="h-1 w-12 rounded-full bg-muted-foreground/35 dark:bg-[#535E61]" />
            </div>
          </div>
        </CardContent>

        <CardHeader className="mt-auto w-full p-8">
          <CardTitle className={TITLE_CLS}>Zero fraud</CardTitle>
          <CardDescription className={DESC_CLS}>
            Insurers verify claims via immutable blockchain hash. Forgery is mathematically impossible.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
