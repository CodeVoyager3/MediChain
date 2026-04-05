import React, { useState, useEffect, useCallback } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { createThirdwebClient } from "thirdweb";
import { upload } from "thirdweb/storage";

const client = createThirdwebClient({ clientId: import.meta.env.VITE_CLIENT_ID });

import { LayoutDashboard, Users, Clock, Settings, LogOut, Activity, Search, Plus, Calendar, Menu, HelpCircle, Mail, ShieldCheck, Upload, FileSignature, FileUp, ShieldAlert, ChevronsLeft, ClipboardList, Bell, Download, Loader2, X, Eye } from 'lucide-react';
import { AnimatedThemeToggler } from '../magicui/animated-theme-toggler';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { MagicCard } from '../magicui/magic-card';
import { ShimmerButton } from '../magicui/shimmer-button';
import { motion, AnimatePresence } from 'framer-motion';
import { AmbientParticles } from '../effects/AmbientParticles';
import { GlassCard } from '../effects/GlassCard';
import { useAuth } from '../../context/AuthContext';
import { getWaitingRoom, getAccessibleRecords, completeAppointment, mintRecord, amendRecord } from '../../services/api';

const NAV = {
    main: [{ id: 'overview', label: 'Overview', icon: LayoutDashboard }, { id: 'waiting', label: 'Waiting Room', icon: Clock }],
    features: [{ id: 'records', label: 'Mint Records', icon: Upload }],
    general: [{ id: 'settings', label: 'Settings', icon: Settings }, { id: 'logout', label: 'Log out', icon: LogOut }],
};

function Sidebar({ activeNav, setActiveNav, setMobileOpen, onLogout, waitingCount }) {
    return (
        <aside className="flex flex-col w-[240px] shrink-0 h-full bg-background border-r border-border">
            <div className="flex items-center justify-between px-5 py-[18px] border-b border-border">
                <img src="/logo.png" alt="MediChain" className="h-8 w-auto object-contain" />
                <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-muted"><ChevronsLeft className="w-4 h-4" /></button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
                <div>
                    <ul className="space-y-0.5">
                        {NAV.main.map(item => (
                            <li key={item.id}><button onClick={() => { setActiveNav(item.id); setMobileOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] ${activeNav === item.id ? 'bg-secondary/10 text-secondary' : 'text-muted-foreground hover:bg-muted'}`}><item.icon className="w-4 h-4 shrink-0" /> <span className="flex-1 text-left">{item.label}</span>{item.id === 'waiting' && waitingCount > 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-secondary/20 text-secondary">{waitingCount}</span>}</button></li>
                        ))}
                    </ul>
                </div>
            </nav>
        </aside>
    );
}

function IconBadge({ icon: Icon }) {
    return <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-secondary/10"><Icon className="w-3.5 h-3.5 text-secondary" /></div>;
}

export default function DoctorDashboard() {
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
    const [manualSearchQuery, setManualSearchQuery] = useState('');

    const [fileToMint, setFileToMint] = useState(null);
    const [patientAddressToMint, setPatientAddressToMint] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const [amendingRecordId, setAmendingRecordId] = useState(null);
    const [amendFile, setAmendFile] = useState(null);
    const [isAmending, setIsAmending] = useState(false);

    const displayName = user?.name || 'Doctor';

    const normalizeCid = (value) => {
        if (!value) return null;
        let v = String(value).trim();
        if (v.startsWith("ipfs://")) v = v.replace("ipfs://", "");
        if (v.includes("/")) v = v.split("/")[0];
        return v.length > 10 ? v : null;
    };

    const getCid = (r) => normalizeCid(
        r.ipfsCid ||
        r.ipfs_cid ||
        r.cid ||
        r.record?.ipfsCid ||
        r.record?.ipfs_cid
    );

    const getRecordId = (r) => r.recordId ?? r.record_id ?? r.id;

    const handleViewDocument = (e, cid) => {
        e.stopPropagation();
        if (!cid) { alert("Record metadata endpoint does not provide CID for this doctor view."); return; }
        window.open(`https://gateway.pinata.cloud/ipfs/${cid}`, '_blank', 'noopener,noreferrer');
    };

    const fetchWaitingRoom = useCallback(async () => {
        setLoadingWaiting(true);
        try { const res = await getWaitingRoom(); setWaitingRoom(res.data || []); }
        catch (err) { setWaitingRoom([]); }
        finally { setLoadingWaiting(false); }
    }, []);

    useEffect(() => { fetchWaitingRoom(); }, [fetchWaitingRoom]);

    const handleCompleteAppointment = async (checkInId) => {
        try {
            await completeAppointment(checkInId);
            if (selectedPatient === waitingRoom.find(p => p.id === checkInId)?.patientAddress) {
                setSelectedPatient(null); setGrantedRecords([]);
            }
            fetchWaitingRoom();
        } catch (err) { setErrorMsg(err.message); }
    };

    const handleSelectPatient = async (patientAddress) => {
        if (!patientAddress.trim()) return;

        const normalizedPatient = patientAddress.trim().toLowerCase();

        setSelectedPatient(normalizedPatient);
        setManualSearchQuery('');
        setLoadingRecords(true);
        setGrantedRecords([]);
        setErrorMsg('');

        try {
            const grantsRes = await getAccessibleRecords(normalizedPatient);
            const grants = grantsRes.data || [];
            setGrantedRecords(grants);
        } catch (err) {
            setGrantedRecords([]);
            setErrorMsg(err.message || 'Failed to fetch accessible records');
        } finally {
            setLoadingRecords(false);
        }
    };

    const handleUploadAndMint = async () => {
        const targetAddress = selectedPatient || patientAddressToMint;
        if (!fileToMint || !targetAddress) { setErrorMsg("Please select a file and a patient."); return; }
        setIsUploading(true); setErrorMsg('');
        try {
            const uri = await upload({ client, files: [fileToMint] });
            await mintRecord(targetAddress, uri);
            const cidStr = normalizeCid(uri);
            setMintedRecords(prev => [{ id: Date.now(), recordId: 'Pending', recordType: fileToMint.name, patientAddress: targetAddress, status: 'Active', ipfsCid: cidStr }, ...prev]);
            setFileToMint(null); setPatientAddressToMint('');
            if (selectedPatient) handleSelectPatient(selectedPatient);
        } catch (err) { setErrorMsg(err.message); } finally { setIsUploading(false); }
    };

    const handleAmendRecord = async (record) => {
        if (!amendFile) return;
        setIsAmending(true); setErrorMsg('');
        try {
            const uri = await upload({ client, files: [amendFile] });
            await amendRecord(record.patientAddress, uri, record.recordId || record.id);
            const cidStr = normalizeCid(uri);

            const updateLogic = (prev) => prev.map(r => (getRecordId(r) === getRecordId(record)) ? { ...r, status: 'Superseded', superseded: true } : r);
            setMintedRecords(updateLogic); setGrantedRecords(updateLogic);

            setMintedRecords(prev => [{ id: Date.now(), recordId: 'Pending', recordType: `Amended: ${amendFile.name}`, patientAddress: record.patientAddress, status: 'Active', previousRecordId: getRecordId(record), ipfsCid: cidStr }, ...prev]);
            if (selectedPatient === (record.patientAddress || '').toLowerCase()) handleSelectPatient(selectedPatient);

            setAmendingRecordId(null); setAmendFile(null);
        } catch (err) { setErrorMsg(err.message); } finally { setIsAmending(false); }
    };

    const visibleGrantedRecords = grantedRecords.filter((r) => {
        const recId = getRecordId(r);
        if (recId === undefined || recId === null) return false;

        const expiresAt = r.expiresAt || r.expires_at;
        if (expiresAt) {
            const expTs = new Date(expiresAt).getTime();
            if (!Number.isNaN(expTs) && expTs < Date.now()) return false;
        }
        return true;
    });

    return (
        <div className="flex h-screen overflow-hidden font-body bg-background">
            <div className="hidden lg:flex"><Sidebar activeNav={activeNav} setActiveNav={setActiveNav} setMobileOpen={setMobileOpen} onLogout={logout} waitingCount={waitingRoom.length} /></div>
            {mobileOpen && <div className="fixed inset-y-0 left-0 z-50 lg:hidden"><Sidebar activeNav={activeNav} setActiveNav={setActiveNav} setMobileOpen={setMobileOpen} onLogout={logout} waitingCount={waitingRoom.length} /></div>}

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <AmbientParticles />
                <header className="flex items-center justify-between px-4 lg:px-6 py-3.5 bg-background border-b border-border shrink-0 relative z-20">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-muted"><Menu className="w-5 h-5" /></button>
                        <div><h1 className="text-[15px] font-semibold text-foreground">Welcome, Dr. {displayName} 👋</h1></div>
                    </div>
                    <div className="flex items-center gap-2"><AnimatedThemeToggler /></div>
                </header>

                <main className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 lg:py-5 space-y-4 relative z-10">
                    {errorMsg && <div className="bg-red-950/30 text-red-300 text-xs p-3 rounded-xl flex justify-between"><span>{errorMsg}</span><button onClick={() => setErrorMsg('')} className="underline">Dismiss</button></div>}

                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="w-full lg:w-[35%] shrink-0">
                            <MagicCard className="h-full bg-transparent" gradientColor='hsl(var(--muted))'>
                                <GlassCard>
                                    <div className="p-5 flex flex-col h-full">
                                        <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2"><IconBadge icon={Clock} /><span className="text-[13px] font-semibold">Waiting Room</span></div></div>
                                        <div className="space-y-3 flex-1 overflow-y-auto">
                                            {loadingWaiting ? <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div> : waitingRoom.length === 0 ? <p className="text-[11px] text-muted-foreground text-center py-8">No patients waiting.</p> : (
                                                waitingRoom.map(p => (
                                                    <motion.div key={p.id} onClick={() => handleSelectPatient(p.patientAddress)} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${selectedPatient === (p.patientAddress || '').toLowerCase() ? 'border-secondary/50 bg-secondary/10' : 'hover:bg-muted/50'}`}>
                                                        <div className="flex-1 min-w-0"><p className="text-[12px] font-mono truncate">{p.patientAddress.slice(0, 8)}…</p></div>
                                                        <Button size="sm" variant="ghost" className="h-7 text-[10px] px-2 text-secondary" onClick={(e) => { e.stopPropagation(); handleCompleteAppointment(p.id); }}>Done</Button>
                                                    </motion.div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </GlassCard>
                            </MagicCard>
                        </div>

                        <div className="flex-1 flex flex-col min-w-0">
                            <MagicCard className="h-full bg-transparent" gradientColor='hsl(var(--muted))'>
                                <GlassCard>
                                    <div className="p-5 flex flex-col h-full">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2"><IconBadge icon={ShieldCheck} /><span className="text-[13px] font-semibold">Patient Vault</span></div>
                                            <div className="flex items-center gap-2">
                                                <input type="text" placeholder="0x..." value={manualSearchQuery} onChange={(e) => setManualSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSelectPatient(manualSearchQuery)} className="border rounded-lg px-2 py-1 text-[11px] font-mono bg-background w-[140px]" />
                                                <button onClick={() => handleSelectPatient(manualSearchQuery)} className="text-[10px] bg-secondary/20 text-secondary px-2 py-1 rounded">Find</button>
                                                {selectedPatient && <button onClick={() => setSelectedPatient(null)} className="text-[10px] bg-red-950/30 text-red-400 px-2 py-1 rounded hover:bg-red-900/50 transition">Close Patient</button>}
                                            </div>
                                        </div>
                                        <div className="flex-1 overflow-y-auto">
                                            {!selectedPatient ? (
                                                <p className="text-center text-[11px] text-muted-foreground py-12">Select or search a patient to view files.</p>
                                            ) : loadingRecords ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div> : visibleGrantedRecords.length === 0 ? <p className="text-center text-[11px] text-muted-foreground py-12">No shared records.</p> : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {visibleGrantedRecords.map((grant) => {
                                                        const recId = getRecordId(grant);
                                                        const cid = getCid(grant);
                                                        const canOpen = !!cid;
                                                        return (
                                                            <div key={recId} className="p-4 rounded-xl border bg-background/60">
                                                                <h3 className="text-[12px] font-bold font-mono mb-1">#{recId}</h3>
                                                                <p className="text-[10px] text-muted-foreground truncate mb-1">{grant.recordType || 'Medical Record'}</p>
                                                                <p className="text-[10px] text-muted-foreground truncate mb-3">
                                                                    {canOpen ? `CID: ${cid.slice(0, 24)}…` : 'CID unavailable from current API'}
                                                                </p>
                                                                <button
                                                                    onClick={(e) => canOpen && handleViewDocument(e, cid)}
                                                                    disabled={!canOpen}
                                                                    className="w-full py-2 rounded-lg text-[11px] font-semibold bg-secondary/10 text-secondary hover:bg-secondary hover:text-background disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                                                                >
                                                                    <Eye className="w-3.5 h-3.5" /> {canOpen ? 'View File' : 'Metadata Unavailable'}
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </GlassCard>
                            </MagicCard>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 shrink-0 min-w-0">
                            <MagicCard className="h-full bg-transparent" gradientColor='hsl(var(--muted))'>
                                <GlassCard>
                                    <div className="p-5 flex flex-col items-center justify-center h-full text-center">
                                        <Upload className="w-6 h-6 text-accent mb-3" />
                                        <h3 className="text-[13px] font-semibold mb-4">Secure Minting Engine</h3>
                                        <div className="w-full max-w-[280px] flex flex-col gap-3">
                                            {selectedPatient ? (
                                                <div className="px-3 py-2 bg-secondary/10 border border-secondary/30 rounded-xl text-[11px] font-mono text-secondary text-left">Minting For: {selectedPatient.slice(0,12)}...</div>
                                            ) : (
                                                <input type="text" placeholder="Patient Wallet (0x...)" value={patientAddressToMint} onChange={(e) => setPatientAddressToMint(e.target.value)} className="w-full text-[11px] px-3 py-2.5 border rounded-xl bg-background font-mono" />
                                            )}
                                            <input type="file" accept=".pdf" onChange={(e) => setFileToMint(e.target.files?.[0] || null)} className="w-full text-[11px] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-muted file:text-foreground cursor-pointer" />
                                            <ShimmerButton onClick={handleUploadAndMint} disabled={isUploading || !fileToMint || (!selectedPatient && !patientAddressToMint)} className="py-2.5 rounded-xl text-[12px] font-bold border-none" background='hsl(var(--accent))'>
                                                <span className="flex gap-2 text-background">{isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}{isUploading ? 'Minting...' : 'Mint Record'}</span>
                                            </ShimmerButton>
                                        </div>
                                    </div>
                                </GlassCard>
                            </MagicCard>
                        </div>

                        <div className="w-full lg:w-[50%]">
                            <MagicCard className="h-full bg-transparent" gradientColor="hsl(var(--muted))">
                                <GlassCard>
                                    <div className="p-5 flex flex-col h-full">
                                        <div className="flex items-center gap-2 mb-4"><IconBadge icon={FileSignature} /><span className="text-[13px] font-semibold">Session Mint History</span></div>
                                        <div className="space-y-3 flex-1 overflow-y-auto">
                                            {mintedRecords.length === 0 ? <p className="text-[11px] text-center text-muted-foreground py-6">No records minted.</p> : (
                                                mintedRecords.map(r => {
                                                    const isSuperseded = r.status === 'Superseded' || r.superseded;
                                                    const rid = getRecordId(r);
                                                    const isAmendTarget = amendingRecordId === rid;
                                                    return (
                                                        <div key={rid} className={`p-3.5 rounded-xl border ${isSuperseded ? 'opacity-50' : ''}`}>
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <p className={`text-[12px] font-semibold ${isSuperseded ? 'line-through' : ''}`}>{r.recordType}</p>
                                                                    <p className="text-[10px] text-muted-foreground font-mono">{r.patientAddress.slice(0,6)}… | #{rid}</p>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    {!isSuperseded && !isAmendTarget && <button onClick={(e) => handleViewDocument(e, getCid(r))} className="p-1.5 rounded bg-secondary/10 text-secondary"><Eye className="w-3.5 h-3.5" /></button>}
                                                                    {!isSuperseded && <button onClick={() => setAmendingRecordId(isAmendTarget ? null : rid)} className="text-[10px] px-2 py-1 rounded bg-amber-950/30 text-amber-400">{isAmendTarget ? 'Cancel' : 'Amend'}</button>}
                                                                </div>
                                                            </div>
                                                            {isAmendTarget && (
                                                                <div className="mt-3 pt-3 border-t border-border flex gap-2">
                                                                    <input type="file" onChange={e => setAmendFile(e.target.files?.[0] || null)} className="flex-1 text-[9px] file:py-1 file:px-2 file:rounded file:bg-muted" />
                                                                    <button onClick={() => handleAmendRecord(r)} disabled={!amendFile || isAmending} className="px-3 py-1 rounded text-[10px] bg-amber-500 text-background flex items-center gap-1">{isAmending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Confirm'}</button>
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
                    </div>
                </main>
            </div>
        </div>
    );
}
