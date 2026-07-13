'use client';
export const dynamic = 'force-dynamic';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CalendarCheck, ShoppingBag, Star, TrendingUp, Users, Clock } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useMyRestaurants } from '@/hooks/useRestaurants';

function StatCard({ label, value, icon: Icon, color, change }: {
  label: string; value: string | number; icon: React.ElementType; color: string; change?: string;
}) {
  return (
    <motion.div whileHover={{ y: -2 }} className="p-6 rounded-2xl border bg-card">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        {change && <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">{change}</span>}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </motion.div>
  );
}

export default function DashboardHomePage() {
  const { data: restaurants } = useMyRestaurants();
  const restaurantId = restaurants?.data?.[0]?._id;

  const { data: stats } = useQuery({
    queryKey: ['dashboard', 'stats', restaurantId],
    queryFn: async () => {
      const { data } = await api.get(`/bookings/restaurant/${restaurantId}/stats`);
      return data.data;
    },
    enabled: !!restaurantId,
  });

  const { data: todayBookings } = useQuery({
    queryKey: ['dashboard', 'bookings', restaurantId],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await api.get(`/bookings/restaurant/${restaurantId}`, { params: { date: today, limit: 5 } });
      return data;
    },
    enabled: !!restaurantId,
    refetchInterval: 60 * 1000,
  });

  const statCards = [
    { label: "Today's Bookings", value: stats?.confirmed || 0, icon: CalendarCheck, color: 'bg-blue-100 text-blue-600', change: '+12%' },
    { label: 'Active Orders', value: stats?.total || 0, icon: ShoppingBag, color: 'bg-orange-100 text-orange-600' },
    { label: 'Monthly Revenue', value: formatCurrency(stats?.revenue || 0), icon: TrendingUp, color: 'bg-green-100 text-green-600', change: '+8%' },
    { label: 'Avg Rating', value: '4.8 ★', icon: Star, color: 'bg-yellow-100 text-yellow-600' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Restaurant Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <StatCard {...card} />
          </motion.div>
        ))}
      </div>

      {/* Today's bookings */}
      <div className="rounded-2xl border bg-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-lg">Today's Bookings</h2>
          <a href="/dashboard/bookings" className="text-sm text-brand-500 hover:underline">View all</a>
        </div>
        <div className="space-y-3">
          {todayBookings?.data?.length > 0 ? todayBookings.data.map((b: {
            _id: string;
            bookingNumber: string;
            reservationTime: string;
            guestCount: number;
            status: string;
            type: string;
          }) => (
            <div key={b._id} className="flex items-center justify-between p-3 rounded-xl border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-sm font-bold">
                  {b.reservationTime}
                </div>
                <div>
                  <p className="text-sm font-medium">{b.bookingNumber}</p>
                  <p className="text-xs text-muted-foreground">{b.guestCount} guests · {b.type}</p>
                </div>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize
                ${b.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                  b.status === 'checked_in' ? 'bg-purple-100 text-purple-700' :
                  b.status === 'completed' ? 'bg-green-100 text-green-700' :
                  'bg-yellow-100 text-yellow-700'}`}>
                {b.status}
              </span>
            </div>
          )) : (
            <p className="text-sm text-muted-foreground text-center py-8">No bookings today</p>
          )}
        </div>
      </div>
    </div>
  );
}
