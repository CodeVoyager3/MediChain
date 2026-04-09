import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/common/ToastNotification';

// Components
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { MissionSection } from './components/MissionSection';
import { ChallengesSection } from './components/ChallengesSection';
import { CoreCapabilitiesBentoGrid } from './components/CoreCapabilitiesBentoGrid';
import { PlatformEcosystemSection } from './components/PlatformEcosystemSection';
import { ArchitectureSection } from './components/ArchitectureSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { CtaBannerSection } from './components/CtaBannerSection';
import { FooterSection } from './components/SiteFooter';
import RegisterModal from './components/RegisterModal';
import ProtectedRoute from './components/ProtectedRoute';

// Dashboards
import PatientDashboard from './components/dashboard/PatientDashboard';
import DoctorDashboard from './components/dashboard/DoctorDashboard';
import InsurerDashboard from './components/dashboard/InsurerDashboard';

function LandingPage() {
    return (
        <div className="flex flex-col bg-background overflow-x-hidden w-full">
            <div id="hero"><HeroSection /></div>
            
            {/* Wrapper for the rest of the sections to introduce consistent gaps */}
            <div className="flex flex-col gap-y-24 md:gap-y-32 py-16">
                <MissionSection />
                <ChallengesSection />
                <CoreCapabilitiesBentoGrid />
                <PlatformEcosystemSection />
                <ArchitectureSection />
                <HowItWorksSection />
                <TestimonialsSection />
            </div>

            <div className="relative w-full overflow-hidden bg-background">
                <div
                    className="absolute inset-x-0 bottom-0 h-full pointer-events-none"
                    style={{
                        background:
                            'radial-gradient(ellipse 80% 70% at 50% 65%, hsl(var(--primary) / 0.12) 0%, transparent 60%)',
                    }}
                />
                <div className="flex flex-col gap-y-16">
                    <CtaBannerSection />
                    <FooterSection />
                </div>
            </div>
        </div>
    );
}

function AppContent() {
    const location = useLocation();
    const isLandingPage = location.pathname === '/';

    return (
        <>
            {isLandingPage && <Navbar />}
            <RegisterModal />
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route
                    path="/patient"
                    element={
                        <ProtectedRoute requiredRole="PATIENT">
                            <PatientDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/doctor"
                    element={
                        <ProtectedRoute requiredRole="DOCTOR">
                            <DoctorDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/insurer"
                    element={
                        <ProtectedRoute requiredRole="INSURER">
                            <InsurerDashboard />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <ToastProvider>
                    <AppContent />
                </ToastProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}