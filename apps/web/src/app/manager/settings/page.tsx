'use client';

import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Save,
  Store,
  Phone,
  Mail,
  MapPin,
  Clock,
  Globe,
  SlidersHorizontal,
  Utensils,
  CheckCircle2,
  Power,
  Zap,
  Armchair,
  Sparkles,
  Navigation,
  ShieldCheck,
  Tag,
  Info,
} from 'lucide-react';
import { ManagerHeader } from '@/components/manager/ManagerHeader';
import { Button } from '@/components/ui/Button';
import { useCurrentBranch } from '@/hooks/useBranches';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/lib/utils';
import Link from 'next/link';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

const CUISINE_OPTIONS = [
  'Kerala Traditional',
  'Malabar Special',
  'Biryani Specialist',
  'Arabian & Mandi',
  'North Indian',
  'South Indian',
  'Chinese',
  'Continental',
  'Fast Food & Burgers',
  'Cafe & Beverages',
  'Seafood Special',
  'Tandoor & Grill',
  'Desserts & Ice Cream',
];

const AMENITY_OPTIONS = [
  { id: 'ac', label: 'Air Conditioned Dining' },
  { id: 'wifi', label: 'Free High-Speed Wi-Fi' },
  { id: 'parking', label: 'Valet / Dedicated Parking' },
  { id: 'private_dining', label: 'Private Family Cabins' },
  { id: 'outdoor', label: 'Outdoor Garden Seating' },
  { id: 'family', label: 'Family Friendly Zone' },
  { id: 'wheelchair', label: 'Wheelchair Accessible' },
  { id: 'halal', label: '100% Halal Certified' },
  { id: 'live_music', label: 'Live Music / Ambient Sound' },
];

export default function ManagerSettingsPage() {
  const qc = useQueryClient();
  const currentBranch = useCurrentBranch();
  const branchId = currentBranch?._id;

  const [activeTab, setActiveTab] = useState<
    'profile' | 'operations' | 'hours' | 'location' | 'cuisines' | 'capacity'
  >('profile');

  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    phone: '',
    email: '',
    website: '',
    coverImage: '',
    logo: '',
    status: 'active',
    acceptsTableBooking: true,
    acceptsPreOrders: true,
    preparationTime: 25,
    minimumOrderAmount: 0,
    street: '',
    city: '',
    state: '',
    zipCode: '',
    lat: 11.1444,
    lon: 75.9625,
    cuisineTypes: ['Kerala Traditional', 'Malabar Special'],
    priceRange: 2,
    features: ['ac', 'wifi', 'parking', 'family'],
    openingHours: DAYS.map((day) => ({
      day,
      isOpen: true,
      openTime: '09:00',
      closeTime: '23:00',
    })),
  });

  useEffect(() => {
    if (currentBranch) {
      setForm((prev) => ({
        ...prev,
        name: currentBranch.name || prev.name,
        code: currentBranch.code || prev.code,
        phone: currentBranch.phone || prev.phone,
        email: currentBranch.email || prev.email,
        street: currentBranch.address?.street || prev.street,
        city: currentBranch.address?.city || prev.city,
        state: currentBranch.address?.state || prev.state || 'Kerala',
        status: currentBranch.status || prev.status,
      }));
    }
  }, [currentBranch]);

  const saveMutation = useMutation({
    mutationFn: async (payload: typeof form) => {
      if (branchId) {
        await api.put(`/branches/${branchId}`, {
          name: payload.name,
          phone: payload.phone,
          email: payload.email,
          status: payload.status,
          address: {
            street: payload.street,
            city: payload.city,
            state: payload.state,
            zipCode: payload.zipCode,
          },
          location: {
            type: 'Point',
            coordinates: [payload.lon, payload.lat],
          },
          openingHours: payload.openingHours,
        });
      }

      if (currentBranch?.restaurantId) {
        await api.put(`/restaurants/${currentBranch.restaurantId}`, {
          name: payload.name,
          description: payload.description,
          phone: payload.phone,
          email: payload.email,
          website: payload.website,
          coverImage: payload.coverImage,
          logo: payload.logo,
          preparationTime: payload.preparationTime,
          minimumOrderAmount: payload.minimumOrderAmount,
          acceptsTableBooking: payload.acceptsTableBooking,
          acceptsPreOrders: payload.acceptsPreOrders,
          cuisineTypes: payload.cuisineTypes,
          priceRange: payload.priceRange,
          features: payload.features,
          openingHours: payload.openingHours,
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['branches'] });
      qc.invalidateQueries({ queryKey: ['restaurants'] });
      toast.success('🎉 Restaurant & Outlet parameters saved successfully!');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const handleApplyMondayToAll = () => {
    const mondayHours = form.openingHours.find((h) => h.day === 'monday') || {
      isOpen: true,
      openTime: '09:00',
      closeTime: '23:00',
    };
    setForm((prev) => ({
      ...prev,
      openingHours: prev.openingHours.map((h) => ({
        ...h,
        isOpen: mondayHours.isOpen,
        openTime: mondayHours.openTime,
        closeTime: mondayHours.closeTime,
      })),
    }));
    toast.success('Applied Monday schedule to all days!');
  };

  const handleToggleCuisine = (c: string) => {
    setForm((prev) => {
      const exists = prev.cuisineTypes.includes(c);
      return {
        ...prev,
        cuisineTypes: exists
          ? prev.cuisineTypes.filter((x) => x !== c)
          : [...prev.cuisineTypes, c],
      };
    });
  };

  const handleToggleFeature = (f: string) => {
    setForm((prev) => {
      const exists = prev.features.includes(f);
      return {
        ...prev,
        features: exists
          ? prev.features.filter((x) => x !== f)
          : [...prev.features, f],
      };
    });
  };

  const handleDetectGPS = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      toast.loading('Detecting current GPS location...', { id: 'gps-detect' });
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm((prev) => ({
            ...prev,
            lat: Number(pos.coords.latitude.toFixed(5)),
            lon: Number(pos.coords.longitude.toFixed(5)),
          }));
          toast.success('GPS coordinates locked in!', { id: 'gps-detect' });
        },
        () => {
          toast.error('Unable to retrieve GPS coordinates. Please enter manually.', { id: 'gps-detect' });
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  };

  const TABS = [
    { id: 'profile', label: 'Profile & Branding', icon: Store },
    { id: 'operations', label: 'Live Operations', icon: Power },
    { id: 'hours', label: 'Operating Hours', icon: Clock },
    { id: 'location', label: 'Address & GPS', icon: MapPin },
    { id: 'cuisines', label: 'Cuisines & Amenities', icon: Utensils },
    { id: 'capacity', label: 'Floor & Capacity', icon: Armchair },
  ] as const;
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#030816]">
      <ManagerHeader pageTitle="Restaurant & Outlet Details Management" />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl w-full mx-auto pb-24">
        {/* Top Header Card */}
        <div className="p-6 rounded-3xl bg-[#060C1E] border border-white/8 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white">{form.name || 'Assigned Outlet'}</h1>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
                  {form.code || 'OUTLET'}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  form.status === 'active'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {form.status === 'active' ? '● Open & Live' : '● Closed'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Full manager-level control over outlet profile, kitchen operations, schedule, and dining settings.
              </p>
            </div>
          </div>

          <Button
            onClick={() => saveMutation.mutate(form)}
            isLoading={saveMutation.isPending}
            className="h-11 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl gap-2 shadow-lg shadow-blue-600/30 cursor-pointer shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>Save All Changes</span>
          </Button>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar border-b border-white/8">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTab === id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/4'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Tab 1: Profile & Branding */}
        {activeTab === 'profile' && (
          <div className="p-6 sm:p-7 rounded-3xl bg-[#060C1E] border border-white/8 shadow-xl space-y-6">
            <div className="border-b border-white/8 pb-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Store className="w-4 h-4 text-blue-400" />
                Restaurant Identity & Public Info
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Visible to diners on QuickBite search, web portal, and mobile app.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Outlet / Restaurant Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Paragon Restaurant — Calicut Road"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-white/10 bg-white/4 text-white placeholder-slate-500 outline-none focus:border-blue-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Outlet Code (Fixed)</label>
                <input
                  type="text"
                  disabled
                  value={form.code}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-white/10 bg-white/2 text-slate-400 font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Description & Story</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Highlight your signature dishes, ambiance, awards, and dining heritage..."
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-white/10 bg-white/4 text-white placeholder-slate-500 outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Customer Care Phone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-white/10 bg-white/4 text-white placeholder-slate-500 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Support Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="support@restaurant.com"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-white/10 bg-white/4 text-white placeholder-slate-500 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Official Website</label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    placeholder="https://restaurant.com"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-white/10 bg-white/4 text-white placeholder-slate-500 outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Cover Image URL</label>
                <input
                  type="text"
                  value={form.coverImage}
                  onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-white/10 bg-white/4 text-white placeholder-slate-500 outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Logo URL</label>
                <input
                  type="text"
                  value={form.logo}
                  onChange={(e) => setForm({ ...form, logo: e.target.value })}
                  placeholder="https://restaurant.com/logo.png"
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-white/10 bg-white/4 text-white placeholder-slate-500 outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Operations */}
        {activeTab === 'operations' && (
          <div className="p-6 sm:p-7 rounded-3xl bg-[#060C1E] border border-white/8 shadow-xl space-y-6">
            <div className="border-b border-white/8 pb-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Power className="w-4 h-4 text-emerald-400" />
                Live Operational Controls & Kitchen Settings
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Real-time flags that immediately control customer ordering and table bookings.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/3 border border-white/8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  form.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  <Power className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">
                    Outlet Status: {form.status === 'active' ? 'Open for Orders & Dine-In' : 'Temporarily Closed / Kitchen Busy'}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {form.status === 'active'
                      ? 'Customers can browse menu, book tables, and place food pre-orders.'
                      : 'Orders and table bookings are temporarily paused on the customer portal.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setForm({ ...form, status: form.status === 'active' ? 'inactive' : 'active' })}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  form.status === 'active'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30'
                }`}
              >
                {form.status === 'active' ? 'Switch to Closed' : 'Open Restaurant'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/2 border border-white/6 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-black text-white">Accept Table Bookings</h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">Enable advance reservation system</p>
                </div>
                <input
                  type="checkbox"
                  checked={form.acceptsTableBooking}
                  onChange={(e) => setForm({ ...form, acceptsTableBooking: e.target.checked })}
                  className="w-5 h-5 rounded accent-blue-500 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-2xl bg-white/2 border border-white/6 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-black text-white">Accept Food Pre-Orders</h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">Allow diners to pre-order before arriving</p>
                </div>
                <input
                  type="checkbox"
                  checked={form.acceptsPreOrders}
                  onChange={(e) => setForm({ ...form, acceptsPreOrders: e.target.checked })}
                  className="w-5 h-5 rounded accent-blue-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300">Average Preparation Time (Minutes)</label>
                  <span className="text-xs font-mono font-black text-blue-400">{form.preparationTime} mins</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  step="5"
                  value={form.preparationTime}
                  onChange={(e) => setForm({ ...form, preparationTime: Number(e.target.value) })}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400 mt-1">Displayed to diners during checkout for ready time estimation.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Minimum Order Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={form.minimumOrderAmount}
                  onChange={(e) => setForm({ ...form, minimumOrderAmount: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-white/10 bg-white/4 text-white outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Operating Hours */}
        {activeTab === 'hours' && (
          <div className="p-6 sm:p-7 rounded-3xl bg-[#060C1E] border border-white/8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/8 pb-4">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  Weekly Operating Hours
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Control opening and closing times for each day of the week.</p>
              </div>

              <Button
                type="button"
                onClick={handleApplyMondayToAll}
                className="h-9 px-3.5 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-bold rounded-xl gap-1.5 cursor-pointer shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Apply Monday to All Days</span>
              </Button>
            </div>

            <div className="space-y-2.5">
              {form.openingHours.map((entry, idx) => (
                <div
                  key={entry.day}
                  className="p-3.5 sm:p-4 rounded-2xl bg-white/2 border border-white/6 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 w-40">
                    <input
                      type="checkbox"
                      checked={entry.isOpen}
                      onChange={(e) => {
                        const next = [...form.openingHours];
                        next[idx].isOpen = e.target.checked;
                        setForm({ ...form, openingHours: next });
                      }}
                      className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
                    />
                    <span className="text-sm font-bold text-white capitalize">{entry.day}</span>
                    <span className={`text-[10px] font-bold uppercase ${entry.isOpen ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {entry.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>

                  {entry.isOpen ? (
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-400 font-medium">Opens:</span>
                        <input
                          type="time"
                          value={entry.openTime}
                          onChange={(e) => {
                            const next = [...form.openingHours];
                            next[idx].openTime = e.target.value;
                            setForm({ ...form, openingHours: next });
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-white/10 bg-[#0B1530] text-xs font-mono font-bold text-white outline-none focus:border-blue-500"
                        />
                      </div>

                      <span className="text-slate-500 text-xs">to</span>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-400 font-medium">Closes:</span>
                        <input
                          type="time"
                          value={entry.closeTime}
                          onChange={(e) => {
                            const next = [...form.openingHours];
                            next[idx].closeTime = e.target.value;
                            setForm({ ...form, openingHours: next });
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-white/10 bg-[#0B1530] text-xs font-mono font-bold text-white outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 italic">No dine-in or pre-orders accepted on this day.</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Address & GPS */}
        {activeTab === 'location' && (
          <div className="p-6 sm:p-7 rounded-3xl bg-[#060C1E] border border-white/8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/8 pb-4">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  Address & Geographic Coordinates
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Determines discovery on the customer Nearby Restaurants map.</p>
              </div>

              <Button
                type="button"
                onClick={handleDetectGPS}
                className="h-9 px-3.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold rounded-xl gap-1.5 cursor-pointer shrink-0"
              >
                <Navigation className="w-3.5 h-3.5 text-blue-400" />
                <span>Detect Exact GPS Coordinates</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Street Address</label>
                <input
                  type="text"
                  value={form.street}
                  onChange={(e) => setForm({ ...form, street: e.target.value })}
                  placeholder="e.g. 128 Calicut Bypass Road, Opp. Bus Stand"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-white/10 bg-white/4 text-white placeholder-slate-500 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">City / Town *</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="e.g. Vengara, Malappuram, Kozhikode"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-white/10 bg-white/4 text-white placeholder-slate-500 outline-none focus:border-blue-500 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">State / Province</label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  placeholder="Kerala"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-white/10 bg-white/4 text-white placeholder-slate-500 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Pin / Postal Code</label>
                <input
                  type="text"
                  value={form.zipCode}
                  onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
                  placeholder="676304"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-white/10 bg-white/4 text-white placeholder-slate-500 outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/2 border border-white/6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Map Pin Coordinates</span>
                <span className="text-[11px] text-blue-300 font-mono font-bold">
                  {form.lat}, {form.lon}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={form.lat}
                    onChange={(e) => setForm({ ...form, lat: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-[#0B1530] text-xs font-mono text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={form.lon}
                    onChange={(e) => setForm({ ...form, lon: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-[#0B1530] text-xs font-mono text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Cuisines & Amenities */}
        {activeTab === 'cuisines' && (
          <div className="p-6 sm:p-7 rounded-3xl bg-[#060C1E] border border-white/8 shadow-xl space-y-6">
            <div className="border-b border-white/8 pb-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Utensils className="w-4 h-4 text-blue-400" />
                Cuisines, Pricing Tier & Dining Amenities
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Helps diners discover your outlet via search filters and food categories.</p>
            </div>

            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-300">Offered Cuisines (Click to toggle)</label>
              <div className="flex flex-wrap gap-2">
                {CUISINE_OPTIONS.map((c) => {
                  const isSelected = form.cuisineTypes.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleToggleCuisine(c)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 border border-blue-400/40'
                          : 'bg-white/4 hover:bg-white/8 text-slate-300 border border-white/8'
                      }`}
                    >
                      {isSelected ? `✓ ${c}` : `+ ${c}`}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <label className="block text-xs font-bold text-slate-300">Price Tier</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { value: 1, label: '₹ Budget Friendly', sub: '₹100 - ₹300 per person' },
                  { value: 2, label: '₹₹ Moderate / Casual', sub: '₹300 - ₹700 per person' },
                  { value: 3, label: '₹₹₹ Premium / Fine', sub: '₹700 - ₹1,500 per person' },
                  { value: 4, label: '₹₹₹₹ Luxury Dining', sub: '₹1,500+ per person' },
                ].map((tier) => (
                  <button
                    key={tier.value}
                    type="button"
                    onClick={() => setForm({ ...form, priceRange: tier.value as any })}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      form.priceRange === tier.value
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg'
                        : 'bg-white/2 hover:bg-white/5 border-white/6 text-slate-300'
                    }`}
                  >
                    <span className="font-extrabold text-xs block text-white">{tier.label}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{tier.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <label className="block text-xs font-bold text-slate-300">Dining Amenities & Features</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {AMENITY_OPTIONS.map((amenity) => {
                  const isSelected = form.features.includes(amenity.id);
                  return (
                    <button
                      key={amenity.id}
                      type="button"
                      onClick={() => handleToggleFeature(amenity.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-600/15 border-blue-500/40 text-white'
                          : 'bg-white/2 hover:bg-white/5 border-white/6 text-slate-400'
                      }`}
                    >
                      <span className="text-xs font-bold">{amenity.label}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Floor & Capacity */}
        {activeTab === 'capacity' && (
          <div className="p-6 sm:p-7 rounded-3xl bg-[#060C1E] border border-white/8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/8 pb-4">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Armchair className="w-4 h-4 text-blue-400" />
                  Floor Seating & Capacity Overview
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Summary of physical tables, guest capacity, and digital QR codes.</p>
              </div>

              <Link
                href="/manager/tables"
                className="h-9 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md shrink-0"
              >
                <Armchair className="w-3.5 h-3.5" />
                <span>Open Floor Layout & Tables</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white/2 border border-white/6 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Total Tables</span>
                <p className="text-2xl font-black text-white">{currentBranch?.tablesCount || 24}</p>
                <p className="text-[11px] text-slate-400">Configured indoor & outdoor tables</p>
              </div>

              <div className="p-5 rounded-2xl bg-white/2 border border-white/6 space-y-1">
                <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest">Seating Capacity</span>
                <p className="text-2xl font-black text-white">{(currentBranch?.tablesCount || 24) * 4} Guests</p>
                <p className="text-[11px] text-slate-400">Instant simultaneous covers</p>
              </div>

              <div className="p-5 rounded-2xl bg-white/2 border border-white/6 space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">Digital Table QR</span>
                <p className="text-2xl font-black text-emerald-400">Active</p>
                <p className="text-[11px] text-slate-400">Standees ready for table scan</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 flex items-center justify-between">
              <span>To add new tables, toggle table availability, or bulk print QR standees:</span>
              <Link href="/manager/tables" className="font-bold text-white underline hover:text-blue-300">
                Go to Floor Tables &rarr;
              </Link>
            </div>
          </div>
        )}

        {/* Global Save Bar at Bottom */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#060C1E] border border-white/8">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Info className="w-4 h-4 text-blue-400" />
            <span>Changes will apply immediately to your live outlet profile.</span>
          </div>

          <Button
            onClick={() => saveMutation.mutate(form)}
            isLoading={saveMutation.isPending}
            className="h-10 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl gap-2 shadow-lg shadow-blue-600/30 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save All Changes</span>
          </Button>
        </div>
      </main>
    </div>
  );
}
