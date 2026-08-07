'use client';

import { useState } from 'react';
import { CreditCard, DollarSign, ArrowUpRight, CheckCircle2, Clock, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Transaction {
  id: string;
  orderId: string;
  customerName: string;
  amount: number;
  method: 'Stripe' | 'Razorpay' | 'Cash' | 'Wallet';
  status: 'completed' | 'pending' | 'failed';
  date: string;
}

const mockTransactions: Transaction[] = [
  { id: 'tx_101', orderId: '#ORD-8821', customerName: 'Alex Morgan', amount: 142.50, method: 'Stripe', status: 'completed', date: '2026-08-07 14:22' },
  { id: 'tx_102', orderId: '#ORD-8822', customerName: 'Sophia Chen', amount: 89.00, method: 'Razorpay', status: 'completed', date: '2026-08-07 13:58' },
  { id: 'tx_103', orderId: '#ORD-8823', customerName: 'Marcus Vance', amount: 310.00, method: 'Stripe', status: 'completed', date: '2026-08-07 13:15' },
  { id: 'tx_104', orderId: '#ORD-8824', customerName: 'Elena Rostova', amount: 45.00, method: 'Cash', status: 'pending', date: '2026-08-07 12:40' },
  { id: 'tx_105', orderId: '#ORD-8825', customerName: 'David Miller', amount: 120.00, method: 'Wallet', status: 'completed', date: '2026-08-07 11:30' },
];

export default function PaymentsPage() {
  const [filter, setFilter] = useState<string>('all');

  const filteredTransactions = mockTransactions.filter((tx) =>
    filter === 'all' ? true : tx.status === filter
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#09122B]/90 p-6 rounded-2xl border border-white/8 shadow-xl">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-emerald-400" />
            Payments & Transactions
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time payment gateway transactions, settlements, and payout summaries.
          </p>
        </div>

        <Button className="h-10 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl gap-2 shadow-lg cursor-pointer">
          <Download className="w-4 h-4" />
          <span>Export Report</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-white/8 bg-white/2 backdrop-blur-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-500 uppercase">Today's Total Processed</p>
            <p className="text-xl font-black text-emerald-400">$4,892.40</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-white/8 bg-white/2 backdrop-blur-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-500 uppercase">Settled Payments</p>
            <p className="text-xl font-black text-white">48 Transactions</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-white/8 bg-white/2 backdrop-blur-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-500 uppercase">Pending Settlement</p>
            <p className="text-xl font-black text-amber-400">$340.00</p>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-2xl border border-white/8 bg-[#080F22]/90 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-white/8 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Recent Transactions</h3>
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-white/5 border border-white/10 text-xs text-slate-300 rounded-lg px-2.5 py-1 focus:outline-none"
            >
              <option value="all" className="bg-[#080F22]">All Statuses</option>
              <option value="completed" className="bg-[#080F22]">Completed</option>
              <option value="pending" className="bg-[#080F22]">Pending</option>
              <option value="failed" className="bg-[#080F22]">Failed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/3 text-[10px] uppercase font-mono tracking-wider text-slate-400 border-b border-white/6">
              <tr>
                <th className="py-3 px-4">Tx ID</th>
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/2 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-300">{tx.id}</td>
                  <td className="py-3.5 px-4 font-mono text-amber-400 font-bold">{tx.orderId}</td>
                  <td className="py-3.5 px-4 font-bold text-white">{tx.customerName}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-400">${tx.amount.toFixed(2)}</td>
                  <td className="py-3.5 px-4 text-slate-400">{tx.method}</td>
                  <td className="py-3.5 px-4 text-slate-400">{tx.date}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      tx.status === 'completed' ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300' :
                      tx.status === 'pending' ? 'bg-amber-500/20 border border-amber-500/30 text-amber-300' :
                      'bg-red-500/20 border border-red-500/30 text-red-300'
                    }`}>
                      {tx.status}
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
