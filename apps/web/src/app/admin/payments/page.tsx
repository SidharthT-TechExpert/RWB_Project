'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import api from '@/lib/api';
import { formatDate, formatCurrency, cn } from '@/lib/utils';

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'destructive' | 'secondary' | 'info'> = {
  completed: 'success', pending: 'warning', failed: 'destructive',
  refunded: 'info', processing: 'warning',
};

export default function AdminPaymentsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'payments', page],
    queryFn: async () => {
      // In full implementation: api.get('/admin/payments', { params: { page } })
      return { data: [], meta: { total: 0, page: 1, totalPages: 1 } };
    },
  });

  const payments = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Payments</h1>
      </div>

      {/* Summary */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Processed', value: '—', icon: TrendingUp, color: 'bg-green-100 text-green-600' },
          { label: 'Pending', value: '—', icon: CreditCard, color: 'bg-yellow-100 text-yellow-600' },
          { label: 'Refunded', value: '—', icon: CreditCard, color: 'bg-red-100 text-red-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="p-5 rounded-2xl border bg-card flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}><Icon className="h-5 w-5" /></div>
            <div><p className="text-xl font-bold">{value}</p><p className="text-sm text-muted-foreground">{label}</p></div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>{['Payment #', 'User', 'Amount', 'Method', 'Status', 'Date'].map((h) => (
              <th key={h} className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase whitespace-nowrap">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? Array.from({ length: 6 }).map((_, i) => (
              <tr key={i}>{Array.from({ length: 6 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td>)}</tr>
            )) : payments.length > 0 ? payments.map((p: {
              _id: string; paymentNumber: string; userId: string; amount: number;
              method: string; status: string; createdAt: string;
            }) => (
              <tr key={p._id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-semibold">{p.paymentNumber}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground truncate max-w-[100px]">{p.userId.slice(0, 12)}…</td>
                <td className="px-4 py-3 font-semibold text-brand-500">{formatCurrency(p.amount)}</td>
                <td className="px-4 py-3 capitalize text-muted-foreground">{p.method}</td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_COLORS[p.status] || 'secondary'} className="text-xs capitalize">{p.status}</Badge>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(p.createdAt)}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
                  <CreditCard className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>No payments to display</p>
                  <p className="text-xs mt-1">Connect the payment-service admin API to populate this table</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
