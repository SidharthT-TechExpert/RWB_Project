'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Clock, Star, Users, Store, ShoppingBag,
  ChevronRight, ChevronDown, ArrowRight, CheckCircle2, XCircle, X,
  Smartphone, CreditCard, Gift, Utensils, Zap, Map,
  ArrowUp, Apple, Play, Sparkles, Flame, Check,
  QrCode, CalendarCheck, ShieldCheck, Heart, ChefHat,
  Navigation, Bell, Award,
  Compass, Eye, SlidersHorizontal,
} from 'lucide-react';
import { useAuthModalStore } from '@/store/authModalStore';
import { useUserLocation } from '@/hooks/useUserLocation';
import { formatCurrency } from '@/lib/utils';
import { Locate, RefreshCw, Crosshair, Loader2 } from 'lucide-react';

import { LocationSuggestionItem, popularLocations, cleanPlaceName } from '@/lib/locationData';
import { LocationPickerModal } from '@/components/location/LocationPickerModal';

/* ─── Static Data ────────────────────────────────────────────── */
const stats = [
  { id: 1, value: 50, suffix: 'K+', label: 'Active Diners',       sub: 'Across 25+ cities', icon: Users },
  { id: 2, value: 1200, suffix: '+', label: 'Partner Restaurants', sub: 'Top-tier curated venues', icon: Store, formatCommas: true },
  { id: 3, value: 250, suffix: 'K+', label: 'Orders Delivered',   sub: 'Zero waiting queue', icon: ShoppingBag },
  { id: 4, value: 4.9, suffix: '★', label: 'Customer Rating',     sub: 'From 18,400+ reviews', icon: Star, decimals: 1 },
];

const mockRestaurants = [
  {
    id: 'r1',
    name: 'The Gilded Fork',
    cuisine: 'Fine Dining & Steakhouse',
    address: '428 Hudson St, Manhattan',
    wait: '~12 min wait',
    waitMins: 12,
    rating: 4.9,
    reviews: 1420,
    tablesLeft: 4,
    coords: { x: '35%', y: '42%' },
    img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
    popularDish: 'Charcoal Angus Wagyu & Truffle Risotto',
  },
  {
    id: 'r2',
    name: 'Bella Cucina',
    cuisine: 'Authentic Italian & Wine Bar',
    address: '184 Bleecker St, Greenwich Village',
    wait: 'No Wait',
    waitMins: 0,
    rating: 4.8,
    reviews: 980,
    tablesLeft: 6,
    coords: { x: '68%', y: '58%' },
    img: 'https://images.unsplash.com/photo-1513104890d38-7c0f4fff2b02?w=600&q=80',
    popularDish: 'Wood-Fired Burrata & Prosciutto Pizza',
  },
  {
    id: 'r3',
    name: 'Serena Sushi & Omakase',
    cuisine: 'Japanese & Raw Bar',
    address: '92 Spring St, SoHo',
    wait: '~15 min wait',
    waitMins: 15,
    rating: 4.9,
    reviews: 1850,
    tablesLeft: 2,
    coords: { x: '52%', y: '28%' },
    img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80',
    popularDish: 'Bluefin Toro & Uni Nigiri Tasting',
  },
];

const chefDishes = [
  {
    id: 1,
    name: 'Truffle Mushroom Artisan Pizza',
    category: 'Pizza',
    restaurant: 'Bella Cucina',
    price: 340,
    rating: 4.9,
    prepTime: '12m',
    isVeg: true,
    isChefPick: true,
    description: 'Wild forest mushrooms, Fior di Latte mozzarella, black summer truffle oil & aged parmesan.',
    img: 'https://images.unsplash.com/photo-1513104890d38-7c0f4fff2b02?w=800&q=80',
  },
  {
    id: 2,
    name: 'Charcoal Grilled Angus Ribeye',
    category: 'Steaks',
    restaurant: 'The Gilded Fork',
    price: 890,
    rating: 5.0,
    prepTime: '18m',
    isVeg: false,
    isChefPick: true,
    description: '350g USDA Prime beef seared over Japanese binchotan charcoal with roasted bone marrow butter.',
    img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
  },
  {
    id: 3,
    name: 'Mediterranean Burrata & Salmon',
    category: 'Appetizers',
    restaurant: 'L’Aromate Bistro',
    price: 520,
    rating: 4.8,
    prepTime: '8m',
    isVeg: false,
    isChefPick: false,
    description: 'Creamy artisanal Puglia burrata, citrus-cured Atlantic salmon, caper berries & basil vinaigrette.',
    img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
  },
  {
    id: 4,
    name: 'Royal Saffron Chicken Biryani',
    category: 'Indian',
    restaurant: 'Spice Route',
    price: 420,
    rating: 4.9,
    prepTime: '15m',
    isVeg: false,
    isChefPick: true,
    description: 'Aged basmati rice slow-cooked in dum with organic spring chicken, pure Kashmiri saffron & mint.',
    img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',
  },
  {
    id: 5,
    name: 'Artisan Dark Chocolate Fondant',
    category: 'Desserts',
    restaurant: 'Bistro 44',
    price: 280,
    rating: 4.9,
    prepTime: '10m',
    isVeg: true,
    isChefPick: false,
    description: '70% Valrhona dark molten chocolate cake served with Madagascar vanilla bean gelato.',
    img: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80',
  },
  {
    id: 6,
    name: 'Dragon Roll & Tuna Carpaccio',
    category: 'Sushi',
    restaurant: 'Serena Sushi',
    price: 640,
    rating: 4.9,
    prepTime: '14m',
    isVeg: false,
    isChefPick: true,
    description: 'Crispy king prawn, sliced avocado, unagi glaze, topped with thinly sliced yellowfin tuna.',
    img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80',
  },
];

const stepsData = [
  {
    id: '01',
    title: 'Discover & Lock Table',
    desc: 'Browse verified high-end restaurants, check real-time seating availability, and reserve your table instantly.',
    icon: Search,
    highlight: 'Instant Confirmation',
  },
  {
    id: '02',
    title: 'Pre-Order Signature Dishes',
    desc: 'Select your meals, portion sizes, and dietary preferences from the digital interactive menu before leaving.',
    icon: Utensils,
    highlight: 'Chef Pre-Notification',
  },
  {
    id: '03',
    title: 'Smart Kitchen Sync',
    desc: 'Our GPS-timed kitchen coordinator begins cooking so your food reaches peak tenderness right at your arrival.',
    icon: Zap,
    highlight: 'GPS Precision Timing',
  },
  {
    id: '04',
    title: 'Walk In & Feast Like VIP',
    desc: 'Bypass any waiting queue, sit down at your reserved table, enjoy hot food in 2 mins, and pay with 1 tap.',
    icon: Clock,
    highlight: 'Zero Waiting Guaranteed',
  },
];

const reviews = [
  {
    id: 1,
    name: 'Sarah Jenkins',
    role: 'Verified Diner · New York',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    stars: 5,
    text: 'Saved our entire anniversary night! We walked right past a 45-minute wait line, sat down at table #4, and our steak was served steaming hot in 3 minutes.',
    restaurant: 'The Gilded Fork',
  },
  {
    id: 2,
    name: 'Marcus Thorne',
    role: 'Executive · Chicago',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    stars: 5,
    text: 'Essential tool for business lunches. Pre-ordering means we get 45 minutes of actual conversation instead of waiting for menus and bills.',
    restaurant: 'Bella Cucina',
  },
  {
    id: 3,
    name: 'Emily Zhang',
    role: 'Food Critic · San Francisco',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    stars: 5,
    text: 'The wallet checkout with automatic 2% cashback is brilliant. No waving at waiters for the bill — you just stand up and leave when done.',
    restaurant: 'Serena Sushi',
  },
];

/* ─── Animated Number Counter ────────────────────────────────── */
function Counter({ value, decimals = 0, formatCommas = false }: { value: number; decimals?: number; formatCommas?: boolean }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStarted(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let start: number | null = null;
    const duration = 1600;
    const step = (now: number) => {
      if (!start) start = now;
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(value * ease);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, value]);

  const formatted = decimals > 0 
    ? count.toFixed(decimals) 
    : formatCommas 
    ? Math.floor(count).toLocaleString() 
    : Math.floor(count).toString();

  return <span ref={ref}>{formatted}</span>;
}

/* ════════════════════════════════════════════════════════════════
   MAIN LANDING PAGE
════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const { openModal } = useAuthModalStore();
  const { location: userGeo, status: geoStatus, refresh: refreshGeo, setManual, clearLocation } = useUserLocation();
  const [searchTab, setSearchTab] = useState<'table' | 'food' | 'both'>('both');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationInput, setLocationInput] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('quickbite_user_location');
        if (saved && !saved.toLowerCase().includes('thekkinezhath')) return saved;
        if (saved) localStorage.removeItem('quickbite_user_location');
      } catch {}
    }
    return '';
  });
  const [isLocDropdownOpen, setIsLocDropdownOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [remoteSuggestions, setRemoteSuggestions] = useState<LocationSuggestionItem[]>([]);
  const [isSearchingLoc, setIsSearchingLoc] = useState(false);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const locDropdownRef = useRef<HTMLDivElement>(null);
  const mobileLocDropdownRef = useRef<HTMLDivElement>(null);
  const [activeVenue, setActiveVenue] = useState(mockRestaurants[0]);
  const [selectedDishCategory, setSelectedDishCategory] = useState('All');
  const [showScrollTop, setShowScrollTop] = useState(false);

  const selectLocation = (locStr: string) => {
    setLocationInput(locStr);
    setManual(locStr);
    setIsLocDropdownOpen(false);
  };

  // Close location dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        locDropdownRef.current && !locDropdownRef.current.contains(target) &&
        mobileLocDropdownRef.current && !mobileLocDropdownRef.current.contains(target)
      ) {
        setIsLocDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fast Live Geocoding / Places API (Photon OpenStreetMap + Nominatim)
  useEffect(() => {
    const trimmed = locationInput.trim();
    if (trimmed.length < 2) {
      setRemoteSuggestions([]);
      setIsSearchingLoc(false);
      return;
    }

    const controller = new AbortController();
    setIsSearchingLoc(true);

    const timer = setTimeout(async () => {
      try {
        // Query Photon Places API with location bias for Kerala / India (lat 10.85, lon 76.27)
        const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&lat=10.8505&lon=76.2711&limit=12&lang=en`;
        const res = await fetch(photonUrl, { signal: controller.signal });
        
        if (res.ok) {
          const data = await res.json();
          if (data && data.features && data.features.length > 0) {
            const seenKeys = new Set<string>();
            const results: LocationSuggestionItem[] = [];

            for (const f of data.features) {
              const p = f.properties || {};
              const rawName = p.name || p.city || p.town || p.district || '';
              if (!rawName) continue;

              // Clean out redundant POI institution suffixes (schools, anganwadis, bus stands)
              const name = rawName
                .replace(/,?\s*(Central Upper Primary|Lower Primary|Upper Primary|Primary School|LP School|UP School|School|Anganavadi|Anganwadi|Hospital|Junction|Bus Stand|Sub Post Office).*$/i, '')
                .trim() || rawName;

              const rawDistrict = p.district || p.county || '';
              const cleanDist = rawDistrict && rawDistrict !== name ? rawDistrict.replace(/ District$/i, '').trim() : '';
              const state = p.state || 'Kerala';
              const country = p.country || 'India';

              // Filter out unrelated foreign places when searching local queries
              if (country !== 'India' && !trimmed.toLowerCase().includes(country.toLowerCase()) && !trimmed.toLowerCase().includes('usa')) {
                continue;
              }

              const dedupeKey = `${name.toLowerCase()}-${(cleanDist || state).toLowerCase()}`;
              if (seenKeys.has(dedupeKey)) continue;
              seenKeys.add(dedupeKey);

              const subtitleParts = [
                cleanDist ? `${cleanDist} District` : '',
                state,
                country,
              ].filter(Boolean);

              const displayParts = [name, cleanDist, state].filter(
                (v, idx, arr) => Boolean(v) && arr.indexOf(v) === idx
              );

              results.push({
                city: name,
                district: cleanDist || p.city || '',
                state,
                country,
                subtitle: subtitleParts.join(', '),
                display: displayParts.join(', '),
              });
            }

            if (results.length > 0) {
              setRemoteSuggestions(results);
              setIsSearchingLoc(false);
              return;
            }
          }
        }

        // Fallback: Query Nominatim with India countrycode filter
        const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&countrycodes=in&format=json&addressdetails=1&limit=8&accept-language=en`;
        const nomRes = await fetch(nomUrl, {
          headers: { 'User-Agent': 'QuickBite-App/1.0 (contact@quickbite.app)' },
          signal: controller.signal,
        });
        if (nomRes.ok) {
          const nomData = await nomRes.json();
          if (Array.isArray(nomData) && nomData.length > 0) {
            const seenKeys = new Set<string>();
            const nResults: LocationSuggestionItem[] = [];

            for (const item of nomData) {
              const addr = item.address || {};
              const rawName =
                addr.suburb ||
                addr.village ||
                addr.town ||
                addr.neighbourhood ||
                addr.hamlet ||
                addr.city ||
                item.name ||
                '';
              if (!rawName) continue;

              const name = rawName
                .replace(/,?\s*(Central Upper Primary|Lower Primary|Upper Primary|Primary School|LP School|UP School|School|Anganavadi|Anganwadi|Hospital|Junction|Bus Stand).*$/i, '')
                .trim() || rawName;

              const rawDistrict = addr.state_district || addr.county || addr.district || '';
              const cleanDistrict = rawDistrict.replace(/ District$/i, '').trim();
              const state = addr.state || addr.region || 'Kerala';
              const country = addr.country || 'India';

              const dedupeKey = `${name.toLowerCase()}-${(cleanDistrict || state).toLowerCase()}`;
              if (seenKeys.has(dedupeKey)) continue;
              seenKeys.add(dedupeKey);

              const subParts = [
                cleanDistrict ? `${cleanDistrict} District` : '',
                state,
              ].filter(Boolean);

              const display = [name, cleanDistrict, state].filter(
                (v, idx, arr) => Boolean(v) && arr.indexOf(v) === idx
              ).join(', ');

              nResults.push({
                city: name || 'Place',
                district: cleanDistrict,
                state,
                country,
                subtitle: subParts.join(', '),
                display: display || item.display_name,
              });
            }

            setRemoteSuggestions(nResults);
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          // ignore network errors cleanly
        }
      } finally {
        setIsSearchingLoc(false);
      }
    }, 140);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [locationInput]);

  // Combined instant local suggestions + live remote suggestions with exact relevance ranking
  const filteredLocations = useMemo(() => {
    const trimmed = locationInput.trim().toLowerCase();
    
    // When input is empty, show curated popular list
    if (!trimmed) {
      return popularLocations;
    }

    const queryParts = trimmed.split(/[\s,]+/).filter(Boolean);
    const firstWord = queryParts[0] || '';

    const seen = new Set<string>();
    const candidates: LocationSuggestionItem[] = [];

    // 1. LIVE API RESULTS FIRST
    for (const rem of remoteSuggestions) {
      const key = rem.display.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        candidates.push(rem);
      }
    }

    // 2. Local matches ONLY if they start with or contain the query
    const localMatches = popularLocations.filter((loc) => {
      const cityLow = loc.city.toLowerCase();
      const str = `${loc.city} ${loc.district || ''} ${loc.display}`.toLowerCase();
      return queryParts.every((part) => str.includes(part)) || cityLow.startsWith(firstWord);
    });

    for (const loc of localMatches) {
      const key = loc.display.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        candidates.push(loc);
      }
    }

    // 3. Exact Relevance Sorting so the exact place typed is ALWAYS #1
    const scored = candidates.map((item) => {
      const cityLow = item.city.toLowerCase();
      const displayLow = item.display.toLowerCase();
      let score = 0;

      // Exact place match
      if (cityLow === firstWord) {
        score += 160;
      } else if (cityLow.startsWith(firstWord)) {
        score += 110;
      } else if (displayLow.startsWith(firstWord)) {
        score += 80;
      } else if (cityLow.includes(firstWord)) {
        score += 50;
      } else if (displayLow.includes(firstWord)) {
        score += 30;
      }

      // Secondary match on district/state
      for (let i = 1; i < queryParts.length; i++) {
        if (displayLow.includes(queryParts[i])) {
          score += 20;
        }
      }

      return { item, score };
    });

    scored.sort((a, b) => b.score - a.score);

    return scored.map((s) => s.item);
  }, [locationInput, remoteSuggestions]);

  // Auto-fill initial location if empty
  useEffect(() => {
    if (userGeo?.display && !locationInput && !userGeo.display.toLowerCase().includes('thekkinezhath')) {
      setLocationInput(userGeo.display);
    }
  }, [userGeo]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const containerCls = 'w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-7xl 2xl:max-w-[1500px] 3xl:max-w-[1800px]';

  const filteredDishes = selectedDishCategory === 'All'
    ? chefDishes
    : chefDishes.filter(d => d.category === selectedDishCategory || (selectedDishCategory === 'Veg' && d.isVeg));

  return (
    <div className="min-h-screen bg-[#FFF8F4] dark:bg-[#0A0908] text-[#1C1917] dark:text-slate-100 font-sans selection:bg-[#FF6B35] selection:text-white relative overflow-hidden transition-colors duration-300">

      {/* ── Dynamic Ambient Illumination ── */}
      <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-gradient-to-br from-[#FF6B35]/20 via-[#FF4D0F]/10 to-transparent rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="absolute top-[600px] right-0 w-[600px] h-[600px] bg-gradient-to-bl from-amber-500/15 via-[#FF6B35]/5 to-transparent rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* ══════════════════════════════════════════════════════════
          1. HERO SECTION
      ══════════════════════════════════════════════════════════ */}
      <section className="relative pt-6 sm:pt-10 lg:pt-14 pb-14 sm:pb-20 z-30 overflow-visible">
        <div className={containerCls}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

            {/* Left Hero Column */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-7 relative z-40 overflow-visible">
              
              {/* Glowing City Badge (Live Dynamic Location) */}
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/80 dark:bg-white/[0.06] backdrop-blur-md border border-[#FFE8DC] dark:border-white/10 shadow-sm"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6B35] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF6B35]" />
                </span>
                <span className="text-[11px] font-black text-[#FF6B35] uppercase tracking-widest">
                  {locationInput.trim()
                    ? `NOW LIVE IN ${cleanPlaceName(locationInput.split(',')[0]).toUpperCase()}`
                    : userGeo?.city
                    ? `NOW LIVE IN ${userGeo.city.toUpperCase()}`
                    : 'NOW LIVE IN YOUR AREA'} · 25+ CITIES
                </span>
              </motion.div>

              {/* Hero Headline */}
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.08 }}
                className="space-y-2"
              >
                <h1 className="text-[2.9rem] xs:text-[3.5rem] sm:text-[4.2rem] lg:text-[4.8rem] xl:text-[5.4rem] font-black leading-[1.02] tracking-tight text-[#1C1917] dark:text-white">
                  Skip the Wait.<br />
                  <span className="bg-gradient-to-r from-[#FF6B35] via-[#FF8042] to-[#FF4D0F] bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(255,107,53,0.3)]">
                    Eat Faster.
                  </span>
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-[#78716C] dark:text-zinc-300/90 font-medium max-w-xl pt-1 leading-relaxed">
                  Book your table, pre-order your favorite meal, and walk into a VIP dining experience with zero wait time.
                </p>
              </motion.div>

              {/* ── Modern Luxury Floating Search Console ── */}
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.16 }}
                className="space-y-3 relative z-40"
              >
                {/* Minimalist Floating Tabs */}
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { id: 'table', label: '🪑 Book a Table' },
                    { id: 'food',  label: '🍽️ Order Food' },
                    { id: 'both',  label: '⚡ Table + Food' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSearchTab(t.id as any)}
                      className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        searchTab === t.id
                          ? 'bg-gradient-to-r from-[#FF6B35] to-[#FF4D0F] text-white shadow-[0_4px_16px_rgba(255,107,53,0.4)]'
                          : 'bg-[#181513]/80 hover:bg-[#221E1B] text-[#A8A29E] hover:text-white border border-[#2C2724] dark:border-white/10'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Unified Seamless Dark Luxury Search Capsule */}
                <div className="bg-[#181513]/95 backdrop-blur-2xl border border-[#2C2724] dark:border-white/15 rounded-2xl sm:rounded-full p-2 sm:p-2.5 shadow-[0_16px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(255,107,53,0.06)] focus-within:border-[#FF6B35] focus-within:ring-2 focus-within:ring-[#FF6B35]/20 transition-all">
                  <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-0">
                    {/* Search Field */}
                    <div className="flex-1 min-w-0 w-full flex items-center pl-3 sm:pl-4 pr-2 py-1.5 sm:py-0 relative">
                      <Search className="w-5 h-5 text-[#FF6B35] shrink-0 mr-3" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={
                          searchTab === 'table'
                            ? 'Search restaurants, cuisines, cafes...'
                            : searchTab === 'food'
                            ? 'Search dishes, pizzas, sushi, burgers...'
                            : 'Search restaurants, cuisines, or dishes...'
                        }
                        className="w-full bg-transparent text-sm sm:text-base font-medium text-white placeholder-[#8E8782] outline-none pr-7"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            searchInputRef.current?.focus();
                          }}
                          title="Clear search"
                          className="absolute right-2 p-1 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Vertical Divider */}
                    <div className="hidden sm:block w-[1px] h-7 bg-[#2E2824] dark:bg-white/15 shrink-0 mx-2" />

                    {/* Location Field (Desktop / Tablet) */}
                    <div ref={locDropdownRef} className="hidden sm:flex items-center w-52 lg:w-64 shrink-0 px-2 relative group/loc">
                      <MapPin className="w-4 h-4 text-[#FF6B35] shrink-0 mr-2" />
                      <input
                        ref={locationInputRef}
                        type="text"
                        value={locationInput}
                        onFocus={() => setIsLocDropdownOpen(true)}
                        onChange={(e) => {
                          setLocationInput(e.target.value);
                          setIsLocDropdownOpen(true);
                        }}
                        placeholder={geoStatus === 'loading' ? 'Detecting...' : 'Type city or area...'}
                        className="w-full bg-transparent text-sm font-medium text-white placeholder-[#8E8782] outline-none pr-14"
                      />
                      <div className="absolute right-1.5 flex items-center gap-1">
                        {locationInput && (
                          <button
                            type="button"
                            onClick={() => {
                              setLocationInput('');
                              clearLocation();
                              locationInputRef.current?.focus();
                              setIsLocDropdownOpen(true);
                            }}
                            title="Clear location"
                            className="p-1 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            refreshGeo();
                            setIsLocDropdownOpen(false);
                          }}
                          title={geoStatus === 'success' ? 'Location detected · Click to refresh GPS' : 'Click to detect your current location'}
                          className="p-1 rounded-full hover:bg-[#FF6B35]/20 text-[#FF6B35] transition-colors cursor-pointer"
                        >
                          {geoStatus === 'loading' ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#FF6B35]" />
                          ) : geoStatus === 'success' ? (
                            <div className="relative flex items-center justify-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5" />
                              <Crosshair className="w-3.5 h-3.5 text-emerald-500" />
                            </div>
                          ) : (
                            <Crosshair className="w-3.5 h-3.5 text-[#FF6B35]" />
                          )}
                        </button>
                      </div>

                      {/* Desktop Auto-Suggestion Dropdown */}
                      <AnimatePresence>
                        {isLocDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.98 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-full mt-2.5 w-80 sm:w-[380px] bg-[#13110F] border border-[#2E2722] rounded-2xl p-2.5 shadow-[0_30px_90px_rgba(0,0,0,0.98),0_0_40px_rgba(255,107,53,0.12)] z-[9999] space-y-1.5"
                          >
                            {/* Live GPS Option */}
                            <button
                              type="button"
                              onClick={() => {
                                refreshGeo();
                                setIsLocDropdownOpen(false);
                              }}
                              className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all bg-[#1C1815] hover:bg-[#26201B] border border-[#2C2621] hover:border-[#FF6B35]/40 text-[#FF6B35] cursor-pointer group"
                            >
                              <div className="w-8 h-8 rounded-xl bg-[#FF6B35]/15 border border-[#FF6B35]/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                <Crosshair className="w-4 h-4 text-[#FF6B35]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-xs text-white">Use Current GPS Location</span>
                                  {geoStatus === 'success' && (
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                                  )}
                                </div>
                                <span className="block text-[11px] text-[#A8A29E] font-medium truncate mt-0.5">
                                  {userGeo?.display || 'Auto-detect via satellite & Wi-Fi'}
                                </span>
                              </div>
                            </button>

                            <div className="flex items-center justify-between px-2 pt-1 pb-0.5 text-[10px] font-black uppercase tracking-wider text-[#8E8782] border-b border-[#241F1B]">
                              <span>{locationInput.trim() ? 'Search Results' : 'Popular Cities & Towns'}</span>
                              {isSearchingLoc ? (
                                <div className="flex items-center gap-1 text-[#FF6B35]">
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  <span className="text-[10px] lowercase">searching...</span>
                                </div>
                              ) : (
                                <span className="text-[10px] text-zinc-500 font-normal lowercase">
                                  {filteredLocations.length} places
                                </span>
                              )}
                            </div>

                            {/* Quick City Chips */}
                            {!locationInput.trim() && (
                              <div className="flex items-center gap-1.5 flex-wrap px-1 py-1">
                                {['Vengara', 'Malappuram', 'Kozhikode', 'Kannur', 'Kakkancheri', 'Kochi', 'Thrissur'].map((c) => (
                                  <button
                                    key={c}
                                    type="button"
                                    onClick={() => {
                                      const match = popularLocations.find((l) => l.city.toLowerCase() === c.toLowerCase());
                                      if (match) selectLocation(match.display);
                                      else selectLocation(`${c}, Kerala`);
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-[#1D1916] hover:bg-[#FF6B35]/20 border border-[#2D2620] hover:border-[#FF6B35]/40 text-zinc-300 hover:text-white text-[11px] font-bold transition-all cursor-pointer"
                                  >
                                    {c}
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* Suggestions List */}
                            <div className="max-h-64 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                              {filteredLocations.length > 0 ? (
                                filteredLocations.map((loc, idx) => {
                                  const isSelected =
                                    locationInput.toLowerCase() === loc.display.toLowerCase() ||
                                    locationInput.toLowerCase() === loc.city.toLowerCase();
                                  return (
                                    <button
                                      key={`${loc.display}-${idx}`}
                                      type="button"
                                      onClick={() => selectLocation(loc.display)}
                                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer group ${
                                        isSelected
                                          ? 'bg-[#FF6B35] text-white shadow-md'
                                          : 'bg-[#181412] hover:bg-[#221D19] text-zinc-200 border border-[#241F1B] hover:border-[#382F28]'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                          isSelected ? 'bg-white/20 text-white' : 'bg-[#FF6B35]/15 text-[#FF6B35]'
                                        }`}>
                                          <MapPin className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="truncate flex flex-col min-w-0">
                                          <div className="flex items-center gap-2 truncate">
                                            <span className={`font-bold text-sm leading-tight ${isSelected ? 'text-white' : 'text-white'}`}>
                                              {loc.city}
                                            </span>
                                            {loc.district && (
                                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wider ${
                                                isSelected ? 'bg-white/25 text-white' : 'bg-[#FF6B35]/20 text-[#FF6B35] border border-[#FF6B35]/30'
                                              }`}>
                                                {loc.district}
                                              </span>
                                            )}
                                          </div>
                                          <span className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-white/90' : 'text-[#8E8782]'}`}>
                                            {loc.subtitle || `${loc.state}, ${loc.country}`}
                                          </span>
                                        </div>
                                      </div>
                                      {isSelected && <Check className="w-4 h-4 shrink-0 ml-2" />}
                                    </button>
                                  );
                                })
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => selectLocation(locationInput)}
                                  className="w-full flex items-center gap-2.5 p-3 rounded-xl text-xs font-semibold text-zinc-300 hover:bg-[#221D19] hover:text-white transition-all text-left cursor-pointer border border-[#241F1B]"
                                >
                                  <MapPin className="w-4 h-4 text-[#FF6B35] shrink-0" />
                                  <span>Search directly for &quot;{locationInput}&quot;</span>
                                </button>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Location Field (Mobile only) */}
                    <div ref={mobileLocDropdownRef} className="sm:hidden w-full flex flex-col border-t border-[#2C2724] dark:border-white/10 relative">
                      <div className="flex items-center px-3 py-2 relative">
                        <MapPin className="w-4 h-4 text-[#FF6B35] shrink-0 mr-2" />
                        <input
                          type="text"
                          value={locationInput}
                          onFocus={() => setIsLocDropdownOpen(true)}
                          onChange={(e) => {
                            setLocationInput(e.target.value);
                            setIsLocDropdownOpen(true);
                          }}
                          placeholder={geoStatus === 'loading' ? 'Detecting GPS...' : 'City or area...'}
                          className="w-full bg-transparent text-xs font-medium text-white placeholder-[#8E8782] outline-none pr-14"
                        />
                        <div className="absolute right-3 flex items-center gap-1.5">
                          {locationInput && (
                            <button
                              type="button"
                              onClick={() => {
                                setLocationInput('');
                                clearLocation();
                                setIsLocDropdownOpen(true);
                              }}
                              title="Clear location"
                              className="p-1 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              refreshGeo();
                              setIsLocDropdownOpen(false);
                            }}
                            title="Detect GPS"
                            className="p-1 text-[#FF6B35]"
                          >
                            <Crosshair className="w-3.5 h-3.5 text-[#FF6B35]" />
                          </button>
                        </div>
                      </div>

                      {/* Mobile Suggestions Dropdown */}
                      <AnimatePresence>
                        {isLocDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 6 }}
                            className="p-2.5 bg-[#13110F] border-t border-[#2C2724] space-y-1.5 max-h-64 overflow-y-auto"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                refreshGeo();
                                setIsLocDropdownOpen(false);
                              }}
                              className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-bold text-[#FF6B35] bg-[#1C1815] border border-[#2C2621] text-left"
                            >
                              <Crosshair className="w-3.5 h-3.5 text-[#FF6B35]" />
                              <span>Use Current GPS Location</span>
                            </button>

                            <div className="flex items-center justify-between px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#8E8782]">
                              <span>{locationInput.trim() ? 'Matching Locations' : 'Popular Cities'}</span>
                              {isSearchingLoc && <Loader2 className="w-2.5 h-2.5 text-[#FF6B35] animate-spin" />}
                            </div>

                            {/* Mobile Quick City Chips */}
                            {!locationInput.trim() && (
                              <div className="flex items-center gap-1 flex-wrap px-1 py-1">
                                {['Vengara', 'Malappuram', 'Kozhikode', 'Kannur', 'Kakkancheri', 'Kochi'].map((c) => (
                                  <button
                                    key={`mob-chip-${c}`}
                                    type="button"
                                    onClick={() => {
                                      const match = popularLocations.find((l) => l.city.toLowerCase() === c.toLowerCase());
                                      if (match) selectLocation(match.display);
                                      else selectLocation(`${c}, Kerala`);
                                    }}
                                    className="px-2 py-0.5 rounded bg-[#1D1916] border border-[#2D2620] text-zinc-300 text-[10px] font-bold"
                                  >
                                    {c}
                                  </button>
                                ))}
                              </div>
                            )}

                            {filteredLocations.slice(0, 8).map((loc, idx) => (
                              <button
                                key={`m-${loc.display}-${idx}`}
                                type="button"
                                onClick={() => selectLocation(loc.display)}
                                className="w-full flex items-center justify-between p-2 rounded-lg text-xs font-semibold text-zinc-200 bg-[#181412] hover:bg-[#221D19] border border-[#241F1B] text-left"
                              >
                                <div className="truncate flex flex-col min-w-0">
                                  <div className="flex items-center gap-1.5 truncate">
                                    <span className="font-bold text-white">{loc.city}</span>
                                    {loc.district && (
                                      <span className="text-[9px] px-1 py-0.2 rounded bg-[#FF6B35]/20 text-[#FF6B35] font-bold uppercase border border-[#FF6B35]/30">
                                        {loc.district}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-[#8E8782] truncate">
                                    {loc.subtitle || `${loc.state}, ${loc.country}`}
                                  </span>
                                </div>
                                {locationInput.toLowerCase() === loc.display.toLowerCase() && (
                                  <Check className="w-3.5 h-3.5 text-[#FF6B35] shrink-0 ml-2" />
                                )}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Action Button */}
                    <button
                      type="button"
                      onClick={openModal}
                      className="w-full sm:w-auto px-6 sm:px-7 py-3 sm:py-3.5 bg-gradient-to-r from-[#FF6B35] to-[#FF4D0F] hover:from-[#FF5A1F] hover:to-[#E03A00] text-white font-bold text-sm sm:text-base rounded-xl sm:rounded-full shadow-[0_4px_18px_rgba(255,107,53,0.4)] hover:shadow-[0_6px_24px_rgba(255,107,53,0.6)] transition-all shrink-0 cursor-pointer flex items-center justify-center gap-2 group"
                    >
                      <span>Search</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Hero Column: Showcase Photo with Layered Badges */}
            <div className="lg:col-span-5 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative h-[440px] sm:h-[500px] lg:h-[560px] rounded-[2.5rem] overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.25)] border border-white/60 dark:border-white/15 group"
              >
                <Image
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=85"
                  alt="Luxury Dining Experience"
                  fill
                  priority
                  unoptimized
                  className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30" />

                {/* 1. Table Ready Badge (Top Left) */}
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-4 left-4 bg-black/75 backdrop-blur-xl border border-white/20 rounded-2xl px-3.5 py-2.5 shadow-2xl flex items-center gap-2.5 text-white"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/25 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black">Table Ready</p>
                    <p className="text-[10px] text-zinc-300">Walk right in · Confirmed</p>
                  </div>
                </motion.div>

                {/* 2. Wait Saved Badge (Center Right) */}
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="absolute top-1/2 -translate-y-1/2 right-4 bg-gradient-to-r from-[#FF6B35] to-[#FF4D0F] text-white rounded-2xl px-4 py-2.5 shadow-[0_8px_25px_rgba(255,107,53,0.4)] flex items-center gap-2"
                >
                  <Clock className="w-4 h-4 fill-white" />
                  <span className="text-xs font-black tracking-wide">-30 mins wait saved</span>
                </motion.div>

                {/* 3. Rating Badge (Bottom Right) */}
                <div className="absolute bottom-16 right-4 bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl p-3 shadow-2xl text-white">
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-black mb-0.5">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400" />)}
                  </div>
                  <p className="text-xs font-black">4.9/5.0 Rating</p>
                  <p className="text-[10px] text-zinc-300">2.4k verified reviews</p>
                </div>

                {/* 4. Live Availability Badge (Bottom Left) */}
                <div className="absolute bottom-4 left-4 bg-black/75 backdrop-blur-xl border border-white/20 rounded-full px-3.5 py-1.5 text-white text-xs font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>34 tables available near you</span>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          2. STATS MILESTONE BAR
      ══════════════════════════════════════════════════════════ */}
      <section className="py-10 sm:py-14 bg-white/40 dark:bg-white/[0.02] backdrop-blur-xl border-y border-[#FFE8DC] dark:border-white/10 relative overflow-hidden">
        <div className={containerCls}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: s.id * 0.08 }}
                  className="group relative bg-white/70 dark:bg-[#151311]/90 backdrop-blur-xl border border-[#FFE8DC] dark:border-white/10 hover:border-[#FF6B35]/40 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm hover:shadow-[0_10px_30px_rgba(255,107,53,0.12)] transition-all duration-300 hover:-translate-y-1 flex flex-col items-center sm:items-start text-center sm:text-left"
                >
                  {/* Ambient Corner Glow on Hover */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#FF6B35]/10 to-transparent rounded-tr-2xl sm:rounded-tr-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Icon Badge */}
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#FFF5F0] dark:bg-white/[0.06] border border-[#FFE8DC] dark:border-white/10 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-[#FF6B35]/15 transition-all duration-300">
                    <Icon className="w-5 h-5 text-[#FF6B35]" />
                  </div>

                  {/* Value */}
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1C1917] dark:text-white tracking-tight leading-none mb-1.5 flex items-center">
                    <Counter value={s.value} decimals={s.decimals || 0} formatCommas={s.formatCommas} />
                    <span className="text-[#FF6B35]">{s.suffix}</span>
                  </div>

                  {/* Label */}
                  <p className="text-xs sm:text-sm font-bold text-[#1C1917] dark:text-zinc-200 leading-snug">
                    {s.label}
                  </p>

                  {/* Subtext */}
                  <p className="text-[11px] text-[#A8A29E] dark:text-zinc-400 font-medium mt-0.5">
                    {s.sub}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          3. WHY QUICKBITE? (COMPARISON SECTION)
      ══════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 bg-[#12100E] text-white relative">
        <div className={containerCls}>
          <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Why QuickBite?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-1.5">
              Redefining the dining out experience with VIP treatment for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
            
            {/* The Old Way */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-zinc-900/90 rounded-3xl p-6 sm:p-8 border border-zinc-800 space-y-4 shadow-sm"
            >
              <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-800">
                <XCircle className="w-5 h-5 text-red-400" />
                <h3 className="text-base sm:text-lg font-black text-white">The Old Way</h3>
              </div>
              <div className="space-y-3 pt-1">
                {[
                  'Wait 45+ minutes in crowded lines for an open table',
                  'Struggle to get a busy waiter’s attention for placing orders',
                  'Wait another 20+ minutes for food to cook after seating',
                  'Rush through your dessert because staff is waiting for the table',
                  'Wait endlessly for the paper check & card machine to pay',
                ].map((txt, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-400 font-medium">
                    <XCircle className="w-4 h-4 text-red-400/80 shrink-0 mt-0.5" />
                    <span>{txt}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* QuickBite Experience */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative bg-gradient-to-br from-[#FF6B35] to-[#FF4D0F] rounded-3xl p-6 sm:p-8 text-white shadow-[0_15px_40px_rgba(255,107,53,0.3)] space-y-4"
            >
              <div className="absolute top-6 right-6 bg-white/20 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                FEATURED
              </div>
              <div className="flex items-center gap-2.5 pb-2 border-b border-white/20">
                <CheckCircle2 className="w-5 h-5 text-white" />
                <h3 className="text-base sm:text-lg font-black text-white">QuickBite Experience</h3>
              </div>
              <div className="space-y-3 pt-1">
                {[
                  'Walk straight to your reserved table with your name waiting',
                  'Order & customize meals and drinks in the app beforehand',
                  'Food arrives piping hot within 2 minutes of seating',
                  'Enjoy dining at your own relaxed pace with zero rush',
                  'One-tap contactless wallet payment & instant 2% cashback',
                ].map((txt, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-white font-bold">
                    <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
                    <span>{txt}</span>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          4. FOUR STEPS TO PERFECTION
      ══════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24">
        <div className={containerCls}>
          <div className="text-center max-w-xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-[#1C1917] dark:text-white tracking-tight">
              Four Steps to Perfection
            </h2>
            <p className="text-xs sm:text-sm text-[#78716C] dark:text-zinc-400 font-medium mt-1.5">
              Everything designed for effortless, delightful dining.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stepsData.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -6 }}
                  className="bg-white dark:bg-white/[0.03] backdrop-blur-md rounded-3xl p-6 border border-[#FFE8DC] dark:border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-[#FF6B35] transition-all text-center space-y-3"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#FFF5F0] dark:bg-white/[0.06] border border-[#FFE8DC] dark:border-white/10 shadow-sm flex items-center justify-center mx-auto text-[#FF6B35]">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-black font-mono text-[#FF6B35]">{s.id}</span>
                  <h3 className="text-base font-black text-[#1C1917] dark:text-white">{s.title}</h3>
                  <p className="text-xs text-[#78716C] dark:text-zinc-400 font-medium leading-relaxed max-w-xs mx-auto">
                    {s.desc}
                  </p>
                  <span className="inline-block text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/30">
                    {s.highlight}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          5. LIVE NEARBY RESTAURANTS & INTERACTIVE MAP
      ══════════════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-20 bg-[#FFF5F0]/70 dark:bg-white/[0.02] border-y border-[#FFE8DC] dark:border-white/10">
        <div className={containerCls}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white dark:bg-white/[0.03] backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-8 border border-[#FFE8DC] dark:border-white/10 shadow-lg items-center">
            
            {/* Interactive Map Preview (Left) */}
            <div className="lg:col-span-7 relative h-72 sm:h-84 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-700/50">
              <Image
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80"
                alt="Live Area Map"
                fill
                unoptimized
                className="object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Dynamic Interactive Venue Markers on Map */}
              {mockRestaurants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setActiveVenue(v)}
                  style={{ left: v.coords.x, top: v.coords.y }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shadow-2xl transition-all cursor-pointer ${
                    activeVenue.id === v.id
                      ? 'bg-[#FF6B35] text-white scale-110 ring-4 ring-[#FF6B35]/30 z-20'
                      : 'bg-white dark:bg-zinc-900 text-[#1C1917] dark:text-white hover:scale-105 z-10'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${v.waitMins === 0 ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
                  <span className="truncate max-w-[120px]">{v.name}</span>
                </button>
              ))}

              {/* Selected Venue Bottom Pill */}
              <div className="absolute bottom-3 left-3 right-3 bg-black/75 backdrop-blur-md rounded-xl p-2.5 text-white flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <Navigation className="w-3.5 h-3.5 text-[#FF6B35]" />
                  <span className="font-bold truncate">{activeVenue.name} · {activeVenue.popularDish}</span>
                </div>
                <span className="text-[10px] font-black text-emerald-400 shrink-0">{activeVenue.wait}</span>
              </div>
            </div>

            {/* List Right */}
            <div className="lg:col-span-5 space-y-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-[#1C1917] dark:text-white">
                  Live Nearby Restaurants
                </h3>
                <p className="text-xs text-[#78716C] dark:text-zinc-400 font-medium">
                  Instant table booking with live availability in your area.
                </p>
              </div>

              <div className="space-y-2.5">
                {mockRestaurants.map((venue) => (
                  <div
                    key={venue.id}
                    onClick={() => setActiveVenue(venue)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                      activeVenue.id === venue.id
                        ? 'bg-[#FFF5F0] dark:bg-white/[0.08] border-[#FF6B35] shadow-sm'
                        : 'bg-white dark:bg-white/[0.03] border-[#FFE8DC] dark:border-white/10 hover:border-[#FF6B35]/50'
                    }`}
                  >
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0">
                      <Image src={venue.img} alt={venue.name} fill unoptimized className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-black text-[#1C1917] dark:text-white truncate">{venue.name}</p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{venue.wait} · {venue.tablesLeft} tables open</p>
                    </div>
                    <span className="text-xs font-black text-amber-500 shrink-0">★ {venue.rating}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={openModal}
                className="w-full py-3 bg-[#1C1917] dark:bg-[#FF6B35] hover:bg-black dark:hover:bg-[#FF551A] text-white text-xs font-black rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Explore Full Map &amp; Book</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          6. CHEF'S RECOMMENDATIONS (WITH CATEGORY FILTER)
      ══════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24">
        <div className={containerCls}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#1C1917] dark:text-white tracking-tight">
                Chef’s Recommendations
              </h2>
              <p className="text-xs sm:text-sm text-[#78716C] dark:text-zinc-400 font-medium mt-1">
                Top curated culinary creations ready to be pre-ordered.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['All', 'Veg', 'Pizza', 'Steaks', 'Sushi'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedDishCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedDishCategory === cat
                      ? 'bg-[#FF6B35] text-white shadow-sm'
                      : 'bg-white dark:bg-white/[0.05] border border-[#FFE8DC] dark:border-white/10 text-[#78716C] dark:text-zinc-400 hover:border-[#FF6B35]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDishes.map((dish) => (
              <motion.div
                key={dish.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6 }}
                onClick={openModal}
                className="bg-white dark:bg-white/[0.03] backdrop-blur-md rounded-3xl overflow-hidden border border-[#FFE8DC] dark:border-white/10 shadow-md hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 sm:h-52 overflow-hidden">
                    <Image
                      src={dish.img}
                      alt={dish.name}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-black text-white shadow">
                      ⭐ {dish.rating}
                    </div>
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      {dish.isChefPick && (
                        <span className="bg-[#FF6B35] text-white px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase shadow">
                          Chef Pick
                        </span>
                      )}
                      <span className="bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-[10px] font-black">
                        ⚡ {dish.prepTime}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 space-y-1.5">
                    <p className="text-[11px] font-mono font-bold text-[#FF6B35] uppercase">{dish.restaurant}</p>
                    <h4 className="text-sm sm:text-base font-black text-[#1C1917] dark:text-white truncate">
                      {dish.name}
                    </h4>
                    <p className="text-xs text-[#78716C] dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {dish.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 sm:p-5 pt-0 flex items-center justify-between border-t border-[#FFF5F0] dark:border-white/5 mt-2">
                  <p className="text-base sm:text-lg font-black text-[#1C1917] dark:text-white">
                    {formatCurrency(dish.price)}
                  </p>
                  <button className="px-4 py-2 bg-[#FF6B35] hover:bg-[#FF4D0F] text-white text-xs font-black rounded-xl shadow transition-colors">
                    Pre-Order
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Partner Ticker ── */}
      <div className="py-8 bg-white/80 dark:bg-white/[0.02] border-y border-[#FFE8DC] dark:border-white/10 text-center">
        <p className="text-[11px] font-mono font-black text-[#A8A29E] uppercase tracking-[0.25em] mb-4">
          TRUSTED BY WORLD-CLASS CHEFS &amp; DINING GROUPS
        </p>
        <div className="flex items-center justify-center gap-8 sm:gap-14 flex-wrap text-xs sm:text-sm font-black text-[#78716C] dark:text-zinc-400 uppercase tracking-widest opacity-70">
          <span>CULINARY GIANTS</span>
          <span>BISTRO CO.</span>
          <span>GOURMET ELITE</span>
          <span>THE LOCAL TABLE</span>
          <span>EPICUREAN</span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          7. APP SHOWCASE ("Elevate Every Dining Moment")
      ══════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 bg-[#12100E] text-white">
        <div className={containerCls}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
            
            {/* Phone Showcase Frame Left */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-[260px] h-[460px] rounded-[3rem] border-4 border-zinc-700 bg-zinc-950 p-3 shadow-2xl relative">
                <div className="w-full h-full rounded-[2.3rem] overflow-hidden relative bg-gradient-to-b from-[#FF6B35] to-[#E8390A] p-4 text-white flex flex-col justify-between">
                  <div>
                    <div className="w-16 h-3.5 bg-white/20 rounded-full mx-auto mb-4" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">Table #4 Confirmed</p>
                    <p className="text-sm font-black">The Gilded Fork</p>
                  </div>
                  <div className="bg-black/40 backdrop-blur-md rounded-2xl p-3 text-xs space-y-1">
                    <p className="font-black text-white flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400" /> VIP Fast-Track
                    </p>
                    <p className="text-[10px] text-white/80">Dishes timed for your arrival</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Copy Right */}
            <div className="lg:col-span-7 space-y-5">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Elevate Every<br />
                <span className="text-[#FF6B35]">Dining Moment.</span>
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-md">
                Experience seamless reservations, zero wait times, and VIP contactless payments right from your mobile device.
              </p>

              <div className="space-y-2.5 pt-1">
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-white">
                  <CheckCircle2 className="w-4 h-4 text-[#FF6B35]" /> Priority Table Reservations
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-white">
                  <CheckCircle2 className="w-4 h-4 text-[#FF6B35]" /> Touchless 1-Tap Wallet Payments
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button className="px-4 py-2.5 rounded-xl bg-white text-[#1C1917] font-black text-xs flex items-center gap-2 shadow">
                  <Apple className="w-4 h-4" /> App Store
                </button>
                <button className="px-4 py-2.5 rounded-xl bg-zinc-800 text-white font-black text-xs flex items-center gap-2 border border-zinc-700">
                  <Play className="w-4 h-4" /> Google Play
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          8. TESTIMONIALS
      ══════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24">
        <div className={containerCls}>
          <div className="text-center max-w-xl mx-auto mb-12">
            <p className="text-xs font-mono font-black text-[#FF6B35] uppercase tracking-widest">
              Trusted by World-Class Diners
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-white dark:bg-white/[0.03] backdrop-blur-md rounded-3xl p-6 border border-[#FFE8DC] dark:border-white/10 shadow-sm space-y-3 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-1 text-amber-400 text-xs">
                    {[...Array(rev.stars)].map((_, idx) => <Star key={idx} className="w-3.5 h-3.5 fill-amber-400" />)}
                  </div>
                  <p className="text-xs sm:text-sm text-[#78716C] dark:text-zinc-300 font-medium leading-relaxed">
                    “{rev.text}”
                  </p>
                </div>
                <div className="pt-3 border-t border-[#FFF5F0] dark:border-white/5 flex items-center gap-3">
                  <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border border-[#FFE8DC]">
                    <Image src={rev.avatar} alt={rev.name} fill unoptimized className="object-cover" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#1C1917] dark:text-white leading-tight">{rev.name}</p>
                    <p className="text-[10px] text-[#A8A29E] font-bold">{rev.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          9. BOTTOM CTA ("Ready to Skip the Wait?")
      ══════════════════════════════════════════════════════════ */}
      <section className="py-12 sm:py-20">
        <div className={containerCls}>
          <div
            className="relative rounded-3xl sm:rounded-[2.5rem] overflow-hidden p-8 sm:p-14 text-center text-white shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #FF4D0F 50%, #E8390A 100%)' }}
          >
            <div className="relative max-w-xl mx-auto space-y-5">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Ready to Skip the Wait?
              </h2>
              <p className="text-xs sm:text-sm text-white/85 font-medium">
                Join 50,000+ smart diners enjoying VIP restaurant experiences every day.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={openModal}
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#1C1917] hover:bg-black text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl transition-all cursor-pointer"
                >
                  Start Booking Now
                </button>
                <Link
                  href="/restaurant/login"
                  className="w-full sm:w-auto px-8 py-3.5 bg-white text-[#1C1917] font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all text-center"
                >
                  Partner with Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Scroll To Top Button ── */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 w-11 h-11 rounded-full bg-[#FF6B35] text-white shadow-lg flex items-center justify-center hover:bg-[#FF4D0F] transition-all z-40 cursor-pointer"
            title="Back to Top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Exact Location Picker Modal ── */}
      <LocationPickerModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={locationInput}
        onSelectLocation={selectLocation}
      />

    </div>
  );
}
