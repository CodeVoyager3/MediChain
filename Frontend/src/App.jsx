import React from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { MissionSection } from './components/MissionSection';
import { ChallengesSection } from './components/ChallengesSection';
import { CoreFeaturesSection } from './components/CoreFeaturesSection';
import { PlatformEcosystemSection } from './components/PlatformEcosystemSection';
import { StatsSection } from './components/StatsSection';
import { ArchitectureSection } from './components/ArchitectureSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { CtaBannerSection } from './components/CtaBannerSection';
import { FooterSection } from './components/SiteFooter';

function App() {
  return (
    <div className="flex flex-col bg-background overflow-x-hidden w-full">
      <Navbar />

      {/* ── Existing sections (untouched) ── */}
      <div id="hero">
        <HeroSection />
      </div>
      <MissionSection />
      <ChallengesSection />
      <CoreFeaturesSection />
      <PlatformEcosystemSection />

      {/* ── New sections ── */}
      <StatsSection />
      <ArchitectureSection />
      <HowItWorksSection />
      <TestimonialsSection />
      
      <div className="relative w-full overflow-hidden bg-background">
        <div
          className="absolute inset-x-0 bottom-0 h-full pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 70% at 50% 65%, hsl(239 84% 67% / 0.15) 0%, transparent 60%)',
          }}
        />
        <CtaBannerSection />
        <FooterSection />
      </div>
    </div>
  );
}

export default App;
