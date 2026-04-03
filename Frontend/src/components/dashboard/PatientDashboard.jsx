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
function BarChart({ isDark }) {
    const data = {
        labels: CHART_DATA.map(d => d.month),
        datasets: [
            {
                label: 'Records',
                data: CHART_DATA.map(d => d.v),
                backgroundColor: (context) => {
                    return '#8B5CF6'; // violet-500
                },
                hoverBackgroundColor: '#7C3AED', // violet-600
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
        animation: {
            duration: 1000,
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                titleColor: isDark ? '#9CA3AF' : '#6B7280',
                bodyColor: isDark ? '#F9FAFB' : '#111827',
                titleFont: { size: 10, family: 'Inter', weight: 'normal' },
                bodyFont: { size: 14, family: 'Inter', weight: 'bold' },
                padding: 10,
                cornerRadius: 8,
                displayColors: false,
                borderColor: isDark ? '#374151' : '#F3F4F6',
                borderWidth: 1,
                callbacks: {
                    title: () => 'Records',
                    label: (context) => context.parsed.y
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false,
                    drawBorder: false,
                },
                ticks: {
                    color: isDark ? '#6B7280' : '#9CA3AF',
                    font: { size: 10, family: 'Inter' }
                }
            },
            y: {
                beginAtZero: true,
                max: 10,
                grid: {
                    color: isDark ? '#374151' : '#F3F4F6',
                    drawBorder: false,
                },
                ticks: {
                    stepSize: 2,
                    color: isDark ? '#6B7280' : '#9CA3AF',
                    font: { size: 10, family: 'Inter' },
                    padding: 10
                },
                border: {
                    display: false
                }
            }
        },
        interaction: {
            mode: 'index',
            intersect: false,
        },
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
                    ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
        >
            <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-violet-600 dark:text-violet-400' : 'text-gray-400 dark:text-gray-500'}`} />
            <span className="flex-1">{item.label}</span>
            {item.badge != null && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
                    ${active
                        ? 'bg-violet-100 dark:bg-violet-800/60 text-violet-700 dark:text-violet-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
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
        <aside className="flex flex-col w-[240px] shrink-0 h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800">
            {/* Logo */}
            <div className="flex items-center justify-between px-5 py-[18px] border-b border-gray-100 dark:border-gray-800">
                <img src="/logo.png" alt="MediChain" className="h-8 w-auto object-contain" />
                <button className="p-1.5 rounded-lg text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <ChevronsLeft className="w-4 h-4" />
                </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-2 text-gray-400 dark:text-gray-600">
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
                    <p className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-2 text-gray-400 dark:text-gray-600">
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
                    <p className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-2 text-gray-400 dark:text-gray-600">
                        General
                    </p>
                    <ul className="space-y-0.5">
                        {NAV.general.map(item => {
                            const Icon = item.icon;
                            return (
                                <li key={item.id}>
                                    <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150
                                        ${item.id === 'logout'
                                            ? 'text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 dark:hover:text-red-400'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                                        }`}>
                                        <Icon className="w-4 h-4 shrink-0 text-gray-400 dark:text-gray-500" />
                                        {item.label}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </nav>

            {/* Blockchain secured card */}
            <div className="m-3 p-4 rounded-2xl text-white" style={{ background: 'linear-gradient(135deg, #2E1065 0%, #4C1D95 55%, #5B21B6 100%)' }}>
                <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-4 h-4 text-violet-300" />
                    <span className="text-[11px] font-semibold text-violet-200 uppercase tracking-wider">
                        Blockchain Secured
                    </span>
                </div>
                <p className="text-[11px] text-violet-100 leading-relaxed mb-3">
                    Your records are owned by you and verified on Polygon.
                </p>
                <button className="w-full py-1.5 rounded-xl text-[11px] font-semibold text-violet-200 transition-colors border border-violet-400/30 hover:bg-violet-400/20"
                    style={{ background: 'rgba(167,139,250,0.12)' }}>
                    View on Chain
                </button>
            </div>
        </aside>
    );
}

/* ─── Icon badge ─────────────────────────────────────────── */
function IconBadge({ icon: Icon }) {
    return (
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-violet-50 dark:bg-violet-900/40">
            <Icon className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
        </div>
    );
}

/* ─── Main Dashboard ────────────────────────────────────── */
export default function PatientDashboard() {
    const account = useActiveAccount();
    const [activeNav, setActiveNav] = useState('records');
    const [mobileOpen, setMobileOpen] = useState(false);
    const [grants, setGrants] = useState(ACCESS_GRANTS);
    const [isDark, setIsDark] = useState(false);

    // Keep isDark in sync with theme changes (for the SVG chart & Magic Cards)
    React.useEffect(() => {
        setIsDark(document.documentElement.classList.contains('dark'));
        const obs = new MutationObserver(() => {
            setIsDark(document.documentElement.classList.contains('dark'));
        });
        obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => obs.disconnect();
    }, []);

    return (
        <div className="flex h-screen overflow-hidden font-body bg-gray-50 dark:bg-gray-950">

            {/* Sidebar — desktop */}
            <div className="hidden lg:flex">
                <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} setMobileOpen={setMobileOpen} />
            </div>

            {/* Sidebar — mobile overlay */}
            {mobileOpen && (
                <>
                    <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
                    <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
                        <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} setMobileOpen={setMobileOpen} />
                    </div>
                </>
            )}

            {/* Main area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Top header */}
                <header className="flex items-center justify-between px-4 lg:px-6 py-3.5 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setMobileOpen(true)}
                            className="lg:hidden p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <Menu className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-[15px] font-semibold leading-tight text-gray-900 dark:text-gray-100">
                                Welcome back, Sarah{account ? ' 👋' : ''}
                            </h1>
                            <p className="text-[11px] hidden sm:block text-gray-500 dark:text-gray-400">
                                Monitor and manage your health records today.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Date + Export */}
                        <div className="hidden md:flex items-center gap-2">
                            <div className="flex items-center gap-1.5 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-[7px] text-[11px] text-gray-500 dark:text-gray-400">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>Thu, 03 Apr 2026</span>
                            </div>
                            <button className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-[7px] rounded-xl bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 transition-opacity hover:opacity-85">
                                <Download className="w-3.5 h-3.5" />
                                Export
                            </button>
                        </div>

                        {/* Search */}
                        <div className="hidden lg:flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-[7px] text-[11px] w-48 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500">
                            <Search className="w-3.5 h-3.5 shrink-0" />
                            <span className="flex-1">Search</span>
                            <span className="text-[10px] border border-gray-200 dark:border-gray-700 rounded px-1.5 font-medium text-gray-400 dark:text-gray-500">⌘K</span>
                        </div>

                        {[HelpCircle, Mail].map((Icon, i) => (
                            <button key={i} className="hidden sm:flex w-8 h-8 items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <Icon className="w-4 h-4" />
                            </button>
                        ))}

                        {/* Bell */}
                        <div className="relative">
                            <button className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <Bell className="w-4 h-4" />
                            </button>
                            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-violet-500" />
                        </div>

                        <AnimatedThemeToggler />

                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                            style={{ background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' }}>
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
                            <MagicCard className="h-full" gradientColor={isDark ? "#262626" : "#E5E7EB"}>
                                <CardContent className="p-5">
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <IconBadge icon={FileText} />
                                            <span className="text-[13px] font-medium text-gray-700 dark:text-gray-300">Total Records</span>
                                        </div>
                                        <Badge variant="outline" className="flex items-center gap-1.5 py-0.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                                            <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">NFT</span>
                                        </Badge>
                                    </div>

                                    {/* Big number */}
                                    <div className="mb-1 text-gray-900 dark:text-gray-50 flex items-center h-12">
                                        <NumberTicker value={24} className="text-[2.6rem] font-bold tracking-tight leading-none" />
                                    </div>
                                    <div className="flex items-center gap-1.5 mb-5">
                                        <span className="text-[11px] font-semibold text-violet-500 dark:text-violet-400">↑ +3.2%</span>
                                        <span className="text-[11px] text-gray-400 dark:text-gray-500">from last month</span>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex gap-2 mb-5">
                                        <ShimmerButton className="flex-1 py-[10px] rounded-xl active:scale-[0.98] shadow-md border-none flex"
                                            background="#8B5CF6" shimmerColor="#C4B5FD">
                                            <span className="flex items-center justify-center gap-1.5 text-[12px] font-semibold text-white">
                                                <Upload className="w-3.5 h-3.5" />
                                                Upload Record
                                            </span>
                                        </ShimmerButton>
                                        <Button variant="outline" className="flex-1 flex items-center justify-center gap-1.5 h-auto py-[10px] rounded-xl text-[12px] font-semibold text-violet-600 dark:text-violet-400 border-violet-500/60 hover:bg-violet-50 dark:hover:bg-violet-900/30">
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                            Grant Access
                                        </Button>
                                    </div>

                                    {/* Recent Records */}
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[12px] font-semibold text-gray-700 dark:text-gray-300">Recent Records</span>
                                        <button className="flex items-center gap-0.5 text-[11px] font-medium text-violet-600 dark:text-violet-400">
                                            <Plus className="w-3 h-3" />Add New
                                        </button>
                                    </div>

                                    <div className="space-y-1">
                                        {RECENT_RECORDS.map(r => {
                                            const Icon = r.icon;
                                            const active = r.status === 'Active';
                                            return (
                                                <div key={r.id}
                                                    className="flex items-center gap-3 px-2.5 py-2 rounded-xl transition-colors cursor-default hover:bg-violet-50 dark:hover:bg-violet-900/20">
                                                    <IconBadge icon={Icon} />
                                                    <span className="flex-1 text-[12px] font-medium truncate text-gray-800 dark:text-gray-200">
                                                        {r.type}
                                                    </span>
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-violet-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                                                        <span className={`text-[11px] font-medium ${active ? 'text-violet-600 dark:text-violet-400' : 'text-gray-400 dark:text-gray-500'}`}>
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
                                <MagicCard gradientColor={isDark ? "#262626" : "#E5E7EB"}>
                                    <CardContent className="p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <IconBadge icon={CheckCircle2} />
                                                <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">Verified Records</span>
                                            </div>
                                            <button className="text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="mb-1 text-gray-900 dark:text-gray-50 flex items-center h-9">
                                            <NumberTicker value={21} className="text-[2rem] font-bold tracking-tight leading-none" />
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[11px] font-semibold text-red-500 dark:text-red-400">↓ -2.1%</span>
                                            <span className="text-[11px] text-gray-400 dark:text-gray-500">from last month</span>
                                        </div>
                                    </CardContent>
                                </MagicCard>

                                {/* Active Access */}
                                <MagicCard gradientColor={isDark ? "#262626" : "#E5E7EB"}>
                                    <CardContent className="p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <IconBadge icon={Stethoscope} />
                                                <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">Active Access</span>
                                            </div>
                                            <button className="text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="mb-1 text-gray-900 dark:text-gray-50 flex items-center h-9">
                                            <NumberTicker value={3} className="text-[2rem] font-bold tracking-tight leading-none" />
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[11px] font-semibold text-violet-500 dark:text-violet-400">↑ +4.5%</span>
                                            <span className="text-[11px] text-gray-400 dark:text-gray-500">from last month</span>
                                        </div>
                                    </CardContent>
                                </MagicCard>
                            </div>

                            {/* Overview Chart */}
                            <ShadcnCard className="flex-1 border-gray-100 dark:border-gray-800 shadow-sm dark:shadow-none min-h-[220px] flex flex-col">
                                <CardContent className="p-5 flex-1 flex flex-col">
                                    <div className="flex items-center justify-between mb-4 shrink-0">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-200">Overview</span>
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-violet-500" />
                                                <span className="text-[11px] text-gray-500 dark:text-gray-400">Records</span>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" className="h-7 text-[11px] text-gray-500 dark:text-gray-400 rounded-xl px-3 gap-1.5 flex bg-transparent">
                                            This Year
                                            <svg width="8" height="5" viewBox="0 0 8 5" fill="none">
                                                <path d="M1 1l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </Button>
                                    </div>
                                    <div className="flex-1 min-h-0 relative">
                                        <div className="absolute inset-0">
                                            <BarChart isDark={isDark} />
                                        </div>
                                    </div>
                                </CardContent>
                            </ShadcnCard>
                        </div>
                    </div>

                    {/* ════ ROW 2 ════ */}
                    <div className="flex flex-col lg:flex-row gap-4">

                        {/* Access Control */}
                        <ShadcnCard className="w-full lg:w-[42%] shrink-0 border-gray-100 dark:border-gray-800 shadow-sm dark:shadow-none">
                            <CardHeader className="p-5 pb-0 items-center flex-row justify-between space-y-0">
                                <CardTitle className="text-[13px] font-semibold text-gray-700 dark:text-gray-200">Access Control</CardTitle>
                                <button className="text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </CardHeader>
                            <CardContent className="p-5 pt-5 space-y-5">
                                {grants.map(doc => (
                                    <div key={doc.id} className="space-y-2.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                                                style={{ background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' }}>
                                                {doc.avatar}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[12px] font-semibold truncate text-gray-800 dark:text-gray-200">{doc.name}</p>
                                                <p className="text-[10px] truncate text-gray-400 dark:text-gray-500">{doc.specialty}</p>
                                            </div>
                                            <div className="shrink-0 flex flex-col items-end">
                                                <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">{doc.label}</span>
                                                <span className="text-[10px] text-gray-400 dark:text-gray-500">{doc.progress}% elapsed</span>
                                            </div>
                                        </div>
                                        {/* Progress bar */}
                                        <div className="h-1.5 w-full rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                                            <div className="h-full rounded-full bg-violet-500 transition-all duration-500"
                                                style={{ width: `${doc.progress}%` }} />
                                        </div>
                                    </div>
                                ))}

                                <div className="flex items-center gap-3 pt-1">
                                    <div className="w-9 h-9 rounded-full flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 shrink-0">
                                        <Plus className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
                                    </div>
                                    <span className="text-[12px] text-gray-400 dark:text-gray-500">Grant new access</span>
                                </div>
                            </CardContent>
                        </ShadcnCard>

                        {/* Audit Log */}
                        <ShadcnCard className="flex-1 border-gray-100 dark:border-gray-800 shadow-sm dark:shadow-none min-w-0 overflow-hidden">
                            <CardHeader className="p-5 pb-0 items-center flex-row justify-between space-y-0">
                                <CardTitle className="text-[13px] font-semibold text-gray-700 dark:text-gray-200">Audit Log</CardTitle>
                                <Button variant="outline" size="sm" className="h-7 text-[11px] text-gray-500 dark:text-gray-400 rounded-xl px-3 gap-1.5 flex bg-transparent">
                                    <Filter className="w-3 h-3" />
                                    Filter
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0 pt-4 overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-gray-100 dark:border-gray-800 hover:bg-transparent">
                                            {['Activity', 'Date', 'Doctor', 'Status'].map((h, i) => (
                                                <TableHead key={h} className={`h-10 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-600 ${i === 3 ? 'text-right pr-5' : 'pl-5'}`}>
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
                                                <TableRow key={row.id} className="group border-b-0 hover:bg-violet-50 dark:hover:bg-violet-900/10 transition-colors">
                                                    <TableCell className="py-3 pl-5">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-violet-50 dark:bg-violet-900/40">
                                                                <Icon className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                                                            </div>
                                                            <span className="text-[12px] font-medium whitespace-nowrap text-gray-800 dark:text-gray-200">
                                                                {row.type}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-3">
                                                        <span className="text-[11px] whitespace-nowrap text-gray-500 dark:text-gray-400">{row.date}</span>
                                                    </TableCell>
                                                    <TableCell className="py-3">
                                                        <span className="text-[11px] whitespace-nowrap text-gray-500 dark:text-gray-400">{row.doctor}</span>
                                                    </TableCell>
                                                    <TableCell className="py-3 pr-5 text-right">
                                                        <Badge variant="outline" className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border-none ${verified
                                                            ? 'bg-violet-50 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300'
                                                            : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                                            }`}>
                                                            {verified && <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-violet-500 dark:bg-violet-400" />}
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