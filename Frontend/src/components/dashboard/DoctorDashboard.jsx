import React, { useState, useEffect, useCallback } from 'react';
import { useActiveAccount, useDisconnect, useActiveWallet } from 'thirdweb/react';
import { createThirdwebClient } from "thirdweb";
import { upload } from "thirdweb/storage";

const client = createThirdwebClient({ clientId: import.meta.env.VITE_CLIENT_ID });

import { LayoutDashboard, Users, Clock, Settings, LogOut, Activity, Search, Plus, Calendar, Menu, HelpCircle, Mail, ShieldCheck, Upload, FileSignature, FileUp, ShieldAlert, ChevronsLeft, ClipboardList, Bell, Download, Loader2, X, Eye, Edit } from 'lucide-react';
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
import DashboardLayout from './DashboardLayout';

const NAV = {
    main: [{ id: 'overview', label: 'Overview', icon: LayoutDashboard }, { id: 'waiting', label: 'Waiting Room', icon: Clock }],
    features: [{ id: 'records', label: 'Mint Records', icon: Upload }],
    general: [{ id: 'settings', label: 'Settings', icon: Settings }, { id: 'logout', label: 'Log out', icon: LogOut }],
};


function IconBadge({ icon: Icon }) {
    return <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-secondary/10"><Icon className="w-3.5 h-3.5 text-secondary" /></div>;
}

export default function DoctorDashboard() {
    const { user, logout } = useAuth();
    const { disconnect } = useDisconnect();
    const wallet = useActiveWallet();

    const [activeNav, setActiveNav] = useState('overview');

    const [waitingRoom, setWaitingRoom] = useState([]);
    const [grantedRecords, setGrantedRecords] = useState([]);

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
        r.ipfsCid || r.ipfs_cid || r.cid || r.record?.ipfsCid || r.record?.ipfs_cid
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

    const handleLogout = () => {
        if (wallet) disconnect(wallet);
        logout();
        setTimeout(() => { window.location.href = '/'; }, 250);
    };

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
            setGrantedRecords(grantsRes.data || []);
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
            console.log("Uploading to IPFS via Thirdweb...");
            const uri = await upload({ client, files: [fileToMint] });
            await mintRecord(targetAddress, uri, fileToMint.name);

            setFileToMint(null);
            setPatientAddressToMint('');

            if (targetAddress === selectedPatient) {
                await handleSelectPatient(targetAddress);
            } else {
                alert("Record securely minted and indexed!");
            }
        } catch (err) {
            setErrorMsg(err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleAmendRecord = async (record) => {
        if (!amendFile) return;
        setIsAmending(true); setErrorMsg('');

        try {
            const uri = await upload({ client, files: [amendFile] });
            await amendRecord(record.patientAddress, uri, record.recordId || record.id, record.recordType);

            setAmendingRecordId(null);
            setAmendFile(null);

            if (selectedPatient === (record.patientAddress || '').toLowerCase()) {
                await handleSelectPatient(selectedPatient);
            }
        } catch (err) {
            setErrorMsg(err.message);
        } finally {
            setIsAmending(false);
        }
    };

    const validRecords = grantedRecords.filter((r) => {
        const recId = getRecordId(r);
        if (recId === undefined || recId === null) return false;
        const expiresAt = r.expiresAt || r.expires_at;
        if (expiresAt) {
            const expTs = new Date(expiresAt).getTime();
            if (!Number.isNaN(expTs) && expTs < Date.now()) return false;
        }
        return true;
    });

    const grantedList = validRecords.filter(r => r.isGranted);
    const authoredList = validRecords.filter(r => r.isAuthored && !r.isGranted);

    const navMain = [
        ...NAV.main.map(item => ({
            title: item.label,
            url: "#",
            icon: item.icon,
            isActive: activeNav === item.id,
            onClick: () => setActiveNav(item.id),
            badge: item.id === 'waiting' && waitingRoom.length > 0 ? waitingRoom.length : null
        })),
        ...NAV.features.map(item => ({
            title: item.label,
            url: "#",
            icon: item.icon,
            isActive: activeNav === item.id,
            onClick: () => setActiveNav(item.id)
        }))
    ];

    const navSecondary = [
        { title: "Settings", url: "#", icon: Settings, onClick: () => setActiveNav('settings') },
        { title: "Log out", url: "#", icon: LogOut, onClick: handleLogout }
    ];

    return (
        <DashboardLayout
            title={`Precision Care: Dr. ${displayName}`}
            user={{ name: user?.name || 'Doctor', email: user?.walletAddress?.slice(0, 10) + '...', avatar: "" }}
            navMain={navMain}
            navSecondary={navSecondary}
        >
            {errorMsg && <div className="bg-red-950/30 text-red-300 text-xs p-3 rounded-xl flex justify-between border border-red-900/50 mb-4"><span>{errorMsg}</span><button onClick={() => setErrorMsg('')} className="underline hover:text-red-200">Dismiss</button></div>}

            <div className="flex flex-col lg:flex-row gap-4 mb-4">
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
                                <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                                    {!selectedPatient ? (
                                        <p className="text-center text-[11px] text-muted-foreground py-12">Select or search a patient to view files.</p>
                                    ) : loadingRecords ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div> : (
                                        <>
                                            <div>
                                                <h4 className="text-xs font-bold text-emerald-500 mb-3 flex items-center gap-2"><Eye className="w-3.5 h-3.5"/> Granted Access</h4>
                                                {grantedList.length === 0 ? <p className="text-[11px] text-muted-foreground">No shared records.</p> : (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {grantedList.map((grant) => {
                                                            const recId = getRecordId(grant);
                                                            const cid = getCid(grant);
                                                            const canOpen = !!cid;
                                                            const isAmendTarget = amendingRecordId === recId;
                                                            return (
                                                                <div key={recId} className={`p-4 rounded-xl border bg-background/60 ${grant.superseded ? 'opacity-50' : ''}`}>
                                                                    <h3 className={`text-[12px] font-bold font-mono mb-1 ${grant.superseded ? 'line-through' : ''}`}>#{recId}</h3>
                                                                    <p className="text-[10px] text-muted-foreground truncate mb-3">{grant.recordType}</p>

                                                                    <div className="flex gap-2">
                                                                        <button onClick={(e) => canOpen && handleViewDocument(e, cid)} disabled={!canOpen} className="flex-1 py-2 rounded-lg text-[11px] font-semibold bg-secondary/10 text-secondary hover:bg-secondary hover:text-background disabled:opacity-50 flex items-center justify-center gap-1.5">
                                                                            <Eye className="w-3.5 h-3.5" /> View
                                                                        </button>

                                                                        {grant.isAuthored && !grant.superseded && !isAmendTarget && (
                                                                            <button onClick={() => setAmendingRecordId(recId)} className="px-3 py-2 rounded-lg bg-amber-950/30 text-amber-400 hover:bg-amber-900/50"><Edit className="w-3.5 h-3.5" /></button>
                                                                        )}
                                                                    </div>

                                                                    {isAmendTarget && (
                                                                        <div className="mt-3 pt-3 border-t border-border flex flex-col gap-2">
                                                                            <input type="file" onChange={e => setAmendFile(e.target.files?.[0] || null)} className="text-[9px] file:py-1 file:px-2 file:rounded file:bg-muted" />
                                                                            <div className="flex gap-2">
                                                                                <button onClick={() => handleAmendRecord(grant)} disabled={!amendFile || isAmending} className="flex-1 py-1.5 rounded text-[10px] bg-amber-500 text-background font-bold flex justify-center items-center gap-1">{isAmending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Confirm Amend'}</button>
                                                                                <button onClick={() => {setAmendingRecordId(null); setAmendFile(null);}} className="px-3 py-1.5 rounded text-[10px] bg-muted text-foreground">Cancel</button>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <h4 className="text-xs font-bold text-amber-500 mb-3 flex items-center gap-2"><Edit className="w-3.5 h-3.5"/> Past Authored Records (Amend Only)</h4>
                                                {authoredList.length === 0 ? <p className="text-[11px] text-muted-foreground">No other authored records found.</p> : (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {authoredList.map((grant) => {
                                                            const recId = getRecordId(grant);
                                                            const isAmendTarget = amendingRecordId === recId;
                                                            return (
                                                                <div key={recId} className={`p-4 rounded-xl border border-amber-900/30 bg-background/40 ${grant.superseded ? 'opacity-50' : ''}`}>
                                                                    <div className="flex justify-between items-start mb-1">
                                                                        <h3 className={`text-[12px] font-bold font-mono ${grant.superseded ? 'line-through' : ''}`}>#{recId}</h3>
                                                                        <Badge variant="outline" className="text-[8px] h-4 px-1.5 border-amber-900/50 text-amber-500/70">Locked</Badge>
                                                                    </div>
                                                                    <p className="text-[10px] text-muted-foreground truncate mb-3">{grant.recordType}</p>

                                                                    {!grant.superseded && !isAmendTarget && (
                                                                        <button onClick={() => setAmendingRecordId(recId)} className="w-full py-2 rounded-lg text-[11px] font-semibold bg-amber-950/30 text-amber-400 hover:bg-amber-900/50 flex items-center justify-center gap-1.5">
                                                                            <Edit className="w-3.5 h-3.5" /> Amend Record
                                                                        </button>
                                                                    )}

                                                                    {isAmendTarget && (
                                                                        <div className="mt-2 pt-2 border-t border-border flex flex-col gap-2">
                                                                            <input type="file" onChange={e => setAmendFile(e.target.files?.[0] || null)} className="text-[9px] file:py-1 file:px-2 file:rounded file:bg-muted" />
                                                                            <div className="flex gap-2">
                                                                                <button onClick={() => handleAmendRecord(grant)} disabled={!amendFile || isAmending} className="flex-1 py-1.5 rounded text-[10px] bg-amber-500 text-background font-bold flex justify-center items-center gap-1">{isAmending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Confirm Amend'}</button>
                                                                                <button onClick={() => {setAmendingRecordId(null); setAmendFile(null);}} className="px-3 py-1.5 rounded text-[10px] bg-muted text-foreground">Cancel</button>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </GlassCard>
                    </MagicCard>
                </div>
            </div>

            <div className="flex gap-4">
                <div className="flex-1">
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
            </div>
        </DashboardLayout>
    );
}
