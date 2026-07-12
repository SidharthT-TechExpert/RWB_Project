'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Users, CalendarCheck, ShoppingBag, DollarSign } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState('month');

  const getRange = () => {
    const end = new Date().toISOString().split('T')[0];
    const start = new Date(
      range === 'week' ? Date.now() - 7 * 86400000 :
      range === 'month' ? Date.now() - 30 * 86400000 :
      Date.now() - 365 * 86400000
    ).toISOString().split('T')[0];
    return { startDate: start, endDate: end };
  };

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin', 'analytics', range],
    queryFn: async () => {
      const { data } = await api.get('/analytics/platform', { params: getRange() });
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const stats = [
    { label: 'Total Revenue', value: formatCurrency(analytics?.revenueStats?.totalRevenue || 0), icon: DollarSign, color: 'bg-green-100 text-green-600', change: '+15%' },
    { label: 'Transactions', value: analytics?.revenueStats?.totalTransactions || 0, icon: TrendingUp, color: 'bg-blue-100 text-blue-600' },
    { label: 'Avg Order Value', value: formatCurrency(analytics?.revenueStats?.avgOrderValue || 0), icon: ShoppingBag, color: 'bg-orange-100 text-orange-600' },
    { label: 'New Users', value: (analytics?.userGrowth || []).reduce((s: number, d: { count: number }) => s + d.count, 0), icon: Users, color: 'bg-purple-100 text-purple-600', change: '+8%' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Platform Analytics</h1>
        <div className="flex rounded-xl border overflow-hidden">
          {[['week', '7D'], ['month', '30D'], ['year', '1Y']].map(([v, l]) => (
            <button key={v} onClick={() => setRange(v)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${range === v ? 'bg-brand-500 text-white' : 'hover:bg-muted'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, change }, i) => (
          <div key={label} className="p-6 rounded-2xl border bg-card">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}><Icon className="h-5 w-5" /></div>
              {change && <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">{change}</span>}
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* User growth chart */}
      {analytics?.userGrowth?.length > 0 && (
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="font-semibold mb-6">User Growth</h2>
          <div className="space-y-2">
            {analytics.userGrowth.slice(-14).map((day: { _id: string; count: number }) => {
              const max = Math.max(...analytics.userGrowth.map((d: { count: number }) => d.count), 1);
              return (
                <div key={day._id} className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground w-24 shrink-0">{day._id}</span>
                  <div className="flex-1 h-7 bg-muted rounded-lg overflow-hidden">
                    <div className="h-full brand-gradient rounded-lg transition-all" style={{ width: `${(day.count / max) * 100}%` }} />
                  </div>
                  <span className="text-xs font-semibold w-8 text-right shrink-0">{day.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top restaurants */}
      {analytics?.topRestaurants?.length > 0 && (
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="font-semibold mb-5">Top Restaurants by Bookings</h2>
          <div className="space-y-3">
            {analytics.topRestaurants.map((r: { _id: string; count: number }, i: number) => (
              <div key={r._id} className="flex items-center gap-4">
                <span className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <span className="flex-1 text-sm font-mono text-muted-foreground truncate">{r._id}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-32">
                  <div className="h-full brand-gradient rounded-full" style={{ width: `${(r.count / (analytics.topRestaurants[0]?.count || 1)) * 100}%` }} />
                </div>
                <span className="text-sm font-semibold w-16 text-right">{r.count} bookings</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      )}
    </div>
  );
}
