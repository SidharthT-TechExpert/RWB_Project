'use client';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Star, MapPin, Clock, Phone, BadgeCheck, Heart, Share2,
  UtensilsCrossed, Wifi, ParkingSquare, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MenuSection } from '@/components/food/MenuSection';
import { BookingForm } from '@/components/booking/BookingForm';
import { Skeleton, MenuItemSkeleton } from '@/components/ui/Skeleton';
import { useRestaurant, useRestaurantMenu, useRestaurantReviews } from '@/hooks/useRestaurants';
import { formatCurrency, getPriceRangeSymbol, formatDate, cn } from '@/lib/utils';
import { Star as StarIcon } from 'lucide-react';

export default function RestaurantPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: restaurant, isLoading } = useRestaurant(slug);
  const { data: menu, isLoading: menuLoading } = useRestaurantMenu(restaurant?._id || '');
  const { data: reviewsData } = useRestaurantReviews(restaurant?._id || '');

  if (isLoading) return <RestaurantPageSkeleton />;
  if (!restaurant) return <div className="text-center py-32">Restaurant not found</div>;

  const reviews = reviewsData?.data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero section */}
      <div className="relative h-72 sm:h-96 rounded-3xl overflow-hidden mb-8 bg-muted">
        {restaurant.coverImage ? (
          <Image src={restaurant.coverImage} alt={restaurant.name} fill className="object-cover" priority />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-8xl">🍽️</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl sm:text-4xl font-bold">{restaurant.name}</h1>
                {restaurant.isVerified && <BadgeCheck className="h-7 w-7 text-brand-400" />}
              </div>
              <p className="text-white/80 text-sm">{restaurant.cuisineTypes.join(' · ')}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="icon" className="rounded-full bg-white/20 backdrop-blur-sm border-0 text-white hover:bg-white/30">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="secondary" size="icon" className="rounded-full bg-white/20 backdrop-blur-sm border-0 text-white hover:bg-white/30">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Info + Menu */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick info */}
          <div className="grid sm:grid-cols-4 gap-4">
            {[
              {
                icon: <StarIcon className="h-5 w-5 fill-yellow-400 text-yellow-400" />,
                label: `${restaurant.averageRating.toFixed(1)} (${restaurant.totalReviews} reviews)`,
              },
              { icon: <Clock className="h-5 w-5 text-brand-500" />, label: `${restaurant.preparationTime}–${restaurant.preparationTime + 10} min prep` },
              { icon: <MapPin className="h-5 w-5 text-brand-500" />, label: `${restaurant.address.city}, ${restaurant.address.state}` },
              { icon: <span className="text-lg font-semibold text-brand-500">{getPriceRangeSymbol(restaurant.priceRange)}</span>, label: 'Price range' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold mb-3">About</h2>
            <p className="text-muted-foreground leading-relaxed">{restaurant.description}</p>
          </div>

          {/* Opening hours */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Opening Hours</h2>
            <div className="grid sm:grid-cols-2 gap-2">
              {restaurant.openingHours.map((h) => (
                <div key={h.day} className="flex items-center justify-between p-3 rounded-xl border">
                  <span className="text-sm font-medium capitalize">{h.day}</span>
                  {h.isOpen ? (
                    <span className="text-sm text-muted-foreground">{h.openTime} – {h.closeTime}</span>
                  ) : (
                    <span className="text-sm text-destructive">Closed</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Menu */}
          <div>
            <h2 className="text-xl font-semibold mb-6">Menu</h2>
            {menuLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <MenuItemSkeleton key={i} />)}
              </div>
            ) : menu ? (
              <MenuSection
                categories={menu.categories || []}
                items={menu.items || []}
                restaurantId={restaurant._id}
                restaurantName={restaurant.name}
              />
            ) : (
              <p className="text-muted-foreground">Menu not available</p>
            )}
          </div>

          {/* Reviews */}
          {reviews.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Reviews</h2>
              <div className="space-y-4">
                {reviews.slice(0, 5).map((review: {
                  _id: string;
                  userName: string;
                  rating: number;
                  comment: string;
                  createdAt: string;
                  reply?: { text: string };
                  helpfulVotes: number;
                }) => (
                  <div key={review._id} className="p-5 rounded-xl border space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full brand-gradient flex items-center justify-center text-white font-semibold text-sm">
                          {review.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{review.userName}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <StarIcon key={i} className={cn('h-4 w-4', i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground')} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                    {review.reply && (
                      <div className="ml-4 p-3 rounded-lg bg-muted/50 border-l-2 border-brand-300">
                        <p className="text-xs font-semibold text-brand-600 mb-1">Owner's reply</p>
                        <p className="text-xs text-muted-foreground">{review.reply.text}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Booking form (sticky) */}
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <BookingForm restaurant={restaurant} />
          </div>
        </div>
      </div>
    </div>
  );
}

function RestaurantPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <Skeleton className="h-96 rounded-3xl" />
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
          </div>
          <Skeleton className="h-32 rounded-xl" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <MenuItemSkeleton key={i} />)}
          </div>
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    </div>
  );
}
