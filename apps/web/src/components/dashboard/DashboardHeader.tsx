'use client';

import { useState, useEffect } from 'react';
import {
  Search, MapPin, Bell, Download, ChevronDown,
  Command, Settings,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBranches } from '@/hooks/useBranches';
import { useMyRestaurants } from '@/hooks/useRestaurants';
import { usePathname } from 'next/navigation';

const PAGE_LABELS: Record<string, { title: string; sub: string }> = {
  '/dashboard':            { title: 'Command Center',    sub: 'Executive overview of all outlets' },
  '/dashboard/bookings':   { title: 'Reservations',      sub: 'VIP table reservations & walk-ins' },
  '/dashboard/tables':     { title: 'Live Floor Plan',   sub: 'Real-time table occupancy' },
  '/dashboard/menu':       { title: 'Menu Management',   sub: 'Items, categories & pricing' },
  '/dashboard/orders':     { title: 'Live Orders',       sub: 'Active & recent customer orders' },
  '/dashboard/customers':  { title: 'Guest Directory',   sub: 'Customer profiles & history' },
  '/dashboard/staff':      { title: 'Staff Roster',      sub: 'Branch team management' },
  '/dashboard/payments':   { title: 'Payments',          sub: 'Transactions & settlements' },
  '/dashboard/wallet':     { title: 'Wallet',            sub: 'Balance & payout history' },
  '/dashboard/analytics':  { title: 'Analytics',         sub: 'Reports & business intelligence' },
  '/dashboard/settings':   { title: 'Settings',          sub: 'Account & outlet configuration' },
  '/dashboard/promotions': { title: 'Promotions',        sub: 'Offers, coupons & loyalty' },
  '/dashboard/reviews':    { title: 'Guest Reviews',     sub: 'Ratings & reputation management' },
  '/dashboard/branches':   { title: 'Outlets & Branches',sub: 'Multi-branch management hub' },
};

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'RO';
}

function LiveClock() {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    setMounted(true);
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
      setDate(now.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  if (!mounted) return null;

  return (
    <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/3 border border-white/6 text-[11px] font-mono">
      <span className="text-slate-500">{date}</span>
      <span className="text-white/15">·</span>
      <span className="text-amber-300 font-bold">{time}</span>
    </div>
  );
}

export function DashboardHeader() {
  const { branches, selectedBranchId, setSelectedBranchId } = useBranches();
  const { data: restaurants } = useMyRestaurants();
  const { user } = useAuth();
  const pathname = usePathname();

  const page = PAGE_LABELS[pathname] ?? { title: 'Dashboard', sub: 'Owner portal' };
  const restaurant = restaurants?.data?.[0];
  const ownerName = user?.name || restaurant?.ownerName || 'Owner';
  const initials = getInitials(ownerName);

  const [notifOpen, setNotifOpen] = useState(false);

  const notifications = [
    { title: 'New VIP Reservation', sub: 'Downtown — Table for 6 at 20:00', time: '5m ago', dot: 'bg-blue-500' },
    { title: '5-Star Review Received', sub: '"Best dining experience in the city!"', time: '18m ago', dot: 'bg-amber-500' },
    { title: 'Daily Payout Complete', sub: '₹84,250 settled to your account', time: '1h ago', dot: 'bg-emerald-500' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#060A12]/98 backdrop-blur-3xl border-b border-white/5 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
      {/* Gold top accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-7 py-3">

        {/* ── LEFT: Page title ─────────────────────────── */}
        <div className="flex items-center gap-4 min-w-0 shrink-0">
          {/* Live indicator */}
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[9px] font-mono font-black text-emerald-500 uppercase tracking-widest">LIVE</span>
          </div>

          <div className="w-px h-5 bg-white/8 hidden sm:block" />

          <div>
            <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest leading-none hidden md:block">
              {restaurant?.name ?? 'QuickBite'}&nbsp;·&nbsp;Owner Portal
            </p>
            <h1 className="text-sm font-black text-white tracking-tight leading-tight mt-0.5">
              {page.title}
            </h1>
            <p className="text-[10px] text-slate-600 hidden md:block mt-0.5">{page.sub}</p>
          </div>
        </div>

        {/* ── CENTER: Search ───────────────────────────── */}
        <div className="flex-1 max-w-sm hidden md:block">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600 group-focus-within:text-amber-400 transition-colors" />
            <input
              placeholder="Search orders, guests, tables…"
              className="w-full pl-9 pr-14 h-9 rounded-xl border border-white/6 bg-white/3 text-xs text-white placeholder:text-slate-700 focus:outline-none focus:border-amber-500/40 focus:bg-white/5 focus:shadow-[0_0_0_3px_rgba(245,158,11,0.06)] transition-all"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[9px] font-mono text-slate-700 bg-white/5 px-1.5 py-0.5 rounded border border-white/8">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </div>
        </div>

        {/* ── RIGHT: Actions ───────────────────────────── */}
        <div className="flex items-center gap-2 shrink-0">

          <LiveClock />

          {/* Branch selector */}
          <div className="relative hidden sm:block">
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="h-9 pl-8 pr-7 rounded-xl border border-white/6 bg-[#070C18] text-[11px] font-bold text-slate-300 appearance-none cursor-pointer focus:outline-none hover:border-white/12 focus:border-amber-500/30 transition-all"
            >
              <option value="all" className="bg-[#0A1020] text-white">All Outlets</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id} className="bg-[#0A1020] text-white">{b.name}</option>
              ))}
            </select>
            <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-amber-500 pointer-events-none" />
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-600 pointer-events-none" />
          </div>

          <div className="w-px h-6 bg-white/6" />

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/6 transition-all cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 ring-2 ring-[#060A12] shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
            </button>

            {/* Notification dropdown */}
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-80 bg-[#0A0F1C] border border-white/8 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/6 flex items-center justify-between">
                    <p className="text-xs font-black text-white">Notifications</p>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">{notifications.length} new</span>
                  </div>
                  <div className="p-2 space-y-1">
                    {notifications.map((n, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/4 transition-all cursor-pointer">
                        <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${n.dot}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white">{n.title}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5 truncate">{n.sub}</p>
                        </div>
                        <span className="text-[9px] font-mono text-slate-600 shrink-0 pt-0.5">{n.time}</span>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2.5 border-t border-white/6 text-center">
                    <button className="text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer">
                      View all notifications
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Settings shortcut */}
          <button className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/6 transition-all cursor-pointer">
            <Settings className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-white/6" />

          {/* Owner avatar */}
          <div className="flex items-center gap-2.5 cursor-pointer group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center font-black text-[10px] text-white shadow-[0_0_14px_rgba(245,158,11,0.45)] border border-amber-400/20 shrink-0 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.6)] transition-shadow">
              {initials}
            </div>
            <div className="hidden lg:block">
              <p className="text-xs font-bold text-white leading-none">{ownerName}</p>
              <p className="text-[9px] text-amber-500/70 font-mono uppercase tracking-wide leading-none mt-0.5">Owner</p>
            </div>
          </div>

          {/* Export */}
          <button className="hidden sm:flex h-8 px-3 items-center gap-1.5 text-[11px] font-bold bg-amber-500 hover:bg-amber-400 text-[#060A12] rounded-xl shadow-[0_4px_14px_rgba(245,158,11,0.4)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.5)] transition-all cursor-pointer shrink-0">
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>
    </header>
  );
}
