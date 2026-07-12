'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export interface Booking {
  _id: string;
  bookingNumber: string;
  userId: string;
  restaurantId: string;
  restaurantName: string;
  type: 'table' | 'food' | 'both';
  status: string;
  tableNumber?: string;
  guestCount: number;
  reservationDate: string;
  reservationTime: string;
  preOrderItems: Array<{
    foodItemId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  paymentStatus: string;
  specialRequests?: string;
  createdAt: string;
}

export interface CreateBookingData {
  restaurantId: string;
  type: 'table' | 'food' | 'both';
  tableId?: string;
  guestCount: number;
  reservationDate: string;
  reservationTime: string;
  preOrderItems?: Array<{
    foodItemId: string;
    name: string;
    quantity: number;
    price: number;
    variantId?: string;
    addOns?: Array<{ id: string; name: string; price: number }>;
    specialInstructions?: string;
  }>;
  specialRequests?: string;
}

export function useMyBookings(page = 1) {
  return useQuery({
    queryKey: ['bookings', 'mine', page],
    queryFn: async () => {
      const { data } = await api.get('/bookings/my', { params: { page } });
      return data;
    },
    staleTime: 60 * 1000,
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: async () => {
      const { data } = await api.get(`/bookings/${id}`);
      return data.data as Booking;
    },
    enabled: !!id,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: CreateBookingData) => {
      const res = await api.post('/bookings', data);
      return res.data.data as Booking;
    },
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: ['bookings', 'mine'] });
      toast.success('Booking created successfully!');
      router.push(`/bookings/${booking._id}/payment`);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const res = await api.patch(`/bookings/${id}/cancel`, { reason });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking cancelled');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useRestaurantBookings(restaurantId: string, date?: string, status?: string, page = 1) {
  return useQuery({
    queryKey: ['bookings', 'restaurant', restaurantId, date, status, page],
    queryFn: async () => {
      const { data } = await api.get(`/bookings/restaurant/${restaurantId}`, {
        params: { date, status, page },
      });
      return data;
    },
    enabled: !!restaurantId,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000, // refresh every minute
  });
}
