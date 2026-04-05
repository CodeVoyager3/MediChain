import React, { useState, useCallback } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import {
    LayoutDashboard, Search, Calendar, Menu, Bell, Settings, LogOut,
    ShieldCheck, FileSearch, CheckCircle2, XCircle, Hash,
    ChevronsLeft, Clock, AlertTriangle, Eye, Lock, Fingerprint, Link2, Loader2,
    Activity, CircleDot, Download
} from 'lucide-react';
import { AnimatedThemeToggler } from '../magicui/animated-theme-toggler';
import { Badge } from '../ui/badge';
import { MagicCard } from '../magicui/magic-card';
import { NumberTicker } from '../magicui/number-ticker';
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
                <button onClick={() => setMobileOpen(false)} className="lg:hidden"><ChevronsLeft className="w-4 h-4" /></button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
                <div>
                    <ul className="space-y-0.5">
                        {NAV.main.map(item => (
                            <li key={item.id}><button onClick={() => setActiveNav(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] ${activeNav === item.id ? 'bg-secondary/10 text-secondary' : 'text-muted-foreground'}`}><item.icon className="w-4 h-4" />{item.label}</button></li>
                        ))}
                    </ul>
                </div>
                <div>
                    <ul className="space-y-0.5">
                        {NAV.general.map(item => (
                            <li key={item.id}><button onClick={item.id === 'logout' ? onLogout : undefined} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-muted-foreground hover:bg-muted"><item.icon className="w-4 h-4" />{item.label}</button></li>
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
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${verified ? 'bg-emerald-900/20' : 'bg-red-900/20'}`}><Icon className={`w-5 h-5 ${verified ? 'text-emerald-500' : 'text-red-500'}`} /></div>
            <div className="flex-1"><p className="text-[12px] font-semibold">{label}</p><p className="text-[10px] text-muted-foreground">{description}</p></div>
            <div>{verified ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-red-500" />}</div>
        </motion.div>
    );
}

export default function InsuranceDashboard() {
    const account = useActiveAccount();
    const { user, logout } = useAuth();
    const [activeNav, setActiveNav] = useState('overview');

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

    const handleVerify = useCallback(async () => {
        if (!walletAddress || !tokenId) return;
        setIsVerifying(true); setVerifyError(''); setVerificationResult(null);
        try {
            const recordId = parseInt(tokenId.replace('#', ''), 10);
            const insurerAddress = account?.address || user?.walletAddress;
            const res = await viewRecordAsInsurer(insurerAddress, walletAddress, recordId);

            const payload = res.data || res;
            const security = payload.securityChecks || payload;

            setVerificationResult({
                signature: security.authenticityVerified ?? true,
                hashMatch: security.integrityVerified ?? true,
                notSuperseded: !(payload.recordData?.isSuperseded || payload.isSuperseded || false),
            });

            const trail = payload.auditTrail || [];
            setAuditTrail(trail.map((entry, i) => ({
                id: `v${trail.length - i}`, version: i === 0 ? 'Latest' : 'Superseded',
                date: entry.recordType || 'Record', hash: entry.txHash || '0x...', doctor: entry.doctorAddress || 'Unknown',
                rawCid: entry.ipfsCid || entry.cid
            })));
        } catch (err) { setVerifyError(err.message); } finally { setIsVerifying(false); }
    }, [walletAddress, tokenId, account, user]);

    return (
        <div className="flex h-screen overflow-hidden font-body bg-background">
            <div className="hidden lg:flex"><Sidebar activeNav={activeNav} setActiveNav={setActiveNav} onLogout={logout} /></div>

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="flex items-center justify-between px-4 py-3.5 border-b border-border">
                    <h1 className="text-[15px] font-semibold text-foreground">Claims Engine</h1>
                    <AnimatedThemeToggler />
                </header>

                <main className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="w-full lg:w-[45%]">
                            <MagicCard gradientColor='hsl(var(--muted))'>
                                <GlassCard className="p-5">
                                    <div className="flex items-center gap-2 mb-5"><FileSearch className="w-4 h-4 text-secondary" /><span className="text-[13px] font-semibold">Verification Engine</span></div>
                                    <div className="space-y-4">
                                        <input type="text" placeholder="Patient Wallet (0x...)" value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} className="w-full border rounded-xl px-3 py-2 text-[12px] font-mono bg-background" />
                                        <input type="text" placeholder="Token ID" value={tokenId} onChange={(e) => setTokenId(e.target.value)} className="w-full border rounded-xl px-3 py-2 text-[12px] font-mono bg-background" />
                                        {verifyError && <p className="text-xs text-red-400">{verifyError}</p>}
                                        <ShimmerButton onClick={handleVerify} disabled={isVerifying || !walletAddress || !tokenId} className="w-full py-3 text-[12px] font-bold border-none" background='hsl(var(--accent))'>
                                            <span className="text-background">{isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Execute Triple-Check'}</span>
                                        </ShimmerButton>
                                    </div>
                                </GlassCard>
                            </MagicCard>
                        </div>

                        <div className="flex-1">
                            <MagicCard gradientColor='hsl(var(--muted))'>
                                <GlassCard className="p-5 h-full flex flex-col">
                                    <div className="flex items-center gap-2 mb-5"><ShieldCheck className="w-4 h-4 text-emerald-500" /><span className="text-[13px] font-semibold">Triple-Check Results</span></div>
                                    {!verificationResult ? (
                                        <div className="flex-1 flex flex-col items-center justify-center opacity-50"><Eye className="w-8 h-8 mb-2" /><p className="text-[11px]">Awaiting data.</p></div>
                                    ) : (
                                        <div className="space-y-3">
                                            <VerificationCheckRow icon={Fingerprint} label="1. Valid Signature" verified={verificationResult.signature} />
                                            <VerificationCheckRow icon={Hash} label="2. Hash Match" verified={verificationResult.hashMatch} />
                                            <VerificationCheckRow icon={AlertTriangle} label="3. Version Integrity" verified={verificationResult.notSuperseded} />

                                            {verificationResult.signature && verificationResult.hashMatch && verificationResult.notSuperseded && (
                                                <div className="mt-4 pt-4 border-t border-border">
                                                    <ShimmerButton onClick={(e) => handleViewDocument(e, auditTrail[0]?.rawCid)} className="w-full py-2.5 rounded-xl text-[12px] font-bold border-none" background='hsl(var(--emerald-600))'>
                                                        <span className="flex items-center gap-2 text-white"><Download className="w-4 h-4" /> Open Verified PDF</span>
                                                    </ShimmerButton>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </GlassCard>
                            </MagicCard>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
