'use client';

import { useState } from 'react';
import { Search, Bell, Clock, Building2, Store, CheckCircle2, AlertCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useBranches } from '@/hooks/useBranches';
import toast from 'react-hot-toast';

export function ManagerHeader({ pageTitle = 'Branch Overview' }: { pageTitle?: string }) {
  const [outletStatus, setOutletStatus] = useState<'online' | 'busy' | 'offline'>('online');
  const { user } = useAuth();
  const { selectedBranch } = useBranches();

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });

  const toggleOutletStatus = (status: 'online' | 'busy' | 'offline') => {
    setOutletStatus(status);
    const label = status === 'online' ? 'Online & Taking Orders' : status === 'busy' ? 'Busy Mode (High Wait Times)' : 'Offline / Closed';
    toast.success(`Outlet Status updated: ${label}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#050C1F]/95 backdrop-blur-2xl border-b border-white/8 px-6 py-3.5 shadow-xl">
      <div className="flex items-center justify-between gap-4">
        {/* Left Title & Status Indicator */}
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-blue-400 uppercase">
                BRANCH MANAGER PORTAL
              </span>
              <span className="text-white/20">•</span>
              <span className="text-[10px] font-mono text-slate-400 font-bold">
                {selectedBranch?.name || 'Downtown Outlet'}
              </span>
            </div>
            <h1 className="text-lg font-black text-white tracking-tight">{pageTitle}</h1>
          </div>
        </div>

        {/* Center: Outlet Status Switcher */}
        <div className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-white/4 border border-white/8 text-xs font-bold">
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

        {/* Right: Date/Time + Notifications */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/4 border border-white/8 text-xs font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>{dateStr}</span>
            <span className="text-white/20">·</span>
            <span className="font-bold text-white">{timeStr}</span>
          </div>

          <button className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/6 transition-all border border-white/8">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          </button>
        </div>
      </div>
    </header>
  );
}
