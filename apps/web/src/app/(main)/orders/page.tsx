'use client';
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, RotateCcw, ChevronRight } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { BookingCardSkeleton } from '@/components/ui/Skeleton';
import api from '@/lib/api';
import { formatDate, formatCurrency, orderStatusColors, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const STATUS_TABS = ['all', 'pending', 'preparing', 'ready', 'delivered', 'cancelled'];

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('all');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['orders', 'mine'],
    queryFn: async () => { const { data } = await api.get('/orders/my'); return data; },
    staleTime: 30 * 1000,
  });

  const reorderMutation = useMutation({
    mutationFn: async (id: string) => { const { data } = await api.post(`/orders/${id}/reorder`); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['orders', 'mine'] }); toast.success('Reorder placed!'); },
    onError: () => toast.error('Failed to reorder'),
  });

  const orders = (data?.data || []).filter((o: { status: string }) => activeTab === 'all' || o.status === activeTab);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold mb-8">My Orders</h1>

      <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide">
        {STATUS_TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn('shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize',
              activeTab === tab ? 'bg-brand-500 text-white' : 'bg-muted hover:bg-muted/80')}>
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {isLoading ? Array.from({ length: 3 }).map((_, i) => <BookingCardSkeleton key={i} />) :
          orders.length > 0 ? orders.map((order: {
            _id: string;
            orderNumber: string;
            restaurantName: string;
            status: string;
            items: Array<{ name: string; quantity: number }>;
            total: number;
            createdAt: string;
          }) => (
            <motion.div key={order._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl border bg-card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-semibold">{order.restaurantName}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">#{order.orderNumber}</p>
                </div>
                <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full capitalize', orderStatusColors[order.status])}>
                  {order.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                {order.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDate(order.createdAt)}
                  <span className="font-semibold text-foreground ml-1">{formatCurrency(order.total)}</span>
                </div>
                <div className="flex gap-2">
                  {order.status === 'delivered' && (
                    <Button size="sm" variant="outline" className="gap-1 h-8" onClick={() => reorderMutation.mutate(order._id)} isLoading={reorderMutation.isPending}>
                      <RotateCcw className="h-3 w-3" /> Reorder
                    </Button>
                  )}
                  <Link href={`/orders/${order._id}`}>
                    <Button size="sm" variant="ghost" className="gap-1 h-8">Details <ChevronRight className="h-3 w-3" /></Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-4xl mb-4">📦</p>
              <p className="font-semibold mb-2">No orders yet</p>
              <p className="text-sm mb-6">Pre-order food from your next booking!</p>
              <Link href="/restaurants"><Button>Explore Restaurants</Button></Link>
            </div>
          )}
      </div>
    </div>
  );
}
