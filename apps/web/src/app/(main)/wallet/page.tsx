'use client';
export const dynamic = 'force-dynamic';

import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Wallet, Plus, ArrowDownLeft, ArrowUpRight, Shield,
  Zap, Gift, ChevronRight, CreditCard, History,
  TrendingUp, CheckCircle2, Clock, XCircle, Sparkles,
  ArrowLeft, Send, QrCode, Star,
} from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useState } from 'react';
import toast from 'react-hot-toast';

/* ─── Types ──────────────────────────────────────────────────── */
interface Transaction {
  _id: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
  description?: string;
}

/* ─── Constants ──────────────────────────────────────────────── */
const TOP_UP_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

/* ─── Animations ─────────────────────────────────────────────── */
const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};
const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07 } },
};

/* ─── Status icon ────────────────────────────────────────────── */
function TxStatus({ status }: { status: string }) {
  if (status === 'completed') return <CheckCircle2 className="w-3 h-3 text-emerald-500" />;
  if (status === 'pending')   return <Clock        className="w-3 h-3 text-amber-500"   />;
  return                             <XCircle      className="w-3 h-3 text-red-500"     />;
}

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════ */
export default function WalletPage() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount,   setCustomAmount   ] = useState('');

  /* ── Queries ── */
  const { data: walletData, refetch } = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => { const { data } = await api.get('/users/wallet'); return data.data; },
  });

  const { data: transactions } = useQuery({
    queryKey: ['wallet', 'transactions'],
    queryFn: async () => { const { data } = await api.get('/payments/my?type=wallet&limit=5'); return data; },
  });

  /* ── Top-up mutation ── */
  const topUpMutation = useMutation({
    mutationFn: async (amount: number) => {
      const { data } = await api.post('/payments/razorpay/order', { amount, type: 'wallet' });
      return data.data;
    },
    onSuccess: () => { refetch(); toast.success('Wallet topped up! 🎉'); },
    onError:   () => toast.error('Top-up failed. Please try again.'),
  });

  const amount     = selectedAmount || Number(customAmount) || 0;
  const balance    = walletData?.balance || 0;
  const txList: Transaction[] = transactions?.data || [];
  const totalIn  = txList.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalOut = txList.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <div className="min-h-screen bg-[#FFF8F4] dark:bg-[#0F0E0D]
                    py-6 sm:py-8 lg:py-10 2xl:py-14 3xl:py-16">

      {/* ── Max-width wrapper: fluid from phone → 4K TV ── */}
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-14 3xl:px-20 4xl:px-28
                      max-w-xl sm:max-w-2xl lg:max-w-[1100px] xl:max-w-[1280px]
                      2xl:max-w-[1500px] 3xl:max-w-[1800px] 4xl:max-w-[2200px]">

        {/* ── Page header ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-7 sm:mb-8 3xl:mb-10"
        >
          <Link href="/"
            className="w-9 h-9 3xl:w-11 3xl:h-11 rounded-xl bg-white dark:bg-zinc-900
                       border border-[#FFE8DC] dark:border-zinc-800 flex items-center justify-center
                       hover:border-[#FF6B35] transition-colors shadow-sm">
            <ArrowLeft className="w-4 h-4 3xl:w-5 3xl:h-5 text-[#78716C]" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl 3xl:text-3xl 4xl:text-4xl font-black text-[#1C1917] dark:text-white tracking-tight">
              My Wallet
            </h1>
            <p className="text-xs 3xl:text-sm text-[#A8A29E] font-medium">Manage your QuickBite balance</p>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════
            TWO-COLUMN GRID: balance (left) + add money (right)
            Single column on mobile, 5-col grid on lg+
        ══════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-5 xl:grid-cols-3 gap-5 lg:gap-6 2xl:gap-8 3xl:gap-10">

          {/* ════════════════════════════════════════════════════
              LEFT COLUMN — Balance, quick actions, recent tx
          ════════════════════════════════════════════════════ */}
          <div className="lg:col-span-3 xl:col-span-2 space-y-5 2xl:space-y-6 3xl:space-y-8">

            {/* ── Balance Card ── */}
            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative rounded-3xl 3xl:rounded-[2rem] overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #FF4D0F 50%, #E8390A 100%)' }}
            >
              {/* Decorative elements */}
              <div className="absolute -top-16 -right-16 w-56 h-56 3xl:w-72 3xl:h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-72 h-72 3xl:w-96 3xl:h-96 bg-white/8  rounded-full blur-3xl pointer-events-none" />
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'radial-gradient(circle at 1px 1px,white 1px,transparent 0)', backgroundSize: '28px 28px' }} />
              {/* Large watermark icon */}
              <div className="absolute top-4 right-4 3xl:top-6 3xl:right-6 opacity-15">
                <Wallet className="w-28 h-28 3xl:w-36 3xl:h-36 4xl:w-44 4xl:h-44 text-white" />
              </div>

              <div className="relative p-6 sm:p-7 lg:p-8 2xl:p-10 3xl:p-12">
                {/* Top row */}
                <div className="flex items-center justify-between mb-5 3xl:mb-7">
                  <div>
                    <p className="text-white/60 text-[10px] 3xl:text-xs font-black uppercase tracking-widest mb-0.5">
                      QuickBite Wallet
                    </p>
                    <p className="text-white/80 text-sm 3xl:text-base font-semibold">Available Balance</p>
                  </div>
                  <div className="w-12 h-12 3xl:w-14 3xl:h-14 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                    <Wallet className="w-5 h-5 3xl:w-6 3xl:h-6 text-white" />
                  </div>
                </div>

                {/* Balance amount */}
                <p className="text-5xl sm:text-6xl lg:text-5xl xl:text-6xl 2xl:text-7xl 3xl:text-8xl 4xl:text-9xl
                              font-black text-white tracking-tight leading-none mb-1.5">
                  {formatCurrency(balance)}
                </p>
                <p className="text-white/60 text-xs 3xl:text-sm font-medium mb-6 3xl:mb-8">
                  {balance === 0 ? 'Add money to get started' : 'Updated just now'}
                </p>

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-3 3xl:gap-4">
                  {[
                    { icon: ArrowDownLeft, label: 'Total Added', value: totalIn,  color: 'text-emerald-300' },
                    { icon: ArrowUpRight,  label: 'Total Spent', value: totalOut, color: 'text-red-300'     },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="bg-white/12 backdrop-blur-sm rounded-2xl 3xl:rounded-3xl p-3.5 3xl:p-5 border border-white/15">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Icon className={`w-3.5 h-3.5 3xl:w-4 3xl:h-4 ${color}`} />
                        <span className="text-white/70 text-[10px] 3xl:text-xs font-black uppercase tracking-wider">{label}</span>
                      </div>
                      <p className="text-white font-black text-base 3xl:text-xl 4xl:text-2xl leading-none">
                        {formatCurrency(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* ── Quick Actions Row ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-4 gap-3 3xl:gap-4"
            >
              {[
                { icon: Plus,    label: 'Add Money', action: () => {}, primary: true  },
                { icon: Send,    label: 'Send',      href: '#',         primary: false },
                { icon: History, label: 'History',   href: '/wallet/transactions', primary: false },
                { icon: QrCode,  label: 'Scan',      href: '/scan',     primary: false },
              ].map((a, i) => {
                const Icon = a.icon;
                const inner = (
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.96 }}
                    className={`flex flex-col items-center gap-2 3xl:gap-3 py-4 3xl:py-5 px-3 rounded-2xl 3xl:rounded-3xl
                                border cursor-pointer transition-all duration-200 ${
                      a.primary
                        ? 'bg-gradient-to-br from-[#FF6B35] to-[#FF4D0F] border-transparent shadow-[0_4px_18px_rgba(255,107,53,0.35)]'
                        : 'bg-white dark:bg-zinc-900 border-[#FFE8DC] dark:border-zinc-800 shadow-sm hover:border-[#FF6B35] hover:shadow-md'
                    }`}
                  >
                    <div className={`w-9 h-9 3xl:w-11 3xl:h-11 rounded-xl 3xl:rounded-2xl flex items-center justify-center ${
                      a.primary ? 'bg-white/20' : 'bg-[#FFF5F0] dark:bg-zinc-800'
                    }`}>
                      <Icon className={`w-4 h-4 3xl:w-5 3xl:h-5 ${a.primary ? 'text-white' : 'text-[#FF6B35]'}`} />
                    </div>
                    <span className={`text-[11px] 3xl:text-sm font-black text-center leading-tight ${
                      a.primary ? 'text-white' : 'text-[#1C1917] dark:text-white'
                    }`}>{a.label}</span>
                  </motion.div>
                );
                return a.href ? (
                  <Link key={i} href={a.href}>{inner}</Link>
                ) : (
                  <div key={i} onClick={a.action}>{inner}</div>
                );
              })}
            </motion.div>

            {/* ── Benefits Strip ── */}
            <motion.div
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex items-center justify-between gap-2 bg-white dark:bg-zinc-900
                         border border-[#FFE8DC] dark:border-zinc-800
                         rounded-2xl 3xl:rounded-3xl px-4 3xl:px-6 py-3.5 3xl:py-5
                         shadow-[0_2px_12px_rgba(255,107,53,0.06)]"
            >
              {[
                { icon: Zap,    label: 'Instant payments at the table' },
                { icon: Shield, label: 'Secured & insured balance'      },
                { icon: Gift,   label: '2% cashback on top-ups'         },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 3xl:gap-3 min-w-0">
                  <div className="w-7 h-7 3xl:w-9 3xl:h-9 rounded-xl 3xl:rounded-2xl bg-[#FFF5F0] dark:bg-zinc-800
                                  flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 3xl:w-4 3xl:h-4 text-[#FF6B35]" />
                  </div>
                  <span className="text-[10px] 3xl:text-xs font-bold text-[#78716C] dark:text-zinc-400 leading-snug
                                   hidden sm:block truncate">{label}</span>
                </div>
              ))}
            </motion.div>

            {/* ── Recent Transactions Preview ── */}
            <motion.div
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4 3xl:mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 3xl:w-11 3xl:h-11 rounded-xl 3xl:rounded-2xl bg-[#FFF5F0] dark:bg-zinc-800
                                  border border-[#FFE8DC] dark:border-zinc-700 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 3xl:w-5 3xl:h-5 text-[#FF6B35]" />
                  </div>
                  <h2 className="text-base 3xl:text-lg 4xl:text-xl font-black text-[#1C1917] dark:text-white">
                    Recent Transactions
                  </h2>
                </div>
                <Link href="/wallet/transactions"
                  className="flex items-center gap-0.5 text-sm 3xl:text-base font-bold text-[#FF6B35] hover:text-[#E8521A] transition-colors whitespace-nowrap">
                  View All <ChevronRight className="w-4 h-4 3xl:w-5 3xl:h-5" />
                </Link>
              </div>

              {txList.length > 0 ? (
                <motion.div variants={stagger} initial="hidden" animate="visible"
                  className="bg-white dark:bg-zinc-900 rounded-2xl 3xl:rounded-3xl
                             border border-[#FFE8DC] dark:border-zinc-800
                             shadow-[0_2px_14px_rgba(0,0,0,0.05)] overflow-hidden">
                  {txList.slice(0, 3).map((tx) => {
                    const isCredit = tx.amount > 0;
                    return (
                      <motion.div key={tx._id} variants={fadeUp}
                        className="flex items-center gap-4 3xl:gap-5 p-4 sm:p-5 3xl:p-6
                                   border-b border-[#FFF5F0] dark:border-zinc-800 last:border-0
                                   hover:bg-[#FFFAF8] dark:hover:bg-zinc-800/50 transition-colors cursor-pointer">
                        <div className={`w-11 h-11 3xl:w-13 3xl:h-13 rounded-2xl flex items-center justify-center shrink-0 ${
                          isCredit ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-red-50 dark:bg-red-950/30'
                        }`}>
                          {isCredit
                            ? <ArrowDownLeft className="w-5 h-5 3xl:w-6 3xl:h-6 text-emerald-500" />
                            : <ArrowUpRight  className="w-5 h-5 3xl:w-6 3xl:h-6 text-red-500"     />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <p className="text-sm 3xl:text-base font-black text-[#1C1917] dark:text-white truncate">
                              {tx.description || (isCredit ? 'Money added' : 'Payment')}
                            </p>
                            <TxStatus status={tx.status} />
                          </div>
                          <p className="text-xs 3xl:text-sm text-[#A8A29E] font-medium">{formatDate(tx.createdAt)}</p>
                        </div>
                        <span className={`text-sm 3xl:text-base font-black shrink-0 ${
                          isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                        }`}>
                          {isCredit ? '+' : ''}{formatCurrency(tx.amount)}
                        </span>
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                /* Empty state */
                <div className="bg-white dark:bg-zinc-900 rounded-2xl 3xl:rounded-3xl
                                border border-[#FFE8DC] dark:border-zinc-800
                                py-10 3xl:py-14 px-6 text-center
                                shadow-[0_2px_14px_rgba(0,0,0,0.05)]">
                  <div className="w-14 h-14 3xl:w-16 3xl:h-16 rounded-3xl bg-[#FFF5F0] dark:bg-zinc-800
                                  border border-[#FFE8DC] dark:border-zinc-700
                                  flex items-center justify-center mx-auto mb-3">
                    <Wallet className="w-7 h-7 3xl:w-8 3xl:h-8 text-[#FF6B35]" />
                  </div>
                  <p className="text-sm 3xl:text-base font-black text-[#1C1917] dark:text-white mb-1">No Transactions Yet</p>
                  <p className="text-xs 3xl:text-sm text-[#A8A29E] font-medium max-w-[200px] mx-auto">
                    Add money and start paying instantly at restaurants.
                  </p>
                </div>
              )}
            </motion.div>

            {/* ── Cashback Promo (mobile only — shown below add money on desktop) ── */}
            <motion.div
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="lg:hidden relative rounded-2xl overflow-hidden cursor-pointer group"
              style={{ background: 'linear-gradient(120deg,#1E130C 0%,#2D1A0C 100%)' }}
            >
              <div className="absolute -top-6 -right-6 w-28 h-28 bg-[#FF6B35]/20 rounded-full blur-xl pointer-events-none" />
              <div className="relative flex items-center gap-4 p-4 sm:p-5">
                <div className="w-12 h-12 rounded-2xl bg-[#FF6B35]/20 border border-[#FF6B35]/30 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-[#FF6B35]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-white mb-0.5">🎁 2% Cashback on every top-up</p>
                  <p className="text-xs text-zinc-400 font-medium">Use your wallet — earn rewards automatically</p>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-[#FF6B35] transition-colors shrink-0" />
              </div>
            </motion.div>

          </div>

          {/* ════════════════════════════════════════════════════
              RIGHT COLUMN — Add money (sticky on desktop)
          ════════════════════════════════════════════════════ */}
          <div className="lg:col-span-2 xl:col-span-1">
            <div className="lg:sticky lg:top-6 space-y-5 2xl:space-y-6">

              {/* ── Add Money Card ── */}
              <motion.div
                initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white dark:bg-zinc-900 rounded-3xl 3xl:rounded-[2rem]
                           border border-[#FFE8DC] dark:border-zinc-800
                           shadow-[0_4px_28px_rgba(255,107,53,0.07)] p-5 sm:p-6 3xl:p-8"
              >
                {/* Header */}
                <div className="flex items-center gap-2.5 mb-5 3xl:mb-7">
                  <div className="w-9 h-9 3xl:w-11 3xl:h-11 rounded-xl 3xl:rounded-2xl bg-[#FFF5F0] dark:bg-zinc-800
                                  border border-[#FFE8DC] dark:border-zinc-700 flex items-center justify-center">
                    <Plus className="w-4 h-4 3xl:w-5 3xl:h-5 text-[#FF6B35]" />
                  </div>
                  <div>
                    <h2 className="text-base 3xl:text-lg font-black text-[#1C1917] dark:text-white leading-tight">Add Money</h2>
                    <p className="text-[11px] 3xl:text-xs text-[#A8A29E] font-medium">Choose or enter custom amount</p>
                  </div>
                </div>

                {/* Amount buttons */}
                <div className="grid grid-cols-3 gap-2 3xl:gap-3 mb-4 3xl:mb-5">
                  {TOP_UP_AMOUNTS.map((amt) => {
                    const isSelected = selectedAmount === amt && !customAmount;
                    return (
                      <motion.button
                        key={amt}
                        onClick={() => { setSelectedAmount(amt); setCustomAmount(''); }}
                        whileHover={{ scale: 1.04, y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        className={`py-2.5 3xl:py-3.5 rounded-xl 3xl:rounded-2xl text-xs 3xl:text-sm font-black
                                    transition-all duration-200 border ${
                          isSelected
                            ? 'bg-gradient-to-br from-[#FF6B35] to-[#FF4D0F] text-white border-transparent shadow-[0_4px_14px_rgba(255,107,53,0.35)]'
                            : 'bg-[#FFF8F5] dark:bg-zinc-800 border-[#FFE8DC] dark:border-zinc-700 text-[#1C1917] dark:text-white hover:border-[#FF6B35] hover:bg-[#FFF5F0]'
                        }`}
                      >
                        {formatCurrency(amt)}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Custom input */}
                <div className="relative mb-4 3xl:mb-5">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A8A29E] font-black text-base 3xl:text-lg select-none">₹</span>
                  <input
                    type="number"
                    placeholder="Enter custom amount"
                    value={customAmount}
                    min={1}
                    onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                    className="w-full h-12 3xl:h-14 pl-9 pr-4 rounded-2xl 3xl:rounded-3xl
                               border border-[#FFE8DC] dark:border-zinc-700
                               bg-[#FFF8F5] dark:bg-zinc-800
                               text-sm 3xl:text-base font-bold text-[#1C1917] dark:text-white
                               placeholder:text-[#C4B5AE] outline-none
                               focus:border-[#FF6B35] focus:ring-4 focus:ring-[#FF6B35]/10
                               transition-all duration-200"
                  />
                </div>

                {/* Amount preview chip */}
                <AnimatePresence>
                  {amount > 0 && (
                    <motion.div key="preview"
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4 3xl:mb-5">
                      <div className="flex items-center justify-between bg-[#FFF5F0] dark:bg-zinc-800
                                      border border-[#FFE8DC] dark:border-zinc-700 rounded-2xl px-4 py-3 3xl:py-3.5">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-[#FF6B35]" />
                          <span className="text-xs 3xl:text-sm font-bold text-[#78716C] dark:text-zinc-400">Adding to wallet</span>
                        </div>
                        <span className="text-sm 3xl:text-base font-black text-[#FF6B35]">{formatCurrency(amount)}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* CTA */}
                <motion.button
                  whileHover={amount > 0 ? { scale: 1.01, y: -1 } : {}}
                  whileTap={amount > 0 ? { scale: 0.98 } : {}}
                  disabled={amount <= 0 || topUpMutation.isPending}
                  onClick={() => topUpMutation.mutate(amount)}
                  className={`w-full py-3.5 3xl:py-4.5 rounded-2xl 3xl:rounded-3xl text-sm 3xl:text-base font-black
                               transition-all duration-200 flex items-center justify-center gap-2 ${
                    amount > 0
                      ? 'bg-gradient-to-r from-[#FF6B35] to-[#FF4D0F] text-white shadow-[0_8px_24px_rgba(255,107,53,0.35)] hover:shadow-[0_14px_36px_rgba(255,107,53,0.45)]'
                      : 'bg-[#F5EDE8] dark:bg-zinc-800 text-[#C4B5AE] dark:text-zinc-600 cursor-not-allowed'
                  }`}
                >
                  {topUpMutation.isPending ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 3xl:w-5 3xl:h-5" />
                      {amount > 0 ? `Add ${formatCurrency(amount)}` : 'Select an Amount'}
                    </>
                  )}
                </motion.button>

                <div className="flex items-center gap-2 mt-4 justify-center">
                  <Shield className="w-3 h-3 text-[#A8A29E]" />
                  <p className="text-[10px] 3xl:text-xs text-[#A8A29E] font-medium">Secured by Razorpay · 256-bit encryption</p>
                </div>
              </motion.div>

              {/* ── Cashback promo (desktop only) ── */}
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 }}
                className="hidden lg:block relative rounded-2xl 3xl:rounded-3xl overflow-hidden cursor-pointer group"
                style={{ background: 'linear-gradient(120deg,#1E130C 0%,#2D1A0C 100%)' }}
              >
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#FF6B35]/20 rounded-full blur-xl pointer-events-none" />
                <div className="relative flex items-start gap-3.5 p-5 3xl:p-6">
                  <div className="w-11 h-11 3xl:w-13 3xl:h-13 rounded-2xl bg-[#FF6B35]/20 border border-[#FF6B35]/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-5 h-5 3xl:w-6 3xl:h-6 text-[#FF6B35]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm 3xl:text-base font-black text-white mb-1">🎁 2% Cashback on every top-up</p>
                    <p className="text-xs 3xl:text-sm text-zinc-400 font-medium leading-relaxed">
                      Use your QuickBite Wallet and earn rewards automatically on every transaction.
                    </p>
                    <button className="mt-3 text-[11px] 3xl:text-xs font-bold text-[#FF6B35] flex items-center gap-1 hover:text-[#E8521A] transition-colors">
                      Learn more <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* ── Ratings card ── */}
              <motion.div
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 }}
                className="hidden lg:flex items-center gap-3 bg-white dark:bg-zinc-900
                           border border-[#FFE8DC] dark:border-zinc-800 rounded-2xl 3xl:rounded-3xl
                           p-4 3xl:p-5 shadow-sm"
              >
                <div className="w-10 h-10 3xl:w-12 3xl:h-12 rounded-xl 3xl:rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 flex items-center justify-center shrink-0">
                  <Star className="w-4 h-4 3xl:w-5 3xl:h-5 text-amber-500 fill-amber-500" />
                </div>
                <div>
                  <p className="text-sm 3xl:text-base font-black text-[#1C1917] dark:text-white">4.9★ Trusted Payments</p>
                  <p className="text-[10px] 3xl:text-xs text-[#A8A29E] font-medium">Over 50,000 transactions secured</p>
                </div>
              </motion.div>

            </div>
          </div>

        </div>
        {/* Bottom spacing */}
        <div className="h-12 3xl:h-16" />
      </div>
    </div>
  );
}
