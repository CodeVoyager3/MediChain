import React, { useState, useEffect, useCallback } from 'react';
import { useActiveAccount, useDisconnect, useActiveWallet } from 'thirdweb/react';
import { getPatientVault, grantAccess, revokeAccess, checkInToClinic, getActiveGrants, getPatientCheckInStatus, leaveClinic } from '../../services/api';

// FIX 1: Alias 'History' to 'HistoryIcon' to prevent "Illegal Constructor" error
import {
    LayoutDashboard, FileText, ShieldCheck, Bell, Settings, LogOut,
    Stethoscope, Activity, Search, Plus, Calendar, Hospital,
    HeartPulse, Syringe, Menu, HelpCircle, Mail, CheckCircle2,
    ClipboardList, Download, Bot, ChevronsLeft, Upload, Loader2,
    X, QrCode, Trash2, Clock, Eye, AlertTriangle,
    History as HistoryIcon
} from 'lucide-react';

import { AnimatedThemeToggler } from '../magicui/animated-theme-toggler';
import { motion } from 'framer-motion';
import { Card as ShadcnCard, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { MagicCard } from '../magicui/magic-card';
import { NumberTicker } from '../magicui/number-ticker';
import { ShimmerButton } from '../magicui/shimmer-button';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useAuth } from '../../context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// --- FIX 2: PRO CID & URL RESOLUTION (Same as Insurer) ---
const normalizeCid = (value) => {
    if (!value) return null;
    let v = String(value).trim();
    // Aggressively strip ipfs://, ipfs/, and leading slashes
    v = v.replace(/^ipfs:\/\//i, "").replace(/^ipfs\//i, "").replace(/^\//, "");
    // If it's a full gateway URL, extract just the hash
    if (v.includes("ipfs/")) v = v.split("ipfs/").pop();
    // Remove any trailing sub-paths
    v = v.split("/")[0];
    return v.length > 10 ? v : null;
};

const getCid = (r) => {
    if (!r) return null;
    // Search top-level and nested record objects (crucial for audit log)
    const raw = r.ipfsCid || r.ipfs_cid || r.cid || r.record?.ipfsCid || r.record?.ipfs_cid || r.record?.cid;
    return normalizeCid(raw);
};

const FALLBACK_CHART_DATA = [{ month: 'Jan', v: 0 }, { month: 'Feb', v: 0 }, { month: 'Mar', v: 0 }, { month: 'Apr', v: 0 }, { month: 'May', v: 0 }, { month: 'Jun', v: 0 }, { month: 'Jul', v: 0 }, { month: 'Aug', v: 0 }, { month: 'Sep', v: 0 }, { month: 'Oct', v: 0 }, { month: 'Nov', v: 0 }, { month: 'Dec', v: 0 }];

const NAV = {
    main: [{ id: 'overview', label: 'Overview', icon: LayoutDashboard }, { id: 'records', label: 'My Records', icon: FileText }, { id: 'access', label: 'Access Control', icon: ShieldCheck }, { id: 'appointments', label: 'Appointments', icon: Calendar }],
    features: [{ id: 'prescriptions', label: 'Prescriptions', icon: ClipboardList }, { id: 'scans', label: 'Scans & Imaging', icon: Bot }, { id: 'notifications', label: 'Notifications', icon: Bell }],
    general: [{ id: 'settings', label: 'Settings', icon: Settings }, { id: 'logout', label: 'Log out', icon: LogOut }],
};

function BarChart({ chartData }) {
    const isDark = document.documentElement.classList.contains('dark');
    const data = { labels: chartData.map(d => d.month), datasets: [{ label: 'Records', data: chartData.map(d => d.v), backgroundColor: isDark ? '#D2E75F' : '#B04B20', hoverBackgroundColor: isDark ? '#c2d44e' : '#8A3B19', borderRadius: 4, barThickness: 'flex', maxBarThickness: 32 }] };
    const options = { responsive: true, maintainAspectRatio: false, animation: { duration: 1000 }, plugins: { legend: { display: false }, tooltip: { backgroundColor: isDark ? '#1A1A1B' : '#DECBB0', titleColor: isDark ? '#888' : '#8A3B19', bodyColor: isDark ? '#e5e5e0' : '#1B1810', padding: 10, cornerRadius: 8, displayColors: false } }, scales: { x: { grid: { display: false, drawBorder: false }, ticks: { color: '#555', font: { size: 10 } } }, y: { beginAtZero: true, grid: { color: 'hsl(var(--border))', drawBorder: false }, ticks: { stepSize: 2, color: '#555', font: { size: 10 }, padding: 10 }, border: { display: false } } }, interaction: { mode: 'index', intersect: false } };
    return <div className="w-full h-full min-h-[160px] pb-2"><Bar data={data} options={options} /></div>;
}

function Sidebar({ activeNav, setActiveNav, setMobileOpen, onLogout }) {
    return (
        <aside className="flex flex-col w-[240px] shrink-0 h-full bg-background border-r border-border">
            <div className="flex items-center justify-between px-5 py-[18px] border-b border-border">
                <img src="/logo.png" alt="MediChain" className="h-8 w-auto object-contain" />
                <button className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors" onClick={() => setMobileOpen(false)}><ChevronsLeft className="w-4 h-4" /></button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-2 text-muted-foreground">Main Menu</p>
                    <ul className="space-y-0.5">
                        {NAV.main.map(item => (
                            <li key={item.id}><button onClick={() => { setActiveNav(item.id); setMobileOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all text-left ${activeNav === item.id ? 'bg-secondary/10 text-secondary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}><item.icon className="w-4 h-4 shrink-0" /><span className="flex-1">{item.label}</span></button></li>
                        ))}
                    </ul>
                </div>
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-2 text-muted-foreground">General</p>
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

function GrantAccessModal({ open, onClose, records }) {
    const [doctorAddr, setDoctorAddr] = useState('');
    const [selectedRecords, setSelectedRecords] = useState([]);
    const [duration, setDuration] = useState(86400);
    const [error, setError] = useState('');
    const [isGranting, setIsGranting] = useState(false);

    if (!open) return null;

    const toggleRecord = (id) => setSelectedRecords(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);

    const handleGrant = async () => {
        if (!doctorAddr.trim() || selectedRecords.length === 0) return;
        setIsGranting(true); setError('');
        try {
            await grantAccess(doctorAddr.trim(), selectedRecords, duration);
            const durationLabels = { 3600: '1 Hour', 86400: '24 Hours', 604800: '7 Days', 2592000: '30 Days', 15552000: '180 Days' };
            onClose({ success: true, grant: { id: Date.now(), doctorAddress: doctorAddr.trim(), recordIds: [...selectedRecords], durationLabel: durationLabels[duration] || `${Math.round(duration / 3600)}h` } });
        } catch (err) { setError(err.message); } finally { setIsGranting(false); }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md mx-4 bg-card border border-border rounded-2xl shadow-2xl">
                <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-border/50">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-secondary" /> Grant Record Access</h3>
                    <button onClick={() => onClose(false)} disabled={isGranting} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
                </div>
                <div className="px-6 py-5 space-y-4">
                    <div>
                        <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 block">Doctor Wallet Address</label>
                        <input type="text" value={doctorAddr} disabled={isGranting} onChange={e => setDoctorAddr(e.target.value)} placeholder="0x..." className="w-full px-3 py-2 rounded-xl border border-border bg-background/50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-secondary/40 disabled:opacity-50" />
                    </div>
                    {records.length > 0 ? (
                        <div>
                            <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 block">Select Records</label>
                            <div className="max-h-32 overflow-y-auto space-y-1 border border-border rounded-xl p-1 bg-background/30">
                                {records.map(r => (
                                    <label key={r.recordId} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs ${selectedRecords.includes(r.recordId) ? 'bg-secondary/10 border-secondary/20' : 'hover:bg-muted'}`}>
                                        <input type="checkbox" checked={selectedRecords.includes(r.recordId)} disabled={isGranting} onChange={() => toggleRecord(r.recordId)} className="accent-secondary" />
                                        <span className="font-mono text-[10px] text-muted-foreground">#{r.recordId}</span> — {r.recordType}
                                    </label>
                                ))}
                            </div>
                        </div>
                    ) : <div className="bg-muted/50 border rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">No records to share.</p></div>}
                    <div>
                        <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 block">Duration</label>
                        <select value={duration} disabled={isGranting} onChange={e => setDuration(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 disabled:opacity-50">
                            <option value={3600}>1 Hour</option><option value={86400}>24 Hours</option><option value={604800}>7 Days</option><option value={2592000}>30 Days</option>
                        </select>
                    </div>
                    {error && <p className="text-[11px] text-red-400 bg-red-950/30 px-3 py-2 rounded-lg flex gap-1.5"><AlertTriangle className="w-3.5 h-3.5" />{error}</p>}
                    <button onClick={handleGrant} disabled={isGranting || !doctorAddr.trim() || selectedRecords.length === 0} className="w-full py-2.5 rounded-xl text-sm font-semibold bg-secondary text-background disabled:opacity-50 flex items-center justify-center gap-2">
                        {isGranting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}{isGranting ? 'Updating...' : 'Grant Web3 Access'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export default function PatientDashboard() {
    const { user, logout } = useAuth();
    const { disconnect } = useDisconnect();
    const wallet = useActiveWallet();

    const [activeNav, setActiveNav] = useState('records');
    const [mobileOpen, setMobileOpen] = useState(false);
    const [records, setRecords] = useState([]);
    const [loadingRecords, setLoadingRecords] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [grantModalOpen, setGrantModalOpen] = useState(false);
    const [revokingId, setRevokingId] = useState(null);
    const [checkInDoctorAddr, setCheckInDoctorAddr] = useState('');
    const [isCheckingIn, setIsCheckingIn] = useState(false);
    const [activeCheckIn, setActiveCheckIn] = useState(() => localStorage.getItem('medichain_checkin') || null);
    const [activeGrants, setActiveGrants] = useState([]);

    // --- FIX 3: Robust Viewing Handler ---
    const handleViewDocument = (e, rawCid) => {
        e.stopPropagation();
        const cid = normalizeCid(rawCid);
        if (!cid) {
            alert("Document CID not found. Blockchain sync may be in progress.");
            return;
        }
        // Prevents the /ipfs/ipfs/ double-prefix bug
        window.open(`https://gateway.pinata.cloud/ipfs/${cid}`, '_blank', 'noopener,noreferrer');
    };

    const fetchRecords = useCallback(async () => {
        setLoadingRecords(true); setErrorMsg('');
        try { const res = await getPatientVault(); setRecords(res.data || []); }
        catch (err) { setErrorMsg(err.message); } finally { setLoadingRecords(false); }
    }, []);

    const fetchGrants = useCallback(async () => {
        try { const res = await getActiveGrants(); setActiveGrants(res.data || []); }
        catch (err) { setActiveGrants([]); }
    }, []);

    const syncCheckInStatus = useCallback(async () => {
        try {
            const res = await getPatientCheckInStatus();
            if (res.data && res.data.doctorAddress) {
                setActiveCheckIn(res.data.doctorAddress);
                localStorage.setItem('medichain_checkin', res.data.doctorAddress);
            } else {
                setActiveCheckIn(null);
                localStorage.removeItem('medichain_checkin');
            }
        } catch (err) {}
    }, []);

    useEffect(() => {
        fetchRecords();
        fetchGrants();
        syncCheckInStatus();
        const interval = setInterval(() => { syncCheckInStatus(); }, 5000);
        return () => clearInterval(interval);
    }, [fetchRecords, fetchGrants, syncCheckInStatus]);

    const handleLogout = () => {
        if (wallet) disconnect(wallet);
        logout();
        setTimeout(() => { window.location.href = '/'; }, 250);
    };

    const handleCheckIn = async () => {
        if (!checkInDoctorAddr.trim()) return;
        setIsCheckingIn(true); setErrorMsg('');
        try {
            await checkInToClinic(checkInDoctorAddr.trim());
            setActiveCheckIn(checkInDoctorAddr.trim());
            localStorage.setItem('medichain_checkin', checkInDoctorAddr.trim());
            setCheckInDoctorAddr('');
        } catch (err) { setErrorMsg(err.message); } finally { setIsCheckingIn(false); }
    };

    const [isLeaving, setIsLeaving] = useState(false);

    const handleLeaveRoom = async () => {
        setIsLeaving(true); setErrorMsg('');
        try {
            await leaveClinic();
            setActiveCheckIn(null);
            localStorage.removeItem('medichain_checkin');
        } catch (err) { setErrorMsg(err.message); } finally { setIsLeaving(false); }
    };

    const handleRevoke = async (grant) => {
        setErrorMsg('');
        setRevokingId(grant.id);
        try {
            const docAddress = grant.doctorAddress || grant.viewerAddress;
            const recordsToRevoke = Array.isArray(grant.recordIds) && grant.recordIds.length > 0 ? grant.recordIds : [grant.recordId];
            if (!recordsToRevoke[0]) throw new Error('No valid IDs found.');
            for (const recId of recordsToRevoke) { await revokeAccess(docAddress, recId); }
            await fetchGrants();
        } catch (err) { setErrorMsg(err.message); } finally { setRevokingId(null); }
    };

    return (
        <div className="flex h-screen overflow-hidden font-body bg-background">
            <div className="hidden lg:flex"><Sidebar activeNav={activeNav} setActiveNav={setActiveNav} setMobileOpen={setMobileOpen} onLogout={handleLogout} /></div>
            {mobileOpen && <div className="fixed inset-y-0 left-0 z-50 lg:hidden"><Sidebar activeNav={activeNav} setActiveNav={setActiveNav} setMobileOpen={setMobileOpen} onLogout={handleLogout} /></div>}

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="flex items-center justify-between px-4 lg:px-6 py-3.5 bg-background border-b border-border shrink-0">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-muted transition-colors"><Menu className="w-5 h-5" /></button>
                        <h1 className="text-[15px] font-semibold text-foreground">Welcome back, {user?.name || 'Patient'} 👋</h1>
                    </div>
                    <div className="flex items-center gap-2"><AnimatedThemeToggler /></div>
                </header>

                <main className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 lg:py-5 space-y-4">
                    {errorMsg && <div className="bg-red-950/30 text-red-300 text-xs p-3 rounded-xl flex justify-between border border-red-900/40"><span>{errorMsg}</span><button onClick={() => setErrorMsg('')} className="underline hover:text-red-100 transition-all">Dismiss</button></div>}

                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="w-full lg:w-[42%] shrink-0">
                            <MagicCard className="h-full" gradientColor='hsl(var(--muted))'>
                                <CardContent className="p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-secondary/10 flex items-center justify-center"><FileText className="w-3.5 h-3.5 text-secondary" /></div>
                                            <span className="text-[13px] font-medium text-muted-foreground">Total Vaulted Files</span>
                                        </div>
                                    </div>
                                    <div className="mb-1 text-foreground flex items-center h-12">
                                        {loadingRecords ? <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /> : <NumberTicker value={records.length} className="text-[2.6rem] font-bold" />}
                                    </div>
                                    <div className="flex gap-2 mb-5 mt-4">
                                        <Button onClick={() => setGrantModalOpen(true)} variant="outline" className="flex-1 py-[10px] rounded-xl text-[12px] font-semibold text-secondary border-secondary/40 hover:bg-secondary/10 transition-all"><ShieldCheck className="w-3.5 h-3.5 mr-1" /> Control Access</Button>
                                    </div>
                                    <div className="flex items-center justify-between mb-3"><span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-tight">Recent Activity</span></div>
                                    <div className="space-y-1">
                                        {records.slice(0, 4).map(r => (
                                            <div key={r.recordId} className="flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-secondary/5 cursor-pointer group" onClick={(e) => handleViewDocument(e, getCid(r))}>
                                                <div className="w-7 h-7 rounded-lg bg-secondary/10 flex items-center justify-center transition-all group-hover:scale-105"><Activity className="w-3.5 h-3.5 text-secondary" /></div>
                                                <span className="flex-1 text-[12px] font-medium truncate text-foreground">{r.recordType}</span>
                                                <Eye className="w-3.5 h-3.5 text-muted-foreground group-hover:text-secondary transition-colors" />
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </MagicCard>
                        </div>

                        <div className="flex-1 flex flex-col gap-4 min-w-0">
                            <ShadcnCard className="flex-1 border-border shadow-none bg-card">
                                <CardContent className="p-5 flex-1 flex flex-col">
                                    <span className="text-[13px] font-semibold text-foreground mb-4 uppercase tracking-tighter">Activity Analytics</span>
                                    <div className="flex-1 min-h-[220px] relative"><BarChart chartData={FALLBACK_CHART_DATA} /></div>
                                </CardContent>
                            </ShadcnCard>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-4">
                        <ShadcnCard className="w-full lg:w-[42%] shrink-0 border-border shadow-none bg-card overflow-hidden">
                            <CardContent className="p-5 space-y-6">
                                {activeCheckIn ? (
                                    <div className="border-2 border-emerald-500/30 bg-emerald-950/10 rounded-2xl p-6 flex flex-col items-center text-center">
                                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                                        <h3 className="text-[14px] font-bold text-emerald-500 mb-1">Clinic Secured</h3>
                                        <p className="text-[11px] text-muted-foreground mb-4 leading-relaxed italic">Connected to professional:<br/><span className="font-mono text-emerald-400 mt-1 block tracking-wider">{activeCheckIn}</span></p>
                                        <Button variant="outline" onClick={handleLeaveRoom} disabled={isLeaving} className="text-[11px] h-9 border-emerald-500/50 text-emerald-500 hover:bg-emerald-900/30 transition-all px-6">
                                            {isLeaving ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <LogOut className="w-3.5 h-3.5 mr-2" />}
                                            Disconnect
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed rounded-2xl p-6 bg-background/50 flex flex-col items-center text-center">
                                        <QrCode className="w-6 h-6 text-accent mb-3" />
                                        <h3 className="text-[14px] font-bold mb-1 uppercase tracking-tight">Clinic Direct-Connect</h3>
                                        <div className="w-full max-w-[280px] flex flex-col gap-3 mt-4">
                                            <input type="text" value={checkInDoctorAddr} onChange={e => setCheckInDoctorAddr(e.target.value)} placeholder="0x..." disabled={isCheckingIn} className="border rounded-xl px-3 py-2.5 text-[12px] font-mono bg-background focus:ring-1 focus:ring-accent outline-none" />
                                            <ShimmerButton onClick={handleCheckIn} disabled={!checkInDoctorAddr.trim() || isCheckingIn} className="py-2.5 rounded-xl text-[12px] font-bold border-none" background='hsl(var(--accent))'>
                                                <span className="flex items-center gap-2 text-background">{isCheckingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />} Secure Check-In</span>
                                            </ShimmerButton>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-[14px] font-semibold mb-4 uppercase tracking-tighter flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-secondary"/> Live Permissions</h3>
                                    <div className="space-y-3">
                                        {activeGrants.length === 0 ? (
                                            <div className="text-[11px] text-muted-foreground text-center py-6 border rounded-xl bg-muted/20 italic">No external addresses have active access.</div>
                                        ) : (
                                            activeGrants.map(grant => (
                                                <div key={grant.id} className="flex justify-between items-center p-3.5 rounded-xl border bg-background hover:border-secondary/30 transition-all">
                                                    <div>
                                                        <p className="text-[12px] font-semibold font-mono text-foreground">{grant.doctorAddress || grant.viewerAddress}</p>
                                                        <p className="text-[10px] text-muted-foreground mt-0.5">{Array.isArray(grant.recordIds) ? grant.recordIds.length : 1} Records Active</p>
                                                    </div>
                                                    <button onClick={() => handleRevoke(grant)} disabled={revokingId === grant.id} className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-red-400 bg-red-950/20 hover:bg-red-500 hover:text-white disabled:opacity-50 transition-all">
                                                        {revokingId === grant.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Revoke'}
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </ShadcnCard>

                        <ShadcnCard className="flex-1 border-border shadow-none min-w-0 bg-card overflow-hidden">
                            <CardHeader className="p-5 pb-0">
                                <CardTitle className="text-[13px] font-semibold uppercase tracking-tighter flex items-center gap-2">
                                    {/* FIX 4: Use aliased icon HistoryIcon */}
                                    <HistoryIcon className="w-4 h-4 text-secondary"/> Chain-of-Custody Audit Log
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 pt-4 overflow-x-auto">
                                <Table>
                                    <TableHeader><TableRow>{['Activity', 'Record ID', 'Type', 'Status'].map(h => <TableHead key={h} className="text-[10px] font-semibold uppercase">{h}</TableHead>)}</TableRow></TableHeader>
                                    <TableBody>
                                        {records.map((row) => {
                                            const verified = !row.superseded;
                                            let activityLabel = row.previousRecordId ? "Amendment Issued" : (row.superseded ? "Record Archived" : "Record Minted");
                                            return (
                                                <TableRow key={row.recordId} className="hover:bg-muted/30 transition-colors">
                                                    <TableCell className="py-4 pl-5"><span className="text-[12px] font-medium">{activityLabel}</span></TableCell>
                                                    <TableCell className="py-4 font-mono text-[11px] text-muted-foreground">#{row.recordId}</TableCell>
                                                    <TableCell className="py-4 text-[11px]">{row.recordType}</TableCell>
                                                    <TableCell className="py-4 pr-5 text-right flex gap-3 justify-end items-center">
                                                        <Badge variant="outline" className={`text-[10px] border-none px-2 py-0.5 ${verified ? 'bg-secondary/10 text-secondary' : 'bg-amber-900/30 text-amber-400'}`}>{verified ? 'Verified' : 'Superseded'}</Badge>
                                                        <button onClick={(e) => handleViewDocument(e, getCid(row))} className="p-1.5 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary hover:text-background transition-all"><Eye className="w-4 h-4" /></button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </ShadcnCard>
                    </div>
                </main>
            </div>
            <GrantAccessModal open={grantModalOpen} onClose={(res) => {
                setGrantModalOpen(false);
                if (res?.success) fetchGrants();
            }} records={records} />
        </div>
    );
}
