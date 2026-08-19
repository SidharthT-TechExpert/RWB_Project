'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Search, Mic, ScanLine, ChevronRight, ChevronLeft,
  Star, Heart, Utensils, Clock, CalendarCheck, Zap,
  CheckCircle2, Activity, Eye, Flame, ArrowRight, TrendingUp,
  Navigation, LocateFixed, AlertCircle, RefreshCw, X, Loader2, Check, Crosshair,
} from 'lucide-react';
import { AuthUser } from '@/store/authStore';
import { useUserLocation } from '@/hooks/useUserLocation';
import { LocationSuggestionItem, popularLocations, cleanPlaceName } from '@/lib/locationData';

/* ─── Animation Variants ─────────────────────────────────────── */
const fadeUp = {
  hidden:  { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.52, ease: [0.16, 1, 0.3, 1] } },
};

/* ─── Helpers ────────────────────────────────────────────────── */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good morning',   emoji: '☀️' };
  if (h < 17) return { text: 'Good afternoon', emoji: '🌤️' };
  return             { text: 'Good evening',   emoji: '🔥' };
};

/* ─── Data ───────────────────────────────────────────────────── */
const nearbyRestaurants = [
  {
    id: 1, name: 'Bella Cucina', cuisine: 'Italian', distance: '1.2 km',
    rating: 4.9, wait: '~12 min wait', badge: 'TABLES AVAILABLE', badgeColor: 'green',
    img: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=700&q=85',
  },
  {
    id: 2, name: 'The Marquee', cuisine: 'Seafood & Grill', distance: '2.5 km',
    rating: 4.7, wait: '~15 min wait', badge: 'INSTANT CONFIRMATION', badgeColor: 'orange',
    img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=700&q=85',
  },
  {
    id: 3, name: 'Grand Yuu', cuisine: 'Japanese', distance: '3.1 km',
    rating: 4.8, wait: 'No wait', badge: 'TABLES AVAILABLE', badgeColor: 'green',
    img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=700&q=85',
  },
  {
    id: 4, name: 'Spice Route', cuisine: 'Indian', distance: '3.8 km',
    rating: 4.6, wait: '~20 min wait', badge: 'BOOKING OPEN', badgeColor: 'orange',
    img: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=700&q=85',
  },
];

const liveNow = [
  { id: 1, name: 'Urban Tandoor', cuisine: 'Indian',   rating: 4.8, wait: '~5 min',  img: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=700&q=85' },
  { id: 2, name: 'Pasta Street',  cuisine: 'Italian',  rating: 4.7, wait: 'No Wait', img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=700&q=85' },
  { id: 3, name: 'The Sushi Bar', cuisine: 'Japanese', rating: 4.8, wait: '~5 min',  img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=700&q=85' },
];

const highestRated = [
  { id: 1, name: 'Burger Joint Blitz', cuisine: 'American',    rating: 4.8, distance: '0.5 km', price: '$$',   img: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=700&q=85', top: false },
  { id: 2, name: 'The Gilded Fork',    cuisine: 'Fine Dining', rating: 4.9, distance: '0.8 km', price: '$$$$', img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=700&q=85', top: true  },
  { id: 3, name: 'Serena Sushi',       cuisine: 'Japanese',    rating: 4.8, distance: '1.0 km', price: '$$$',  img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=700&q=85', top: false },
];

/* ─── Sub-components ─────────────────────────────────────────── */
function StatusBadge({ label, color }: { label: string; color: string }) {
  const cls = color === 'green' ? 'bg-emerald-500 text-white' : 'bg-[#FF6B35] text-white';
  return (
    <span className={`inline-flex items-center gap-1.5 text-[9px] 3xl:text-[10px] font-black px-2 py-1 rounded-full ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
      {label}
    </span>
  );
}

/* ── Dynamic Location Pill ── */
function LocationPill({ className = '', onOpenLocation }: { className?: string; onOpenLocation?: () => void }) {
  const { location, status, refresh } = useUserLocation();

  if (status === 'loading') {
    return (
      <div className={`flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-[#FFE8DC] dark:border-zinc-800 rounded-full px-3 py-1.5 shadow-sm ${className}`}>
        <LocateFixed className="w-3.5 h-3.5 3xl:w-4 3xl:h-4 text-[#FF6B35] animate-pulse" />
        <span className="text-xs 3xl:text-sm font-bold text-[#A8A29E] whitespace-nowrap">Locating...</span>
      </div>
    );
  }

  if (status === 'denied' || status === 'error') {
    return (
      <button
        onClick={onOpenLocation || refresh}
        title="Set location"
        className={`flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/40 rounded-full px-3 py-1.5 shadow-sm hover:border-[#FF6B35] transition-colors cursor-pointer ${className}`}
      >
        <AlertCircle className="w-3.5 h-3.5 3xl:w-4 3xl:h-4 text-red-400" />
        <span className="text-xs 3xl:text-sm font-bold text-[#A8A29E] whitespace-nowrap">Choose location</span>
        <RefreshCw className="w-3 h-3 text-[#A8A29E]" />
      </button>
    );
  }

  if (status === 'success' && location) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={onOpenLocation || refresh}
        title="Change location"
        className={`flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-[#FFE8DC] dark:border-zinc-800 rounded-full px-3 py-1.5 shadow-sm hover:border-[#FF6B35] transition-colors cursor-pointer group ${className}`}
      >
        <MapPin className="w-3.5 h-3.5 3xl:w-4 3xl:h-4 text-[#FF6B35]" />
        <span className="text-xs 3xl:text-sm font-bold text-[#78716C] dark:text-zinc-400 whitespace-nowrap">
          {location.display}
        </span>
        <Navigation className="w-2.5 h-2.5 text-[#A8A29E] opacity-0 group-hover:opacity-100 transition-opacity" />
      </motion.button>
    );
  }

  /* idle — not yet triggered: show prompt */
  return (
    <button
      onClick={onOpenLocation || refresh}
      className={`flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-[#FFE8DC] dark:border-zinc-800 rounded-full px-3 py-1.5 shadow-sm hover:border-[#FF6B35] transition-colors cursor-pointer ${className}`}
    >
      <LocateFixed className="w-3.5 h-3.5 3xl:w-4 3xl:h-4 text-[#FF6B35]" />
      <span className="text-xs 3xl:text-sm font-bold text-[#78716C] dark:text-zinc-400 whitespace-nowrap">Detect location</span>
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */
export default function UserHomePage({ user }: { user: AuthUser }) {
  const [query, setQuery] = useState('');
  const [nearbyIndex, setNearbyIndex] = useState(0);

  const { location: userGeo, status: geoStatus, refresh: refreshGeo, setManual, clearLocation } = useUserLocation();
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
  const [remoteSuggestions, setRemoteSuggestions] = useState<LocationSuggestionItem[]>([]);
  const [isSearchingLoc, setIsSearchingLoc] = useState(false);

  const locationInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const locDropdownRef = useRef<HTMLDivElement>(null);
  const mobileLocDropdownRef = useRef<HTMLDivElement>(null);

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

  // Fast Live Geocoding with Kerala / India Location Bias and POI cleaner
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
        // Query Photon Places API with location bias for Kerala / India
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

              const name = cleanPlaceName(rawName);
              const rawDistrict = p.district || p.county || '';
              const cleanDist = rawDistrict && rawDistrict !== name ? rawDistrict.replace(/ District$/i, '').trim() : '';
              const state = p.state || 'Kerala';
              const country = p.country || 'India';

              if (country !== 'India' && !trimmed.toLowerCase().includes(country.toLowerCase()) && !trimmed.toLowerCase().includes('usa')) {
                continue;
              }

              const dedupeKey = `${name.toLowerCase()}-${(cleanDist || state).toLowerCase()}`;
              if (seenKeys.has(dedupeKey)) continue;
              seenKeys.add(dedupeKey);

              const subtitleParts = [cleanDist ? `${cleanDist} District` : '', state, country].filter(Boolean);
              const displayParts = [name, cleanDist, state].filter((v, idx, arr) => Boolean(v) && arr.indexOf(v) === idx);

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

        // Fallback to Nominatim
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
              const rawName = addr.suburb || addr.village || addr.town || addr.neighbourhood || addr.hamlet || addr.city || item.name || '';
              if (!rawName) continue;

              const name = cleanPlaceName(rawName);
              const rawDistrict = addr.state_district || addr.county || addr.district || '';
              const cleanDistrict = rawDistrict.replace(/ District$/i, '').trim();
              const state = addr.state || addr.region || 'Kerala';
              const country = addr.country || 'India';

              const dedupeKey = `${name.toLowerCase()}-${(cleanDistrict || state).toLowerCase()}`;
              if (seenKeys.has(dedupeKey)) continue;
              seenKeys.add(dedupeKey);

              const subParts = [cleanDistrict ? `${cleanDistrict} District` : '', state].filter(Boolean);
              const display = [name, cleanDistrict, state].filter((v, idx, arr) => Boolean(v) && arr.indexOf(v) === idx).join(', ');

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
          // ignore
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

  // Exact Relevance Sorting
  const filteredLocations = useMemo(() => {
    const trimmed = locationInput.trim().toLowerCase();
    if (!trimmed) return popularLocations;

    const queryParts = trimmed.split(/[\s,]+/).filter(Boolean);
    const firstWord = queryParts[0] || '';

    const seen = new Set<string>();
    const candidates: LocationSuggestionItem[] = [];

    for (const rem of remoteSuggestions) {
      const key = rem.display.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        candidates.push(rem);
      }
    }

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

    const scored = candidates.map((item) => {
      const cityLow = item.city.toLowerCase();
      const displayLow = item.display.toLowerCase();
      let score = 0;

      if (cityLow === firstWord) score += 160;
      else if (cityLow.startsWith(firstWord)) score += 110;
      else if (displayLow.startsWith(firstWord)) score += 80;
      else if (cityLow.includes(firstWord)) score += 50;
      else if (displayLow.includes(firstWord)) score += 30;

      for (let i = 1; i < queryParts.length; i++) {
        if (displayLow.includes(queryParts[i])) score += 20;
      }

      return { item, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.map((s) => s.item);
  }, [locationInput, remoteSuggestions]);

  // Initial location fill if empty
  useEffect(() => {
    if (userGeo?.display && !locationInput && !userGeo.display.toLowerCase().includes('thekkinezhath')) {
      setLocationInput(userGeo.display);
    }
  }, [userGeo]);

  const { text: greetText, emoji: greetEmoji } = getGreeting();
  const firstName = user.name.split(' ')[0].toUpperCase();

  /* Shared section max-width + padding — fluid for all devices */
  const wrapper = `w-full mx-auto
    px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-14 3xl:px-20 4xl:px-28
    max-w-full sm:max-w-3xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl
    2xl:max-w-[1400px] 3xl:max-w-[1800px] 4xl:max-w-[2200px]`;

  return (
    <div className="min-h-screen bg-[#FFF8F4] dark:bg-[#0F0E0D] font-sans">

      {/* ══════════════════════════════════════════════════════════
          HERO — Headline + Search
      ══════════════════════════════════════════════════════════ */}
      <section className={`${wrapper} pt-7 sm:pt-9 lg:pt-12 3xl:pt-16 pb-7 sm:pb-9 relative z-30 overflow-visible`}>

        {/* Greeting */}
        <motion.p
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-[10px] xs:text-[11px] sm:text-xs 3xl:text-sm 4xl:text-base
                     font-black text-[#FF6B35] uppercase tracking-widest mb-3 sm:mb-4"
        >
          {greetText}&nbsp;{greetEmoji}&nbsp;&nbsp;Welcome back,&nbsp;
          <span>{firstName}</span>
        </motion.p>

        {/* Headline + Location pill row */}
        <div className="flex items-start justify-between gap-3 sm:gap-6 mb-3 sm:mb-4">
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="text-[1.85rem] xs:text-[2.1rem] sm:text-[2.8rem] md:text-[3.2rem]
                       lg:text-[3.6rem] xl:text-[4rem] 2xl:text-[4.5rem]
                       3xl:text-[5.5rem] 4xl:text-[6.5rem]
                       font-black text-[#1C1917] dark:text-white leading-[1.04] tracking-tight"
          >
            Reserve Your Table<br />Without Waiting.
          </motion.h1>

          {/* Desktop location pill (sm+) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="hidden sm:block shrink-0 mt-2 3xl:mt-3"
          >
            <LocationPill onOpenLocation={() => {
              locationInputRef.current?.focus();
              setIsLocDropdownOpen(true);
            }} />
          </motion.div>
        </div>

        {/* Mobile location pill */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="sm:hidden mb-3"
        >
          <LocationPill onOpenLocation={() => setIsLocDropdownOpen(true)} />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.12 }}
          className="text-sm sm:text-base 3xl:text-lg 4xl:text-xl
                     text-[#78716C] dark:text-zinc-400 font-medium mb-5 sm:mb-7"
        >
          Reserve instantly at restaurants near you.
        </motion.p>

        {/* ── Seamless Luxury Search Console with Live Location & Geocoding Dropdown ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-50 overflow-visible"
        >
          <div className="bg-white dark:bg-[#141210] border border-[#EDE0D8] dark:border-[#2C2724] rounded-2xl sm:rounded-full p-2 sm:p-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.06),0_0_20px_rgba(255,107,53,0.04)] focus-within:border-[#FF6B35] focus-within:ring-2 focus-within:ring-[#FF6B35]/20 transition-all">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-0">
              
              {/* Search Query Field */}
              <div className="flex-1 min-w-0 w-full flex items-center pl-3 sm:pl-4 pr-2 py-1.5 sm:py-0 relative">
                <Search className="w-5 h-5 text-[#FF6B35] shrink-0 mr-3" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search cuisine, restaurants, or scan table QR..."
                  className="w-full bg-transparent text-sm sm:text-base font-medium text-[#1C1917] dark:text-white placeholder-[#8E8782] outline-none pr-7"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      searchInputRef.current?.focus();
                    }}
                    title="Clear search"
                    className="absolute right-2 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Vertical Divider */}
              <div className="hidden sm:block w-[1px] h-7 bg-[#EDE0D8] dark:bg-[#2E2824] shrink-0 mx-2" />

              {/* Location Field (Desktop / Tablet) */}
              <div ref={locDropdownRef} className="hidden sm:flex items-center w-56 lg:w-72 shrink-0 px-2 relative group/loc">
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
                  className="w-full bg-transparent text-sm font-medium text-[#1C1917] dark:text-white placeholder-[#8E8782] outline-none pr-14"
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
                      className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-colors cursor-pointer"
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
                              key={`user-chip-${c}`}
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
                                      <span className="font-bold text-sm leading-tight text-white">
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

              {/* Mobile Location Input (collapsible) */}
              <div ref={mobileLocDropdownRef} className="sm:hidden w-full flex flex-col border-t border-[#EDE0D8] dark:border-[#2C2724] relative">
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
                    className="w-full bg-transparent text-xs font-medium text-[#1C1917] dark:text-white placeholder-[#8E8782] outline-none pr-14"
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
                        className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
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

                {/* Mobile Dropdown */}
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
                              key={`user-mob-chip-${c}`}
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
                          key={`m-user-${loc.display}-${idx}`}
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

              {/* Action Buttons: Voice, Scan, Search */}
              <div className="flex items-center gap-1.5 shrink-0 pl-2">
                <button
                  type="button"
                  title="Voice Search"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#FFF5F0] dark:bg-zinc-800 flex items-center justify-center hover:bg-[#FFE8DC] dark:hover:bg-zinc-700 transition-colors"
                >
                  <Mic className="w-4 h-4 text-[#FF6B35]" />
                </button>
                <button
                  type="button"
                  title="Scan Table QR"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#FFF5F0] dark:bg-zinc-800 flex items-center justify-center hover:bg-[#FFE8DC] dark:hover:bg-zinc-700 transition-colors"
                >
                  <ScanLine className="w-4 h-4 text-[#FF6B35]" />
                </button>
                <button
                  type="button"
                  className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-[#FF6B35] to-[#FF4D0F] hover:from-[#FF5A1F] hover:to-[#E03A00] text-white font-bold text-xs sm:text-sm rounded-xl sm:rounded-full shadow-[0_4px_14px_rgba(255,107,53,0.35)] transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Search</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FEATURED + QUICK ACTIONS
      ══════════════════════════════════════════════════════════ */}
      <section className={`${wrapper} mb-10 sm:mb-12 3xl:mb-16`}>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 sm:gap-4 lg:gap-5 3xl:gap-6">

          {/* ── Featured Card (3 cols on sm+) ── */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="sm:col-span-3 relative
                       h-[280px] xs:h-[310px] sm:h-[370px] lg:h-[420px]
                       2xl:h-[460px] 3xl:h-[520px] 4xl:h-[600px]
                       rounded-2xl sm:rounded-3xl 3xl:rounded-[2rem] overflow-hidden
                       cursor-pointer group
                       shadow-[0_16px_50px_rgba(0,0,0,0.18)]"
          >
            <Image
              src="https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=900&q=85"
              alt="The Gilded Fork" fill unoptimized priority
              className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

            {/* Top badges */}
            <div className="absolute top-3 sm:top-4 3xl:top-5 left-3 sm:left-4 3xl:left-5 right-3 sm:right-4 3xl:right-5 flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5 bg-white/18 backdrop-blur-md border border-white/25
                              text-white text-[10px] 3xl:text-xs font-black px-3 3xl:px-4 py-1.5 rounded-full shadow-sm">
                ⭐ FEATURED TODAY
              </div>
              <div className="bg-[#FF6B35] text-white rounded-xl sm:rounded-2xl 3xl:rounded-3xl
                              px-3 3xl:px-4 py-2 3xl:py-3 text-center
                              shadow-[0_6px_20px_rgba(255,107,53,0.45)]">
                <p className="text-[8px] 3xl:text-[10px] font-bold uppercase tracking-widest text-white/80 leading-none mb-0.5">READY IN</p>
                <p className="text-xl sm:text-2xl 3xl:text-3xl 4xl:text-4xl font-black leading-none tracking-tight">18</p>
                <p className="text-[8px] 3xl:text-[10px] font-black uppercase tracking-widest">MINS</p>
              </div>
            </div>

            {/* Bottom content */}
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 lg:p-6 3xl:p-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl 3xl:text-4xl 4xl:text-5xl
                             font-black text-white drop-shadow-lg mb-0.5 tracking-tight">
                The Gilded Fork
              </h2>
              <p className="text-sm 3xl:text-base text-white/65 font-medium mb-3 3xl:mb-4">Luxury Fine Dining</p>
              <div className="flex items-center gap-1.5 mb-3 sm:mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 3xl:w-4 3xl:h-4 text-amber-400 fill-amber-400" />
                ))}
                <span className="text-white font-bold text-sm 3xl:text-base ml-1">4.8</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2 3xl:h-2.5 3xl:w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 3xl:h-2.5 3xl:w-2.5 bg-emerald-500" />
                  </span>
                  <span className="text-emerald-400 text-xs 3xl:text-sm font-bold">6 Tables Available</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="bg-white text-[#1C1917] font-black text-xs sm:text-sm 3xl:text-base
                             px-4 sm:px-5 3xl:px-6 py-2 sm:py-2.5 3xl:py-3
                             rounded-xl sm:rounded-2xl hover:bg-[#FFF5F0] transition-colors shadow-lg">
                  Reserve Table
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* ── Quick Actions 2×2 grid (2 cols on sm+) ── */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="sm:col-span-2 grid grid-cols-2 gap-2 sm:gap-3 3xl:gap-4"
          >
            {[
              { icon: CalendarCheck, label: 'Reserve Table', sub: 'Book your spot',  iconBg: '#FFF5F0', iconColor: '#FF6B35', href: '/bookings/new' },
              { icon: Utensils,      label: 'Order Food',    sub: '25 min delivery', iconBg: '#EFF6FF', iconColor: '#3B82F6', href: '/orders/new'  },
              { icon: ScanLine,      label: 'Scan QR',       sub: 'Order from table',iconBg: '#F5F3FF', iconColor: '#8B5CF6', href: '/scan'        },
              { icon: Heart,         label: 'Favorites',     sub: 'Places you love', iconBg: '#FDF2F8', iconColor: '#EC4899', href: '/favorites'   },
            ].map((a, i) => {
              const Icon = a.icon;
              return (
                <Link key={i} href={a.href}>
                  <motion.div
                    whileHover={{ scale: 1.04, y: -3 }} whileTap={{ scale: 0.97 }}
                    className="bg-white dark:bg-zinc-900 rounded-xl sm:rounded-2xl 3xl:rounded-3xl
                               p-3.5 sm:p-4 3xl:p-5 4xl:p-6
                               border border-[#FFE8DC] dark:border-zinc-800
                               shadow-[0_2px_12px_rgba(0,0,0,0.05)]
                               hover:shadow-[0_10px_30px_rgba(0,0,0,0.10)]
                               transition-all duration-200 cursor-pointer flex flex-col gap-2 sm:gap-3 h-full"
                  >
                    <div className="w-9 h-9 sm:w-11 sm:h-11 3xl:w-13 3xl:h-13 rounded-xl sm:rounded-2xl 3xl:rounded-3xl flex items-center justify-center shrink-0"
                         style={{ backgroundColor: a.iconBg }}>
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 3xl:w-6 3xl:h-6" style={{ color: a.iconColor }} />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm 3xl:text-base font-black text-[#1C1917] dark:text-white leading-tight">{a.label}</p>
                      <p className="text-[10px] sm:text-[11px] 3xl:text-xs text-[#A8A29E] font-medium mt-0.5">{a.sub}</p>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          UPCOMING BOOKING
      ══════════════════════════════════════════════════════════ */}
      <section className={`${wrapper} mb-10 sm:mb-12 3xl:mb-16`}>
        <motion.div
          initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl 3xl:rounded-[2rem] overflow-hidden
                     border border-[#FFE8DC] dark:border-zinc-800
                     shadow-[0_4px_28px_rgba(255,107,53,0.07)]"
        >
          <div className="h-1 3xl:h-1.5 bg-gradient-to-r from-[#FF6B35] via-[#FF5525] to-[#FF4D0F]" />
          <div className="p-4 sm:p-5 lg:p-6 3xl:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 3xl:gap-6">
              {/* Left: thumbnail + info */}
              <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 3xl:w-24 3xl:h-24 rounded-xl sm:rounded-2xl 3xl:rounded-3xl overflow-hidden shrink-0
                                shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
                  <Image src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&q=85"
                    alt="The Gilded Fork" fill unoptimized className="object-cover" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <CalendarCheck className="w-3.5 h-3.5 3xl:w-4 3xl:h-4 text-[#FF6B35] shrink-0" />
                    <span className="text-[10px] 3xl:text-xs font-black text-[#FF6B35] uppercase tracking-widest">Your Upcoming Booking</span>
                  </div>
                  <h3 className="text-lg sm:text-xl 3xl:text-2xl font-black text-[#1C1917] dark:text-white mb-0.5 tracking-tight">
                    The Gilded Fork
                  </h3>
                  <p className="text-xs sm:text-sm 3xl:text-base text-[#78716C] dark:text-zinc-400 font-medium mb-2">
                    Tonight, 8:00 PM&nbsp;·&nbsp;Table #4&nbsp;·&nbsp;2 Guests
                  </p>
                  <button className="group flex items-center gap-1.5 text-xs 3xl:text-sm font-bold text-[#FF6B35] hover:text-[#E8521A] transition-colors">
                    <Utensils className="w-3.5 h-3.5" />
                    Pre-order your meal before you arrive
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Right: status + buttons */}
              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40
                                   text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30
                                   text-[11px] 3xl:text-xs font-black px-3 py-1 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Confirmed
                  </span>
                  <span className="text-xs 3xl:text-sm text-[#78716C] dark:text-zinc-500 font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> In 2h 30m
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 text-xs 3xl:text-sm font-black text-[#1C1917] dark:text-white
                                     border border-[#E8E0DC] dark:border-zinc-700 rounded-xl 3xl:rounded-2xl
                                     hover:bg-[#FFF5F0] dark:hover:bg-zinc-800 transition-colors">
                    Modify
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="px-4 py-2 text-xs 3xl:text-sm font-black text-white
                               bg-gradient-to-r from-[#FF6B35] to-[#FF4D0F] rounded-xl 3xl:rounded-2xl
                               shadow-[0_4px_14px_rgba(255,107,53,0.35)]
                               hover:shadow-[0_8px_24px_rgba(255,107,53,0.45)] transition-all duration-200">
                    View Details
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          RESTAURANTS NEAR YOU
      ══════════════════════════════════════════════════════════ */}
      <section className="mb-12 sm:mb-14 3xl:mb-18">
        <div className={`${wrapper} mb-4 sm:mb-5 3xl:mb-6`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg sm:text-xl lg:text-2xl 3xl:text-3xl 4xl:text-4xl
                               font-black text-[#1C1917] dark:text-white tracking-tight">
                  Restaurants Near You
                </h2>
                <span className="relative flex h-2.5 w-2.5 3xl:h-3 3xl:w-3 mt-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 3xl:h-3 3xl:w-3 bg-emerald-500" />
                </span>
              </div>
              <p className="text-xs 3xl:text-sm text-[#A8A29E] font-medium">
                Available right now · Reserve instantly.
              </p>
            </div>
            {/* Nav arrows */}
            <div className="flex items-center gap-2 shrink-0">
              {[
                { icon: ChevronLeft,  onClick: () => setNearbyIndex(i => Math.max(0, i - 1)) },
                { icon: ChevronRight, onClick: () => setNearbyIndex(i => Math.min(nearbyRestaurants.length - 1, i + 1)) },
              ].map(({ icon: Icon, onClick }, idx) => (
                <button key={idx} onClick={onClick}
                  className="w-8 h-8 sm:w-9 sm:h-9 3xl:w-11 3xl:h-11 rounded-full
                             bg-white dark:bg-zinc-900 border border-[#FFE8DC] dark:border-zinc-800
                             flex items-center justify-center shadow-sm
                             hover:shadow-md hover:border-[#FF6B35] transition-all active:scale-95">
                  <Icon className="w-4 h-4 3xl:w-5 3xl:h-5 text-[#78716C] dark:text-zinc-400" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cards horizontal scroll */}
        <div className={`${wrapper}`}>
          <div className="flex gap-3 sm:gap-4 3xl:gap-5 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
            {nearbyRestaurants.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -5 }}
                className="shrink-0
                           w-[200px] xs:w-[215px] sm:w-[235px] md:w-[255px]
                           2xl:w-[280px] 3xl:w-[320px] 4xl:w-[380px]
                           bg-white dark:bg-zinc-900
                           rounded-xl sm:rounded-2xl 3xl:rounded-3xl overflow-hidden
                           border border-[#FFE8DC] dark:border-zinc-800
                           shadow-[0_2px_14px_rgba(0,0,0,0.06)]
                           hover:shadow-[0_14px_40px_rgba(0,0,0,0.12)]
                           transition-all duration-300 cursor-pointer group"
              >
                <div className="relative h-[135px] xs:h-[148px] sm:h-[160px] 3xl:h-[190px] 4xl:h-[230px] overflow-hidden">
                  <Image src={r.img} alt={r.name} fill unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-600 ease-out" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3">
                    <StatusBadge label={r.badge} color={r.badgeColor} />
                  </div>
                  <button className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3
                                     w-6 h-6 sm:w-7 sm:h-7 3xl:w-8 3xl:h-8 rounded-full
                                     bg-white/85 backdrop-blur-sm flex items-center justify-center
                                     shadow-sm hover:bg-white transition-colors">
                    <Heart className="w-3 h-3 3xl:w-3.5 3xl:h-3.5 text-[#78716C]" />
                  </button>
                </div>
                <div className="p-3 sm:p-3.5 3xl:p-4">
                  <h3 className="text-xs sm:text-sm 3xl:text-base font-black text-[#1C1917] dark:text-white
                                 group-hover:text-[#FF6B35] transition-colors truncate mb-0.5">
                    {r.name}
                  </h3>
                  <p className="text-[10px] sm:text-xs 3xl:text-sm text-[#A8A29E] font-medium mb-2.5 truncate">
                    {r.cuisine}&nbsp;·&nbsp;{r.distance}
                  </p>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 3xl:w-3.5 3xl:h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-[11px] 3xl:text-xs font-black text-[#1C1917] dark:text-white">{r.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#78716C] dark:text-zinc-400">
                      <Clock className="w-2.5 h-2.5 3xl:w-3 3xl:h-3" />
                      <span className="text-[10px] 3xl:text-xs font-medium">{r.wait}</span>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="w-full py-1.5 sm:py-2 3xl:py-2.5
                               bg-gradient-to-r from-[#FF6B35] to-[#FF4D0F] text-white
                               text-[10px] sm:text-xs 3xl:text-sm font-black rounded-lg sm:rounded-xl 3xl:rounded-2xl
                               shadow-[0_3px_10px_rgba(255,107,53,0.28)]
                               hover:shadow-[0_6px_18px_rgba(255,107,53,0.42)] transition-all duration-200">
                    Reserve
                  </motion.button>
                </div>
              </motion.div>
            ))}

            {/* "Around You" map card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.32 }}
              whileHover={{ y: -5 }}
              className="shrink-0
                         w-[200px] xs:w-[215px] sm:w-[235px] md:w-[255px]
                         2xl:w-[280px] 3xl:w-[320px] 4xl:w-[380px]
                         relative rounded-xl sm:rounded-2xl 3xl:rounded-3xl overflow-hidden cursor-pointer group
                         shadow-[0_2px_14px_rgba(0,0,0,0.06)] hover:shadow-[0_14px_40px_rgba(0,0,0,0.12)]
                         transition-all duration-300 flex flex-col
                         bg-gradient-to-br from-[#FFF5F0] to-[#FFE8DC]
                         dark:from-zinc-900 dark:to-zinc-800
                         border border-[#FFE8DC] dark:border-zinc-700"
            >
              <div className="absolute inset-0 overflow-hidden opacity-25">
                {[...Array(18)].map((_, i) => (
                  <div key={i} className="absolute w-1 h-1 rounded-full bg-[#FF6B35]/40"
                    style={{ left: `${(i * 37) % 90}%`, top: `${(i * 53) % 85}%` }} />
                ))}
                {[...Array(5)].map((_, i) => (
                  <div key={`h${i}`} className="absolute h-px bg-[#FF6B35]/15 w-full" style={{ top: `${i * 22}%` }} />
                ))}
                {[...Array(5)].map((_, i) => (
                  <div key={`v${i}`} className="absolute w-px bg-[#FF6B35]/15 h-full" style={{ left: `${i * 22}%` }} />
                ))}
              </div>
              <div className="flex-1 flex items-center justify-center relative py-6 3xl:py-8">
                <div className="relative">
                  <div className="w-12 h-12 3xl:w-14 3xl:h-14 rounded-full bg-white dark:bg-zinc-800
                                  shadow-[0_8px_24px_rgba(255,107,53,0.25)]
                                  flex items-center justify-center border border-[#FFE8DC] dark:border-zinc-700">
                    <MapPin className="w-6 h-6 3xl:w-7 3xl:h-7 text-[#FF6B35]" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-[#FF6B35]/40 animate-ping" />
                </div>
              </div>
              <div className="p-3 sm:p-4 3xl:p-5 relative">
                <p className="text-xs sm:text-sm 3xl:text-base font-black text-[#1C1917] dark:text-white mb-0.5">Around You</p>
                <p className="text-[10px] sm:text-xs 3xl:text-sm text-[#78716C] dark:text-zinc-400 font-medium mb-2.5 3xl:mb-3">
                  8 active venues nearby
                </p>
                <button className="w-full py-1.5 sm:py-2 3xl:py-2.5 border border-[#FF6B35] text-[#FF6B35]
                                   text-[10px] sm:text-xs 3xl:text-sm font-black rounded-lg sm:rounded-xl 3xl:rounded-2xl
                                   hover:bg-[#FF6B35] hover:text-white transition-all duration-200">
                  Open Map View
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          AVAILABLE RIGHT NOW — Cinematic cards
      ══════════════════════════════════════════════════════════ */}
      <section className="mb-12 sm:mb-14 3xl:mb-18">
        <div className={`${wrapper} mb-4 sm:mb-5 3xl:mb-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 3xl:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 3xl:w-11 3xl:h-11
                              rounded-lg sm:rounded-xl 3xl:rounded-2xl
                              bg-[#FFF5F0] dark:bg-zinc-800 border border-[#FFE8DC] dark:border-zinc-700
                              flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 3xl:w-5 3xl:h-5 text-[#FF6B35] fill-[#FF6B35]" />
              </div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl lg:text-2xl 3xl:text-3xl 4xl:text-4xl
                               font-black text-[#1C1917] dark:text-white tracking-tight">
                  Available Right Now
                </h2>
                <span className="relative flex h-2.5 w-2.5 3xl:h-3 3xl:w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 3xl:h-3 3xl:w-3 bg-emerald-500" />
                </span>
              </div>
            </div>
            <Link href="/restaurants?available=now"
              className="text-xs sm:text-sm 3xl:text-base font-bold text-[#FF6B35] hover:text-[#E8521A] flex items-center gap-0.5 transition-colors">
              View All <ChevronRight className="w-4 h-4 3xl:w-5 3xl:h-5" />
            </Link>
          </div>
        </div>

        <div className={`${wrapper}`}>
          <div className="flex gap-3 sm:gap-4 3xl:gap-5 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
            {liveNow.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, scale: 0.93 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.09 }}
                whileHover={{ scale: 1.03, y: -4 }}
                className="relative shrink-0
                           w-[270px] xs:w-[290px] sm:w-[310px] md:w-[330px]
                           2xl:w-[360px] 3xl:w-[420px] 4xl:w-[500px]
                           h-[185px] xs:h-[195px] sm:h-[210px] 3xl:h-[250px] 4xl:h-[300px]
                           rounded-xl sm:rounded-2xl 3xl:rounded-3xl overflow-hidden cursor-pointer
                           shadow-[0_8px_28px_rgba(0,0,0,0.12)]
                           hover:shadow-[0_18px_50px_rgba(0,0,0,0.20)]
                           transition-all duration-300 group"
              >
                <Image src={r.img} alt={r.name} fill unoptimized
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                <div className="absolute top-3 3xl:top-4 left-3 3xl:left-4 flex items-center gap-1.5 bg-emerald-500 text-white text-[9px] 3xl:text-[10px] font-black px-2.5 py-1 rounded-full shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
                </div>
                <div className="absolute top-3 3xl:top-4 right-3 3xl:right-4 flex items-center gap-1 bg-black/55 backdrop-blur-sm text-white text-[11px] 3xl:text-xs font-black px-2 py-1 rounded-full">
                  <Star className="w-3 h-3 3xl:w-3.5 3xl:h-3.5 text-amber-400 fill-amber-400" />{r.rating}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3.5 sm:p-4 3xl:p-5 flex items-end justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base 3xl:text-lg font-black text-white drop-shadow">{r.name}</h3>
                    <p className="text-[11px] 3xl:text-xs text-white/65 font-medium mt-0.5">{r.cuisine}&nbsp;·&nbsp;{r.wait}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
                    className="px-3 sm:px-4 3xl:px-5 py-1.5 sm:py-2 3xl:py-2.5
                               bg-[#FF6B35] hover:bg-[#E8521A] text-white
                               text-[10px] sm:text-xs 3xl:text-sm font-black rounded-lg sm:rounded-xl 3xl:rounded-2xl
                               shadow-[0_4px_14px_rgba(255,107,53,0.45)] transition-colors duration-200 shrink-0">
                    Reserve
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          HIGHEST RATED — 3-col grid on md+
      ══════════════════════════════════════════════════════════ */}
      <section className={`${wrapper} mb-12 sm:mb-14 3xl:mb-18`}>
        <div className="flex items-center justify-between mb-4 sm:mb-5 3xl:mb-6">
          <div className="flex items-center gap-2.5 3xl:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 3xl:w-11 3xl:h-11 rounded-lg sm:rounded-xl 3xl:rounded-2xl
                            bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30 flex items-center justify-center">
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 3xl:w-5 3xl:h-5 text-amber-500 fill-amber-500" />
            </div>
            <h2 className="text-lg sm:text-xl lg:text-2xl 3xl:text-3xl 4xl:text-4xl font-black text-[#1C1917] dark:text-white tracking-tight">
              Highest Rated
            </h2>
          </div>
          <Link href="/restaurants?sort=rating"
            className="text-xs sm:text-sm 3xl:text-base font-bold text-[#FF6B35] hover:text-[#E8521A] flex items-center gap-0.5 transition-colors">
            View All <ChevronRight className="w-4 h-4 3xl:w-5 3xl:h-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 3xl:gap-5">
          {highestRated.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="bg-white dark:bg-zinc-900 rounded-xl sm:rounded-2xl 3xl:rounded-3xl overflow-hidden
                         border border-[#FFE8DC] dark:border-zinc-800
                         shadow-[0_2px_14px_rgba(0,0,0,0.06)]
                         hover:shadow-[0_14px_40px_rgba(255,107,53,0.12)]
                         transition-all duration-300 cursor-pointer group"
            >
              <div className="relative h-[160px] sm:h-[170px] 3xl:h-[210px] 4xl:h-[260px] overflow-hidden">
                <Image src={r.img} alt={r.name} fill unoptimized
                  className="object-cover group-hover:scale-105 transition-transform duration-600 ease-out" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/93 dark:bg-zinc-900/93 backdrop-blur px-2 sm:px-2.5 py-1 rounded-full shadow-sm">
                  <Star className="w-3 h-3 3xl:w-3.5 3xl:h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-xs 3xl:text-sm font-black text-[#1C1917] dark:text-white">{r.rating}</span>
                </div>
                {r.top && (
                  <div className="absolute top-3 left-3 flex items-center gap-1 bg-[#FF6B35] text-white text-[9px] 3xl:text-[10px] font-black px-2 py-1 rounded-full">
                    <TrendingUp className="w-2.5 h-2.5" /> #1 PICK
                  </div>
                )}
              </div>
              <div className="p-3.5 sm:p-4 3xl:p-5">
                <h3 className="text-sm sm:text-base 3xl:text-lg font-black text-[#1C1917] dark:text-white mb-0.5
                               group-hover:text-[#FF6B35] transition-colors">
                  {r.name}
                </h3>
                <p className="text-xs 3xl:text-sm text-[#A8A29E] font-medium mb-3">
                  {r.cuisine}&nbsp;·&nbsp;{r.distance}&nbsp;·&nbsp;{r.price}
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  className="w-full py-2 sm:py-2.5 3xl:py-3
                             bg-gradient-to-r from-[#FF6B35] to-[#FF4D0F] text-white
                             text-xs 3xl:text-sm font-black rounded-lg sm:rounded-xl 3xl:rounded-2xl
                             shadow-[0_3px_10px_rgba(255,107,53,0.25)]
                             hover:shadow-[0_6px_22px_rgba(255,107,53,0.42)] transition-all duration-200">
                  Reserve Table
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          RECENTLY VIEWED + RECENT ACTIVITY
      ══════════════════════════════════════════════════════════ */}
      <section className={`${wrapper} mb-14 3xl:mb-20`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 3xl:gap-8">

          {/* Recently Viewed */}
          <motion.div
            initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-5 3xl:mb-6">
              <div className="flex items-center gap-2.5 3xl:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 3xl:w-11 3xl:h-11 rounded-lg sm:rounded-xl 3xl:rounded-2xl
                                bg-[#FFF5F0] dark:bg-zinc-800 border border-[#FFE8DC] dark:border-zinc-700 flex items-center justify-center">
                  <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 3xl:w-5 3xl:h-5 text-[#FF6B35]" />
                </div>
                <h2 className="text-base sm:text-lg 3xl:text-2xl 4xl:text-3xl font-black text-[#1C1917] dark:text-white tracking-tight">
                  Recently Viewed
                </h2>
              </div>
              <Link href="/history" className="text-xs sm:text-sm 3xl:text-base font-bold text-[#FF6B35] hover:text-[#E8521A] transition-colors">
                View All →
              </Link>
            </div>
            <div className="flex gap-2.5 sm:gap-3 3xl:gap-4 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
              {[
                { name: 'Bella Cucina', time: '2 days ago', img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&q=80' },
                { name: 'The Marquee',  time: '3 days ago', img: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=300&q=80' },
                { name: 'Grand Yuu',    time: '5 days ago', img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=300&q=80' },
              ].map((r, i) => (
                <motion.div key={i} whileHover={{ y: -4 }}
                  className="shrink-0 w-[140px] sm:w-[148px] 3xl:w-[180px] 4xl:w-[220px]
                             bg-white dark:bg-zinc-900 rounded-xl sm:rounded-2xl 3xl:rounded-3xl overflow-hidden
                             border border-[#FFE8DC] dark:border-zinc-800
                             shadow-sm hover:shadow-md transition-all duration-250 cursor-pointer group">
                  <div className="relative h-[85px] sm:h-[90px] 3xl:h-[115px] overflow-hidden">
                    <Image src={r.img} alt={r.name} fill unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-2.5 sm:p-3 3xl:p-4">
                    <p className="text-[11px] sm:text-xs 3xl:text-sm font-black text-[#1C1917] dark:text-white truncate mb-0.5">{r.name}</p>
                    <p className="text-[10px] 3xl:text-xs text-[#A8A29E] font-medium mb-2 3xl:mb-2.5">{r.time}</p>
                    <button className="w-full py-1.5 text-[10px] 3xl:text-xs font-black text-[#FF6B35]
                                       border border-[#FFE8DC] dark:border-zinc-700 rounded-lg sm:rounded-xl 3xl:rounded-2xl
                                       hover:bg-[#FFF5F0] dark:hover:bg-zinc-800 transition-colors">
                      Revisit
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-5 3xl:mb-6">
              <div className="flex items-center gap-2.5 3xl:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 3xl:w-11 3xl:h-11 rounded-lg sm:rounded-xl 3xl:rounded-2xl
                                bg-[#FFF5F0] dark:bg-zinc-800 border border-[#FFE8DC] dark:border-zinc-700 flex items-center justify-center">
                  <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 3xl:w-5 3xl:h-5 text-[#FF6B35]" />
                </div>
                <h2 className="text-base sm:text-lg 3xl:text-2xl 4xl:text-3xl font-black text-[#1C1917] dark:text-white tracking-tight">
                  Recent Activity
                </h2>
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-xl sm:rounded-2xl 3xl:rounded-3xl overflow-hidden
                            border border-[#FFE8DC] dark:border-zinc-800
                            shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              {[
                { Icon: CheckCircle2, iconBg: 'bg-emerald-50 dark:bg-emerald-950/40', iconColor: 'text-emerald-500',
                  title: 'Bella Cucina Reserved', sub: 'Table #4 for 2 confirmed', time: 'Today', action: 'View' },
                { Icon: Utensils, iconBg: 'bg-[#FFF5F0] dark:bg-zinc-800', iconColor: 'text-[#FF6B35]',
                  title: 'Burger Joint Delivered', sub: '$24.50 · 3 items', time: 'Yesterday', action: 'Review' },
              ].map((item, i) => {
                const Icon = item.Icon;
                return (
                  <div key={i}
                    className="flex items-center gap-3 sm:gap-4 3xl:gap-5
                               p-3.5 sm:p-4 lg:p-5 3xl:p-6
                               border-b border-[#FFF5F0] dark:border-zinc-800 last:border-0
                               hover:bg-[#FFFAF8] dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group">
                    <div className={`w-10 h-10 sm:w-11 sm:h-11 3xl:w-13 3xl:h-13 rounded-xl sm:rounded-2xl 3xl:rounded-3xl flex items-center justify-center shrink-0 ${item.iconBg}`}>
                      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 3xl:w-6 3xl:h-6 ${item.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm 3xl:text-base font-black text-[#1C1917] dark:text-white truncate
                                    group-hover:text-[#FF6B35] transition-colors">{item.title}</p>
                      <p className="text-[10px] sm:text-xs 3xl:text-sm text-[#A8A29E] font-medium mt-0.5 truncate">{item.sub}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
                      <span className="text-[10px] sm:text-[11px] 3xl:text-xs text-[#A8A29E] font-medium">{item.time}</span>
                      <button className="text-[11px] sm:text-xs 3xl:text-sm font-black text-[#FF6B35] hover:text-[#E8521A] transition-colors">
                        {item.action} →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
