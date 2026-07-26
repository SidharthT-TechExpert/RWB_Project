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
  Play,
  ChevronDown,
  Sparkles,
  BarChart2,
} from 'lucide-react';
import api from '@/lib/api';
import { useMyRestaurants } from '@/hooks/useRestaurants';
import { Badge } from '@/components/ui/Badge';
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
  occupied: { label: 'Occupied', bg: 'bg-blue-50/80 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-600' },
  reserved: { label: 'Reserved', bg: 'bg-orange-50/80 dark:bg-orange-950/30', border: 'border-orange-200 dark:border-orange-800', text: 'text-orange-600 dark:text-orange-400', dot: 'bg-orange-600' },
  available: { label: 'Available', bg: 'bg-emerald-50/80 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-600' },
  cleaning: { label: 'Cleaning', bg: 'bg-amber-50/80 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
};

export default function DashboardHomePage() {
  const [tables, setTables] = useState<TableStatus[]>(INITIAL_TABLES);
  const [tableFilter, setTableFilter] = useState<string>('all');
  const [branch, setBranch] = useState('Downtown Branch');

  const { data: restaurants } = useMyRestaurants();
  const restaurant = restaurants?.data?.[0];
  const restaurantId = restaurant?._id;

  // Real bookings
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
    <div className="space-y-6 pb-12 font-sans select-none">

      {/* ── TOP COMMAND BAR ── */}
      <div className="bg-card border rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Title */}
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span>QuickBite Manager - Operational Command Center</span>
        </div>

        {/* Middle Search & Branch Selector */}
        <div className="flex flex-wrap items-center gap-3 flex-1 max-w-xl">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search tables, orders, or customers..."
              className="pl-9 h-9 w-full rounded-xl border bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="relative">
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="h-9 pl-8 pr-8 rounded-xl border bg-background text-xs font-semibold appearance-none cursor-pointer focus:outline-none"
            >
              <option value="Downtown Branch">📍 Downtown Branch</option>
              <option value="Uptown Branch">📍 Uptown Branch</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Right Actions & Manager Profile */}
        <div className="flex items-center gap-3 shrink-0">
          <button className="p-2 rounded-xl border bg-background text-muted-foreground hover:text-foreground relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500" />
          </button>

          <button className="p-2 rounded-xl border bg-background text-muted-foreground hover:text-foreground">
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Manager Avatar */}
          <div className="flex items-center gap-2.5 pl-2 border-l">
            <div className="w-8 h-8 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center text-xs shadow-sm">
              Arun
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-foreground leading-none">Arun 👋</p>
              <p className="text-[10px] text-muted-foreground font-mono uppercase mt-0.5">GENERAL MANAGER</p>
            </div>
          </div>

          {/* Export Button */}
          <Button size="sm" className="h-9 px-3 text-xs font-bold bg-foreground text-background hover:bg-foreground/90 gap-1.5 rounded-xl ml-2">
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* ── GREETING & KPI CARDS ── */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            Good Morning, Arun <span className="animate-bounce inline-block">👋</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Here is what's happening at <strong className="text-foreground font-bold">{restaurant?.name || 'Paragon Restaurant'}</strong> today.
          </p>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Today's Reservations */}
          <div className="p-5 rounded-2xl border bg-card shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Today's Reservations</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <PhoneCall className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="text-3xl font-black text-foreground">128</div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+12% vs yest.</span>
            </div>
          </div>

          {/* Card 2: Table Occupancy */}
          <div className="p-5 rounded-2xl border bg-card shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Table Occupancy</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Armchair className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="text-3xl font-black text-foreground">82%</div>
            <div className="w-full bg-muted h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: '82%' }} />
            </div>
          </div>

          {/* Card 3: Available Tables */}
          <div className="p-5 rounded-2xl border bg-card shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Available Tables</span>
              <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                <Calendar className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="text-3xl font-black text-foreground">08</div>
            <div className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-2">
              Critical focus needed
            </div>
          </div>

          {/* Card 4: Daily Revenue */}
          <div className="p-5 rounded-2xl border bg-card shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Daily Revenue</span>
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <Wallet className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="text-3xl font-black text-foreground">₹84,250</div>
            <div className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>^ 18% target met</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT GRID (Left Command Column + Right Operational Column) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── LEFT COLUMN (Tables & Charts) ── */}
        <div className="lg:col-span-8 space-y-6">

          {/* Live Table Status Grid */}
          <div className="bg-card border rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
              <h2 className="font-extrabold text-lg text-foreground flex items-center gap-2">
                <Armchair className="w-5 h-5 text-brand-500" />
                Live Table Status
              </h2>

              {/* Status Filter Badges */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
                <button
                  onClick={() => setTableFilter('occupied')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${tableFilter === 'occupied' ? 'bg-blue-600 text-white border-blue-600' : 'bg-background text-muted-foreground'}`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                  <span>OCCUPIED</span>
                </button>
                <button
                  onClick={() => setTableFilter('reserved')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${tableFilter === 'reserved' ? 'bg-orange-600 text-white border-orange-600' : 'bg-background text-muted-foreground'}`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-600 inline-block" />
                  <span>RESERVED</span>
                </button>
                <button
                  onClick={() => setTableFilter('available')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${tableFilter === 'available' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-background text-muted-foreground'}`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                  <span>AVAILABLE</span>
                </button>
                <button
                  onClick={() => setTableFilter('cleaning')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${tableFilter === 'cleaning' ? 'bg-amber-500 text-white border-amber-500' : 'bg-background text-muted-foreground'}`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  <span>CLEANING</span>
                </button>
                {tableFilter !== 'all' && (
                  <button onClick={() => setTableFilter('all')} className="text-xs text-brand-500 underline ml-1">
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Table Grid Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
              {filteredTables.map((t) => {
                const style = STATUS_STYLES[t.status];
                return (
                  <motion.div
                    key={t.id}
                    whileHover={{ scale: 1.04 }}
                    className={`p-3 rounded-xl border ${style.bg} ${style.border} flex flex-col items-center justify-center text-center space-y-1.5 shadow-2xs cursor-pointer transition-all`}
                  >
                    <span className="text-xs font-mono font-bold text-muted-foreground">{t.number}</span>
                    <Armchair className={`w-5 h-5 ${style.text}`} />
                    <span className={`text-[10px] font-extrabold uppercase ${style.text}`}>{style.label}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Bottom Split: Today's Reservations Table & Revenue Chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Today's Reservations */}
            <div className="bg-card border rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-extrabold text-base text-foreground">Today's Reservations</h3>
                <a href="/dashboard/bookings" className="text-xs font-bold text-blue-600 hover:underline">
                  View All
                </a>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="text-muted-foreground border-b text-[10px] uppercase font-mono tracking-wider">
                    <tr>
                      <th className="text-left pb-2 font-bold">CUSTOMER</th>
                      <th className="text-center pb-2 font-bold">GUESTS</th>
                      <th className="text-center pb-2 font-bold">TIME</th>
                      <th className="text-right pb-2 font-bold">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {todayBookings?.data?.length > 0 ? (
                      todayBookings.data.map((b: any) => (
                        <tr key={b._id} className="hover:bg-muted/30">
                          <td className="py-2.5 font-bold text-foreground">{b.bookingNumber}</td>
                          <td className="py-2.5 text-center font-semibold text-muted-foreground">{b.guestCount}p</td>
                          <td className="py-2.5 text-center font-mono text-muted-foreground">{b.reservationTime}</td>
                          <td className="py-2.5 text-right">
                            <span className="px-2 py-0.5 rounded-md font-bold text-[10px] uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <>
                        <tr className="hover:bg-muted/30">
                          <td className="py-2.5 font-bold text-foreground">Mr. Thomas</td>
                          <td className="py-2.5 text-center font-semibold text-muted-foreground">4p</td>
                          <td className="py-2.5 text-center font-mono text-muted-foreground">19:30</td>
                          <td className="py-2.5 text-right">
                            <span className="px-2 py-0.5 rounded-md font-bold text-[10px] uppercase bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
                              Confirmed
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-muted/30">
                          <td className="py-2.5 font-bold text-foreground">Priya Sharma</td>
                          <td className="py-2.5 text-center font-semibold text-muted-foreground">2p</td>
                          <td className="py-2.5 text-center font-mono text-muted-foreground">20:00</td>
                          <td className="py-2.5 text-right">
                            <span className="px-2 py-0.5 rounded-md font-bold text-[10px] uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                              Checked-In
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-muted/30">
                          <td className="py-2.5 font-bold text-foreground">Alex Vance</td>
                          <td className="py-2.5 text-center font-semibold text-muted-foreground">6p</td>
                          <td className="py-2.5 text-center font-mono text-muted-foreground">21:15</td>
                          <td className="py-2.5 text-right">
                            <span className="px-2 py-0.5 rounded-md font-bold text-[10px] uppercase bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400">
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
            <div className="bg-card border rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-foreground">Revenue vs Reservations</h3>
                  <p className="text-[10px] text-muted-foreground">Hourly comparison</p>
                </div>
                <select className="h-7 px-2 text-xs font-semibold rounded-lg border bg-background outline-none">
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                </select>
              </div>

              {/* Chart SVG Representation */}
              <div className="h-32 w-full flex items-end justify-between gap-2 pt-4 px-2">
                {[35, 50, 45, 80, 95, 60, 85, 70, 90, 65, 40, 75].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="w-full bg-blue-600/20 group-hover:bg-blue-600 rounded-t transition-all relative" style={{ height: `${h}%` }}>
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-foreground text-background text-[9px] font-mono px-1 rounded transition-opacity">
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
          <div className="bg-card border rounded-2xl p-5 space-y-3.5 shadow-sm">
            <h3 className="font-extrabold text-sm text-foreground flex items-center gap-1.5 border-b pb-2.5">
              <BarChart2 className="w-4 h-4 text-blue-600" />
              Today's Summary
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Peak Demand</span>
                <span className="font-mono font-bold text-foreground">20:00 - 21:30</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Top Dish</span>
                <span className="font-bold text-foreground">Malabar Biryani</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Avg. Order Value</span>
                <span className="font-mono font-bold text-foreground">₹1,450</span>
              </div>
            </div>
          </div>

          {/* Revenue Goal Progress */}
          <div className="bg-card border rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-foreground">Revenue Goal</h3>
              <span className="text-xs font-mono font-extrabold text-blue-600">68%</span>
            </div>

            <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: '68%' }} />
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground pt-1">
              <span>₹0</span>
              <span className="font-bold text-foreground">TARGET: ₹1,250,000</span>
            </div>
          </div>

          {/* Recent Alerts Card */}
          <div className="bg-card border rounded-2xl p-5 space-y-3.5 shadow-sm">
            <h3 className="font-extrabold text-sm text-foreground border-b pb-2.5">Recent Alerts</h3>

            <div className="space-y-3">
              {/* Alert 1 */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl border border-red-200 dark:border-red-950 bg-red-50/50 dark:bg-red-950/20 text-xs">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-foreground">Inventory Low</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Basmati Rice stock below 5kg.</p>
                  <p className="text-[9px] font-mono text-muted-foreground mt-1">2 mins ago</p>
                </div>
              </div>

              {/* Alert 2 */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl border border-blue-200 dark:border-blue-950 bg-blue-50/50 dark:bg-blue-950/20 text-xs">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-foreground">VIP Booking</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Mr. Thomas booked Table 15.</p>
                  <p className="text-[9px] font-mono text-muted-foreground mt-1">15 mins ago</p>
                </div>
              </div>

              {/* Alert 3 */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl border border-amber-200 dark:border-amber-950 bg-amber-50/50 dark:bg-amber-950/20 text-xs">
                <Star className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 fill-amber-500" />
                <div>
                  <p className="font-bold text-foreground">5 Star Review</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">"Best appam in town!" - Priya</p>
                  <p className="text-[9px] font-mono text-muted-foreground mt-1">1 hour ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* Campaign Active Card */}
          <div
            className="rounded-2xl border p-5 bg-cover bg-center relative overflow-hidden min-h-[130px] flex flex-col justify-end text-white shadow-md group"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            <div className="relative z-10 space-y-1">
              <span className="text-[9px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-brand-500 text-white">
                CAMPAIGN ACTIVE
              </span>
              <h4 className="font-black text-base tracking-tight text-white pt-1">
                Weekend Brunch Special
              </h4>
            </div>
          </div>

        </div>

      </div>

      {/* ── FOOTER BAR ── */}
      <div className="border-t pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-muted-foreground">
        <div>V2.4.0 © 2024 QUICKBITE PLATFORM</div>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-foreground transition-colors">Support Center</a>
          <a href="#" className="hover:text-foreground transition-colors">Documentation</a>
          <div className="flex items-center gap-1.5 text-emerald-500 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>SYSTEM ONLINE</span>
          </div>
        </div>
      </div>

    </div>
  );
}
