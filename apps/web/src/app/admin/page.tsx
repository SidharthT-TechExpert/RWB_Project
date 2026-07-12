'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, UtensilsCrossed, CalendarCheck, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

function StatCard({ label, value, icon: Icon, color, change }: { label: string; value: string | number; icon: React.ElementType; color: string; change?: string }) {
  return (
    <motion.div whileHover={{ y: -2 }} className="p-6 rounded-2xl border bg-card">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}><Icon className="h-5 w-5" /></div>
        {change && <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">{change}</span>}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </motion.div>
  );
}

export default function AdminDashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => { const { data } = await api.get('/admin/dashboard'); return data.data; },
    staleTime: 2 * 60 * 1000,
  });

  const { data: pendingRestaurants } = useQuery({
    queryKey: ['admin', 'restaurants', 'pending'],
    queryFn: async () => { const { data } = await api.get('/admin/restaurants/pending'); return data; },
  });

  const { data: analytics } = useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: async () => {
      const end = new Date().toISOString().split('T')[0];
      const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const { data } = await api.get('/analytics/platform', { params: { startDate: start, endDate: end } });
      return data.data;
    },
  });

  const statCards = [
    { label: 'Total Restaurants', value: stats?.totalRestaurants || 0, icon: UtensilsCrossed, color: 'bg-orange-100 text-orange-600', change: '+5%' },
    { label: 'Active Coupons', value: stats?.activeCoupons || 0, icon: TrendingUp, color: 'bg-purple-100 text-purple-600' },
    { label: 'Pending Approvals', value: pendingRestaurants?.meta?.total || 0, icon: Clock, color: 'bg-yellow-100 text-yellow-600' },
    { label: '30-day Revenue', value: formatCurrency(analytics?.revenueStats?.totalRevenue || 0), icon: TrendingUp, color: 'bg-green-100 text-green-600', change: '+12%' },
  ];

  const pending = pendingRestaurants?.data || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform overview</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <StatCard {...card} />
          </motion.div>
        ))}
      </div>

      {/* Pending restaurant approvals */}
      <div className="rounded-2xl border bg-card p-6">
        <h2 className="font-semibold text-lg mb-5 flex items-center gap-2">
          <Clock className="h-5 w-5 text-yellow-500" /> Pending Restaurant Approvals
          {pending.length > 0 && <span className="ml-auto text-xs bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full font-medium">{pending.length} pending</span>}
        </h2>
        {pending.length > 0 ? (
          <div className="space-y-3">
            {pending.slice(0, 5).map((r: { _id: string; name: string; address: { city: string }; ownerId: string; createdAt: string }) => (
              <ApprovalRow key={r._id} restaurant={r} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-10 w-10 mx-auto mb-2 text-green-400" />
            <p className="text-sm">All restaurants reviewed</p>
          </div>
        )}
      </div>

      {/* User growth */}
      {analytics?.userGrowth?.length > 0 && (
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="font-semibold text-lg mb-5 flex items-center gap-2">
            <Users className="h-5 w-5 text-brand-500" /> New Users (Last 30 Days)
          </h2>
          <div className="space-y-2">
            {analytics.userGrowth.slice(-7).map((day: { _id: string; count: number }) => {
              const max = Math.max(...analytics.userGrowth.map((d: { count: number }) => d.count));
              return (
                <div key={day._id} className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground w-20 shrink-0">{day._id}</span>
                  <div className="flex-1 h-6 bg-muted rounded-lg overflow-hidden">
                    <div className="h-full brand-gradient rounded-lg" style={{ width: `${(day.count / (max || 1)) * 100}%` }} />
                  </div>
                  <span className="text-xs font-semibold w-8 text-right">{day.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ApprovalRow({ restaurant }: { restaurant: { _id: string; name: string; address: { city: string }; ownerId: string; createdAt: string } }) {
  const { mutate: approve, isPending: approving } = useApproveRestaurant();
  const { mutate: reject, isPending: rejecting } = useRejectRestaurant();

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border">
      <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
        <UtensilsCrossed className="h-5 w-5 text-orange-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{restaurant.name}</p>
        <p className="text-xs text-muted-foreground">{restaurant.address?.city}</p>
      </div>
      <div className="flex gap-2 shrink-0">
        <button onClick={() => reject({ id: restaurant._id })} disabled={rejecting}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-destructive text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50">
          Reject
        </button>
        <button onClick={() => approve(restaurant._id)} disabled={approving}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50">
          {approving ? '...' : 'Approve'}
        </button>
      </div>
    </div>
  );
}

function useApproveRestaurant() {
  const { useMutation, useQueryClient } = require('@tanstack/react-query');
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.patch(`/admin/restaurants/${id}/approve`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'restaurants'] }),
  });
}

function useRejectRestaurant() {
  const { useMutation, useQueryClient } = require('@tanstack/react-query');
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => api.patch(`/admin/restaurants/${id}/reject`, { reason: 'Does not meet requirements' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'restaurants'] }),
  });
}
