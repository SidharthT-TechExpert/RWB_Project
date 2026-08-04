'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import {
  ChefHat,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Building2,
  CookingPot,
  Sparkles,
  KeyRound,
  CheckCircle2
} from 'lucide-react';

export default function ManagerLoginPage() {
  const router = useRouter();
  const { login, isLoggingIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      toast.error('Please enter branch manager credentials');
      return;
    }

    login(
      { email: cleanEmail, password: cleanPassword },
      {
        onSuccess: () => {
          toast.success('🎉 Welcome to Branch Operations Portal');
          router.push('/manager');
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.message || 'Invalid manager credentials or unauthorized role';
          setErrorMsg(msg);
          toast.error(msg);
        },
      }
    );
  };

  const handleDemoFill = () => {
    setEmail('downtown.manager@paragon.com');
    setPassword('Manager@123');
    toast.success('Demo Branch Manager credentials filled!');
  };

  return (
    <div className="min-h-screen w-full bg-[#030816] text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans select-none">
      {/* Background Radial Glows */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/3 w-[500px] h-[500px] bg-indigo-900/15 rounded-full blur-[160px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-5xl rounded-3xl border border-slate-800/80 bg-[#080F22]/90 backdrop-blur-2xl shadow-[0_30px_90px_rgba(0,0,0,0.8)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px] relative z-10">

        {/* ── LEFT HERO PANEL ── */}
        <div className="lg:col-span-6 bg-gradient-to-br from-[#0A142F] via-[#080E26] to-[#04091A] p-8 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/70">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30 border border-blue-400/30">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-white tracking-tight">QuickBite</span>
                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-blue-500/15 border border-blue-500/30 text-blue-400">
                    BRANCH PORTAL
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-10 space-y-4">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Branch Manager <br />
                <span className="text-blue-400">Operations Console</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed font-medium">
                Manage live kitchen preparation queues, outlet seating layout, walk-in check-ins, and staff rosters in real-time.
              </p>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="my-6 space-y-3 p-4 rounded-2xl bg-white/4 border border-white/6">
            <div className="flex items-center gap-2.5 text-xs text-slate-300 font-medium">
              <CookingPot className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Real-Time Kitchen Display System (KDS)</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300 font-medium">
              <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Floor Plan Table Occupancy &amp; Walk-ins</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300 font-medium">
              <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Branch Staff Roster &amp; Shift Management</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-mono border-t border-slate-800/60 pt-3">
            QuickBite Multi-Outlet Infrastructure &bull; Authorized Staff Only
          </div>
        </div>

        {/* ── RIGHT LOGIN FORM PANEL ── */}
        <div className="lg:col-span-6 bg-[#060C1B] p-8 lg:p-12 flex flex-col justify-center relative">
          <div className="max-w-md mx-auto w-full space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Manager Sign In</h2>
              <p className="text-xs text-slate-400 mt-1">Enter your issued branch manager credentials.</p>
            </div>

            {/* Error Message Callout */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Manager Email Address
                </label>
                <div className="relative flex items-center bg-[#030816] border border-slate-800 rounded-xl focus-within:border-blue-500 transition-all">
                  <Mail className="w-4 h-4 text-slate-500 ml-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="downtown.manager@paragon.com"
                    required
                    className="w-full bg-transparent px-3 py-3 text-sm text-white placeholder-slate-600 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative flex items-center bg-[#030816] border border-slate-800 rounded-xl focus-within:border-blue-500 transition-all">
                  <Lock className="w-4 h-4 text-slate-500 ml-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter temporary or portal password"
                    required
                    className="w-full bg-transparent px-3 py-3 text-sm text-white placeholder-slate-600 outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                {isLoggingIn ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Branch Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Fill Button */}
            <div className="pt-3 border-t border-slate-800/80 text-center">
              <button
                type="button"
                onClick={handleDemoFill}
                className="w-full py-2.5 px-4 rounded-xl bg-white/4 hover:bg-white/8 border border-white/10 text-xs font-bold text-slate-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <KeyRound className="w-4 h-4 text-brand-400" />
                <span>Fill Demo Branch Manager Credentials</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
