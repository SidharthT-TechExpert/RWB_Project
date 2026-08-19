'use client';

import { useState } from 'react';
import { Wallet, ArrowDownRight, ArrowUpRight, DollarSign, Building2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BankDetailsManager } from '@/components/dashboard/BankDetailsManager';

interface Withdrawal {
  id: string;
  amount: number;
  bankAccount: string;
  status: 'completed' | 'processing' | 'pending';
  date: string;
}

const mockWithdrawals: Withdrawal[] = [
  { id: 'wth_01', amount: 2500, bankAccount: 'Chase Bank (**** 4821)', status: 'completed', date: '2026-08-05' },
  { id: 'wth_02', amount: 1800, bankAccount: 'Chase Bank (**** 4821)', status: 'completed', date: '2026-07-28' },
  { id: 'wth_03', amount: 3200, bankAccount: 'Chase Bank (**** 4821)', status: 'processing', date: '2026-08-07' },
];

export default function WalletPage() {
  const [balance] = useState<number>(5420.75);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#09122B]/90 p-6 rounded-2xl border border-white/8 shadow-xl">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Wallet className="w-6 h-6 text-purple-400" />
            Restaurant Wallet & Payouts
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your daily revenue balance, set up automatic payouts, and initiate bank transfers.
          </p>
        </div>

        <Button className="h-10 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl gap-2 shadow-lg cursor-pointer">
          <ArrowUpRight className="w-4 h-4" />
          <span>Withdraw to Bank</span>
        </Button>
      </div>

      {/* Bank Details Management with Admin Approval Workflow */}
      <BankDetailsManager />

      {/* Balance & Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-900/40 via-[#0A1227] to-[#080F22] shadow-xl relative overflow-hidden">
          <div className="absolute right-3 top-3 text-purple-500/10">
            <Wallet className="w-24 h-24" />
          </div>
          <p className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">Available Balance</p>
          <h2 className="text-3xl font-black text-white mt-2">${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <RefreshCw className="w-3 h-3 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
            Ready for instant bank transfer
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-white/8 bg-[#080F22]/90 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div>
            <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Estimated Monthly Payout</p>
            <p className="text-2xl font-black text-white mt-2">$18,450.00</p>
            <p className="text-xs text-slate-400 mt-1">Based on rolling 30-day dining volume.</p>
          </div>
          <p className="text-[10px] text-emerald-400 font-bold mt-4">Verified Settlement Partner</p>
        </div>

        <div className="p-6 rounded-2xl border border-white/8 bg-[#080F22]/90 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div>
            <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Payout Schedule</p>
            <p className="text-lg font-black text-white mt-2">Daily Automatic Payout</p>
            <p className="text-xs text-slate-400 mt-1">Transfers automatically trigger every evening at 11:59 PM EST.</p>
          </div>
          <p className="text-[10px] font-mono text-purple-400 font-bold mt-4">Next payout: Tonight</p>
        </div>
      </div>

      {/* Payout History */}
      <div className="rounded-2xl border border-white/8 bg-[#080F22]/90 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-white/8">
          <h3 className="text-sm font-bold text-white">Bank Transfer History</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/3 text-[10px] uppercase font-mono tracking-wider text-slate-400 border-b border-white/6">
              <tr>
                <th className="py-3 px-4">Transfer ID</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {mockWithdrawals.map((wth) => (
                <tr key={wth.id} className="hover:bg-white/2 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-300">{wth.id}</td>
                  <td className="py-3.5 px-4 font-bold text-white">${wth.amount.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-slate-400">{wth.bankAccount}</td>
                  <td className="py-3.5 px-4 text-slate-400">{wth.date}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      wth.status === 'completed' ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300' :
                      'bg-blue-500/20 border border-blue-500/30 text-blue-300'
                    }`}>
                      {wth.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
