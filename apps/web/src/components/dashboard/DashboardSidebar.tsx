'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarCheck,
  Armchair,
  UtensilsCrossed,
  Layers,
  ShoppingBag,
  Users,
  UserCheck,
  ChefHat,
  CreditCard,
  Wallet,
  BarChart2,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';

interface NavGroup {
  title?: string;
  items: { href: string; label: string; icon: React.ElementType }[];
}

const navGroups: NavGroup[] = [
  {
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/dashboard/bookings', label: 'Reservations', icon: CalendarCheck },
      { href: '/dashboard/tables', label: 'Tables', icon: Armchair },
      { href: '/dashboard/menu', label: 'Menu', icon: UtensilsCrossed },
      { href: '/dashboard/categories', label: 'Categories', icon: Layers },
      { href: '/dashboard/orders', label: 'Orders', icon: ShoppingBag },
      { href: '/dashboard/customers', label: 'Customers', icon: Users },
      { href: '/dashboard/staff', label: 'Staff', icon: UserCheck },
      { href: '/dashboard/kitchen', label: 'Kitchen', icon: ChefHat },
    ],
  },
  {
    title: 'FINANCE & STATS',
    items: [
      { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
      { href: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
      { href: '/dashboard/analytics', label: 'Reports', icon: BarChart2 },
    ],
  },
  {
    title: 'SYSTEM',
    items: [{ href: '/dashboard/settings', label: 'Settings', icon: Settings }],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar automatically when navigating routes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Floating Action Button (visible on mobile/tablet) */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed bottom-5 right-5 z-50 w-12 h-12 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-[0_0_25px_rgba(255,107,53,0.6)] border border-brand-400/50 cursor-pointer active:scale-95 transition-transform"
        aria-label="Toggle navigation menu"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Dark Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/75 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 h-screen flex flex-col bg-[#050B18]/95 backdrop-blur-2xl text-slate-300 border-r border-slate-800/80 transition-all duration-300 z-40 select-none shrink-0 shadow-[10px_0_30px_rgba(0,0,0,0.5)]',
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0',
          collapsed ? 'lg:w-20' : 'lg:w-64'
        )}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/70 flex items-center justify-between">
          {!collapsed || mobileOpen ? (
            <div>
              <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span className="text-brand-500 font-bold drop-shadow-[0_0_12px_rgba(255,107,53,0.4)]">Paragon</span>
                <span>Restaurant</span>
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">
                  MANAGER PORTAL
                </p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center font-black text-lg mx-auto shadow-[0_0_20px_rgba(255,107,53,0.4)]">
              P
            </div>
          )}

          <button
            onClick={() => {
              if (mobileOpen) setMobileOpen(false);
              else setCollapsed(!collapsed);
            }}
            className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-xl hover:bg-slate-800/60"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />}
          </button>
        </div>

        {/* Nav Groups */}
        <nav className="flex-1 p-3 space-y-6 overflow-y-auto custom-scrollbar">
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              {group.title && (!collapsed || mobileOpen) && (
                <p className="px-3 text-[10px] font-mono font-bold text-slate-400/80 tracking-wider uppercase mb-2">
                  {group.title}
                </p>
              )}

              {group.items.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all group relative',
                      isActive
                        ? 'bg-gradient-to-r from-blue-600/30 to-indigo-600/20 text-white border border-blue-500/50 shadow-[0_0_20px_rgba(37,99,235,0.25)]'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                    )}
                  >
                    <Icon className={cn('h-4 w-4 shrink-0 transition-colors', isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200')} />
                    {(!collapsed || mobileOpen) && <span>{label}</span>}
                    {isActive && (!collapsed || mobileOpen) && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_#3b82f6]" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-slate-800/70">
          <button
            onClick={() => {
              setMobileOpen(false);
              logout();
            }}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all w-full"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {(!collapsed || mobileOpen) && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
