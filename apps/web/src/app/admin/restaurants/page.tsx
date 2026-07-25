'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  X,
  Pause,
  Search,
  Plus,
  EyeOff,
  Building2,
  MapPin,
  Star,
  Sparkles,
  Phone,
  Mail,
  User,
  FileText,
  Lock,
  Compass,
  Info,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
  active: 'success',
  pending: 'warning',
  suspended: 'destructive',
  rejected: 'destructive',
  inactive: 'secondary',
};

const RESTAURANT_TYPES = ['Restaurant', 'Cafe', 'Bakery', 'Fast Food', 'Food Court'];

interface MinimalRestaurantForm {
  name: string;
  ownerName: string;
  phone: string;
  email: string;
  city: string;
  street: string;
  gstNumber: string;
  regNumber: string;
  latitude: string;
  longitude: string;
  restaurantType: string;
  status: string;
  logo: string;
  coverImage: string;
  tempPassword: string;
}

const DEFAULT_MINIMAL_FORM: MinimalRestaurantForm = {
  name: '',
  ownerName: '',
  phone: '',
  email: '',
  city: 'New York',
  street: '',
  gstNumber: '',
  regNumber: '',
  latitude: '40.7484',
  longitude: '-73.9857',
  restaurantType: 'Restaurant',
  status: 'active',
  logo: '',
  coverImage: '',
  tempPassword: 'Welcome@123',
};

export default function AdminRestaurantsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<MinimalRestaurantForm>(DEFAULT_MINIMAL_FORM);

  const qc = useQueryClient();

  // Fetch restaurants
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'restaurants', statusFilter, search],
    queryFn: async () => {
      const { data } = await api.get('/restaurants', {
        params: { status: statusFilter || undefined, city: search || undefined, limit: 100 },
      });
      return data;
    },
  });

  // Update Status Action
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      if (status === 'active') return api.patch(`/admin/restaurants/${id}/approve`);
      if (status === 'suspended') return api.patch(`/admin/restaurants/${id}/suspend`);
      if (status === 'rejected') return api.patch(`/admin/restaurants/${id}/reject`, { reason: 'Admin update' });
      return api.put(`/restaurants/${id}`, { status });
    },
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: ['admin', 'restaurants'] });
      toast.success(`Restaurant status set to ${status}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update status');
    },
  });

  // Minimal Onboarding Creation
  const createMutation = useMutation({
    mutationFn: async (payload: MinimalRestaurantForm) => {
      const formatted = {
        name: payload.name,
        slug: payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4),
        description: `${payload.name} (${payload.restaurantType}) located in ${payload.city}. Managed by ${payload.ownerName}.`,
        cuisineTypes: [payload.restaurantType],
        priceRange: 2,
        address: {
          street: payload.street,
          city: payload.city,
          state: 'NY',
          country: 'USA',
          zipCode: '10001',
        },
        location: {
          type: 'Point',
          coordinates: [Number(payload.longitude) || -73.9857, Number(payload.latitude) || 40.7484],
        },
        phone: payload.phone,
        email: payload.email,
        logo: payload.logo || undefined,
        coverImage: payload.coverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
        status: payload.status,
        tags: [payload.restaurantType.toLowerCase(), payload.city.toLowerCase()],
        openingHours: [
          { day: 'monday', isOpen: true, openTime: '10:00', closeTime: '22:00' },
          { day: 'tuesday', isOpen: true, openTime: '10:00', closeTime: '22:00' },
          { day: 'wednesday', isOpen: true, openTime: '10:00', closeTime: '22:00' },
          { day: 'thursday', isOpen: true, openTime: '10:00', closeTime: '22:00' },
          { day: 'friday', isOpen: true, openTime: '10:00', closeTime: '22:00' },
          { day: 'saturday', isOpen: true, openTime: '10:00', closeTime: '22:00' },
          { day: 'sunday', isOpen: true, openTime: '10:00', closeTime: '22:00' },
        ],
        tables: [],
        totalCapacity: 0,
        acceptsPreOrders: true,
        acceptsTableBooking: true,
      };

      return api.post('/restaurants', formatted);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'restaurants'] });
      toast.success('🎉 Restaurant onboarded successfully! Owner can now log in & configure operational details.');
      setIsAddModalOpen(false);
      setFormData(DEFAULT_MINIMAL_FORM);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to onboard restaurant');
    },
  });

  const restaurants = data?.data || [];

  return (
    <div className="space-y-6">
      {/* ── Top Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-5 rounded-2xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="w-6 h-6 text-brand-500" />
            Restaurant Admin Portal
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Onboard new restaurants with minimum required details. Day-to-day operations are managed by restaurant owners in their dashboard.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by city or name..."
              className="pl-9 h-10 w-full pr-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-input bg-background text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="">All Statuses</option>
            <option value="active">Approved / Listed</option>
            <option value="pending">Pending Onboarding</option>
            <option value="inactive">Unlisted</option>
            <option value="suspended">Blocked / Suspended</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Add Restaurant Button */}
          <Button
            onClick={() => {
              setFormData(DEFAULT_MINIMAL_FORM);
              setIsAddModalOpen(true);
            }}
            className="h-10 px-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl gap-2 shadow-md hover:shadow-brand-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard Restaurant</span>
          </Button>
        </div>
      </div>

      {/* ── Main Restaurants Table ── */}
      <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              {['Restaurant', 'City & Address', 'Type', 'Rating', 'Status', 'Admin Control'].map((h) => (
                <th key={h} className="text-left px-4 py-3.5 font-bold text-muted-foreground text-xs uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-4">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : restaurants.length > 0 ? (
              restaurants.map((r: any) => (
                <motion.tr key={r._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-muted/30 transition-colors">
                  {/* Restaurant Name & Image */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-xl bg-cover bg-center shrink-0 border border-border/80 shadow-xs"
                        style={{ backgroundImage: `url(${r.logo || r.coverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&q=80'})` }}
                      />
                      <div>
                        <p className="font-extrabold text-foreground">{r.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-muted-foreground/70" />
                          {r.phone || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* City & Address */}
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-foreground flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                      {r.address?.city || 'N/A'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-[160px]">{r.address?.street}</p>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-muted text-foreground">
                      <Tag className="w-3 h-3 text-brand-500" />
                      {r.cuisineTypes?.[0] || 'Restaurant'}
                    </span>
                  </td>

                  {/* Rating */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 font-bold text-foreground">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span>{r.averageRating?.toFixed(1) || '4.5'}</span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="px-4 py-3.5">
                    <Badge
                      variant={(STATUS_COLORS[r.status] as any) || 'secondary'}
                      className="capitalize font-bold text-xs px-2.5 py-0.5 rounded-lg"
                    >
                      {r.status === 'active' ? 'Approved' : r.status === 'suspended' ? 'Blocked' : r.status}
                    </Badge>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Approve / Listed */}
                      {r.status !== 'active' && (
                        <Button
                          size="sm"
                          className="h-8 px-2.5 text-xs bg-green-600 hover:bg-green-700 text-white gap-1 font-bold rounded-lg"
                          onClick={() => updateStatusMutation.mutate({ id: r._id, status: 'active' })}
                          isLoading={updateStatusMutation.isPending}
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Approve</span>
                        </Button>
                      )}

                      {/* Unlist */}
                      {r.status === 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2.5 text-xs font-bold gap-1 rounded-lg border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                          onClick={() => updateStatusMutation.mutate({ id: r._id, status: 'inactive' })}
                          isLoading={updateStatusMutation.isPending}
                        >
                          <EyeOff className="h-3.5 w-3.5" />
                          <span>Unlist</span>
                        </Button>
                      )}

                      {/* Block / Suspend */}
                      {r.status !== 'suspended' && r.status !== 'rejected' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2.5 text-xs font-bold gap-1 rounded-lg border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-500/10"
                          onClick={() => updateStatusMutation.mutate({ id: r._id, status: 'suspended' })}
                          isLoading={updateStatusMutation.isPending}
                        >
                          <Pause className="h-3.5 w-3.5" />
                          <span>Block</span>
                        </Button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center">
                  <div className="max-w-md mx-auto space-y-3">
                    <div className="w-12 h-12 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <p className="font-extrabold text-lg text-foreground">No Restaurants Onboarded</p>
                    <p className="text-xs text-muted-foreground">
                      No restaurants match your filter ({statusFilter || 'All'}). Click below to onboard a new restaurant with basic details.
                    </p>
                    <div className="flex justify-center gap-3 pt-2">
                      <Button
                        onClick={() => {
                          setFormData(DEFAULT_MINIMAL_FORM);
                          setIsAddModalOpen(true);
                        }}
                        className="bg-brand-500 hover:bg-brand-600 text-white font-bold gap-2 text-xs h-9 px-4 rounded-xl"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Onboard Restaurant</span>
                      </Button>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Minimal Onboarding Modal (Admin Only) ── */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card w-full max-w-xl rounded-2xl border p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h2 className="font-black text-xl flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-brand-500" />
                    Onboard New Restaurant (Basic Only)
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Minimal details for registration. Menus, tables, and staff will be managed by the restaurant.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Info Callout */}
              <div className="bg-brand-500/8 border border-brand-500/20 rounded-xl p-3 flex items-start gap-2.5 text-xs text-muted-foreground">
                <Info className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                <span>
                  Admin only sets up core details. Operating hours, menus, tables, and staff directory are configured in the <strong>Restaurant Dashboard</strong> after approval.
                </span>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createMutation.mutate(formData);
                }}
                className="space-y-4"
              >
                {/* Section 1: Basic Info */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-brand-500 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Basic Information
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-foreground">Restaurant Name *</label>
                      <input
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Ocean Pearl Bistro"
                        className="w-full mt-1 px-3 py-2 text-sm rounded-xl border bg-background font-medium focus:ring-2 focus:ring-brand-500/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-foreground">Owner / Manager Name *</label>
                      <input
                        required
                        value={formData.ownerName}
                        onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                        placeholder="e.g. Marcus Vance"
                        className="w-full mt-1 px-3 py-2 text-sm rounded-xl border bg-background font-medium focus:ring-2 focus:ring-brand-500/20 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-foreground">Phone Number *</label>
                      <input
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 212-555-0199"
                        className="w-full mt-1 px-3 py-2 text-sm rounded-xl border bg-background font-medium focus:ring-2 focus:ring-brand-500/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-foreground">Email Address *</label>
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="owner@restaurant.com"
                        className="w-full mt-1 px-3 py-2 text-sm rounded-xl border bg-background font-medium focus:ring-2 focus:ring-brand-500/20 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-foreground">City *</label>
                      <input
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="New York"
                        className="w-full mt-1 px-3 py-2 text-sm rounded-xl border bg-background font-medium focus:ring-2 focus:ring-brand-500/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-foreground">Full Address *</label>
                      <input
                        required
                        value={formData.street}
                        onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                        placeholder="45 Park Avenue, Suite 100"
                        className="w-full mt-1 px-3 py-2 text-sm rounded-xl border bg-background font-medium focus:ring-2 focus:ring-brand-500/20 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-foreground">GST Number (Optional)</label>
                      <input
                        value={formData.gstNumber}
                        onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                        placeholder="22AAAAA0000A1Z5"
                        className="w-full mt-1 px-3 py-2 text-sm rounded-xl border bg-background font-medium focus:ring-2 focus:ring-brand-500/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-foreground">Registration No. (Optional)</label>
                      <input
                        value={formData.regNumber}
                        onChange={(e) => setFormData({ ...formData, regNumber: e.target.value })}
                        placeholder="REG-884920"
                        className="w-full mt-1 px-3 py-2 text-sm rounded-xl border bg-background font-medium focus:ring-2 focus:ring-brand-500/20 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Location */}
                <div className="space-y-3 pt-2 border-t">
                  <h3 className="text-xs font-bold text-brand-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5" /> Location Coordinates
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-foreground">Latitude</label>
                      <input
                        value={formData.latitude}
                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                        className="w-full mt-1 px-3 py-2 text-sm rounded-xl border bg-background font-medium focus:ring-2 focus:ring-brand-500/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-foreground">Longitude</label>
                      <input
                        value={formData.longitude}
                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                        className="w-full mt-1 px-3 py-2 text-sm rounded-xl border bg-background font-medium focus:ring-2 focus:ring-brand-500/20 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Restaurant Type & Status */}
                <div className="space-y-3 pt-2 border-t">
                  <h3 className="text-xs font-bold text-brand-500 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Type & Status
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-foreground">Restaurant Type *</label>
                      <select
                        value={formData.restaurantType}
                        onChange={(e) => setFormData({ ...formData, restaurantType: e.target.value })}
                        className="w-full mt-1 px-3 py-2 text-sm rounded-xl border bg-background font-bold focus:ring-2 focus:ring-brand-500/20 outline-none"
                      >
                        {RESTAURANT_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-foreground">Initial Status *</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full mt-1 px-3 py-2 text-sm rounded-xl border bg-background font-bold focus:ring-2 focus:ring-brand-500/20 outline-none"
                      >
                        <option value="active">Approved (Listed)</option>
                        <option value="pending">Pending Review</option>
                        <option value="rejected">Rejected</option>
                        <option value="suspended">Blocked</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 4: Branding */}
                <div className="space-y-3 pt-2 border-t">
                  <h3 className="text-xs font-bold text-brand-500 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Branding (Optional)
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-foreground">Logo URL</label>
                      <input
                        value={formData.logo}
                        onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                        placeholder="https://..."
                        className="w-full mt-1 px-3 py-2 text-sm rounded-xl border bg-background font-medium focus:ring-2 focus:ring-brand-500/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-foreground">Cover Image URL</label>
                      <input
                        value={formData.coverImage}
                        onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                        placeholder="https://..."
                        className="w-full mt-1 px-3 py-2 text-sm rounded-xl border bg-background font-medium focus:ring-2 focus:ring-brand-500/20 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 5: Temporary Password */}
                <div className="space-y-3 pt-2 border-t">
                  <h3 className="text-xs font-bold text-brand-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" /> Owner Credentials
                  </h3>
                  <div>
                    <label className="text-xs font-bold text-foreground">Temporary Owner Password *</label>
                    <input
                      required
                      value={formData.tempPassword}
                      onChange={(e) => setFormData({ ...formData, tempPassword: e.target.value })}
                      className="w-full mt-1 px-3 py-2 text-sm rounded-xl border bg-background font-mono font-bold focus:ring-2 focus:ring-brand-500/20 outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddModalOpen(false)}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={createMutation.isPending}
                    className="bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl px-5"
                  >
                    Onboard Restaurant
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
