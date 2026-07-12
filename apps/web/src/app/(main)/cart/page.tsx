'use client';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, Tag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCartStore } from '@/store/cartStore';
import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { items, restaurantId, restaurantName, updateQuantity, removeItem, clearCart, getTotal } = useCartStore();
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState('');

  const subtotal = getTotal();
  const tax = subtotal * 0.05;
  const serviceCharge = subtotal * 0.1;
  const total = subtotal + tax + serviceCharge - discount;

  const couponMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/admin/coupons/validate', {
        code: coupon,
        restaurantId,
        orderAmount: subtotal,
      });
      return data.data;
    },
    onSuccess: (data) => {
      if (data.valid) {
        setDiscount(data.discount);
        setCouponApplied(coupon);
        toast.success(`Coupon applied! You save ${formatCurrency(data.discount)}`);
      } else {
        toast.error(data.message || 'Invalid coupon');
      }
    },
    onError: () => toast.error('Failed to apply coupon'),
  });

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
          <ShoppingCart className="h-10 w-10 text-muted-foreground" />
        </motion.div>
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8">Add items from a restaurant to get started</p>
        <Link href="/restaurants"><Button size="lg" className="gap-2">Find Restaurants <ArrowRight className="h-4 w-4" /></Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Your Cart</h1>
        <button onClick={clearCart} className="text-sm text-destructive hover:underline flex items-center gap-1">
          <Trash2 className="h-3.5 w-3.5" /> Clear cart
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <span className="font-medium text-foreground">{restaurantName}</span>
            <span>·</span>
            <span>{items.length} item{items.length !== 1 ? 's' : ''}</span>
          </div>

          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={`${item.foodItemId}-${item.variantId}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex gap-4 p-4 rounded-2xl border bg-card"
              >
                {item.image && (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{item.name}</p>
                  {item.variantName && <p className="text-xs text-muted-foreground">{item.variantName}</p>}
                  {item.addOns.length > 0 && (
                    <p className="text-xs text-muted-foreground">{item.addOns.map((a) => a.name).join(', ')}</p>
                  )}
                  <p className="font-semibold text-brand-500 mt-1">{formatCurrency(item.price * item.quantity)}</p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <button onClick={() => removeItem(item.foodItemId, item.variantId)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="flex items-center gap-2 bg-muted rounded-xl">
                    <button onClick={() => updateQuantity(item.foodItemId, item.quantity - 1, item.variantId)} className="w-8 h-8 flex items-center justify-center hover:bg-muted/80 rounded-xl transition-colors">
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-5 text-center text-sm font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.foodItemId, item.quantity + 1, item.variantId)} className="w-8 h-8 flex items-center justify-center hover:bg-muted/80 rounded-xl transition-colors">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1 space-y-4">
          {/* Coupon */}
          <div className="rounded-2xl border p-4 space-y-3 bg-card">
            <h3 className="font-semibold text-sm flex items-center gap-2"><Tag className="h-4 w-4 text-brand-500" /> Apply Coupon</h3>
            {couponApplied ? (
              <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-xl">
                <span className="text-sm font-medium text-green-700 dark:text-green-400">{couponApplied} applied</span>
                <button onClick={() => { setDiscount(0); setCouponApplied(''); setCoupon(''); }} className="text-xs text-destructive hover:underline">Remove</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  placeholder="COUPON CODE"
                  className="flex-1 h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring uppercase"
                />
                <Button size="sm" variant="outline" onClick={() => couponMutation.mutate()} isLoading={couponMutation.isPending} disabled={!coupon}>Apply</Button>
              </div>
            )}
          </div>

          {/* Bill breakdown */}
          <div className="rounded-2xl border p-5 space-y-3 bg-card">
            <h3 className="font-semibold">Bill Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tax (5%)</span><span>{formatCurrency(tax)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Service charge (10%)</span><span>{formatCurrency(serviceCharge)}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatCurrency(discount)}</span></div>}
              <div className="flex justify-between font-bold text-base border-t pt-2">
                <span>Total</span>
                <span className="text-brand-500">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          <Link href={`/bookings/new?restaurantId=${restaurantId}`}>
            <Button className="w-full" size="lg">Proceed to Book <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
