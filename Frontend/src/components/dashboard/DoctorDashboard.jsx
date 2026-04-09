import React, { useState, useEffect, useCallback } from 'react';
import { useActiveAccount, useDisconnect, useActiveWallet } from 'thirdweb/react';
import { createThirdwebClient } from "thirdweb";
import { upload } from "thirdweb/storage";

const client = createThirdwebClient({ clientId: import.meta.env.VITE_CLIENT_ID });

import { LayoutDashboard, Users, Clock, Settings, LogOut, Activity, Search, Plus, Calendar, Menu, HelpCircle, Mail, ShieldCheck, Upload, FileSignature, FileUp, ShieldAlert, ChevronsLeft, ClipboardList, Bell, Download, Loader2, X, Eye, Edit, QrCode } from 'lucide-react';
import { AnimatedThemeToggler } from '../magicui/animated-theme-toggler';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { MagicCard } from '../magicui/magic-card';
import { ShimmerButton } from '../magicui/shimmer-button';
import { motion, AnimatePresence } from 'framer-motion';
import { AmbientParticles } from '../effects/AmbientParticles';
import { GlassCard } from '../effects/GlassCard';
import { useAuth } from '../../context/AuthContext';
import { getWaitingRoom, getAccessibleRecords, completeAppointment, mintRecord, amendRecord, createEpisode } from '../../services/api';

const NAV = {
    main: [{ id: 'overview', label: 'Overview', icon: LayoutDashboard }, { id: 'waiting', label: 'Waiting Room', icon: Clock }],
    features: [{ id: 'records', label: 'Mint Records', icon: Upload }],
    general: [{ id: 'settings', label: 'Settings', icon: Settings }, { id: 'logout', label: 'Log out', icon: LogOut }],
};

function Sidebar({ activeNav, setActiveNav, setMobileOpen, onLogout, waitingCount }) {
    return (
        <aside className="flex flex-col w-[240px] shrink-0 h-full bg-background border-r border-border">
            <div className="flex items-center justify-between px-5 py-[18px] border-b border-border">
                <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="MediChain" className="h-8 w-auto object-contain" />
                    <span className="text-lg font-bold tracking-tight" style={{ fontFamily: 'var(--font-logo)', color: 'hsl(var(--foreground))' }}>MediChain</span>
                </div>
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
                <div>
                    <ul className="space-y-0.5">
                        {NAV.general.map(item => (
                            <li key={item.id}><button onClick={item.id === 'logout' ? onLogout : undefined} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${item.id === 'logout' ? 'text-red-400 hover:bg-red-950/30' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}><item.icon className="w-4 h-4 shrink-0" />{item.label}</button></li>
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
    const { disconnect } = useDisconnect();
    const wallet = useActiveWallet();

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
    const [qrPayloadInput, setQrPayloadInput] = useState('');

    const [fileToMint, setFileToMint] = useState(null);
    const [patientAddressToMint, setPatientAddressToMint] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const [amendingRecordId, setAmendingRecordId] = useState(null);
    const [amendFile, setAmendFile] = useState(null);
    const [isAmending, setIsAmending] = useState(false);

    // Episode state
    const [episodes, setEpisodes] = useState([]);
    const [showEpisodeModal, setShowEpisodeModal] = useState(false);
    const [episodeTitle, setEpisodeTitle] = useState('');
    const [episodeDescription, setEpisodeDescription] = useState('');
    const [isCreatingEpisode, setIsCreatingEpisode] = useState(false);
    const [selectedEpisodeId, setSelectedEpisodeId] = useState('');

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
            const epId = selectedEpisodeId ? parseInt(selectedEpisodeId, 10) : null;
            if (selectedEpisodeId && isNaN(epId)) { setErrorMsg("Invalid episode selection."); return; }
            await mintRecord(targetAddress, uri, fileToMint.name, null, epId);

            setFileToMint(null);
            setPatientAddressToMint('');
            setSelectedEpisodeId('');

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

    const handleCreateEpisode = async () => {
        const targetAddress = selectedPatient || patientAddressToMint;
        if (!episodeTitle.trim() || !targetAddress) { setErrorMsg("Episode title and patient address are required."); return; }
        setIsCreatingEpisode(true); setErrorMsg('');
        try {
            const res = await createEpisode(targetAddress, episodeTitle.trim(), episodeDescription.trim());
            const ep = res.data;
            setEpisodes(prev => [ep, ...prev]);
            setSelectedEpisodeId(String(ep.episodeId));
            setEpisodeTitle('');
            setEpisodeDescription('');
            setShowEpisodeModal(false);
        } catch (err) {
            setErrorMsg(err.message);
        } finally {
            setIsCreatingEpisode(false);
        }
    };

    const handleScanQrPayload = async () => {
        if (!qrPayloadInput.trim()) return;
        try {
            const parsed = JSON.parse(qrPayloadInput);
            const patientFromQr = parsed?.patientAddress || parsed?.patientWallet || '';
            if (!patientFromQr) throw new Error('QR payload missing patientAddress.');
            await handleSelectPatient(patientFromQr);
            setQrPayloadInput('');
        } catch (err) {
            setErrorMsg('Invalid QR payload. Paste a valid MediChain QR payload JSON.');
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

    return (
        <div className="flex h-screen overflow-hidden font-body bg-background">
            <div className="hidden lg:flex"><Sidebar activeNav={activeNav} setActiveNav={setActiveNav} setMobileOpen={setMobileOpen} onLogout={handleLogout} waitingCount={waitingRoom.length} /></div>
            {mobileOpen && <div className="fixed inset-y-0 left-0 z-50 lg:hidden"><Sidebar activeNav={activeNav} setActiveNav={setActiveNav} setMobileOpen={setMobileOpen} onLogout={handleLogout} waitingCount={waitingRoom.length} /></div>}

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
                                                {selectedPatient && (
                                                    <button onClick={() => setShowEpisodeModal(true)} className="text-[10px] bg-secondary/20 text-secondary px-2 py-1 rounded flex items-center gap-1 hover:bg-secondary/30 transition"><Plus className="w-3 h-3" />New Episode</button>
                                                )}
                                                <input type="text" placeholder="0x..." value={manualSearchQuery} onChange={(e) => setManualSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSelectPatient(manualSearchQuery)} className="border rounded-lg px-2 py-1 text-[11px] font-mono bg-background w-[140px]" />
                                                <button onClick={() => handleSelectPatient(manualSearchQuery)} className="text-[10px] bg-secondary/20 text-secondary px-2 py-1 rounded">Find</button>
                                                {selectedPatient && <button onClick={() => setSelectedPatient(null)} className="text-[10px] bg-red-950/30 text-red-400 px-2 py-1 rounded hover:bg-red-900/50 transition">Close Patient</button>}
                                            </div>
                                        </div>
                                        <div className="mb-4 flex items-center gap-2">
                                            <div className="relative flex-1">
                                                <QrCode className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                                                <input type="text" placeholder='Paste QR payload JSON {"patientAddress":"0x..."}' value={qrPayloadInput} onChange={(e) => setQrPayloadInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleScanQrPayload()} className="w-full border rounded-lg pl-8 pr-2 py-2 text-[10px] font-mono bg-background" />
                                            </div>
                                            <button onClick={handleScanQrPayload} className="text-[10px] bg-secondary/20 text-secondary px-2.5 py-2 rounded">Scan</button>
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
                                            {episodes.length > 0 && (
                                                <select value={selectedEpisodeId} onChange={(e) => setSelectedEpisodeId(e.target.value)} className="w-full text-[11px] px-3 py-2.5 border rounded-xl bg-background text-foreground">
                                                    <option value="">No Episode (ungrouped)</option>
                                                    {episodes.map(ep => (
                                                        <option key={ep.episodeId} value={String(ep.episodeId)}>{ep.title}</option>
                                                    ))}
                                                </select>
                                            )}
                                            <ShimmerButton onClick={handleUploadAndMint} disabled={isUploading || !fileToMint || (!selectedPatient && !patientAddressToMint)} className="py-2.5 rounded-xl text-[12px] font-bold border-none" background='hsl(var(--accent))'>
                                                <span className="flex gap-2 text-background">{isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}{isUploading ? 'Minting...' : 'Mint Record'}</span>
                                            </ShimmerButton>
                                        </div>
                                    </div>
                                </GlassCard>
                            </MagicCard>
                        </div>
                    </div>
                </main>
            </div>

            {/* New Episode Modal */}
            <AnimatePresence>
                {showEpisodeModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md mx-4 bg-card border border-border rounded-2xl shadow-2xl">
                            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-border/50">
                                <h3 className="text-sm font-semibold flex items-center gap-2"><ClipboardList className="w-4 h-4 text-secondary" /> New Episode of Care</h3>
                                <button onClick={() => setShowEpisodeModal(false)} disabled={isCreatingEpisode} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
                            </div>
                            <div className="px-6 py-5 space-y-4">
                                <div>
                                    <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 block">Episode Title *</label>
                                    <input type="text" value={episodeTitle} onChange={e => setEpisodeTitle(e.target.value)} disabled={isCreatingEpisode} placeholder="e.g. Post-Op Cardiac Recovery" className="w-full px-3 py-2 rounded-xl border border-border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 disabled:opacity-50" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 block">Description (optional)</label>
                                    <textarea value={episodeDescription} onChange={e => setEpisodeDescription(e.target.value)} disabled={isCreatingEpisode} placeholder="Brief notes about this episode..." rows={3} className="w-full px-3 py-2 rounded-xl border border-border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 disabled:opacity-50 resize-none" />
                                </div>
                                {selectedPatient && <p className="text-[10px] text-muted-foreground">Patient: <span className="font-mono">{selectedPatient.slice(0, 14)}...</span></p>}
                                <button onClick={handleCreateEpisode} disabled={isCreatingEpisode || !episodeTitle.trim()} className="w-full py-2.5 rounded-xl text-sm font-semibold bg-secondary text-background disabled:opacity-50 flex items-center justify-center gap-2">
                                    {isCreatingEpisode ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    {isCreatingEpisode ? 'Creating...' : 'Create Episode'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
