'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, X, TrendingUp, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { RestaurantCard } from '@/components/restaurants/RestaurantCard';
import { RestaurantCardSkeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/store/authStore';
import { debounce } from '@/lib/utils';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const fn = debounce((q: string) => setDebouncedQuery(q), 400);
    fn(query);
  }, [query]);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: async () => {
      const { data } = await api.get('/search', { params: { q: debouncedQuery } });
      return data.data;
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 30 * 1000,
  });

  const { data: suggestions } = useQuery({
    queryKey: ['suggestions', debouncedQuery],
    queryFn: async () => {
      const { data } = await api.get('/search/suggestions', { params: { q: debouncedQuery } });
      return data.data as string[];
    },
    enabled: debouncedQuery.length >= 2,
  });

  const { data: popular } = useQuery({
    queryKey: ['search', 'popular'],
    queryFn: async () => {
      const { data } = await api.get('/search/popular');
      return data.data as string[];
    },
    staleTime: 10 * 60 * 1000,
  });

  const { data: recent } = useQuery({
    queryKey: ['search', 'recent'],
    queryFn: async () => {
      const { data } = await api.get('/search/recent');
      return data.data as string[];
    },
    enabled: isAuthenticated,
  });

  const handleSearch = (q: string) => {
    setQuery(q);
    router.replace(`/search?q=${encodeURIComponent(q)}`, { scroll: false });
  };

  const restaurants = searchResults?.restaurants || [];
  const foodItems = searchResults?.foodItems || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Search input */}
      <div className="relative mb-8">
        <div className="flex items-center gap-3 h-14 px-5 rounded-2xl border-2 border-brand-200 dark:border-brand-800 bg-card shadow-lg shadow-brand-500/10 focus-within:border-brand-500 transition-colors">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search restaurants, dishes, cuisines..."
            className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button onClick={() => handleSearch('')} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Suggestions dropdown */}
        {suggestions && suggestions.length > 0 && query.length >= 2 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-2xl shadow-lg z-20 overflow-hidden">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => handleSearch(s)}
                className="w-full text-left px-5 py-3 text-sm hover:bg-muted flex items-center gap-3 transition-colors"
              >
                <Search className="h-4 w-4 text-muted-foreground" />
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* No query state */}
      {!debouncedQuery && (
        <div className="space-y-8">
          {recent && recent.length > 0 && (
            <div>
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" /> Recent Searches
              </h2>
              <div className="flex flex-wrap gap-2">
                {recent.map((q) => (
                  <button key={q} onClick={() => handleSearch(q)}
                    className="px-4 py-2 rounded-full border text-sm hover:border-brand-500 hover:bg-brand-50 transition-colors">{q}</button>
                ))}
              </div>
            </div>
          )}
          {popular && popular.length > 0 && (
            <div>
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" /> Popular Searches
              </h2>
              <div className="flex flex-wrap gap-2">
                {popular.map((q) => (
                  <button key={q} onClick={() => handleSearch(q)}
                    className="px-4 py-2 rounded-full border text-sm hover:border-brand-500 hover:bg-brand-50 transition-colors">{q}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {debouncedQuery.length >= 2 && (
        <div className="space-y-8">
          {/* Restaurants */}
          <section>
            <h2 className="font-semibold text-lg mb-4">
              Restaurants {restaurants.length > 0 && <span className="text-muted-foreground font-normal text-sm">({restaurants.length})</span>}
            </h2>
            {isLoading ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => <RestaurantCardSkeleton key={i} />)}
              </div>
            ) : restaurants.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {restaurants.map((r: Parameters<typeof RestaurantCard>[0]['restaurant']) => <RestaurantCard key={r._id} restaurant={r} />)}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No restaurants found for "{debouncedQuery}"</p>
            )}
          </section>

          {/* Food items */}
          {foodItems.length > 0 && (
            <section>
              <h2 className="font-semibold text-lg mb-4">
                Dishes <span className="text-muted-foreground font-normal text-sm">({foodItems.length})</span>
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {foodItems.slice(0, 6).map((item: { _id: string; name: string; basePrice: number; description: string; restaurantId: string }) => (
                  <div key={item._id} className="flex items-center gap-3 p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl">🍱</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                    </div>
                    <span className="text-sm font-semibold text-brand-500 shrink-0">₹{item.basePrice}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
