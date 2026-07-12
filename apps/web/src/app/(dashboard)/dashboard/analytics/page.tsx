'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, CalendarCheck, ShoppingBag, Users } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useMyRestaurants } from '@/hooks/useRestaurants';

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <div className="p-6 rounded-2xl border bg-card">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

export default function DashboardAnalyticsPage() {
  const [range, setRange] = useState('month');
  const { data: restaurants } = useMyRestaurants();
  const restaurantId = restaurants?.data?.[0]?._id;

  const getDateRange = () => {
    const end = new Date();
    const start = new Date();
    if (range === 'week') start.setDate(start.getDate() - 7);
    else if (range === 'month') start.setMonth(start.getMonth() - 1);
    else start.setFullYear(start.getFullYear() - 1);
    return { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] };
  };

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', restaurantId, range],
    queryFn: async () => {
      const { data } = await api.get(`/analytics/restaurant/${restaurantId}`, { params: getDateRange() });
      return data.data;
    },
    enabled: !!restaurantId,
    staleTime: 5 * 60 * 1000,
  });

  const { data: salesReport } = useQuery({
    queryKey: ['analytics', 'sales', restaurantId, range],
    queryFn: async () => {
      const { data } = await api.get(`/analytics/restaurant/${restaurantId}/sales`, { params: getDateRange() });
      return data.data;
    },
    enabled: !!restaurantId,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="flex rounded-xl border overflow-hidden">
          {[['week', '7 Days'], ['month', '30 Days'], ['year', '1 Year']].map(([v, l]) => (
            <button key={v} onClick={() => setRange(v)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${range === v ? 'bg-brand-500 text-white' : 'hover:bg-muted'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: formatCurrency(salesReport?.totals?.totalRevenue || 0), icon: TrendingUp, color: 'bg-green-100 text-green-600' },
          { label: 'Total Bookings', value: salesReport?.totals?.totalBookings || 0, icon: CalendarCheck, color: 'bg-blue-100 text-blue-600' },
          { label: 'Total Orders', value: salesReport?.totals?.totalOrders || 0, icon: ShoppingBag, color: 'bg-orange-100 text-orange-600' },
          { label: 'New Customers', value: '—', icon: Users, color: 'bg-purple-100 text-purple-600' },
        ].map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Revenue chart (simplified table) */}
      <div className="rounded-2xl border bg-card p-6">
        <h2 className="font-semibold mb-5">Daily Revenue</h2>
        {isLoading ? (
          <div className="space-y-2">{Array.from({ length: 7 }).map((_, i) => <div key={i} className="h-8 bg-muted rounded animate-pulse" />)}</div>
        ) : (
          <div className="space-y-2">
            {(salesReport?.dailyRevenue || []).slice(-10).map((day: { _id: string; revenue: number; bookings: number; orders: number }) => {
              const maxRev = Math.max(...(salesReport?.dailyRevenue || [{ revenue: 1 }]).map((d: { revenue: number }) => d.revenue));
              const pct = maxRev > 0 ? (day.revenue / maxRev) * 100 : 0;
              return (
                <div key={day._id} className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground w-20 shrink-0">{day._id}</span>
                  <div className="flex-1 h-7 bg-muted rounded-lg overflow-hidden">
                    <div className="h-full brand-gradient rounded-lg transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-semibold w-20 text-right shrink-0">{formatCurrency(day.revenue)}</span>
                </div>
              );
            })}
            {(!salesReport?.dailyRevenue || salesReport.dailyRevenue.length === 0) && (
              <p className="text-center text-muted-foreground py-8 text-sm">No revenue data for this period</p>
            )}
          </div>
        )}
      </div>

      {/* Top foods */}
      {analytics?.topFoods?.length > 0 && (
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="font-semibold mb-5">Top Selling Items</h2>
          <div className="space-y-3">
            {analytics.topFoods.slice(0, 5).map((item: { _id: string; name: string; count: number }, i: number) => (
              <div key={item._id} className="flex items-center gap-4">
                <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <span className="flex-1 text-sm font-medium">{item.name || item._id}</span>
                <span className="text-sm text-muted-foreground">{item.count} orders</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Peak hours */}
      {analytics?.peakHours?.length > 0 && (
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="font-semibold mb-5">Peak Hours</h2>
          <div className="flex items-end gap-2 h-32">
            {analytics.peakHours.map((h: { _id: number; count: number }) => {
              const max = Math.max(...analytics.peakHours.map((x: { count: number }) => x.count));
              return (
                <div key={h._id} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full brand-gradient rounded-t-lg transition-all" style={{ height: `${(h.count / max) * 100}%` }} />
                  <span className="text-xs text-muted-foreground">{h._id}h</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
