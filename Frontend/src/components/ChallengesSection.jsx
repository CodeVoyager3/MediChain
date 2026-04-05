import React from 'react';
import {
  Database, Lock, ShieldAlert, FileWarning,
  ArrowRight, ExternalLink,
  TrendingUp, AlertTriangle, Zap,
} from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/* ═══════════════════════════════════════════════════════════
   REAL DATA — sourced from NITI Aayog, WHO, IBM, etc.
═══════════════════════════════════════════════════════════ */
const CHALLENGES = [
  {
    id: 'fragmentation',
    index: '01',
    icon: Database,
    title: 'Fragmented Health Records',
    severity: 92,
    severityLabel: 'Critical',
    stat: '70%',
    statContext: 'of Indian patients cannot produce a complete history',
    source: 'NITI Aayog, 2022',
    sourceUrl: 'https://www.niti.gov.in',
    impact: '₹18,000 Cr wasted on repeated diagnostic tests annually.',
    medichain: 'NFT-based health vaults on IPFS give patients a unified, portable history.',
    tag: 'Data Silos',
  },
  {
    id: 'ownership',
    index: '02',
    icon: Lock,
    title: 'Zero Patient Data Ownership',
    severity: 85,
    severityLabel: 'High',
    stat: '96%',
    statContext: 'of patients are unaware of who has record access',
    source: 'WHO, 2021',
    sourceUrl: 'https://www.who.int',
    impact: '1.9 million records exposed in India in 2023 via centralized hospital databases.',
    medichain: 'ERC-721 medical NFTs are minted directly into the patient\'s own wallet.',
    tag: 'Data Sovereignty',
  },
  {
    id: 'breaches',
    index: '03',
    icon: ShieldAlert,
    title: 'Centralised Database Breaches',
    severity: 88,
    severityLabel: 'High',
    stat: '$10.9M',
    statContext: 'average cost of a healthcare data breach',
    source: 'IBM Report, 2023',
    sourceUrl: 'https://www.ibm.com/reports/data-breach',
    impact: 'AIIMS Delhi attack halted operations for 15 days, exposing 40M+ records.',
    medichain: 'Distributed IPFS storage removes the central point of failure and breach.',
    tag: 'Cybersecurity',
  },
  {
    id: 'fraud',
    index: '04',
    icon: FileWarning,
    title: 'Insurance Fraud Epidemic',
    severity: 78,
    severityLabel: 'Severe',
    stat: '₹45,000 Cr',
    statContext: 'lost annually to fraudulent claims in India',
    source: 'IRDAI, 2023',
    sourceUrl: 'https://www.irdai.gov.in',
    impact: 'Only 3.7% of fraudulent claims are detected under paper systems.',
    medichain: 'Immutable hashes on Polygon verify claim authenticity in milliseconds via smart contracts.',
    tag: 'Financial Crime',
  },
];

/* ─── Macro stat bar component ──────────────────────────── */
function MacroStat({ value, label, sub }) {
  return (
    <div className="flex flex-col gap-1 border-l border-border pl-6 first:border-l-0 first:pl-0">
      <span className="text-gradient font-display text-3xl md:text-4xl">{value}</span>
      <span className="font-body text-[11px] font-semibold text-foreground/80 uppercase tracking-wider">{label}</span>
      <span className="font-body text-[10px] text-muted-foreground">{sub}</span>
    </div>
  );
}

export function ChallengesSection() {
  return (
    <section id="challenges" className="relative w-full bg-background py-24 px-6 flex justify-center overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      <div className="relative z-10 w-full max-w-5xl">
        {/* Header Section */}
        <div className="mb-16">
          <Badge variant="outline" className="mb-6 px-4 py-1.5 border-primary/30 text-primary bg-primary/5 uppercase tracking-[0.2em] rounded-full">
            Problem Space
          </Badge>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10">
            <h2 className="font-display text-foreground leading-[0.95] tracking-tight max-w-xl" style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)' }}>
              Healthcare's <span className="italic relative text-primary">four <svg className="absolute -bottom-1 left-0 w-full" height="4" viewBox="0 0 80 4" preserveAspectRatio="none"><path d="M0 3 Q20 0 40 2 Q60 4 80 1" stroke="currentColor" strokeWidth="2" fill="none" /></svg></span> systemic failures
            </h2>
            <p className="font-body text-[0.93rem] text-muted-foreground max-w-xs leading-relaxed md:text-right">
              Verified data from IRDAI, NITI Aayog, and WHO. Click each challenge to reveal MediChain's cryptographic answer.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 pt-10 border-t border-border/60">
            <MacroStat value="₹45K Cr" label="Ins. Fraud" sub="IRDAI Annual Report" />
            <MacroStat value="1.9M" label="Leaks" sub="Breaches in 2023" />
            <MacroStat value="$10.9M" label="Breach Cost" sub="IBM Global Avg." />
            <MacroStat value="70%" label="Incomplete" sub="NITI Aayog Report" />
          </div>
        </div>

        {/* Main Challenges Accordion */}
        <Accordion type="single" collapsible defaultValue="fragmentation" className="w-full space-y-4">
          {CHALLENGES.map((item) => (
            <AccordionItem key={item.id} value={item.id} className="border border-border/60 rounded-2xl overflow-hidden bg-card/30 backdrop-blur-sm px-2">
              <AccordionTrigger className="hover:no-underline py-6 px-4 group data-[state=open]:bg-primary/5 transition-all">
                <div className="flex items-center gap-6 w-full pr-4 text-left">
                  <span className="font-display text-sm text-primary/60 tabular-nums">{item.index}</span>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-3">
                      <h3 className="font-display text-xl text-foreground group-hover:text-primary transition-colors">{item.title}</h3>
                      <Badge variant="secondary" className="text-[9px] height-auto py-0">{item.tag}</Badge>
                    </div>
                    <div className="mt-3 flex items-center gap-3 max-w-[180px]">
                      <Progress value={item.severity} className="h-1 bg-primary/10" />
                      <span className="text-[9px] font-bold text-primary uppercase">{item.severityLabel}</span>
                    </div>
                  </div>
                  <div className="hidden md:block text-right">
                    <span className="block font-display text-2xl text-foreground">{item.stat}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Impact Factor</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-8 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                  <Card className="bg-background/40 border-primary/10">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary">The Scale</span>
                      </div>
                      <p className="text-[13px] leading-relaxed text-muted-foreground">
                        <span className="text-foreground font-semibold">{item.stat}</span> {item.statContext}
                      </p>
                      <a href={item.sourceUrl} className="inline-flex items-center gap-1.5 text-[10px] text-primary hover:underline mt-4">
                        <ExternalLink className="w-3 h-3" /> {item.source}
                      </a>
                    </CardContent>
                  </Card>

                  <Card className="bg-background/40 border-secondary/10">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-4 h-4 text-secondary-foreground" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-secondary-foreground">Real Impact</span>
                      </div>
                      <p className="text-[13px] leading-relaxed text-muted-foreground">{item.impact}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-accent/5 border-accent/20">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-4 h-4 text-accent" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-accent">MediChain Fix</span>
                      </div>
                      <p className="text-[13px] leading-relaxed text-muted-foreground">{item.medichain}</p>
                    </CardContent>
                  </Card>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Bottom Call to Action */}
        <div className="mt-16 flex flex-col md:flex-row items-center justify-between gap-8 p-8 border border-primary/20 bg-primary/5 rounded-3xl">
          <div>
            <h4 className="font-display text-xl text-foreground">
              Ready for a <span className="text-primary italic">secure</span> future?
            </h4>
            <p className="text-sm text-muted-foreground mt-1">Built on Polygon · Verified on IPFS · Owned by patients</p>
          </div>
          <button className="group flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-full font-body font-semibold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20">
            See the Architecture
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}