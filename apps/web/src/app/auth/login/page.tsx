'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/lib/utils';
import {
  Eye, EyeOff, ArrowRight, Mail, Lock, UtensilsCrossed,
  TrendingUp, Users, Star, CheckCircle2, Shield, Sparkles,
  ChevronRight, Clock,
} from 'lucide-react';

/* ── tiny animated counter ─────────────────────────────────── */
function CountUp({ to, prefix = '', suffix = '', duration = 1600 }: {
  to: number; prefix?: string; suffix?: string; duration?: number;
}) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = duration / 60;
    const inc = to / 60;
    const timer = setInterval(() => {
      start += inc;
      if (start >= to) { setVal(to); clearInterval(timer); } else { setVal(Math.floor(start)); }
    }, step);
    return () => clearInterval(timer);
  }, [to, duration]);
  return <>{prefix}{val.toLocaleString('en-IN')}{suffix}</>;
}

/* ── floating orbs background ───────────────────────────────── */
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 rounded-full bg-amber-500/6 blur-[120px] animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute bottom-[10%] right-[-10%] w-80 h-80 rounded-full bg-amber-400/5 blur-[100px] animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }} />
      <div className="absolute top-[40%] left-[30%] w-64 h-64 rounded-full bg-orange-500/4 blur-[90px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />
      {/* Subtle grid lines */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(251,191,36,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}

/* ── hero stat card ─────────────────────────────────────────── */
function StatCard({ icon: Icon, color, label, value, sub }: {
  icon: React.ElementType; color: string; label: string; value: React.ReactNode; sub: string;
}) {
  return (
    <div className={`flex items-center gap-3 p-3.5 rounded-2xl border bg-white/3 backdrop-blur-sm ${color} transition-all hover:bg-white/5`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-white/8`}>
        <Icon className="w-4 h-4 text-amber-400" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-black text-white">{value}</p>
        <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

/* ── main page ───────────────────────────────────────────────── */
export default function OwnerLoginPage() {
  const router = useRouter();
  const { login, isLoggingIn, user, isMeLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [mounted, setMounted] = useState(false);
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    setMounted(true);
    const tick = () => {
      setTimeStr(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  // Redirect if already logged in as owner
  useEffect(() => {
    if (!isMeLoading && user?.role === 'restaurant_owner') router.replace('/dashboard');
  }, [user, isMeLoading, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter your credentials');
      return;
    }
    login(
      { email: email.trim().toLowerCase(), password: password.trim() },
      {
        onSuccess: () => { /* useAuth handles redirect */ },
        onError: (err: any) => {
          const msg = getErrorMessage(err);
          setErrorMsg(msg);
        },
      }
    );
  };

  const fillDemo = () => {
    setEmail('owner@paragon.com');
    setPassword('Owner@123');
    toast.success('Demo owner credentials filled!', { icon: '✨' });
  };



  return (
    <div className="min-h-screen w-full bg-[#040609] text-white flex items-stretch overflow-hidden font-sans select-none">

      {/* ════════════════════ LEFT HERO PANEL ════════════════════ */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col relative overflow-hidden bg-gradient-to-br from-[#060A10] via-[#0A0E18] to-[#050810]">
        <FloatingOrbs />

        {/* Top brand bar */}
        <div className="relative z-10 flex items-center justify-between px-10 pt-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-[0_0_24px_rgba(245,158,11,0.45)]">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight">Quick<span className="text-amber-400">Bite</span></span>
              <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest -mt-0.5">Owner Portal</p>
            </div>
          </div>
          {mounted && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/4 border border-white/8 text-[11px] font-mono text-slate-400">
              <Clock className="w-3 h-3 text-amber-400" />
              <span className="text-amber-300 font-bold">{timeStr}</span>
            </div>
          )}
        </div>

        {/* Hero headline */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-10 py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/25 bg-amber-500/8 text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-6 w-fit">
            <Sparkles className="w-3 h-3" />
            Restaurant Management HQ
          </div>

          <h1 className="text-4xl xl:text-5xl font-black leading-[1.05] tracking-tight mb-5">
            Your Restaurant.<br />
            <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
              Fully Commanded.
            </span>
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed max-w-md font-medium">
            One powerful command centre for your entire restaurant empire — reservations, live orders, kitchen display, staff, analytics, and more.
          </p>

          {/* Live stats */}
          <div
            className="mt-10 grid grid-cols-2 gap-3 max-w-md"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(12px)',
              transition: 'all 0.6s cubic-bezier(0.25,0.46,0.45,0.94) 0.3s',
            }}
          >
            <StatCard
              icon={TrendingUp}
              color="border-emerald-500/15"
              label="Today's Revenue"
              value={<CountUp to={84250} prefix="₹" />}
              sub="Across 2 outlets"
            />
            <StatCard
              icon={Users}
              color="border-blue-500/15"
              label="Covers Tonight"
              value={<CountUp to={142} />}
              sub="34 tables active"
            />
            <StatCard
              icon={Star}
              color="border-amber-500/15"
              label="Avg. Rating"
              value="4.8 ★"
              sub="Over 520 reviews"
            />
            <StatCard
              icon={CheckCircle2}
              color="border-purple-500/15"
              label="Orders Fulfilled"
              value={<CountUp to={1420} />}
              sub="+12.5% this month"
            />
          </div>

          {/* Feature pills */}
          <div className="mt-8 flex flex-wrap gap-2">
            {['KDS Kitchen Display', 'Live Reservations', 'Branch Analytics', 'Staff Roster', 'Payments'].map((f) => (
              <span key={f} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/4 border border-white/8 text-[10px] font-semibold text-slate-400">
                <ChevronRight className="w-2.5 h-2.5 text-amber-500" />
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom badge */}
        <div className="relative z-10 px-10 pb-8 flex items-center gap-2 text-[11px] text-slate-600 font-mono border-t border-white/4 pt-4">
          <Shield className="w-3.5 h-3.5 text-slate-700" />
          Bank-grade 256-bit TLS encryption &bull; SOC 2 compliant
        </div>
      </div>

      {/* ════════════════════ RIGHT FORM PANEL ════════════════════ */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-12 lg:px-16 py-10 bg-[#06090F] relative">
        <FloatingOrbs />

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)]">
            <UtensilsCrossed className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight">Quick<span className="text-amber-400">Bite</span></span>
        </div>

        <div className="relative z-10 w-full max-w-[400px]">
          {/* Form header */}
          <div className="mb-8">
            <h2 className="text-2xl font-black text-white tracking-tight">Welcome back</h2>
            <p className="text-sm text-slate-500 mt-1.5 font-medium">Sign in to your owner dashboard.</p>
          </div>

          {/* Error callout */}
          {errorMsg && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/8 border border-rose-500/25 text-rose-400 text-xs font-medium">
              <span className="mt-0.5 shrink-0 w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Email Address
              </label>
              <div className="relative group flex items-center rounded-2xl border border-white/8 bg-white/3 focus-within:border-amber-500/60 focus-within:bg-white/5 focus-within:shadow-[0_0_0_3px_rgba(245,158,11,0.08)] transition-all duration-200">
                <Mail className="absolute left-3.5 w-4 h-4 text-slate-600 group-focus-within:text-amber-400 transition-colors" />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@yourrestaurant.com"
                  required
                  className="w-full bg-transparent pl-10 pr-4 py-3.5 text-sm text-white placeholder:text-slate-700 outline-none font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Password
                </label>
                <Link href="/auth/forgot-password" className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative group flex items-center rounded-2xl border border-white/8 bg-white/3 focus-within:border-amber-500/60 focus-within:bg-white/5 focus-within:shadow-[0_0_0_3px_rgba(245,158,11,0.08)] transition-all duration-200">
                <Lock className="absolute left-3.5 w-4 h-4 text-slate-600 group-focus-within:text-amber-400 transition-colors" />
                <input
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full bg-transparent pl-10 pr-11 py-3.5 text-sm text-white placeholder:text-slate-700 outline-none font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 text-slate-600 hover:text-slate-300 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="relative w-full mt-2 py-4 rounded-2xl font-extrabold text-sm tracking-wide overflow-hidden transition-all duration-300 active:scale-[0.98] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed
                bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white
                hover:from-amber-400 hover:to-amber-500
                shadow-[0_8px_32px_rgba(245,158,11,0.35)] hover:shadow-[0_12px_40px_rgba(245,158,11,0.5)]"
            >
              {/* Shimmer */}
              {!isLoggingIn && (
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
              )}
              <span className="relative flex items-center justify-center gap-2">
                {isLoggingIn ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In to Owner Portal
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Demo fill */}
          <div className="mt-4">
            <button
              type="button"
              onClick={fillDemo}
              className="w-full py-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 text-amber-400 hover:text-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Fill Demo Owner Credentials
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/6" />
            <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">other portals</span>
            <div className="flex-1 h-px bg-white/6" />
          </div>

          {/* Other portals */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/manager/login"
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-white/6 bg-white/2 hover:bg-white/5 text-[11px] font-semibold text-slate-500 hover:text-slate-300 transition-all"
            >
              Branch Manager Portal
            </Link>
            <Link
              href="/admin/login"
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-white/6 bg-white/2 hover:bg-white/5 text-[11px] font-semibold text-slate-500 hover:text-slate-300 transition-all"
            >
              Admin Portal
            </Link>
          </div>

          <p className="mt-8 text-center text-[10px] text-slate-700 font-medium">
            © 2025 QuickBite Inc. — Restaurant Management Platform
          </p>
        </div>
      </div>
    </div>
  );
}
