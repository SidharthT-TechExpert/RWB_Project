'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, Clock, RotateCcw, CheckCircle2, XCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import api from '@/lib/api';
import { formatDate, formatCurrency, orderStatusColors, cn } from '@/lib/utils';
import type { Order } from '@/hooks/useOrders';
import toast from 'react-hot-toast';

const STATUS_STEPS = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => { const { data } = await api.get(`/orders/${id}`); return data.data; },
    enabled: !!id,
    refetchInterval: (query) => {
      const data = query.state.data;
      return data && ['pending', 'confirmed', 'preparing', 'ready'].includes((data as Order).status) ? 30000 : false;
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async () => { const { data } = await api.post(`/orders/${id}/reorder`); return data.data; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['orders', 'mine'] }); toast.success('Reorder placed!'); },
    onError: () => toast.error('Failed to reorder'),
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-4">📦</p>
        <p className="font-semibold mb-4 text-muted-foreground">Order not found</p>
        <Link href="/orders"><Button>Back to Orders</Button></Link>
      </div>
    );
  }

  const stepIdx = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <Link href="/orders" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
        <ArrowLeft className="h-4 w-4" /> My Orders
      </Link>

      {/* Header */}
      <div className="p-5 rounded-2xl border bg-card">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h1 className="font-bold text-xl">{order.restaurantName}</h1>
            <p className="text-xs text-muted-foreground font-mono mt-1">#{order.orderNumber}</p>
          </div>
          <span className={cn('text-xs px-3 py-1.5 rounded-full font-semibold capitalize', orderStatusColors[order.status])}>
            {order.status}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{formatDate(order.createdAt)}</div>
          {order.estimatedCompletionTime && (
            <div className="flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5" />
              Ready by {new Date(order.estimatedCompletionTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      </div>

      {/* Progress tracker */}
      {order.status !== 'cancelled' && (
        <div className="p-5 rounded-2xl border bg-card">
          <h3 className="font-semibold mb-5">Order Progress</h3>
          <div className="relative">
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-muted" />
            <div
              className="absolute top-5 left-5 h-0.5 brand-gradient transition-all duration-500"
              style={{ width: stepIdx >= 0 ? `${(stepIdx / (STATUS_STEPS.length - 1)) * 100}%` : '0%' }}
            />
            <div className="relative flex justify-between">
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex flex-col items-center gap-2">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center border-2 bg-background z-10 transition-all',
                    i <= stepIdx ? 'border-brand-500 bg-brand-500' : 'border-muted'
                  )}>
                    {i < stepIdx ? <CheckCircle2 className="h-5 w-5 text-white" /> :
                     i === stepIdx ? <div className="w-3 h-3 rounded-full bg-white animate-pulse" /> :
                     <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />}
                  </div>
                  <span className={cn('text-xs font-medium capitalize text-center', i <= stepIdx ? 'text-brand-600 dark:text-brand-400' : 'text-muted-foreground')}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="p-5 rounded-2xl border bg-card">
        <h3 className="font-semibold mb-4">Order Items</h3>
        <div className="space-y-3">
          {order.items.map((item: { foodItemId?: string; _id: string; name: string; quantity: number; unitPrice: number; totalPrice: number }) => (
            <div key={item._id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-bold flex items-center justify-center">{item.quantity}</span>
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              <span className="text-sm font-semibold">{formatCurrency(item.totalPrice)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bill */}
      <div className="p-5 rounded-2xl border bg-card">
        <h3 className="font-semibold mb-4">Bill</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
          {order.tax > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>{formatCurrency(order.tax)}</span></div>}
          {order.serviceCharge > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Service charge</span><span>{formatCurrency(order.serviceCharge)}</span></div>}
          {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatCurrency(order.discount)}</span></div>}
          <div className="flex justify-between font-bold text-base pt-2 border-t">
            <span>Total</span><span className="text-brand-500">{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      {order.status === 'delivered' && (
        <Button className="w-full gap-2" variant="outline" onClick={() => reorderMutation.mutate()} isLoading={reorderMutation.isPending}>
          <RotateCcw className="h-4 w-4" /> Reorder
        </Button>
      )}
    </div>
  );
}
