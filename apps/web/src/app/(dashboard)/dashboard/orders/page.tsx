'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Clock, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { formatCurrency, orderStatusColors, cn } from '@/lib/utils';
import { useMyRestaurants } from '@/hooks/useRestaurants';
import toast from 'react-hot-toast';

const STATUS_PIPELINE = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];

export default function DashboardOrdersPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const { data: restaurants } = useMyRestaurants();
  const restaurantId = restaurants?.data?.[0]?._id;
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'orders', restaurantId, statusFilter],
    queryFn: async () => {
      const { data } = await api.get(`/orders/restaurant/${restaurantId}`, {
        params: { status: statusFilter || undefined, limit: 50 },
      });
      return data;
    },
    enabled: !!restaurantId,
    refetchInterval: 30 * 1000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) =>
      api.patch(`/orders/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dashboard', 'orders'] });
      toast.success('Order status updated');
    },
    onError: () => toast.error('Failed to update status'),
  });

  const orders = data?.data || [];

  const getNextStatus = (current: string) => {
    const idx = STATUS_PIPELINE.indexOf(current);
    return idx >= 0 && idx < STATUS_PIPELINE.length - 1 ? STATUS_PIPELINE[idx + 1] : null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-muted-foreground text-sm mt-1">Live kitchen view — auto-refreshes every 30s</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-muted-foreground">Live</span>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['', ...STATUS_PIPELINE].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              'shrink-0 px-4 py-2 rounded-xl text-sm font-medium border transition-all capitalize',
              statusFilter === s ? 'bg-brand-500 text-white border-brand-500' : 'border-border hover:border-brand-300'
            )}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Kanban-style columns for active orders */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {['pending', 'preparing', 'ready'].map((col) => (
          <div key={col} className="rounded-2xl border bg-muted/30 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold capitalize flex items-center gap-2">
                {col === 'pending' && '🆕'}
                {col === 'preparing' && '👨‍🍳'}
                {col === 'ready' && '✅'}
                {col}
              </h3>
              <span className="text-xs bg-muted px-2 py-1 rounded-full font-medium">
                {orders.filter((o: { status: string }) => o.status === col).length}
              </span>
            </div>
            <div className="space-y-3">
              {orders
                .filter((o: { status: string }) => o.status === col)
                .map((order: {
                  _id: string;
                  orderNumber: string;
                  items: Array<{ name: string; quantity: number; status: string }>;
                  total: number;
                  createdAt: string;
                  status: string;
                }) => {
                  const next = getNextStatus(order.status);
                  return (
                    <motion.div
                      key={order._id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-card rounded-xl border p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold">#{order.orderNumber}</span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div className="space-y-1">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{item.name} ×{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="font-bold text-brand-500">{formatCurrency(order.total)}</span>
                        {next && (
                          <Button
                            size="sm"
                            className="h-7 px-3 text-xs capitalize"
                            onClick={() => updateStatusMutation.mutate({ id: order._id, status: next })}
                            isLoading={updateStatusMutation.isPending}
                          >
                            Mark {next}
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              {orders.filter((o: { status: string }) => o.status === col).length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">No {col} orders</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* All orders table */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold">All Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                {['Order #', 'Items', 'Total', 'Status', 'Time', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 6 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td>)}</tr>
                  ))
                : orders.map((order: {
                    _id: string;
                    orderNumber: string;
                    items: Array<{ name: string; quantity: number }>;
                    total: number;
                    status: string;
                    createdAt: string;
                  }) => {
                    const next = getNextStatus(order.status);
                    return (
                      <tr key={order._id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs font-semibold">{order.orderNumber}</td>
                        <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">
                          {order.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
                        </td>
                        <td className="px-4 py-3 font-semibold text-brand-500">{formatCurrency(order.total)}</td>
                        <td className="px-4 py-3">
                          <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium capitalize', orderStatusColors[order.status])}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-3">
                          {next && (
                            <Button size="sm" className="h-7 px-2.5 text-xs capitalize"
                              onClick={() => updateStatusMutation.mutate({ id: order._id, status: next })}>
                              → {next}
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
          {!isLoading && orders.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">No orders found</div>
          )}
        </div>
      </div>
    </div>
  );
}
