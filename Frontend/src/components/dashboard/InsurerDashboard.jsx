import React, { useState, useCallback } from 'react';
import { useActiveAccount, useDisconnect, useActiveWallet } from 'thirdweb/react';
import {
    LayoutDashboard, Search, Calendar, Menu, Bell, Settings, LogOut,
    ShieldCheck, FileSearch, CheckCircle2, XCircle, Hash,
    ChevronsLeft, Clock, AlertTriangle, Eye, Lock, Fingerprint, Link2, Loader2,
    Activity, CircleDot, Download, History, FileWarning
} from 'lucide-react';
import { AnimatedThemeToggler } from '../magicui/animated-theme-toggler';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { MagicCard } from '../magicui/magic-card';
import { ShimmerButton } from '../magicui/shimmer-button';
import { motion } from 'framer-motion';
import { AmbientParticles } from '../effects/AmbientParticles';
import { GlassCard } from '../effects/GlassCard';
import { useAuth } from '../../context/AuthContext';
import { viewRecordAsInsurer } from '../../services/api';

const NAV = {
    main: [{ id: 'overview', label: 'Overview', icon: LayoutDashboard }, { id: 'verify', label: 'Verify Claims', icon: FileSearch }],
    general: [{ id: 'settings', label: 'Settings', icon: Settings }, { id: 'logout', label: 'Log out', icon: LogOut }],
};

function Sidebar({ activeNav, setActiveNav, setMobileOpen, onLogout }) {
    return (
        <aside className="flex flex-col w-[240px] shrink-0 h-full bg-background border-r border-border">
            <div className="flex items-center justify-between px-5 py-[18px] border-b border-border">
                <img src="/logo.png" alt="Insurer" className="h-8 w-auto object-contain" />
                <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-muted"><ChevronsLeft className="w-4 h-4" /></button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-2 text-muted-foreground">Main Menu</p>
                    <ul className="space-y-0.5">
                        {NAV.main.map(item => (
                            <li key={item.id}>
                                <button onClick={() => { setActiveNav(item.id); setMobileOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all text-left ${activeNav === item.id ? 'bg-secondary/10 text-secondary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                                    <item.icon className="w-4 h-4 shrink-0" />
                                    <span className="flex-1">{item.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-2 text-muted-foreground">General</p>
                    <ul className="space-y-0.5">
                        {NAV.general.map(item => (
                            <li key={item.id}>
                                <button onClick={item.id === 'logout' ? onLogout : undefined} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${item.id === 'logout' ? 'text-red-400 hover:bg-red-950/30' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                                    <item.icon className="w-4 h-4 shrink-0" />{item.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>
        </aside>
    );
}

function VerificationCheckRow({ icon: Icon, label, description, verified, delay = 0 }) {
    return (
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }} className="flex items-center gap-4 p-3.5 rounded-xl border border-border bg-background/40">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${verified ? 'bg-emerald-900/20' : 'bg-red-900/20'}`}>
                <Icon className={`w-5 h-5 ${verified ? 'text-emerald-500' : 'text-red-500'}`} />
            </div>
            <div className="flex-1">
                <p className="text-[12px] font-semibold">{label}</p>
                <p className="text-[10px] text-muted-foreground">{description}</p>
            </div>
            <div>{verified ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-red-500" />}</div>
        </motion.div>
    );
}

export default function InsuranceDashboard() {
    const account = useActiveAccount();
    const { user, logout } = useAuth();
    const { disconnect } = useDisconnect();
    const wallet = useActiveWallet();

    const [activeNav, setActiveNav] = useState('verify');
    const [mobileOpen, setMobileOpen] = useState(false);

    const [walletAddress, setWalletAddress] = useState('');
    const [tokenId, setTokenId] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    const [verificationResult, setVerificationResult] = useState(null);
    const [verifyError, setVerifyError] = useState('');
    const [auditTrail, setAuditTrail] = useState([]);

    const handleViewDocument = (e, cid) => {
        e.stopPropagation();
        if (!cid) { alert("Document CID not found."); return; }
        window.open(`https://gateway.pinata.cloud/ipfs/${cid}`, '_blank', 'noopener,noreferrer');
    };

    const handleLogout = () => {
        // 1. Sever the Web3 connection
        if (wallet) {
            disconnect(wallet);
        }
        // 2. Clear the local JWT
        logout();

        // 3. IMPORTANT: Wait 250ms for Thirdweb to clear LocalStorage before navigating away!
        setTimeout(() => {
            window.location.href = '/';
        }, 250);
    };

    const handleVerify = async () => {
        if (!walletAddress || !tokenId) return;
        setIsVerifying(true);
        setVerifyError('');
        setVerificationResult(null);
        setAuditTrail([]);

        try {
            console.log("1. Formatting Inputs...");
            const recordId = parseInt(tokenId.replace('#', ''), 10);
            if (isNaN(recordId)) throw new Error("Invalid Token ID format.");

            const insurerAddress = account?.address || user?.walletAddress || user?.wallet || user?.address;
            console.log("2. Insurer Wallet:", insurerAddress, "| Target Patient:", walletAddress, "| Record ID:", recordId);

            if (!insurerAddress) {
                throw new Error("Insurer wallet not found! Please ensure your wallet is connected.");
            }

            console.log("3. Sending API Request to Spring Boot...");
            const res = await viewRecordAsInsurer(insurerAddress, walletAddress, recordId);
            console.log("4. Received Backend Response:", res);

            const payload = res.data;

            setVerificationResult({
                signature: payload.securityChecks.authenticityVerified,
                hashMatch: payload.securityChecks.integrityVerified,
                notSuperseded: !payload.recordData.isSuperseded,
                cid: payload.recordData.ipfsCid,
                auditStatus: payload.recordData.auditStatus
            });

            const trail = payload.auditTrail || [];
            setAuditTrail(trail.map((entry, i) => ({
                id: `v${trail.length - i}`,
                recordId: entry.recordId || entry.record_id,
                version: i === 0 ? 'Latest' : 'Superseded',
                date: entry.recordType || 'Medical Record',
                hash: entry.txHash || entry.tx_hash || '0x...',
                doctor: entry.doctorAddress || entry.doctor_address || 'Unknown',
                rawCid: entry.ipfsCid || entry.ipfs_cid || entry.cid
            })));

            console.log("5. Verification Complete!");

        } catch (err) {
            console.error("VERIFICATION FAILED:", err);
            setVerifyError(err.message || "Verification failed. Access Denied.");
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="flex h-screen overflow-hidden font-body bg-background">
            <div className="hidden lg:flex"><Sidebar activeNav={activeNav} setActiveNav={setActiveNav} setMobileOpen={setMobileOpen} onLogout={handleLogout} /></div>
            {mobileOpen && <div className="fixed inset-y-0 left-0 z-50 lg:hidden"><Sidebar activeNav={activeNav} setActiveNav={setActiveNav} setMobileOpen={setMobileOpen} onLogout={handleLogout} /></div>}

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <AmbientParticles />
                <header className="flex items-center justify-between px-4 lg:px-6 py-3.5 bg-background border-b border-border shrink-0 relative z-20">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-muted"><Menu className="w-5 h-5" /></button>
                        <div><h1 className="text-[15px] font-semibold text-foreground">Claims & Fraud Engine</h1></div>
                    </div>
                    <div className="flex items-center gap-2"><AnimatedThemeToggler /></div>
                </header>

                <main className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 lg:py-5 space-y-4 relative z-10">
                    {verifyError && (
                        <div className="bg-red-950/30 text-red-300 text-xs p-3 rounded-xl flex justify-between border border-red-900/50">
                            <span className="flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> {verifyError}</span>
                            <button onClick={() => setVerifyError('')} className="underline hover:text-red-200">Dismiss</button>
                        </div>
                    )}

                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Column 1: Input Form */}
                        <div className="w-full lg:w-[35%] shrink-0">
                            <MagicCard className="h-full bg-transparent" gradientColor='hsl(var(--muted))'>
                                <GlassCard>
                                    <div className="p-5 flex flex-col h-full">
                                        <div className="flex items-center gap-2 mb-5">
                                            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-secondary/10"><FileSearch className="w-3.5 h-3.5 text-secondary" /></div>
                                            <span className="text-[13px] font-semibold">Verification Engine</span>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 block">Patient Wallet Address</label>
                                                <input type="text" placeholder="0x..." value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-[12px] font-mono bg-background" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 block">Record / Token ID</label>
                                                <input type="text" placeholder="e.g. 12" value={tokenId} onChange={(e) => setTokenId(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-[12px] font-mono bg-background" />
                                            </div>

                                            <ShimmerButton onClick={handleVerify} disabled={isVerifying || !walletAddress || !tokenId} className="w-full py-3 mt-2 rounded-xl text-[12px] font-bold border-none" background='hsl(var(--accent))'>
                                                <span className="flex items-center gap-2 text-background">
                                                    {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                                    {isVerifying ? 'Running Cryptographic Checks...' : 'Execute Triple-Check'}
                                                </span>
                                            </ShimmerButton>
                                        </div>
                                    </div>
                                </GlassCard>
                            </MagicCard>
                        </div>

                        {/* Column 2: Results & Audit Trail */}
                        <div className="flex-1 flex flex-col gap-4 min-w-0">
                            <MagicCard className="bg-transparent" gradientColor='hsl(var(--muted))'>
                                <GlassCard>
                                    <div className="p-5">
                                        <div className="flex items-center gap-2 mb-5">
                                            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-900/20"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /></div>
                                            <span className="text-[13px] font-semibold">Triple-Check Results</span>
                                        </div>

                                        {!verificationResult ? (
                                            <div className="flex flex-col items-center justify-center py-10 opacity-50">
                                                <Search className="w-8 h-8 mb-3 text-muted-foreground" />
                                                <p className="text-[11px] text-muted-foreground">Enter a Patient Wallet and Token ID to begin verification.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <VerificationCheckRow icon={Fingerprint} label="1. Provider Authenticity" description="Verified signature of the issuing medical professional." verified={verificationResult.signature} delay={0.1} />
                                                <VerificationCheckRow icon={Hash} label="2. Cryptographic Integrity" description="IPFS CID hash matches immutable blockchain record." verified={verificationResult.hashMatch} delay={0.3} />
                                                <VerificationCheckRow icon={AlertTriangle} label="3. Version Control" description={verificationResult.notSuperseded ? "This is the latest, un-amended version." : "WARNING: This record has been superseded/amended."} verified={verificationResult.notSuperseded} delay={0.5} />

                                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mt-5 pt-5 border-t border-border">
                                                    {/* If it passed checks (even if superseded, we let them view it but show a warning) */}
                                                    {verificationResult.signature && verificationResult.hashMatch ? (
                                                        <div className="space-y-3">
                                                            {!verificationResult.notSuperseded && (
                                                                <div className="bg-amber-950/20 border border-amber-900/50 p-3 rounded-xl flex items-start gap-3">
                                                                    <FileWarning className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                                                    <div>
                                                                        <p className="text-[11px] font-bold text-amber-500">Outdated Record Warning</p>
                                                                        <p className="text-[10px] text-muted-foreground mt-0.5">This file is authentic, but a newer version exists. Check the Audit Trail below.</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <Button onClick={(e) => handleViewDocument(e, verificationResult.cid)} className={`w-full py-5 rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 ${verificationResult.notSuperseded ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-amber-600 hover:bg-amber-700 text-white'}`}>
                                                                <Download className="w-4 h-4" /> Open Verified Document
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="bg-red-950/20 border border-red-900/50 p-3 rounded-xl text-center">
                                                            <p className="text-[11px] font-bold text-red-500">Fraud Detected</p>
                                                            <p className="text-[10px] text-muted-foreground mt-0.5">This document failed cryptographic verification. Do not process this claim.</p>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            </div>
                                        )}
                                    </div>
                                </GlassCard>
                            </MagicCard>

                            {/* NEW: The Audit Trail UI */}
                            {auditTrail.length > 0 && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
                                    <MagicCard className="bg-transparent" gradientColor='hsl(var(--muted))'>
                                        <GlassCard className="p-5">
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-secondary/10"><History className="w-3.5 h-3.5 text-secondary" /></div>
                                                <span className="text-[13px] font-semibold">Chain of Custody (Audit Trail)</span>
                                            </div>

                                            <div className="relative pl-3 border-l border-border/50 ml-3 space-y-6 mt-4">
                                                {auditTrail.map((entry, index) => {
                                                    const isLatest = index === 0;
                                                    return (
                                                        <div key={entry.recordId} className="relative">
                                                            <div className={`absolute -left-[17px] top-1 w-3 h-3 rounded-full border-2 border-background ${isLatest ? 'bg-emerald-500' : 'bg-muted-foreground'}`}></div>
                                                            <div className={`p-3 rounded-xl border ${isLatest ? 'border-emerald-500/30 bg-emerald-950/10' : 'border-border bg-background/30'}`}>
                                                                <div className="flex justify-between items-start mb-1">
                                                                    <div className="text-[12px] font-bold flex items-center gap-2">
                                                                        Record #{entry.recordId}
                                                                        {isLatest ? <Badge variant="outline" className="text-[8px] h-4 px-1.5 border-emerald-500/50 text-emerald-500">Latest</Badge> : <Badge variant="outline" className="text-[8px] h-4 px-1.5 border-amber-500/50 text-amber-500">Superseded</Badge>}
                                                                    </div>
                                                                    <button onClick={(e) => handleViewDocument(e, entry.ipfsCid || entry.ipfs_cid || entry.cid)} className="text-[10px] flex items-center gap-1 text-secondary hover:underline">
                                                                        <Eye className="w-3 h-3"/> View
                                                                    </button>
                                                                </div>
                                                                <p className="text-[10px] text-muted-foreground mb-1">{entry.recordType || 'Medical Document'}</p>
                                                                <p className="text-[9px] font-mono text-muted-foreground truncate">Doctor: {entry.doctorAddress || entry.doctor_address}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </GlassCard>
                                    </MagicCard>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
