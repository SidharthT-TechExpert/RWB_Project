'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CreditCard, Wallet, CheckCircle2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useBooking } from '@/hooks/useBookings';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatCurrency, getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';

// Remove unused global type declaration - replaced with inline any cast

export default function PaymentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [method, setMethod] = useState<'razorpay' | 'stripe' | 'wallet'>('razorpay');
  const { data: booking, isLoading } = useBooking(id);

  const payMutation = useMutation({
    mutationFn: async () => {
      if (method === 'razorpay') {
        const { data } = await api.post('/payments/razorpay/order', {
          amount: booking!.total,
          bookingId: booking!._id,
        });

        return new Promise<void>((resolve, reject) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const RazorpayConstructor = (window as any).Razorpay;
          const rzp = new RazorpayConstructor({
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: booking!.total * 100,
            currency: 'INR',
            name: 'QuickBite',
            description: `Booking: ${booking!.bookingNumber}`,
            order_id: data.data.razorpayOrder.id,
            handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
              await api.post('/payments/razorpay/verify', {
                paymentId: data.data.payment._id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              });
              resolve();
            },
            modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
          });
          rzp.open();
        });
      }
    },
    onSuccess: () => {
      toast.success('Payment successful!');
      router.push(`/bookings/${id}/success`);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  if (isLoading) return (
    <div className="max-w-lg mx-auto px-4 py-20 space-y-4">
      <div className="h-8 bg-muted rounded-xl animate-pulse" />
      <div className="h-48 bg-muted rounded-2xl animate-pulse" />
    </div>
  );

  if (!booking) return null;

  const PAYMENT_METHODS = [
    { value: 'razorpay', label: 'Pay with Razorpay', desc: 'Cards, UPI, NetBanking & more', icon: '💳' },
    { value: 'wallet', label: 'Pay with Wallet', desc: 'Use your QuickBite wallet balance', icon: '👛' },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 py-12 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Complete Payment</h1>
        <p className="text-muted-foreground mt-1">Booking {booking.bookingNumber}</p>
      </div>

      {/* Order summary */}
      <div className="rounded-2xl border p-5 space-y-3 bg-card">
        <h3 className="font-semibold">Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Restaurant</span><span>{booking.restaurantName}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="capitalize">{booking.type}</span></div>
          {booking.preOrderItems.length > 0 && (
            <div className="pt-2 border-t space-y-1">
              {booking.preOrderItems.map((item) => (
                <div key={item.foodItemId} className="flex justify-between text-muted-foreground">
                  <span>{item.name} × {item.quantity}</span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between font-semibold text-base border-t pt-2">
            <span>Total</span>
            <span className="text-brand-500">{formatCurrency(booking.total)}</span>
          </div>
        </div>
      </div>

      {/* Payment methods */}
      <div className="space-y-3">
        <h3 className="font-semibold">Payment Method</h3>
        {PAYMENT_METHODS.map((m) => (
          <button
            key={m.value}
            onClick={() => setMethod(m.value as typeof method)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${method === m.value ? 'border-brand-500 bg-brand-50 dark:bg-brand-950' : 'border-border'}`}
          >
            <span className="text-2xl">{m.icon}</span>
            <div className="flex-1">
              <p className="font-medium text-sm">{m.label}</p>
              <p className="text-xs text-muted-foreground">{m.desc}</p>
            </div>
            <div className={`w-4 h-4 rounded-full border-2 ${method === m.value ? 'border-brand-500 bg-brand-500' : 'border-muted-foreground'}`} />
          </button>
        ))}
      </div>

      {/* Security notice */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="h-3.5 w-3.5" />
        Your payment information is secure and encrypted
      </div>

      <Button
        className="w-full"
        size="lg"
        isLoading={payMutation.isPending}
        onClick={() => payMutation.mutate()}
        leftIcon={<CreditCard className="h-5 w-5" />}
      >
        Pay {formatCurrency(booking.total)}
      </Button>
    </div>
  );
}
