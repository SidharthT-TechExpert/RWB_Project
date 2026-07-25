'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import {
  UtensilsCrossed,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Building2,
  ShieldCheck,
  TrendingUp,
  Activity,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Store,
} from 'lucide-react';

export default function RestaurantLoginPage() {
  const router = useRouter();
  const { login, isLoggingIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      toast.error('Please enter restaurant owner login credentials');
      return;
    }

    login(
      { email: cleanEmail, password: cleanPassword },
      {
        onSuccess: () => {
          toast.success('🎉 Welcome to QuickBite Restaurant Partner Portal');
          router.push('/dashboard');
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.message || 'Invalid restaurant owner credentials';
          setErrorMsg(msg);
          toast.error(msg);
        },
      }
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#050B18] text-slate-100 flex items-center justify-center p-3 xs:p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans select-none">
      {/* Background Decorative Radial Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0f_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0f_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />

      {/* Header Label */}
      <div className="absolute top-4 left-6 text-xs font-mono text-slate-500 uppercase tracking-widest pointer-events-none hidden sm:block">
        QuickBite — Restaurant Partner Portal
      </div>

      {/* Main Container Card */}
      <div className="w-full max-w-6xl rounded-2xl sm:rounded-3xl border border-slate-800/80 bg-[#091124]/90 backdrop-blur-2xl shadow-[0_30px_90px_rgba(0,0,0,0.7)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[660px] relative z-10">
        
        {/* ── LEFT PANEL (Branding & Feature Highlights) ── */}
        <div className="lg:col-span-6 xl:col-span-7 bg-gradient-to-br from-[#0D182E] via-[#09122B] to-[#050C1F] p-6 xs:p-8 sm:p-10 lg:p-12 flex flex-col justify-between relative border-b lg:border-b-0 lg:border-r border-slate-800/70">
          
          {/* Top Brand Bar */}
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center shadow-[0_0_25px_rgba(255,107,53,0.45)] border border-brand-400/30 shrink-0">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl xs:text-2xl font-black tracking-tight text-white">QuickBite</span>
                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-brand-500/15 border border-brand-500/30 text-brand-400">
                    PARTNER HQ
                  </span>
                </div>
              </div>
            </div>

            {/* Headline & Description */}
            <div className="mt-8 sm:mt-10 lg:mt-12 space-y-3 sm:space-y-4">
              <h1 className="text-3xl xs:text-4xl sm:text-5xl font-extrabold text-white leading-[1.1] tracking-tight">
                Manage Your Restaurant <br />
                <span className="text-brand-500">& Grow Your Business.</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed font-medium">
                Log in to manage live orders, table bookings, menu items, prices, staff, customer reviews, and sales performance in real time.
              </p>
            </div>
          </div>

          {/* Central Mockup Preview Frame */}
          <div className="my-6 lg:my-8 relative rounded-2xl border border-slate-700/50 bg-[#0B1530]/90 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden group">
            {/* Glowing border accent */}
            <div className="absolute inset-0 bg-gradient-to-r from-brand-500/15 via-orange-500/10 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />

            {/* Inner Dashboard Simulation */}
            <div className="relative rounded-xl border border-slate-800 bg-[#060D20] p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-brand-500" />
                  <span className="text-xs font-bold text-slate-300">Live Restaurant Dashboard</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  <Activity className="w-3 h-3 animate-pulse" /> Live & Open
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#09122B] p-3 rounded-xl border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 font-medium">Today's Orders</div>
                  <div className="text-base sm:text-lg font-black text-white mt-1">42 Orders</div>
                  <div className="text-[9px] text-emerald-400 mt-0.5 flex items-center gap-0.5">
                    <TrendingUp className="w-2.5 h-2.5" /> +18.4% today
                  </div>
                </div>
                <div className="bg-[#09122B] p-3 rounded-xl border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 font-medium">Table Bookings</div>
                  <div className="text-base sm:text-lg font-black text-white mt-1">14 Reserved</div>
                  <div className="text-[9px] text-brand-400 mt-0.5 flex items-center gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" /> 100% capacity
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Left Footer Badges */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-300">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-brand-500" />
                <span>Menu & Orders</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-500" />
                <span>Table Management</span>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-brand-500" />
                <span>Sales Reports</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500/80 pt-2 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono">
              <span>QuickBite Restaurant Management System</span>
              <span>© {new Date().getFullYear()} QuickBite Inc.</span>
            </div>
          </div>

        </div>

        {/* ── RIGHT PANEL (Login Form) ── */}
        <div className="lg:col-span-6 xl:col-span-5 bg-[#080F22]/95 p-6 xs:p-8 sm:p-10 lg:p-12 flex flex-col justify-between relative">
          
          <div className="my-auto py-4">
            <div className="bg-[#0C1630]/70 border border-slate-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">

              {/* Card Header */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Restaurant Sign In
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
                  Enter your onboarded email/phone & password to access your dashboard.
                </p>
              </div>

              {/* Error Toast Callout */}
              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs font-medium flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Email / Phone Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Restaurant Email / Phone
                  </label>
                  <div className="relative flex items-center bg-[#060D1E] border border-slate-700/80 rounded-xl focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all overflow-hidden">
                    <div className="pl-3.5 pr-2 text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="owner@restaurant.com or +12125550199"
                      required
                      className="w-full bg-transparent py-3 pr-4 text-sm text-white placeholder-slate-500 outline-none font-medium"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Password
                    </label>
                    <Link href="/auth/forgot-password" className="text-xs text-brand-400 hover:underline">
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative flex items-center bg-[#060D1E] border border-slate-700/80 rounded-xl focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all overflow-hidden">
                    <div className="pl-3.5 pr-2 text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter temporary or account password"
                      required
                      className="w-full bg-transparent py-3 pr-10 text-sm text-white placeholder-slate-500 outline-none font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-slate-400 hover:text-slate-200 transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-[#060D1E] border-slate-700 text-brand-500 focus:ring-brand-500/30 accent-brand-500 cursor-pointer"
                  />
                  <label htmlFor="rememberMe" className="text-xs font-semibold text-slate-400 cursor-pointer select-none">
                    Remember this device
                  </label>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3.5 px-6 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,107,53,0.35)] transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoggingIn ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Open Restaurant Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Demo Hint Box */}
              <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-3.5 text-xs text-slate-300 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                <span>
                  <strong>New Onboarded Restaurant?</strong> Use your onboarded owner email and initial password (e.g. <code>Welcome@123</code>) to sign in.
                </span>
              </div>

            </div>
          </div>

          {/* Right Footer Links */}
          <div className="pt-4 flex items-center justify-between text-xs text-slate-500 font-medium">
            <Link href="/" className="hover:text-slate-300 transition-colors">
              ← Back to QuickBite
            </Link>
            <div className="flex gap-4">
              <Link href="/admin/login" className="hover:text-slate-300 transition-colors">
                Admin Portal
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
