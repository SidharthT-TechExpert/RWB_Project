'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, FileText, BarChart2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

export default function AdminReportsPage() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const { data: analytics, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'reports', startDate, endDate],
    queryFn: async () => {
      const { data } = await api.get('/analytics/platform', { params: { startDate, endDate } });
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleExport = () => {
    const report = {
      period: { from: startDate, to: endDate },
      revenue: analytics?.revenueStats,
      userGrowth: analytics?.userGrowth,
      topRestaurants: analytics?.topRestaurants,
      generatedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quickbite-report-${startDate}-${endDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reports</h1>
        <Button className="gap-2" onClick={handleExport}>
          <Download className="h-4 w-4" /> Export Report
        </Button>
      </div>

      {/* Date range */}
      <div className="flex gap-3 items-center p-5 rounded-2xl border bg-card">
        <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
        <div className="flex items-center gap-3">
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
            className="h-10 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <span className="text-muted-foreground text-sm">to</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
            className="h-10 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <Button size="sm" variant="outline" onClick={() => refetch()}>Generate</Button>
      </div>

      {/* Key metrics */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', value: formatCurrency(analytics?.revenueStats?.totalRevenue || 0), icon: BarChart2 },
          { label: 'Total Transactions', value: analytics?.revenueStats?.totalTransactions || 0, icon: FileText },
          { label: 'Avg Order Value', value: formatCurrency(analytics?.revenueStats?.avgOrderValue || 0), icon: BarChart2 },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="p-5 rounded-2xl border bg-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                <Icon className="h-5 w-5 text-brand-500" />
              </div>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      {analytics?.userGrowth?.length > 0 && (
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="font-semibold mb-5">User Registrations Over Period</h2>
          <div className="space-y-2">
            {analytics.userGrowth.map((day: { _id: string; count: number }) => {
              const max = Math.max(...analytics.userGrowth.map((d: { count: number }) => d.count), 1);
              return (
                <div key={day._id} className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground w-24 shrink-0">{day._id}</span>
                  <div className="flex-1 h-6 bg-muted rounded-lg overflow-hidden">
                    <div className="h-full brand-gradient rounded-lg" style={{ width: `${(day.count / max) * 100}%` }} />
                  </div>
                  <span className="text-xs font-semibold w-8 text-right">{day.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-muted rounded-2xl animate-pulse" />)}</div>
      )}
    </div>
  );
}
