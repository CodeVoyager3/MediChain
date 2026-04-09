import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserPlus, Stethoscope, HeartPulse, Loader2 } from 'lucide-react';
// 1. NEW: Import the Thirdweb hooks
import { useDisconnect, useActiveWallet } from "thirdweb/react";

const ROLES = [
    { value: 'PATIENT', label: 'Patient', icon: HeartPulse, desc: 'Own & manage your health records' },
    { value: 'DOCTOR', label: 'Doctor', icon: Stethoscope, desc: 'Mint records & access patient data' },
    { value: 'INSURER', label: 'Insurer', icon: ShieldCheck, desc: 'Verify claims on-chain' },
];

export default function RegisterModal() {
    const auth = useAuth();
    if (!auth) {
        console.error('[RegisterModal] Auth context not found! Check Provider wrapping.');
        return null;
    }
    const { showRegister, register, logout } = auth;

    // 2. NEW: Initialize the hooks
    const { disconnect } = useDisconnect();
    const wallet = useActiveWallet();

    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!showRegister) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || !role) return;

        setLoading(true);
        setError('');
        try {
            await register(name.trim(), role);
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // 3. NEW: The bulletproof cancel function
    const handleCancel = () => {
        console.log("Registration cancelled. Disconnecting wallet...");
        // Explicitly disconnect MetaMask
        if (wallet) {
            disconnect(wallet);
        }
        // Clear the local storage and close the modal
        logout();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-md mx-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b border-border">
                    <div className="flex items-center gap-2 mb-1">
                        <UserPlus className="w-5 h-5 text-secondary" />
                        <h2 className="text-lg font-semibold text-foreground font-display">Complete Your Profile</h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Welcome to MediChain! Tell us who you are to get started.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
                    {/* Name Input */}
                    <div>
                        <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 block">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Dr. Ananya Sharma"
                            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/40 transition-all"
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Role Selection */}
                    <div>
                        <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">
                            I am a…
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {ROLES.map((r) => {
                                const Icon = r.icon;
                                const selected = role === r.value;
                                return (
                                    <button
                                        key={r.value}
                                        type="button"
                                        disabled={loading}
                                        onClick={() => setRole(r.value)}
                                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                                            selected
                                                ? 'border-secondary bg-secondary/10 ring-2 ring-secondary/30'
                                                : 'border-border bg-background hover:bg-muted'
                                        }`}
                                    >
                                        <Icon className={`w-5 h-5 ${selected ? 'text-secondary' : 'text-muted-foreground'}`} />
                                        <span className={`text-[11px] font-semibold ${selected ? 'text-secondary' : 'text-foreground'}`}>
                      {r.label}
                    </span>
                                        <span className="text-[9px] text-muted-foreground text-center leading-tight">{r.desc}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-400 bg-red-950/30 px-3 py-2 rounded-lg">{error}</p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={handleCancel} // <--- 4. NEW: Attach the function here
                            disabled={loading}
                            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-muted-foreground border border-border hover:bg-muted transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim() || !role || loading}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-secondary text-background hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Registering…
                                </>
                            ) : (
                                'Get Started'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
