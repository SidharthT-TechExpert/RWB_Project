'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Tag, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import api from '@/lib/api';
import { formatDate, cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/lib/utils';

const couponSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  description: z.string().min(5).max(200),
  type: z.enum(['percentage', 'fixed', 'free_delivery']),
  value: z.coerce.number().min(0),
  minOrderAmount: z.coerce.number().min(0).default(0),
  maxDiscount: z.coerce.number().min(0).optional(),
  usageLimit: z.coerce.number().min(0).default(0),
  perUserLimit: z.coerce.number().min(1).default(1),
  validFrom: z.string().min(1),
  validUntil: z.string().min(1),
});
type CouponForm = z.infer<typeof couponSchema>;

export default function AdminCouponsPage() {
  const [showForm, setShowForm] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: async () => { const { data } = await api.get('/admin/coupons'); return data; },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CouponForm) => { const { data: res } = await api.post('/admin/coupons', data); return res; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'coupons'] }); toast.success('Coupon created'); setShowForm(false); reset(); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/admin/coupons/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'coupons'] }); toast.success('Coupon deleted'); },
  });

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<CouponForm>({
    resolver: zodResolver(couponSchema),
    defaultValues: { type: 'percentage', usageLimit: 0, perUserLimit: 1, minOrderAmount: 0 },
  });
  const type = watch('type');
  const coupons = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Coupons</h1>
        <Button className="gap-2" onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X className="h-4 w-4" /> Cancel</> : <><Plus className="h-4 w-4" /> Create Coupon</>}
        </Button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="rounded-2xl border bg-card p-6 space-y-5">
              <h2 className="font-semibold">New Coupon</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Input label="Code" placeholder="SAVE20" error={errors.code?.message} {...register('code')} />
                <div>
                  <label className="block text-sm font-medium mb-1.5">Type</label>
                  <select className="h-11 w-full px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" {...register('type')}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                    <option value="free_delivery">Free Delivery</option>
                  </select>
                </div>
                <Input label={type === 'percentage' ? 'Discount %' : 'Discount Amount'} type="number" error={errors.value?.message} {...register('value')} />
                <Input label="Min Order Amount (₹)" type="number" {...register('minOrderAmount')} />
                {type === 'percentage' && <Input label="Max Discount (₹)" type="number" {...register('maxDiscount')} />}
                <Input label="Usage Limit (0 = unlimited)" type="number" {...register('usageLimit')} />
                <Input label="Per User Limit" type="number" {...register('perUserLimit')} />
                <Input label="Valid From" type="date" error={errors.validFrom?.message} {...register('validFrom')} />
                <Input label="Valid Until" type="date" error={errors.validUntil?.message} {...register('validUntil')} />
              </div>
              <Input label="Description" placeholder="Get 20% off on your first order" error={errors.description?.message} {...register('description')} />
              <Button type="submit" isLoading={createMutation.isPending}>Create Coupon</Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coupons table */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>{['Code', 'Type', 'Value', 'Used', 'Valid Until', 'Status', 'Actions'].map((h) => (
              <th key={h} className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase whitespace-nowrap">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? Array.from({ length: 4 }).map((_, i) => (
              <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td>)}</tr>
            )) : coupons.length > 0 ? coupons.map((c: {
              _id: string; code: string; type: string; value: number;
              usedCount: number; usageLimit: number; validUntil: string; isActive: boolean;
            }) => {
              const expired = new Date(c.validUntil) < new Date();
              return (
                <tr key={c._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-brand-600">{c.code}</td>
                  <td className="px-4 py-3 capitalize">{c.type.replace('_', ' ')}</td>
                  <td className="px-4 py-3 font-semibold">{c.type === 'percentage' ? `${c.value}%` : c.type === 'fixed' ? `₹${c.value}` : 'Free'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.usedCount}/{c.usageLimit || '∞'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(c.validUntil)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={expired ? 'destructive' : c.isActive ? 'success' : 'secondary'} className="text-xs">
                      {expired ? 'Expired' : c.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => deleteMutation.mutate(c._id)} isLoading={deleteMutation.isPending}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No coupons yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
