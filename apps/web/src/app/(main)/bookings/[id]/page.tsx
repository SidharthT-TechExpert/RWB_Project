'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Calendar, Clock, Users, MapPin, CreditCard, ArrowLeft,
  CheckCircle2, XCircle, Loader2, UtensilsCrossed
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useBooking, useCancelBooking } from '@/hooks/useBookings';
import { formatDate, formatCurrency, bookingStatusColors, cn } from '@/lib/utils';

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: booking, isLoading } = useBooking(id);
  const { mutate: cancel, isPending: isCancelling } = useCancelBooking();

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-muted-foreground">
        <p className="text-4xl mb-4">😕</p>
        <p className="font-semibold mb-4">Booking not found</p>
        <Link href="/bookings"><Button>Back to Bookings</Button></Link>
      </div>
    );
  }

  const canCancel = ['pending', 'confirmed'].includes(booking.status);
  const isPaid = booking.paymentStatus === 'paid';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Back */}
      <Link href="/bookings" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
        <ArrowLeft className="h-4 w-4" /> My Bookings
      </Link>

      {/* Status banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn('p-6 rounded-2xl flex items-center gap-4', bookingStatusColors[booking.status])}
      >
        {booking.status === 'completed' ? <CheckCircle2 className="h-8 w-8" /> :
         booking.status === 'cancelled' ? <XCircle className="h-8 w-8" /> :
         booking.status === 'confirmed' ? <CheckCircle2 className="h-8 w-8" /> :
         <Loader2 className="h-8 w-8 animate-spin" />}
        <div>
          <p className="font-bold text-lg capitalize">{booking.status.replace('_', ' ')}</p>
          <p className="text-sm opacity-80">Booking #{booking.bookingNumber}</p>
        </div>
      </motion.div>

      {/* Restaurant info */}
      <div className="p-5 rounded-2xl border bg-card">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
            <UtensilsCrossed className="h-6 w-6 text-brand-500" />
          </div>
          <div>
            <h2 className="font-bold text-lg">{booking.restaurantName}</h2>
            <p className="text-sm text-muted-foreground capitalize">{booking.type} booking</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: Calendar, label: 'Date', value: formatDate(booking.reservationDate) },
            { icon: Clock, label: 'Time', value: booking.reservationTime },
            { icon: Users, label: 'Guests', value: `${booking.guestCount} guests` },
            { icon: CreditCard, label: 'Payment', value: isPaid ? 'Paid' : 'Pending', green: isPaid },
          ].map(({ icon: Icon, label, value, green }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0 mt-0.5">
                <Icon className={cn('h-4 w-4', green ? 'text-green-500' : 'text-muted-foreground')} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={cn('text-sm font-semibold', green && 'text-green-600')}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {booking.specialRequests && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-1">Special Requests</p>
            <p className="text-sm">{booking.specialRequests}</p>
          </div>
        )}
      </div>

      {/* Pre-ordered items */}
      {booking.preOrderItems.length > 0 && (
        <div className="p-5 rounded-2xl border bg-card">
          <h3 className="font-semibold mb-4">Pre-ordered Items</h3>
          <div className="space-y-3">
            {booking.preOrderItems.map((item: { foodItemId: string; name: string; quantity: number; price: number }) => (
              <div key={item.foodItemId} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 text-xs font-bold flex items-center justify-center">
                    {item.quantity}
                  </span>
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <span className="text-sm font-semibold">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bill */}
      {booking.total > 0 && (
        <div className="p-5 rounded-2xl border bg-card">
          <h3 className="font-semibold mb-4">Bill Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(booking.preOrderTotal || 0)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>{formatCurrency(booking.tax || 0)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Service charge</span><span>{formatCurrency(booking.serviceCharge || 0)}</span></div>
            <div className="flex justify-between font-bold text-base pt-2 border-t">
              <span>Total</span>
              <span className="text-brand-500">{formatCurrency(booking.total)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {!isPaid && booking.total > 0 && booking.status !== 'cancelled' && (
          <Link href={`/bookings/${booking._id}/payment`} className="flex-1">
            <Button className="w-full">Pay Now</Button>
          </Link>
        )}
        {canCancel && (
          <Button
            variant="outline"
            className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
            isLoading={isCancelling}
            onClick={() => cancel({ id: booking._id })}
          >
            Cancel Booking
          </Button>
        )}
      </div>
    </div>
  );
}
