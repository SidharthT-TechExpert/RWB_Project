'use client';

import { useState } from 'react';
import { Search, MapPin, Bell, HelpCircle, Download, ChevronDown, Command } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useMyRestaurants } from '@/hooks/useRestaurants';
import { usePathname } from 'next/navigation';

const PAGE_LABELS: Record<string, string> = {
  '/dashboard': 'Command Center',
  '/dashboard/bookings': 'Reservations',
  '/dashboard/tables': 'Live Tables',
  '/dashboard/menu': 'Menu Management',
  '/dashboard/categories': 'Categories',
  '/dashboard/orders': 'Live Orders',
  '/dashboard/customers': 'Customers',
  '/dashboard/staff': 'Staff',
  '/dashboard/kitchen': 'Kitchen Display',
  '/dashboard/payments': 'Payments',
  '/dashboard/wallet': 'Wallet',
  '/dashboard/analytics': 'Reports & Analytics',
  '/dashboard/settings': 'Settings',
};

export function DashboardHeader() {
  const [branch, setBranch] = useState('Downtown Branch');
  const { data: restaurants } = useMyRestaurants();
  const restaurant = restaurants?.data?.[0];
  const pathname = usePathname();

  const pageLabel = PAGE_LABELS[pathname] ?? 'Dashboard';
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <header className="sticky top-0 z-40 bg-[#050B18]/98 backdrop-blur-3xl border-b border-white/5 shadow-[0_1px_0_rgba(255,255,255,0.05),0_8px_32px_rgba(0,0,0,0.5)]">
      {/* Subtle top accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-3">

        {/* LEFT: Page title + breadcrumb */}
        <div className="flex items-center gap-4 min-w-0 shrink-0">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-500 uppercase hidden sm:block">LIVE</span>
          </div>
          <div className="w-px h-5 bg-white/10 hidden sm:block" />
          <div>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest leading-none hidden md:block">
              QuickBite / {restaurant?.name ?? 'Restaurant'}
            </p>
            <h1 className="text-sm font-black text-white tracking-tight leading-tight">{pageLabel}</h1>
          </div>
        </div>

        {/* CENTER: Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              placeholder="Search tables, orders, customers…"
              className="pl-9 pr-14 h-9 w-full rounded-xl border border-white/8 bg-white/4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/40 focus:bg-white/6 transition-all"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] font-mono text-slate-600 bg-white/5 px-1.5 py-0.5 rounded border border-white/8">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </div>
        </div>

        {/* RIGHT: branch + time + actions + avatar */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Date + time pill */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/4 border border-white/8 text-[11px] font-mono text-slate-400">
            <span>{dateStr}</span>
            <span className="text-white/20">·</span>
            <span className="text-slate-300 font-bold">{timeStr}</span>
          </div>

          {/* Branch selector */}
          <div className="relative hidden sm:block">
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="h-9 pl-8 pr-7 rounded-xl border border-white/8 bg-white/4 text-[11px] font-bold text-slate-300 appearance-none cursor-pointer focus:outline-none hover:border-white/15 transition-all"
            >
              <option value="Downtown Branch">Downtown</option>
              <option value="Uptown Branch">Uptown</option>
            </select>
            <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-brand-500 pointer-events-none" />
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-500 pointer-events-none" />
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-white/10" />

          {/* Bell */}
          <button className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/8 transition-all">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brand-500 ring-2 ring-[#050B18]" />
          </button>

          {/* Help */}
          <button className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/8 transition-all">
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-white/10" />

          {/* Avatar */}
          <div className="flex items-center gap-2.5 cursor-pointer group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center font-black text-[10px] text-white shadow-[0_0_12px_rgba(255,107,53,0.4)] border border-brand-400/30 shrink-0">
              AR
            </div>
            <div className="hidden lg:block">
              <p className="text-xs font-bold text-white leading-none">Arun</p>
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wide leading-none mt-0.5">Manager</p>
            </div>
          </div>

          {/* Export */}
          <Button size="sm" className="h-8 px-3 text-[11px] font-bold bg-blue-600 hover:bg-blue-500 text-white gap-1.5 rounded-xl shadow-lg transition-all cursor-pointer shrink-0 border-0">
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
