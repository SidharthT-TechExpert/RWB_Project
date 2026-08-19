'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Save,
  Clock,
  MapPin,
  Phone,
  Globe,
  Percent,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { useMyRestaurants } from '@/hooks/useRestaurants';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/lib/utils';
import { BankDetailsManager } from '@/components/dashboard/BankDetailsManager';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function DashboardSettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'hours' | 'payments' | 'bank'>('general');
  const { user } = useAuth();
  const { data: myRestaurants, isLoading } = useMyRestaurants();
  const restaurant = myRestaurants?.data?.[0];
  const restaurantId = restaurant?._id;
  const qc = useQueryClient();

  const [acceptsTableBooking, setAcceptsTableBooking] = useState(true);
  const [acceptsPreOrders, setAcceptsPreOrders] = useState(true);

  type HourEntry = { day: string; isOpen: boolean; openTime: string; closeTime: string };
  const [hours, setHours] = useState<HourEntry[]>(
    DAYS.map((day) => ({ day, isOpen: true, openTime: '09:00', closeTime: '23:00' }))
  );

  const { register: registerGeneral, handleSubmit: handleGeneral, reset: resetGeneral } = useForm({
    defaultValues: {
      name: '',
      description: '',
      phone: '+1 212-555-0199',
      email: '',
      website: '',
      preparationTime: 25,
    },
  });

  const { register: registerPayments, handleSubmit: handlePayments, reset: resetPayments } = useForm({
    defaultValues: {
      taxPercentage: 5,
      serviceChargePercentage: 0,
      minimumOrderAmount: 0,
    },
  });

  useEffect(() => {
    if (restaurant) {
      resetGeneral({
        name: restaurant.name || '',
        description: restaurant.description || '',
        phone: restaurant.phone || user?.phone || '+1 212-555-0199',
        email: restaurant.email || user?.email || '',
        website: restaurant.website || '',
        preparationTime: restaurant.preparationTime || 25,
      });

      resetPayments({
        taxPercentage: restaurant.taxPercentage ?? 5,
        serviceChargePercentage: restaurant.serviceChargePercentage ?? 0,
        minimumOrderAmount: restaurant.minimumOrderAmount ?? 0,
      });

      if (restaurant.openingHours?.length) {
        setHours(restaurant.openingHours);
      }
      if (typeof restaurant.acceptsTableBooking === 'boolean') {
        setAcceptsTableBooking(restaurant.acceptsTableBooking);
      }
      if (typeof restaurant.acceptsPreOrders === 'boolean') {
        setAcceptsPreOrders(restaurant.acceptsPreOrders);
      }
    } else if (user) {
      resetGeneral({
        name: user.name ? `${user.name}'s Restaurant` : 'My Restaurant',
        description: 'Authentic dining experience crafted with local culinary heritage.',
        phone: user.phone || '+1 212-555-0199',
        email: user.email || '',
        website: '',
        preparationTime: 25,
      });
    }
  }, [restaurant, user, resetGeneral, resetPayments]);

  const updateMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const payload = {
        ...data,
        acceptsTableBooking,
        acceptsPreOrders,
        openingHours: hours,
      };

      if (restaurantId) {
        const res = await api.put(`/restaurants/${restaurantId}`, payload);
        return res.data;
      } else {
        const res = await api.post('/restaurants', {
          ...payload,
          ownerName: user?.name || 'Restaurant Owner',
          status: 'active',
          address: {
            street: '128 Main Street',
            city: 'New York',
            state: 'NY',
            country: 'USA',
            zipCode: '10001',
          },
        });
        return res.data;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['restaurants', 'mine'] });
      qc.invalidateQueries({ queryKey: ['branches'] });
      toast.success('🎉 Restaurant settings saved successfully!');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const updateHoursMutation = useMutation({
    mutationFn: async (openingHours: unknown[]) => {
      if (restaurantId) {
        await api.put(`/restaurants/${restaurantId}/opening-hours`, { openingHours });
      } else {
        await updateMutation.mutateAsync({ openingHours });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['restaurants', 'mine'] });
      toast.success('Opening hours updated');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const TABS = [
    { id: 'general', label: 'General & Profile', icon: Globe },
    { id: 'hours', label: 'Opening Hours', icon: Clock },
    { id: 'payments', label: 'Pricing & Taxes', icon: Percent },
    { id: 'bank', label: 'Bank & Payouts', icon: Building2 },
  ] as const;

  return (
    <div className="max-w-4xl space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#09122B]/90 border border-white/8 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Building2 className="w-6 h-6 text-purple-400" />
              Restaurant Settings
            </h1>
            {!restaurantId && !isLoading && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Initial Setup
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure restaurant identity, operating schedule, order policies, and verified settlement bank details.
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-purple-300 font-bold bg-purple-500/10 px-3 py-1.5 rounded-xl border border-purple-500/20">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
            <span>Loading details...</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-white/8 pb-2 overflow-x-auto custom-scrollbar">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === id
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/4'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* General & Profile */}
      {activeTab === 'general' && (
        <form
          onSubmit={handleGeneral((d) => updateMutation.mutate(d))}
          className="p-6 rounded-2xl bg-[#09122B]/90 border border-white/8 shadow-xl space-y-5"
        >
          <div className="border-b border-white/8 pb-3">
            <h3 className="text-base font-black text-white">General Information</h3>
            <p className="text-xs text-slate-400">Basic contact and dining details displayed to your customers.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Restaurant Name *</label>
              <input
                {...registerGeneral('name', { required: true })}
                placeholder="e.g. Paragon Restaurant"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-white/10 bg-white/4 text-white placeholder-slate-500 outline-none focus:border-purple-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Customer Phone Number</label>
              <input
                {...registerGeneral('phone')}
                placeholder="+1 212-555-0199"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-white/10 bg-white/4 text-white placeholder-slate-500 outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">About & Description</label>
            <textarea
              rows={3}
              {...registerGeneral('description')}
              placeholder="Tell diners about your culinary specialty, ambiance, and ingredients..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-white/10 bg-white/4 text-white placeholder-slate-500 outline-none focus:border-purple-500 resize-none"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Support Email</label>
              <input
                type="email"
                {...registerGeneral('email')}
                placeholder="contact@restaurant.com"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-white/10 bg-white/4 text-white placeholder-slate-500 outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Website URL</label>
              <input
                {...registerGeneral('website')}
                placeholder="https://restaurant.com"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-white/10 bg-white/4 text-white placeholder-slate-500 outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Avg Preparation Time (minutes)</label>
            <input
              type="number"
              min="5"
              max="120"
              {...registerGeneral('preparationTime')}
              className="w-full sm:w-48 px-3.5 py-2 text-xs rounded-xl border border-white/10 bg-white/4 text-white outline-none focus:border-purple-500 font-mono"
            />
          </div>

          <div className="flex flex-wrap gap-6 pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptsTableBooking}
                onChange={(e) => setAcceptsTableBooking(e.target.checked)}
                className="w-4 h-4 rounded accent-purple-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-200">Accept Table Bookings</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptsPreOrders}
                onChange={(e) => setAcceptsPreOrders(e.target.checked)}
                className="w-4 h-4 rounded accent-purple-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-200">Accept Food Pre-Orders</span>
            </label>
          </div>

          <div className="flex justify-end pt-4 border-t border-white/8">
            <Button
              type="submit"
              isLoading={updateMutation.isPending}
              className="h-10 px-5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl gap-2 shadow-lg shadow-purple-600/30 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Restaurant Profile</span>
            </Button>
          </div>
        </form>
      )}

      {/* Opening Hours */}
      {activeTab === 'hours' && (
        <div className="p-6 rounded-2xl bg-[#09122B]/90 border border-white/8 shadow-xl space-y-4">
          <div className="border-b border-white/8 pb-3">
            <h3 className="text-base font-black text-white">Opening & Dining Hours</h3>
            <p className="text-xs text-slate-400">Set standard operating schedules for reservations and takeaway orders.</p>
          </div>

          <div className="space-y-2.5">
            {hours.map((entry, idx) => (
              <div
                key={entry.day}
                className="p-3 rounded-xl bg-white/2 border border-white/6 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 w-40">
                  <input
                    type="checkbox"
                    checked={entry.isOpen}
                    onChange={(e) => {
                      const next = [...hours];
                      next[idx].isOpen = e.target.checked;
                      setHours(next);
                    }}
                    className="w-4 h-4 rounded accent-purple-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-white capitalize">{entry.day}</span>
                  <span className={`text-[10px] font-bold uppercase ${entry.isOpen ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {entry.isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>

                {entry.isOpen ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={entry.openTime}
                      onChange={(e) => {
                        const next = [...hours];
                        next[idx].openTime = e.target.value;
                        setHours(next);
                      }}
                      className="px-2.5 py-1 text-xs rounded-lg border border-white/10 bg-[#0B1530] text-white font-mono font-bold outline-none"
                    />
                    <span className="text-xs text-slate-400">to</span>
                    <input
                      type="time"
                      value={entry.closeTime}
                      onChange={(e) => {
                        const next = [...hours];
                        next[idx].closeTime = e.target.value;
                        setHours(next);
                      }}
                      className="px-2.5 py-1 text-xs rounded-lg border border-white/10 bg-[#0B1530] text-white font-mono font-bold outline-none"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-slate-500 italic">Closed all day</span>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-white/8">
            <Button
              type="button"
              onClick={() => updateHoursMutation.mutate(hours)}
              isLoading={updateHoursMutation.isPending}
              className="h-10 px-5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl gap-2 shadow-lg shadow-purple-600/30 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Opening Hours</span>
            </Button>
          </div>
        </div>
      )}

      {/* Pricing & Taxes */}
      {activeTab === 'payments' && (
        <form
          onSubmit={handlePayments((d) => updateMutation.mutate(d))}
          className="p-6 rounded-2xl bg-[#09122B]/90 border border-white/8 shadow-xl space-y-5"
        >
          <div className="border-b border-white/8 pb-3">
            <h3 className="text-base font-black text-white">Pricing, Taxes & Order Limits</h3>
            <p className="text-xs text-slate-400">Manage GST/tax rates, service charge, and pre-order minimums.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Tax Percentage (%)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="30"
                {...registerPayments('taxPercentage')}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-white/10 bg-white/4 text-white font-mono outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Service Charge (%)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="30"
                {...registerPayments('serviceChargePercentage')}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-white/10 bg-white/4 text-white font-mono outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Minimum Order Amount (₹)</label>
            <input
              type="number"
              min="0"
              {...registerPayments('minimumOrderAmount')}
              className="w-full sm:w-60 px-3.5 py-2 text-xs rounded-xl border border-white/10 bg-white/4 text-white font-mono outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-white/8">
            <Button
              type="submit"
              isLoading={updateMutation.isPending}
              className="h-10 px-5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl gap-2 shadow-lg shadow-purple-600/30 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Pricing & Taxes</span>
            </Button>
          </div>
        </form>
      )}

      {/* Bank & Payouts */}
      {activeTab === 'bank' && (
        <div className="pt-2">
          <BankDetailsManager />
        </div>
      )}
    </div>
  );
}
