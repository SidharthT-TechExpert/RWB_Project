'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UtensilsCrossed, Sparkles, MapPin, Users, ShoppingBag, Plus, Minus,
  CheckCircle2, BellRing, ChevronRight, X, Clock, ShieldCheck, Flame, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  isVegetarian?: boolean;
}

const SAMPLE_MENU = [
  {
    id: 'f1',
    name: 'Truffle Mushroom Risotto',
    category: 'Mains',
    price: 18.5,
    description: 'Creamy arborio rice with wild forest mushrooms, white truffle oil, and aged parmesan.',
    image: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?w=600&auto=format&fit=crop&q=80',
    isVegetarian: true,
    isPopular: true,
    prepTime: 20,
  },
  {
    id: 'f2',
    name: 'Artisan Wood-Fired Margherita',
    category: 'Mains',
    price: 15.0,
    description: 'San Marzano tomato sauce, fresh buffalo mozzarella, fragrant sweet basil, extra virgin olive oil.',
    image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&auto=format&fit=crop&q=80',
    isVegetarian: true,
    isPopular: true,
    prepTime: 15,
  },
  {
    id: 'f3',
    name: 'Crispy Calamari Fritti',
    category: 'Starters',
    price: 12.5,
    description: 'Lightly dusted tender squid rings served with zesty citrus garlic aioli and fresh lemon wedge.',
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80',
    isVegetarian: false,
    isPopular: false,
    prepTime: 12,
  },
  {
    id: 'f4',
    name: 'Smoked Salmon Bruschetta',
    category: 'Starters',
    price: 11.0,
    description: 'Toasted sourdough bread topped with herb cream cheese, Norwegian smoked salmon, capers, and dill.',
    image: 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=600&auto=format&fit=crop&q=80',
    isVegetarian: false,
    isPopular: false,
    prepTime: 10,
  },
  {
    id: 'f5',
    name: 'Classic Italian Tiramisu',
    category: 'Desserts',
    price: 8.5,
    description: 'Espresso-soaked savoiardi ladyfingers layered with velvety mascarpone cream and dusted with cocoa.',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80',
    isVegetarian: true,
    isPopular: true,
    prepTime: 5,
  },
  {
    id: 'f6',
    name: 'Signature Passionfruit Mocktail',
    category: 'Beverages',
    price: 6.5,
    description: 'Fresh passionfruit pulp, crushed mint leaves, lime juice, and sparkling soda over crushed ice.',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
    isVegetarian: true,
    isPopular: false,
    prepTime: 5,
  },
];

const CATEGORIES = ['All', 'Starters', 'Mains', 'Desserts', 'Beverages'];

function DineInContent() {
  const searchParams = useSearchParams();
  const branchParam = searchParams.get('branch') || 'BR-NY-01';
  const tableParam = searchParams.get('table') || 'T1';
  const tokenParam = searchParams.get('token');

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [vegOnly, setVegOnly] = useState(false);
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isCallingWaiter, setIsCallingWaiter] = useState(false);
  const [specialNote, setSpecialNote] = useState('');

  // Cart helpers
  const addToCart = (item: typeof SAMPLE_MENU[0]) => {
    setCart((prev) => {
      const current = prev[item.id];
      const qty = (current?.quantity || 0) + 1;
      return {
        ...prev,
        [item.id]: {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: qty,
          image: item.image,
          isVegetarian: item.isVegetarian,
        },
      };
    });
    toast.success(`Added ${item.name} to order`);
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const current = prev[itemId];
      if (!current) return prev;
      if (current.quantity <= 1) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return {
        ...prev,
        [itemId]: { ...current, quantity: current.quantity - 1 },
      };
    });
  };

  const cartList = Object.values(cart);
  const totalItems = cartList.reduce((acc, it) => acc + it.quantity, 0);
  const subtotal = cartList.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const tax = subtotal * 0.05;
  const serviceCharge = subtotal * 0.10;
  const grandTotal = subtotal + tax + serviceCharge;

  const filteredMenu = SAMPLE_MENU.filter((item) => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (vegOnly && !item.isVegetarian) return false;
    return true;
  });

  const handleCallWaiter = () => {
    setIsCallingWaiter(true);
    setTimeout(() => {
      setIsCallingWaiter(false);
      toast.success(`Waiter alerted for Table ${tableParam}! A server will arrive shortly.`, {
        duration: 4000,
        icon: '🔔',
      });
    }, 800);
  };

  const handlePlaceOrder = () => {
    setOrderPlaced(true);
    toast.success(`Order sent to kitchen for Table ${tableParam}!`);
  };

  return (
    <div className="min-h-screen bg-[#030816] text-white flex flex-col selection:bg-purple-500 selection:text-white">
      {/* ── Sticky Dine-In Header ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#070D1F]/90 backdrop-blur-xl border-b border-white/8 shadow-2xl">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center font-black text-sm shrink-0 shadow-lg shadow-purple-600/20">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-sm sm:text-base text-white tracking-tight">
                  Paragon Restaurant
                </h1>
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Table
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Downtown Branch ({branchParam}) • <span className="text-purple-300 font-bold">Table {tableParam}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCallWaiter}
              disabled={isCallingWaiter}
              className="h-9 px-3 text-xs font-bold border-white/10 hover:bg-white/6 text-slate-300 rounded-xl gap-1.5"
            >
              <BellRing className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Call Server</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Main Container ──────────────────────────────────────────────── */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 space-y-6 pb-28">
        {/* Welcome Banner */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-[#070D1F] border border-purple-500/20 relative overflow-hidden shadow-xl">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 inline-flex items-center gap-1 mb-2">
                <Sparkles className="w-3 h-3" /> QuickBite Smart Dine-In
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Seated at Table {tableParam}
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-md">
                Browse our fresh kitchen menu, place orders directly to the kitchen, and call your server anytime.
              </p>
            </div>
            <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
              <span className="text-[11px] text-slate-400">Branch Outlet</span>
              <span className="text-sm font-bold text-white font-mono">{branchParam}</span>
            </div>
          </div>
        </div>

        {/* Categories & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky top-[65px] z-30 bg-[#030816]/95 backdrop-blur-md py-2">
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-[#070D1F] border border-white/8 text-slate-400 hover:text-white hover:border-white/15'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Veg Filter Toggle */}
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 ${
              vegOnly
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-[#070D1F] border-white/8 text-slate-400 hover:text-white'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${vegOnly ? 'bg-emerald-400' : 'bg-slate-600'}`} />
            <span>Veg Only</span>
          </button>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredMenu.map((item) => {
            const inCart = cart[item.id];
            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-[#070D1F] border border-white/8 hover:border-purple-500/30 transition-all flex gap-4 shadow-lg group"
              >
                {/* Image */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-[#030816] shrink-0 relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {item.isPopular && (
                    <span className="absolute top-1.5 left-1.5 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-amber-500 text-black flex items-center gap-0.5 shadow-md">
                      <Flame className="w-2.5 h-2.5" /> Popular
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                        {item.name}
                      </h3>
                      <span className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 ${
                        item.isVegetarian ? 'border-emerald-500 text-emerald-400' : 'border-rose-500 text-rose-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.isVegetarian ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/6">
                    <div className="font-black text-sm text-white">
                      ${item.price.toFixed(2)}
                    </div>

                    {inCart ? (
                      <div className="flex items-center gap-2 bg-purple-600/20 border border-purple-500/30 rounded-xl p-1">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center hover:bg-purple-500 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-white px-1.5">{inCart.quantity}</span>
                        <button
                          onClick={() => addToCart(item)}
                          className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center hover:bg-purple-500 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => addToCart(item)}
                        className="h-8 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold gap-1 shadow-lg shadow-purple-600/20"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* ── Sticky Bottom Cart Bar ──────────────────────────────────────── */}
      {totalItems > 0 && !isCheckoutOpen && !orderPlaced && (
        <div className="fixed bottom-0 inset-x-0 z-40 p-4 bg-gradient-to-t from-[#030816] via-[#030816]/90 to-transparent">
          <div className="max-w-2xl mx-auto">
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white p-4 rounded-2xl shadow-2xl shadow-purple-600/40 flex items-center justify-between font-bold text-sm transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-medium text-purple-200">Table {tableParam} • {totalItems} Items</p>
                  <p className="text-base font-black">${grandTotal.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs">
                <span>View Order</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </motion.button>
          </div>
        </div>
      )}

      {/* ── Order Checkout Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="w-full max-w-lg bg-[#070D1F] border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {!orderPlaced ? (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/8 bg-[#091128]">
                    <div>
                      <h3 className="text-base font-black text-white">Review Dine-In Order</h3>
                      <p className="text-xs text-slate-400">
                        Paragon ({branchParam}) • Table {tableParam}
                      </p>
                    </div>
                    <button
                      onClick={() => setIsCheckoutOpen(false)}
                      className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Items List */}
                  <div className="p-6 overflow-y-auto space-y-4 flex-1">
                    <div className="space-y-3">
                      {cartList.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#030816] border border-white/6 text-xs">
                          <div>
                            <p className="font-bold text-white text-sm">{item.name}</p>
                            <p className="text-slate-400 mt-0.5">${item.price.toFixed(2)} each</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="w-6 h-6 rounded-lg bg-white/6 hover:bg-white/12 text-white flex items-center justify-center"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-bold text-white px-1">{item.quantity}</span>
                            <button
                              onClick={() => addToCart(item as any)}
                              className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center hover:bg-purple-500"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Special Instructions */}
                    <div className="space-y-1.5 pt-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Kitchen Notes / Allergies
                      </label>
                      <input
                        type="text"
                        value={specialNote}
                        onChange={(e) => setSpecialNote(e.target.value)}
                        placeholder="e.g. Less spicy, dressing on side"
                        className="w-full bg-[#030816] border border-white/8 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>

                    {/* Bill Breakdown */}
                    <div className="p-4 rounded-xl bg-white/4 border border-white/6 text-xs space-y-2">
                      <div className="flex justify-between text-slate-400">
                        <span>Subtotal</span>
                        <span className="font-bold text-white">${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Tax (5%)</span>
                        <span className="text-slate-300">${tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Service Charge (10%)</span>
                        <span className="text-slate-300">${serviceCharge.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-white font-black text-sm pt-2 border-t border-white/8">
                        <span>Total Due</span>
                        <span className="text-purple-300">${grandTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-6 border-t border-white/8 bg-[#050A18] flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsCheckoutOpen(false)}
                      className="border-white/10 hover:bg-white/6 text-white font-bold text-xs rounded-xl h-11 px-4"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handlePlaceOrder}
                      className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl h-11 shadow-lg shadow-purple-600/30"
                    >
                      Send Order to Kitchen (${grandTotal.toFixed(2)})
                    </Button>
                  </div>
                </>
              ) : (
                /* Order Confirmation Screen */
                <div className="p-8 text-center space-y-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-white/8 text-slate-300 uppercase">
                      Order #ORD-8492
                    </span>
                    <h3 className="text-xl font-black text-white mt-2">
                      Order Sent to Downtown Kitchen!
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      Your order for <span className="text-white font-bold">Table {tableParam}</span> has been received and is being prepared.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#030816] border border-white/8 text-left text-xs space-y-2 max-w-sm mx-auto">
                    <div className="flex justify-between text-slate-400">
                      <span>Outlet</span>
                      <span className="font-bold text-white">Downtown Branch ({branchParam})</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Table</span>
                      <span className="font-bold text-purple-300">Table {tableParam}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Estimated Time</span>
                      <span className="font-bold text-emerald-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> 15 - 20 Mins
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      setCart({});
                      setOrderPlaced(false);
                      setIsCheckoutOpen(false);
                    }}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl h-11"
                  >
                    Order More Items
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DineInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#030816] flex items-center justify-center text-slate-400 text-sm">
          Loading Dine-In Menu...
        </div>
      }
    >
      <DineInContent />
    </Suspense>
  );
}
