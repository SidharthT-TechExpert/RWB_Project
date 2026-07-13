'use client';
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Clock, MapPin, Phone, Globe, Percent } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import { useMyRestaurants } from '@/hooks/useRestaurants';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/lib/utils';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function DashboardSettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'hours' | 'payments'>('general');
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
          {hours.map((h, i) => (
            <div key={h.day} className="flex items-center gap-4 p-4 rounded-xl border">
              <div className="w-28 shrink-0">
                <p className="text-sm font-medium capitalize">{h.day}</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={h.isOpen}
                  onChange={(e) => setHours((prev) => prev.map((x, idx) => idx === i ? { ...x, isOpen: e.target.checked } : x))}
                  className="w-4 h-4 rounded accent-brand-500"
                />
                <span className="text-sm">{h.isOpen ? 'Open' : 'Closed'}</span>
              </label>
              {h.isOpen && (
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="time"
                    value={h.openTime}
                    onChange={(e) => setHours((prev) => prev.map((x, idx) => idx === i ? { ...x, openTime: e.target.value } : x))}
                    className="h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <span className="text-muted-foreground text-sm">to</span>
                  <input
                    type="time"
                    value={h.closeTime}
                    onChange={(e) => setHours((prev) => prev.map((x, idx) => idx === i ? { ...x, closeTime: e.target.value } : x))}
                    className="h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
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
    </div>
  );
}
