'use client';
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import api from '@/lib/api';
import { formatDate, formatCurrency, bookingStatusColors, cn } from '@/lib/utils';

export default function AdminBookingsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'bookings', statusFilter, dateFilter, page],
    queryFn: async () => {
      // Real impl would hit a cross-service admin endpoint
      // Placeholder until admin aggregation API is wired
      return { data: [], meta: { total: 0, page: 1, totalPages: 1, hasNext: false, hasPrev: false } };
    },
  });

  const bookings = data?.data || [];
  const STATUS_TABS = ['', 'pending', 'confirmed', 'completed', 'cancelled'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">All Bookings</h1>
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
            className="h-10 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none"
          >
            {STATUS_TABS.map((s) => (
              <option key={s} value={s} className="capitalize">{s || 'All Status'}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Status summary tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={cn(
              'shrink-0 px-4 py-2 rounded-xl text-sm font-medium border transition-all capitalize',
              statusFilter === s ? 'bg-brand-500 text-white border-brand-500' : 'border-border hover:border-brand-300'
            )}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              {['Booking #', 'Restaurant', 'Date', 'Time', 'Guests', 'Total', 'Status'].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : bookings.length > 0 ? (
              bookings.map((b: {
                _id: string; bookingNumber: string; restaurantName: string;
                reservationDate: string; reservationTime: string;
                guestCount: number; total: number; status: string;
              }) => (
                <tr key={b._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-bold">{b.bookingNumber}</td>
                  <td className="px-4 py-3 font-medium">{b.restaurantName}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(b.reservationDate)}</td>
                  <td className="px-4 py-3 font-semibold">{b.reservationTime}</td>
                  <td className="px-4 py-3 text-muted-foreground">{b.guestCount}</td>
                  <td className="px-4 py-3 font-semibold text-brand-500">{b.total > 0 ? formatCurrency(b.total) : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium capitalize', bookingStatusColors[b.status])}>
                      {b.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center text-muted-foreground">
                  <CalendarCheck className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No bookings found</p>
                  <p className="text-xs mt-1">Wire the booking-service admin endpoint to populate this view</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!data.meta.hasPrev}
            className="px-4 py-2 rounded-xl border text-sm font-medium disabled:opacity-40 hover:bg-muted">Previous</button>
          <span className="text-sm text-muted-foreground">Page {data.meta.page} of {data.meta.totalPages}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={!data.meta.hasNext}
            className="px-4 py-2 rounded-xl border text-sm font-medium disabled:opacity-40 hover:bg-muted">Next</button>
        </div>
      )}
    </div>
  );
}
