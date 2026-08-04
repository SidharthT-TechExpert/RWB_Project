'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  TrendingUp, Wallet, Building2, Star, ShoppingBag, Users,
  ArrowUpRight, ChevronRight, Zap, RefreshCw, UserCheck,
  MapPin, Store, ShieldCheck,
  BarChart2, Target, Award, Flame, Bell,
} from 'lucide-react';

import api from '@/lib/api';
import { useMyRestaurants } from '@/hooks/useRestaurants';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

/* ── Sparkline micro-chart ──────────────────────────────────── */
function Sparkline({ data, color, fill }: { data: number[]; color: string; fill: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const W = 88, H = 32;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * H;
    return `${x},${y}`;
  });
  const pathD = `M ${pts.join(' L ')}`;
  const fillPath = `${pathD} L ${W},${H} L 0,${H} Z`;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="opacity-90">
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#sg-${color.replace('#','')})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Animated count-up ──────────────────────────────────────── */
function CountUp({ to, prefix = '', suffix = '', decimals = 0, delay = 0 }: {
  to: number; prefix?: string; suffix?: string; decimals?: number; delay?: number;
}) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      let start = 0;
      const duration = 1400;
      const steps = 60;
      const inc = to / steps;
      const interval = duration / steps;
      const timer = setInterval(() => {
        start += inc;
        if (start >= to) { setVal(to); clearInterval(timer); }
        else { setVal(parseFloat(start.toFixed(decimals))); }
      }, interval);
      return () => clearInterval(timer);
    }, delay);
    return () => clearTimeout(timeout);
  }, [to, decimals, delay]);

  const display = decimals > 0 ? val.toFixed(decimals) : Math.floor(val).toLocaleString('en-IN');
  return <>{prefix}{display}{suffix}</>;
}

/* ── Stagger animation variants ────────────────────────────── */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

/* ── Guest avatar ────────────────────────────────────────────── */
function GuestAvatar({ name }: { name: string }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const palette = ['from-blue-600 to-blue-800', 'from-purple-600 to-purple-800', 'from-emerald-600 to-emerald-800', 'from-amber-500 to-orange-600', 'from-pink-600 to-pink-800'];
  const grad = palette[name.charCodeAt(0) % palette.length];
  return (
    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-[10px] font-black text-white shrink-0`}>
      {initials}
    </div>
  );
}

/* ── Star rating display ─────────────────────────────────────── */
function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`w-3 h-3 ${s <= Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
      ))}
    </div>
  );
}

const REVENUE_BARS  = [42, 58, 38, 72, 88, 65, 82, 70, 91, 60, 45, 78];
const REVENUE_HOURS = ['8a','9a','10a','11a','12p','1p','2p','3p','4p','5p','6p','7p'];
const SPARK_REV     = [30, 45, 35, 55, 48, 62, 58, 70, 65, 80, 72, 88];
const SPARK_ORD     = [20, 35, 28, 42, 55, 48, 60, 52, 68, 58, 72, 80];

export default function DashboardHomePage() {
  const { user } = useAuth();
  const { data: restaurants } = useMyRestaurants();
  const restaurant = restaurants?.data?.[0];
  const restaurantId = restaurant?._id;
  const displayName = user?.name || restaurant?.ownerName || 'Chef';

  const { data: todayBookings, isRefetching } = useQuery({
    queryKey: ['dashboard', 'bookings', restaurantId],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await api.get(`/bookings/restaurant/${restaurantId}`, { params: { date: today, limit: 5 } });
      return data;
    },
    enabled: !!restaurantId,
    refetchInterval: 30_000,
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const greetEmoji = hour < 12 ? '☀️' : hour < 17 ? '⛅' : '🌙';

  const branches = [
    { id: '1', name: `${restaurant?.name || 'Paragon'} — Downtown`, city: 'Downtown, New York', manager: 'Arun Kumar', status: 'active', todaySales: '₹54,200', orders: 86, rating: 4.9, occupancy: 78 },
    { id: '2', name: `${restaurant?.name || 'Paragon'} — Uptown`,   city: 'Uptown, New York',   manager: 'Priya Sharma', status: 'active', todaySales: '₹30,050', orders: 56, rating: 4.7, occupancy: 62 },
  ];

  const DEMO_BOOKINGS = [
    { _id: '1', bookingNumber: 'Thomas Mathew', guestCount: 4, reservationTime: '19:30', status: 'confirmed' },
    { _id: '2', bookingNumber: 'Priya Sharma',  guestCount: 2, reservationTime: '20:00', status: 'checked_in' },
    { _id: '3', bookingNumber: 'Alex Vance',    guestCount: 6, reservationTime: '21:15', status: 'reserved' },
    { _id: '4', bookingNumber: 'Riya Kapoor',   guestCount: 3, reservationTime: '21:30', status: 'confirmed' },
  ];

  const bookings = todayBookings?.data?.length > 0 ? todayBookings.data : DEMO_BOOKINGS;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-16"
    >
      {/* ════════════ GREETING HERO ════════════ */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-2xl border border-amber-500/12 bg-gradient-to-br from-[#0D1020] via-[#0A0E1A] to-[#060A12] p-6 sm:p-8">
        {/* Background glow */}
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-amber-500/6 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-32 rounded-full bg-orange-500/4 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1.5 leading-tight">
              {greeting},{' '}
              <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                {displayName}
              </span>
              {' '}{greetEmoji}
            </h1>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              {restaurant?.name ?? 'QuickBite Partner'} &nbsp;·&nbsp; Multi-Branch Command Centre
            </p>
          </div>

          {/* Status pills */}
          <div className="flex flex-wrap gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              All Outlets Online
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-400">
              <Zap className="w-3 h-3" />
              Auto-sync Live
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400">
              <ShieldCheck className="w-3 h-3" />
              Verified Business
            </div>
          </div>
        </div>
      </motion.div>

      {/* ════════════ KPI CARDS ════════════ */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        {/* Revenue */}
        <motion.div
          whileHover={{ y: -4, borderColor: 'rgba(245,158,11,0.35)' }}
          className="relative group p-5 rounded-2xl border border-white/6 bg-[#0A0E1A]/80 backdrop-blur-sm overflow-hidden cursor-default transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-amber-500/5 blur-2xl" />
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest">Gross Revenue</p>
              <p className="text-[10px] text-slate-700 mt-0.5">This month</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-500/12 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white tabular-nums">
            ₹<CountUp to={842500} delay={200} />
          </p>
          <div className="flex items-end justify-between mt-3">
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
              <ArrowUpRight className="w-3.5 h-3.5" /> +18.4%
            </div>
            <Sparkline data={SPARK_REV} color="#f59e0b" fill="rgba(245,158,11,0.15)" />
          </div>
        </motion.div>

        {/* Active Outlets */}
        <motion.div
          whileHover={{ y: -4, borderColor: 'rgba(59,130,246,0.35)' }}
          className="relative group p-5 rounded-2xl border border-white/6 bg-[#0A0E1A]/80 backdrop-blur-sm overflow-hidden cursor-default transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest">Active Outlets</p>
              <p className="text-[10px] text-slate-700 mt-0.5">Branches configured</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-500/12 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white tabular-nums"><CountUp to={2} delay={300} /></p>
          <div className="flex items-center gap-2 mt-3">
            <div className="flex-1 h-1.5 bg-white/6 rounded-full overflow-hidden">
              <div className="h-full w-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full" />
            </div>
            <span className="text-[10px] font-bold text-blue-400">100% active</span>
          </div>
        </motion.div>

        {/* Orders */}
        <motion.div
          whileHover={{ y: -4, borderColor: 'rgba(168,85,247,0.35)' }}
          className="relative group p-5 rounded-2xl border border-white/6 bg-[#0A0E1A]/80 backdrop-blur-sm overflow-hidden cursor-default transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest">Total Orders</p>
              <p className="text-[10px] text-slate-700 mt-0.5">All outlets · all time</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-purple-500/12 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white tabular-nums"><CountUp to={1420} delay={400} /></p>
          <div className="flex items-end justify-between mt-3">
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" /> +12.5%
            </div>
            <Sparkline data={SPARK_ORD} color="#a855f7" fill="rgba(168,85,247,0.12)" />
          </div>
        </motion.div>

        {/* Rating */}
        <motion.div
          whileHover={{ y: -4, borderColor: 'rgba(245,158,11,0.35)' }}
          className="relative group p-5 rounded-2xl border border-white/6 bg-[#0A0E1A]/80 backdrop-blur-sm overflow-hidden cursor-default transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest">Avg. Guest Rating</p>
              <p className="text-[10px] text-slate-700 mt-0.5">520 reviews</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-500/12 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
          <p className="text-3xl font-black text-white tabular-nums">4.8</p>
          <div className="mt-3">
            <StarRating value={4.8} />
            <p className="text-[10px] text-slate-600 mt-1">"Exceptional" category</p>
          </div>
        </motion.div>

      </motion.div>

      {/* ════════════ MAIN GRID ════════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">

        {/* ── LEFT COLUMN (8/12) ── */}
        <div className="xl:col-span-8 space-y-5">

          {/* BRANCH PERFORMANCE CARDS */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-white/6 bg-[#0A0E1A]/80 backdrop-blur-sm overflow-hidden">
            <div className="px-5 pt-5 pb-3.5 border-b border-white/6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/12 border border-blue-500/20 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Outlet Performance</h2>
                  <p className="text-[10px] font-mono text-slate-600 mt-0.5">Today's sales, orders & occupancy across branches</p>
                </div>
              </div>
              <Link href="/dashboard/branches" className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors">
                Manage <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-4 space-y-3">
              {branches.map((b) => (
                <motion.div
                  key={b.id}
                  whileHover={{ x: 3 }}
                  className="group p-4 rounded-xl border border-white/5 bg-white/2 hover:border-amber-500/15 hover:bg-white/3 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-500/8 border border-amber-500/15 flex items-center justify-center shrink-0">
                        <Store className="w-4.5 h-4.5 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-white group-hover:text-amber-100 transition-colors">{b.name}</h3>
                        <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5 text-amber-500" /> {b.city}
                          </span>
                          <span className="flex items-center gap-1">
                            <UserCheck className="w-2.5 h-2.5 text-blue-400" /> {b.manager}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-5 border-t md:border-t-0 pt-3 md:pt-0 border-white/5">
                      {/* Occupancy bar */}
                      <div className="hidden sm:block">
                        <p className="text-[9px] font-mono text-slate-600 uppercase mb-1">Occupancy</p>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-white/6 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${b.occupancy}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                              className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400"
                            />
                          </div>
                          <span className="text-[10px] font-bold text-amber-400">{b.occupancy}%</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-[9px] font-mono text-slate-600 uppercase">Sales</p>
                        <p className="text-sm font-black text-emerald-400 mt-0.5">{b.todaySales}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-mono text-slate-600 uppercase">Orders</p>
                        <p className="text-sm font-black text-white mt-0.5">{b.orders}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-mono text-slate-600 uppercase">Rating</p>
                        <p className="text-sm font-black text-amber-400 mt-0.5">{b.rating} ★</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* BOTTOM ROW: Bookings + Revenue Chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* VIP Reservations */}
            <motion.div variants={fadeUp} className="rounded-2xl border border-white/6 bg-[#0A0E1A]/80 backdrop-blur-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 pt-5 pb-3.5 border-b border-white/6">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/12 border border-blue-500/20 flex items-center justify-center">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">Tonight's Reservations</h3>
                    {isRefetching && <RefreshCw className="w-2.5 h-2.5 text-slate-600 animate-spin mt-0.5" />}
                  </div>
                </div>
                <Link href="/dashboard/bookings" className="flex items-center gap-0.5 text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors">
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="p-3 space-y-0.5">
                {bookings.map((b: any) => {
                  const statusMap: Record<string, { cls: string; label: string }> = {
                    confirmed:  { cls: 'bg-blue-500/10 border-blue-500/20 text-blue-400',   label: 'Confirmed' },
                    checked_in: { cls: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', label: 'Seated' },
                    reserved:   { cls: 'bg-amber-500/10 border-amber-500/20 text-amber-400', label: 'Reserved' },
                    cancelled:  { cls: 'bg-rose-500/10 border-rose-500/20 text-rose-400',    label: 'Cancelled' },
                  };
                  const s = statusMap[b.status] ?? statusMap.confirmed;
                  return (
                    <motion.div
                      key={b._id}
                      whileHover={{ x: 2 }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/3 transition-all cursor-pointer"
                    >
                      <GuestAvatar name={b.bookingNumber} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{b.bookingNumber}</p>
                        <p className="text-[10px] text-slate-600 mt-0.5">{b.guestCount} guests · {b.reservationTime}</p>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-lg border shrink-0 ${s.cls}`}>
                        {s.label}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Hourly Revenue Chart */}
            <motion.div variants={fadeUp} className="rounded-2xl border border-white/6 bg-[#0A0E1A]/80 backdrop-blur-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 pt-5 pb-3.5 border-b border-white/6">
                <div>
                  <h3 className="text-xs font-bold text-white">Revenue Peak Hours</h3>
                  <p className="text-[10px] font-mono text-slate-600 mt-0.5">₹84,250 today</p>
                </div>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg flex items-center gap-1">
                  <Flame className="w-3 h-3" /> +18%
                </span>
              </div>
              <div className="px-5 pt-5 pb-4">
                <div className="relative h-28">
                  {/* Grid lines */}
                  {[0, 33, 66, 100].map(pct => (
                    <div key={pct} className="absolute left-0 right-0 border-t border-white/4" style={{ bottom: `${pct}%` }} />
                  ))}
                  {/* Bars */}
                  <div className="absolute inset-0 flex items-end gap-1">
                    {REVENUE_BARS.map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col justify-end h-full group/bar">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ duration: 0.7, delay: 0.05 * i, ease: [0.25, 0.46, 0.45, 0.94] }}
                          className="w-full rounded-t-lg relative bg-gradient-to-t from-amber-600/50 to-amber-400/90 group-hover/bar:from-amber-500 group-hover/bar:to-amber-300 transition-colors duration-200"
                        >
                          {/* Tooltip */}
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 bg-[#0F1828] text-white text-[9px] font-mono font-bold px-2 py-1 rounded-lg whitespace-nowrap pointer-events-none z-10 border border-white/10 shadow-xl transition-opacity">
                            ₹{(h * 950).toLocaleString()}
                          </div>
                        </motion.div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Hour labels */}
                <div className="flex gap-1 mt-1.5">
                  {REVENUE_HOURS.map((h, i) => (
                    <div key={i} className="flex-1 text-center text-[8px] font-mono text-slate-700">{h}</div>
                  ))}
                </div>
              </div>
            </motion.div>

          </div>
        </div>

        {/* ── RIGHT COLUMN (4/12) ── */}
        <div className="xl:col-span-4 space-y-4">

          {/* Executive Summary */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-white/6 bg-[#0A0E1A]/80 backdrop-blur-sm overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 pt-4 pb-3.5 border-b border-white/6">
              <div className="w-7 h-7 rounded-lg bg-purple-500/12 border border-purple-500/20 flex items-center justify-center">
                <BarChart2 className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <h3 className="text-xs font-bold text-white">Business Snapshot</h3>
            </div>
            <div className="px-5 py-4 space-y-3">
              {[
                { label: 'Peak Hour',        value: '8:00 – 9:30 PM', accent: false },
                { label: 'Top Branch',       value: 'Downtown',       accent: true  },
                { label: 'Avg. Order Value', value: '₹1,450',         accent: false },
                { label: 'Guest Rating',     value: '4.8 ★',          accent: false },
                { label: 'Staff On-shift',   value: '24 members',     accent: false },
                { label: 'Tables Occupied',  value: '34 of 48',       accent: false },
              ].map(({ label, value, accent }) => (
                <div key={label} className="flex items-center justify-between text-xs border-b border-white/4 pb-2.5 last:border-0 last:pb-0">
                  <span className="text-slate-500 font-medium">{label}</span>
                  <span className={`font-bold ${accent ? 'text-amber-400' : 'text-slate-200'}`}>{value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Monthly Goal */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-white/6 bg-[#0A0E1A]/80 backdrop-blur-sm p-5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                <p className="text-xs font-bold text-white">Monthly Target</p>
              </div>
              <span className="text-xl font-black text-white tabular-nums">68%</span>
            </div>
            <p className="text-[10px] font-mono text-slate-600 mb-4">₹8,42,500 of ₹12,50,000 goal</p>
            <div className="relative h-2.5 w-full bg-white/6 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '68%' }}
                transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.6 }}
                className="h-full rounded-full bg-gradient-to-r from-amber-700 via-amber-500 to-yellow-300 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
              />
              {/* Milestone marker */}
              <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/20" />
            </div>
            <div className="flex justify-between mt-2 text-[9px] font-mono">
              <span className="text-slate-700">₹0</span>
              <span className="text-slate-600">50% · ₹6.25L</span>
              <span className="text-slate-400 font-bold">₹12.5L</span>
            </div>
          </motion.div>

          {/* Executive Alerts */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-white/6 bg-[#0A0E1A]/80 backdrop-blur-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-4 pb-3.5 border-b border-white/6">
              <div className="flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <h3 className="text-xs font-bold text-white">Notifications</h3>
              </div>
              <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">3 new</span>
            </div>
            <div className="p-3 space-y-1.5">
              {[
                { icon: Wallet,        color: 'text-emerald-400', bg: 'bg-emerald-500/8 border-emerald-500/15', title: 'Settlement Complete',  desc: 'Daily payout ₹84,250 deposited', time: '10m ago' },
                { icon: Bell,          color: 'text-blue-400',    bg: 'bg-blue-500/8 border-blue-500/15',       title: 'VIP Reservation',      desc: 'Table for 6 at 20:00 downtown', time: '18m ago' },
                { icon: Award,         color: 'text-amber-400',   bg: 'bg-amber-500/8 border-amber-500/15',     title: '5-Star Review',        desc: '"Exceptional service & quality!"', time: '1h ago' },
              ].map(({ icon: Icon, color, bg, title, desc, time }) => (
                <motion.div
                  key={title}
                  whileHover={{ x: 2 }}
                  className={`flex items-start gap-3 px-3 py-2.5 rounded-xl border ${bg} transition-all cursor-pointer`}
                >
                  <Icon className={`w-3.5 h-3.5 ${color} mt-0.5 shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white">{title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">{desc}</p>
                  </div>
                  <span className="text-[9px] font-mono text-slate-700 shrink-0 pt-0.5">{time}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-white/6 bg-[#0A0E1A]/80 backdrop-blur-sm overflow-hidden">
            <div className="px-5 pt-4 pb-3.5 border-b border-white/6">
              <h3 className="text-xs font-bold text-white">Quick Actions</h3>
            </div>
            <div className="p-3 grid grid-cols-2 gap-2">
              {[
                { label: 'Analytics',   href: '/dashboard/analytics', icon: BarChart2, from: 'from-purple-500/15', border: 'border-purple-500/20', text: 'text-purple-400' },
                { label: 'Payments',    href: '/dashboard/payments',  icon: Wallet,    from: 'from-emerald-500/15', border: 'border-emerald-500/20', text: 'text-emerald-400' },
                { label: 'Staff',       href: '/dashboard/staff',     icon: Users,     from: 'from-blue-500/15',   border: 'border-blue-500/20',   text: 'text-blue-400' },
                { label: 'Settings',    href: '/dashboard/settings',  icon: null,      from: 'from-amber-500/15',  border: 'border-amber-500/20',  text: 'text-amber-400' },
              ].map(({ label, href, icon: Icon, from, border, text }) => (
                <Link
                  key={href}
                  href={href}
                  className={`group flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-xl border ${border} bg-gradient-to-br ${from} to-transparent text-center hover:brightness-125 active:scale-95 transition-all duration-200`}
                >
                  {Icon && <Icon className={`w-4 h-4 ${text} group-hover:scale-110 transition-transform`} />}
                  <span className={`text-[11px] font-bold ${text}`}>{label}</span>
                </Link>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
}
