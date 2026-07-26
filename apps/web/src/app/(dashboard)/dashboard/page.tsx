'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Search,
  MapPin,
  Bell,
  HelpCircle,
  Download,
  PhoneCall,
  Armchair,
  Calendar,
  Wallet,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  Info,
  Star,
  ChevronDown,
  Sparkles,
  BarChart2,
  Clock,
  Command,
} from 'lucide-react';
import api from '@/lib/api';
import { useMyRestaurants } from '@/hooks/useRestaurants';
import { Button } from '@/components/ui/Button';

// Mock Table Data for Live Table Grid
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

const STATUS_STYLES = {
  occupied: {
    label: 'Occupied',
    cardBg: 'bg-gradient-to-b from-blue-950/40 to-blue-900/10 dark:bg-blue-950/30',
    border: 'border-blue-500/40 dark:border-blue-700/60',
    text: 'text-blue-400',
    glow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]',
    dot: 'bg-blue-500 shadow-[0_0_8px_#3b82f6]',
  },
  reserved: {
    label: 'Reserved',
    cardBg: 'bg-gradient-to-b from-orange-950/40 to-orange-900/10 dark:bg-orange-950/30',
    border: 'border-orange-500/40 dark:border-orange-700/60',
    text: 'text-orange-400',
    glow: 'shadow-[0_0_15px_rgba(249,115,22,0.15)]',
    dot: 'bg-orange-500 shadow-[0_0_8px_#f97316]',
  },
  available: {
    label: 'Available',
    cardBg: 'bg-gradient-to-b from-emerald-950/40 to-emerald-900/10 dark:bg-emerald-950/30',
    border: 'border-emerald-500/40 dark:border-emerald-700/60',
    text: 'text-emerald-400',
    glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]',
    dot: 'bg-emerald-500 shadow-[0_0_8px_#10b981]',
  },
  cleaning: {
    label: 'Cleaning',
    cardBg: 'bg-gradient-to-b from-amber-950/40 to-amber-900/10 dark:bg-amber-950/30',
    border: 'border-amber-500/40 dark:border-amber-700/60',
    text: 'text-amber-400',
    glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]',
    dot: 'bg-amber-400 shadow-[0_0_8px_#f59e0b]',
  },
};

export default function DashboardHomePage() {
  const [tables, setTables] = useState<TableStatus[]>(INITIAL_TABLES);
  const [tableFilter, setTableFilter] = useState<string>('all');
  const [branch, setBranch] = useState('Downtown Branch');

  const { data: restaurants } = useMyRestaurants();
  const restaurant = restaurants?.data?.[0];
  const restaurantId = restaurant?._id;

  // Real bookings query
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

  return (
    <div className="space-y-6 pb-12 font-sans select-none text-slate-100">

      {/* ── TOP COMMAND BAR (Sticky Flush On Top Header) ── */}
      <div className="sticky top-0 z-40 bg-[#091124]/98 backdrop-blur-2xl border-b border-slate-800/90 rounded-b-2xl p-4 shadow-[0_15px_35px_rgba(0,0,0,0.8)] flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden transition-all -mx-3 xs:-mx-4 sm:-mx-6 lg:-mx-8 -mt-3 xs:-mt-4 sm:-mt-6 lg:-mt-8 mb-6 px-4 xs:px-6 lg:px-8">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Left Title */}
        <div className="flex items-center gap-2.5 text-xs font-mono text-slate-400 uppercase tracking-widest relative z-10">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse" />
          <span className="font-bold text-slate-300">QuickBite Manager</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">Operational Command Center</span>
        </div>

        {/* Middle Search & Branch Selector */}
        <div className="flex flex-wrap items-center gap-3 flex-1 max-w-xl relative z-10">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              placeholder="Search tables, orders, or customers..."
              className="pl-10 pr-12 h-10 w-full rounded-xl border border-slate-800 bg-[#050B18]/90 text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] font-mono text-slate-500 bg-slate-800/60 px-1.5 py-0.5 rounded border border-slate-700/50">
              <Command className="w-2.5 h-2.5" /> K
            </div>
          </div>

          <div className="relative">
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="h-10 pl-9 pr-9 rounded-xl border border-slate-800 bg-[#050B18]/90 text-xs font-bold text-slate-200 appearance-none cursor-pointer focus:outline-none focus:border-blue-500/60 transition-all"
            >
              <option value="Downtown Branch">Downtown Branch</option>
              <option value="Uptown Branch">Uptown Branch</option>
            </select>
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-500 pointer-events-none" />
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Right Actions & Manager Profile */}
        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <button className="p-2.5 rounded-xl border border-slate-800 bg-[#050B18]/80 text-slate-400 hover:text-white transition-all hover:border-slate-700 relative group">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_8px_#ff6b35]" />
          </button>

          <button className="p-2.5 rounded-xl border border-slate-800 bg-[#050B18]/80 text-slate-400 hover:text-white transition-all hover:border-slate-700">
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Manager Avatar */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-800/80">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white font-black flex items-center justify-center text-xs shadow-[0_0_15px_rgba(255,107,53,0.35)] border border-brand-400/40">
              Arun
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-white leading-none">Arun 👋</p>
              <p className="text-[10px] font-mono font-bold text-slate-400 uppercase mt-0.5 tracking-wider">GENERAL MANAGER</p>
            </div>
          </div>

          {/* Export Button */}
          <Button size="sm" className="h-10 px-4 text-xs font-extrabold bg-white hover:bg-slate-100 text-slate-900 gap-2 rounded-xl shadow-lg hover:shadow-white/10 transition-all ml-2 cursor-pointer">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* ── GREETING & KPI CARDS ── */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            Good Morning, Arun <span className="animate-bounce inline-block">👋</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Here is what's happening at <strong className="text-white font-bold">{restaurant?.name || 'El Mariachi Taqueria'}</strong> today.
          </p>
        </div>

        {/* 4 Premium Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Today's Reservations */}
          <motion.div
            whileHover={{ y: -3 }}
            className="p-5 rounded-2xl border border-slate-800/80 bg-[#091124]/90 backdrop-blur-xl shadow-xl relative overflow-hidden group hover:border-blue-500/40 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest">Today's Reservations</span>
              <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shadow-[0_0_12px_rgba(37,99,235,0.2)]">
                <PhoneCall className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-white tracking-tight">128</div>
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-2.5">
              <ArrowUpRight className="w-4 h-4" />
              <span>+12% vs yest.</span>
            </div>
          </motion.div>

          {/* Card 2: Table Occupancy */}
          <motion.div
            whileHover={{ y: -3 }}
            className="p-5 rounded-2xl border border-slate-800/80 bg-[#091124]/90 backdrop-blur-xl shadow-xl relative overflow-hidden group hover:border-blue-500/40 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest">Table Occupancy</span>
              <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shadow-[0_0_12px_rgba(37,99,235,0.2)]">
                <Armchair className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-white tracking-tight">82%</div>
            <div className="w-full bg-slate-800/80 h-2 rounded-full mt-3 overflow-hidden p-0.5 border border-slate-700/50">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full shadow-[0_0_8px_#3b82f6]" style={{ width: '82%' }} />
            </div>
          </motion.div>

          {/* Card 3: Available Tables */}
          <motion.div
            whileHover={{ y: -3 }}
            className="p-5 rounded-2xl border border-slate-800/80 bg-[#091124]/90 backdrop-blur-xl shadow-xl relative overflow-hidden group hover:border-amber-500/40 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest">Available Tables</span>
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-white tracking-tight">08</div>
            <div className="text-xs font-bold text-amber-400 mt-2.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>Critical focus needed</span>
            </div>
          </motion.div>

          {/* Card 4: Daily Revenue */}
          <motion.div
            whileHover={{ y: -3 }}
            className="p-5 rounded-2xl border border-slate-800/80 bg-[#091124]/90 backdrop-blur-xl shadow-xl relative overflow-hidden group hover:border-blue-500/40 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest">Daily Revenue</span>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)] border border-blue-400/40">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-white tracking-tight">₹84,250</div>
            <div className="text-xs font-bold text-blue-400 flex items-center gap-1 mt-2.5">
              <TrendingUp className="w-4 h-4" />
              <span>^ 18% target met</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── MAIN CONTENT GRID (Tables & Analytics + Side Panel) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── LEFT COLUMN (Tables & Charts) ── */}
        <div className="lg:col-span-8 space-y-6">

          {/* Live Table Status Grid */}
          <div className="bg-[#091124]/90 backdrop-blur-2xl border border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
              <h2 className="font-black text-lg text-white flex items-center gap-2.5">
                <Armchair className="w-5 h-5 text-brand-500" />
                Live Table Status
              </h2>

              {/* Status Filter Badges */}
              <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold">
                <button
                  onClick={() => setTableFilter('occupied')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${tableFilter === 'occupied' ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.4)]' : 'bg-[#050B18] text-slate-400 border-slate-800 hover:border-slate-700'}`}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_6px_#3b82f6]" />
                  <span>OCCUPIED</span>
                </button>
                <button
                  onClick={() => setTableFilter('reserved')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${tableFilter === 'reserved' ? 'bg-orange-600 text-white border-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.4)]' : 'bg-[#050B18] text-slate-400 border-slate-800 hover:border-slate-700'}`}
                >
                  <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_6px_#f97316]" />
                  <span>RESERVED</span>
                </button>
                <button
                  onClick={() => setTableFilter('available')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${tableFilter === 'available' ? 'bg-emerald-600 text-white border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]' : 'bg-[#050B18] text-slate-400 border-slate-800 hover:border-slate-700'}`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                  <span>AVAILABLE</span>
                </button>
                <button
                  onClick={() => setTableFilter('cleaning')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${tableFilter === 'cleaning' ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]' : 'bg-[#050B18] text-slate-400 border-slate-800 hover:border-slate-700'}`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
                  <span>CLEANING</span>
                </button>
                {tableFilter !== 'all' && (
                  <button onClick={() => setTableFilter('all')} className="text-xs text-brand-400 hover:underline ml-1">
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Table Grid Cards */}
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2.5 sm:gap-3">
              {filteredTables.map((t) => {
                const style = STATUS_STYLES[t.status];
                return (
                  <motion.div
                    key={t.id}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className={`p-3.5 rounded-xl border ${style.cardBg} ${style.border} ${style.glow} flex flex-col items-center justify-center text-center space-y-1.5 cursor-pointer transition-all`}
                  >
                    <span className="text-xs font-mono font-bold text-slate-400">{t.number}</span>
                    <Armchair className={`w-5 h-5 ${style.text}`} />
                    <span className={`text-[10px] font-black uppercase tracking-wider ${style.text}`}>{style.label}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Bottom Split: Today's Reservations Table & Revenue Chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Today's Reservations Table */}
            <div className="bg-[#091124]/90 backdrop-blur-2xl border border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <h3 className="font-extrabold text-base text-white">Today's Reservations</h3>
                <a href="/dashboard/bookings" className="text-xs font-bold text-blue-400 hover:underline">
                  View All
                </a>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="text-slate-400 border-b border-slate-800 text-[10px] uppercase font-mono tracking-wider">
                    <tr>
                      <th className="text-left pb-2.5 font-bold">CUSTOMER</th>
                      <th className="text-center pb-2.5 font-bold">GUESTS</th>
                      <th className="text-center pb-2.5 font-bold">TIME</th>
                      <th className="text-right pb-2.5 font-bold">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {todayBookings?.data?.length > 0 ? (
                      todayBookings.data.map((b: any) => (
                        <tr key={b._id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 font-bold text-white">{b.bookingNumber}</td>
                          <td className="py-3 text-center font-semibold text-slate-300">{b.guestCount}p</td>
                          <td className="py-3 text-center font-mono text-slate-400">{b.reservationTime}</td>
                          <td className="py-3 text-right">
                            <span className="px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <>
                        <tr className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 font-bold text-white">Mr. Thomas</td>
                          <td className="py-3 text-center font-semibold text-slate-300">4p</td>
                          <td className="py-3 text-center font-mono text-slate-400">19:30</td>
                          <td className="py-3 text-right">
                            <span className="px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase bg-blue-500/15 border border-blue-500/30 text-blue-400">
                              Confirmed
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 font-bold text-white">Priya Sharma</td>
                          <td className="py-3 text-center font-semibold text-slate-300">2p</td>
                          <td className="py-3 text-center font-mono text-slate-400">20:00</td>
                          <td className="py-3 text-right">
                            <span className="px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                              Checked-In
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 font-bold text-white">Alex Vance</td>
                          <td className="py-3 text-center font-semibold text-slate-300">6p</td>
                          <td className="py-3 text-center font-mono text-slate-400">21:15</td>
                          <td className="py-3 text-right">
                            <span className="px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase bg-orange-500/15 border border-orange-500/30 text-orange-400">
                              Reserved
                            </span>
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Revenue vs Reservations Chart */}
            <div className="bg-[#091124]/90 backdrop-blur-2xl border border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-white">Revenue vs Reservations</h3>
                  <p className="text-[10px] font-mono text-slate-400">Hourly comparison</p>
                </div>
                <select className="h-8 px-2.5 text-xs font-bold rounded-xl border border-slate-800 bg-[#050B18] text-slate-300 outline-none">
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                </select>
              </div>

              {/* Chart SVG Representation */}
              <div className="h-32 w-full flex items-end justify-between gap-2 pt-4 px-2">
                {[35, 50, 45, 80, 95, 60, 85, 70, 90, 65, 40, 75].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="w-full bg-gradient-to-t from-blue-600/30 to-blue-500 group-hover:from-blue-500 group-hover:to-indigo-400 rounded-t transition-all relative shadow-[0_0_8px_rgba(59,130,246,0.3)]" style={{ height: `${h}%` }}>
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-white text-slate-900 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow-lg transition-opacity pointer-events-none z-20">
                        ₹{h * 100}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* ── RIGHT COLUMN (Summary, Revenue Goal, Recent Alerts & Campaign) ── */}
        <div className="lg:col-span-4 space-y-6">

          {/* Today's Summary */}
          <div className="bg-[#091124]/90 backdrop-blur-2xl border border-slate-800/80 rounded-2xl p-5 space-y-3.5 shadow-2xl">
            <h3 className="font-black text-sm text-white flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <BarChart2 className="w-4 h-4 text-blue-400" />
              Today's Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800/40">
                <span className="text-slate-400 font-medium">Peak Demand</span>
                <span className="font-mono font-bold text-white">20:00 - 21:30</span>
              </div>
              <div className="flex items-center justify-between pb-1 border-b border-slate-800/40">
                <span className="text-slate-400 font-medium">Top Dish</span>
                <span className="font-bold text-white">Malabar Biryani</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Avg. Order Value</span>
                <span className="font-mono font-bold text-white">₹1,450</span>
              </div>
            </div>
          </div>

          {/* Revenue Goal Progress */}
          <div className="bg-[#091124]/90 backdrop-blur-2xl border border-slate-800/80 rounded-2xl p-5 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-white">Revenue Goal</h3>
              <span className="text-xs font-mono font-extrabold text-blue-400">68%</span>
            </div>

            <div className="w-full bg-slate-800/80 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full shadow-[0_0_10px_#3b82f6]" style={{ width: '68%' }} />
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
              <span>₹0</span>
              <span className="font-bold text-white">TARGET: ₹1,250,000</span>
            </div>
          </div>

          {/* Recent Alerts Card */}
          <div className="bg-[#091124]/90 backdrop-blur-2xl border border-slate-800/80 rounded-2xl p-5 space-y-3.5 shadow-2xl">
            <h3 className="font-black text-sm text-white border-b border-slate-800/80 pb-3">Recent Alerts</h3>

            <div className="space-y-3">
              {/* Alert 1 */}
              <div className="flex items-start gap-3 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-xs">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Inventory Low</p>
                  <p className="text-[11px] text-slate-300 mt-0.5">Basmati Rice stock below 5kg.</p>
                  <p className="text-[9px] font-mono text-slate-400 mt-1">2 mins ago</p>
                </div>
              </div>

              {/* Alert 2 */}
              <div className="flex items-start gap-3 p-3 rounded-xl border border-blue-500/30 bg-blue-500/10 text-xs">
                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">VIP Booking</p>
                  <p className="text-[11px] text-slate-300 mt-0.5">Mr. Thomas booked Table 15.</p>
                  <p className="text-[9px] font-mono text-slate-400 mt-1">15 mins ago</p>
                </div>
              </div>

              {/* Alert 3 */}
              <div className="flex items-start gap-3 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs">
                <Star className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 fill-amber-400" />
                <div>
                  <p className="font-bold text-white">5 Star Review</p>
                  <p className="text-[11px] text-slate-300 mt-0.5">"Best appam in town!" - Priya</p>
                  <p className="text-[9px] font-mono text-slate-400 mt-1">1 hour ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* Campaign Active Card */}
          <div
            className="rounded-2xl border border-slate-800/80 p-5 bg-cover bg-center relative overflow-hidden min-h-[140px] flex flex-col justify-end text-white shadow-2xl group"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />
            <div className="relative z-10 space-y-1">
              <span className="text-[9px] font-mono font-black tracking-widest uppercase px-2.5 py-1 rounded-lg bg-brand-500 text-white shadow-[0_0_10px_#ff6b35]">
                CAMPAIGN ACTIVE
              </span>
              <h4 className="font-black text-lg tracking-tight text-white pt-1">
                Weekend Brunch Special
              </h4>
            </div>
          </div>

        </div>

      </div>

      {/* ── FOOTER BAR ── */}
      <div className="border-t border-slate-800/80 pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] font-mono text-slate-400">
        <div>V2.4.0 © {new Date().getFullYear()} QUICKBITE PLATFORM</div>
        <div className="flex items-center gap-5">
          <a href="#" className="hover:text-white transition-colors">Support Center</a>
          <a href="#" className="hover:text-white transition-colors">Documentation</a>
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
            <span>SYSTEM ONLINE</span>
          </div>
        </div>
      </div>

    </div>
  );
}
