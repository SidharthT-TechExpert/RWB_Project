'use client';
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, MapPin, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { BookingCardSkeleton } from '@/components/ui/Skeleton';
import { useMyBookings, useCancelBooking } from '@/hooks/useBookings';
import { formatDate, formatCurrency, bookingStatusColors, cn } from '@/lib/utils';

const STATUS_TABS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyBookings(page);
  const { mutate: cancel, isPending: isCancelling } = useCancelBooking();

  const bookings = (data?.data || []).filter((b: { status: string }) =>
    activeTab === 'all' || b.status === activeTab
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold mb-8">My Bookings</h1>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize',
              activeTab === tab ? 'bg-brand-500 text-white' : 'bg-muted hover:bg-muted/80'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <BookingCardSkeleton key={i} />)
        ) : bookings.length > 0 ? (
          bookings.map((booking: {
            _id: string;
            bookingNumber: string;
            restaurantName: string;
            status: string;
            type: string;
            reservationDate: string;
            reservationTime: string;
            guestCount: number;
            total: number;
            paymentStatus: string;
          }) => (
            <motion.div
              key={booking._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl border bg-card hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-semibold">{booking.restaurantName}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{booking.bookingNumber}</p>
                </div>
                <Badge className={cn('shrink-0', bookingStatusColors[booking.status])}>
                  {booking.status.replace('_', ' ')}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(booking.reservationDate)}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {booking.reservationTime}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  {booking.guestCount} guests
                </div>
                <div className="text-xs font-semibold text-brand-500">
                  {booking.total > 0 ? formatCurrency(booking.total) : 'Free'}
                </div>
              </div>

              <div className="flex gap-2">
                <Link href={`/bookings/${booking._id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full gap-1">
                    View Details <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
                {['pending', 'confirmed'].includes(booking.status) && (
                  <Button
                    variant="destructive"
                    size="sm"
                    isLoading={isCancelling}
                    onClick={() => cancel({ id: booking._id })}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-4xl mb-4">📅</p>
            <p className="font-semibold mb-2">No bookings yet</p>
            <p className="text-sm mb-6">Discover restaurants and make your first booking!</p>
            <Link href="/restaurants">
              <Button>Find Restaurants</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
