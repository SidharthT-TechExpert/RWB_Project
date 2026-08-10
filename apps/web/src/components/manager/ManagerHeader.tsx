'use client';

import { useState } from 'react';
import { Search, Bell, Clock, Building2, Store, CheckCircle2, AlertCircle, Plus, Menu, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentBranch } from '@/hooks/useBranches';
import { useManagerSidebar } from '@/context/ManagerSidebarContext';
import toast from 'react-hot-toast';

export function ManagerHeader({ pageTitle = 'Branch Overview' }: { pageTitle?: string }) {
  const [outletStatus, setOutletStatus] = useState<'online' | 'busy' | 'offline'>('online');
  const [mobileStatusOpen, setMobileStatusOpen] = useState(false);
  const { user } = useAuth();
  const currentBranch = useCurrentBranch();
  const { toggleMobile } = useManagerSidebar();

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });

  const toggleOutletStatus = (status: 'online' | 'busy' | 'offline') => {
    setOutletStatus(status);
    setMobileStatusOpen(false);
    const label = status === 'online' ? 'Online & Taking Orders' : status === 'busy' ? 'Busy Mode (High Wait Times)' : 'Offline / Closed';
    toast.success(`Outlet Status updated: ${label}`);
  };

  const statusConfig = {
    online: { label: 'Accepting Orders', color: 'emerald', dot: 'bg-emerald-400' },
    busy: { label: 'Busy Mode', color: 'amber', dot: 'bg-amber-400' },
    offline: { label: 'Offline', color: 'rose', dot: 'bg-rose-400' },
  };

  return (
    <header className="sticky top-0 z-40 bg-[#050C1F]/95 backdrop-blur-2xl border-b border-white/8 px-4 sm:px-6 py-3 shadow-xl">
      <div className="flex items-center justify-between gap-3 max-w-[2400px] mx-auto">
        {/* Left: Mobile Menu Toggle + Title & Status Indicator */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={toggleMobile}
            aria-label="Open Navigation Menu"
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white bg-white/4 hover:bg-white/8 border border-white/8 transition-colors shrink-0 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[9px] sm:text-[10px] font-mono font-bold tracking-widest text-blue-400 uppercase truncate">
                BRANCH MANAGER
              </span>
              <span className="text-white/20">•</span>
              <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 font-bold truncate">
                {currentBranch?.name || 'Assigned Outlet'}
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-black text-white tracking-tight truncate">{pageTitle}</h1>
          </div>
        </div>

        {/* Center: Desktop Outlet Status Switcher */}
        <div className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-white/4 border border-white/8 text-xs font-bold shrink-0">
          <button
            onClick={() => toggleOutletStatus('online')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
              outletStatus === 'online'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>Accepting Orders</span>
          </button>

          <button
            onClick={() => toggleOutletStatus('busy')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
              outletStatus === 'busy'
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-white" />
            <span>Busy Mode</span>
          </button>

          <button
            onClick={() => toggleOutletStatus('offline')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
              outletStatus === 'offline'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-white" />
            <span>Offline</span>
          </button>
        </div>

        {/* Mobile Outlet Status Dropdown */}
        <div className="relative md:hidden shrink-0">
          <button
            onClick={() => setMobileStatusOpen(!mobileStatusOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold ${
              outletStatus === 'online'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : outletStatus === 'busy'
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${statusConfig[outletStatus].dot} animate-pulse`} />
            <span className="hidden xs:inline">{statusConfig[outletStatus].label}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {mobileStatusOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#080F22] border border-slate-800 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95">
              {(['online', 'busy', 'offline'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => toggleOutletStatus(st)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                    outletStatus === st ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${statusConfig[st].dot}`} />
                  <span>{statusConfig[st].label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Date/Time + Notifications */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/4 border border-white/8 text-xs font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>{dateStr}</span>
            <span className="text-white/20">·</span>
            <span className="font-bold text-white">{timeStr}</span>
          </div>

          <button className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/6 transition-all border border-white/8 cursor-pointer">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          </button>
        </div>
      </div>
    </header>
  );
}

