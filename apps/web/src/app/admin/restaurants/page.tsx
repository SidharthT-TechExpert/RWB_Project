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
  Eye,
  Trash2,
  Edit,
  Utensils,
  MapPin,
  Star,
  Sparkles,
  Phone,
  Building2,
  DollarSign,
  AlertCircle,
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

const SAMPLE_RESTAURANTS = [
  {
    name: 'The Golden Saffron',
    description: 'Authentic Indian fine dining with signature tandoori & aromatic curries.',
    cuisineTypes: ['Indian', 'North Indian', 'Mughlai'],
    priceRange: 3,
    address: { street: '45 Park Avenue', city: 'New York', state: 'NY', country: 'USA', zipCode: '10016' },
    phone: '+1 212-555-0199',
    coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    averageRating: 4.8,
    status: 'active',
  },
  {
    name: 'Sakura Sushi Bar',
    description: 'Fresh omakase, handmade ramen, and premium Japanese sakes.',
    cuisineTypes: ['Japanese', 'Sushi', 'Asian'],
    priceRange: 3,
    address: { street: '128 Mercer St', city: 'New York', state: 'NY', country: 'USA', zipCode: '10012' },
    phone: '+1 212-555-0144',
    coverImage: 'https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=800&q=80',
    averageRating: 4.9,
    status: 'active',
  },
  {
    name: 'Bella Italia Bistro',
    description: 'Wood-fired Neapolitan pizzas, handmade pastas, and classic tiramisu.',
    cuisineTypes: ['Italian', 'Pizza', 'Pasta'],
    priceRange: 2,
    address: { street: '88 Mulberry St', city: 'New York', state: 'NY', country: 'USA', zipCode: '10013' },
    phone: '+1 212-555-0182',
    coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
    averageRating: 4.7,
    status: 'active',
  },
  {
    name: 'El Mariachi Taqueria',
    description: 'Street-style tacos, fresh guacamole, and handcrafted margaritas.',
    cuisineTypes: ['Mexican', 'Tacos', 'Latin'],
    priceRange: 2,
    address: { street: '210 5th Ave', city: 'New York', state: 'NY', country: 'USA', zipCode: '10010' },
    phone: '+1 212-555-0112',
    coverImage: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80',
    averageRating: 4.6,
    status: 'active',
  },
];

interface RestaurantForm {
  name: string;
  description: string;
  cuisineTypes: string;
  priceRange: number;
  city: string;
  street: string;
  phone: string;
  coverImage: string;
  status: string;
}

const DEFAULT_FORM: RestaurantForm = {
  name: '',
  description: '',
  cuisineTypes: 'Indian, Fine Dining',
  priceRange: 2,
  city: 'New York',
  street: '123 Main Street',
  phone: '+1 212-555-0100',
  coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
  status: 'active',
};

export default function AdminRestaurantsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<any | null>(null);
  const [formData, setFormData] = useState<RestaurantForm>(DEFAULT_FORM);

  const qc = useQueryClient();

  // Fetch restaurants
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'restaurants', statusFilter, search],
    queryFn: async () => {
      const { data } = await api.get('/restaurants', {
        params: { status: statusFilter || undefined, city: search || undefined, limit: 100 },
      });
      return data;
    },
  });

  // Actions
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      if (status === 'active') return api.patch(`/admin/restaurants/${id}/approve`);
      if (status === 'suspended') return api.patch(`/admin/restaurants/${id}/suspend`);
      if (status === 'rejected') return api.patch(`/admin/restaurants/${id}/reject`, { reason: 'Admin update' });
      return api.put(`/restaurants/${id}`, { status });
    },
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: ['admin', 'restaurants'] });
      toast.success(`Restaurant status updated to ${status}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update status');
    },
  });

  // Create Restaurant Mutation
  const createMutation = useMutation({
    mutationFn: async (payload: RestaurantForm) => {
      const formatted = {
        name: payload.name,
        slug: payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4),
        description: payload.description || 'Welcome to ' + payload.name,
        cuisineTypes: payload.cuisineTypes.split(',').map((c) => c.trim()).filter(Boolean),
        priceRange: Number(payload.priceRange),
        address: {
          street: payload.street,
          city: payload.city,
          state: 'NY',
          country: 'USA',
          zipCode: '10001',
        },
        location: { type: 'Point', coordinates: [-73.9857, 40.7484] },
        phone: payload.phone,
        coverImage: payload.coverImage,
        status: payload.status,
        openingHours: [
          { day: 'monday', isOpen: true, openTime: '11:00', closeTime: '23:00' },
          { day: 'tuesday', isOpen: true, openTime: '11:00', closeTime: '23:00' },
          { day: 'wednesday', isOpen: true, openTime: '11:00', closeTime: '23:00' },
          { day: 'thursday', isOpen: true, openTime: '11:00', closeTime: '23:00' },
          { day: 'friday', isOpen: true, openTime: '11:00', closeTime: '23:00' },
          { day: 'saturday', isOpen: true, openTime: '11:00', closeTime: '23:00' },
          { day: 'sunday', isOpen: true, openTime: '11:00', closeTime: '23:00' },
        ],
        tables: [
          { tableNumber: 'T1', capacity: 2, isAvailable: true, type: 'indoor' },
          { tableNumber: 'T2', capacity: 4, isAvailable: true, type: 'indoor' },
          { tableNumber: 'T3', capacity: 6, isAvailable: true, type: 'outdoor' },
        ],
        totalCapacity: 12,
        acceptsPreOrders: true,
        acceptsTableBooking: true,
      };

      return api.post('/restaurants', formatted);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'restaurants'] });
      toast.success('🎉 Restaurant added successfully!');
      setIsAddModalOpen(false);
      setFormData(DEFAULT_FORM);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create restaurant');
    },
  });

  // Seed sample restaurants
  const seedMutation = useMutation({
    mutationFn: async () => {
      for (const item of SAMPLE_RESTAURANTS) {
        try {
          await createMutation.mutateAsync({
            name: item.name,
            description: item.description,
            cuisineTypes: item.cuisineTypes.join(', '),
            priceRange: item.priceRange,
            city: item.address.city,
            street: item.address.street,
            phone: item.phone,
            coverImage: item.coverImage,
            status: item.status,
          });
        } catch {
          // ignore duplicate slug errors during batch seed
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'restaurants'] });
      toast.success('Sample restaurants seeded successfully!');
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
            Restaurant Management
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage listings, status approvals, unlist restaurants, and add new locations.
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
            <option value="active">Active (Public)</option>
            <option value="pending">Pending Approval</option>
            <option value="inactive">Inactive / Unlisted</option>
            <option value="suspended">Suspended</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Add Restaurant Button */}
          <Button
            onClick={() => {
              setFormData(DEFAULT_FORM);
              setIsAddModalOpen(true);
            }}
            className="h-10 px-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl gap-2 shadow-md hover:shadow-brand-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Restaurant</span>
          </Button>
        </div>
      </div>

      {/* ── Main Restaurants Table ── */}
      <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              {['Restaurant', 'City & Address', 'Cuisine & Price', 'Rating', 'Status', 'Admin Actions'].map((h) => (
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
                        style={{ backgroundImage: `url(${r.coverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&q=80'})` }}
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

                  {/* Cuisine & Price */}
                  <td className="px-4 py-3.5">
                    <p className="text-xs font-semibold text-foreground">{r.cuisineTypes?.join(', ') || 'General'}</p>
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {'$'.repeat(r.priceRange || 2)}
                    </p>
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
                      {r.status}
                    </Badge>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Approve / Activate */}
                      {r.status !== 'active' && (
                        <Button
                          size="sm"
                          className="h-8 px-2.5 text-xs bg-green-600 hover:bg-green-700 text-white gap-1 font-bold rounded-lg"
                          onClick={() => updateStatusMutation.mutate({ id: r._id, status: 'active' })}
                          isLoading={updateStatusMutation.isPending}
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Approve / Listed</span>
                        </Button>
                      )}

                      {/* Unlist / Inactive */}
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

                      {/* Suspend */}
                      {r.status !== 'suspended' && r.status !== 'rejected' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2.5 text-xs font-bold gap-1 rounded-lg border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-500/10"
                          onClick={() => updateStatusMutation.mutate({ id: r._id, status: 'suspended' })}
                          isLoading={updateStatusMutation.isPending}
                        >
                          <Pause className="h-3.5 w-3.5" />
                          <span>Suspend</span>
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
                    <p className="font-extrabold text-lg text-foreground">No Restaurants Found</p>
                    <p className="text-xs text-muted-foreground">
                      No restaurants match your current status filter ({statusFilter || 'All'}). Click below to seed sample restaurants or add a new one.
                    </p>
                    <div className="flex justify-center gap-3 pt-2">
                      <Button
                        onClick={() => seedMutation.mutate()}
                        isLoading={seedMutation.isPending}
                        className="bg-brand-500 hover:bg-brand-600 text-white font-bold gap-2 text-xs h-9 px-4 rounded-xl"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Seed Sample Restaurants</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setStatusFilter('');
                          setSearch('');
                        }}
                        className="text-xs h-9 px-4 rounded-xl"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Add Restaurant Modal ── */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card w-full max-w-lg rounded-2xl border p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <h2 className="font-black text-xl flex items-center gap-2">
                  <Plus className="w-5 h-5 text-brand-500" />
                  Add New Restaurant
                </h2>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createMutation.mutate(formData);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs font-bold text-foreground">Restaurant Name *</label>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Royal Taj Bistro"
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border bg-background font-medium focus:ring-2 focus:ring-brand-500/20 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground">Cuisine Types (comma separated) *</label>
                  <input
                    required
                    value={formData.cuisineTypes}
                    onChange={(e) => setFormData({ ...formData, cuisineTypes: e.target.value })}
                    placeholder="e.g. Indian, Tandoori, Mughlai"
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border bg-background font-medium focus:ring-2 focus:ring-brand-500/20 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-foreground">City *</label>
                    <input
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full mt-1 px-3 py-2 text-sm rounded-xl border bg-background font-medium focus:ring-2 focus:ring-brand-500/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground">Phone *</label>
                    <input
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full mt-1 px-3 py-2 text-sm rounded-xl border bg-background font-medium focus:ring-2 focus:ring-brand-500/20 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground">Street Address *</label>
                  <input
                    required
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
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

                <div>
                  <label className="text-xs font-bold text-foreground">Description</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Short description of dining experience..."
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border bg-background font-medium focus:ring-2 focus:ring-brand-500/20 outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
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
                    Create Restaurant
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
