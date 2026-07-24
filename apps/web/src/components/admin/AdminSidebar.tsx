'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Store,
  FileCheck,
  Calendar,
  Users,
  UserCheck,
  Contact,
  CreditCard,
  Wallet,
  Tag,
  Megaphone,
  BarChart3,
  MessageSquare,
  LifeBuoy,
  FileText,
  Activity,
  Settings,
  LogOut,
  Utensils,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface NavSection {
  title: string;
  items: {
    href: string;
    label: string;
    icon: any;
    badge?: string | number;
    badgeColor?: string;
  }[];
}

const navSections: NavSection[] = [
  {
    title: 'CORE PLATFORM',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/restaurants', label: 'Restaurants', icon: Store },
      { href: '/admin/approvals', label: 'Req. Approvals', icon: FileCheck, badge: 12, badgeColor: 'bg-orange-500 text-white' },
      { href: '/admin/bookings', label: 'Reservations', icon: Calendar },
      { href: '/admin/users', label: 'Customers', icon: Users },
    ],
  },
  {
    title: 'PEOPLE & OPS',
    items: [
      { href: '/admin/managers', label: 'Managers', icon: UserCheck },
      { href: '/admin/staff', label: 'Staff Directory', icon: Contact },
      { href: '/admin/payments', label: 'Payments', icon: CreditCard },
      { href: '/admin/wallet', label: 'Global Wallet', icon: Wallet },
    ],
  },
  {
    title: 'MARKETING & GROWTH',
    items: [
      { href: '/admin/coupons', label: 'Coupons', icon: Tag },
      { href: '/admin/campaigns', label: 'Campaign Offers', icon: Megaphone },
      { href: '/admin/analytics', label: 'Analytics Hub', icon: BarChart3 },
      { href: '/admin/reviews', label: 'Reviews Moderation', icon: MessageSquare },
    ],
  },
  {
    title: 'SYSTEM CONTROL',
    items: [
      { href: '/admin/support', label: 'Support Tickets', icon: LifeBuoy },
      { href: '/admin/audit', label: 'Audit Logs', icon: FileText },
      { href: '/admin/system-health', label: 'System Health', icon: Activity },
      { href: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="w-64 h-screen bg-white dark:bg-[#070D1E] border-r border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 flex flex-col shrink-0 sticky top-0 font-sans select-none z-30 transition-colors duration-200">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30 shrink-0">
            <Utensils className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight">QuickBite</span>
            </div>
            <span className="text-[10px] font-mono font-bold tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 px-1.5 py-0.2 rounded uppercase">
              ADMIN HQ
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links (Custom sleek scrollbar) */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1.5">
            <h3 className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
              {section.title}
            </h3>
            <div className="space-y-0.5">
              {section.items.map(({ href, label, icon: Icon, badge, badgeColor }) => {
                const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 group',
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 shadow-sm font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={cn(
                          'w-4 h-4 shrink-0 transition-colors',
                          isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'
                        )}
                      />
                      <span className="truncate">{label}</span>
                    </div>
                    {badge !== undefined && (
                      <span
                        className={cn(
                          'text-[10px] font-bold px-1.5 py-0.5 rounded-md font-mono shrink-0 shadow-sm',
                          badgeColor || 'bg-blue-600 text-white'
                        )}
                      >
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Storage & Meta */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-[#050914]/80 space-y-3">
        {/* Storage Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-bold font-mono">
            <span className="text-slate-500 dark:text-slate-400 uppercase tracking-wider">STORAGE</span>
            <span className="text-blue-600 dark:text-blue-400">82%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full w-[82%] shadow-sm shadow-blue-500" />
          </div>
        </div>

        {/* Footer Meta & Sign Out */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
          <span>Version v1.0.4</span>
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer">Docs</span>
            <span>•</span>
            <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer">API</span>
          </div>
        </div>

        <button
          onClick={() => logout()}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-xl text-xs font-bold transition-colors mt-1"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
