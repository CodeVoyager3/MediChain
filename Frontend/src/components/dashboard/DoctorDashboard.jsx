import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { createThirdwebClient } from "thirdweb";
import { upload } from "thirdweb/storage";

const client = createThirdwebClient({
    clientId: import.meta.env.VITE_CLIENT_ID,
});

import {
    LayoutDashboard, Users, Clock, Settings, LogOut,
    Activity, Search, Plus, Calendar,
    Menu, HelpCircle, Mail, ShieldCheck,
    Upload, FileSignature, FileUp, ShieldAlert,
    ChevronsLeft, ClipboardList, Bell, Download, Loader2
} from 'lucide-react';
import { AnimatedThemeToggler } from '../magicui/animated-theme-toggler';

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { MagicCard } from '../magicui/magic-card';
import { ShimmerButton } from '../magicui/shimmer-button';

import { motion } from 'framer-motion';
import { FloatingCube } from '../effects/FloatingCube';
import { AmbientParticles } from '../effects/AmbientParticles';
import { GlassCard } from '../effects/GlassCard';

import { useAuth } from '../../context/AuthContext';
import { getWaitingRoom, getAccessibleRecords, completeAppointment, mintRecord, amendRecord } from '../../services/api';

const NAV = {
    main: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'waiting', label: 'Waiting Room', icon: Clock, badge: null },
        { id: 'patients', label: 'Patients', icon: Users },
        { id: 'appointments', label: 'Appointments', icon: Calendar },
    ],
    features: [
        { id: 'records', label: 'Mint Records', icon: Upload },
        { id: 'prescriptions', label: 'Prescriptions', icon: ClipboardList },
    ],
    general: [
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'logout', label: 'Log out', icon: LogOut },
    ],
};

function NavItem({ item, active, onClick, badgeOverride }) {
    const Icon = item.icon;
    const badgeVal = badgeOverride != null ? badgeOverride : item.badge;
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 text-left
                ${active ? 'bg-secondary/10 text-secondary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
        >
            <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-secondary' : 'text-muted-foreground'}`} />
            <span className="flex-1">{item.label}</span>
            {badgeVal != null && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-secondary/20 text-secondary' : 'bg-muted text-muted-foreground'}`}>
                    {badgeVal}
                </span>
            )}
        </button>
    );
}

function Sidebar({ activeNav, setActiveNav, setMobileOpen, onLogout, waitingCount }) {
    return (
        <aside className="flex flex-col w-[240px] shrink-0 h-full bg-background border-r border-border">
            <div className="flex items-center justify-between px-5 py-[18px] border-b border-border">
                <img src="/logo.png" alt="MediChain Doctor" className="h-8 w-auto object-contain" />
                <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                    <ChevronsLeft className="w-4 h-4" />
                </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-2 text-muted-foreground">Main Menu</p>
                    <ul className="space-y-0.5">
                        {NAV.main.map(item => (
                            <li key={item.id}>
                                <NavItem item={item} active={activeNav === item.id} badgeOverride={item.id === 'waiting' ? waitingCount : undefined} onClick={() => { setActiveNav(item.id); setMobileOpen(false); }} />
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
                                    <button onClick={item.id === 'logout' ? onLogout : undefined} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${item.id === 'logout' ? 'text-red-400 hover:bg-red-950/30' : 'text-muted-foreground hover:bg-muted'}`}>
                                        <Icon className="w-4 h-4 shrink-0" />{item.label}
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

export default function DoctorDashboard() {
    const account = useActiveAccount();
    const { user, logout } = useAuth();
    const [activeNav, setActiveNav] = useState('overview');
    const [mobileOpen, setMobileOpen] = useState(false);

    const [waitingRoom, setWaitingRoom] = useState([]);
    const [grantedRecords, setGrantedRecords] = useState([]);
    const [mintedRecords, setMintedRecords] = useState([]);
    const [loadingWaiting, setLoadingWaiting] = useState(true);
    const [loadingRecords, setLoadingRecords] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);

    const [fileToMint, setFileToMint] = useState(null);
    const [patientAddressToMint, setPatientAddressToMint] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const [amendingRecordId, setAmendingRecordId] = useState(null);
    const [amendFile, setAmendFile] = useState(null);
    const [isAmending, setIsAmending] = useState(false);

    const displayName = user?.name || 'Doctor';

    const fetchWaitingRoom = useCallback(async () => {
        setLoadingWaiting(true);
        setErrorMsg('');
        try {
            const res = await getWaitingRoom();
            setWaitingRoom(res.data || []);
        } catch (err) {
            setWaitingRoom([]);
        } finally {
            setLoadingWaiting(false);
        }
    }, []);

    useEffect(() => { fetchWaitingRoom(); }, [fetchWaitingRoom]);

    useEffect(() => {
        const interval = setInterval(() => {
            getWaitingRoom().then(res => setWaitingRoom(res.data || [])).catch(() => {});
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleCompleteAppointment = async (checkInId) => {
        try {
            await completeAppointment(checkInId);
            fetchWaitingRoom();
        } catch (err) {
            setErrorMsg(err.message || 'Failed to complete appointment');
        }
    };

    const handleSelectPatient = async (patientAddress) => {
        setSelectedPatient(patientAddress);
        setLoadingRecords(true);
        setGrantedRecords([]);
        try {
            const res = await getAccessibleRecords(patientAddress);
            setGrantedRecords(res.data || []);
        } catch (err) {
            setGrantedRecords([]);
        } finally {
            setLoadingRecords(false);
        }
    };

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    const handleUploadAndMint = async () => {
        if (!fileToMint || !patientAddressToMint) {
            setErrorMsg("Please select a file and enter a patient wallet address.");
            return;
        }

        setIsUploading(true);
        setErrorMsg('');

        try {
            const uri = await upload({ client, files: [fileToMint] });
            await mintRecord(patientAddressToMint, uri);

            setFileToMint(null);
            setPatientAddressToMint('');
            setMintedRecords(prev => [{
                id: Date.now(),
                recordId: 'New',
                recordType: fileToMint.name,
                patientAddress: patientAddressToMint,
                status: 'Minted'
            }, ...prev]);
            alert("Record minted successfully!");
        } catch (err) {
            setErrorMsg(err.message || 'Failed to mint record');
        } finally {
            setIsUploading(false);
        }
    };

    const handleAmendRecord = async (record) => {
        if (!amendFile) {
            setErrorMsg('Please select a corrected file to upload.');
            return;
        }
        setIsAmending(true);
        setErrorMsg('');
        try {
            const uri = await upload({ client, files: [amendFile] });
            await amendRecord(record.patientAddress, uri, record.recordId || record.id);

            setMintedRecords(prev => prev.map(r =>
                (r.recordId === record.recordId || r.id === record.id)
                    ? { ...r, status: 'Superseded', superseded: true }
                    : r
            ));
            setMintedRecords(prev => [{
                id: Date.now(),
                recordId: 'New',
                recordType: `Amended: ${amendFile.name}`,
                patientAddress: record.patientAddress,
                status: 'Minted',
                previousRecordId: record.recordId,
            }, ...prev]);

            setAmendingRecordId(null);
            setAmendFile(null);
            alert('Record amended successfully! Old version is now superseded.');
        } catch (err) {
            setErrorMsg(err.message || 'Failed to amend record');
        } finally {
            setIsAmending(false);
        }
    };

    return (
        <div className="flex h-screen overflow-hidden font-body bg-background">
            <div className="hidden lg:flex">
                <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} setMobileOpen={setMobileOpen} onLogout={handleLogout} waitingCount={waitingRoom.length || null} />
            </div>

            {mobileOpen && (
                <>
                    <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
                    <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
                        <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} setMobileOpen={setMobileOpen} onLogout={handleLogout} waitingCount={waitingRoom.length || null} />
                    </div>
                </>
            )}

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <AmbientParticles />
                <header className="flex items-center justify-between px-4 lg:px-6 py-3.5 bg-background border-b border-border shrink-0 relative z-20">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors">
                            <Menu className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-[15px] font-semibold leading-tight text-foreground">Welcome, Dr. {displayName} 👋</h1>
                            <p className="text-[11px] hidden sm:block text-muted-foreground">Clinic Dashboard & Patient Hub</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden md:flex items-center gap-2">
                            <div className="flex items-center gap-1.5 border border-border rounded-xl px-3 py-[7px] text-[11px] text-muted-foreground">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            </div>
                        </div>
                        <AnimatedThemeToggler />
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-background text-[11px] font-bold shrink-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #D2E75F, #c2d44e)' }}>
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                <motion.main className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 lg:py-5 space-y-4 relative z-10">
                    {errorMsg && (
                        <div className="bg-red-950/30 border border-red-900/50 text-red-300 text-xs p-3 rounded-xl flex items-center justify-between">
                            <span>{errorMsg}</span>
                            <button onClick={() => setErrorMsg('')} className="underline ml-2">Dismiss</button>
                        </div>
                    )}

                    <div className="flex flex-col lg:flex-row gap-4">
                        <motion.div className="w-full lg:w-[42%] shrink-0">
                            <MagicCard className="h-full bg-transparent overflow-hidden" gradientColor='hsl(var(--muted))'>
                                <GlassCard>
                                    <div className="p-5 relative z-10">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <IconBadge icon={Clock} />
                                                <span className="text-[13px] font-semibold text-muted-foreground">Live Waiting Room</span>
                                            </div>
                                            <Badge variant="outline" className="flex items-center gap-1.5 py-0.5 border-secondary/30 bg-secondary/10">
                                                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                                                <span className="text-[10px] font-semibold text-secondary">QR Check-in Active</span>
                                            </Badge>
                                        </div>
                                        <div className="space-y-3">
                                            {loadingWaiting ? (
                                                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
                                            ) : waitingRoom.length === 0 ? (
                                                <p className="text-xs text-muted-foreground text-center py-8">No patients waiting</p>
                                            ) : (
                                                waitingRoom.map(p => {
                                                    const isVerified = p.status === 'WAITING';
                                                    const addrShort = p.patientAddress ? `${p.patientAddress.slice(0, 6)}…${p.patientAddress.slice(-4)}` : 'Unknown';
                                                    const isSelected = selectedPatient === p.patientAddress;
                                                    return (
                                                        <motion.div key={p.id || p.patientAddress}
                                                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${isSelected ? 'border-secondary bg-secondary/5' : 'border-border bg-background/80 hover:bg-secondary/5'}`}
                                                                    onClick={() => handleSelectPatient(p.patientAddress)}
                                                        >
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[12px] font-semibold truncate text-foreground">{addrShort}</p>
                                                            </div>
                                                            <div className="shrink-0 flex items-center gap-2">
                                                                <Button size="sm" variant="outline" className="h-6 text-[9px] px-2"
                                                                        onClick={(e) => { e.stopPropagation(); handleCompleteAppointment(p.id); }}>
                                                                    Complete
                                                                </Button>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                </GlassCard>
                            </MagicCard>
                        </motion.div>

                        <motion.div className="flex-1 flex flex-col min-w-0">
                            <MagicCard className="h-full bg-transparent overflow-hidden" gradientColor='hsl(var(--muted))'>
                                <GlassCard>
                                    <div className="p-5 flex flex-col h-full relative z-10">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <IconBadge icon={ShieldCheck} />
                                                <span className="text-[13px] font-semibold text-muted-foreground">Granted Records (Web3 Access)</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                                            {!selectedPatient ? (
                                                <div className="col-span-2 flex items-center justify-center py-8">
                                                    <p className="text-xs text-muted-foreground">Select a patient from the waiting room.</p>
                                                </div>
                                            ) : loadingRecords ? (
                                                <div className="col-span-2 flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
                                            ) : grantedRecords.length === 0 ? (
                                                <div className="col-span-2 flex items-center justify-center py-8">
                                                    <p className="text-xs text-muted-foreground">No access granted.</p>
                                                </div>
                                            ) : (
                                                grantedRecords.map(grant => (
                                                    <div key={grant.id || grant.recordId} className="p-4 rounded-xl border border-border bg-background shadow-sm">
                                                        <h3 className="text-[13px] font-bold text-foreground mb-1">Record #{grant.recordId}</h3>
                                                        <p className="text-[11px] text-muted-foreground mb-2">Patient: {grant.patientAddress ? `${grant.patientAddress.slice(0,6)}…` : 'Unknown'}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </GlassCard>
                            </MagicCard>
                        </motion.div>
                    </div>

                    <motion.div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 shrink-0 min-w-0">
                            <MagicCard className="h-full bg-transparent overflow-hidden" gradientColor='hsl(var(--muted))'>
                                <GlassCard>
                                    <div className="p-5 flex flex-col h-full relative z-10">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <IconBadge icon={FileUp} />
                                                <span className="text-[13px] font-semibold text-muted-foreground">Upload & Mint Record</span>
                                            </div>
                                        </div>
                                        <div className="border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center bg-background/50 text-center">
                                            <input type="text" placeholder="Patient Wallet (0x...)" value={patientAddressToMint} onChange={(e) => setPatientAddressToMint(e.target.value)} className="w-full max-w-[280px] text-[11px] px-3 py-2 mb-3 border border-border bg-background rounded-lg focus:outline-none" />
                                            <input type="file" accept=".pdf,.png,.jpg,.jpeg,.dcm" onChange={(e) => setFileToMint(e.target.files?.[0] || null)} className="w-full max-w-[280px] text-[11px] mb-3" />
                                            <ShimmerButton onClick={handleUploadAndMint} disabled={isUploading || !fileToMint || !patientAddressToMint} className="py-3 px-8 rounded-xl text-[13px] font-semibold border-none" background='hsl(var(--accent))'>
                                                <span className="flex items-center gap-1.5 text-background font-bold">
                                                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                                    {isUploading ? 'Minting...' : 'Mint Record'}
                                                </span>
                                            </ShimmerButton>
                                        </div>
                                    </div>
                                </GlassCard>
                            </MagicCard>
                        </div>

                        <div className="w-full lg:w-[50%]">
                            <MagicCard className="h-full bg-transparent overflow-hidden" gradientColor="#2a1a1a">
                                <GlassCard interactive={false}>
                                    <div className="p-5 relative z-10">
                                        <div className="flex items-center gap-2 mb-4">
                                            <IconBadge icon={FileSignature} />
                                            <span className="text-[13px] font-semibold text-muted-foreground">Recent Minted Records</span>
                                        </div>
                                        <div className="space-y-3">
                                            {mintedRecords.length === 0 ? (
                                                <p className="text-xs text-muted-foreground text-center py-6">No minted records yet.</p>
                                            ) : (
                                                mintedRecords.slice(0, 5).map(r => {
                                                    const isSuperseded = r.status === 'Superseded' || r.superseded;
                                                    const isAmendTarget = amendingRecordId === (r.recordId || r.id);
                                                    return (
                                                        <div key={r.recordId || r.id} className={`p-3 rounded-xl border shadow-sm ${isSuperseded ? 'border-amber-900/50 bg-amber-950/10' : 'border-border bg-background/80'}`}>
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <p className="text-[12px] font-semibold text-foreground">{r.recordType || 'Medical Record'}</p>
                                                                    <p className="text-[10px] text-muted-foreground">To: {r.patientAddress.slice(0,6)}… | #{r.recordId}</p>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    {isSuperseded ? (
                                                                        <Badge variant="outline" className="text-[10px] bg-amber-900/30 text-amber-400">Superseded</Badge>
                                                                    ) : (
                                                                        <button onClick={() => setAmendingRecordId(isAmendTarget ? null : (r.recordId || r.id))} className="text-[9px] font-semibold px-2 py-1 rounded-lg bg-amber-950/40 text-amber-400">
                                                                            {isAmendTarget ? 'Cancel' : 'Amend'}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {isAmendTarget && (
                                                                <div className="mt-3 pt-3 border-t border-border space-y-2">
                                                                    <input type="file" onChange={e => setAmendFile(e.target.files?.[0] || null)} className="w-full text-[10px]" />
                                                                    <button onClick={() => handleAmendRecord(r)} disabled={!amendFile || isAmending} className="w-full py-2 rounded-lg text-[11px] font-semibold bg-amber-500 text-background flex items-center justify-center gap-1.5">
                                                                        {isAmending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSignature className="w-3.5 h-3.5" />} Amend & Supersede
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                </GlassCard>
                            </MagicCard>
                        </div>
                    </motion.div>
                </motion.main>
            </div>
        </div>
    );
}
