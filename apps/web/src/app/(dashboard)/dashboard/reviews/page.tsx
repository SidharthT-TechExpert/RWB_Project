'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { formatDate, cn } from '@/lib/utils';
import { useMyRestaurants } from '@/hooks/useRestaurants';
import toast from 'react-hot-toast';

export default function DashboardReviewsPage() {
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [replyOpen, setReplyOpen] = useState<string | null>(null);
  const { data: restaurants } = useMyRestaurants();
  const restaurantId = restaurants?.data?.[0]?._id;
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'reviews', restaurantId],
    queryFn: async () => {
      const { data } = await api.get(`/reviews/restaurant/${restaurantId}`);
      return data;
    },
    enabled: !!restaurantId,
  });

  const replyMutation = useMutation({
    mutationFn: async ({ id, text }: { id: string; text: string }) => api.post(`/reviews/${id}/reply`, { text }),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['dashboard', 'reviews'] });
      setReplyOpen(null);
      setReplyText((prev) => ({ ...prev, [id]: '' }));
      toast.success('Reply posted');
    },
    onError: () => toast.error('Failed to post reply'),
  });

  const reviews = data?.data || [];
  const avgRating = reviews.length > 0 ? (reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / reviews.length).toFixed(1) : '—';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reviews</h1>
        <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 px-4 py-2 rounded-xl">
          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          <span className="font-bold text-lg">{avgRating}</span>
          <span className="text-sm text-muted-foreground">({reviews.length} reviews)</span>
        </div>
      </div>

      {/* Rating distribution */}
      {data?.ratingDistribution?.length > 0 && (
        <div className="rounded-2xl border bg-card p-5">
          <h2 className="font-semibold mb-4">Rating Breakdown</h2>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = data.ratingDistribution.find((r: { _id: number }) => r._id === rating)?.count || 0;
              const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-xs w-4 text-muted-foreground">{rating}</span>
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 shrink-0" />
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reviews list */}
      <div className="space-y-4">
        {isLoading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 bg-muted rounded-2xl animate-pulse" />) :
          reviews.length > 0 ? reviews.map((review: {
            _id: string;
            userName: string;
            rating: number;
            comment: string;
            createdAt: string;
            reply?: { text: string };
            helpfulVotes: number;
          }) => (
            <div key={review._id} className="rounded-2xl border bg-card p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full brand-gradient flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {review.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{review.userName}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
                  </div>
                </div>
                <div className="flex shrink-0">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn('h-4 w-4', i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted')} />
                  ))}
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>

              {review.reply ? (
                <div className="ml-4 p-3 rounded-xl bg-brand-50 dark:bg-brand-950/50 border-l-2 border-brand-400">
                  <p className="text-xs font-semibold text-brand-600 mb-1">Your reply</p>
                  <p className="text-sm">{review.reply.text}</p>
                </div>
              ) : (
                <div>
                  {replyOpen === review._id ? (
                    <div className="space-y-2">
                      <textarea
                        value={replyText[review._id] || ''}
                        onChange={(e) => setReplyText((prev) => ({ ...prev, [review._id]: e.target.value }))}
                        placeholder="Write a thoughtful reply..."
                        className="w-full h-20 px-3 py-2 text-sm rounded-xl border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => replyMutation.mutate({ id: review._id, text: replyText[review._id] })} isLoading={replyMutation.isPending} disabled={!replyText[review._id]?.trim()}>Post Reply</Button>
                        <Button size="sm" variant="ghost" onClick={() => setReplyOpen(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <Button size="sm" variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground" onClick={() => setReplyOpen(review._id)}>
                      <MessageSquare className="h-3.5 w-3.5" /> Reply
                    </Button>
                  )}
                </div>
              )}
            </div>
          )) : (
            <div className="text-center py-16 text-muted-foreground">
              <Star className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="font-semibold">No reviews yet</p>
              <p className="text-sm mt-1">Reviews will appear here once customers start rating your restaurant</p>
            </div>
          )}
      </div>
    </div>
  );
}
