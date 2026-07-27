'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PhoneCall, Armchair, Calendar, Wallet,
  ArrowUpRight, ArrowDownRight, TrendingUp,
  AlertTriangle, Info, Star, BarChart2,
  ChevronRight, Zap, RefreshCw, Users,
} from 'lucide-react';
import api from '@/lib/api';
import { useMyRestaurants } from '@/hooks/useRestaurants';
import Link from 'next/link';

interface TableStatus {
  id: string;
  number: string;
  status: 'occupied' | 'reserved' | 'available' | 'cleaning';
  seats?: number;
}

const INITIAL_TABLES: TableStatus[] = [
  { id: '1',  number: 'T-01', status: 'occupied',  seats: 4 },
  { id: '2',  number: 'T-02', status: 'reserved',  seats: 2 },
  { id: '3',  number: 'T-03', status: 'available', seats: 6 },
  { id: '4',  number: 'T-04', status: 'cleaning',  seats: 4 },
  { id: '5',  number: 'T-05', status: 'occupied',  seats: 2 },
  { id: '6',  number: 'T-06', status: 'available', seats: 4 },
  { id: '7',  number: 'T-07', status: 'cleaning',  seats: 6 },
  { id: '8',  number: 'T-08', status: 'available', seats: 4 },
  { id: '9',  number: 'T-09', status: 'cleaning',  seats: 2 },
  { id: '10', number: 'T-10', status: 'occupied',  seats: 8 },
  { id: '11', number: 'T-11', status: 'occupied',  seats: 4 },
  { id: '12', number: 'T-12', status: 'occupied',  seats: 4 },
  { id: '13', number: 'T-13', status: 'cleaning',  seats: 2 },
  { id: '14', number: 'T-14', status: 'cleaning',  seats: 4 },
  { id: '15', number: 'T-15', status: 'cleaning',  seats: 6 },
  { id: '16', number: 'T-16', status: 'occupied',  seats: 4 },
  { id: '17', number: 'T-17', status: 'cleaning',  seats: 2 },
  { id: '18', number: 'T-18', status: 'available', seats: 4 },
  { id: '19', number: 'T-19', status: 'cleaning',  seats: 4 },
  { id: '20', number: 'T-20', status: 'reserved',  seats: 6 },
];

const TABLE_CFG = {
  occupied:  { label: 'Occupied',  dot: 'bg-blue-500',    border: 'border-blue-500/25',   bg: 'bg-blue-500/8',    text: 'text-blue-400',   accent: 'bg-blue-500',   ring: 'ring-blue-500/20'   },
  reserved:  { label: 'Reserved',  dot: 'bg-orange-500',  border: 'border-orange-500/25', bg: 'bg-orange-500/8',  text: 'text-orange-400', accent: 'bg-orange-500', ring: 'ring-orange-500/20' },
  available: { label: 'Available', dot: 'bg-emerald-500', border: 'border-emerald-500/25',bg: 'bg-emerald-500/8', text: 'text-emerald-400',accent: 'bg-emerald-500',ring: 'ring-emerald-500/20'},
  cleaning:  { label: 'Cleaning',  dot: 'bg-amber-400',   border: 'border-amber-400/25',  bg: 'bg-amber-400/8',   text: 'text-amber-400',  accent: 'bg-amber-400',  ring: 'ring-amber-400/20'  },
};

// Mini sparkline SVG component
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const W = 80, H = 28;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * H;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="opacity-80">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const CHART_DATA  = [42, 58, 38, 72, 88, 65, 82, 70, 91, 60, 45, 78];
const CHART_HOURS = ['8a','9a','10a','11a','12p','1p','2p','3p','4p','5p','6p','7p'];
const SPARK_DATA  = [30, 45, 35, 55, 48, 62, 58, 70, 65, 80, 72, 88];

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// Guest avatar circle
function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['bg-blue-600','bg-purple-600','bg-emerald-600','bg-orange-600','bg-pink-600'];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`w-8 h-8 rounded-xl ${color} flex items-center justify-center text-[10px] font-black text-white shrink-0`}>
      {initials}
    </div>
  );
}

export default function DashboardHomePage() {
  const [tables] = useState<TableStatus[]>(INITIAL_TABLES);
  const [tableFilter, setTableFilter] = useState<string>('all');

  const { data: restaurants } = useMyRestaurants();
  const restaurant = restaurants?.data?.[0];
  const restaurantId = restaurant?._id;

  const { data: todayBookings, isRefetching } = useQuery({
    queryKey: ['dashboard', 'bookings', restaurantId],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await api.get(`/bookings/restaurant/${restaurantId}`, { params: { date: today, limit: 5 } });
      return data;
    },
    enabled: !!restaurantId,
    refetchInterval: 30 * 1000,
  });

  const filteredTables = tableFilter === 'all' ? tables : tables.filter(t => t.status === tableFilter);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const greetEmoji = hour < 12 ? '☀️' : hour < 17 ? '⛅' : '🌙';

  const statusCounts = {
    occupied:  tables.filter(t => t.status === 'occupied').length,
    available: tables.filter(t => t.status === 'available').length,
    reserved:  tables.filter(t => t.status === 'reserved').length,
    cleaning:  tables.filter(t => t.status === 'cleaning').length,
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.06 } } }}
      className="space-y-5 pb-16"
    >
      {/* ── GREETING + STATUS TICKER ── */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-mono text-slate-600 uppercase tracking-widest">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
            {greeting}, <span className="text-blue-400">{restaurant?.name?.split(' ')[0] ?? 'Arun'}</span>{' '}
            <span className="not-italic">{greetEmoji}</span>
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {restaurant?.name ?? 'Restaurant'} &nbsp;·&nbsp; Operational snapshot for today
          </p>
        </div>

        {/* Status pills */}
        <div className="flex flex-wrap gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            All Systems Online
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400">
            <Zap className="w-3 h-3" />
            Auto-refresh: 30s
          </div>
        </div>
      </motion.div>

      {/* ── KPI CARDS ── */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        {/* Reservations */}
        <motion.div whileHover={{ y: -3 }} className="relative group p-5 rounded-2xl border border-white/8 bg-gradient-to-br from-white/4 to-white/1 backdrop-blur-sm overflow-hidden hover:border-blue-500/25 transition-all duration-200 cursor-default">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-start justify-between mb-3">
            <p className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">Today's Reservations</p>
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white tabular-nums">128</p>
          <div className="flex items-end justify-between mt-3">
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
              <ArrowUpRight className="w-3.5 h-3.5" /> +12% vs yesterday
            </div>
            <Sparkline data={SPARK_DATA} color="#60a5fa" />
          </div>
        </motion.div>

        {/* Table Occupancy */}
        <motion.div whileHover={{ y: -3 }} className="relative group p-5 rounded-2xl border border-white/8 bg-gradient-to-br from-white/4 to-white/1 backdrop-blur-sm overflow-hidden hover:border-blue-500/25 transition-all duration-200 cursor-default">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-start justify-between mb-3">
            <p className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">Table Occupancy</p>
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <Armchair className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white tabular-nums">82%</p>
          <div className="mt-3 space-y-1.5">
            <div className="h-2 w-full bg-white/8 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '82%' }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_8px_#3b82f6]"
              />
            </div>
            <p className="text-[10px] font-mono text-slate-600">{statusCounts.occupied}/{tables.length} tables occupied</p>
          </div>
        </motion.div>

        {/* Available Tables */}
        <motion.div whileHover={{ y: -3 }} className="relative group p-5 rounded-2xl border border-white/8 bg-gradient-to-br from-white/4 to-white/1 backdrop-blur-sm overflow-hidden hover:border-amber-500/25 transition-all duration-200 cursor-default">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-start justify-between mb-3">
            <p className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">Available Tables</p>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white tabular-nums">0{statusCounts.available}</p>
          <div className="flex items-center gap-2 mt-3">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <span className="text-xs font-bold text-amber-400">Critical — seats filling fast</span>
          </div>
        </motion.div>

        {/* Daily Revenue */}
        <motion.div whileHover={{ y: -3 }} className="relative group p-5 rounded-2xl border border-white/8 bg-gradient-to-br from-white/4 to-white/1 backdrop-blur-sm overflow-hidden hover:border-emerald-500/25 transition-all duration-200 cursor-default">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-start justify-between mb-3">
            <p className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">Daily Revenue</p>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white tabular-nums">₹84,250</p>
          <div className="flex items-end justify-between mt-3">
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" /> +18% · 68% of target
            </div>
            <Sparkline data={[...SPARK_DATA].reverse()} color="#34d399" />
          </div>
        </motion.div>

      </motion.div>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">

        {/* ── LEFT ── */}
        <div className="xl:col-span-8 space-y-5">

          {/* Live Table Status */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-white/8 bg-white/2 backdrop-blur-sm overflow-hidden">
            {/* Header */}
            <div className="px-5 pt-5 pb-3 border-b border-white/6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
                    <Armchair className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Live Table Status</h2>
                    <p className="text-[10px] font-mono text-slate-600 mt-0.5">
                      {statusCounts.occupied} occupied · {statusCounts.available} available · {statusCounts.reserved} reserved · {statusCounts.cleaning} cleaning
                    </p>
                  </div>
                </div>

                {/* Status filters */}
                <div className="flex flex-wrap gap-1.5">
                  {(['all', 'occupied', 'reserved', 'available', 'cleaning'] as const).map((f) => {
                    const cfg = f !== 'all' ? TABLE_CFG[f] : null;
                    const count = f === 'all' ? tables.length : statusCounts[f];
                    return (
                      <button
                        key={f}
                        onClick={() => setTableFilter(f)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                          tableFilter === f
                            ? f === 'all'
                              ? 'bg-white/12 text-white border-white/15'
                              : `${cfg!.bg} ${cfg!.text} ${cfg!.border}`
                            : 'bg-transparent text-slate-600 border-transparent hover:text-slate-300 hover:bg-white/5 hover:border-white/8'
                        }`}
                      >
                        {cfg && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
                        <span className="capitalize">{f}</span>
                        <span className="opacity-60">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Table Grid */}
            <div className="p-4 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 xl:grid-cols-5 2xl:grid-cols-7 gap-2.5">
              <AnimatePresence mode="popLayout">
                {filteredTables.map((t) => {
                  const cfg = TABLE_CFG[t.status];
                  return (
                    <motion.div
                      key={t.id}
                      layout
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      whileHover={{ scale: 1.07, y: -3 }}
                      className={`aspect-square rounded-xl border ${cfg.border} ${cfg.bg} flex flex-col items-center justify-center gap-1 cursor-pointer relative overflow-hidden group`}
                    >
                      {/* Top accent bar */}
                      <div className={`absolute top-0 left-0 right-0 h-0.5 ${cfg.accent}`} />
                      <span className="text-[11px] font-mono font-black text-white">{t.number}</span>
                      <Armchair className={`w-4 h-4 ${cfg.text}`} />
                      {t.seats && (
                        <div className="flex items-center gap-0.5">
                          <Users className={`w-2.5 h-2.5 ${cfg.text} opacity-60`} />
                          <span className={`text-[9px] font-bold ${cfg.text} opacity-60`}>{t.seats}</span>
                        </div>
                      )}
                      <span className={`text-[8px] font-black uppercase tracking-widest ${cfg.text} opacity-80`}>{cfg.label}</span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Bottom row: Reservations + Revenue Chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Reservations */}
            <motion.div variants={fadeUp} className="rounded-2xl border border-white/8 bg-white/2 backdrop-blur-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/6">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
                    <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Today's Reservations</h3>
                  {isRefetching && <RefreshCw className="w-3 h-3 text-slate-600 animate-spin" />}
                </div>
                <Link href="/dashboard/bookings" className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-0.5 transition-colors">
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="p-3 space-y-1">
                {(todayBookings?.data?.length > 0 ? todayBookings.data : [
                  { _id: '1', bookingNumber: 'Thomas Mathew',  guestCount: 4, reservationTime: '19:30', status: 'confirmed'  },
                  { _id: '2', bookingNumber: 'Priya Sharma',   guestCount: 2, reservationTime: '20:00', status: 'checked_in' },
                  { _id: '3', bookingNumber: 'Alex Vance',     guestCount: 6, reservationTime: '21:15', status: 'reserved'   },
                  { _id: '4', bookingNumber: 'Riya Kapoor',    guestCount: 3, reservationTime: '21:30', status: 'confirmed'  },
                ]).map((b: any) => (
                  <motion.div
                    key={b._id}
                    whileHover={{ x: 2 }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/4 transition-all"
                  >
                    <Avatar name={b.bookingNumber} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{b.bookingNumber}</p>
                      <p className="text-[10px] text-slate-600 mt-0.5 flex items-center gap-1">
                        <Users className="w-2.5 h-2.5" />{b.guestCount} guests &nbsp;·&nbsp; {b.reservationTime}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border capitalize shrink-0 ${
                      b.status === 'confirmed'   ? 'bg-blue-500/12 border-blue-500/20 text-blue-400' :
                      b.status === 'checked_in'  ? 'bg-emerald-500/12 border-emerald-500/20 text-emerald-400' :
                      b.status === 'reserved'    ? 'bg-orange-500/12 border-orange-500/20 text-orange-400' :
                      'bg-slate-500/12 border-slate-500/20 text-slate-400'
                    }`}>
                      {b.status.replace('_', ' ')}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Hourly Revenue Chart */}
            <motion.div variants={fadeUp} className="rounded-2xl border border-white/8 bg-white/2 backdrop-blur-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/6">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Hourly Revenue</h3>
                    <p className="text-[10px] font-mono text-slate-600">₹84,250 total today</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">+18%</span>
              </div>
              <div className="px-5 pt-5 pb-4">
                {/* Y-axis grid + bars */}
                <div className="relative h-28">
                  {/* Grid lines */}
                  {[0, 33, 66, 100].map(pct => (
                    <div key={pct} className="absolute left-0 right-0 border-t border-white/4" style={{ bottom: `${pct}%` }} />
                  ))}
                  {/* Bars */}
                  <div className="absolute inset-0 flex items-end gap-1.5">
                    {CHART_DATA.map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col justify-end h-full group">
                        <div
                          className="w-full rounded-t-lg bg-gradient-to-t from-blue-600/40 to-blue-400/80 group-hover:from-blue-500 group-hover:to-blue-300 transition-all duration-200 relative"
                          style={{ height: `${h}%` }}
                        >
                          {/* Tooltip */}
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[9px] font-mono font-bold px-2 py-1 rounded-lg whitespace-nowrap transition-all pointer-events-none z-10 border border-white/10 shadow-xl">
                            ₹{(h * 950).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Hour labels */}
                <div className="flex gap-1.5 mt-1.5">
                  {CHART_HOURS.map((h, i) => (
                    <div key={i} className="flex-1 text-center text-[9px] font-mono text-slate-700">{h}</div>
                  ))}
                </div>
              </div>
            </motion.div>

          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="xl:col-span-4 space-y-4">

          {/* Today's Summary */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-white/8 bg-white/2 backdrop-blur-sm overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 pt-4 pb-3 border-b border-white/6">
              <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/20 flex items-center justify-center">
                <BarChart2 className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <h3 className="text-sm font-bold text-white">Today's Summary</h3>
            </div>
            <div className="px-5 py-4 space-y-3">
              {[
                { label: 'Peak Demand',     value: '20:00 – 21:30', highlight: false },
                { label: 'Top Dish',        value: 'Malabar Biryani', highlight: true },
                { label: 'Avg. Order Value',value: '₹1,450',         highlight: false },
                { label: 'Customer Rating', value: '4.8 ★',          highlight: false },
              ].map(({ label, value, highlight }) => (
                <div key={label} className="flex items-center justify-between text-xs py-0.5">
                  <span className="text-slate-500">{label}</span>
                  <span className={`font-bold ${highlight ? 'text-brand-400' : 'text-white'}`}>{value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Revenue Goal */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-white/8 bg-white/2 backdrop-blur-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-bold text-white">Monthly Revenue Goal</p>
                <p className="text-[10px] font-mono text-slate-600 mt-0.5">July 2025 · ₹84,250 earned</p>
              </div>
              <span className="text-lg font-black text-white tabular-nums">68%</span>
            </div>
            <div className="h-2.5 w-full bg-white/8 rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '68%' }}
                transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.5 }}
                className="h-full rounded-full bg-gradient-to-r from-blue-700 via-blue-500 to-indigo-400 shadow-[0_0_12px_#3b82f6]"
              />
              {/* Milestone at 50% */}
              <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/20" title="50% milestone" />
            </div>
            <div className="flex justify-between mt-2 text-[10px] font-mono">
              <span className="text-slate-700">₹0</span>
              <span className="text-slate-500">₹62,500</span>
              <span className="text-slate-400 font-bold">₹1,25,000</span>
            </div>
          </motion.div>

          {/* Recent Alerts */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-white/8 bg-white/2 backdrop-blur-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/6">
              <h3 className="text-sm font-bold text-white">Recent Alerts</h3>
              <span className="text-[10px] font-bold text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded-full">3 new</span>
            </div>
            <div className="p-3 space-y-2">
              {[
                { icon: AlertTriangle, iconColor: 'text-red-400',   iconBg: 'bg-red-500/12 border-red-500/20',     title: 'Inventory Low',   desc: 'Basmati Rice stock below 5kg', time: '2m ago',  pulse: true  },
                { icon: Info,          iconColor: 'text-blue-400',  iconBg: 'bg-blue-500/12 border-blue-500/20',   title: 'VIP Booking',     desc: 'Mr. Thomas — Table 15',        time: '15m ago', pulse: false },
                { icon: Star,          iconColor: 'text-amber-400', iconBg: 'bg-amber-500/12 border-amber-500/20', title: '5-Star Review',   desc: '"Best appam in town!" — Priya', time: '1h ago',  pulse: false },
              ].map(({ icon: Icon, iconColor, iconBg, title, desc, time, pulse }) => (
                <motion.div key={title} whileHover={{ x: 2 }} className={`flex items-start gap-3 px-3 py-3 rounded-xl border ${iconBg} transition-all cursor-pointer`}>
                  <div className="relative shrink-0 mt-0.5">
                    <Icon className={`w-4 h-4 ${iconColor}`} />
                    {pulse && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 animate-ping opacity-75" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white">{title}</p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{desc}</p>
                  </div>
                  <span className="text-[9px] font-mono text-slate-700 shrink-0 pt-0.5">{time}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-white/8 bg-white/2 backdrop-blur-sm overflow-hidden">
            <div className="px-5 pt-4 pb-3 border-b border-white/6">
              <h3 className="text-sm font-bold text-white">Quick Actions</h3>
            </div>
            <div className="p-3 grid grid-cols-2 gap-2">
              {[
                { label: 'New Booking',   href: '/dashboard/bookings',  from: 'from-blue-600/20',   to: 'to-blue-500/5',    border: 'border-blue-500/20',   text: 'text-blue-400' },
                { label: 'Add Menu Item', href: '/dashboard/menu',       from: 'from-brand-500/20',  to: 'to-brand-400/5',   border: 'border-brand-500/20',  text: 'text-brand-400' },
                { label: 'Live Orders',   href: '/dashboard/orders',     from: 'from-emerald-500/20',to: 'to-emerald-400/5', border: 'border-emerald-500/20',text: 'text-emerald-400' },
                { label: 'Reports',       href: '/dashboard/analytics',  from: 'from-purple-500/20', to: 'to-purple-400/5',  border: 'border-purple-500/20', text: 'text-purple-400' },
              ].map(({ label, href, from, to, border, text }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center justify-center px-3 py-3 rounded-xl border ${border} bg-gradient-to-br ${from} ${to} text-xs font-bold ${text} text-center hover:brightness-110 transition-all active:scale-95`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
}
