'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Layers,
  Users,
  Settings,
  LogOut,
  Building2,
  ChevronRight,
  ShieldCheck,
  CalendarCheck,
  ChefHat,
  Armchair,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBranches } from '@/hooks/useBranches';

const NAV_ITEMS = [
  { name: 'Branch Overview', href: '/manager', icon: LayoutDashboard },
  { name: 'Live Orders & KDS', href: '/manager/orders', icon: UtensilsCrossed, badge: 'Live' },
  { name: 'Floor Tables', href: '/manager/tables', icon: Armchair },
  { name: 'Reservations', href: '/manager/bookings', icon: CalendarCheck },
  { name: 'Menu Items', href: '/manager/menu', icon: UtensilsCrossed },
  { name: 'Categories', href: '/manager/categories', icon: Layers },
  { name: 'Branch Staff', href: '/manager/staff', icon: Users },
  { name: 'Outlet Settings', href: '/manager/settings', icon: Settings },
];

export function ManagerSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { selectedBranch } = useBranches();

  const branchName = selectedBranch?.name || 'Downtown Branch';
  const branchCode = selectedBranch?.code || 'BR-NY-01';

  return (
    <aside className="w-64 bg-[#050C1F] border-r border-white/8 flex flex-col h-screen sticky top-0 z-50 select-none shadow-2xl">
      {/* Top Brand & Portal Badge */}
      <div className="p-5 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 border border-blue-400/30">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black tracking-tight text-white">QuickBite</span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/15 border border-blue-500/30 text-blue-400 uppercase">
                Manager
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Branch Operations Portal</p>
          </div>
        </div>

        {/* Assigned Branch Banner */}
        <div className="mt-4 p-3 rounded-xl bg-white/4 border border-white/8 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Assigned Outlet</p>
            <p className="text-xs font-bold text-white truncate">{branchName}</p>
          </div>
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0">
            {branchCode}
          </span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <p className="px-3 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-2">
          Management Console
        </p>

        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} />
                  <span>{item.name}</span>
                </div>

                {item.badge && (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30 animate-pulse">
                    {item.badge}
                  </span>
                )}

                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute left-0 w-1 h-6 bg-white rounded-r-full"
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-3 border-t border-white/8 space-y-2">
        <div className="p-3 rounded-xl bg-white/4 border border-white/6 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0 border border-white/10">
              {user?.name?.slice(0, 2).toUpperCase() || 'BM'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Branch Manager'}</p>
              <p className="text-[10px] text-slate-400 font-mono truncate">{user?.email || 'manager@branch.com'}</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => logout()}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
