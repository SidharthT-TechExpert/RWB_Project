'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';

export interface OrderItem {
  foodItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variantName?: string;
  addOns: { id: string; name: string; price: number }[];
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  restaurantId: string;
  restaurantName: string;
  bookingId?: string;
  items: OrderItem[];
  status: string;
  subtotal: number;
  tax: number;
  serviceCharge: number;
  discount: number;
  total: number;
  paymentStatus: string;
  estimatedCompletionTime?: string;
  createdAt: string;
}

export function useMyOrders(page = 1) {
  return useQuery({
    queryKey: ['orders', 'mine', page],
    queryFn: async () => {
      const { data } = await api.get('/orders/my', { params: { page } });
      return data;
    },
    staleTime: 30 * 1000,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data } = await api.get(`/orders/${id}`);
      return data.data as Order;
    },
    enabled: !!id,
    refetchInterval: (data) =>
      data && ['pending', 'confirmed', 'preparing', 'ready'].includes(data.status) ? 30000 : false,
  });
}

export function useReorder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => {
      const { data } = await api.post(`/orders/${orderId}/reorder`);
      return data.data as Order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', 'mine'] });
      toast.success('Reorder placed!');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { data } = await api.patch(`/orders/${id}/cancel`, { reason });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order cancelled');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
