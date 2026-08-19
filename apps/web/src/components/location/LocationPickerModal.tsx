'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Search,
  Crosshair,
  X,
  Check,
  Navigation,
  Loader2,
  Map as MapIcon,
  Compass,
  Building,
  Sparkles,
} from 'lucide-react';
import { LocationSuggestionItem, popularLocations, cleanPlaceName } from '@/lib/locationData';
import { useUserLocation } from '@/hooks/useUserLocation';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: string;
  onSelectLocation: (locationStr: string) => void;
}

export function LocationPickerModal({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
}: LocationPickerModalProps) {
  const { location: userGeo, status: geoStatus, refresh: refreshGeo, setManual } = useUserLocation();
  const [searchInput, setSearchInput] = useState('');
  const [selectedDisplay, setSelectedDisplay] = useState(currentLocation || '');
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lon: number }>({
    lat: 11.1444, // Malappuram / Central Kerala default
    lon: 75.9625,
  });
  const [remoteResults, setRemoteResults] = useState<LocationSuggestionItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync with current location prop when opened
  useEffect(() => {
    if (isOpen) {
      setSearchInput('');
      if (currentLocation && !currentLocation.toLowerCase().includes('thekkinezhath')) {
        setSelectedDisplay(currentLocation);
      }
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, currentLocation]);

  // Debounced Places Geocoding
  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed.length < 2) {
      setRemoteResults([]);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&lat=10.8505&lon=76.2711&limit=10&lang=en`;
        const res = await fetch(photonUrl, { signal: controller.signal });
        if (res.ok) {
          const data = await res.json();
          if (data && data.features && data.features.length > 0) {
            const seen = new Set<string>();
            const items: LocationSuggestionItem[] = [];

            for (const f of data.features) {
              const p = f.properties || {};
              const rawName = p.name || p.city || p.town || p.district || '';
              if (!rawName) continue;

              const name = cleanPlaceName(rawName);
              const district = (p.district || p.county || '').replace(/ District$/i, '').trim();
              const state = p.state || 'Kerala';
              const country = p.country || 'India';

              if (country !== 'India' && !trimmed.toLowerCase().includes(country.toLowerCase())) {
                continue;
              }

              const dedupeKey = `${name.toLowerCase()}-${(district || state).toLowerCase()}`;
              if (seen.has(dedupeKey)) continue;
              seen.add(dedupeKey);

              const subParts = [district && district !== name ? `${district} District` : '', state].filter(Boolean);
              const display = [name, district && district !== name ? district : '', state].filter(Boolean).join(', ');

              const coords = f.geometry?.coordinates || [76.27, 10.85];

              items.push({
                city: name,
                district,
                state,
                country,
                subtitle: subParts.join(', '),
                display,
              });
            }

            if (items.length > 0) {
              setRemoteResults(items);
              setIsSearching(false);
              return;
            }
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          // ignore
        }
      } finally {
        setIsSearching(false);
      }
    }, 120);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchInput]);

  const handlePickLocation = (locStr: string) => {
    setSelectedDisplay(locStr);
    onSelectLocation(locStr);
    setManual(locStr);
    onClose();
  };

  const handleUseCurrentGPS = () => {
    refreshGeo();
  };

  useEffect(() => {
    if (userGeo?.display && isOpen) {
      setSelectedDisplay(userGeo.display);
      if (userGeo.lat && userGeo.lon) {
        setSelectedCoords({ lat: userGeo.lat, lon: userGeo.lon });
      }
    }
  }, [userGeo, isOpen]);

  // Quick Kerala hotspots
  const quickHotspots = [
    { name: 'Vengara', district: 'Malappuram', display: 'Vengara, Malappuram, Kerala' },
    { name: 'Kakkancheri', district: 'Malappuram', display: 'Kakkancheri, Malappuram, Kerala' },
    { name: 'Malappuram', district: 'Malappuram', display: 'Malappuram, Kerala' },
    { name: 'Chelari', district: 'Malappuram', display: 'Chelari, Malappuram, Kerala' },
    { name: 'Kozhikode', district: 'Kozhikode', display: 'Kozhikode (Calicut), Kerala' },
    { name: 'Mooriyad', district: 'Kannur', display: 'Mooriyad, Kannur, Kerala' },
    { name: 'Kannur', district: 'Kannur', display: 'Kannur, Kerala' },
    { name: 'Manjeri', district: 'Malappuram', display: 'Manjeri, Malappuram, Kerala' },
    { name: 'Kottakkal', district: 'Malappuram', display: 'Kottakkal, Malappuram, Kerala' },
    { name: 'Kochi', district: 'Ernakulam', display: 'Kochi (Cochin), Kerala' },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
        {/* Backdrop click to close */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-xl bg-[#141210] border border-[#2E2722] rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.95),0_0_50px_rgba(255,107,53,0.15)] overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#26201B]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FF6B35]/15 border border-[#FF6B35]/30 flex items-center justify-center text-[#FF6B35]">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-white">Choose Your Exact Location</h3>
                <p className="text-xs text-[#8E8782] font-medium">Select your town or area for precise restaurant availability</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-4 sm:p-5 border-b border-[#26201B] space-y-3">
            <div className="flex items-center gap-3 bg-[#1C1815] border border-[#2E2722] focus-within:border-[#FF6B35] rounded-2xl px-4 py-3 shadow-inner transition-all">
              <Search className="w-5 h-5 text-[#FF6B35] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search town, landmark, village, or district..."
                className="w-full bg-transparent text-sm sm:text-base font-medium text-white placeholder-[#8E8782] outline-none"
              />
              {searchInput ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    inputRef.current?.focus();
                  }}
                  className="p-1 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : isSearching ? (
                <Loader2 className="w-4 h-4 text-[#FF6B35] animate-spin shrink-0" />
              ) : null}
            </div>

            {/* GPS Detection Bar */}
            <button
              type="button"
              onClick={handleUseCurrentGPS}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#1A1613] hover:bg-[#241E19] border border-[#2E2722] hover:border-[#FF6B35]/40 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#FF6B35]/20 text-[#FF6B35] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Crosshair className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs sm:text-sm text-white block">Auto-Detect Current Location (GPS)</span>
                  <span className="text-[11px] text-[#8E8782] block">Uses browser sensors and Wi-Fi</span>
                </div>
              </div>
              {geoStatus === 'loading' ? (
                <Loader2 className="w-4 h-4 text-[#FF6B35] animate-spin" />
              ) : (
                <Navigation className="w-4 h-4 text-[#FF6B35] opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar">
            {/* Search Results (if user is typing) */}
            {searchInput.trim() ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#8E8782] px-1">
                  <span>Search Results</span>
                  <span>{remoteResults.length} found</span>
                </div>

                {remoteResults.length > 0 ? (
                  remoteResults.map((item, idx) => (
                    <button
                      key={`res-${item.display}-${idx}`}
                      type="button"
                      onClick={() => handlePickLocation(item.display)}
                      className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#1C1815] hover:bg-[#26201B] border border-[#2E2722] hover:border-[#FF6B35]/40 text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-[#FF6B35]/15 text-[#FF6B35] flex items-center justify-center shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="truncate min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{item.city}</span>
                            {item.district && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase bg-[#FF6B35]/20 text-[#FF6B35] border border-[#FF6B35]/30">
                                {item.district}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-[#8E8782] block truncate mt-0.5">{item.subtitle}</span>
                        </div>
                      </div>
                      <Check className="w-4 h-4 text-[#FF6B35] opacity-0 group-hover:opacity-100 shrink-0" />
                    </button>
                  ))
                ) : !isSearching ? (
                  <button
                    type="button"
                    onClick={() => handlePickLocation(`${searchInput.trim()}, Kerala`)}
                    className="w-full p-4 rounded-2xl bg-[#1C1815] border border-[#2E2722] text-left hover:border-[#FF6B35]/50 transition-all cursor-pointer"
                  >
                    <span className="text-xs text-zinc-400 block">No pre-indexed place found. Set manually:</span>
                    <span className="text-sm font-bold text-white block mt-1">Use &quot;{searchInput}&quot; as my location</span>
                  </button>
                ) : null}
              </div>
            ) : (
              /* Quick Popular Town Selection */
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#FF6B35] mb-2.5 px-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Popular Towns & Districts</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {quickHotspots.map((spot) => {
                      const isSelected = selectedDisplay.toLowerCase().includes(spot.name.toLowerCase());
                      return (
                        <button
                          key={spot.name}
                          type="button"
                          onClick={() => handlePickLocation(spot.display)}
                          className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-[#FF6B35]/20 border-[#FF6B35] text-white shadow-[0_0_15px_rgba(255,107,53,0.2)]'
                              : 'bg-[#1C1815] hover:bg-[#241E1A] border-[#2A231E] hover:border-[#3D332B] text-zinc-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-extrabold text-sm text-white">{spot.name}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#FF6B35]" />}
                          </div>
                          <span className="text-[10px] text-[#8E8782] font-semibold">{spot.district}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Active Card */}
                {selectedDisplay && (
                  <div className="p-3.5 rounded-2xl bg-[#1C1815] border border-[#2E2722] flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4" />
                      </div>
                      <div className="truncate min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">Active Location</span>
                        <span className="text-xs sm:text-sm font-bold text-white truncate block">{selectedDisplay}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePickLocation(selectedDisplay)}
                      className="px-3.5 py-1.5 bg-[#FF6B35] hover:bg-[#FF551A] text-white text-xs font-bold rounded-xl transition-all shadow-md shrink-0 ml-2"
                    >
                      Confirm
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
