'use client';
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Check, X, Pause, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
  active: 'success', pending: 'warning', suspended: 'destructive', rejected: 'destructive', inactive: 'secondary',
};

export default function AdminRestaurantsPage() {
  const [statusFilter, setStatusFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'restaurants', statusFilter, search],
    queryFn: async () => {
      const { data } = await api.get('/restaurants', { params: { status: statusFilter || undefined, city: search || undefined, limit: 50 } });
      return data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => api.patch(`/admin/restaurants/${id}/approve`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'restaurants'] }); toast.success('Restaurant approved'); },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => api.patch(`/admin/restaurants/${id}/reject`, { reason: 'Does not meet requirements' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'restaurants'] }); toast.success('Restaurant rejected'); },
  });

  const suspendMutation = useMutation({
    mutationFn: async (id: string) => api.patch(`/admin/restaurants/${id}/suspend`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'restaurants'] }); toast.success('Restaurant suspended'); },
  });

  const restaurants = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Restaurants</h1>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by city..." className="pl-9 h-10 pr-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring w-48" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none">
            <option value="">All</option>
            {['pending', 'active', 'suspended', 'rejected'].map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
        </div>
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>{['Restaurant', 'City', 'Owner', 'Rating', 'Status', 'Actions'].map((h) => (
              <th key={h} className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase whitespace-nowrap">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>{Array.from({ length: 6 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td>)}</tr>
            )) : restaurants.length > 0 ? restaurants.map((r: {
              _id: string; name: string; address: { city: string }; ownerId: string;
              averageRating: number; status: string;
            }) => (
              <motion.tr key={r._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.address?.city}</td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground truncate max-w-[100px]">{r.ownerId?.slice(0, 12)}…</td>
                <td className="px-4 py-3">⭐ {r.averageRating?.toFixed(1) || '—'}</td>
                <td className="px-4 py-3">
                  <Badge variant={(STATUS_COLORS[r.status] as 'success' | 'warning' | 'destructive' | 'secondary') || 'secondary'} className="capitalize text-xs">
                    {r.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    {r.status === 'pending' && (
                      <>
                        <Button size="sm" className="h-7 px-2.5 text-xs bg-green-500 hover:bg-green-600 gap-1" onClick={() => approveMutation.mutate(r._id)} isLoading={approveMutation.isPending}>
                          <Check className="h-3 w-3" /> Approve
                        </Button>
                        <Button size="sm" variant="destructive" className="h-7 px-2.5 text-xs gap-1" onClick={() => rejectMutation.mutate(r._id)} isLoading={rejectMutation.isPending}>
                          <X className="h-3 w-3" /> Reject
                        </Button>
                      </>
                    )}
                    {r.status === 'active' && (
                      <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs gap-1 border-yellow-400 text-yellow-600" onClick={() => suspendMutation.mutate(r._id)} isLoading={suspendMutation.isPending}>
                        <Pause className="h-3 w-3" /> Suspend
                      </Button>
                    )}
                    {r.status === 'suspended' && (
                      <Button size="sm" className="h-7 px-2.5 text-xs bg-green-500 hover:bg-green-600 gap-1" onClick={() => approveMutation.mutate(r._id)}>
                        <Check className="h-3 w-3" /> Reinstate
                      </Button>
                    )}
                  </div>
                </td>
              </motion.tr>
            )) : (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No restaurants found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
