'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, CalendarCheck, UtensilsCrossed,
  ShoppingBag, Users, UserCheck,
  CreditCard, Wallet, BarChart2, Settings, LogOut,
  PanelLeftClose, PanelLeftOpen, Building2,
  Megaphone, MessageSquareMore,
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
      { href: '/dashboard',           label: 'Command Center',  icon: LayoutDashboard },
      { href: '/dashboard/branches',  label: 'Outlets',         icon: Building2,       badge: '2' },
      { href: '/dashboard/bookings',  label: 'Reservations',    icon: CalendarCheck,   badge: '12' },
      { href: '/dashboard/orders',    label: 'Live Orders',     icon: ShoppingBag,     badge: '3' },
      { href: '/dashboard/menu',      label: 'Menu',            icon: UtensilsCrossed },
      { href: '/dashboard/customers', label: 'Guests',          icon: Users },
      { href: '/dashboard/staff',     label: 'Staff',           icon: UserCheck },
      { href: '/dashboard/reviews',   label: 'Reviews',         icon: MessageSquareMore },
      { href: '/dashboard/promotions',label: 'Promotions',      icon: Megaphone },
    ],
  },
  {
    title: 'Finance',
    items: [
      { href: '/dashboard/payments',  label: 'Payments',        icon: CreditCard },
      { href: '/dashboard/wallet',    label: 'Wallet',          icon: Wallet },
      { href: '/dashboard/analytics', label: 'Analytics',       icon: BarChart2 },
    ],
  },
  {
    title: 'System',
    items: [
      { href: '/dashboard/settings',  label: 'Settings',        icon: Settings },
    ],
  },
];

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'RO';
}

export function DashboardSidebar() {
  const pathname   = usePathname();
  const { logout, user } = useAuth();
  const { data: restaurants } = useMyRestaurants();
  const restaurant = restaurants?.data?.[0];

  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const isExpanded = mobileOpen || !collapsed;
  const ownerName  = user?.name || restaurant?.ownerName || 'Restaurant Owner';
  const initials   = getInitials(ownerName);

  return (
    <>
      {/* ── Mobile FAB ─────────────────────────────────────── */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 w-12 h-12 rounded-2xl
          bg-gradient-to-br from-amber-500 to-orange-500
          text-white flex items-center justify-center
          shadow-[0_0_24px_rgba(245,158,11,0.5)] border border-amber-400/30
          active:scale-95 transition-transform cursor-pointer"
      >
        {mobileOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
      </button>

      {/* ── Mobile overlay ─────────────────────────────────── */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/75 backdrop-blur-sm"
        />
      )}

      {/* ── Sidebar shell ──────────────────────────────────── */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 h-screen flex flex-col z-40 shrink-0',
          'transition-all duration-300 ease-in-out',
          // Background & border
          'bg-[#060A12] border-r border-white/5',
          // Mobile slide
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0',
          // Desktop width
          collapsed ? 'lg:w-[72px]' : 'lg:w-62',
        )}
      >
        {/* ── Ambient top glow ─────────────────────────────── */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-16 rounded-full bg-amber-500/6 blur-2xl pointer-events-none" />

        {/* ── Logo / restaurant name ────────────────────────── */}
        <div
          className={cn(
            'relative flex items-center border-b border-white/5 py-[18px]',
            isExpanded ? 'px-5 gap-3' : 'px-0 justify-center',
          )}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0 shadow-[0_0_18px_rgba(245,158,11,0.4)]">
            <UtensilsCrossed className="w-4 h-4 text-white" />
          </div>

          {isExpanded && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-white truncate leading-tight">
                {restaurant?.name ?? 'QuickBite'}
              </p>
              <p className="text-[9px] font-mono text-amber-500/70 uppercase tracking-widest">
                Owner Portal
              </p>
            </div>
          )}

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto text-slate-700 hover:text-slate-400 transition-colors hidden lg:flex p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
          >
            {collapsed
              ? <PanelLeftOpen className="w-3.5 h-3.5" />
              : <PanelLeftClose className="w-3.5 h-3.5" />
            }
          </button>
        </div>

        {/* ── Navigation ────────────────────────────────────── */}
        <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden space-y-5 no-scrollbar">
          {navGroups.map((group, idx) => (
            <div key={idx}>
              {/* Section label */}
              {group.title && isExpanded && (
                <p className="px-5 mb-1.5 text-[9px] font-mono font-black text-slate-700 uppercase tracking-[0.15em]">
                  {group.title}
                </p>
              )}
              {group.title && !isExpanded && (
                <div className="mx-auto w-8 h-px bg-white/6 my-2" />
              )}

              <div className="space-y-0.5 px-2.5">
                {group.items.map(({ href, label, icon: Icon, badge }) => {
                  const isActive = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      title={!isExpanded ? label : undefined}
                      className={cn(
                        'relative flex items-center rounded-xl text-[12px] font-semibold transition-all duration-200 group cursor-pointer',
                        isExpanded ? 'gap-3 px-3 py-2.5' : 'justify-center p-2.5',
                        isActive
                          ? 'bg-amber-500/12 text-amber-300 border border-amber-500/20 shadow-[inset_0_0_12px_rgba(245,158,11,0.06)]'
                          : 'text-slate-500 hover:text-slate-200 hover:bg-white/5 border border-transparent',
                      )}
                    >
                      {/* Gold active left bar */}
                      {isActive && isExpanded && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                      )}

                      <Icon
                        className={cn(
                          'shrink-0 transition-all duration-200',
                          isExpanded ? 'w-[15px] h-[15px]' : 'w-5 h-5',
                          isActive
                            ? 'text-amber-400'
                            : 'text-slate-600 group-hover:text-slate-300',
                        )}
                      />

                      {isExpanded && (
                        <span className="flex-1 truncate">{label}</span>
                      )}

                      {/* Badge — expanded */}
                      {isExpanded && badge && (
                        <span className={cn(
                          'text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none border',
                          isActive
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            : 'bg-white/6 text-slate-500 border-white/10',
                        )}>
                          {badge}
                        </span>
                      )}

                      {/* Badge dot — collapsed */}
                      {!isExpanded && badge && (
                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.7)]" />
                      )}

                      {/* Tooltip (collapsed) */}
                      {!isExpanded && (
                        <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-[#0F1620] border border-white/10 text-[11px] font-semibold text-white whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50">
                          {label}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* ── Bottom: user + logout ──────────────────────────── */}
        <div className="border-t border-white/5 p-2.5 space-y-1.5 shrink-0">

          {/* User card (expanded only) */}
          {isExpanded && (
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/3 border border-white/6 mb-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center font-black text-[10px] text-white shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.35)]">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate leading-tight">{ownerName}</p>
                <p className="text-[9px] font-mono text-amber-500/70 uppercase tracking-widest mt-0.5">Restaurant Owner</p>
              </div>
            </div>
          )}

          {/* Collapsed: avatar only */}
          {!isExpanded && (
            <div className="flex justify-center mb-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center font-black text-[10px] text-white shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.35)]">
                {initials}
              </div>
            </div>
          )}

          {/* Logout button */}
          <button
            onClick={() => { setMobileOpen(false); logout(); }}
            title={!isExpanded ? 'Sign Out' : undefined}
            className={cn(
              'group relative flex items-center text-[12px] font-semibold rounded-xl transition-all duration-200 w-full cursor-pointer',
              'text-slate-600 hover:text-red-400 hover:bg-red-500/6 border border-transparent hover:border-red-500/15',
              isExpanded ? 'gap-3 px-3 py-2.5' : 'justify-center p-2.5',
            )}
          >
            <LogOut className={cn('shrink-0 transition-colors', isExpanded ? 'w-3.5 h-3.5' : 'w-5 h-5')} />
            {isExpanded && <span>Sign Out</span>}
            {!isExpanded && (
              <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-[#0F1620] border border-white/10 text-[11px] font-semibold text-white whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                Sign Out
              </span>
            )}
          </button>
        </div>

      </aside>
    </>
  );
}
