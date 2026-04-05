import React, { useState, useEffect, useCallback } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import {
    LayoutDashboard, FileText, ShieldCheck, Bell, Settings, LogOut,
    Stethoscope, Activity, MoreHorizontal, Search, Plus, Calendar,
    Hospital, HeartPulse, Syringe, Menu, HelpCircle, Mail, Filter,
    CheckCircle2, ClipboardList, Download, Bot, ChevronsLeft, Upload, Loader2, X,
    QrCode, Trash2, Clock,
} from 'lucide-react';
import { AnimatedThemeToggler } from '../magicui/animated-theme-toggler';

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
import { getPatientVault, grantAccess, revokeAccess, checkInToClinic } from '../../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/* ─── Fallback Mock Data (shown while API loads or on error) ──── */
const FALLBACK_CHART_DATA = [
    { month: 'Jan', v: 0 }, { month: 'Feb', v: 0 }, { month: 'Mar', v: 0 },
    { month: 'Apr', v: 0 }, { month: 'May', v: 0 }, { month: 'Jun', v: 0 },
    { month: 'Jul', v: 0 }, { month: 'Aug', v: 0 }, { month: 'Sep', v: 0 },
    { month: 'Oct', v: 0 }, { month: 'Nov', v: 0 }, { month: 'Dec', v: 0 },
];

const RECORD_ICONS = { 'Blood Test': Activity, 'MRI': Hospital, 'Vaccination': Syringe, 'Cardiology': HeartPulse };

const NAV = {
    main: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'records', label: 'My Records', icon: FileText },
        { id: 'access', label: 'Access Control', icon: ShieldCheck },
        { id: 'appointments', label: 'Appointments', icon: Calendar },
    ],
    features: [
        { id: 'prescriptions', label: 'Prescriptions', icon: ClipboardList },
        { id: 'scans', label: 'Scans & Imaging', icon: Bot },
        { id: 'notifications', label: 'Notifications', icon: Bell },
    ],
    general: [
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'logout', label: 'Log out', icon: LogOut },
    ],
};

const short = (addr) => addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : '0x0000…0000';

/* ─── Bar Chart ─────────────────────────────────────────── */
function BarChart({ chartData }) {
    const isDark = document.documentElement.classList.contains('dark');
    const barBg = isDark ? '#D2E75F' : '#B04B20';
    const barHover = isDark ? '#c2d44e' : '#8A3B19';
    const tooltipBg = isDark ? '#1A1A1B' : '#DECBB0';
    const tooltipTitle = isDark ? '#888' : '#8A3B19';
    const tooltipBody = isDark ? '#e5e5e0' : '#1B1810';

    const data = {
        labels: chartData.map(d => d.month),
        datasets: [
            {
                label: 'Records',
                data: chartData.map(d => d.v),
                backgroundColor: barBg,
                hoverBackgroundColor: barHover,
                borderRadius: 4,
                borderSkipped: false,
                barThickness: 'flex',
                maxBarThickness: 32,
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 1000 },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: tooltipBg,
                titleColor: tooltipTitle,
                bodyColor: tooltipBody,
                titleFont: { size: 10, family: 'Inter', weight: 'normal' },
                bodyFont: { size: 14, family: 'Inter', weight: 'bold' },
                padding: 10,
                cornerRadius: 8,
                displayColors: false,
                borderColor: 'hsl(var(--border))',
                borderWidth: 1,
                callbacks: {
                    title: () => 'Records',
                    label: (context) => context.parsed.y
                }
            }
        },
        scales: {
            x: {
                grid: { display: false, drawBorder: false },
                ticks: { color: '#555', font: { size: 10, family: 'Inter' } }
            },
            y: {
                beginAtZero: true,
                grid: { color: 'hsl(var(--border))', drawBorder: false },
                ticks: { stepSize: 2, color: '#555', font: { size: 10, family: 'Inter' }, padding: 10 },
                border: { display: false }
            }
        },
        interaction: { mode: 'index', intersect: false },
    };

    return (
        <div className="w-full h-full min-h-[160px] pb-2">
            <Bar data={data} options={options} />
        </div>
    );
}

/* ─── Sidebar nav item ──────────────────────────────────── */
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
            {item.badge != null && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
                    ${active
                        ? 'bg-secondary/20 text-secondary'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                    {item.badge}
                </span>
            )}
        </button>
    );
}

/* ─── Sidebar ───────────────────────────────────────────── */
function Sidebar({ activeNav, setActiveNav, setMobileOpen, onLogout }) {
    return (
        <aside className="flex flex-col w-[240px] shrink-0 h-full bg-background border-r border-border">
            {/* Logo */}
            <div className="flex items-center justify-between px-5 py-[18px] border-b border-border">
                <img src="/logo.png" alt="MediChain" className="h-8 w-auto object-contain" />
                <button className="p-1.5 rounded-lg text-muted-foreground hover:text-muted-foreground hover:bg-muted transition-colors">
                    <ChevronsLeft className="w-4 h-4" />
                </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-2 text-muted-foreground">
                        Main Menu
                    </p>
                    <ul className="space-y-0.5">
                        {NAV.main.map(item => (
                            <li key={item.id}>
                                <NavItem item={item} active={activeNav === item.id}
                                    onClick={() => { setActiveNav(item.id); setMobileOpen(false); }} />
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
                                <NavItem item={item} active={false} onClick={() => { }} />
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

            {/* Blockchain secured card */}
            <div className="m-3 p-4 rounded-2xl text-foreground" style={{ background: 'linear-gradient(135deg, #1a2a0a 0%, #2a3d12 55%, #3a5218 100%)' }}>
                <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-4 h-4 text-secondary" />
                    <span className="text-[11px] font-semibold text-secondary/80 uppercase tracking-wider">
                        Blockchain Secured
                    </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                    Your records are owned by you and verified on Polygon.
                </p>
                <button className="w-full py-1.5 rounded-xl text-[11px] font-semibold text-secondary transition-colors border border-secondary/30 hover:bg-secondary/10"
                    style={{ background: 'rgba(210,231,95,0.08)' }}>
                    View on Chain
                </button>
            </div>
        </aside>
    );
}

/* ─── Icon badge ─────────────────────────────────────────── */
function IconBadge({ icon: Icon }) {
    return (
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-secondary/10">
            <Icon className="w-3.5 h-3.5 text-secondary" />
        </div>
    );
}

/* ─── Grant Access Modal ─────────────────────────────────── */
function GrantAccessModal({ open, onClose, records }) {
    const [doctorAddr, setDoctorAddr] = useState('');
    const [selectedRecords, setSelectedRecords] = useState([]);
    const [duration, setDuration] = useState(86400); // 24h default
    const [error, setError] = useState('');
    const tx = useTransaction();

    if (!open) return null;

    const toggleRecord = (id) => {
        setSelectedRecords(prev =>
            prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
        );
    };

    const handleGrant = async () => {
        if (!doctorAddr.trim() || selectedRecords.length === 0) return;
        tx.startTransaction('Granting Access…');
        setError('');
        try {
            await grantAccess(doctorAddr.trim(), selectedRecords, duration);
            // Track the grant locally for the revoke UI
            const durationLabels = { 3600: '1 Hour', 86400: '24 Hours', 604800: '7 Days', 2592000: '30 Days', 15552000: '180 Days' };
            onClose({
                success: true,
                grant: {
                    id: Date.now(),
                    doctorAddress: doctorAddr.trim(),
                    recordIds: [...selectedRecords],
                    durationInSeconds: duration,
                    durationLabel: durationLabels[duration] || `${Math.round(duration / 3600)}h`,
                    grantedAt: new Date().toISOString(),
                },
            });
        } catch (err) {
            tx.setFailed(err);
            setError(err.message || 'Failed to grant access');
        } finally {
            // modal stays open until success
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md mx-4 bg-card border border-border rounded-2xl shadow-2xl">
                <div className="flex items-center justify-between px-6 pt-5 pb-3">
                    <h3 className="text-sm font-semibold text-foreground">Grant Record Access</h3>
                    <button onClick={() => onClose(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
                </div>
                <div className="px-6 pb-5 space-y-4">
                    <div>
                        <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1 block">Doctor Wallet Address</label>
                        <input type="text" value={doctorAddr} onChange={e => setDoctorAddr(e.target.value)} placeholder="0x..." className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/40" />
                    </div>
                    {records.length > 0 && (
                        <div>
                            <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 block">Select Records</label>
                            <div className="max-h-32 overflow-y-auto space-y-1">
                                {records.map(r => (
                                    <label key={r.recordId} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer text-xs text-foreground">
                                        <input type="checkbox" checked={selectedRecords.includes(r.recordId)} onChange={() => toggleRecord(r.recordId)} className="accent-secondary" />
                                        #{r.recordId} — {r.recordType || 'Medical Record'}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                    <div>
                        <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1 block">Duration</label>
                        <select value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/40">
                            <option value={3600}>1 Hour</option>
                            <option value={86400}>24 Hours</option>
                            <option value={604800}>7 Days</option>
                            <option value={2592000}>30 Days</option>
                            <option value={15552000}>180 Days</option>
                        </select>
                    </div>
                    {error && <p className="text-xs text-red-400 bg-red-950/30 px-3 py-2 rounded-lg">{error}</p>}
                    <button onClick={handleGrant} disabled={!doctorAddr.trim() || selectedRecords.length === 0} className="w-full py-2.5 rounded-xl text-sm font-semibold bg-secondary text-background disabled:opacity-50 flex items-center justify-center gap-2">
                        Grant Access
                    </button>
                    <TransactionModal 
                        state={tx.txState} 
                        onClose={tx.reset} 
                        title={tx.txTitle} 
                        txHash={tx.txHash} 
                        error={tx.txError} 
                    />
                </div>
            </div>
        </div>
    );
}

/* ─── Main Dashboard ────────────────────────────────────── */
export default function PatientDashboard() {
    const account = useActiveAccount();
    const { user, logout } = useAuth();
    const [activeNav, setActiveNav] = useState('records');
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isDark, setIsDark] = useState(true);

    // Live data state
    const [records, setRecords] = useState([]);
    const [loadingRecords, setLoadingRecords] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [grantModalOpen, setGrantModalOpen] = useState(false);

    // Check-in state
    const [checkInDoctorAddr, setCheckInDoctorAddr] = useState('');
    const [isCheckingIn, setIsCheckingIn] = useState(false);
    const [checkInSuccess, setCheckInSuccess] = useState(false);

    // Active grants tracking (session-based since no GET endpoint)
    const [activeGrants, setActiveGrants] = useState([]);

    // Fetch vault records on mount
    const fetchRecords = useCallback(async () => {
        setLoadingRecords(true);
        setErrorMsg('');
        try {
            const res = await getPatientVault();
            setRecords(res.data || []);
        } catch (err) {
            setErrorMsg(err.message || 'Failed to load records');
        } finally {
            setLoadingRecords(false);
        }
    }, []);

    useEffect(() => { fetchRecords(); }, [fetchRecords]);

    const fetchGrants = useCallback(async () => {
        setLoadingGrants(true);
        try {
            const res = await getActiveGrants();
            setActiveGrants(res.data || []);
        } catch (err) {
            console.error('Failed to load active grants:', err);
            setActiveGrants([]);
        } finally {
            setLoadingGrants(false);
        }
    }, []);

    useEffect(() => { fetchGrants(); }, [fetchGrants]);

    const handleRevoke = async (doctorAddress, recordId) => {
        tx.startTransaction('Revoking Access…');
        try {
            await revokeAccess(doctorAddress, recordId);
            tx.setConfirmed();
            fetchGrants(); // Refresh
        } catch (err) {
            tx.setFailed(err);
        }
    };

    // Derived data
    const totalRecords = records.length;
    const verifiedRecords = records.filter(r => !r.superseded).length;
    const chartData = FALLBACK_CHART_DATA.map(m => ({ ...m })); // clone
    // Populate chart from real data (if records have dates, we'd parse them; for now just count)

    const recentRecords = records.slice(0, 4).map((r, i) => ({
        id: r.recordId,
        type: r.recordType || 'Medical Record',
        icon: RECORD_ICONS[r.recordType] || Activity,
        status: r.superseded ? 'Superseded' : 'Active',
    }));

    const displayName = user?.name || 'Patient';

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    // Check-in handler
    const handleCheckIn = async () => {
        if (!checkInDoctorAddr.trim()) return;
        setIsCheckingIn(true);
        setErrorMsg('');
        try {
            await checkInToClinic(checkInDoctorAddr.trim());
            setCheckInSuccess(true);
            setTimeout(() => setCheckInSuccess(false), 5000);
        } catch (err) {
            setErrorMsg(err.message || 'Failed to check in');
        } finally {
            setIsCheckingIn(false);
        }
    };

    // Revoke handler
    const handleRevoke = async (grant) => {
        setErrorMsg('');
        try {
            // Revoke each record in the grant
            for (const recId of grant.recordIds) {
                await revokeAccess(grant.doctorAddress, recId);
            }
            // Remove from local tracking
            setActiveGrants(prev => prev.filter(g => g.id !== grant.id));
        } catch (err) {
            setErrorMsg(err.message || 'Failed to revoke access');
        }
    };

    return (
        <div className="flex h-screen overflow-hidden font-body bg-background">

            {/* Sidebar — desktop */}
            <div className="hidden lg:flex">
                <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} setMobileOpen={setMobileOpen} onLogout={handleLogout} />
            </div>

            {/* Sidebar — mobile overlay */}
            {mobileOpen && (
                <>
                    <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
                    <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
                        <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} setMobileOpen={setMobileOpen} onLogout={handleLogout} />
                    </div>
                </>
            )}

            {/* Main area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Top header */}
                <header className="flex items-center justify-between px-4 lg:px-6 py-3.5 bg-background border-b border-border shrink-0">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setMobileOpen(true)}
                            className="lg:hidden p-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors">
                            <Menu className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-[15px] font-semibold leading-tight text-foreground">
                                Welcome back, {displayName} 👋
                            </h1>
                            <p className="text-[11px] hidden sm:block text-muted-foreground">
                                Monitor and manage your health records today.
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

                        <div className="hidden lg:flex items-center gap-2 border border-border rounded-xl px-3 py-[7px] text-[11px] w-48 bg-card text-muted-foreground focus-within:bg-muted focus-within:ring-2 focus-within:ring-secondary/40 transition-colors cursor-text">
                            <Search className="w-3.5 h-3.5 shrink-0" />
                            <input type="text" placeholder="Search" className="flex-1 bg-transparent border-none outline-none text-foreground min-w-0" />
                            <span className="text-[10px] border border-border rounded px-1.5 font-medium text-muted-foreground shrink-0">⌘K</span>
                        </div>

                        {[HelpCircle, Mail].map((Icon, i) => (
                            <button key={i} className="hidden sm:flex w-8 h-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted transition-colors">
                                <Icon className="w-4 h-4" />
                            </button>
                        ))}

                        <div className="relative">
                            <button className="w-8 h-8 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-muted transition-colors">
                                <Bell className="w-4 h-4" />
                            </button>
                            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent" />
                        </div>

                        <AnimatedThemeToggler />

                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-background text-[11px] font-bold shrink-0"
                            style={{ background: 'linear-gradient(135deg, #D2E75F, #c2d44e)' }}>
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Scrollable content */}
                <main className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 lg:py-5 space-y-4">

                    {/* Error banner */}
                    {errorMsg && (
                        <div className="bg-red-950/30 border border-red-900/50 text-red-300 text-xs p-3 rounded-xl">
                            {errorMsg}
                            <button onClick={fetchRecords} className="ml-2 underline">Retry</button>
                        </div>
                    )}

                    {/* ════ ROW 1 ════ */}
                    <div className="flex flex-col lg:flex-row gap-4">

                        {/* LEFT: Health Overview card */}
                        <div className="w-full lg:w-[42%] shrink-0">
                            <MagicCard className="h-full" gradientColor='hsl(var(--muted))'>
                                <CardContent className="p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <IconBadge icon={FileText} />
                                            <span className="text-[13px] font-medium text-muted-foreground">Total Records</span>
                                        </div>
                                        <Badge variant="outline" className="flex items-center gap-1.5 py-0.5 border-border">
                                            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                                            <span className="text-[10px] font-semibold text-muted-foreground">NFT</span>
                                        </Badge>
                                    </div>

                                    <div className="mb-1 text-foreground flex items-center h-12">
                                        {loadingRecords ? (
                                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                        ) : (
                                            <NumberTicker value={totalRecords} className="text-[2.6rem] font-bold tracking-tight leading-none" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 mb-5">
                                        <span className="text-[11px] font-semibold text-secondary">On-chain</span>
                                        <span className="text-[11px] text-muted-foreground">verified records</span>
                                    </div>

                                    <div className="flex gap-2 mb-5">
                                        <ShimmerButton className="flex-1 py-[10px] rounded-xl active:scale-[0.98] shadow-md border-none flex"
                                            background='hsl(var(--accent))' shimmerColor="#FFD6E8">
                                            <span className="flex items-center justify-center gap-1.5 text-[12px] font-semibold text-background">
                                                <Upload className="w-3.5 h-3.5" />
                                                Upload Record
                                            </span>
                                        </ShimmerButton>
                                        <Button
                                            onClick={() => setGrantModalOpen(true)}
                                            variant="outline"
                                            className="flex-1 flex items-center justify-center gap-1.5 h-auto py-[10px] rounded-xl text-[12px] font-semibold text-secondary border-secondary/40 hover:bg-secondary/10"
                                        >
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                            Grant Access
                                        </Button>
                                    </div>

                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[12px] font-semibold text-muted-foreground">Recent Records</span>
                                        <button className="flex items-center gap-0.5 text-[11px] font-medium text-secondary">
                                            <Plus className="w-3 h-3" />Add New
                                        </button>
                                    </div>

                                    <div className="space-y-1">
                                        {loadingRecords ? (
                                            <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
                                        ) : recentRecords.length === 0 ? (
                                            <p className="text-xs text-muted-foreground text-center py-4">No records yet</p>
                                        ) : (
                                            recentRecords.map(r => {
                                                const Icon = r.icon;
                                                const active = r.status === 'Active';
                                                return (
                                                    <div key={r.id}
                                                        className="flex items-center gap-3 px-2.5 py-2 rounded-xl transition-colors cursor-default hover:bg-secondary/5">
                                                        <IconBadge icon={Icon} />
                                                        <span className="flex-1 text-[12px] font-medium truncate text-foreground">
                                                            {r.type}
                                                        </span>
                                                        <div className="flex items-center gap-1.5 shrink-0">
                                                            <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-secondary' : 'bg-gray-600'}`} />
                                                            <span className={`text-[11px] font-medium ${active ? 'text-secondary' : 'text-muted-foreground'}`}>
                                                                {r.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </CardContent>
                            </MagicCard>
                        </div>

                        {/* RIGHT: Two stat cards + chart */}
                        <div className="flex-1 flex flex-col gap-4 min-w-0">

                            <div className="grid grid-cols-2 gap-4">
                                {/* Verified Records */}
                                <MagicCard gradientColor='hsl(var(--muted))'>
                                    <CardContent className="p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <IconBadge icon={CheckCircle2} />
                                                <span className="text-[12px] font-medium text-muted-foreground">Verified Records</span>
                                            </div>
                                            <button className="text-muted-foreground hover:text-muted-foreground">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="mb-1 text-foreground flex items-center h-9">
                                            {loadingRecords ? (
                                                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                            ) : (
                                                <NumberTicker value={verifiedRecords} className="text-[2rem] font-bold tracking-tight leading-none" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[11px] text-muted-foreground">of {totalRecords} total</span>
                                        </div>
                                    </CardContent>
                                </MagicCard>

                                {/* Active Access */}
                                <MagicCard gradientColor='hsl(var(--muted))'>
                                    <CardContent className="p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <IconBadge icon={Stethoscope} />
                                                <span className="text-[12px] font-medium text-muted-foreground">Active Access</span>
                                            </div>
                                            <button className="text-muted-foreground hover:text-muted-foreground">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="mb-1 text-foreground flex items-center h-9">
                                            <NumberTicker value={activeGrants.length} className="text-[2rem] font-bold tracking-tight leading-none" />
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[11px] text-muted-foreground">active grants</span>
                                        </div>
                                    </CardContent>
                                </MagicCard>
                            </div>

                            {/* Overview Chart */}
                            <ShadcnCard className="flex-1 border-border shadow-none min-h-[220px] flex flex-col bg-card">
                                <CardContent className="p-5 flex-1 flex flex-col">
                                    <div className="flex items-center justify-between mb-4 shrink-0">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[13px] font-semibold text-foreground">Overview</span>
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-secondary" />
                                                <span className="text-[11px] text-muted-foreground">Records</span>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" className="h-7 text-[11px] text-muted-foreground rounded-xl px-3 gap-1.5 flex bg-transparent border-border">
                                            This Year
                                            <svg width="8" height="5" viewBox="0 0 8 5" fill="none">
                                                <path d="M1 1l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </Button>
                                    </div>
                                    <div className="flex-1 min-h-0 relative">
                                        <div className="absolute inset-0">
                                            <BarChart chartData={chartData} />
                                        </div>
                                    </div>
                                </CardContent>
                            </ShadcnCard>
                        </div>
                    </div>

                    {/* ════ ROW 2 ════ */}
                    <div className="flex flex-col lg:flex-row gap-4">

                        {/* Check-In + Access Control */}
                        <ShadcnCard className="w-full lg:w-[42%] shrink-0 border-border shadow-none bg-card">
                            <CardContent className="p-5 space-y-5">
                                {/* Check-In to Clinic */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-accent/10">
                                            <QrCode className="w-3.5 h-3.5 text-accent" />
                                        </div>
                                        <span className="text-[13px] font-semibold text-foreground">Check In to Clinic</span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground mb-3">Enter your doctor's wallet address to check in (simulates QR scan).</p>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={checkInDoctorAddr}
                                            onChange={e => setCheckInDoctorAddr(e.target.value)}
                                            placeholder="Doctor Wallet (0x...)"
                                            className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-[11px] text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 min-w-0"
                                        />
                                        <button
                                            onClick={handleCheckIn}
                                            disabled={!checkInDoctorAddr.trim() || isCheckingIn}
                                            className="px-4 py-2 rounded-xl text-[11px] font-semibold bg-accent text-background disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                                        >
                                            {isCheckingIn ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <QrCode className="w-3.5 h-3.5" />}
                                            {isCheckingIn ? 'Checking in…' : 'Check In'}
                                        </button>
                                    </div>
                                    {checkInSuccess && (
                                        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-950/30 px-3 py-1.5 rounded-lg">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            Checked in successfully! You're in the doctor's waiting room.
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-border" />

                                {/* Access Control */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-secondary/10">
                                                <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
                                            </div>
                                            <span className="text-[13px] font-semibold text-foreground">Access Control</span>
                                        </div>
                                        {activeGrants.length > 0 && (
                                            <Badge variant="outline" className="text-[10px] border-secondary/30 text-secondary">
                                                {activeGrants.length} active
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Active Grants List */}
                                    <div className="space-y-2 mb-3">
                                        {activeGrants.length === 0 ? (
                                            <p className="text-[11px] text-muted-foreground">No active access grants. Grant access to let doctors view your records.</p>
                                        ) : (
                                            activeGrants.map(grant => (
                                                <div key={grant.id} className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-background/60">
                                                    <div className="min-w-0">
                                                        <p className="text-[11px] font-semibold text-foreground font-mono truncate">
                                                            {`${grant.doctorAddress.slice(0, 6)}…${grant.doctorAddress.slice(-4)}`}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[10px] text-muted-foreground">{grant.recordIds.length} record{grant.recordIds.length > 1 ? 's' : ''}</span>
                                                            <span className="text-[10px] text-muted-foreground">·</span>
                                                            <span className="text-[10px] text-secondary flex items-center gap-1"><Clock className="w-3 h-3" />{grant.durationLabel}</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRevoke(grant)}
                                                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-red-400 bg-red-950/30 hover:bg-red-900/40 transition-colors shrink-0"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                        Revoke
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Grant new access */}
                                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => setGrantModalOpen(true)}>
                                        <div className="w-9 h-9 rounded-full flex items-center justify-center border-2 border-dashed border-border shrink-0">
                                            <Plus className="w-3.5 h-3.5 text-muted-foreground" />
                                        </div>
                                        <span className="text-[12px] text-muted-foreground">Grant new access</span>
                                    </div>
                                </div>
                            </CardContent>
                        </ShadcnCard>

                        {/* Audit Log */}
                        <ShadcnCard className="flex-1 border-border shadow-none min-w-0 overflow-hidden bg-card">
                            <CardHeader className="p-5 pb-0 items-center flex-row justify-between space-y-0">
                                <CardTitle className="text-[13px] font-semibold text-foreground">Audit Log</CardTitle>
                                <Button variant="outline" size="sm" className="h-7 text-[11px] text-muted-foreground rounded-xl px-3 gap-1.5 flex bg-transparent border-border">
                                    <Filter className="w-3 h-3" />
                                    Filter
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0 pt-4 overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-border hover:bg-transparent">
                                            {['Activity', 'Record ID', 'Type', 'Status'].map((h, i) => (
                                                <TableHead key={h} className={`h-10 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ${i === 3 ? 'text-right pr-5' : 'pl-5'}`}>
                                                    {h}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loadingRecords ? (
                                            <TableRow><TableCell colSpan={4} className="text-center py-8"><Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" /></TableCell></TableRow>
                                        ) : records.length === 0 ? (
                                            <TableRow><TableCell colSpan={4} className="text-center py-8 text-xs text-muted-foreground">No records found</TableCell></TableRow>
                                        ) : (
                                            records.slice(0, 5).map((row) => {
                                                const verified = !row.superseded;
                                                return (
                                                    <TableRow key={row.recordId} className="group border-b-0 hover:bg-secondary/5 transition-colors">
                                                        <TableCell className="py-3 pl-5">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-secondary/10">
                                                                    <Activity className="w-3.5 h-3.5 text-secondary" />
                                                                </div>
                                                                <span className="text-[12px] font-medium whitespace-nowrap text-foreground">
                                                                    Record Minted
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-3">
                                                            <span className="text-[11px] whitespace-nowrap text-muted-foreground font-mono">#{row.recordId}</span>
                                                        </TableCell>
                                                        <TableCell className="py-3">
                                                            <span className="text-[11px] whitespace-nowrap text-muted-foreground">{row.recordType || 'Medical Record'}</span>
                                                        </TableCell>
                                                        <TableCell className="py-3 pr-5 text-right">
                                                            <Badge variant="outline" className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border-none ${verified
                                                                ? 'bg-secondary/10 text-secondary'
                                                                : 'bg-amber-900/30 text-amber-400'
                                                                }`}>
                                                                {verified && <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-secondary" />}
                                                                {verified ? 'Verified' : 'Superseded'}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </ShadcnCard>
                    </div>

                    <div className="h-4" />
                </main>
            </div>

            {/* Grant Access Modal */}
            <GrantAccessModal
                open={grantModalOpen}
                onClose={(result) => {
                    setGrantModalOpen(false);
                    if (result?.success) {
                        fetchRecords();
                        if (result.grant) {
                            setActiveGrants(prev => [result.grant, ...prev]);
                            // Pre-fill check-in doctor address from the grant
                            setCheckInDoctorAddr(result.grant.doctorAddress);
                        }
                    }
                }}
                records={records}
            />

            <TransactionModal 
                state={tx.txState} 
                onClose={tx.reset} 
                title={tx.txTitle} 
                txHash={tx.txHash} 
                error={tx.txError} 
            />
        </div>
    );
}
