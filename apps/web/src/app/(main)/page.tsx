'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Search, MapPin, Star, Clock, ArrowRight, Utensils, CalendarCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { RestaurantCard } from '@/components/restaurants/RestaurantCard';
import { RestaurantCardSkeleton } from '@/components/ui/Skeleton';
import { useFeaturedRestaurants } from '@/hooks/useRestaurants';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' } }),
};

const CUISINES = [
  { name: 'Indian', emoji: '🍛' },
  { name: 'Chinese', emoji: '🥡' },
  { name: 'Italian', emoji: '🍕' },
  { name: 'Japanese', emoji: '🍣' },
  { name: 'Mexican', emoji: '🌮' },
  { name: 'Thai', emoji: '🍜' },
  { name: 'American', emoji: '🍔' },
  { name: 'Korean', emoji: '🥢' },
];

export default function HomePage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { data: featured, isLoading } = useFeaturedRestaurants();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/search?q=${encodeURIComponent(search)}`);
  };

  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-brand-50 via-white to-orange-50 dark:from-brand-950 dark:via-background dark:to-background">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-200/30 dark:bg-brand-800/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-orange-200/30 dark:bg-orange-800/10 blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center py-20">
          <motion.div initial="hidden" animate="visible" className="space-y-8">
            <motion.div custom={0} variants={fadeUp}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 text-sm font-medium mb-6">
                <Zap className="h-4 w-4" /> Skip the wait — book, order, enjoy
              </span>
            </motion.div>

            <motion.h1 custom={1} variants={fadeUp} className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              Dine smarter,<br />
              <span className="text-brand-500">not longer</span>
            </motion.h1>

            <motion.p custom={2} variants={fadeUp} className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Reserve tables, pre-order food, and arrive to a perfect dining experience — no waiting, no hassle.
            </motion.p>

            {/* Search bar */}
            <motion.form custom={3} variants={fadeUp} onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex gap-3 p-2 rounded-2xl border-2 border-brand-200 dark:border-brand-800 bg-white dark:bg-card shadow-xl shadow-brand-500/10">
                <div className="flex items-center gap-2 flex-1 px-3">
                  <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    placeholder="Search restaurants, cuisines, dishes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <Button type="submit" size="lg" className="rounded-xl shrink-0">
                  Find Food
                </Button>
              </div>
            </motion.form>

            {/* Quick stats */}
            <motion.div custom={4} variants={fadeUp} className="flex flex-wrap justify-center gap-8 pt-4">
              {[
                { label: 'Restaurants', value: '1,200+' },
                { label: 'Happy Diners', value: '50K+' },
                { label: 'Cities', value: '25+' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-bold text-brand-500">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">How QuickBite works</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">Three simple steps to a perfect dining experience</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-8">
          {[
            { icon: Search, step: '01', title: 'Discover', desc: 'Find restaurants near you, filtered by cuisine, rating, and price', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
            { icon: CalendarCheck, step: '02', title: 'Reserve & Pre-order', desc: 'Book your table and pre-order food — all in one go', color: 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400' },
            { icon: Utensils, step: '03', title: 'Arrive & Enjoy', desc: 'Walk in, sit down, and your food is ready — zero waiting', color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
          ].map(({ icon: Icon, step, title, desc, color }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center p-8 rounded-2xl border bg-card hover:shadow-lg transition-shadow"
            >
              <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6', color)}>
                <Icon className="h-7 w-7" />
              </div>
              <span className="text-xs font-bold text-muted-foreground">{step}</span>
              <h3 className="text-xl font-semibold mt-1 mb-3">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Cuisines */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Browse by cuisine</h2>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
            {CUISINES.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/restaurants?cuisineTypes=${c.name}`}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border hover:border-brand-300 hover:shadow-md transition-all group"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">{c.emoji}</span>
                  <span className="text-xs font-medium text-center">{c.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured restaurants */}
      <section className="py-24 max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold">Featured restaurants</h2>
            <p className="text-muted-foreground mt-1">Hand-picked by our team for the best experience</p>
          </div>
          <Link href="/restaurants">
            <Button variant="outline" className="gap-2 hidden sm:flex">
              View all <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <RestaurantCardSkeleton key={i} />)
            : (featured || []).map((r) => <RestaurantCard key={r._id} restaurant={r} />)}
        </div>

        <Link href="/restaurants" className="sm:hidden block mt-6">
          <Button variant="outline" className="w-full gap-2">
            View all restaurants <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>

      {/* CTA banner */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto brand-gradient rounded-3xl p-12 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
          </div>
          <div className="relative space-y-6">
            <h2 className="text-4xl font-bold">Own a restaurant?</h2>
            <p className="text-white/80 text-lg max-w-xl mx-auto">
              Join QuickBite and reach thousands of diners. Manage bookings, orders, and grow your business.
            </p>
            <Link href="/auth/register?role=restaurant_owner">
              <Button size="xl" className="bg-white text-brand-600 hover:bg-white/90 shadow-2xl">
                List Your Restaurant
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function cn(...args: (string | false | undefined | null)[]) {
  return args.filter(Boolean).join(' ');
}
