import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, Stethoscope, ShieldCheck, Loader2, X, Info } from 'lucide-react';
import { useDisconnect, useActiveWallet } from "thirdweb/react";
import { motion, AnimatePresence } from 'framer-motion';

const ROLES = [
  { value: 'PATIENT', label: 'PATIENT', icon: HeartPulse, desc: 'Own & manage your health records' },
  { value: 'DOCTOR', label: 'DOCTOR', icon: Stethoscope, desc: 'Mint records & access patient data' },
  { value: 'INSURER', label: 'INSURER', icon: ShieldCheck, desc: 'Verify claims on-chain' },
];

export default function RegisterModal() {
  const auth = useAuth();
  if (!auth) {
    console.error('[RegisterModal] Auth context not found! Check Provider wrapping.');
    return null;
  }
  const { showRegister, register, logout } = auth;

  const { disconnect } = useDisconnect();
  const wallet = useActiveWallet();

  const [name, setName] = useState('');
  const [role, setRole] = useState('PATIENT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
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

  const handleCancel = () => {
    console.log("Registration cancelled. Disconnecting wallet...");
    if (wallet) disconnect(wallet);
    logout();
  };

  return (
    <AnimatePresence mode="wait">
      {showRegister && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto overflow-x-hidden">
          {/* BG Overlay Animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            onClick={!loading ? handleCancel : undefined}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm dark:bg-[#0a0a0a] dark:backdrop-blur-none"
          >
            {/* Glow Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[300px] bg-white/30 blur-[80px] rotate-[-15deg] hidden dark:block" style={{ borderRadius: '50%' }} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_80%)] hidden dark:block" />
          </motion.div>

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], opacity: { duration: 0.4 } }}
            className="relative w-full max-w-[540px] backdrop-blur-2xl rounded-[32px] p-5 sm:p-6 shadow-2xl z-50 my-auto bg-white border-[6px] sm:border-[12px] border-[#F2F2F2] dark:bg-[#131313]/80 dark:border-[#232323]"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-gray-900 dark:text-white">Create your profile</h2>
                <p className="text-[13px] sm:text-[14px] mt-3 sm:mt-4 leading-relaxed max-w-full text-gray-500 dark:text-[#696969]">
                  Enter your full name and choose your account role within the MediChain ecosystem.
                </p>
              </div>
              <button title="close" disabled={loading} onClick={handleCancel} className="transition-colors p-1 text-gray-400 hover:text-gray-600 dark:text-[#888888] dark:hover:text-white disabled:opacity-50">
                <X size={20} />
              </button>
            </div>

            {/* Input Section */}
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[14px] ml-1 font-medium text-gray-500 dark:text-[#8A8A8A]">Full name</label>
                <div className="relative group">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Ananya Sharma"
                    disabled={loading}
                    className="w-full rounded-[18px] mt-2.5 px-5 py-3.5 outline-none transition-all bg-gray-50 border border-gray-200 text-gray-900 focus:border-gray-300 dark:bg-[#1c1c1c]/50 dark:border-white/10 dark:text-white dark:focus:border-[#EDEDED]/60"
                  />
                </div>
              </div>

              {/* Role Selection Tabs */}
              <div className="space-y-2">
                <label className="text-[14px] ml-1 font-medium text-gray-500 dark:text-[#8A8A8A]">Ecosystem Role</label>
                <div className="grid grid-cols-3 mt-2.5 rounded-full p-1 relative bg-gray-100 border border-gray-200 dark:bg-[#0A0A0A] dark:border-white/5">
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      disabled={loading}
                      onClick={() => setRole(r.value)}
                      className={`relative z-10 py-3.5 text-[11px] sm:text-[12px] font-semibold tracking-widest transition-colors duration-300 ${
                        role === r.value ? 'text-gray-900 dark:text-[#EDEDED]' : 'text-gray-400 dark:text-[#EDEDED]/80'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {role === r.value && <r.icon size={14} />}
                        {r.label}
                      </div>
                      {role === r.value && (
                        <motion.div
                          layoutId="activeRoleTab"
                          className="absolute inset-0 rounded-full -z-10 bg-white border border-gray-200 shadow-sm dark:bg-[#272727] dark:border-white/10"
                          transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                        />
                      )}
                    </button>
                  ))}
                </div>
                
                {/* Description helper text */}
                <p className="text-center text-[12px] pt-4 text-gray-400 dark:text-[#666666] min-h-[36px]">
                  {ROLES.find(r => r.value === role)?.desc}
                </p>
              </div>

              {error && (
                <div className="rounded-[18px] px-4 py-3 bg-red-50 border border-red-200 dark:bg-[#450a0a]/30 dark:border-red-900/40">
                  <span className="text-[13px] text-red-600 dark:text-red-400 font-medium">{error}</span>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 mt-4 sm:mt-6">
              <button
                onClick={handleCancel}
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 rounded-full text-[14px] font-medium transition-colors border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-white/40 dark:text-white dark:hover:bg-white/5 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!name.trim() || !role || loading}
                className="w-full sm:w-auto px-8 py-3 rounded-full text-[14px] font-bold transition-all active:scale-95 bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:active:scale-100 dark:bg-white dark:text-black dark:hover:bg-[#eeeeee] flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Registering</> : 'Get Started'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
