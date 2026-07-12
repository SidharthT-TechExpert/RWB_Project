'use client';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Calendar, Clock, Users, ArrowRight, Download } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useBooking } from '@/hooks/useBookings';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function BookingSuccessPage() {
  const { id } = useParams<{ id: string }>();
  const { data: booking } = useBooking(id);

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
        className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto"
      >
        <CheckCircle2 className="h-12 w-12 text-green-600" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
        <p className="text-muted-foreground">
          Your table has been reserved. We can't wait to see you!
        </p>
      </motion.div>

      {booking && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border p-6 text-left space-y-4 bg-card"
        >
          <h2 className="font-semibold text-center">{booking.restaurantName}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-brand-500" />
              <span>{formatDate(booking.reservationDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-brand-500" />
              <span>{booking.reservationTime}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-brand-500" />
              <span>{booking.guestCount} guests</span>
            </div>
            {booking.total > 0 && (
              <div className="text-sm font-semibold text-brand-500">
                {formatCurrency(booking.total)}
              </div>
            )}
          </div>
          <div className="pt-3 border-t text-center">
            <p className="text-xs text-muted-foreground">Booking ID</p>
            <p className="font-mono font-semibold text-sm">{booking.bookingNumber}</p>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex flex-col gap-3"
      >
        <Link href="/bookings">
          <Button className="w-full gap-2">
            View My Bookings <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/restaurants">
          <Button variant="outline" className="w-full">Explore More Restaurants</Button>
        </Link>
      </motion.div>
    </div>
  );
}
