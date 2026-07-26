'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PhoneCall, Armchair, Calendar, Wallet,
  ArrowUpRight, ArrowDownRight, TrendingUp,
  AlertTriangle, Info, Star, BarChart2,
  ChevronRight, Zap, Clock,
} from 'lucide-react';
import api from '@/lib/api';
import { useMyRestaurants } from '@/hooks/useRestaurants';
import Link from 'next/link';

interface TableStatus {
  id: string;
  number: string;
  status: 'occupied' | 'reserved' | 'available' | 'cleaning';
}

const INITIAL_TABLES: TableStatus[] = [
  { id: '1', number: 'T-01', status: 'occupied' },
  { id: '2', number: 'T-02', status: 'reserved' },
  { id: '3', number: 'T-03', status: 'available' },
  { id: '4', number: 'T-04', status: 'cleaning' },
  { id: '5', number: 'T-05', status: 'occupied' },
  { id: '6', number: 'T-06', status: 'available' },
  { id: '7', number: 'T-07', status: 'cleaning' },
  { id: '8', number: 'T-08', status: 'available' },
  { id: '9', number: 'T-09', status: 'cleaning' },
  { id: '10', number: 'T-10', status: 'occupied' },
  { id: '11', number: 'T-11', status: 'occupied' },
  { id: '12', number: 'T-12', status: 'occupied' },
  { id: '13', number: 'T-13', status: 'cleaning' },
  { id: '14', number: 'T-14', status: 'cleaning' },
  { id: '15', number: 'T-15', status: 'cleaning' },
  { id: '16', number: 'T-16', status: 'occupied' },
  { id: '17', number: 'T-17', status: 'cleaning' },
  { id: '18', number: 'T-18', status: 'available' },
  { id: '19', number: 'T-19', status: 'cleaning' },
  { id: '20', number: 'T-20', status: 'reserved' },
];

const TABLE_STATUS_CONFIG = {
  occupied:  { label: 'Occupied',  color: 'bg-blue-500',   border: 'border-blue-500/30',   bg: 'bg-blue-500/10',   text: 'text-blue-400',   glow: 'shadow-blue-500/20'  },
  reserved:  { label: 'Reserved',  color: 'bg-orange-500', border: 'border-orange-500/30', bg: 'bg-orange-500/10', text: 'text-orange-400', glow: 'shadow-orange-500/20'},
  available: { label: 'Available', color: 'bg-emerald-500',border: 'border-emerald-500/30',bg: 'bg-emerald-500/10',text: 'text-emerald-400',glow: 'shadow-emerald-500/20'},
  cleaning:  { label: 'Cleaning',  color: 'bg-amber-400',  border: 'border-amber-400/30',  bg: 'bg-amber-400/10',  text: 'text-amber-400',  glow: 'shadow-amber-400/20' },
};

const CHART_DATA = [42, 58, 38, 72, 88, 65, 82, 70, 91, 60, 45, 78];
const CHART_HOURS = ['8a','9a','10a','11a','12p','1p','2p','3p','4p','5p','6p','7p'];

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function DashboardHomePage() {
  const [tables] = useState<TableStatus[]>(INITIAL_TABLES);
  const [tableFilter, setTableFilter] = useState<string>('all');

  const { data: restaurants } = useMyRestaurants();
  const restaurant = restaurants?.data?.[0];
  const restaurantId = restaurant?._id;

  const { data: todayBookings } = useQuery({
    queryKey: ['dashboard', 'bookings', restaurantId],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await api.get(`/bookings/restaurant/${restaurantId}`, { params: { date: today, limit: 5 } });
      return data;
    },
    enabled: !!restaurantId,
    refetchInterval: 30 * 1000,
  });

  const filteredTables = tableFilter === 'all' ? tables : tables.filter((t) => t.status === tableFilter);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const kpiCards = [
    {
      label: "Today's Reservations",
      value: '128',
      icon: PhoneCall,
      change: '+12%',
      up: true,
      color: 'blue',
      iconBg: 'bg-blue-500/15 text-blue-400',
      border: 'hover:border-blue-500/30',
      glow: 'hover:shadow-blue-500/10',
    },
    {
      label: 'Table Occupancy',
      value: '82%',
      icon: Armchair,
      sub: <div className="w-full bg-white/8 h-1.5 rounded-full mt-3 overflow-hidden"><div className="bg-blue-500 h-full rounded-full shadow-[0_0_6px_#3b82f6]" style={{ width: '82%' }} /></div>,
      color: 'blue',
      iconBg: 'bg-blue-500/15 text-blue-400',
      border: 'hover:border-blue-500/30',
      glow: 'hover:shadow-blue-500/10',
    },
    {
      label: 'Available Tables',
      value: '08',
      icon: Calendar,
      change: '↓ Low',
      up: false,
      color: 'amber',
      iconBg: 'bg-amber-500/15 text-amber-400',
      border: 'hover:border-amber-500/30',
      glow: 'hover:shadow-amber-500/10',
    },
    {
      label: 'Daily Revenue',
      value: '₹84,250',
      icon: Wallet,
      change: '+18%',
      up: true,
      color: 'emerald',
      iconBg: 'bg-emerald-500/15 text-emerald-400',
      border: 'hover:border-emerald-500/30',
      glow: 'hover:shadow-emerald-500/10',
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.07 } } }}
      className="space-y-6 pb-16"
    >
      {/* ── GREETING ROW ── */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
            {greeting}, <span className="text-blue-400">{restaurant?.name?.split(' ')[0] ?? 'Arun'}</span> 👋
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Here's your operational snapshot for today.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400">
            <Zap className="w-3.5 h-3.5" />
            <span>All Systems Operational</span>
          </div>
        </div>
      </motion.div>

      {/* ── KPI CARDS ── */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <motion.div
            key={card.label}
            whileHover={{ y: -2, scale: 1.01 }}
            className={`group relative p-5 rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm shadow-xl transition-all duration-200 cursor-default ${card.border} hover:shadow-lg ${card.glow}`}
          >
            <div className="flex items-start justify-between mb-4">
              <p className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider leading-tight">{card.label}</p>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg}`}>
                <card.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-white tracking-tight tabular-nums">{card.value}</p>
            {card.sub ?? null}
            {card.change && (
              <div className={`flex items-center gap-1 mt-3 text-xs font-bold ${card.up ? 'text-emerald-400' : 'text-amber-400'}`}>
                {card.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {card.change}
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* LEFT COLUMN */}
        <div className="xl:col-span-8 space-y-6">

          {/* Live Table Grid */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm overflow-hidden">
            {/* Section header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 pt-5 pb-4 border-b border-white/6">
              <div className="flex items-center gap-2.5">
                <Armchair className="w-4 h-4 text-blue-400" />
                <h2 className="font-bold text-sm text-white">Live Table Status</h2>
                <span className="text-[10px] font-mono text-slate-500">{tables.length} tables</span>
              </div>
              {/* Status filters */}
              <div className="flex flex-wrap gap-1.5">
                {(['all', 'occupied', 'reserved', 'available', 'cleaning'] as const).map((f) => {
                  const cfg = f === 'all' ? null : TABLE_STATUS_CONFIG[f];
                  return (
                    <button
                      key={f}
                      onClick={() => setTableFilter(f)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        tableFilter === f
                          ? f === 'all' ? 'bg-white/15 text-white' : `${cfg!.bg} ${cfg!.text} border ${cfg!.border}`
                          : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      {cfg && <span className={`w-1.5 h-1.5 rounded-full ${cfg.color}`} />}
                      <span className="capitalize">{f}</span>
                      {f !== 'all' && (
                        <span className="text-[10px]">
                          {tables.filter(t => t.status === f).length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Table cards */}
            <div className="p-4 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 xl:grid-cols-5 2xl:grid-cols-7 gap-2">
              <AnimatePresence>
                {filteredTables.map((t) => {
                  const cfg = TABLE_STATUS_CONFIG[t.status];
                  return (
                    <motion.div
                      key={t.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ scale: 1.06, y: -2 }}
                      className={`aspect-square rounded-xl border ${cfg.border} ${cfg.bg} flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all shadow-lg ${cfg.glow}`}
                    >
                      <Armchair className={`w-5 h-5 ${cfg.text}`} />
                      <span className="text-[10px] font-mono font-bold text-slate-400">{t.number}</span>
                      <span className={`text-[9px] font-black uppercase tracking-wider ${cfg.text}`}>{cfg.label}</span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Reservations table + Revenue chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Today's Reservations */}
            <motion.div variants={fadeUp} className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/6">
                <h3 className="text-sm font-bold text-white">Today's Reservations</h3>
                <Link href="/dashboard/bookings" className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1">
                  View all <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="p-4 space-y-1">
                {(todayBookings?.data?.length > 0 ? todayBookings.data : [
                  { _id: '1', bookingNumber: 'Thomas M.', guestCount: 4, reservationTime: '19:30', status: 'confirmed' },
                  { _id: '2', bookingNumber: 'Priya S.',   guestCount: 2, reservationTime: '20:00', status: 'checked_in' },
                  { _id: '3', bookingNumber: 'Alex V.',    guestCount: 6, reservationTime: '21:15', status: 'reserved' },
                  { _id: '4', bookingNumber: 'Riya K.',    guestCount: 3, reservationTime: '21:30', status: 'confirmed' },
                ]).map((b: any) => (
                  <div key={b._id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/4 transition-all group">
                    <div className="w-8 h-8 rounded-xl bg-white/6 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-mono font-bold text-slate-300">{b.reservationTime}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{b.bookingNumber}</p>
                      <p className="text-[10px] text-slate-500">{b.guestCount} guests</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border capitalize shrink-0 ${
                      b.status === 'confirmed'   ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                      b.status === 'checked_in'  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                      b.status === 'reserved'    ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                      'bg-slate-500/10 border-slate-500/20 text-slate-400'
                    }`}>
                      {b.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Hourly Revenue Chart */}
            <motion.div variants={fadeUp} className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/6">
                <div>
                  <h3 className="text-sm font-bold text-white">Hourly Revenue</h3>
                  <p className="text-[10px] font-mono text-slate-500 mt-0.5">Today · ₹84,250 total</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+18%</span>
                </div>
              </div>
              <div className="px-5 pt-4 pb-5">
                {/* Bar chart */}
                <div className="flex items-end gap-1.5 h-28">
                  {CHART_DATA.map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                      <div
                        className="w-full bg-blue-500/20 group-hover:bg-blue-500 rounded-t-md transition-all duration-300 relative"
                        style={{ height: `${h}%` }}
                      >
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded whitespace-nowrap transition-all pointer-events-none z-10 border border-white/10">
                          ₹{(h * 950).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Hour labels */}
                <div className="flex gap-1.5 mt-2">
                  {CHART_HOURS.map((h, i) => (
                    <div key={i} className="flex-1 text-center text-[9px] font-mono text-slate-600">{h}</div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="xl:col-span-4 space-y-4">

          {/* Today's Summary */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm">
            <div className="flex items-center gap-2 px-5 pt-5 pb-3 border-b border-white/6">
              <BarChart2 className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Today's Summary</h3>
            </div>
            <div className="p-4 space-y-3">
              {[
                { label: 'Peak Demand', value: '20:00 – 21:30' },
                { label: 'Top Dish', value: 'Malabar Biryani' },
                { label: 'Avg. Order Value', value: '₹1,450' },
                { label: 'Customer Rating', value: '4.8 ★' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-bold text-white">{value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Revenue Goal */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-white">Revenue Goal</p>
              <span className="text-xs font-mono font-black text-blue-400">68%</span>
            </div>
            <div className="h-2 w-full bg-white/8 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '68%' }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 shadow-[0_0_8px_#3b82f6]"
              />
            </div>
            <div className="flex justify-between mt-2 text-[10px] font-mono text-slate-600">
              <span>₹0</span>
              <span className="text-slate-400 font-bold">₹1,25,000 target</span>
            </div>
          </motion.div>

          {/* Recent Alerts */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm overflow-hidden">
            <div className="px-5 pt-5 pb-3 border-b border-white/6 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Recent Alerts</h3>
              <span className="text-[10px] font-mono text-slate-500">3 new</span>
            </div>
            <div className="p-3 space-y-2">
              {[
                { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', title: 'Inventory Low', desc: 'Basmati Rice below 5kg', time: '2m ago' },
                { icon: Info,          color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', title: 'VIP Booking',     desc: 'Mr. Thomas — Table 15',  time: '15m ago' },
                { icon: Star,          color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', title: '5-Star Review', desc: '"Best appam in town!" — Priya', time: '1h ago' },
              ].map(({ icon: Icon, color, bg, title, desc, time }) => (
                <div key={title} className={`flex items-start gap-3 px-3 py-2.5 rounded-xl border ${bg} transition-all`}>
                  <Icon className={`w-4 h-4 ${color} shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white">{title}</p>
                    <p className="text-[11px] text-slate-400 truncate">{desc}</p>
                  </div>
                  <span className="text-[9px] font-mono text-slate-600 shrink-0 pt-0.5">{time}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm overflow-hidden">
            <div className="px-5 pt-5 pb-3 border-b border-white/6">
              <h3 className="text-sm font-bold text-white">Quick Actions</h3>
            </div>
            <div className="p-3 grid grid-cols-2 gap-2">
              {[
                { label: 'New Booking',   href: '/dashboard/bookings', color: 'bg-blue-600/20 border-blue-500/30 text-blue-400 hover:bg-blue-600/30' },
                { label: 'Add Menu Item', href: '/dashboard/menu',     color: 'bg-brand-500/20 border-brand-500/30 text-brand-400 hover:bg-brand-500/30' },
                { label: 'View Orders',   href: '/dashboard/orders',   color: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30' },
                { label: 'View Reports',  href: '/dashboard/analytics',color: 'bg-purple-500/20 border-purple-500/30 text-purple-400 hover:bg-purple-500/30' },
              ].map(({ label, href, color }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center justify-center px-3 py-2.5 rounded-xl border text-xs font-bold text-center transition-all ${color}`}
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
