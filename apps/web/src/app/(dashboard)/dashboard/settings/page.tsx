'use client';
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Clock, MapPin, Phone, Globe, Percent, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import { useMyRestaurants } from '@/hooks/useRestaurants';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/lib/utils';
import { BankDetailsManager } from '@/components/dashboard/BankDetailsManager';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function DashboardSettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'hours' | 'payments' | 'bank'>('general');
  const { data: myRestaurants } = useMyRestaurants();
  const restaurant = myRestaurants?.data?.[0];
  const qc = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      await api.put(`/restaurants/${restaurant._id}`, data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['restaurants', 'mine'] });
      toast.success('Settings saved');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const updateHoursMutation = useMutation({
    mutationFn: async (openingHours: unknown[]) => {
      await api.put(`/restaurants/${restaurant._id}/opening-hours`, { openingHours });
    },
    onSuccess: () => toast.success('Opening hours updated'),
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const [acceptsTableBooking, setAcceptsTableBooking] = useState(true);
  const [acceptsPreOrders, setAcceptsPreOrders] = useState(true);

  const { register: registerGeneral, handleSubmit: handleGeneral } = useForm({
    values: restaurant ? {
      name: restaurant.name,
      description: restaurant.description,
      phone: restaurant.phone,
      email: restaurant.email || '',
      website: restaurant.website || '',
      preparationTime: restaurant.preparationTime,
    } : undefined,
  });

  type HourEntry = { day: string; isOpen: boolean; openTime: string; closeTime: string };
  const [hours, setHours] = useState<HourEntry[]>(
    restaurant?.openingHours || DAYS.map((day) => ({ day, isOpen: true, openTime: '09:00', closeTime: '22:00' }))
  );

  const { register: registerPayments, handleSubmit: handlePayments } = useForm({
    values: restaurant ? {
      taxPercentage: restaurant.taxPercentage,
      serviceChargePercentage: restaurant.serviceChargePercentage,
      minimumOrderAmount: restaurant.minimumOrderAmount || 0,
    } : undefined,
  });

  const TABS = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'hours', label: 'Opening Hours', icon: Clock },
    { id: 'payments', label: 'Pricing', icon: Percent },
    { id: 'bank', label: 'Bank & Payouts', icon: Building2 },
  ] as const;

  if (!restaurant) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
        <p className="text-lg font-semibold">No restaurant found</p>
        <Button onClick={() => window.location.href = '/dashboard/new-restaurant'}>Create Restaurant</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Restaurant Settings</h1>

      {/* Tabs */}
      <div className="flex border-b gap-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === id ? 'border-brand-500 text-brand-600' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* General */}
      {activeTab === 'general' && (
        <form onSubmit={handleGeneral((d) => updateMutation.mutate({ ...d, acceptsTableBooking, acceptsPreOrders }))} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Restaurant Name" {...registerGeneral('name', { required: true })} />
            <Input label="Phone" leftIcon={<Phone className="h-4 w-4" />} {...registerGeneral('phone')} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea
              className="w-full h-24 px-3 py-2 rounded-xl border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              {...registerGeneral('description')}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Email" type="email" {...registerGeneral('email')} />
            <Input label="Website" leftIcon={<Globe className="h-4 w-4" />} {...registerGeneral('website')} />
          </div>
          <Input label="Avg Preparation Time (minutes)" type="number" {...registerGeneral('preparationTime')} />
          <div className="flex gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked={restaurant.acceptsTableBooking} className="w-4 h-4 rounded accent-brand-500" checked={acceptsTableBooking} onChange={(e) => setAcceptsTableBooking(e.target.checked)} />
              <span className="text-sm font-medium">Accept table bookings</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked={restaurant.acceptsPreOrders} className="w-4 h-4 rounded accent-brand-500" checked={acceptsPreOrders} onChange={(e) => setAcceptsPreOrders(e.target.checked)} />
              <span className="text-sm font-medium">Accept pre-orders</span>
            </label>
          </div>
              <Button type="submit" className="gap-2" isLoading={updateMutation.isPending}>
                <Save className="h-4 w-4" /> Save Changes
              </Button>
        </form>
      )}

      {/* Opening hours */}
      {activeTab === 'hours' && (
        <div className="space-y-4">
          {hours.map((entry, idx) => (
            <div key={entry.day} className="flex items-center justify-between p-3 rounded-xl border bg-card">
              <span className="text-sm font-medium capitalize w-28">{entry.day}</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={entry.isOpen}
                  onChange={(e) => {
                    const next = [...hours];
                    next[idx].isOpen = e.target.checked;
                    setHours(next);
                  }}
                  className="w-4 h-4 rounded accent-brand-500"
                />
                <span className="text-xs text-muted-foreground">{entry.isOpen ? 'Open' : 'Closed'}</span>
              </label>
              {entry.isOpen && (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={entry.openTime}
                    onChange={(e) => {
                      const next = [...hours];
                      next[idx].openTime = e.target.value;
                      setHours(next);
                    }}
                    className="px-2 py-1 text-xs border rounded-lg bg-background"
                  />
                  <span className="text-xs text-muted-foreground">to</span>
                  <input
                    type="time"
                    value={entry.closeTime}
                    onChange={(e) => {
                      const next = [...hours];
                      next[idx].closeTime = e.target.value;
                      setHours(next);
                    }}
                    className="px-2 py-1 text-xs border rounded-lg bg-background"
                  />
                </div>
              )}
            </div>
          ))}
          <Button className="gap-2" onClick={() => updateHoursMutation.mutate(hours)} isLoading={updateHoursMutation.isPending}>
            <Save className="h-4 w-4" /> Save Hours
          </Button>
        </div>
      )}

      {/* Pricing */}
      {activeTab === 'payments' && (
        <form onSubmit={handlePayments((d) => updateMutation.mutate(d))} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Tax Percentage (%)" type="number" step="0.5" min="0" max="30" {...registerPayments('taxPercentage')} />
            <Input label="Service Charge (%)" type="number" step="0.5" min="0" max="30" {...registerPayments('serviceChargePercentage')} />
          </div>
          <Input label="Minimum Order Amount (₹)" type="number" min="0" {...registerPayments('minimumOrderAmount')} />
          <Button type="submit" className="gap-2" isLoading={updateMutation.isPending}>
            <Save className="h-4 w-4" /> Save Pricing
          </Button>
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
