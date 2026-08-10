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
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Menu,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentBranch } from '@/hooks/useBranches';
import { useManagerSidebar } from '@/context/ManagerSidebarContext';
import { cn } from '@/lib/utils';

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
  const currentBranch = useCurrentBranch();
  const { mobileOpen, setMobileOpen, collapsed, toggleCollapsed } = useManagerSidebar();

  const branchName = currentBranch?.name || 'Assigned Outlet';
  const branchCode = currentBranch?.code || 'OUTLET';

  const isExpanded = mobileOpen || !collapsed;

  return (
    <>
      {/* ── Mobile Floating Menu Trigger (FAB) ───────────────────────── */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle Navigation Menu"
        className="lg:hidden fixed bottom-6 right-6 z-50 w-13 h-13 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-[0_0_25px_rgba(37,99,235,0.6)] border border-blue-400/40 active:scale-95 transition-transform cursor-pointer"
      >
        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* ── Mobile Overlay Backdrop ──────────────────────────────────── */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
        />
      )}

      {/* ── Sidebar Shell ── */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 h-screen flex flex-col z-50 shrink-0 select-none transition-all duration-300 ease-in-out',
          'bg-[#04091a] border-r border-white/[0.06]',
          'shadow-[4px_0_30px_rgba(0,0,0,0.6)]',
          mobileOpen ? 'translate-x-0 w-72 max-w-[85vw]' : '-translate-x-full lg:translate-x-0',
          collapsed ? 'lg:w-[76px]' : 'lg:w-64',
        )}
      >
        {/* Top Brand */}
        <div className={cn('px-4 py-5 border-b border-white/[0.06]', !isExpanded && 'px-2.5 flex flex-col items-center')}>
          <div className={cn('flex items-center justify-between', !isExpanded && 'justify-center w-full')}>
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 border border-blue-400/20 shrink-0">
                <ChefHat className="w-5 h-5" />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#04091a]" />
              </div>
              {isExpanded && (
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black tracking-tight text-white">QuickBite</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-gradient-to-r from-blue-600/30 to-indigo-600/30 border border-blue-500/30 text-blue-300 uppercase tracking-wide">
                      Manager
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">Operations Portal</p>
                </div>
              )}
            </div>
            <button
              onClick={toggleCollapsed}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-all"
              title={collapsed ? 'Expand' : 'Collapse'}
            >
              {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          </div>

          {/* Branch Banner */}
          {isExpanded && (
            <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-blue-500/8 to-indigo-500/8 border border-blue-500/15 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Assigned Outlet</p>
                <p className="text-xs font-bold text-white truncate mt-0.5">{branchName}</p>
              </div>
              <span className="text-[9px] font-mono font-black px-2 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 shrink-0 tracking-wider">
                {branchCode}
              </span>
            </div>
          )}
        </div>

        {/* Nav Menu */}
        <nav className="flex-1 px-2.5 py-4 space-y-0.5 overflow-y-auto">
          {isExpanded && (
            <p className="px-3 text-[9px] font-mono font-black text-slate-600 uppercase tracking-[0.2em] mb-3">
              Management Console
            </p>
          )}

          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                <div
                  title={!isExpanded ? item.name : undefined}
                  className={cn(
                    'relative flex items-center rounded-xl text-xs font-bold transition-all duration-200 group cursor-pointer overflow-hidden',
                    isExpanded ? 'justify-between px-3.5 py-2.5' : 'justify-center p-3 mb-0.5',
                    isActive
                      ? 'bg-gradient-to-r from-blue-600/90 to-indigo-600/80 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.06]',
                  )}
                >
                  {/* Active background glow */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent pointer-events-none" />
                  )}

                  <div className="flex items-center gap-3 relative">
                    <Icon className={cn('w-4 h-4 shrink-0 transition-colors', isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400')} />
                    {isExpanded && <span className="truncate">{item.name}</span>}
                  </div>

                  {isExpanded && item.badge && (
                    <span className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                      {item.badge}
                    </span>
                  )}

                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicatorManager"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-white rounded-r-full shadow-[0_0_8px_white]"
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer / User Profile */}
        <div className={cn('p-3 border-t border-white/[0.06] space-y-2', !isExpanded && 'px-2 flex flex-col items-center')}>
          {isExpanded ? (
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center gap-2.5">
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-xs flex items-center justify-center border border-white/10">
                  {user?.name?.slice(0, 2).toUpperCase() || 'BM'}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#04091a]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{user?.name || 'Branch Manager'}</p>
                <p className="text-[10px] text-slate-500 font-mono truncate">{user?.email || 'manager@branch.com'}</p>
              </div>
            </div>
          ) : (
            <div
              className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-xs flex items-center justify-center border border-white/10"
              title={user?.name || 'Branch Manager'}
            >
              {user?.name?.slice(0, 2).toUpperCase() || 'BM'}
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#04091a]" />
            </div>
          )}

          <button
            onClick={() => logout()}
            className={cn(
              'w-full flex items-center justify-center gap-2 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/8 hover:bg-rose-500/18 border border-rose-500/15 hover:border-rose-500/30 transition-all cursor-pointer',
              isExpanded ? 'px-3 py-2' : 'p-2.5',
            )}
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            {isExpanded && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

