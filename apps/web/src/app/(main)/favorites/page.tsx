'use client';
export const dynamic = 'force-dynamic';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { RestaurantCard } from '@/components/restaurants/RestaurantCard';
import { RestaurantCardSkeleton } from '@/components/ui/Skeleton';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function FavoritesPage() {
  const { isAuthenticated } = useAuthStore();

  const { data: favoriteIds } = useQuery({
    queryKey: ['user', 'favorites'],
    queryFn: async () => {
      const { data } = await api.get('/users/favorites');
      return data.data as string[];
    },
    enabled: isAuthenticated,
  });

  const { data: restaurants, isLoading } = useQuery({
    queryKey: ['restaurants', 'favorites', favoriteIds],
    queryFn: async () => {
      if (!favoriteIds?.length) return [];
      const results = await Promise.allSettled(
        favoriteIds.map((id) => api.get(`/restaurants/${id}`))
      );
      return results
        .filter((r) => r.status === 'fulfilled')
        .map((r) => (r as PromiseFulfilledResult<{ data: { data: unknown } }>).value.data.data);
    },
    enabled: !!favoriteIds?.length,
  });

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-muted-foreground">
        <Heart className="h-16 w-16 mx-auto mb-4 opacity-30" />
        <p className="text-xl font-semibold mb-2">Sign in to see your favourites</p>
        <Link href="/auth/login"><Button className="mt-4">Sign In</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
        <Heart className="h-6 w-6 text-red-500 fill-red-500" /> Favourites
      </h1>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <RestaurantCardSkeleton key={i} />)}
        </div>
      ) : restaurants && restaurants.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((r) => (
            <RestaurantCard key={(r as { _id: string })._id} restaurant={r as Parameters<typeof RestaurantCard>[0]['restaurant']} isFavorite />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <Heart className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="text-xl font-semibold mb-2">No favourites yet</p>
          <p className="text-sm mb-6">Tap the heart icon on any restaurant to save it here.</p>
          <Link href="/restaurants"><Button>Explore Restaurants</Button></Link>
        </div>
      )}
    </div>
  );
}
