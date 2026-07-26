'use client';

import { useState } from 'react';
import {
  Search,
  MapPin,
  Bell,
  HelpCircle,
  Download,
  ChevronDown,
  Command,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useMyRestaurants } from '@/hooks/useRestaurants';
import { usePathname } from 'next/navigation';

// Map of paths to page titles
const PAGE_LABELS: Record<string, string> = {
  '/dashboard': 'Operational Command Center',
  '/dashboard/bookings': 'Reservations',
  '/dashboard/tables': 'Live Table Status',
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
  const { user } = useAuth();
  const { data: restaurants } = useMyRestaurants();
  const restaurant = restaurants?.data?.[0];
  const pathname = usePathname();

  const pageLabel = PAGE_LABELS[pathname] ?? 'Dashboard';
  const managerName = restaurant?.name ? restaurant.name.split(' ')[0] : 'Manager';

  return (
    <header className="sticky top-0 z-40 bg-[#050B18]/98 backdrop-blur-2xl border-b border-slate-800/90 shadow-[0_8px_32px_rgba(0,0,0,0.7)]">
      {/* Ambient glow */}
      <div className="absolute -top-10 left-20 w-72 h-20 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-3.5 relative z-10">

        {/* Left: Live system indicator + page title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse" />
            <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase hidden sm:block">
              LIVE
            </span>
          </div>
          <div className="h-5 w-px bg-slate-800 hidden sm:block" />
          <div className="min-w-0">
            <p className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">
              QuickBite Manager
            </p>
            <h2 className="text-sm font-extrabold text-white leading-tight truncate">
              {pageLabel}
            </h2>
          </div>
        </div>

        {/* Middle: Search + Branch selector */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 max-w-2xl">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              placeholder="Search tables, orders, customers…"
              className="pl-9 pr-12 h-9 w-full rounded-xl border border-slate-800 bg-[#030712] text-xs font-medium text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15 transition-all"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] font-mono text-slate-600 bg-slate-800/60 px-1.5 py-0.5 rounded border border-slate-700/50">
              <Command className="w-2.5 h-2.5" /> K
            </div>
          </div>

          {/* Branch selector */}
          <div className="relative shrink-0">
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="h-9 pl-8 pr-8 rounded-xl border border-slate-800 bg-[#030712] text-xs font-bold text-slate-200 appearance-none cursor-pointer focus:outline-none focus:border-blue-500/60 transition-all"
            >
              <option value="Downtown Branch">Downtown Branch</option>
              <option value="Uptown Branch">Uptown Branch</option>
            </select>
            <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-brand-500 pointer-events-none" />
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Right: Actions + Avatar */}
        <div className="flex items-center gap-2.5 shrink-0">

          {/* Notification bell */}
          <button className="p-2.5 rounded-xl border border-slate-800 bg-[#030712] text-slate-400 hover:text-white hover:border-slate-700 transition-all relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_8px_#ff6b35]" />
          </button>

          {/* Help */}
          <button className="p-2.5 rounded-xl border border-slate-800 bg-[#030712] text-slate-400 hover:text-white hover:border-slate-700 transition-all">
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Divider */}
          <div className="h-8 w-px bg-slate-800" />

          {/* Manager avatar */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white font-black flex items-center justify-center text-[10px] shadow-[0_0_12px_rgba(255,107,53,0.35)] border border-brand-400/40 shrink-0">
              {managerName.slice(0, 4).toUpperCase()}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-white leading-none">{managerName} 👋</p>
              <p className="text-[10px] font-mono font-bold text-slate-500 uppercase mt-0.5 tracking-wider">
                GENERAL MANAGER
              </p>
            </div>
          </div>

          {/* Export */}
          <Button
            size="sm"
            className="h-9 px-3.5 text-xs font-extrabold bg-white hover:bg-slate-100 text-slate-900 gap-1.5 rounded-xl shadow-lg transition-all cursor-pointer shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>

      </div>
    </header>
  );
}
