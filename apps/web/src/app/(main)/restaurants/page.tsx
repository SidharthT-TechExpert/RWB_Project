'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { RestaurantCard } from '@/components/restaurants/RestaurantCard';
import { RestaurantFilters } from '@/components/restaurants/RestaurantFilters';
import { RestaurantCardSkeleton } from '@/components/ui/Skeleton';
import { useRestaurants } from '@/hooks/useRestaurants';

export default function RestaurantsPage() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({
    query: searchParams.get('q') || '',
    cuisineTypes: searchParams.get('cuisineTypes') ? [searchParams.get('cuisineTypes')!] : [],
    priceRange: [] as number[],
    rating: undefined as number | undefined,
    sortBy: '',
  });
  const [page, setPage] = useState(1);

  const { data, isLoading } = useRestaurants({
    city: filters.query || undefined,
    cuisineTypes: filters.cuisineTypes.join(',') || undefined,
    priceRange: filters.priceRange.join(',') || undefined,
    rating: filters.rating,
    sortBy: filters.sortBy || undefined,
    page,
    limit: 12,
  });

  const restaurants = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Restaurants</h1>
        <p className="text-muted-foreground flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {meta?.total ? `${meta.total} restaurants found` : 'Discovering restaurants near you...'}
        </p>
      </div>

      <div className="space-y-8">
        <RestaurantFilters filters={filters} onChange={(f) => { setFilters({ ...filters, ...f }); setPage(1); }} />

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <RestaurantCardSkeleton key={i} />)}
          </div>
        ) : restaurants.length > 0 ? (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(restaurants as import('@/hooks/useRestaurants').Restaurant[]).map((r) => <RestaurantCard key={r._id} restaurant={r} />)}
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!meta.hasPrev}
                  className="px-4 py-2 rounded-xl border text-sm font-medium disabled:opacity-40 hover:bg-muted transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-muted-foreground">
                  Page {meta.page} of {meta.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!meta.hasNext}
                  className="px-4 py-2 rounded-xl border text-sm font-medium disabled:opacity-40 hover:bg-muted transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-5xl mb-4">🍽️</p>
            <p className="text-xl font-semibold mb-2">No restaurants found</p>
            <p className="text-sm">Try adjusting your filters or search in a different area.</p>
          </div>
        )}
      </div>
    </div>
  );
}
