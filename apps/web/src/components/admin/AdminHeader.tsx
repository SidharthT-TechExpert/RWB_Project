'use client';

import { Search, MessageSquare, Bell, Moon, Globe, ChevronDown, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function AdminHeader() {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-[#070D1E]/95 border-b border-slate-800/80 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-20 backdrop-blur-xl select-none">
      {/* Global Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full flex items-center bg-[#060B18] border border-slate-700/60 rounded-xl px-3 py-1.5 focus-within:border-blue-500/80 transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
          <input
            type="text"
            placeholder="Global search (restaurants, trx, logs)..."
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 outline-none font-medium"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono text-slate-400 bg-slate-800/80 border border-slate-700 px-1.5 py-0.5 rounded">
            ⌘K
          </kbd>
        </div>

        {/* Quick Action Button */}
        <button className="hidden md:flex items-center gap-1.5 bg-slate-800/70 hover:bg-slate-800 text-slate-200 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Quick Action</span>
          <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
        </button>
      </div>

      {/* Right Header Actions & User Profile */}
      <div className="flex items-center gap-3 lg:gap-5">
        {/* Quick Icon Tools */}
        <div className="flex items-center gap-1 sm:gap-2 border-r border-slate-800/80 pr-3 sm:pr-4">
          <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-colors relative">
            <MessageSquare className="w-4 h-4" />
          </button>

          <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-[#070D1E]" />
          </button>

          <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-colors">
            <Moon className="w-4 h-4" />
          </button>

          <button className="flex items-center gap-1 text-slate-300 hover:text-white text-xs font-semibold px-2 py-1 hover:bg-slate-800/50 rounded-xl transition-colors ml-1">
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
            <span className="text-xs font-bold text-white tracking-tight leading-tight">
              {user?.name || 'Alex Rivera'}
            </span>
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-blue-400">
              {user?.role === 'admin' ? 'SUPER ADMIN' : user?.role || 'SUPER ADMIN'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
