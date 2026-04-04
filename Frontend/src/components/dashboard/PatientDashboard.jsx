import React, { useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import {
    LayoutDashboard, FileText, ShieldCheck, Bell, Settings, LogOut,
    Stethoscope, Activity, MoreHorizontal, Search, Plus, Calendar,
    Hospital, HeartPulse, Syringe, Menu, HelpCircle, Mail, Filter,
    CheckCircle2, ClipboardList, Download, Bot, ChevronsLeft, Upload,
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/* ─── Mock Data ─────────────────────────────────────────── */
const CHART_DATA = [
    { month: 'Jan', v: 2 }, { month: 'Feb', v: 3 }, { month: 'Mar', v: 5 },
    { month: 'Apr', v: 4 }, { month: 'May', v: 2 }, { month: 'Jun', v: 3 },
    { month: 'Jul', v: 6 }, { month: 'Aug', v: 8 }, { month: 'Sep', v: 4 },
    { month: 'Oct', v: 2 }, { month: 'Nov', v: 3 }, { month: 'Dec', v: 1 },
];

const RECENT_RECORDS = [
    { id: 1, type: 'Blood Test Report', icon: Activity, status: 'Active' },
    { id: 2, type: 'Chest X-Ray', icon: Hospital, status: 'Active' },
    { id: 3, type: 'Vaccination Record', icon: Syringe, status: 'Active' },
    { id: 4, type: 'Cardiology Report', icon: HeartPulse, status: 'Inactive' },
];

const ACCESS_GRANTS = [
    { id: 1, name: 'Dr. Ananya Sharma', specialty: 'Haematologist', avatar: 'AS', progress: 62, label: '112 / 180 days' },
    { id: 2, name: 'Dr. Rohan Mehta', specialty: 'Radiologist', avatar: 'RM', progress: 45, label: '99 / 180 days' },
];

const AUDIT_LOG = [
    { id: 1, type: 'Blood Test Report', icon: Activity, date: 'Wed, 28 Mar 2026', doctor: 'Dr. Ananya Sharma', status: 'Verified' },
    { id: 2, type: 'Access Granted', icon: ShieldCheck, date: 'Tue, 27 Mar 2026', doctor: 'Dr. Rohan Mehta', status: 'Success' },
    { id: 3, type: 'Chest X-Ray', icon: Hospital, date: 'Sun, 14 Feb 2026', doctor: 'Dr. Rohan Mehta', status: 'Verified' },
];

const NAV = {
    main: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'records', label: 'My Records', icon: FileText, badge: 24 },
        { id: 'access', label: 'Access Control', icon: ShieldCheck },
        { id: 'appointments', label: 'Appointments', icon: Calendar, badge: 2 },
    ],
    features: [
        { id: 'prescriptions', label: 'Prescriptions', icon: ClipboardList, badge: 12 },
        { id: 'scans', label: 'Scans & Imaging', icon: Bot },
        { id: 'notifications', label: 'Notifications', icon: Bell, badge: 5 },
    ],
    general: [
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'logout', label: 'Log out', icon: LogOut },
    ],
};

const short = (addr) => addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : '0x71C7…3F4b';

/* ─── Bar Chart ─────────────────────────────────────────── */
function BarChart() {
    const isDark = document.documentElement.classList.contains('dark');
    const barBg = isDark ? '#D2E75F' : '#B04B20';
    const barHover = isDark ? '#c2d44e' : '#8A3B19';
    const tooltipBg = isDark ? '#1A1A1B' : '#DECBB0';
    const tooltipTitle = isDark ? '#888' : '#8A3B19';
    const tooltipBody = isDark ? '#e5e5e0' : '#1B1810';

    const data = {
        labels: CHART_DATA.map(d => d.month),
        datasets: [
            {
                label: 'Records',
                data: CHART_DATA.map(d => d.v),
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
                max: 10,
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
function Sidebar({ activeNav, setActiveNav, setMobileOpen }) {
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
                                    <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150
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

/* ─── Main Dashboard ────────────────────────────────────── */
export default function PatientDashboard() {
    const account = useActiveAccount();
    const [activeNav, setActiveNav] = useState('records');
    const [mobileOpen, setMobileOpen] = useState(false);
    const [grants, setGrants] = useState(ACCESS_GRANTS);
    const [isDark, setIsDark] = useState(true);

    return (
        <div className="flex h-screen overflow-hidden font-body bg-background">

            {/* Sidebar — desktop */}
            <div className="hidden lg:flex">
                <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} setMobileOpen={setMobileOpen} />
            </div>

            {/* Sidebar — mobile overlay */}
            {mobileOpen && (
                <>
                    <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
                    <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
                        <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} setMobileOpen={setMobileOpen} />
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
                                Welcome back, Sarah{account ? ' 👋' : ''}
                            </h1>
                            <p className="text-[11px] hidden sm:block text-muted-foreground">
                                Monitor and manage your health records today.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Date + Export */}
                        <div className="hidden md:flex items-center gap-2">
                            <div className="flex items-center gap-1.5 border border-border rounded-xl px-3 py-[7px] text-[11px] text-muted-foreground">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>Thu, 03 Apr 2026</span>
                            </div>
                            <button className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-[7px] rounded-xl bg-gray-100 text-gray-900 transition-opacity hover:opacity-85">
                                <Download className="w-3.5 h-3.5" />
                                Export
                            </button>
                        </div>

                        {/* Search */}
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

                        {/* Bell */}
                        <div className="relative">
                            <button className="w-8 h-8 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-muted transition-colors">
                                <Bell className="w-4 h-4" />
                            </button>
                            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent" />
                        </div>

                        <AnimatedThemeToggler />

                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-background text-[11px] font-bold shrink-0"
                            style={{ background: 'linear-gradient(135deg, #D2E75F, #c2d44e)' }}>
                            S
                        </div>
                    </div>
                </header>

                {/* Scrollable content */}
                <main className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 lg:py-5 space-y-4">

                    {/* ════ ROW 1 ════ */}
                    <div className="flex flex-col lg:flex-row gap-4">

                        {/* LEFT: Health Overview card */}
                        <div className="w-full lg:w-[42%] shrink-0">
                            <MagicCard className="h-full" gradientColor='hsl(var(--muted))'>
                                <CardContent className="p-5">
                                    {/* Header */}
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

                                    {/* Big number */}
                                    <div className="mb-1 text-foreground flex items-center h-12">
                                        <NumberTicker value={24} className="text-[2.6rem] font-bold tracking-tight leading-none" />
                                    </div>
                                    <div className="flex items-center gap-1.5 mb-5">
                                        <span className="text-[11px] font-semibold text-secondary">↑ +3.2%</span>
                                        <span className="text-[11px] text-muted-foreground">from last month</span>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex gap-2 mb-5">
                                        <ShimmerButton className="flex-1 py-[10px] rounded-xl active:scale-[0.98] shadow-md border-none flex"
                                            background='hsl(var(--accent))' shimmerColor="#FFD6E8">
                                            <span className="flex items-center justify-center gap-1.5 text-[12px] font-semibold text-background">
                                                <Upload className="w-3.5 h-3.5" />
                                                Upload Record
                                            </span>
                                        </ShimmerButton>
                                        <Button variant="outline" className="flex-1 flex items-center justify-center gap-1.5 h-auto py-[10px] rounded-xl text-[12px] font-semibold text-secondary border-secondary/40 hover:bg-secondary/10">
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                            Grant Access
                                        </Button>
                                    </div>

                                    {/* Recent Records */}
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[12px] font-semibold text-muted-foreground">Recent Records</span>
                                        <button className="flex items-center gap-0.5 text-[11px] font-medium text-secondary">
                                            <Plus className="w-3 h-3" />Add New
                                        </button>
                                    </div>

                                    <div className="space-y-1">
                                        {RECENT_RECORDS.map(r => {
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
                                        })}
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
                                            <NumberTicker value={21} className="text-[2rem] font-bold tracking-tight leading-none" />
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[11px] font-semibold text-red-400">↓ -2.1%</span>
                                            <span className="text-[11px] text-muted-foreground">from last month</span>
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
                                            <NumberTicker value={3} className="text-[2rem] font-bold tracking-tight leading-none" />
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[11px] font-semibold text-secondary">↑ +4.5%</span>
                                            <span className="text-[11px] text-muted-foreground">from last month</span>
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
                                            <BarChart />
                                        </div>
                                    </div>
                                </CardContent>
                            </ShadcnCard>
                        </div>
                    </div>

                    {/* ════ ROW 2 ════ */}
                    <div className="flex flex-col lg:flex-row gap-4">

                        {/* Access Control */}
                        <ShadcnCard className="w-full lg:w-[42%] shrink-0 border-border shadow-none bg-card">
                            <CardHeader className="p-5 pb-0 items-center flex-row justify-between space-y-0">
                                <CardTitle className="text-[13px] font-semibold text-foreground">Access Control</CardTitle>
                                <button className="text-muted-foreground hover:text-muted-foreground">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </CardHeader>
                            <CardContent className="p-5 pt-5 space-y-5">
                                {grants.map(doc => (
                                    <div key={doc.id} className="space-y-2.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-background text-[10px] font-bold shrink-0"
                                                style={{ background: 'linear-gradient(135deg, #D2E75F, #c2d44e)' }}>
                                                {doc.avatar}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[12px] font-semibold truncate text-foreground">{doc.name}</p>
                                                <p className="text-[10px] truncate text-muted-foreground">{doc.specialty}</p>
                                            </div>
                                            <div className="shrink-0 flex flex-col items-end">
                                                <span className="text-[11px] font-semibold text-muted-foreground">{doc.label}</span>
                                                <span className="text-[10px] text-muted-foreground">{doc.progress}% elapsed</span>
                                            </div>
                                        </div>
                                        {/* Progress bar */}
                                        <div className="h-1.5 w-full rounded-full overflow-hidden bg-muted">
                                            <div className="h-full rounded-full bg-secondary transition-all duration-500"
                                                style={{ width: `${doc.progress}%` }} />
                                        </div>
                                    </div>
                                ))}

                                <div className="flex items-center gap-3 pt-1">
                                    <div className="w-9 h-9 rounded-full flex items-center justify-center border-2 border-dashed border-border shrink-0">
                                        <Plus className="w-3.5 h-3.5 text-muted-foreground" />
                                    </div>
                                    <span className="text-[12px] text-muted-foreground">Grant new access</span>
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
                                            {['Activity', 'Date', 'Doctor', 'Status'].map((h, i) => (
                                                <TableHead key={h} className={`h-10 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ${i === 3 ? 'text-right pr-5' : 'pl-5'}`}>
                                                    {h}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {AUDIT_LOG.map((row) => {
                                            const Icon = row.icon;
                                            const verified = row.status !== 'Pending';
                                            return (
                                                <TableRow key={row.id} className="group border-b-0 hover:bg-secondary/5 transition-colors">
                                                    <TableCell className="py-3 pl-5">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-secondary/10">
                                                                <Icon className="w-3.5 h-3.5 text-secondary" />
                                                            </div>
                                                            <span className="text-[12px] font-medium whitespace-nowrap text-foreground">
                                                                {row.type}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-3">
                                                        <span className="text-[11px] whitespace-nowrap text-muted-foreground">{row.date}</span>
                                                    </TableCell>
                                                    <TableCell className="py-3">
                                                        <span className="text-[11px] whitespace-nowrap text-muted-foreground">{row.doctor}</span>
                                                    </TableCell>
                                                    <TableCell className="py-3 pr-5 text-right">
                                                        <Badge variant="outline" className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border-none ${verified
                                                            ? 'bg-secondary/10 text-secondary'
                                                            : 'bg-amber-900/30 text-amber-400'
                                                            }`}>
                                                            {verified && <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-secondary" />}
                                                            {row.status}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </ShadcnCard>
                    </div>

                    <div className="h-4" />
                </main>
            </div>
        </div>
    );
}
