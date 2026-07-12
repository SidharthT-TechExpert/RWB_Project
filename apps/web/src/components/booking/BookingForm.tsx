'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Users, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { useCreateBooking } from '@/hooks/useBookings';
import type { Restaurant } from '@/hooks/useRestaurants';

const schema = z.object({
  type: z.enum(['table', 'food', 'both']),
  tableId: z.string().optional(),
  guestCount: z.coerce.number().min(1).max(20),
  reservationDate: z.string().min(1, 'Date is required'),
  reservationTime: z.string().min(1, 'Time is required'),
  specialRequests: z.string().max(500).optional(),
});

type BookingFormData = z.infer<typeof schema>;

interface BookingFormProps {
  restaurant: Restaurant;
}

const TIME_SLOTS = [
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '18:00', '18:30', '19:00', '19:30', '20:00',
  '20:30', '21:00', '21:30',
];

export function BookingForm({ restaurant }: BookingFormProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const cartItems = useCartStore((s) => s.items);
  const cartTotal = useCartStore((s) => s.getTotal());
  const { mutate: createBooking, isPending } = useCreateBooking();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<BookingFormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'table', guestCount: 2 },
  });

  const type = watch('type');
  const selectedDate = watch('reservationDate');
  const selectedTime = watch('reservationTime');

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const onSubmit = (data: BookingFormData) => {
    const preOrderItems = (type === 'food' || type === 'both') ? cartItems.map((item) => ({
      foodItemId: item.foodItemId,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      variantId: item.variantId,
      addOns: item.addOns,
      specialInstructions: item.specialInstructions,
    })) : [];

    createBooking({
      restaurantId: restaurant._id,
      type: data.type,
      tableId: data.tableId,
      guestCount: data.guestCount,
      reservationDate: data.reservationDate,
      reservationTime: data.reservationTime,
      preOrderItems,
      specialRequests: data.specialRequests,
    });
  };

  const steps = [
    { label: 'Type', icon: '🎯' },
    { label: 'Details', icon: '📅' },
    { label: 'Confirm', icon: '✅' },
  ];

  return (
    <div className="rounded-2xl border bg-card p-6 space-y-6">
      <h2 className="text-xl font-semibold">Reserve at {restaurant.name}</h2>

      {/* Step indicators */}
      <div className="flex items-center justify-between">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center">
            <div className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all',
              step > i + 1 ? 'bg-green-500 text-white' :
              step === i + 1 ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' :
              'bg-muted text-muted-foreground'
            )}>
              {step > i + 1 ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={cn('ml-2 text-xs font-medium hidden sm:block', step === i + 1 ? 'text-foreground' : 'text-muted-foreground')}>
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div className={cn('w-8 sm:w-16 h-0.5 mx-2', step > i + 1 ? 'bg-green-500' : 'bg-muted')} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          {/* Step 1: Booking type */}
          {step === 1 && (
            <motion.div key="step1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-4">
              <p className="text-sm text-muted-foreground">What would you like to do?</p>
              <div className="grid gap-3">
                {[
                  { value: 'table', label: 'Reserve a Table', desc: 'Book a table for your group', icon: '🪑', disabled: !restaurant.acceptsTableBooking },
                  { value: 'food', label: 'Pre-order Food', desc: 'Order food ahead of your visit', icon: '🍱', disabled: !restaurant.acceptsPreOrders },
                  { value: 'both', label: 'Table + Pre-order', desc: 'Best of both worlds', icon: '✨', disabled: !restaurant.acceptsTableBooking || !restaurant.acceptsPreOrders },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => setValue('type', opt.value as BookingFormData['type'])}
                    className={cn(
                      'flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all',
                      type === opt.value ? 'border-brand-500 bg-brand-50 dark:bg-brand-950' : 'border-border hover:border-brand-200',
                      opt.disabled && 'opacity-40 cursor-not-allowed'
                    )}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </div>
                    {type === opt.value && <Check className="h-5 w-5 text-brand-500 ml-auto" />}
                  </button>
                ))}
              </div>
              <Button type="button" className="w-full" onClick={() => setStep(2)}>
                Continue <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-4">
              <Input
                label="Number of Guests"
                type="number"
                min={1}
                max={20}
                leftIcon={<Users className="h-4 w-4" />}
                error={errors.guestCount?.message}
                {...register('guestCount')}
              />
              <Input
                label="Date"
                type="date"
                min={today}
                max={maxDate}
                leftIcon={<Calendar className="h-4 w-4" />}
                error={errors.reservationDate?.message}
                {...register('reservationDate')}
              />

              {/* Time slots */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Time <span className="text-destructive">*</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setValue('reservationTime', slot)}
                      className={cn(
                        'py-2 rounded-xl text-xs font-medium border transition-all',
                        selectedTime === slot ? 'bg-brand-500 text-white border-brand-500' : 'border-border hover:border-brand-300'
                      )}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
                {errors.reservationTime && <p className="text-xs text-destructive">{errors.reservationTime.message}</p>}
              </div>

              {/* Table selection */}
              {(type === 'table' || type === 'both') && restaurant.tables.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Select Table</label>
                  <div className="grid grid-cols-2 gap-2">
                    {restaurant.tables.map((table) => (
                      <button
                        key={table.tableNumber}
                        type="button"
                        disabled={!table.isAvailable}
                        onClick={() => setValue('tableId', table.tableNumber)}
                        className={cn(
                          'p-3 rounded-xl border text-left text-sm transition-all',
                          watch('tableId') === table.tableNumber ? 'border-brand-500 bg-brand-50' : 'border-border',
                          !table.isAvailable && 'opacity-40 cursor-not-allowed'
                        )}
                      >
                        <p className="font-medium">Table {table.tableNumber}</p>
                        <p className="text-xs text-muted-foreground">{table.capacity} seats · {table.type}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <textarea
                placeholder="Special requests (optional)"
                className="w-full h-20 px-3 py-2 rounded-xl border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                {...register('specialRequests')}
              />

              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
                <Button type="button" className="flex-1" onClick={() => setStep(3)}
                  disabled={!selectedDate || !selectedTime}>
                  Continue <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <motion.div key="step3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-4">
              <div className="rounded-xl border p-4 space-y-3 bg-muted/30">
                <h3 className="font-semibold">Booking Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="font-medium capitalize">{type}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-medium">{selectedDate && formatDate(selectedDate)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span className="font-medium">{selectedTime}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Guests</span><span className="font-medium">{watch('guestCount')}</span></div>
                  {cartTotal > 0 && (
                    <>
                      <hr className="border-border" />
                      <div className="flex justify-between"><span className="text-muted-foreground">Pre-order subtotal</span><span className="font-medium">{formatCurrency(cartTotal)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Tax ({restaurant.taxPercentage}%)</span><span className="font-medium">{formatCurrency(cartTotal * restaurant.taxPercentage / 100)}</span></div>
                      <div className="flex justify-between font-semibold border-t pt-2"><span>Total</span><span className="text-brand-500">{formatCurrency(cartTotal * (1 + restaurant.taxPercentage / 100 + restaurant.serviceChargePercentage / 100))}</span></div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(2)}>
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
                <Button type="submit" className="flex-1" isLoading={isPending}>
                  Confirm Booking
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
