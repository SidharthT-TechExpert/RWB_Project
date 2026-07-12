'use client';
import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface Filters {
  query?: string;
  cuisineTypes?: string[];
  priceRange?: number[];
  rating?: number;
  sortBy?: string;
  features?: string[];
}

interface RestaurantFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const CUISINES = ['Indian', 'Chinese', 'Italian', 'Mexican', 'Japanese', 'Thai', 'American', 'Mediterranean', 'French', 'Korean'];
const PRICE_RANGES = [{ value: 1, label: '₹' }, { value: 2, label: '₹₹' }, { value: 3, label: '₹₹₹' }, { value: 4, label: '₹₹₹₹' }];
const SORT_OPTIONS = [
  { value: '', label: 'Recommended' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest' },
];
const FEATURES = ['WiFi', 'Parking', 'Outdoor Seating', 'Private Dining', 'Bar', 'Live Music', 'Valet'];

export function RestaurantFilters({ filters, onChange }: RestaurantFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const toggleCuisine = (c: string) => {
    const current = filters.cuisineTypes || [];
    onChange({
      ...filters,
      cuisineTypes: current.includes(c) ? current.filter((x) => x !== c) : [...current, c],
    });
  };

  const togglePrice = (p: number) => {
    const current = filters.priceRange || [];
    onChange({
      ...filters,
      priceRange: current.includes(p) ? current.filter((x) => x !== p) : [...current, p],
    });
  };

  const clearAll = () => onChange({ query: filters.query });

  const activeCount = [
    (filters.cuisineTypes?.length || 0),
    (filters.priceRange?.length || 0),
    filters.rating ? 1 : 0,
    filters.features?.length || 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4">
      {/* Search + filter toggle */}
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search restaurants, cuisines..."
            leftIcon={<Search className="h-4 w-4" />}
            value={filters.query || ''}
            onChange={(e) => onChange({ ...filters, query: e.target.value })}
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="relative gap-2 shrink-0"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </Button>
      </div>

      {/* Sort chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange({ ...filters, sortBy: opt.value })}
            className={cn(
              'shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all',
              filters.sortBy === opt.value
                ? 'bg-brand-500 text-white border-brand-500'
                : 'border-border hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="rounded-2xl border p-5 space-y-5 bg-card animate-slide-down">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Filters</h3>
            {activeCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAll} className="gap-1 text-muted-foreground h-8">
                <X className="h-3.5 w-3.5" /> Clear all
              </Button>
            )}
          </div>

          {/* Cuisine */}
          <div>
            <p className="text-sm font-medium mb-3">Cuisine Type</p>
            <div className="flex flex-wrap gap-2">
              {CUISINES.map((c) => (
                <button
                  key={c}
                  onClick={() => toggleCuisine(c)}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-sm border transition-all',
                    filters.cuisineTypes?.includes(c)
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'border-border hover:border-brand-300'
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Price range */}
          <div>
            <p className="text-sm font-medium mb-3">Price Range</p>
            <div className="flex gap-2">
              {PRICE_RANGES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => togglePrice(value)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm border font-medium transition-all',
                    filters.priceRange?.includes(value)
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'border-border hover:border-brand-300'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Min rating */}
          <div>
            <p className="text-sm font-medium mb-3">Minimum Rating</p>
            <div className="flex gap-2">
              {[3, 3.5, 4, 4.5].map((r) => (
                <button
                  key={r}
                  onClick={() => onChange({ ...filters, rating: filters.rating === r ? undefined : r })}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-sm border transition-all',
                    filters.rating === r
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'border-border hover:border-brand-300'
                  )}
                >
                  {r}+ ★
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
