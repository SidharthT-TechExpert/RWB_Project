'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export function useNotifications(page = 1) {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['notifications', page],
    queryFn: async () => {
      const { data } = await api.get('/notifications', { params: { page } });
      return data;
    },
    enabled: isAuthenticated,
    refetchInterval: 30 * 1000,
    staleTime: 15 * 1000,
  });
}

export function useUnreadCount() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const { data } = await api.get('/notifications/unread-count');
      return data.data.count as number;
    },
    enabled: isAuthenticated,
    refetchInterval: 30 * 1000,
    staleTime: 15 * 1000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { await api.patch(`/notifications/${id}/read`); },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => { await api.patch('/notifications/mark-all-read'); },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useRegisterDeviceToken() {
  return useMutation({
    mutationFn: async ({ token, platform }: { token: string; platform: string }) => {
      await api.post('/notifications/device-token', { token, platform });
    },
  });
}
