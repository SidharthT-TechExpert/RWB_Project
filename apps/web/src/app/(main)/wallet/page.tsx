'use client';
export const dynamic = 'force-dynamic';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Wallet, Plus, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useState } from 'react';
import toast from 'react-hot-toast';

const TOP_UP_AMOUNTS = [100, 200, 500, 1000, 2000];

export default function WalletPage() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');

  const { data: walletData, refetch } = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => { const { data } = await api.get('/users/wallet'); return data.data; },
  });

  const { data: transactions } = useQuery({
    queryKey: ['wallet', 'transactions'],
    queryFn: async () => { const { data } = await api.get('/payments/my?type=wallet'); return data; },
  });

  const topUpMutation = useMutation({
    mutationFn: async (amount: number) => {
      const { data } = await api.post('/payments/razorpay/order', { amount, type: 'wallet' });
      return data.data;
    },
    onSuccess: () => { refetch(); toast.success('Wallet topped up!'); },
    onError: () => toast.error('Top-up failed'),
  });

  const amount = selectedAmount || Number(customAmount) || 0;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Balance card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="brand-gradient rounded-3xl p-8 text-white relative overflow-hidden"
      >
        <div className="absolute top-4 right-4 opacity-20">
          <Wallet className="h-24 w-24" />
        </div>
        <p className="text-white/80 text-sm font-medium mb-2">Available Balance</p>
        <p className="text-5xl font-bold">{formatCurrency(walletData?.balance || 0)}</p>
        <p className="text-white/60 text-xs mt-3">QuickBite Wallet</p>
      </motion.div>

      {/* Top-up */}
      <div className="rounded-2xl border p-6 bg-card space-y-5">
        <h2 className="font-semibold text-lg flex items-center gap-2"><Plus className="h-5 w-5 text-brand-500" /> Add Money</h2>

        <div className="grid grid-cols-3 gap-3">
          {TOP_UP_AMOUNTS.map((amt) => (
            <button
              key={amt}
              onClick={() => { setSelectedAmount(amt); setCustomAmount(''); }}
              className={`py-3 rounded-xl border font-semibold text-sm transition-all ${selectedAmount === amt && !customAmount ? 'bg-brand-500 text-white border-brand-500' : 'border-border hover:border-brand-300'}`}
            >
              {formatCurrency(amt)}
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="number"
            placeholder="Enter custom amount"
            value={customAmount}
            onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
            className="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <Button
          className="w-full"
          size="lg"
          disabled={amount <= 0}
          isLoading={topUpMutation.isPending}
          onClick={() => topUpMutation.mutate(amount)}
        >
          Add {amount > 0 ? formatCurrency(amount) : 'Money'}
        </Button>
      </div>

      {/* Transaction history */}
      <div className="space-y-3">
        <h2 className="font-semibold">Transaction History</h2>
        {transactions?.data?.length > 0 ? transactions.data.map((tx: {
          _id: string;
          amount: number;
          method: string;
          status: string;
          createdAt: string;
          description?: string;
        }) => (
          <div key={tx._id} className="flex items-center gap-4 p-4 rounded-xl border bg-card">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {tx.amount > 0 ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{tx.description || (tx.amount > 0 ? 'Money added' : 'Payment')}</p>
              <p className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</p>
            </div>
            <span className={`font-semibold text-sm ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
            </span>
          </div>
        )) : (
          <div className="text-center py-10 text-muted-foreground">
            <p className="text-sm">No transactions yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
