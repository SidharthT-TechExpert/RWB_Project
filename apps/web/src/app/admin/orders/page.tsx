'use client';
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag } from 'lucide-react';
import api from '@/lib/api';
import { formatDate, formatCurrency, orderStatusColors, cn } from '@/lib/utils';

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders', statusFilter, page],
    queryFn: async () => {
      // Placeholder: wire to order-service admin endpoint
      return { data: [], meta: { total: 0, page: 1, totalPages: 1, hasNext: false, hasPrev: false } };
    },
  });

  const orders = data?.data || [];
  const STATUS_TABS = ['', 'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">All Orders</h1>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none">
          {STATUS_TABS.map((s) => <option key={s} value={s} className="capitalize">{s || 'All Status'}</option>)}
        </select>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_TABS.map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={cn('shrink-0 px-4 py-2 rounded-xl text-sm font-medium border transition-all capitalize',
              statusFilter === s ? 'bg-brand-500 text-white border-brand-500' : 'border-border hover:border-brand-300')}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              {['Order #', 'Restaurant', 'Items', 'Total', 'Status', 'Date'].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? Array.from({ length: 8 }).map((_, i) => (
              <tr key={i}>{Array.from({ length: 6 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td>)}</tr>
            )) : orders.length > 0 ? orders.map((o: {
              _id: string; orderNumber: string; restaurantName: string;
              items: Array<{ name: string; quantity: number }>;
              total: number; status: string; createdAt: string;
            }) => (
              <tr key={o._id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-bold">{o.orderNumber}</td>
                <td className="px-4 py-3 font-medium">{o.restaurantName}</td>
                <td className="px-4 py-3 text-muted-foreground max-w-[180px] truncate text-xs">
                  {o.items.map((i) => `${i.name}×${i.quantity}`).join(', ')}
                </td>
                <td className="px-4 py-3 font-semibold text-brand-500">{formatCurrency(o.total)}</td>
                <td className="px-4 py-3">
                  <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium capitalize', orderStatusColors[o.status])}>
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(o.createdAt)}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
                  <ShoppingBag className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No orders found</p>
                  <p className="text-xs mt-1">Wire the order-service admin endpoint to populate this view</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
