import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Lock, ShieldAlert, FileWarning, Hospital, Activity, Syringe, HeartPulse } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

const ChallengesSection = () => {
  return (
    <section id="challenges" className="relative flex min-h-screen items-center justify-center overflow-x-hidden bg-background py-20 px-6 font-sans text-foreground md:p-10 lg:p-12">
      <div className="mx-auto w-full max-w-7xl">

        {/* Section Header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground tracking-tight mb-4"
          >
            The Healthcare System is Broken.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground font-body"
          >
            Traditional systems rely on centralized silos, stripping patients of control and costing billions in fraud and redundancies. Here is what we are fixing.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">

          {/* Card 1: Fragmented Data (Large Top Left) */}
          <Card className="group flex h-full flex-col gap-0 overflow-hidden rounded-2xl border border-border/40 bg-card/40 p-0 text-foreground shadow-2xl ring-0 transition-all duration-300 hover:border-border/80 md:col-span-12 lg:col-span-7 md:lg:rounded-tl-[40px]">
            <CardContent className="relative flex w-full flex-1 flex-col items-center justify-center p-0 md:max-h-[320px]">
              <Card1 />
            </CardContent>

            <CardFooter className="relative z-10 flex w-full flex-col border-none bg-transparent bg-gradient-to-t from-background via-background/90 to-transparent p-6 pt-12 pb-8 text-center sm:p-6 sm:pt-0">
              <h3 className="mb-2 text-2xl font-bold font-display">Fragmented Data Silos</h3>
              <p className="mx-auto max-w-sm text-sm text-muted-foreground font-body">
                Patient history is scattered across different hospitals. 70% of Indian patients cannot produce a complete medical history at the point of care.
              </p>
            </CardFooter>
          </Card>

          {/* Card 2: No Data Ownership (Top Right) */}
          <Card className="group flex h-full flex-col gap-0 overflow-hidden rounded-2xl border border-border/40 bg-card/40 p-0 text-foreground shadow-2xl ring-0 transition-all duration-300 hover:border-border/80 md:col-span-12 lg:col-span-5 md:lg:rounded-tr-[40px]">
            <CardContent className="relative flex min-h-[300px] w-full flex-1 flex-col items-center justify-center p-0 md:min-h-[320px]">
              <Card2 />
            </CardContent>

            <CardFooter className="relative z-10 flex w-full flex-col border-none bg-gradient-to-t from-background via-background/90 to-transparent p-6 pb-8 text-center">
              <h3 className="mb-2 text-2xl font-bold font-display">Zero Patient Control</h3>
              <p className="mx-auto max-w-sm text-sm text-muted-foreground font-body">
                Patients do not truly "own" their records—hospitals do. You need permission to access your own personal history.
              </p>
            </CardFooter>
          </Card>

          {/* Card 3: Vulnerable DBs (Bottom Left) */}
          <Card className="group flex h-full flex-col gap-0 overflow-hidden rounded-2xl border border-border/40 bg-card/40 p-0 text-foreground shadow-xl ring-0 transition-all duration-300 hover:border-border/80 md:col-span-6 lg:col-span-4 md:lg:rounded-bl-[40px]">
            <CardContent className="flex min-h-[240px] w-full flex-1 flex-col items-center justify-center py-6 md:min-h-[280px]">
              <Card3 />
            </CardContent>
            <CardFooter className="mt-auto flex w-full flex-col border-none bg-transparent p-6 pb-8 text-center">
              <h3 className="mb-2 text-xl font-bold font-display">Centralized Honeypots</h3>
              <p className="mx-auto max-w-[220px] text-sm text-muted-foreground font-body">
                Centralized databases are prime targets. Healthcare breaches increased by 256% over the last five years.
              </p>
            </CardFooter>
          </Card>

          {/* Card 4: Ecosystem Connection (Bottom Middle) */}
          <Card className="group flex h-full flex-col gap-0 overflow-hidden rounded-2xl border border-border/40 bg-card/40 p-0 text-foreground shadow-xl ring-0 transition-all duration-300 hover:border-border/80 md:col-span-6 lg:col-span-4">
            <CardContent className="relative flex min-h-[240px] w-full flex-1 flex-col items-center justify-center p-0 md:min-h-[280px]">
              <Card4 />
            </CardContent>
            <CardFooter className="mt-auto flex w-full flex-col border-none bg-transparent p-6 pb-8 text-center">
              <h3 className="mb-2 text-xl font-bold font-display">Interoperability Failure</h3>
              <p className="mx-auto max-w-[220px] text-sm text-muted-foreground font-body">
                Systems refuse to talk to each other. MediChain unites patients, doctors, and insurers on a single truth.
              </p>
            </CardFooter>
          </Card>

          {/* Card 5: Insurance Fraud (Bottom Right) */}
          <Card className="group flex h-full flex-col gap-0 overflow-hidden rounded-2xl border border-border/40 bg-card/40 p-0 text-foreground shadow-xl ring-0 transition-all duration-300 hover:border-border/80 md:col-span-12 lg:col-span-4 md:lg:rounded-br-[40px]">
            <CardContent className="relative flex min-h-[240px] w-full flex-1 flex-col items-center justify-center p-8 py-6 md:min-h-[280px]">
              <Card5 />
            </CardContent>
            <CardFooter className="flex w-full flex-col border-none bg-transparent p-6 pb-8 text-center">
              <h3 className="mb-2 text-xl font-bold font-display">Insurance Fraud</h3>
              <p className="mx-auto max-w-[260px] text-sm text-muted-foreground font-body">
                Fabricated bills and forged prescriptions cost the insurance industry billions globally every single year.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Background Subtle Effects */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[20%] left-[10%] h-[400px] w-[400px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute right-[10%] bottom-[20%] h-[350px] w-[350px] rounded-full bg-accent/5 blur-[120px]" />
      </div>
    </section>
  );
};

export { ChallengesSection };

/* -------------------------------------------------------------------------- */
/* Sub-components for Cards                                                   */
/* -------------------------------------------------------------------------- */

const Card1 = () => {
  const [activeTab, setActiveTab] = useState('current');

  return (
    <div
      className="h-full w-[92%] translate-y-6 transform overflow-hidden rounded-tl-xl rounded-tr-xl border-x border-t border-border/40 bg-card mask-b-from-90% md:w-[85%]"
      onMouseEnter={() => setActiveTab('medichain')}
      onMouseLeave={() => setActiveTab('current')}
    >
      <div className="flex h-10 w-full items-center justify-start gap-2 border-b border-border/40 pl-4">
        <span className="size-2 rounded-full bg-border/40" />
        <span className="size-2 rounded-full bg-border/40" />
        <span className="size-2 rounded-full bg-border/40" />
      </div>

      <div className="flex h-12 w-full items-center justify-between gap-2 border-b border-border/40 px-4 md:px-6">
        <div className="flex shrink-0 items-center justify-center gap-2">
          <Database className="size-5 text-primary md:size-6" />
          <p className="text-base font-semibold text-primary md:text-lg font-display">
            Record Retrieval
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 py-2 md:gap-5 md:px-6 border-b border-border/20">
        <button
          className={`border-b-2 py-1 text-xs font-semibold font-body transition-all duration-300 md:text-sm ${activeTab === 'current'
            ? 'border-rose-500 text-foreground'
            : 'border-transparent text-muted-foreground hover:text-foreground/80'
            }`}
        >
          Traditional System
        </button>
        <button
          className={`border-b-2 py-1 text-xs font-semibold font-body transition-all duration-300 md:text-sm ${activeTab === 'medichain'
            ? 'border-emerald-500 text-foreground'
            : 'border-transparent text-muted-foreground hover:text-foreground/80'
            }`}
        >
          MediChain Vault
        </button>
      </div>

      <div className="flex h-[150px] w-full flex-col px-4 pt-2 pb-4 md:h-[180px] md:px-6">
        <AnimatePresence mode="wait">
          {activeTab === 'current' ? (
            <motion.div
              key="current"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="flex flex-col items-start justify-center gap-4 h-full"
            >
              <div className="flex items-center gap-3 w-full p-3 rounded-lg border border-rose-500/20 bg-rose-500/5">
                <Hospital className="text-rose-500 w-5 h-5" />
                <div>
                  <p className="text-xs font-bold text-rose-500 uppercase tracking-wider">Apollo Hospital DB</p>
                  <p className="text-sm text-muted-foreground">Blood Test 2024 - <span className="text-xs italic">Inaccessible</span></p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full p-3 rounded-lg border border-rose-500/20 bg-rose-500/5">
                <Activity className="text-rose-500 w-5 h-5" />
                <div>
                  <p className="text-xs font-bold text-rose-500 uppercase tracking-wider">City Clinic Server</p>
                  <p className="text-sm text-muted-foreground">MRI Scan 2025 - <span className="text-xs italic">Inaccessible</span></p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="medichain"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="flex flex-col items-center justify-center gap-4 h-full"
            >
              <div className="flex items-center gap-3 w-full p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 shadow-inner">
                <div className="p-2 bg-emerald-500/20 rounded-md">
                  <Database className="text-emerald-500 w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Patient Web3 Wallet</p>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">Synced</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">All records securely fetched from IPFS via Polygon Smart Contract.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};


const Card2 = () => {
  return (
    <div className="group relative h-[280px] w-[90%] md:w-[95%] overflow-hidden rounded-xl border border-border/40 bg-muted/10 shadow-xl transition-all duration-500 hover:border-primary/20">
      <img
        src="/patientZeroRecords.png"
        alt="Patient Zero Records"
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
    </div>
  );
};

const Card3 = () => {
  return (
    <ShieldAlert className="size-40 text-rose-500/20 transition-all duration-300 ease-out hover:size-45 hover:text-rose-500" />
  );
};

const Card5 = () => {
  const items = [
    { title: 'Fabricated Bills', desc: 'Hospitals inflating patient charges.' },
    { title: 'Forged Prescriptions', desc: 'Invalid claims submitted for payout.' },
    { title: 'Identity Theft', desc: 'Treatments claimed under stolen IDs.' },
  ];

  return (
    <div className="relative w-full max-w-[280px] px-4">
      <div className="absolute top-4 bottom-4 left-[24px] w-px bg-border/40" />

      <motion.div
        className="absolute left-[24px] z-0 h-16 w-px bg-gradient-to-b from-transparent via-rose-500 to-transparent"
        animate={{
          top: ['-5%', '85%'],
          opacity: [0, 1, 1, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      <div className="space-y-4">
        {items.map((item, i) => (
          <TimelineItem key={i} index={i} title={item.title} desc={item.desc} />
        ))}
      </div>
    </div>
  );
};

const TimelineItem = ({ index, title, desc }) => {
  const syncDelay = index * 1.5;
  const syncDuration = 2;

  return (
    <div className="group relative flex items-center gap-6">
      <div className="relative shrink-0">
        <motion.div
          className="relative z-10 size-4 rounded-full bg-rose-600"
          animate={{
            scale: [1, 1.2, 1],
            boxShadow: [
              '0 0 10px rgba(225, 29, 72, 0.4)',
              '0 0 20px rgba(225, 29, 72, 0.8)',
              '0 0 10px rgba(225, 29, 72, 0.4)',
            ],
          }}
          transition={{
            duration: syncDuration,
            repeat: Infinity,
            delay: syncDelay,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute inset-0 size-4 rounded-full border border-rose-500/50"
          animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
          transition={{
            duration: syncDuration,
            repeat: Infinity,
            delay: syncDelay,
            ease: 'easeOut',
          }}
        />
      </div>

      <div className="group relative flex flex-1 flex-col overflow-hidden rounded-xl border border-border/40 bg-card/50 p-3 backdrop-blur-sm">
        <div className="pointer-events-none absolute inset-0 bg-rose-500/5" />
        <span className="z-10 mb-1 text-sm font-bold text-foreground">
          {title}
        </span>
        <span className="z-10 text-[11px] leading-relaxed font-medium text-muted-foreground">
          {desc}
        </span>
      </div>
    </div>
  );
};

// Generic Icons for Orbiting Network
const NetworkIcon1 = ({ className }) => <Hospital className={className} />;
const NetworkIcon2 = ({ className }) => <Activity className={className} />;
const NetworkIcon3 = ({ className }) => <Syringe className={className} />;
const NetworkIcon4 = ({ className }) => <HeartPulse className={className} />;
const NetworkIcon5 = ({ className }) => <FileWarning className={className} />;

const Card4 = () => {
  const icons = [
    { component: NetworkIcon1, color: '#3b82f6' },
    { component: NetworkIcon2, color: '#10b981' },
    { component: NetworkIcon3, color: '#f59e0b' },
    { component: NetworkIcon4, color: '#ef4444' },
    { component: NetworkIcon5, color: '#8b5cf6' },
  ];

  return (
    <div className="relative flex h-[260px] w-full items-center justify-center overflow-hidden select-none">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="size-[180px] rounded-full border border-border/40" />
        <div className="absolute size-[110px] rounded-full border border-border/20" />
        <div className="absolute size-40 rounded-full bg-primary/10 blur-[60px]" />
      </div>

      <motion.div
        className="relative z-10"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="bg-primary p-4 rounded-xl shadow-lg shadow-primary/20">
          <span className="font-bold text-primary-foreground font-display tracking-tight text-xl">MediChain</span>
        </div>
      </motion.div>

      <div className="absolute inset-0 flex items-center justify-center">
        {icons.map((item, i) => (
          <OrbitingElement
            key={i}
            index={i}
            total={icons.length}
            IconComponent={item.component}
            color={item.color}
          />
        ))}
      </div>
    </div>
  );
};

const OrbitingElement = ({ index, total, IconComponent, color }) => {
  const [radius, setRadius] = useState(105);

  useEffect(() => {
    const updateRadius = () => {
      setRadius(window.innerWidth < 640 ? 70 : 90);
    };
    updateRadius();
    window.addEventListener('resize', updateRadius);
    return () => window.removeEventListener('resize', updateRadius);
  }, []);

  const initialAngle = (index / total) * 360;
  const duration = 25; // Slowed down slightly for calmer effect

  return (
    <motion.div
      className="absolute flex items-center justify-center"
      animate={{ rotate: [initialAngle, initialAngle + 360] }}
      transition={{ duration, repeat: Infinity, ease: 'linear' }}
      style={{ width: 0, height: 0 }}
    >
      <motion.div
        className="absolute z-20 flex cursor-pointer items-center justify-center rounded-full border border-border/40 bg-card p-3 shadow-lg"
        animate={{ rotate: [-initialAngle, -(initialAngle + 360)] }}
        transition={{ duration, repeat: Infinity, ease: 'linear' }}
        style={{ x: radius }}
        whileHover={{
          scale: 1.25,
          borderColor: color,
          backgroundColor: `${color}10`,
          boxShadow: `0 0 20px ${color}30`,
          zIndex: 50,
          color: color
        }}
      >
        <IconComponent className="size-6 text-muted-foreground" />
      </motion.div>
    </motion.div>
  );
};
