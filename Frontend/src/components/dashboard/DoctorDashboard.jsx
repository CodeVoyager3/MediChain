import React, { useState, useEffect, useCallback } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { createThirdwebClient } from "thirdweb";
import { upload } from "thirdweb/storage";

const client = createThirdwebClient({
    clientId: import.meta.env.VITE_CLIENT_ID,
});

import {
    LayoutDashboard, Users, Clock, Settings, LogOut,
    Stethoscope, Activity, Search, Plus, Calendar,
    Menu, HelpCircle, Mail, Filter, CheckCircle2, ShieldCheck,
    Upload, AlertTriangle, FileSignature, FileUp, ShieldAlert,
    ChevronsLeft, ClipboardList, Hospital, Bell, Download, Loader2, X
} from 'lucide-react';
import { AnimatedThemeToggler } from '../magicui/animated-theme-toggler';

import { Card as ShadcnCard, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

import { MagicCard } from '../magicui/magic-card';
import { NumberTicker } from '../magicui/number-ticker';
import { ShimmerButton } from '../magicui/shimmer-button';

import { motion, AnimatePresence } from 'framer-motion';
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

/* ─── Sidebar nav item ──────────────────────────────────── */
function NavItem({ item, active, onClick, badgeOverride }) {
    const Icon = item.icon;
    const badgeVal = badgeOverride != null ? badgeOverride : item.badge;
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
            {badgeVal != null && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
                    ${active
                        ? 'bg-secondary/20 text-secondary'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                    {badgeVal}
                </span>
            )}
        </button>
    );
}

/* ─── Sidebar ───────────────────────────────────────────── */
function Sidebar({ activeNav, setActiveNav, setMobileOpen, onLogout, waitingCount }) {
    return (
        <aside className="flex flex-col w-[240px] shrink-0 h-full bg-background border-r border-border">
            <div className="flex items-center justify-between px-5 py-[18px] border-b border-border">
                <img src="/logo.png" alt="MediChain Doctor" className="h-8 w-auto object-contain" />
                <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-muted-foreground hover:bg-muted transition-colors">
                    <ChevronsLeft className="w-4 h-4" />
                </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-2 text-muted-foreground">
                        Main Menu
                    </p>
                    <ul className="space-y-0.5">
                        {NAV.main.map(item => (
                            <li key={item.id}>
                                <NavItem
                                    item={item}
                                    active={activeNav === item.id}
                                    badgeOverride={item.id === 'waiting' ? waitingCount : undefined}
                                    onClick={() => { setActiveNav(item.id); setMobileOpen(false); }}
                                />
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-2 text-muted-foreground">
                        Features
                    </p>
                    <ul className="space-y-0.5">
                        {NAV.features.map(item => (
                            <li key={item.id}>
                                <NavItem item={item} active={activeNav === item.id} onClick={() => { setActiveNav(item.id); setMobileOpen(false); }} />
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-2 text-muted-foreground">
                        General
                    </p>
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

/* ─── Main Dashboard ────────────────────────────────────── */
export default function DoctorDashboard() {
    const account = useActiveAccount();
    const { user, logout } = useAuth();
    const [activeNav, setActiveNav] = useState('overview');
    const [mobileOpen, setMobileOpen] = useState(false);

    // Live data states
    const [waitingRoom, setWaitingRoom] = useState([]);
    const [grantedRecords, setGrantedRecords] = useState([]);
    const [mintedRecords, setMintedRecords] = useState([]);
    const [loadingWaiting, setLoadingWaiting] = useState(true);
    const [loadingRecords, setLoadingRecords] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    
    // IPFS Upload states
    const [fileToMint, setFileToMint] = useState(null);
    const [patientAddressToMint, setPatientAddressToMint] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    // Amend states
    const [amendingRecordId, setAmendingRecordId] = useState(null);
    const [amendFile, setAmendFile] = useState(null);
    const [isAmending, setIsAmending] = useState(false);

    const displayName = user?.name || 'Doctor';

    // Fetch waiting room on mount
    const fetchWaitingRoom = useCallback(async () => {
        setLoadingWaiting(true);
        setErrorMsg('');
        try {
            const res = await getWaitingRoom();
            setWaitingRoom(res.data || []);
        } catch (err) {
            console.error('Failed to load waiting room:', err);
            setErrorMsg(err.message || 'Failed to load waiting room');
            // Use fallback empty array
            setWaitingRoom([]);
        } finally {
            setLoadingWaiting(false);
        }
    }, []);

    useEffect(() => { fetchWaitingRoom(); }, [fetchWaitingRoom]);

    // Poll waiting room every 10 seconds for live updates
    useEffect(() => {
        const interval = setInterval(() => {
            getWaitingRoom().then(res => setWaitingRoom(res.data || [])).catch(() => {});
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleCompleteAppointment = async (checkInId) => {
        try {
            await completeAppointment(checkInId);
            fetchWaitingRoom(); // Refresh
        } catch (err) {
            setErrorMsg(err.message || 'Failed to complete appointment');
        }
    };

    // Fetch accessible records when a patient is selected
    const handleSelectPatient = async (patientAddress) => {
        setSelectedPatient(patientAddress);
        setLoadingRecords(true);
        setGrantedRecords([]);
        try {
            const res = await getAccessibleRecords(patientAddress);
            // Backend returns List<AccessGrant> with: id, patientAddress, viewerAddress, recordId, expiresAt
            setGrantedRecords(res.data || []);
        } catch (err) {
            console.error('Failed to load accessible records:', err);
            setGrantedRecords([]);
        } finally {
            setLoadingRecords(false);
        }
    };

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFileToMint(e.target.files[0]);
        }
    };

    const handleUploadAndMint = async () => {
        if (!fileToMint || !patientAddressToMint) {
            setErrorMsg("Please select a file and enter a patient wallet address.");
            return;
        }

        setIsUploading(true);
        setErrorMsg('');

        try {
            // 1. Upload to IPFS using thirdweb
            const uri = await upload({
                client,
                files: [fileToMint],
            });

            // 2. Mint the record on backend (backend calls blockchain)
            await mintRecord(patientAddressToMint, uri);
            
            // Success reset
            setFileToMint(null);
            setPatientAddressToMint('');
            
            // Quick local state update to simulate view
            setMintedRecords(prev => [{
                id: Date.now(),
                recordId: 'New',
                recordType: fileToMint.name,
                patientAddress: patientAddressToMint,
                status: 'Minted'
            }, ...prev]);

            alert("Record minted successfully!");
        } catch (err) {
            console.error("Mint error:", err);
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
            // 1. Upload corrected file to IPFS
            const uri = await upload({ client, files: [amendFile] });

            // 2. Call amend endpoint (same as mint but with previousRecordId)
            await amendRecord(record.patientAddress, uri, record.recordId);

            // 3. Mark old record as superseded in local state
            setMintedRecords(prev => prev.map(r =>
                (r.recordId === record.recordId || r.id === record.id)
                    ? { ...r, status: 'Superseded', superseded: true }
                    : r
            ));

            // 4. Add the new amended record
            setMintedRecords(prev => [{
                id: Date.now(),
                recordId: 'New',
                recordType: `Amended: ${amendFile.name}`,
                patientAddress: record.patientAddress,
                status: 'Minted',
                previousRecordId: record.recordId,
            }, ...prev]);

            // Reset
            setAmendingRecordId(null);
            setAmendFile(null);
            alert('Record amended successfully! Old version is now superseded.');
        } catch (err) {
            console.error('Amend error:', err);
            setErrorMsg(err.message || 'Failed to amend record');
        } finally {
            setIsAmending(false);
        }
    };

    return (
        <div className="flex h-screen overflow-hidden font-body bg-background">
            {/* Sidebar */}
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
                                Welcome, Dr. {displayName} 👋
                            </h1>
                            <p className="text-[11px] hidden sm:block text-muted-foreground">
                                Clinic Dashboard & Patient Hub
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Date + Export */}
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

                        {/* Search */}
                        <div className="hidden lg:flex items-center gap-2 border border-border rounded-xl px-3 py-[7px] text-[11px] w-56 bg-card text-muted-foreground focus-within:bg-muted focus-within:ring-2 focus-within:ring-secondary/40 transition-colors cursor-text">
                            <Search className="w-3.5 h-3.5 shrink-0" />
                            <input type="text" placeholder="Search patients or records..." className="flex-1 bg-transparent border-none outline-none text-foreground min-w-0" />
                            <span className="text-[10px] border border-border rounded px-1.5 font-medium text-muted-foreground shrink-0">⌘K</span>
                        </div>

                        {[HelpCircle, Mail].map((Icon, i) => (
                            <button key={i} className="hidden sm:flex w-8 h-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted transition-colors">
                                <Icon className="w-4 h-4" />
                            </button>
                        ))}

                        {/* Bell */}
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

                <motion.main 
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
                    }}
                    className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 lg:py-5 space-y-4 relative z-10"
                >
                    {/* Error banner */}
                    {errorMsg && (
                        <div className="bg-red-950/30 border border-red-900/50 text-red-300 text-xs p-3 rounded-xl flex items-center justify-between">
                            <span>{errorMsg}</span>
                            <button onClick={fetchWaitingRoom} className="underline ml-2">Retry</button>
                        </div>
                    )}

                    {/* Row 1 */}
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Waiting Room QR Check-in */}
                        <motion.div variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }} className="w-full lg:w-[42%] shrink-0">
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
                                                    const initials = p.patientAddress ? p.patientAddress.slice(-2).toUpperCase() : 'PA';
                                                    const isSelected = selectedPatient === p.patientAddress;
                                                    return (
                                                        <motion.div variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} key={p.id || p.patientAddress} 
                                                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${isSelected ? 'border-secondary bg-secondary/5' : 'border-border bg-background/80 hover:bg-secondary/5'}`}
                                                            onClick={() => handleSelectPatient(p.patientAddress)}
                                                        >
                                                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 shadow-sm" style={isVerified ? { background: 'linear-gradient(135deg, #D2E75F, #c2d44e)', color: 'hsl(var(--background))' } : { background: 'hsl(var(--muted))', color: '#888' }}>
                                                                {initials}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[12px] font-semibold truncate text-foreground">{addrShort}</p>
                                                                <p className="text-[10px] truncate text-muted-foreground">Checked in {p.checkInTime ? new Date(p.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'recently'}</p>
                                                            </div>
                                                            <div className="shrink-0 flex items-center gap-2">
                                                                <Badge variant="outline" className={`text-[10px] border-none shadow-sm ${isVerified ? 'bg-secondary/10 text-secondary' : 'bg-muted text-muted-foreground'}`}>
                                                                    {isVerified && <ShieldCheck className="w-3 h-3 mr-1" />}
                                                                    {p.status || 'Waiting'}
                                                                </Badge>
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
                                        <Button variant="ghost" className="w-full mt-3 text-[11px] h-8 text-muted-foreground hover:bg-muted">View All Patients</Button>
                                    </div>
                                </GlassCard>
                            </MagicCard>
                        </motion.div>

                        {/* Patient View (Granted Records) */}
                        <motion.div variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }} className="flex-1 flex flex-col min-w-0">
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
                                                    <p className="text-xs text-muted-foreground">Select a patient from the waiting room to view their granted records.</p>
                                                </div>
                                            ) : loadingRecords ? (
                                                <div className="col-span-2 flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
                                            ) : grantedRecords.length === 0 ? (
                                                <div className="col-span-2 flex items-center justify-center py-8">
                                                    <p className="text-xs text-muted-foreground">This patient has not granted you access to any records yet.</p>
                                                </div>
                                            ) : (
                                                grantedRecords.slice(0, 4).map(grant => (
                                                    <div key={grant.id || grant.recordId} className="p-4 rounded-xl border border-border transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 bg-background cursor-pointer shadow-sm group">
                                                        <div className="flex items-start justify-between mb-3 relative z-10">
                                                            <IconBadge icon={Activity} bgClass="bg-secondary/15" colorClass="text-secondary" />
                                                            <Badge className="bg-secondary/10 text-secondary hover:bg-secondary/20 text-[9px] border-none">
                                                                Granted
                                                            </Badge>
                                                        </div>
                                                        <h3 className="text-[13px] font-bold text-foreground mb-1 relative z-10">Record #{grant.recordId}</h3>
                                                        <p className="text-[11px] text-muted-foreground mb-2 relative z-10">Patient: {grant.patientAddress ? `${grant.patientAddress.slice(0,6)}…${grant.patientAddress.slice(-4)}` : 'Unknown'}</p>
                                                        <p className="text-[10px] text-secondary font-medium relative z-10">Expires: {grant.expiresAt ? new Date(grant.expiresAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </GlassCard>
                            </MagicCard>
                        </motion.div>
                    </div>

                    {/* Row 2 - Upload & Amend */}
                    <motion.div 
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="flex flex-col lg:flex-row gap-4"
                    >
                        {/* Mint New Record */}
                        <div className="flex-1 shrink-0 min-w-0">
                            <MagicCard className="h-full bg-transparent overflow-hidden" gradientColor='hsl(var(--muted))'>
                                <GlassCard>
                                    <div className="p-5 flex flex-col h-full relative z-10">
                                        <div className="flex items-center justify-between mb-4 relative z-10">
                                            <div className="flex items-center gap-2">
                                                <IconBadge icon={FileUp} />
                                                <span className="text-[13px] font-semibold text-muted-foreground">Upload & Mint Record</span>
                                            </div>
                                            <FloatingCube className="w-[100px] h-[100px] absolute -top-8 -right-6 opacity-80 z-0 hidden sm:block pointer-events-none mix-blend-plus-lighter" />
                                        </div>
                                        
                                        <div className="border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center bg-background/50 text-center transition-all duration-300 relative z-10 flex-1">
                                            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-3">
                                                <Upload className="w-5 h-5 text-accent" />
                                            </div>
                                            <h3 className="text-[13px] font-semibold text-foreground mb-1">Upload file to mint</h3>
                                            <p className="text-[11px] text-muted-foreground mb-4 max-w-[200px]">Securely mint a new medical record to a patient's Web3 wallet.</p>
                                            
                                            <div className="w-full max-w-[280px] flex flex-col gap-3">
                                                <input 
                                                    type="text" 
                                                    placeholder="Patient Wallet Address (0x...)" 
                                                    value={patientAddressToMint}
                                                    onChange={(e) => setPatientAddressToMint(e.target.value)}
                                                    className="w-full text-[11px] px-3 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-1 focus:ring-accent"
                                                />
                                                <input 
                                                    type="file" 
                                                    accept=".pdf,.png,.jpg,.jpeg,.dcm" 
                                                    onChange={handleFileChange}
                                                    className="w-full text-[11px] block file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-muted file:text-foreground hover:file:bg-border cursor-pointer text-muted-foreground"
                                                />
                                                <ShimmerButton 
                                                    onClick={handleUploadAndMint}
                                                    disabled={isUploading || !fileToMint || !patientAddressToMint}
                                                    className={`py-3 px-8 rounded-xl text-[13px] font-semibold border-none flex mt-2 shadow-[0_0_20px_#FF99CC80] ${(!fileToMint || !patientAddressToMint || isUploading) ? 'opacity-50 cursor-not-allowed' : ''}`} 
                                                    background='hsl(var(--accent))' 
                                                    shimmerColor="#FFFFFF"
                                                >
                                                    <span className="flex items-center gap-1.5 text-background font-bold">
                                                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                                        {isUploading ? 'Minting...' : 'Mint Record'}
                                                    </span>
                                                </ShimmerButton>
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>
                            </MagicCard>
                        </div>

                        {/* Recent minted records & Amend flow */}
                        <div className="w-full lg:w-[50%]">
                            <MagicCard className="h-full bg-transparent overflow-hidden" gradientColor="#2a1a1a">
                                <GlassCard interactive={false}>
                                    <div className="p-5 relative z-10">
                                        <div className="flex items-center justify-between mb-4">
                                             <div className="flex items-center gap-2">
                                                <IconBadge icon={FileSignature} />
                                                <span className="text-[13px] font-semibold text-muted-foreground">Recent Minted Records</span>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            {mintedRecords.length === 0 ? (
                                                <p className="text-xs text-muted-foreground text-center py-6">No minted records yet. Use the upload panel to create one.</p>
                                            ) : (
                                                mintedRecords.slice(0, 5).map(r => {
                                                    const isError = r.status === 'Error';
                                                    const isSuperseded = r.status === 'Superseded' || r.superseded;
                                                    const isAmendTarget = amendingRecordId === (r.recordId || r.id);
                                                    return (
                                                        <div key={r.recordId || r.id} className={`p-3 rounded-xl border shadow-sm transition-all duration-300 ${isSuperseded ? 'border-amber-900/50 bg-amber-950/10 opacity-70' : 'border-border bg-background/80 hover:-translate-x-1'}`}>
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isError ? 'bg-red-900/30' : isSuperseded ? 'bg-amber-900/30' : 'bg-muted'}`}>
                                                                        <Activity className={`w-4 h-4 ${isError ? 'text-red-500' : isSuperseded ? 'text-amber-500' : 'text-muted-foreground'}`} />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[12px] font-semibold text-foreground">{r.recordType || 'Medical Record'}</p>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-[10px] text-muted-foreground">To: {r.patientAddress ? `${r.patientAddress.slice(0,6)}…${r.patientAddress.slice(-4)}` : 'Unknown'}</span>
                                                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">#{r.recordId}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    {isSuperseded ? (
                                                                        <Badge variant="outline" className="text-[10px] bg-amber-900/30 text-amber-400 border-amber-900/50 shadow-sm">
                                                                            Superseded
                                                                        </Badge>
                                                                    ) : (
                                                                        <>
                                                                            <button
                                                                                onClick={() => setAmendingRecordId(isAmendTarget ? null : (r.recordId || r.id))}
                                                                                className="text-[9px] font-semibold px-2 py-1 rounded-lg bg-amber-950/40 text-amber-400 hover:bg-amber-900/50 transition-colors"
                                                                            >
                                                                                {isAmendTarget ? 'Cancel' : 'Amend'}
                                                                            </button>
                                                                            <Badge variant="outline" className="text-[10px] bg-secondary/10 text-secondary border-secondary/20 shadow-sm">
                                                                                Immutable
                                                                            </Badge>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {/* Amend Panel */}
                                                            {isAmendTarget && (
                                                                <div className="mt-3 pt-3 border-t border-border space-y-2">
                                                                    <p className="text-[10px] text-amber-400 font-semibold">Upload corrected file to supersede this record:</p>
                                                                    <input
                                                                        type="file"
                                                                        accept=".pdf,.png,.jpg,.jpeg,.dcm"
                                                                        onChange={e => setAmendFile(e.target.files?.[0] || null)}
                                                                        className="w-full text-[10px] block file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[9px] file:font-semibold file:bg-muted file:text-foreground cursor-pointer text-muted-foreground"
                                                                    />
                                                                    <button
                                                                        onClick={() => handleAmendRecord(r)}
                                                                        disabled={!amendFile || isAmending}
                                                                        className="w-full py-2 rounded-lg text-[11px] font-semibold bg-amber-500 text-background disabled:opacity-50 flex items-center justify-center gap-1.5"
                                                                    >
                                                                        {isAmending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSignature className="w-3.5 h-3.5" />}
                                                                        {isAmending ? 'Amending…' : 'Amend & Supersede'}
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                        <div className="mt-4 flex items-start gap-2 bg-amber-950/30 border border-amber-900/50 p-3 rounded-xl shadow-sm">
                                            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-[11px] font-semibold text-amber-300">Audit Trail Notice</p>
                                                <p className="text-[10px] text-amber-400/80 mt-0.5 leading-snug">Using the <b>Amend Record</b> function triggers an immutable audit log on the blockchain, preserving both original and corrected versions.</p>
                                            </div>
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
