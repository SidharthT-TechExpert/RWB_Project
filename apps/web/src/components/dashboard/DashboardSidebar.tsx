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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

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
  const { logout, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'sticky top-0 h-screen flex flex-col bg-[#070D1B] text-slate-300 border-r border-slate-800/80 transition-all duration-300 z-30 select-none shrink-0',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/70 flex items-center justify-between">
        {!collapsed ? (
          <div>
            <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              <span className="text-brand-500">Paragon</span>
              <span>Restaurant</span>
            </h1>
            <p className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase mt-0.5">
              MANAGER PORTAL
            </p>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center font-black text-lg mx-auto">
            P
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-500 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-800/50"
        >
          <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 p-3 space-y-6 overflow-y-auto custom-scrollbar">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            {group.title && !collapsed && (
              <p className="px-3 text-[10px] font-mono font-bold text-slate-500 tracking-wider uppercase mb-2">
                {group.title}
              </p>
            )}

            {group.items.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all group relative',
                    isActive
                      ? 'bg-blue-600/20 text-white border border-blue-500/40 shadow-[0_0_15px_rgba(37,99,235,0.2)]'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  )}
                >
                  <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200')} />
                  {!collapsed && <span>{label}</span>}
                  {isActive && !collapsed && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#3b82f6]" />
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
          onClick={() => logout()}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors w-full"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
