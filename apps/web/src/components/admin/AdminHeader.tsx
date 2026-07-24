'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import {
  Search,
  MessageSquare,
  Bell,
  Moon,
  Sun,
  Globe,
  ChevronDown,
  Sparkles,
  X,
  Plus,
  Store,
  Tag,
  Download,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export function AdminHeader() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Modals & Dropdowns State
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isDark = theme === 'dark' || (!theme && true);

  return (
    <>
      <header className="h-16 bg-white dark:bg-[#070D1E]/95 border-b border-slate-200 dark:border-slate-800/80 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-20 backdrop-blur-xl transition-colors duration-200 select-none">
        
        {/* Global Search Bar Trigger */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <div
            onClick={() => setSearchOpen(true)}
            className="relative w-full flex items-center bg-slate-100 dark:bg-[#060B18] border border-slate-200 dark:border-slate-700/60 rounded-xl px-3 py-2 cursor-pointer hover:border-blue-500/80 transition-all group"
          >
            <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-500 shrink-0 mr-2.5 transition-colors" />
            <span className="w-full text-xs text-slate-400 dark:text-slate-400 font-medium">
              Global search (restaurants, trx, logs)...
            </span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded shadow-sm">
              ⌘K
            </kbd>
          </div>

          {/* Quick Action Button Dropdown */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setQuickActionOpen(!quickActionOpen)}
              className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/70 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 px-3 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Quick Action</span>
              <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
            </button>

            {/* Quick Action Popover */}
            {quickActionOpen && (
              <div className="absolute top-full left-0 mt-2 w-52 bg-white dark:bg-[#0A1227] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-1.5 z-30 space-y-0.5 font-sans">
                <Link
                  href="/admin/approvals"
                  onClick={() => setQuickActionOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg transition-colors"
                >
                  <Store className="w-4 h-4 text-blue-500" />
                  <span>Review Approvals</span>
                </Link>
                <Link
                  href="/admin/coupons"
                  onClick={() => setQuickActionOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg transition-colors"
                >
                  <Tag className="w-4 h-4 text-emerald-500" />
                  <span>Create Coupon</span>
                </Link>
                <button
                  onClick={() => setQuickActionOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg transition-colors text-left"
                >
                  <Download className="w-4 h-4 text-indigo-500" />
                  <span>Export Platform Report</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Header Actions & User Profile */}
        <div className="flex items-center gap-3 lg:gap-4">
          
          {/* Action Icons */}
          <div className="flex items-center gap-1 sm:gap-1.5 border-r border-slate-200 dark:border-slate-800/80 pr-3 sm:pr-4">
            
            {/* Messages */}
            <button className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-xl transition-colors relative">
              <MessageSquare className="w-4 h-4" />
            </button>

            {/* Notifications Toggle */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-xl transition-colors relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-white dark:ring-[#070D1E]" />
              </button>

              {/* Notifications Popover */}
              {notificationsOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-[#0A1227] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 z-30 space-y-3 font-sans">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Platform Alerts
                    </h4>
                    <span className="text-[10px] font-mono text-blue-500 font-bold bg-blue-50 dark:bg-blue-500/10 px-1.5 py-0.5 rounded">
                      2 Unread
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">New Merchant Onboarded</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">The Coastal Diner • 5m ago</div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">System Backup Complete</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">Database snapshot • 1h ago</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Dark/Light Mode Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                title="Toggle Theme"
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-xl transition-all active:scale-95"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400 animate-spin-once" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-700 animate-spin-once" />
                )}
              </button>
            )}

            {/* Language Selector */}
            <button className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-xl transition-colors ml-1">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>EN</span>
            </button>
          </div>

          {/* Admin Profile */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 border border-blue-400/40 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-md">
              {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('') : 'AR'}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                {user?.name || 'Alex Rivera'}
              </span>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                {user?.role === 'admin' ? 'SUPER ADMIN' : user?.role || 'SUPER ADMIN'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── COMMAND PALETTE SEARCH MODAL (⌘K) ── */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
          <div className="w-full max-w-xl bg-white dark:bg-[#0A1227] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Input */}
            <div className="flex items-center px-4 border-b border-slate-200 dark:border-slate-800 py-3">
              <Search className="w-4 h-4 text-blue-500 mr-3 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search restaurants, users, bookings, audit logs..."
                className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none font-medium"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Suggestions List */}
            <div className="p-3 max-h-80 overflow-y-auto space-y-1 text-xs">
              <div className="px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Quick Navigation
              </div>
              <Link
                href="/admin/restaurants"
                onClick={() => setSearchOpen(false)}
                className="flex items-center justify-between p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl text-slate-700 dark:text-slate-200 font-semibold transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Store className="w-4 h-4 text-blue-500" />
                  <span>Manage Restaurants</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">/admin/restaurants</span>
              </Link>

              <Link
                href="/admin/approvals"
                onClick={() => setSearchOpen(false)}
                className="flex items-center justify-between p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl text-slate-700 dark:text-slate-200 font-semibold transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  <span>Pending Merchant Approvals</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">/admin/approvals</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
