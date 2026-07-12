'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Check, X, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { formatDate, formatCurrency, bookingStatusColors, cn } from '@/lib/utils';
import { useMyRestaurants } from '@/hooks/useRestaurants';
import toast from 'react-hot-toast';

export default function DashboardBookingsPage() {
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('');
  const { data: restaurants } = useMyRestaurants();
  const restaurantId = restaurants?.data?.[0]?._id;
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'bookings', restaurantId, dateFilter, statusFilter],
    queryFn: async () => {
      const { data } = await api.get(`/bookings/restaurant/${restaurantId}`, {
        params: { date: dateFilter, status: statusFilter || undefined, limit: 50 },
      });
      return data;
    },
    enabled: !!restaurantId,
    refetchInterval: 30 * 1000,
  });

  const confirmMutation = useMutation({
    mutationFn: async (id: string) => api.patch(`/bookings/${id}/confirm`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['dashboard', 'bookings'] }); toast.success('Booking confirmed'); },
  });

  const checkInMutation = useMutation({
    mutationFn: async (id: string) => api.patch(`/bookings/${id}/check-in`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['dashboard', 'bookings'] }); toast.success('Checked in'); },
  });

  const completeMutation = useMutation({
    mutationFn: async (id: string) => api.patch(`/bookings/${id}/complete`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['dashboard', 'bookings'] }); toast.success('Booking completed'); },
  });

  const bookings = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Bookings</h1>
        <div className="flex gap-3">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All Status</option>
            {['pending', 'confirmed', 'checked_in', 'completed', 'cancelled'].map((s) => (
              <option key={s} value={s} className="capitalize">{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              {['Booking #', 'Time', 'Guests', 'Type', 'Pre-order', 'Status', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {Array.from({ length: 7 }).map((_, j) => (
                  <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                ))}
              </tr>
            )) : bookings.length > 0 ? bookings.map((b: {
              _id: string;
              bookingNumber: string;
              reservationTime: string;
              guestCount: number;
              type: string;
              total: number;
              status: string;
            }) => (
              <motion.tr key={b._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-semibold">{b.bookingNumber}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Clock className="h-3.5 w-3.5 text-brand-500" />{b.reservationTime}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />{b.guestCount}
                  </div>
                </td>
                <td className="px-4 py-3 capitalize">{b.type}</td>
                <td className="px-4 py-3 font-medium">{b.total > 0 ? formatCurrency(b.total) : '—'}</td>
                <td className="px-4 py-3">
                  <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium capitalize', bookingStatusColors[b.status])}>
                    {b.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    {b.status === 'pending' && (
                      <Button size="sm" className="h-7 px-2.5 text-xs gap-1" onClick={() => confirmMutation.mutate(b._id)} isLoading={confirmMutation.isPending}>
                        <Check className="h-3 w-3" /> Confirm
                      </Button>
                    )}
                    {b.status === 'confirmed' && (
                      <Button size="sm" className="h-7 px-2.5 text-xs gap-1" onClick={() => checkInMutation.mutate(b._id)} isLoading={checkInMutation.isPending}>
                        <LogIn className="h-3 w-3" /> Check In
                      </Button>
                    )}
                    {b.status === 'checked_in' && (
                      <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs gap-1" onClick={() => completeMutation.mutate(b._id)} isLoading={completeMutation.isPending}>
                        <Check className="h-3 w-3" /> Complete
                      </Button>
                    )}
                  </div>
                </td>
              </motion.tr>
            )) : (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No bookings found for this date</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
