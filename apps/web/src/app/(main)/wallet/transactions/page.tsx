'use client';
export const dynamic = 'force-dynamic';

import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft, ArrowDownLeft, ArrowUpRight, Search,
  Filter, Download, TrendingUp, TrendingDown,
  CheckCircle2, Clock, XCircle, SlidersHorizontal,
  Wallet, CalendarDays, ChevronRight, Zap,
} from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useState, useMemo } from 'react';

/* ─── Types ──────────────────────────────────────────────────── */
interface Transaction {
  _id: string;
  amount: number;
  method: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
  description?: string;
}

type FilterType = 'all' | 'credit' | 'debit';

/* ─── Animations ─────────────────────────────────────────────── */
const fadeUp = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

/* ─── Helpers ────────────────────────────────────────────────── */
function groupByDate(txList: Transaction[]) {
  const groups: Record<string, Transaction[]> = {};
  txList.forEach((tx) => {
    const date = new Date(tx.createdAt);
    const today     = new Date(); today.setHours(0,0,0,0);
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    const txDay     = new Date(date); txDay.setHours(0,0,0,0);

    let label: string;
    if (txDay.getTime() === today.getTime())         label = 'Today';
    else if (txDay.getTime() === yesterday.getTime()) label = 'Yesterday';
    else label = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    if (!groups[label]) groups[label] = [];
    groups[label].push(tx);
  });
  return groups;
}

function StatusBadge({ status }: { status: Transaction['status'] }) {
  const styles = {
    completed: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30',
    pending:   'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30',
    failed:    'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30',
  };
  const icons = {
    completed: <CheckCircle2 className="w-3 h-3 3xl:w-3.5 3xl:h-3.5" />,
    pending:   <Clock        className="w-3 h-3 3xl:w-3.5 3xl:h-3.5" />,
    failed:    <XCircle      className="w-3 h-3 3xl:w-3.5 3xl:h-3.5" />,
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] 3xl:text-xs font-black px-2 py-0.5 rounded-full border capitalize ${styles[status]}`}>
      {icons[status]} {status}
    </span>
  );
}

/* ════════════════════════════════════════════════════════════════
   TRANSACTION HISTORY PAGE
════════════════════════════════════════════════════════════════ */
export default function TransactionsPage() {
  const [filter, setFilter]   = useState<FilterType>('all');
  const [search, setSearch]   = useState('');

  /* ── Data ── */
  const { data: walletData } = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => { const { data } = await api.get('/users/wallet'); return data.data; },
  });

  const { data: txData, isLoading } = useQuery({
    queryKey: ['wallet', 'transactions', 'all'],
    queryFn: async () => { const { data } = await api.get('/payments/my?type=wallet&limit=100'); return data; },
  });

  const allTx: Transaction[] = txData?.data || [];

  /* ── Computed stats ── */
  const totalIn  = allTx.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalOut = allTx.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const net      = totalIn - totalOut;

  /* ── Filtered + searched list ── */
  const filteredTx = useMemo(() => {
    let list = allTx;
    if (filter === 'credit') list = list.filter(t => t.amount > 0);
    if (filter === 'debit')  list = list.filter(t => t.amount < 0);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        (t.description || '').toLowerCase().includes(q) ||
        (t.method || '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [allTx, filter, search]);

  const grouped = useMemo(() => groupByDate(filteredTx), [filteredTx]);
  const balance = walletData?.balance || 0;

  return (
    <div className="min-h-screen bg-[#FFF8F4] dark:bg-[#0F0E0D]
                    py-6 sm:py-8 lg:py-10 2xl:py-14 3xl:py-16">

      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-14 3xl:px-20 4xl:px-28
                      max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl
                      2xl:max-w-[1300px] 3xl:max-w-[1600px] 4xl:max-w-[2000px]">

        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-3 mb-7 sm:mb-8 3xl:mb-10"
        >
          <div className="flex items-center gap-3">
            <Link href="/wallet"
              className="w-9 h-9 3xl:w-11 3xl:h-11 rounded-xl 3xl:rounded-2xl bg-white dark:bg-zinc-900
                         border border-[#FFE8DC] dark:border-zinc-800 flex items-center justify-center
                         hover:border-[#FF6B35] transition-colors shadow-sm shrink-0">
              <ArrowLeft className="w-4 h-4 3xl:w-5 3xl:h-5 text-[#78716C]" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl 3xl:text-3xl 4xl:text-4xl font-black text-[#1C1917] dark:text-white tracking-tight">
                Transaction History
              </h1>
              <p className="text-xs 3xl:text-sm text-[#A8A29E] font-medium">
                {allTx.length} transaction{allTx.length !== 1 ? 's' : ''} total
              </p>
            </div>
          </div>

          {/* Balance chip + Download */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 bg-white dark:bg-zinc-900
                            border border-[#FFE8DC] dark:border-zinc-800 rounded-xl px-3 py-1.5 shadow-sm">
              <Wallet className="w-3.5 h-3.5 text-[#FF6B35]" />
              <span className="text-xs font-black text-[#FF6B35]">{formatCurrency(balance)}</span>
            </div>
            <button className="hidden sm:flex w-9 h-9 3xl:w-10 3xl:h-10 rounded-xl bg-white dark:bg-zinc-900
                               border border-[#FFE8DC] dark:border-zinc-800 items-center justify-center
                               hover:border-[#FF6B35] transition-colors shadow-sm">
              <Download className="w-4 h-4 3xl:w-5 3xl:h-5 text-[#78716C]" />
            </button>
          </div>
        </motion.div>

        {/* ── Summary Stats Row ── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="grid grid-cols-3 gap-3 sm:gap-4 3xl:gap-5 mb-6 3xl:mb-8"
        >
          {[
            {
              label: 'Total Added',
              value: totalIn, isPositive: true,
              icon: TrendingUp,
              iconBg: 'bg-emerald-50 dark:bg-emerald-950/30',
              iconColor: 'text-emerald-500',
              valueCls: 'text-emerald-600 dark:text-emerald-400',
            },
            {
              label: 'Total Spent',
              value: totalOut, isPositive: false,
              icon: TrendingDown,
              iconBg: 'bg-red-50 dark:bg-red-950/30',
              iconColor: 'text-red-500',
              valueCls: 'text-red-500 dark:text-red-400',
            },
            {
              label: 'Net Balance',
              value: net, isPositive: net >= 0,
              icon: Zap,
              iconBg: 'bg-[#FFF5F0] dark:bg-zinc-800',
              iconColor: 'text-[#FF6B35]',
              valueCls: net >= 0 ? 'text-[#FF6B35]' : 'text-red-500',
            },
          ].map(({ label, value, icon: Icon, iconBg, iconColor, valueCls }) => (
            <div key={label}
              className="bg-white dark:bg-zinc-900 rounded-2xl 3xl:rounded-3xl
                         border border-[#FFE8DC] dark:border-zinc-800
                         shadow-[0_2px_10px_rgba(0,0,0,0.04)] p-4 3xl:p-5"
            >
              <div className={`w-8 h-8 3xl:w-10 3xl:h-10 rounded-xl 3xl:rounded-2xl flex items-center justify-center mb-2.5 3xl:mb-3 ${iconBg}`}>
                <Icon className={`w-4 h-4 3xl:w-5 3xl:h-5 ${iconColor}`} />
              </div>
              <p className="text-[10px] 3xl:text-xs text-[#A8A29E] font-bold uppercase tracking-wide mb-0.5">{label}</p>
              <p className={`text-base sm:text-lg 3xl:text-xl 4xl:text-2xl font-black leading-tight ${valueCls}`}>
                {formatCurrency(value)}
              </p>
            </div>
          ))}
        </motion.div>

        {/* ── Search + Filter Row ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 3xl:mb-8"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 3xl:w-5 3xl:h-5 text-[#C4B5AE] pointer-events-none" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-11 3xl:h-13 pl-10 pr-4 rounded-2xl 3xl:rounded-3xl
                         border border-[#FFE8DC] dark:border-zinc-700
                         bg-white dark:bg-zinc-900
                         text-sm 3xl:text-base font-medium text-[#1C1917] dark:text-white
                         placeholder:text-[#C4B5AE] outline-none
                         focus:border-[#FF6B35] focus:ring-4 focus:ring-[#FF6B35]/10
                         shadow-sm transition-all duration-200"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex items-center bg-white dark:bg-zinc-900 border border-[#FFE8DC] dark:border-zinc-800
                          rounded-2xl 3xl:rounded-3xl p-1 shadow-sm gap-1 shrink-0">
            {([
              { key: 'all',    label: 'All'      },
              { key: 'credit', label: 'Money In' },
              { key: 'debit',  label: 'Money Out' },
            ] as { key: FilterType; label: string }[]).map(({ key, label }) => (
              <button key={key}
                onClick={() => setFilter(key)}
                className={`px-3 3xl:px-4 py-2 3xl:py-2.5 rounded-xl 3xl:rounded-2xl text-xs 3xl:text-sm font-black
                             transition-all duration-200 whitespace-nowrap ${
                  filter === key
                    ? 'bg-gradient-to-r from-[#FF6B35] to-[#FF4D0F] text-white shadow-[0_2px_10px_rgba(255,107,53,0.3)]'
                    : 'text-[#78716C] dark:text-zinc-400 hover:text-[#1C1917] dark:hover:text-white hover:bg-[#FFF5F0] dark:hover:bg-zinc-800'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Transactions List ── */}
        {isLoading ? (
          /* Loading skeleton */
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#FFE8DC] dark:border-zinc-800 p-4 sm:p-5">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-[#F5EDE8] dark:bg-zinc-800 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-1/2 bg-[#F5EDE8] dark:bg-zinc-800 rounded-full animate-pulse" />
                    <div className="h-2.5 w-1/3 bg-[#F5EDE8] dark:bg-zinc-800 rounded-full animate-pulse" />
                  </div>
                  <div className="h-4 w-16 bg-[#F5EDE8] dark:bg-zinc-800 rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredTx.length === 0 ? (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-zinc-900 rounded-3xl border border-[#FFE8DC] dark:border-zinc-800
                       shadow-[0_2px_16px_rgba(0,0,0,0.05)] py-16 3xl:py-20 px-6 text-center"
          >
            <div className="w-16 h-16 3xl:w-20 3xl:h-20 rounded-3xl bg-[#FFF5F0] dark:bg-zinc-800
                            border border-[#FFE8DC] dark:border-zinc-700 flex items-center justify-center mx-auto mb-4">
              <CalendarDays className="w-8 h-8 3xl:w-10 3xl:h-10 text-[#FF6B35]" />
            </div>
            <h3 className="text-base 3xl:text-lg font-black text-[#1C1917] dark:text-white mb-1.5">
              {search || filter !== 'all' ? 'No results found' : 'No Transactions Yet'}
            </h3>
            <p className="text-sm 3xl:text-base text-[#A8A29E] font-medium max-w-[240px] mx-auto leading-relaxed mb-5">
              {search || filter !== 'all'
                ? 'Try changing your search or filter.'
                : 'Your transaction history will appear here once you add money or make payments.'}
            </p>
            {(!search && filter === 'all') && (
              <Link href="/wallet"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#FF6B35] to-[#FF4D0F]
                           text-white text-xs 3xl:text-sm font-black rounded-xl
                           shadow-[0_4px_14px_rgba(255,107,53,0.3)] hover:shadow-[0_8px_24px_rgba(255,107,53,0.4)]
                           transition-all duration-200">
                Add Money Now <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </motion.div>
        ) : (
          /* Grouped transaction list */
          <div className="space-y-6 3xl:space-y-8">
            {Object.entries(grouped).map(([dateLabel, txs]) => (
              <motion.div
                key={dateLabel}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Date group label */}
                <div className="flex items-center gap-3 mb-3 3xl:mb-4">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-3.5 h-3.5 3xl:w-4 3xl:h-4 text-[#A8A29E]" />
                    <span className="text-xs 3xl:text-sm font-black text-[#78716C] dark:text-zinc-400 uppercase tracking-widest">
                      {dateLabel}
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-[#F5EDE8] dark:bg-zinc-800" />
                  <span className="text-[10px] 3xl:text-xs text-[#A8A29E] font-medium">
                    {txs.length} item{txs.length > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Transactions card */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl 3xl:rounded-3xl
                                border border-[#FFE8DC] dark:border-zinc-800
                                shadow-[0_2px_14px_rgba(0,0,0,0.05)] overflow-hidden">
                  {txs.map((tx, i) => {
                    const isCredit = tx.amount > 0;
                    return (
                      <motion.div
                        key={tx._id}
                        initial={{ opacity: 0, x: -8 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.04, duration: 0.4 }}
                        className="flex items-center gap-4 3xl:gap-5 p-4 sm:p-5 3xl:p-6
                                   border-b border-[#FFF5F0] dark:border-zinc-800 last:border-0
                                   hover:bg-[#FFFAF8] dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group"
                      >
                        {/* Direction icon */}
                        <div className={`w-11 h-11 3xl:w-13 3xl:h-13 rounded-2xl 3xl:rounded-3xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                          isCredit
                            ? 'bg-emerald-50 dark:bg-emerald-950/30'
                            : 'bg-red-50 dark:bg-red-950/30'
                        }`}>
                          {isCredit
                            ? <ArrowDownLeft className="w-5 h-5 3xl:w-6 3xl:h-6 text-emerald-500" />
                            : <ArrowUpRight  className="w-5 h-5 3xl:w-6 3xl:h-6 text-red-500"     />
                          }
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm 3xl:text-base font-black text-[#1C1917] dark:text-white
                                        group-hover:text-[#FF6B35] transition-colors truncate mb-1">
                            {tx.description || (isCredit ? 'Money added to wallet' : 'Payment made')}
                          </p>
                          <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
                            <p className="text-xs 3xl:text-sm text-[#A8A29E] font-medium">
                              {new Date(tx.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {tx.method && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-[#E0D0C8]" />
                                <span className="text-xs 3xl:text-sm text-[#A8A29E] font-medium capitalize">{tx.method}</span>
                              </>
                            )}
                            <StatusBadge status={tx.status} />
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="text-right shrink-0 ml-2">
                          <span className={`text-base 3xl:text-lg font-black block ${
                            isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
                          }`}>
                            {isCredit ? '+' : ''}{formatCurrency(tx.amount)}
                          </span>
                          {isCredit && (
                            <span className="text-[10px] 3xl:text-xs text-emerald-500/70 font-medium">Credited</span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── Bottom spacing ── */}
        <div className="h-16 3xl:h-20" />
      </div>
    </div>
  );
}
