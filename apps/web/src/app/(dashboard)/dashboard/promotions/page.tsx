'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Tag, Calendar, Percent, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import api from '@/lib/api';
import { formatDate, formatCurrency, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function DashboardPromotionsPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      const { data } = await api.get('/admin/coupons');
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/admin/coupons/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['coupons'] }); toast.success('Coupon deleted'); },
    onError: () => toast.error('Failed to delete coupon'),
  });

  const coupons = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Promotions & Coupons</h1>
        <Button className="gap-2" onClick={() => toast('Use the admin panel to create coupons', { icon: 'ℹ️' })}>
          <Plus className="h-4 w-4" /> Create Coupon
        </Button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Coupons', value: coupons.length, icon: Tag, color: 'bg-blue-100 text-blue-600' },
          { label: 'Active', value: coupons.filter((c: { isActive: boolean }) => c.isActive).length, icon: Percent, color: 'bg-green-100 text-green-600' },
          { label: 'Expired', value: coupons.filter((c: { validUntil: string }) => new Date(c.validUntil) < new Date()).length, icon: Calendar, color: 'bg-red-100 text-red-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="p-5 rounded-2xl border bg-card flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Coupons list */}
      <div className="space-y-3">
        {isLoading ? Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />
        )) : coupons.length > 0 ? coupons.map((coupon: {
          _id: string;
          code: string;
          description: string;
          type: string;
          value: number;
          usedCount: number;
          usageLimit: number;
          validFrom: string;
          validUntil: string;
          isActive: boolean;
        }) => {
          const isExpired = new Date(coupon.validUntil) < new Date();
          return (
            <motion.div
              key={coupon._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl border bg-card flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center shrink-0">
                <Tag className="h-6 w-6 text-brand-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold text-sm">{coupon.code}</span>
                  <Badge variant={isExpired ? 'destructive' : coupon.isActive ? 'success' : 'secondary'} className="text-xs">
                    {isExpired ? 'Expired' : coupon.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{coupon.description}</p>
                <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                  <span>
                    {coupon.type === 'percentage' ? `${coupon.value}% off` :
                     coupon.type === 'fixed' ? `${formatCurrency(coupon.value)} off` : 'Free delivery'}
                  </span>
                  <span>Used: {coupon.usedCount}/{coupon.usageLimit || '∞'}</span>
                  <span>Valid: {formatDate(coupon.validFrom)} – {formatDate(coupon.validUntil)}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/10 shrink-0"
                onClick={() => deleteMutation.mutate(coupon._id)}
                isLoading={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.div>
          );
        }) : (
          <div className="text-center py-16 text-muted-foreground">
            <Tag className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="font-semibold">No coupons yet</p>
            <p className="text-sm mt-1">Create coupons to attract more customers</p>
          </div>
        )}
      </div>
    </div>
  );
}
