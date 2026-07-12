'use client';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';

export interface Restaurant {
  _id: string;
  name: string;
  slug: string;
  description: string;
  cuisineTypes: string[];
  priceRange: number;
  address: { street: string; city: string; state: string; country: string; zipCode: string };
  location: { type: string; coordinates: [number, number] };
  phone: string;
  coverImage?: string;
  logo?: string;
  gallery: string[];
  openingHours: Array<{ day: string; isOpen: boolean; openTime: string; closeTime: string }>;
  tables: Array<{ tableNumber: string; capacity: number; isAvailable: boolean; type: string }>;
  averageRating: number;
  totalReviews: number;
  features: string[];
  isVerified: boolean;
  isFeatured: boolean;
  preparationTime: number;
  taxPercentage: number;
  serviceChargePercentage: number;
  acceptsPreOrders: boolean;
  acceptsTableBooking: boolean;
  status: string;
}

interface RestaurantFilters {
  city?: string;
  cuisineTypes?: string;
  priceRange?: string;
  rating?: number;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export function useRestaurants(filters: RestaurantFilters = {}) {
  return useQuery({
    queryKey: ['restaurants', filters],
    queryFn: async () => {
      const { data } = await api.get('/restaurants', { params: filters });
      return data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useRestaurant(idOrSlug: string) {
  return useQuery({
    queryKey: ['restaurant', idOrSlug],
    queryFn: async () => {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
      const url = isObjectId ? `/restaurants/${idOrSlug}` : `/restaurants/slug/${idOrSlug}`;
      const { data } = await api.get(url);
      return data.data as Restaurant;
    },
    enabled: !!idOrSlug,
    staleTime: 3 * 60 * 1000,
  });
}

export function useFeaturedRestaurants() {
  return useQuery({
    queryKey: ['restaurants', 'featured'],
    queryFn: async () => {
      const { data } = await api.get('/restaurants/featured');
      return data.data as Restaurant[];
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useNearbyRestaurants(lat?: number, lng?: number, radius = 10) {
  return useQuery({
    queryKey: ['restaurants', 'nearby', lat, lng, radius],
    queryFn: async () => {
      const { data } = await api.get('/restaurants/nearby', { params: { lat, lng, radius } });
      return data.data as Restaurant[];
    },
    enabled: !!lat && !!lng,
    staleTime: 2 * 60 * 1000,
  });
}

export function useRestaurantMenu(restaurantId: string) {
  return useQuery({
    queryKey: ['restaurant', restaurantId, 'menu'],
    queryFn: async () => {
      const { data } = await api.get(`/food/${restaurantId}/menu`);
      return data.data;
    },
    enabled: !!restaurantId,
    staleTime: 3 * 60 * 1000,
  });
}

export function useRestaurantReviews(restaurantId: string, page = 1) {
  return useQuery({
    queryKey: ['restaurant', restaurantId, 'reviews', page],
    queryFn: async () => {
      const { data } = await api.get(`/reviews/restaurant/${restaurantId}`, { params: { page } });
      return data;
    },
    enabled: !!restaurantId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useMyRestaurants() {
  return useQuery({
    queryKey: ['restaurants', 'mine'],
    queryFn: async () => {
      const { data } = await api.get('/restaurants/owner/my-restaurants');
      return data;
    },
    staleTime: 60 * 1000,
  });
}

export function useCreateRestaurant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Restaurant>) => {
      const res = await api.post('/restaurants', data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants', 'mine'] });
      toast.success('Restaurant created! Pending approval.');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
