'use client';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, MapPin, Clock, Heart, BadgeCheck, Flame } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn, formatCurrency, getPriceRangeSymbol, truncateText } from '@/lib/utils';
import type { Restaurant } from '@/hooks/useRestaurants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { useState } from 'react';

interface RestaurantCardProps {
  restaurant: Restaurant;
  isFavorite?: boolean;
  className?: string;
}

export function RestaurantCard({ restaurant, isFavorite: initFav = false, className }: RestaurantCardProps) {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [isFav, setIsFav] = useState(initFav);

  const toggleFavMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/users/favorites/${restaurant._id}`);
    },
    onMutate: () => setIsFav((prev) => !prev),
    onError: () => {
      setIsFav((prev) => !prev);
      toast.error('Failed to update favorites');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'favorites'] });
    },
  });

  const isOpen = () => {
    const now = new Date();
    const day = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const hours = restaurant.openingHours?.find((h) => h.day === day);
    if (!hours?.isOpen) return false;
    const [oh, om] = hours.openTime.split(':').map(Number);
    const [ch, cm] = hours.closeTime.split(':').map(Number);
    const cur = now.getHours() * 60 + now.getMinutes();
    return cur >= oh * 60 + om && cur <= ch * 60 + cm;
  };

  const open = isOpen();

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn('group relative rounded-2xl border bg-card overflow-hidden shadow-sm hover:shadow-lg transition-shadow', className)}
    >
      {/* Cover image */}
      <Link href={`/restaurants/${restaurant.slug}`} className="block relative aspect-[16/9] overflow-hidden bg-muted">
        {restaurant.coverImage ? (
          <Image
            src={restaurant.coverImage}
            alt={restaurant.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 text-6xl">🍽️</div>
        )}

        {/* Overlay badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {restaurant.isFeatured && (
            <Badge className="bg-brand-500 text-white border-0 gap-1">
              <Flame className="h-3 w-3" /> Featured
            </Badge>
          )}
          {!open && <Badge variant="secondary" className="opacity-90">Closed</Badge>}
        </div>

        {/* Favorite button */}
        {isAuthenticated && (
          <button
            onClick={(e) => { e.preventDefault(); toggleFavMutation.mutate(); }}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 dark:bg-black/70 flex items-center justify-center shadow-md hover:scale-110 transition-transform"
            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={cn('h-4 w-4 transition-colors', isFav ? 'fill-red-500 text-red-500' : 'text-muted-foreground')} />
          </button>
        )}
      </Link>

      {/* Content */}
      <Link href={`/restaurants/${restaurant.slug}`} className="block p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-base leading-tight">{restaurant.name}</h3>
            {restaurant.isVerified && (
              <BadgeCheck className="h-4 w-4 text-brand-500 shrink-0" />
            )}
          </div>
          <span className="text-sm text-muted-foreground shrink-0">{getPriceRangeSymbol(restaurant.priceRange)}</span>
        </div>

        <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
          {truncateText(restaurant.cuisineTypes.join(' · '), 50)}
        </p>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-foreground">{restaurant.averageRating.toFixed(1)}</span>
              <span>({restaurant.totalReviews})</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {restaurant.preparationTime}–{restaurant.preparationTime + 10} min
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="truncate max-w-[80px]">{restaurant.address.city}</span>
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4">
        <Link href={`/restaurants/${restaurant.slug}`}>
          <Button size="sm" className="w-full" variant={open ? 'default' : 'outline'}>
            {open ? 'Book a Table' : 'View Menu'}
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
