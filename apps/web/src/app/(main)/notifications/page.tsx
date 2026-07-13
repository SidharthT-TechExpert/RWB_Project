'use client';
export const dynamic = 'force-dynamic';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { getRelativeTime, cn } from '@/lib/utils';

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => { const { data } = await api.get('/notifications'); return data; },
    refetchInterval: 30 * 1000,
  });

  const markAllMutation = useMutation({
    mutationFn: async () => { await api.patch('/notifications/mark-all-read'); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markOneMutation = useMutation({
    mutationFn: async (id: string) => { await api.patch(`/notifications/${id}/read`); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = data?.data || [];
  const unreadCount = notifications.filter((n: { isRead: boolean }) => !n.isRead).length;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && <p className="text-sm text-muted-foreground mt-1">{unreadCount} unread</p>}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => markAllMutation.mutate()} isLoading={markAllMutation.isPending}>
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {isLoading ? Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
        )) : notifications.length > 0 ? notifications.map((n: {
          _id: string;
          title: string;
          body: string;
          type: string;
          isRead: boolean;
          createdAt: string;
        }) => (
          <motion.div
            key={n._id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => !n.isRead && markOneMutation.mutate(n._id)}
            className={cn(
              'flex gap-4 p-4 rounded-xl border cursor-pointer hover:bg-muted/50 transition-colors',
              !n.isRead && 'bg-brand-50/50 dark:bg-brand-950/30 border-brand-200 dark:border-brand-800'
            )}
          >
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg',
              !n.isRead ? 'bg-brand-100 dark:bg-brand-900' : 'bg-muted'
            )}>
              {n.type === 'booking_confirmed' ? '📅' :
               n.type === 'order_ready' ? '✅' :
               n.type === 'payment_success' ? '💳' :
               n.type === 'promotion' ? '🎉' : '🔔'}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn('text-sm font-medium', !n.isRead && 'text-brand-700 dark:text-brand-300')}>{n.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
              <p className="text-xs text-muted-foreground mt-1">{getRelativeTime(n.createdAt)}</p>
            </div>
            {!n.isRead && <div className="w-2 h-2 rounded-full bg-brand-500 mt-2 shrink-0" />}
          </motion.div>
        )) : (
          <div className="text-center py-20 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="font-semibold">No notifications yet</p>
            <p className="text-sm mt-1">We'll notify you about bookings and orders</p>
          </div>
        )}
      </div>
    </div>
  );
}
