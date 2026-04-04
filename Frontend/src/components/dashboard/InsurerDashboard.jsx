import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import {
    LayoutDashboard, Search, Calendar, Menu, Bell, Settings, LogOut,
    ShieldCheck, FileSearch, Upload, CheckCircle2, XCircle, Hash,
    FileSignature, ChevronsLeft, Download, ArrowRight, Clock,
    AlertTriangle, Eye, Lock, Fingerprint, Link2, Loader2,
    FileText, Activity, ChevronRight, Zap, CircleDot
} from 'lucide-react';
import { AnimatedThemeToggler } from '../magicui/animated-theme-toggler';

import { Card as ShadcnCard, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

import { MagicCard } from '../magicui/magic-card';
import { NumberTicker } from '../magicui/number-ticker';
import { ShimmerButton } from '../magicui/shimmer-button';

import { motion, AnimatePresence } from 'framer-motion';
import { AmbientParticles } from '../effects/AmbientParticles';
import { GlassCard } from '../effects/GlassCard';

/* ─── NAV ─────────────────────────────────────────────────── */
const NAV = {
    main: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'verify', label: 'Verify Claims', icon: FileSearch },
        { id: 'audit', label: 'Audit Trail', icon: Clock },
    ],
    features: [
        { id: 'policies', label: 'Policies', icon: FileText },
        { id: 'analytics', label: 'Analytics', icon: Activity },
    ],
    general: [
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'logout', label: 'Log out', icon: LogOut },
    ],
};

/* ─── MOCK DATA ───────────────────────────────────────────── */
const RECENT_VERIFICATIONS = [
    { id: 1, patient: '0x71C7…3F4b', tokenId: '#4281', status: 'Verified', date: '03 Apr 2026', doctor: 'Dr. Sharma' },
    { id: 2, patient: '0xA3D9…8E2c', tokenId: '#4280', status: 'Verified', date: '02 Apr 2026', doctor: 'Dr. Mehta' },
    { id: 3, patient: '0x5bF1…9A7d', tokenId: '#4278', status: 'Superseded', date: '01 Apr 2026', doctor: 'Dr. Sharma' },
    { id: 4, patient: '0x82E4…1C3f', tokenId: '#4275', status: 'Hash Mismatch', date: '28 Mar 2026', doctor: 'Dr. Patel' },
];

const AUDIT_TRAIL = [
    {
        id: 'v2', version: 'V2 (Current)', date: '03 Apr 2026, 10:42 AM',
        hash: '0x9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        doctor: 'Dr. Ananya Sharma', status: 'Active', note: 'Corrected dosage from 500mg to 250mg',
    },
    {
        id: 'v1', version: 'V1 (Superseded)', date: '01 Apr 2026, 3:18 PM',
        hash: '0x3c7a2e5d8b1f4a9c6e0d2b7f5a3c8e1d4b6f9a2c5e8d1b4f7a0c3e6d9b2f5a',
        doctor: 'Dr. Ananya Sharma', status: 'Superseded', note: 'Original prescription — contained dosage error',
    },
];

/* ─── Sidebar nav item ────────────────────────────────────── */
function NavItem({ item, active, onClick }) {
    const Icon = item.icon;
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 text-left
                ${active
                    ? 'bg-secondary/10 text-secondary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
        >
            <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-secondary' : 'text-muted-foreground'}`} />
            <span className="flex-1">{item.label}</span>
        </button>
    );
}

/* ─── Sidebar ─────────────────────────────────────────────── */
function Sidebar({ activeNav, setActiveNav, setMobileOpen }) {
    return (
        <aside className="flex flex-col w-[240px] shrink-0 h-full bg-background border-r border-border">
            <div className="flex items-center justify-between px-5 py-[18px] border-b border-border">
                <img src="/logo.png" alt="MediChain Insurer" className="h-8 w-auto object-contain" />
                <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-muted-foreground hover:bg-muted transition-colors">
                    <ChevronsLeft className="w-4 h-4" />
                </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-2 text-muted-foreground">Main Menu</p>
                    <ul className="space-y-0.5">
                        {NAV.main.map(item => (
                            <li key={item.id}>
                                <NavItem item={item} active={activeNav === item.id} onClick={() => { setActiveNav(item.id); setMobileOpen(false); }} />
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-2 text-muted-foreground">Features</p>
                    <ul className="space-y-0.5">
                        {NAV.features.map(item => (
                            <li key={item.id}>
                                <NavItem item={item} active={activeNav === item.id} onClick={() => { setActiveNav(item.id); setMobileOpen(false); }} />
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-2 text-muted-foreground">General</p>
                    <ul className="space-y-0.5">
                        {NAV.general.map(item => {
                            const Icon = item.icon;
                            return (
                                <li key={item.id}>
                                    <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150
                                        ${item.id === 'logout'
                                            ? 'text-muted-foreground hover:bg-red-950/30 hover:text-red-400'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                        }`}>
                                        <Icon className="w-4 h-4 shrink-0 text-muted-foreground" />
                                        {item.label}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </nav>
        </aside>
    );
}

function IconBadge({ icon: Icon, colorClass = "text-secondary", bgClass = "bg-secondary/10" }) {
    return (
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${bgClass}`}>
            <Icon className={`w-3.5 h-3.5 ${colorClass}`} />
        </div>
    );
}

/* ─── Verification Check Row ──────────────────────────────── */
function VerificationCheckRow({ icon: Icon, label, description, verified, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay, duration: 0.4, ease: 'easeOut' }}
            className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-background/60"
        >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                verified ? 'bg-emerald-900/30' : 'bg-red-900/30'
            }`}>
                <Icon className={`w-5 h-5 ${verified ? 'text-emerald-500' : 'text-red-500'}`} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground">{label}</p>
                <p className="text-[11px] text-muted-foreground">{description}</p>
            </div>
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: delay + 0.3, type: 'spring', stiffness: 500 }}
            >
                {verified ? (
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <CheckCircle2 className="w-4.5 h-4.5 text-foreground" />
                    </div>
                ) : (
                    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30">
                        <XCircle className="w-4.5 h-4.5 text-foreground" />
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}

/* ─── Audit Version Card ──────────────────────────────────── */
function AuditVersionCard({ version, isCurrent }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={`relative p-5 rounded-2xl border transition-all duration-300 ${
                isCurrent
                    ? 'border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 to-card'
                    : 'border-border bg-background/60 opacity-75'
            }`}
        >
            {/* Pulse dot for current */}
            {isCurrent && (
                <div className="absolute top-4 right-4">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                    </span>
                </div>
            )}

            <div className="flex items-center gap-2 mb-3">
                <Badge className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border-none ${
                    isCurrent
                        ? 'bg-emerald-900/40 text-emerald-400'
                        : 'bg-muted text-muted-foreground'
                }`}>
                    {version.version}
                </Badge>
                <span className="text-[10px] text-muted-foreground">{version.date}</span>
            </div>

            <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">{version.note}</p>

            <div className="flex items-center gap-2 mb-2.5">
                <Fingerprint className="w-3.5 h-3.5 text-secondary" />
                <span className="text-[10px] font-semibold text-muted-foreground">Signed by</span>
                <span className="text-[10px] font-bold text-foreground">{version.doctor}</span>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted">
                <Hash className="w-3 h-3 text-muted-foreground shrink-0" />
                <code className="text-[9px] font-mono text-muted-foreground truncate">{version.hash}</code>
            </div>
        </motion.div>
    );
}

/* ─── Main Dashboard ──────────────────────────────────────── */
export default function InsuranceDashboard() {
    const account = useActiveAccount();
    const [activeNav, setActiveNav] = useState('overview');
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isDark, setIsDark] = useState(true);

    // Claim Verification Engine state
    const [walletAddress, setWalletAddress] = useState('');
    const [tokenId, setTokenId] = useState('');
    const [pdfFile, setPdfFile] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationResult, setVerificationResult] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    /* Simulated verification */
    const handleVerify = useCallback(() => {
        if (!walletAddress || !tokenId || !pdfFile) return;
        setIsVerifying(true);
        setVerificationResult(null);
        setTimeout(() => {
            setIsVerifying(false);
            setVerificationResult({
                signature: true,
                hashMatch: true,
                notSuperseded: true,
            });
        }, 2200);
    }, [walletAddress, tokenId, pdfFile]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) {
            setPdfFile(e.dataTransfer.files[0]);
        }
    }, []);

    const canVerify = walletAddress.trim() && tokenId.trim() && pdfFile;

    return (
        <div className="flex h-screen overflow-hidden font-body bg-background">
            {/* Sidebar */}
            <div className="hidden lg:flex">
                <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} setMobileOpen={setMobileOpen} />
            </div>

            {mobileOpen && (
                <>
                    <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
                    <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
                        <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} setMobileOpen={setMobileOpen} />
                    </div>
                </>
            )}

            {/* Main area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <AmbientParticles />

                {/* Header */}
                <header className="flex items-center justify-between px-4 lg:px-6 py-3.5 bg-background border-b border-border shrink-0 relative z-20">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors">
                            <Menu className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-[15px] font-semibold leading-tight text-foreground">
                                Claims & Verification{account ? ' 🔒' : ''}
                            </h1>
                            <p className="text-[11px] hidden sm:block text-muted-foreground">
                                Blockchain-backed claim integrity engine
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden md:flex items-center gap-2">
                            <div className="flex items-center gap-1.5 border border-border rounded-xl px-3 py-[7px] text-[11px] text-muted-foreground">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>Thu, 03 Apr 2026</span>
                            </div>
                            <button className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-[7px] rounded-xl bg-gray-100 text-gray-900 transition-opacity hover:opacity-85">
                                <Download className="w-3.5 h-3.5" />
                                Export
                            </button>
                        </div>

                        <div className="hidden lg:flex items-center gap-2 border border-border rounded-xl px-3 py-[7px] text-[11px] w-56 bg-card text-muted-foreground focus-within:bg-muted focus-within:ring-2 focus-within:ring-secondary/40 transition-colors cursor-text">
                            <Search className="w-3.5 h-3.5 shrink-0" />
                            <input type="text" placeholder="Search claims..." className="flex-1 bg-transparent border-none outline-none text-foreground min-w-0" />
                            <span className="text-[10px] border border-border rounded px-1.5 font-medium text-muted-foreground shrink-0">⌘K</span>
                        </div>

                        <div className="relative">
                            <button className="w-8 h-8 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-muted transition-colors">
                                <Bell className="w-4 h-4" />
                            </button>
                            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent" />
                        </div>

                        <AnimatedThemeToggler />

                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-background text-[11px] font-bold shrink-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #D2E75F, #c2d44e)' }}>
                            IN
                        </div>
                    </div>
                </header>

                {/* Content */}
                <motion.main
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
                    }}
                    className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 lg:py-5 space-y-4 relative z-10"
                >
                    {/* ════ ROW 1: Stats ════ */}
                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Claims Processed', value: 1284, icon: FileSearch, trend: '+12.3%', up: true },
                            { label: 'Verified Today', value: 47, icon: CheckCircle2, trend: '+8.1%', up: true },
                            { label: 'Hash Mismatches', value: 3, icon: AlertTriangle, trend: '-2.4%', up: false },
                            { label: 'Superseded Records', value: 18, icon: Clock, trend: '+1.2%', up: true },
                        ].map((stat, i) => (
                            <MagicCard key={i} className="bg-transparent overflow-hidden" gradientColor='hsl(var(--muted))'>
                                <GlassCard interactive={false}>
                                    <div className="p-5 relative z-10">
                                        <div className="flex items-center justify-between mb-3">
                                            <IconBadge
                                                icon={stat.icon}
                                                bgClass={i === 2 ? 'bg-amber-900/30' : 'bg-secondary/10'}
                                                colorClass={i === 2 ? 'text-amber-400' : 'text-secondary'}
                                            />
                                            <span className={`text-[10px] font-semibold ${stat.up ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {stat.up ? '↑' : '↓'} {stat.trend}
                                            </span>
                                        </div>
                                        <div className="text-foreground flex items-center h-9 mb-1">
                                            <NumberTicker value={stat.value} className="text-[2rem] font-bold tracking-tight leading-none" />
                                        </div>
                                        <p className="text-[11px] font-medium text-muted-foreground">{stat.label}</p>
                                    </div>
                                </GlassCard>
                            </MagicCard>
                        ))}
                    </motion.div>

                    {/* ════ ROW 2: Claim Verification Engine + Results ════ */}
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Claim Verification Engine */}
                        <motion.div variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }} className="w-full lg:w-[45%] shrink-0">
                            <MagicCard className="h-full bg-transparent overflow-hidden" gradientColor='hsl(var(--muted))'>
                                <GlassCard>
                                    <div className="p-5 relative z-10">
                                        <div className="flex items-center gap-2 mb-5">
                                            <IconBadge icon={FileSearch} />
                                            <span className="text-[13px] font-semibold text-muted-foreground">Claim Verification Engine</span>
                                        </div>

                                        {/* Wallet Address Input */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 block">
                                                    Patient Wallet Address
                                                </label>
                                                <div className="flex items-center gap-2 border border-border rounded-xl px-3.5 py-2.5 bg-background/60 focus-within:ring-2 focus-within:ring-secondary/40 focus-within:border-secondary/40 transition-all">
                                                    <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                                    <input
                                                        type="text"
                                                        placeholder="0x71C7…"
                                                        value={walletAddress}
                                                        onChange={(e) => setWalletAddress(e.target.value)}
                                                        className="flex-1 bg-transparent border-none outline-none text-[12px] text-foreground placeholder:text-muted-foreground font-mono min-w-0"
                                                    />
                                                </div>
                                            </div>

                                            {/* Token ID Input */}
                                            <div>
                                                <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 block">
                                                    Token ID
                                                </label>
                                                <div className="flex items-center gap-2 border border-border rounded-xl px-3.5 py-2.5 bg-background/60 focus-within:ring-2 focus-within:ring-secondary/40 focus-within:border-secondary/40 transition-all">
                                                    <Link2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                                    <input
                                                        type="text"
                                                        placeholder="#4281"
                                                        value={tokenId}
                                                        onChange={(e) => setTokenId(e.target.value)}
                                                        className="flex-1 bg-transparent border-none outline-none text-[12px] text-foreground placeholder:text-muted-foreground font-mono min-w-0"
                                                    />
                                                </div>
                                            </div>

                                            {/* PDF Upload Zone */}
                                            <div>
                                                <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 block">
                                                    Patient's PDF Record
                                                </label>
                                                <div
                                                    onClick={() => fileInputRef.current?.click()}
                                                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                                                    onDragLeave={() => setDragActive(false)}
                                                    onDrop={handleDrop}
                                                    className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                                                        dragActive
                                                            ? 'border-secondary/50 bg-secondary/5 scale-[1.02]'
                                                            : pdfFile
                                                                ? 'border-emerald-700 bg-emerald-900/10'
                                                                : 'border-border bg-background/30 hover:border-secondary/30 hover:bg-secondary/5'
                                                    }`}
                                                >
                                                    <input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        accept=".pdf"
                                                        className="hidden"
                                                        onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                                                    />
                                                    {pdfFile ? (
                                                        <>
                                                            <div className="w-10 h-10 rounded-full bg-emerald-900/50 flex items-center justify-center mb-2">
                                                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                            </div>
                                                            <p className="text-[12px] font-semibold text-emerald-400 truncate max-w-full">{pdfFile.name}</p>
                                                            <p className="text-[10px] text-muted-foreground mt-0.5">{(pdfFile.size / 1024).toFixed(1)} KB · Click to replace</p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center mb-2">
                                                                <Upload className="w-5 h-5 text-secondary" />
                                                            </div>
                                                            <p className="text-[12px] font-semibold text-foreground">Drop PDF or click to upload</p>
                                                            <p className="text-[10px] text-muted-foreground mt-0.5">Max 10MB · PDF only</p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Verify Button */}
                                            <ShimmerButton
                                                onClick={handleVerify}
                                                disabled={!canVerify || isVerifying}
                                                className={`w-full py-3 rounded-xl text-[13px] font-semibold shadow-lg border-none flex transition-all ${
                                                    !canVerify ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                                background='hsl(var(--accent))'
                                                shimmerColor="#FFD6E8"
                                            >
                                                <span className="flex items-center justify-center gap-2 text-background">
                                                    {isVerifying ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                            Verifying on Blockchain…
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Zap className="w-4 h-4" />
                                                            Verify Claim Integrity
                                                        </>
                                                    )}
                                                </span>
                                            </ShimmerButton>
                                        </div>
                                    </div>
                                </GlassCard>
                            </MagicCard>
                        </motion.div>

                        {/* Verification Results */}
                        <motion.div variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }} className="flex-1 min-w-0">
                            <MagicCard className="h-full bg-transparent overflow-hidden" gradientColor='hsl(var(--muted))'>
                                <GlassCard interactive={false}>
                                    <div className="p-5 relative z-10 h-full flex flex-col">
                                        <div className="flex items-center gap-2 mb-5">
                                            <IconBadge icon={ShieldCheck} bgClass="bg-emerald-900/30" colorClass="text-emerald-400" />
                                            <span className="text-[13px] font-semibold text-muted-foreground">Verification Results</span>
                                        </div>

                                        {!verificationResult && !isVerifying ? (
                                            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                                                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                                                    <Eye className="w-7 h-7 text-muted-foreground" />
                                                </div>
                                                <p className="text-[13px] font-semibold text-muted-foreground mb-1">No claim verified yet</p>
                                                <p className="text-[11px] text-muted-foreground max-w-[200px]">
                                                    Submit a wallet address, token ID, and PDF to begin verification.
                                                </p>
                                            </div>
                                        ) : isVerifying ? (
                                            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                                    className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-4"
                                                >
                                                    <Loader2 className="w-7 h-7 text-secondary" />
                                                </motion.div>
                                                <p className="text-[13px] font-semibold text-secondary mb-1">Querying Blockchain…</p>
                                                <p className="text-[11px] text-muted-foreground">Hashing PDF & validating on-chain data</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3 flex-1">
                                                <VerificationCheckRow
                                                    icon={Fingerprint}
                                                    label="Valid Doctor Signature"
                                                    description="The minting wallet matches a registered doctor"
                                                    verified={verificationResult.signature}
                                                    delay={0.1}
                                                />
                                                <VerificationCheckRow
                                                    icon={Hash}
                                                    label="Hash Match"
                                                    description="SHA-256 of uploaded PDF matches on-chain hash"
                                                    verified={verificationResult.hashMatch}
                                                    delay={0.3}
                                                />
                                                <VerificationCheckRow
                                                    icon={ShieldCheck}
                                                    label="Not Superseded"
                                                    description="No newer amendment exists for this record"
                                                    verified={verificationResult.notSuperseded}
                                                    delay={0.5}
                                                />

                                                {/* Summary */}
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: 0.9, duration: 0.4 }}
                                                    className="mt-4 p-4 rounded-2xl bg-emerald-950/30 border border-emerald-900/50"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                                        <p className="text-[12px] font-bold text-emerald-300">
                                                            Claim is Valid & Authentic
                                                        </p>
                                                    </div>
                                                    <p className="text-[10px] text-emerald-400/70 mt-1 leading-snug ml-6">
                                                        All three blockchain integrity checks have passed. This record is safe to process for reimbursement.
                                                    </p>
                                                </motion.div>
                                            </div>
                                        )}
                                    </div>
                                </GlassCard>
                            </MagicCard>
                        </motion.div>
                    </div>

                    {/* ════ ROW 3: Audit Trail + Recent Verifications ════ */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="flex flex-col lg:flex-row gap-4"
                    >
                        {/* Audit Trail Viewer */}
                        <div className="w-full lg:w-[45%] shrink-0">
                            <MagicCard className="h-full bg-transparent overflow-hidden" gradientColor='hsl(var(--muted))'>
                                <GlassCard>
                                    <div className="p-5 relative z-10">
                                        <div className="flex items-center justify-between mb-5">
                                            <div className="flex items-center gap-2">
                                                <IconBadge icon={Clock} />
                                                <span className="text-[13px] font-semibold text-muted-foreground">Audit Trail Viewer</span>
                                            </div>
                                            <Badge variant="outline" className="flex items-center gap-1.5 py-0.5 border-secondary/30 bg-secondary/10">
                                                <CircleDot className="w-3 h-3 text-secondary" />
                                                <span className="text-[10px] font-semibold text-secondary">2 Versions</span>
                                            </Badge>
                                        </div>

                                        {/* Version Timeline */}
                                        <div className="relative space-y-4">
                                            {/* Timeline connector line */}
                                            <div className="absolute left-[22px] top-[60px] bottom-[60px] w-px bg-gradient-to-b from-emerald-500 via-secondary to-gray-700" />

                                            {/* V2 */}
                                            <div className="relative flex gap-4">
                                                <div className="relative z-10 mt-4">
                                                    <div className="w-[12px] h-[12px] rounded-full bg-emerald-500 ring-4 ring-emerald-900/40 mx-[11px]" />
                                                </div>
                                                <div className="flex-1">
                                                    <AuditVersionCard version={AUDIT_TRAIL[0]} isCurrent={true} />
                                                </div>
                                            </div>

                                            {/* Arrow connector */}
                                            <div className="flex items-center gap-3 pl-6">
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <ArrowRight className="w-3.5 h-3.5" />
                                                    <span className="text-[9px] font-semibold uppercase tracking-wider">Amended from</span>
                                                </div>
                                            </div>

                                            {/* V1 */}
                                            <div className="relative flex gap-4">
                                                <div className="relative z-10 mt-4">
                                                    <div className="w-[12px] h-[12px] rounded-full bg-gray-600 ring-4 ring-muted mx-[11px]" />
                                                </div>
                                                <div className="flex-1">
                                                    <AuditVersionCard version={AUDIT_TRAIL[1]} isCurrent={false} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>
                            </MagicCard>
                        </div>

                        {/* Recent Verifications */}
                        <div className="flex-1 min-w-0">
                            <MagicCard className="h-full bg-transparent overflow-hidden" gradientColor='hsl(var(--muted))'>
                                <GlassCard interactive={false}>
                                    <div className="p-5 relative z-10">
                                        <div className="flex items-center justify-between mb-5">
                                            <div className="flex items-center gap-2">
                                                <IconBadge icon={Activity} />
                                                <span className="text-[13px] font-semibold text-muted-foreground">Recent Verifications</span>
                                            </div>
                                            <Button variant="ghost" className="h-7 text-[10px] text-secondary hover:bg-secondary/10 gap-1">
                                                View All
                                                <ChevronRight className="w-3 h-3" />
                                            </Button>
                                        </div>

                                        <div className="space-y-3">
                                            {RECENT_VERIFICATIONS.map((v, i) => {
                                                const isVerified = v.status === 'Verified';
                                                const isSuperseded = v.status === 'Superseded';
                                                return (
                                                    <motion.div
                                                        key={v.id}
                                                        initial={{ opacity: 0, x: 10 }}
                                                        whileInView={{ opacity: 1, x: 0 }}
                                                        viewport={{ once: true }}
                                                        transition={{ delay: i * 0.08 }}
                                                        className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background/60 hover:-translate-x-1 transition-all duration-300"
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                                                isVerified ? 'bg-emerald-900/30' : isSuperseded ? 'bg-amber-900/30' : 'bg-red-900/30'
                                                            }`}>
                                                                {isVerified ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> :
                                                                 isSuperseded ? <Clock className="w-4 h-4 text-amber-500" /> :
                                                                 <AlertTriangle className="w-4 h-4 text-red-500" />}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[12px] font-semibold text-foreground font-mono">{v.patient}</span>
                                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">{v.tokenId}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    <span className="text-[10px] text-muted-foreground">{v.date}</span>
                                                                    <span className="text-[10px] text-muted-foreground">·</span>
                                                                    <span className="text-[10px] text-muted-foreground">{v.doctor}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Badge variant="outline" className={`text-[10px] font-semibold border-none shrink-0 ${
                                                            isVerified ? 'bg-emerald-900/30 text-emerald-400' :
                                                            isSuperseded ? 'bg-amber-900/30 text-amber-400' :
                                                            'bg-red-900/30 text-red-400'
                                                        }`}>
                                                            {v.status}
                                                        </Badge>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </GlassCard>
                            </MagicCard>
                        </div>
                    </motion.div>

                    <div className="h-4" />
                </motion.main>
            </div>
        </div>
    );
}
