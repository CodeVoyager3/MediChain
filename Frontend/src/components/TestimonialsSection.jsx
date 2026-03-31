import React from 'react';
import { motion } from 'framer-motion';
import { Marquee } from './magicui/marquee';

const testimonials = [
  {
    quote:
      'For the first time, I carried my full medical history to the hospital on my phone. No lost files, no confusion. MediChain gave me control I never had.',
    name: 'Rajesh Kumar, 68',
    role: 'Retired Engineer — New Delhi',
    initial: 'R',
    gradient: 'from-violet-400 to-purple-600',
  },
  {
    quote:
      'MediChain lets me access verified, tamper-proof patient records instantly. The smart contract access system has genuinely changed how I practice medicine.',
    name: 'Dr. Priya Mehta',
    role: 'Cardiologist — Apollo Hospital, Mumbai',
    initial: 'P',
    gradient: 'from-blue-400 to-cyan-500',
  },
  {
    quote:
      'We eliminated fraudulent insurance claims entirely for our covered patients on MediChain. The blockchain hash verification is indestructible.',
    name: 'Arjun Sharma',
    role: 'Claims Director — LIC Health, Bangalore',
    initial: 'A',
    gradient: 'from-emerald-400 to-teal-500',
  },
  {
    quote:
      'As a diabetic patient who visits multiple specialists, having one unified record that every doctor can securely access has been life-changing.',
    name: 'Sunita Rao, 54',
    role: 'Patient — Chennai',
    initial: 'S',
    gradient: 'from-amber-400 to-orange-500',
  },
  {
    quote:
      'The consent model is exactly what the industry needed. Patients trust us more because they know they are in control of their own data.',
    name: 'Dr. Karan Nair',
    role: 'Chief of Medicine — Fortis Hospital, Delhi',
    initial: 'K',
    gradient: 'from-rose-400 to-pink-600',
  },
  {
    quote:
      'Setting up MediChain at our clinic took less than a day. Now our entire patient record flow is automated, encrypted, and completely auditable.',
    name: 'Meera Pillai',
    role: 'Hospital Administrator — Hyderabad',
    initial: 'M',
    gradient: 'from-indigo-400 to-blue-600',
  },
];

function TestimonialCard({ quote, name, role, initial, gradient }) {
  return (
    <div className="w-[340px] sm:w-[380px] shrink-0 mx-2 rounded-2xl border border-border/60 bg-background p-7 flex flex-col gap-5 hover:border-border hover:shadow-lg transition-all duration-300">
      <p className="font-display text-base italic text-foreground/80 leading-relaxed flex-1">
        <span className="text-foreground/30 text-2xl leading-none">"</span>
        {quote}
      </p>
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}
        >
          <span className="font-display text-white text-base">{initial}</span>
        </div>
        <div>
          <p className="text-sm font-body font-medium text-foreground">{name}</p>
          <p className="text-xs font-body text-muted-foreground">{role}</p>
        </div>
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  const first = testimonials.slice(0, 3);
  const second = testimonials.slice(3, 6);

  return (
    <section id="stories" className="w-full bg-background py-24 overflow-hidden">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-14 px-6"
      >
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-4 py-1.5 text-xs text-muted-foreground font-body tracking-widest uppercase mb-5">
          Patient Stories
        </div>
        <h2 className="font-display text-4xl md:text-5xl text-foreground leading-tight">
          Trusted Across <span className="italic">India</span>
        </h2>
        <p className="mt-3 text-muted-foreground font-body text-base max-w-md mx-auto leading-relaxed">
          From patients to physicians to insurers — the entire healthcare ecosystem is building on MediChain.
        </p>
      </motion.div>

      {/* Marquee Row 1 */}
      <div className="relative">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-background to-transparent" />
        <Marquee pauseOnHover repeat={2} className="py-2 [--duration:35s]">
          {first.map((t) => (
            <TestimonialCard key={t.name} {...t} />
          ))}
        </Marquee>
      </div>

      {/* Marquee Row 2 (reversed) */}
      <div className="relative mt-4">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-background to-transparent" />
        <Marquee reverse pauseOnHover repeat={2} className="py-2 [--duration:30s]">
          {second.map((t) => (
            <TestimonialCard key={t.name} {...t} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
