'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, CalendarCheck, Armchair, UtensilsCrossed,
  Layers, ShoppingBag, Users, UserCheck, ChefHat,
  CreditCard, Wallet, BarChart2, Settings, LogOut, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { useMyRestaurants } from '@/hooks/useRestaurants';

interface NavItem { href: string; label: string; icon: React.ElementType; badge?: string }
interface NavGroup { title?: string; items: NavItem[] }

const navGroups: NavGroup[] = [
  {
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/dashboard/bookings', label: 'Reservations', icon: CalendarCheck, badge: '12' },
      { href: '/dashboard/tables', label: 'Tables', icon: Armchair },
      { href: '/dashboard/menu', label: 'Menu', icon: UtensilsCrossed },
      { href: '/dashboard/categories', label: 'Categories', icon: Layers },
      { href: '/dashboard/orders', label: 'Orders', icon: ShoppingBag, badge: '3' },
      { href: '/dashboard/customers', label: 'Customers', icon: Users },
      { href: '/dashboard/staff', label: 'Staff', icon: UserCheck },
      { href: '/dashboard/kitchen', label: 'Kitchen', icon: ChefHat },
    ],
  },
  {
    title: 'Finance',
    items: [
      { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
      { href: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
      { href: '/dashboard/analytics', label: 'Reports', icon: BarChart2 },
    ],
  },
  {
    title: 'System',
    items: [{ href: '/dashboard/settings', label: 'Settings', icon: Settings }],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { data: restaurants } = useMyRestaurants();
  const restaurant = restaurants?.data?.[0];
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const isExpanded = mobileOpen || !collapsed;

  return (
    <>
      {/* Mobile FAB */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.5)] border border-blue-500/30 active:scale-95 transition-transform"
      >
        {mobileOpen
          ? <PanelLeftClose className="w-5 h-5" />
          : <PanelLeftOpen className="w-5 h-5" />
        }
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed lg:sticky top-0 left-0 h-screen flex flex-col z-40 shrink-0 transition-all duration-300 ease-in-out',
        'bg-[#050B18] border-r border-white/5',
        mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0',
        collapsed ? 'lg:w-[72px]' : 'lg:w-60',
      )}>

        {/* Logo */}
        <div className={cn('flex items-center border-b border-white/5 py-4', isExpanded ? 'px-5 gap-3' : 'px-0 justify-center')}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shrink-0 shadow-[0_0_16px_rgba(255,107,53,0.35)]">
            <span className="text-white font-black text-sm">Q</span>
          </div>
          {isExpanded && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-white truncate">{restaurant?.name ?? 'Restaurant'}</p>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Manager Portal</p>
            </div>
          )}
          <button
            onClick={() => collapsed ? setCollapsed(false) : setCollapsed(true)}
            className="ml-auto text-slate-600 hover:text-slate-300 transition-colors hidden lg:block p-1 rounded-lg hover:bg-white/5"
          >
            {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden space-y-4 custom-scrollbar">
          {navGroups.map((group, idx) => (
            <div key={idx}>
              {group.title && isExpanded && (
                <p className="px-4 mb-1 text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest">
                  {group.title}
                </p>
              )}
              {group.title && !isExpanded && (
                <div className="mx-auto w-8 h-px bg-white/8 my-2" />
              )}
              <div className="space-y-0.5 px-2">
                {group.items.map(({ href, label, icon: Icon, badge }) => {
                  const isActive = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      title={!isExpanded ? label : undefined}
                      className={cn(
                        'flex items-center rounded-xl text-xs font-semibold transition-all group relative',
                        isExpanded ? 'gap-3 px-3 py-2.5' : 'justify-center p-2.5',
                        isActive
                          ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20'
                          : 'text-slate-500 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                      )}
                    >
                      <Icon className={cn('shrink-0 transition-colors', isExpanded ? 'w-4 h-4' : 'w-5 h-5', isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300')} />
                      {isExpanded && <span className="flex-1 truncate">{label}</span>}
                      {isExpanded && badge && (
                        <span className="text-[10px] font-bold bg-brand-500/20 text-brand-400 border border-brand-500/30 px-1.5 py-0.5 rounded-full leading-none">
                          {badge}
                        </span>
                      )}
                      {!isExpanded && badge && (
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-brand-500" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Restaurant info + Logout */}
        <div className="border-t border-white/5 p-2 space-y-1">
          {isExpanded && restaurant?.name && (
            <div className="px-3 py-2 rounded-xl bg-white/4 border border-white/6 mb-2">
              <p className="text-xs font-bold text-white truncate">{restaurant.name}</p>
              <p className="text-[10px] text-emerald-500 font-mono flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> ONLINE
              </p>
            </div>
          )}
          <button
            onClick={() => { setMobileOpen(false); logout(); }}
            title={!isExpanded ? 'Logout' : undefined}
            className={cn(
              'flex items-center text-xs font-semibold text-slate-600 hover:text-red-400 hover:bg-red-500/8 rounded-xl transition-all w-full',
              isExpanded ? 'gap-3 px-3 py-2.5' : 'justify-center p-2.5'
            )}
          >
            <LogOut className={cn('shrink-0', isExpanded ? 'w-4 h-4' : 'w-5 h-5')} />
            {isExpanded && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
