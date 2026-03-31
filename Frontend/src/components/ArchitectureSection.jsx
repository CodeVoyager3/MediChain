"use client"

import React, { useRef } from 'react';
import { AnimatedBeam } from './magicui/animated-beam';
import { motion } from 'framer-motion';
import { Database, Layout, Server, Link as LinkIcon } from 'lucide-react';

const Node = React.forwardRef(({ icon, label, sub, iconBg }, ref) => (
  <motion.div
    ref={ref}
    whileHover={{ scale: 1.06 }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    className="flex flex-col items-center gap-3 bg-background rounded-2xl border border-border/60 shadow-md px-5 py-4 cursor-default select-none"
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${iconBg}`}>
      {icon}
    </div>
    <div className="text-center">
      <p className="font-display text-base text-foreground whitespace-nowrap leading-snug">{label}</p>
      <p className="text-[10px] font-body text-muted-foreground uppercase tracking-widest mt-0.5">{sub}</p>
    </div>
  </motion.div>
));
Node.displayName = 'Node';

export function ArchitectureSection() {
  const containerRef = useRef(null);
  const frontendRef  = useRef(null);
  const backendRef   = useRef(null);
  const ipfsRef      = useRef(null);
  const blockchainRef = useRef(null);

  return (
    <section className="w-full bg-background py-24 px-6 flex justify-center overflow-hidden">
      <div className="w-full max-w-5xl flex flex-col items-center">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-4 py-1.5 text-xs text-muted-foreground font-body tracking-widest uppercase mb-5">
            Technical Specs
          </div>
          <h2 className="font-display text-4xl md:text-5xl text-foreground leading-tight">
            High-Level <span className="italic">Architecture</span>
          </h2>
        </motion.div>

        {/* Beam diagram */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative w-full max-w-3xl h-[340px] flex items-center justify-between px-8 rounded-3xl border border-border/50 bg-background/60"
          ref={containerRef}
          style={{ backdropFilter: 'blur(2px)' }}
        >
          {/* Subtle radial gradient backdrop */}
          <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,hsl(var(--muted)/0.4),transparent)] pointer-events-none" />

          {/* Nodes */}
          <div className="z-10">
            <Node
              ref={frontendRef}
              icon={<Layout className="w-5 h-5 text-blue-400" />}
              iconBg="bg-blue-400/10 border-blue-400/20"
              label="React"
              sub="Frontend"
            />
          </div>

          <div className="z-10">
            <Node
              ref={backendRef}
              icon={<Server className="w-5 h-5 text-emerald-400" />}
              iconBg="bg-emerald-400/10 border-emerald-400/20"
              label="Spring Boot"
              sub="The Engine"
            />
          </div>

          <div className="flex flex-col gap-10 z-10">
            <Node
              ref={ipfsRef}
              icon={<Database className="w-5 h-5 text-amber-400" />}
              iconBg="bg-amber-400/10 border-amber-400/20"
              label="IPFS"
              sub="The Vault"
            />
            <Node
              ref={blockchainRef}
              icon={<LinkIcon className="w-5 h-5 text-violet-400" />}
              iconBg="bg-violet-400/10 border-violet-400/20"
              label="Polygon"
              sub="The Ledger"
            />
          </div>

          {/* Beams */}
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={frontendRef}
            toRef={backendRef}
            pathColor="hsl(var(--border))"
            gradientStartColor="#60a5fa"
            gradientStopColor="#34d399"
            duration={4}
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={backendRef}
            toRef={ipfsRef}
            curvature={-50}
            pathColor="hsl(var(--border))"
            gradientStartColor="#34d399"
            gradientStopColor="#fbbf24"
            duration={4}
            delay={1}
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={backendRef}
            toRef={blockchainRef}
            curvature={50}
            pathColor="hsl(var(--border))"
            gradientStartColor="#34d399"
            gradientStopColor="#a78bfa"
            duration={4}
            delay={2}
          />
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap gap-6 mt-10 justify-center"
        >
          {[
            { label: 'React Frontend', color: 'bg-blue-400' },
            { label: 'Spring Boot Engine', color: 'bg-emerald-400' },
            { label: 'IPFS Storage', color: 'bg-amber-400' },
            { label: 'Polygon Ledger', color: 'bg-violet-400' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-xs font-body text-muted-foreground">
              <div className={`w-2 h-2 rounded-full ${item.color}`} />
              {item.label}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
