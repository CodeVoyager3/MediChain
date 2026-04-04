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

import { useAuth } from '../../context/AuthContext';
import { viewRecordAsInsurer } from '../../services/api';

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
function Sidebar({ activeNav, setActiveNav, setMobileOpen, onLogout }) {
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
                                    <button
                                        onClick={item.id === 'logout' ? onLogout : undefined}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150
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
    const { user, logout } = useAuth();
    const [activeNav, setActiveNav] = useState('overview');
    const [mobileOpen, setMobileOpen] = useState(false);

    // Claim Verification Engine state
    const [walletAddress, setWalletAddress] = useState('');
    const [tokenId, setTokenId] = useState('');
    const [pdfFile, setPdfFile] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationResult, setVerificationResult] = useState(null);
    const [verifyError, setVerifyError] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    // Verification history (tracked locally for this session)
    const [verificationHistory, setVerificationHistory] = useState([]);

    // Audit trail from API response
    const [auditTrail, setAuditTrail] = useState([]);

    const displayName = user?.name || 'Insurer';

    /* Real blockchain verification via backend API */
    const handleVerify = useCallback(async () => {
        if (!walletAddress || !tokenId) return;
        setIsVerifying(true);
        setVerificationResult(null);
        setVerifyError('');

        try {
            const recordId = parseInt(tokenId.replace('#', ''), 10);
            const insurerAddress = account?.address || user?.walletAddress;

            const res = await viewRecordAsInsurer(insurerAddress, walletAddress, recordId);

            // Map the API response to our UI format
            const result = {
                signature: res.securityChecks?.validDoctorSignature ?? true,
                hashMatch: res.securityChecks?.hashMatch ?? true,
                notSuperseded: res.securityChecks?.notSuperseded ?? true,
            };

            setVerificationResult(result);

            // Populate audit trail from response
            if (res.auditTrail && res.auditTrail.length > 0) {
                setAuditTrail(res.auditTrail.map((entry, i) => ({
                    id: `v${res.auditTrail.length - i}`,
                    version: i === 0 ? `V${res.auditTrail.length - i} (Current)` : `V${res.auditTrail.length - i} (Superseded)`,
                    date: entry.date || new Date().toLocaleDateString(),
                    hash: entry.hash || '0x0000…',
                    doctor: entry.doctor || 'Unknown',
                    status: i === 0 ? 'Active' : 'Superseded',
                    note: entry.note || '',
                })));
            }

            // Append to history
            const allPassed = result.signature && result.hashMatch && result.notSuperseded;
            setVerificationHistory(prev => [
                {
                    id: Date.now(),
                    patient: `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`,
                    tokenId: `#${recordId}`,
                    status: allPassed ? 'Verified' : result.notSuperseded ? 'Hash Mismatch' : 'Superseded',
                    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                    doctor: res.doctorAddress ? `${res.doctorAddress.slice(0, 6)}…` : 'N/A',
                },
                ...prev,
            ]);
        } catch (err) {
            console.error('Verification failed:', err);
            setVerifyError(err.message || 'Verification failed. Ensure you have access to this record.');
        } finally {
            setIsVerifying(false);
        }
    }, [walletAddress, tokenId, account, user]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) {
            setPdfFile(e.dataTransfer.files[0]);
        }
    }, []);

    const canVerify = walletAddress.trim() && tokenId.trim();

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    // Stats computed from history
    const totalVerified = verificationHistory.filter(v => v.status === 'Verified').length;
    const totalMismatch = verificationHistory.filter(v => v.status === 'Hash Mismatch').length;
    const totalSuperseded = verificationHistory.filter(v => v.status === 'Superseded').length;

    return (
        <div className="flex h-screen overflow-hidden font-body bg-background">
            {/* Sidebar */}
            <div className="hidden lg:flex">
                <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} setMobileOpen={setMobileOpen} onLogout={handleLogout} />
            </div>

            {mobileOpen && (
                <>
                    <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
                    <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
                        <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} setMobileOpen={setMobileOpen} onLogout={handleLogout} />
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
                                Claims & Verification — {displayName} 🔒
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
                                <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</span>
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
                            {displayName.charAt(0).toUpperCase()}
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
                            { label: 'Claims Processed', value: verificationHistory.length, icon: FileSearch, trend: '', up: true },
                            { label: 'Verified Today', value: totalVerified, icon: CheckCircle2, trend: '', up: true },
                            { label: 'Hash Mismatches', value: totalMismatch, icon: AlertTriangle, trend: '', up: false },
                            { label: 'Superseded Records', value: totalSuperseded, icon: Clock, trend: '', up: true },
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
                                                    Token ID (Record ID)
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
                                                    Patient's PDF Record (Optional)
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

                                            {/* Error message */}
                                            {verifyError && (
                                                <div className="bg-red-950/30 border border-red-900/50 text-red-300 text-xs p-3 rounded-xl">
                                                    {verifyError}
                                                </div>
                                            )}

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
                                                    Submit a wallet address and token ID to begin verification.
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
                                                <p className="text-[11px] text-muted-foreground">Validating on-chain data & access grants</p>
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
                                                    description="SHA-256 of record matches on-chain hash"
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
                                                    className={`mt-4 p-4 rounded-2xl border ${
                                                        verificationResult.signature && verificationResult.hashMatch && verificationResult.notSuperseded
                                                            ? 'bg-emerald-950/30 border-emerald-900/50'
                                                            : 'bg-red-950/30 border-red-900/50'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {verificationResult.signature && verificationResult.hashMatch && verificationResult.notSuperseded ? (
                                                            <>
                                                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                                                <p className="text-[12px] font-bold text-emerald-300">
                                                                    Claim is Valid & Authentic
                                                                </p>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                                                                <p className="text-[12px] font-bold text-red-300">
                                                                    Claim has Issues
                                                                </p>
                                                            </>
                                                        )}
                                                    </div>
                                                    <p className={`text-[10px] mt-1 leading-snug ml-6 ${
                                                        verificationResult.signature && verificationResult.hashMatch && verificationResult.notSuperseded
                                                            ? 'text-emerald-400/70'
                                                            : 'text-red-400/70'
                                                    }`}>
                                                        {verificationResult.signature && verificationResult.hashMatch && verificationResult.notSuperseded
                                                            ? 'All blockchain integrity checks have passed. This record is safe to process for reimbursement.'
                                                            : 'One or more integrity checks have failed. Please review the details above before processing.'}
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
                                            {auditTrail.length > 0 && (
                                                <Badge variant="outline" className="flex items-center gap-1.5 py-0.5 border-secondary/30 bg-secondary/10">
                                                    <CircleDot className="w-3 h-3 text-secondary" />
                                                    <span className="text-[10px] font-semibold text-secondary">{auditTrail.length} Versions</span>
                                                </Badge>
                                            )}
                                        </div>

                                        {auditTrail.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                                <Clock className="w-8 h-8 text-muted-foreground mb-2" />
                                                <p className="text-xs text-muted-foreground">Verify a claim to view its audit trail</p>
                                            </div>
                                        ) : (
                                            <div className="relative space-y-4">
                                                {auditTrail.length > 1 && (
                                                    <div className="absolute left-[22px] top-[60px] bottom-[60px] w-px bg-gradient-to-b from-emerald-500 via-secondary to-gray-700" />
                                                )}

                                                {auditTrail.map((version, idx) => (
                                                    <div key={version.id} className="relative flex gap-4">
                                                        <div className="relative z-10 mt-4">
                                                            <div className={`w-[12px] h-[12px] rounded-full mx-[11px] ${
                                                                idx === 0
                                                                    ? 'bg-emerald-500 ring-4 ring-emerald-900/40'
                                                                    : 'bg-gray-600 ring-4 ring-muted'
                                                            }`} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <AuditVersionCard version={version} isCurrent={idx === 0} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
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
                                        </div>

                                        <div className="space-y-3">
                                            {verificationHistory.length === 0 ? (
                                                <p className="text-xs text-muted-foreground text-center py-8">No verifications yet this session</p>
                                            ) : (
                                                verificationHistory.slice(0, 6).map((v, i) => {
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
                                                })
                                            )}
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
