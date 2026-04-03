import React, { useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import {
    LayoutDashboard, Users, Clock, Settings, LogOut,
    Stethoscope, Activity, Search, Plus, Calendar,
    Menu, HelpCircle, Mail, Filter, CheckCircle2, ShieldCheck,
    Upload, AlertTriangle, FileSignature, FileUp, ShieldAlert,
    ChevronsLeft, ClipboardList, Hospital, Bell, Download
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

/* ─── Mock Data ─────────────────────────────────────────── */
const WAITING_ROOM = [
    { id: 1, name: 'Michael R.', time: '10:15 AM', status: 'Wallet Verified', avatar: 'MR' },
    { id: 2, name: 'Elena G.', time: '10:32 AM', status: 'Wallet Verified', avatar: 'EG' },
    { id: 3, name: 'David K.', time: '10:45 AM', status: 'Pending Scan', avatar: 'DK' },
];

const GRANTED_RECORDS = [
    { id: 1, type: 'Blood Panel', patient: 'Sarah J.', date: '02 Apr 2026', access: 'Web3 Verified Access', icon: Activity },
    { id: 2, type: 'MRI Scan', patient: 'James T.', date: '01 Apr 2026', access: 'Web3 Verified Access', icon: Hospital },
    { id: 3, type: 'Vaccination History', patient: 'Elena G.', date: '28 Mar 2026', access: 'Web3 Verified Access', icon: ShieldCheck },
];

const RECENT_MINTED_RECORDS = [
    { id: 1, type: 'Cardiology Report', patient: 'Michael R.', status: 'Valid', hash: '0x3aF...9d1e', icon: Activity },
    { id: 2, type: 'Prescription', patient: 'David K.', status: 'Valid', hash: '0x8bC...2f4a', icon: FileSignature },
    { id: 3, type: 'Allergy Test', patient: 'Sarah J.', status: 'Error', hash: '0x1eA...4c5b', icon: AlertTriangle },
];

const NAV = {
    main: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'waiting', label: 'Waiting Room', icon: Clock, badge: 2 },
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
            <div className="flex items-center justify-between px-5 py-[18px] border-b border-gray-100 dark:border-gray-800">
                <img src="/logo.png" alt="MediChain Doctor" className="h-8 w-auto object-contain" />
                <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1.5 rounded-lg text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <ChevronsLeft className="w-4 h-4" />
                </button>
            </div>

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
                                <NavItem item={item} active={activeNav === item.id} onClick={() => { setActiveNav(item.id); setMobileOpen(false); }} />
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
        </aside>
    );
}

function IconBadge({ icon: Icon, colorClass = "text-violet-600 dark:text-violet-400", bgClass = "bg-violet-50 dark:bg-violet-900/40" }) {
    return (
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${bgClass}`}>
            <Icon className={`w-3.5 h-3.5 ${colorClass}`} />
        </div>
    );
}

/* ─── Main Dashboard ────────────────────────────────────── */
export default function DoctorDashboard() {
    const account = useActiveAccount();
    const [activeNav, setActiveNav] = useState('overview');
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);

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
            {/* Sidebar */}
            <div className="hidden lg:flex">
                <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} setMobileOpen={setMobileOpen} />
            </div>

            {mobileOpen && (
                <>
                    <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
                    <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
                        <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} setMobileOpen={setMobileOpen} />
                    </div>
                </>
            )}

            {/* Main area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <AmbientParticles />
                
                {/* Header */}
                <header className="flex items-center justify-between px-4 lg:px-6 py-3.5 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shrink-0 relative z-20">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <Menu className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-[15px] font-semibold leading-tight text-gray-900 dark:text-gray-100">
                                Welcome, Dr. Smith{account ? ' 👋' : ''}
                            </h1>
                            <p className="text-[11px] hidden sm:block text-gray-500 dark:text-gray-400">
                                Clinic Dashboard & Patient Hub
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
                        <div className="hidden lg:flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-[7px] text-[11px] w-56 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 focus-within:bg-white dark:focus-within:bg-gray-900 focus-within:ring-2 focus-within:ring-violet-500/50 transition-colors cursor-text">
                            <Search className="w-3.5 h-3.5 shrink-0" />
                            <input type="text" placeholder="Search patients or records..." className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 min-w-0" />
                            <span className="text-[10px] border border-gray-200 dark:border-gray-700 rounded px-1.5 font-medium text-gray-400 dark:text-gray-500 shrink-0">⌘K</span>
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
                        
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' }}>
                            DS
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
                    {/* Row 1 */}
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Waiting Room QR Check-in */}
                        <motion.div variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }} className="w-full lg:w-[42%] shrink-0">
                            <MagicCard className="h-full bg-transparent overflow-hidden" gradientColor={isDark ? "#262626" : "#E5E7EB"}>
                                <GlassCard>
                                    <div className="p-5 relative z-10">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <IconBadge icon={Clock} />
                                                <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-300">Live Waiting Room</span>
                                            </div>
                                            <Badge variant="outline" className="flex items-center gap-1.5 py-0.5 border-violet-500/30 bg-violet-50 dark:bg-violet-900/20">
                                                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                                                <span className="text-[10px] font-semibold text-violet-600 dark:text-violet-400">QR Check-in Active</span>
                                            </Badge>
                                        </div>

                                        <div className="space-y-3">
                                            {WAITING_ROOM.map(p => {
                                                const isVerified = p.status === 'Wallet Verified';
                                                return (
                                                    <motion.div variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800/80 bg-white/50 dark:bg-gray-900/50">
                                                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-sm" style={{ background: isDark ? '#374151' : '#D1D5DB', ...isVerified && { background: 'linear-gradient(135deg, #10B981, #059669)' } }}>
                                                            {p.avatar}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[12px] font-semibold truncate text-gray-800 dark:text-gray-200">{p.name}</p>
                                                            <p className="text-[10px] truncate text-gray-400 dark:text-gray-500">Arrived at {p.time}</p>
                                                        </div>
                                                        <div className="shrink-0">
                                                            <Badge variant="outline" className={`text-[10px] border-none shadow-sm ${isVerified ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                                                                {isVerified && <ShieldCheck className="w-3 h-3 mr-1" />}
                                                                {p.status}
                                                            </Badge>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                        <Button variant="ghost" className="w-full mt-3 text-[11px] h-8 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">View All Patients</Button>
                                    </div>
                                </GlassCard>
                            </MagicCard>
                        </motion.div>

                        {/* Patient View (Granted Records) */}
                        <motion.div variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }} className="flex-1 flex flex-col min-w-0">
                            <MagicCard className="h-full bg-transparent overflow-hidden" gradientColor={isDark ? "#262626" : "#E5E7EB"}>
                                <GlassCard>
                                    <div className="p-5 flex flex-col h-full relative z-10">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <IconBadge icon={ShieldCheck} />
                                                <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-300">Granted Records (Web3 Access)</span>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                                            {GRANTED_RECORDS.map(r => {
                                                const Icon = r.icon;
                                                return (
                                                    <div key={r.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-900/50 cursor-pointer shadow-sm group glass-card-hover">
                                                        <div className="flex items-start justify-between mb-3 relative z-10">
                                                            <IconBadge icon={Icon} bgClass="bg-violet-100 dark:bg-violet-900/60" colorClass="text-violet-700 dark:text-violet-300" />
                                                            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-[9px] border-none">
                                                                Granted
                                                            </Badge>
                                                        </div>
                                                        <h3 className="text-[13px] font-bold text-gray-900 dark:text-gray-100 mb-1 relative z-10">{r.type}</h3>
                                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2 relative z-10">Patient: {r.patient}</p>
                                                        <p className="text-[10px] text-violet-600 dark:text-violet-400 font-medium relative z-10">Valid until {r.date}</p>
                                                    </div>
                                                )
                                            })}
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
                            <MagicCard className="h-full bg-transparent overflow-hidden" gradientColor={isDark ? "#262626" : "#E5E7EB"}>
                                <GlassCard>
                                    <div className="p-5 flex flex-col h-full relative z-10">
                                        <div className="flex items-center justify-between mb-4 relative z-10">
                                            <div className="flex items-center gap-2">
                                                <IconBadge icon={FileUp} />
                                                <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-300">Upload & Mint Record</span>
                                            </div>
                                            <FloatingCube className="w-[100px] h-[100px] absolute -top-8 -right-6 opacity-80 z-0 hidden sm:block pointer-events-none mix-blend-plus-lighter" />
                                        </div>
                                        
                                        <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-8 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-900/20 text-center transition-all duration-300 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 hover:border-violet-300 dark:hover:border-violet-700 cursor-pointer relative z-10 flex-1 hover:scale-[1.01] hover:shadow-lg">
                                            <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center mb-3 group">
                                                <Upload className="w-5 h-5 text-violet-600 dark:text-violet-400 group-hover:-translate-y-1 transition-transform" />
                                            </div>
                                            <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white mb-1">Drag and drop file to mint</h3>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-4 max-w-[200px]">Securely mint a new medical record to a patient's Web3 wallet.</p>
                                            
                                            <ShimmerButton className="py-2 px-6 rounded-xl text-[12px] font-semibold shadow-md border-none flex" background="#8B5CF6" shimmerColor="#C4B5FD">
                                                <span className="flex items-center gap-1.5 text-white">
                                                    Select File
                                                </span>
                                            </ShimmerButton>
                                        </div>
                                    </div>
                                </GlassCard>
                            </MagicCard>
                        </div>

                        {/* Recent minted records & Amend flow */}
                        <div className="w-full lg:w-[50%]">
                            <MagicCard className="h-full bg-transparent overflow-hidden" gradientColor={isDark ? "#3f1d1d" : "#fee2e2"}>
                                <GlassCard interactive={false}>
                                    <div className="p-5 relative z-10">
                                        <div className="flex items-center justify-between mb-4">
                                             <div className="flex items-center gap-2">
                                                <IconBadge icon={FileSignature} />
                                                <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-300">Recent Minted Records</span>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            {RECENT_MINTED_RECORDS.map(r => {
                                                const isError = r.status === 'Error';
                                                const Icon = r.icon;
                                                return (
                                                    <div key={r.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800/80 bg-white/50 dark:bg-gray-900/80 shadow-sm transition-all duration-300 hover:-translate-x-1">
                                                         <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isError ? 'bg-red-50 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                                                <Icon className={`w-4 h-4 ${isError ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`} />
                                                            </div>
                                                            <div>
                                                                <p className="text-[12px] font-semibold text-gray-900 dark:text-gray-100">{r.type}</p>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[10px] text-gray-500 dark:text-gray-400">To: {r.patient}</span>
                                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-mono">{r.hash}</span>
                                                                </div>
                                                            </div>
                                                         </div>
                                                         <div>
                                                             {isError ? (
                                                                <Button size="sm" className="h-7 text-[10px] bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/40 dark:text-red-400 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-800 rounded-lg">
                                                                    Amend Record
                                                                </Button>
                                                             ) : (
                                                                <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/50 shadow-sm">
                                                                    Immutable
                                                                </Badge>
                                                             )}
                                                         </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        <div className="mt-4 flex items-start gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3 rounded-xl shadow-sm">
                                            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-[11px] font-semibold text-amber-800 dark:text-amber-300">Audit Trail Notice</p>
                                                <p className="text-[10px] text-amber-700/80 dark:text-amber-400/80 mt-0.5 leading-snug">Using the <b>Amend Record</b> function triggers an immutable audit log on the blockchain, preserving both original and corrected versions.</p>
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
