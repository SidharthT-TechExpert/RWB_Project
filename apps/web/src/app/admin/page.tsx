'use client';

import { useState } from 'react';
import {
  Store,
  Users,
  TrendingUp,
  Ticket,
  Sparkles,
  Download,
  Filter,
  ShieldAlert,
  Clock,
  Server,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [timeframe, setTimeframe] = useState<'Daily' | 'Monthly' | 'Yearly'>('Daily');

  return (
    <div className="space-y-6 font-sans select-none pb-12">
      {/* ── ROW 1: WELCOME HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0A1227]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl shadow-sm dark:shadow-xl transition-colors duration-200">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome back, Admin 👋
            </h1>
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-mono font-bold px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              ALL SYSTEMS OPERATIONAL
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            • Jul 20, 2026, 10:39:08 IST
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 px-4 py-2 rounded-xl text-xs font-semibold transition-colors shadow-sm">
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Export Report</span>
          </button>

          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Insights</span>
          </button>
        </div>
      </div>

      {/* ── MAIN 2-COLUMN GRID (Content 8 cols / Side 4 cols) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT / MAIN SECTION (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">

          {/* ── KPI METRIC CARDS (5 Cards Grid) ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
            
            {/* Card 1: RESTAURANTS */}
            <div className="bg-white dark:bg-[#0A1227]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-blue-500/40 transition-all shadow-sm">
              <div className="flex items-start justify-between">
                <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-xl">
                  <Store className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                  +12%
                </span>
              </div>
              <div className="mt-3">
                <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest block">
                  RESTAURANTS
                </span>
                <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5 block">
                  1,250
                </span>
              </div>
              {/* SVG Sparkline */}
              <div className="h-6 mt-2">
                <svg className="w-full h-full text-blue-500/40" viewBox="0 0 100 30" fill="none">
                  <path d="M0 25 Q25 15 50 20 T100 5" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              </div>
            </div>

            {/* Card 2: PENDING REQ. */}
            <div className="bg-white dark:bg-[#0A1227]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-orange-500/40 transition-all shadow-sm">
              <div className="flex items-start justify-between">
                <div className="p-2 bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 rounded-xl">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold text-orange-600 dark:text-orange-400 bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.5 rounded">
                  High Priority
                </span>
              </div>
              <div className="mt-3">
                <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest block">
                  PENDING REQ.
                </span>
                <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5 block">
                  18
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 mt-2 block">
                Last 24h: <span className="text-slate-700 dark:text-slate-300">12 new</span>
              </span>
            </div>

            {/* Card 3: ACTIVE USERS */}
            <div className="bg-white dark:bg-[#0A1227]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-indigo-500/40 transition-all shadow-sm">
              <div className="flex items-start justify-between">
                <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 rounded-xl">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                  +4.2%
                </span>
              </div>
              <div className="mt-3">
                <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest block">
                  ACTIVE USERS
                </span>
                <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5 block">
                  82.5k
                </span>
              </div>
              {/* SVG Sparkline */}
              <div className="h-6 mt-2">
                <svg className="w-full h-full text-indigo-500/40" viewBox="0 0 100 30" fill="none">
                  <path d="M0 20 Q30 25 60 10 T100 8" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              </div>
            </div>

            {/* Card 4: DAILY REVENUE */}
            <div className="bg-white dark:bg-[#0A1227]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/40 transition-all shadow-sm">
              <div className="flex items-start justify-between">
                <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                  +15.2%
                </span>
              </div>
              <div className="mt-3">
                <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest block">
                  DAILY REVENUE
                </span>
                <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5 block">
                  ₹4.72L
                </span>
              </div>
              {/* SVG Sparkline */}
              <div className="h-6 mt-2">
                <svg className="w-full h-full text-emerald-500/40" viewBox="0 0 100 30" fill="none">
                  <path d="M0 28 Q40 10 70 18 T100 2" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              </div>
            </div>

            {/* Card 5: AVG TICKET */}
            <div className="bg-white dark:bg-[#0A1227]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-amber-500/40 transition-all shadow-sm">
              <div className="flex items-start justify-between">
                <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-xl">
                  <Ticket className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                  Stable
                </span>
              </div>
              <div className="mt-3">
                <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest block">
                  AVG TICKET
                </span>
                <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5 block">
                  ₹1,450
                </span>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <div className="flex -space-x-1">
                  <div className="w-4 h-4 rounded-full bg-blue-500 border border-white dark:border-slate-900" />
                  <div className="w-4 h-4 rounded-full bg-emerald-500 border border-white dark:border-slate-900" />
                  <div className="w-4 h-4 rounded-full bg-indigo-500 border border-white dark:border-slate-900" />
                </div>
                <span className="text-[9px] font-mono text-slate-500">Real-time</span>
              </div>
            </div>

          </div>

          {/* ── INFRASTRUCTURE HEALTH CHIPS ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2.5">
            <div className="bg-white dark:bg-[#070D1F] border border-slate-200 dark:border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between font-mono text-[11px] shadow-sm">
              <span className="text-slate-600 dark:text-slate-400">CORE API</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                24ms 99.9% <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              </span>
            </div>

            <div className="bg-white dark:bg-[#070D1F] border border-slate-200 dark:border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between font-mono text-[11px] shadow-sm">
              <span className="text-slate-600 dark:text-slate-400">DATABASE</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                1.2% load <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              </span>
            </div>

            <div className="bg-white dark:bg-[#070D1F] border border-slate-200 dark:border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between font-mono text-[11px] shadow-sm">
              <span className="text-slate-600 dark:text-slate-400">PAYMENT GW</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                Online Secure <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              </span>
            </div>

            <div className="bg-white dark:bg-[#070D1F] border border-slate-200 dark:border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between font-mono text-[11px] shadow-sm">
              <span className="text-slate-600 dark:text-slate-400">SMS ENGINE</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                Active 800/m <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              </span>
            </div>

            <div className="bg-white dark:bg-[#070D1F] border border-slate-200 dark:border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between font-mono text-[11px] shadow-sm">
              <span className="text-slate-600 dark:text-slate-400">WHATSAPP</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
                Standby 1.2s <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
              </span>
            </div>
          </div>

          {/* ── SPLIT ROW: ANALYTICS GRAPH & PENDING APPROVALS ── */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* Left Graph (7 cols) */}
            <div className="xl:col-span-7 bg-white dark:bg-[#0A1227]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between relative shadow-sm dark:shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    Revenue & Booking Intelligence
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Comparative analysis across platform nodes
                  </p>
                </div>

                <div className="flex items-center bg-slate-100 dark:bg-[#060B18] border border-slate-200 dark:border-slate-800 rounded-xl p-1 font-mono text-[10px]">
                  {(['Daily', 'Monthly', 'Yearly'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setTimeframe(mode)}
                      className={cn(
                        'px-2.5 py-1 rounded-lg font-bold transition-all',
                        timeframe === mode
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      )}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart SVG Canvas */}
              <div className="w-full h-56 relative flex items-end">
                <svg className="w-full h-full text-blue-500 overflow-visible" viewBox="0 0 500 200" fill="none">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  <path
                    d="M 0 170 Q 120 150 250 80 T 500 40 L 500 200 L 0 200 Z"
                    fill="url(#chartGradient)"
                  />
                  <path
                    d="M 0 170 Q 120 150 250 80 T 500 40"
                    stroke="#3B82F6"
                    strokeWidth="3.5"
                    fill="none"
                  />
                  <circle cx="250" cy="80" r="5" fill="#60A5FA" className="animate-ping" />
                  <circle cx="250" cy="80" r="4" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="2" />
                </svg>
              </div>
            </div>

            {/* Right Pending Approvals (5 cols) */}
            <div className="xl:col-span-5 bg-white dark:bg-[#0A1227]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-sm dark:shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Pending Approvals
                </h3>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  Queue: 18
                </span>
              </div>

              <div className="space-y-3 my-auto">
                {/* Approval Item 1 */}
                <div className="bg-slate-50 dark:bg-[#070D1F] border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold shrink-0 overflow-hidden border border-slate-300 dark:border-slate-700">
                      <Store className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">The Coastal Diner</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">New Merchant • Mangalore, KA</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button className="bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors shadow-sm">
                      Approve
                    </button>
                    <button className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 transition-colors">
                      Details
                    </button>
                  </div>
                </div>

                {/* Approval Item 2 */}
                <div className="bg-slate-50 dark:bg-[#070D1F] border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold shrink-0 text-xs font-mono">
                      SM
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">S. Malhotra</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Verification Req • Staff Manager</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button className="bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors shadow-sm">
                      Verify
                    </button>
                    <button className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 transition-colors">
                      Skip
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ── DATA TABLE: GLOBAL RESERVATION LEDGER ── */}
          <div className="bg-white dark:bg-[#0A1227]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-sm dark:shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Global Reservation Ledger
              </h3>
              <div className="flex items-center gap-2">
                <button className="p-1.5 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700/80 transition-colors">
                  <Filter className="w-3.5 h-3.5" />
                </button>
                <button className="bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 transition-colors">
                  Export CSV
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    <th className="pb-3">TRANSACTION ID</th>
                    <th className="pb-3">CUSTOMER DETAILS</th>
                    <th className="pb-3">VENUE</th>
                    <th className="pb-3">PARTY INFO</th>
                    <th className="pb-3">STATUS</th>
                    <th className="pb-3 text-right">SETTLEMENT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-xs">
                  {/* Row 1 */}
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 font-mono font-bold text-blue-600 dark:text-blue-400">#TX-99021</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-[10px] font-mono">
                          RJ
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">Rahul Joshi</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">+91 98XXX XXX10</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 font-semibold text-slate-700 dark:text-slate-300">Paragon Gourmet</td>
                    <td className="py-3 font-mono text-slate-500 dark:text-slate-400">4 Guests • 21:00</td>
                    <td className="py-3">
                      <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                        Confirmed
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-slate-900 dark:text-white">₹4,250.00</td>
                  </tr>

                  {/* Row 2 */}
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 font-mono font-bold text-blue-600 dark:text-blue-400">#TX-99022</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-[10px] font-mono">
                          AS
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">Amelia Smith</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">amelia.s@outlook.com</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 font-semibold text-slate-700 dark:text-slate-300">Rahmath Hotel</td>
                    <td className="py-3 font-mono text-slate-500 dark:text-slate-400">2 Guests • 19:30</td>
                    <td className="py-3">
                      <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                        Pending
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-slate-900 dark:text-white">₹2,100.00</td>
                  </tr>

                  {/* Row 3 */}
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 font-mono font-bold text-blue-600 dark:text-blue-400">#TX-99023</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold flex items-center justify-center text-[10px] font-mono">
                          VS
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">Vikram Sharma</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">vikram.s@gmail.com</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 font-semibold text-slate-700 dark:text-slate-300">Royal Spice</td>
                    <td className="py-3 font-mono text-slate-500 dark:text-slate-400">6 Guests • 20:15</td>
                    <td className="py-3">
                      <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                        Confirmed
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-slate-900 dark:text-white">₹8,900.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* RIGHT SIDEBAR PANEL (4 COLS) */}
        <div className="lg:col-span-4 space-y-6">

          {/* ── TODAY'S SUMMARY ── */}
          <div className="bg-white dark:bg-[#0A1227]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-sm dark:shadow-lg">
            <h3 className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              TODAY'S SUMMARY
            </h3>

            {/* Revenue Goal */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">Revenue Goal</span>
                <span className="text-blue-600 dark:text-blue-400 font-mono font-bold">78%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full w-[78%] shadow-sm shadow-blue-500" />
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono text-right">
                ₹4.7L / ₹6.0L daily target
              </p>
            </div>

            {/* Booking Volume */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800/60">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">Booking Volume</span>
                <span className="text-orange-600 dark:text-orange-400 font-mono font-bold">92%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full w-[92%] shadow-sm shadow-orange-500" />
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono text-right">
                4,328 / 4,700 reservations
              </p>
            </div>
          </div>

          {/* ── SECURITY ALERTS ── */}
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-500/30 rounded-2xl p-5 space-y-3 shadow-sm dark:shadow-lg">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest">
                SECURITY ALERTS
              </h3>
            </div>

            <div className="space-y-2 text-xs font-medium">
              <div className="bg-red-500/10 border border-red-200 dark:border-red-500/20 p-2.5 rounded-xl text-slate-800 dark:text-slate-200">
                <div className="font-bold text-red-600 dark:text-red-400 flex items-center justify-between">
                  <span>Failed Login Attempt</span>
                  <span className="text-[9px] font-mono text-slate-400">Just now</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  IP: 192.168.1.45 • Bangalore
                </p>
              </div>

              <div className="bg-red-500/10 border border-red-200 dark:border-red-500/20 p-2.5 rounded-xl text-slate-800 dark:text-slate-200">
                <div className="font-bold text-red-600 dark:text-red-400 flex items-center justify-between">
                  <span>Multiple Session Isolation</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  User ID: #USR-882 (Restricted)
                </p>
              </div>
            </div>
          </div>

          {/* ── PLATFORM HEALTH ── */}
          <div className="bg-white dark:bg-[#0A1227]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 space-y-3 shadow-sm dark:shadow-lg">
            <h3 className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              PLATFORM HEALTH
            </h3>

            <div className="space-y-2">
              <div className="bg-slate-50 dark:bg-[#070D1F] border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Core Infrastructure</span>
                <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  OPTIMAL
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-[#070D1F] border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Search Indexing</span>
                <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                  DELAYED
                </span>
              </div>
            </div>
          </div>

          {/* ── UPCOMING MAINTENANCE ── */}
          <div className="bg-gradient-to-b from-blue-50 to-indigo-50/50 dark:from-[#0A1227] dark:to-[#0D1836] border border-blue-200 dark:border-blue-500/30 rounded-2xl p-5 space-y-3 shadow-sm dark:shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Server className="w-4 h-4 shrink-0" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest">
                UPCOMING MAINTENANCE
              </h3>
            </div>

            <div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Node JS Update (v22.x)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                Oct 25, 2026 • 02:00 AM IST
              </p>
            </div>

            <button className="w-full bg-blue-600/10 dark:bg-blue-600/20 hover:bg-blue-600/20 dark:hover:bg-blue-600/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/40 py-2 rounded-xl text-xs font-bold transition-all shadow-sm">
              Reschedule
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
