import { useState, useEffect } from 'react';

/* ─── Types ───────────────────────────────────────────────────── */
export interface UserLocation {
  city: string;
  state: string;
  country: string;
  display: string;         // e.g. "Kannur, Kerala"
  lat?: number;
  lon?: number;
  isManual?: boolean;
}

type LocationStatus = 'idle' | 'loading' | 'success' | 'error' | 'denied';

interface UseUserLocationResult {
  location:    UserLocation | null;
  status:      LocationStatus;
  error:       string | null;
  refresh:     () => void;
  setManual:   (display: string) => void;
}

const STORAGE_KEY = 'quickbite_user_location';

/* ─── Reverse geocoding via OpenStreetMap Nominatim ─────────── */
async function reverseGeocode(lat: number, lon: number): Promise<UserLocation> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&accept-language=en`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'QuickBite-App/1.0 (contact@quickbite.app)' },
  });
  if (!res.ok) throw new Error('Reverse geocoding failed');
  const json = await res.json();

  const addr = json.address || {};

  const locality =
    addr.suburb ||
    addr.town ||
    addr.city ||
    addr.village ||
    addr.municipality ||
    addr.neighbourhood ||
    addr.state_district ||
    'Your City';

  const cleanLocality = locality.replace(/ District$/i, '').trim();
  const district = (addr.state_district || addr.county || '').replace(/ District$/i, '').trim();
  const state = addr.state || addr.region || '';
  const country = addr.country_code?.toUpperCase() || addr.country || 'IN';

  const parts = [
    cleanLocality,
    district && district !== cleanLocality ? district : '',
    state,
  ].filter(Boolean);

  const display = parts.length > 0 ? parts.join(', ') : cleanLocality;

  return { city: cleanLocality, state, country, display, lat, lon, isManual: false };
}

/* ─── Main hook ──────────────────────────────────────────────── */
export function useUserLocation(): UseUserLocationResult {
  const [location, setLocation] = useState<UserLocation | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          return {
            city: saved.split(',')[0].trim(),
            state: saved.split(',')[1]?.trim() || '',
            country: 'India',
            display: saved,
            isManual: true,
          };
        }
      } catch {}
    }
    return null;
  });
  const [status,   setStatus  ] = useState<LocationStatus>('idle');
  const [error,    setError   ] = useState<string | null>(null);
  const [trigger,  setTrigger ] = useState(0);   // increment to re-fetch

  const setManual = (display: string) => {
    if (!display.trim()) return;
    const parts = display.split(',');
    const newLoc: UserLocation = {
      city: parts[0]?.trim() || display,
      state: parts[1]?.trim() || 'Kerala',
      country: 'India',
      display,
      isManual: true,
    };
    setLocation(newLoc);
    setStatus('success');
    try {
      localStorage.setItem(STORAGE_KEY, display);
    } catch {}
  };

  useEffect(() => {
    // If user already picked manual location and trigger is 0 (initial load), keep user's manual choice
    if (location?.isManual && trigger === 0) {
      setStatus('success');
      return;
    }

    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setStatus('error');
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setStatus('loading');
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude: lat, longitude: lon } = position.coords;
          const loc = await reverseGeocode(lat, lon);
          setLocation(loc);
          setStatus('success');
          try {
            localStorage.setItem(STORAGE_KEY, loc.display);
          } catch {}
        } catch {
          setStatus('error');
          setError('Could not determine your city. Please select your city manually.');
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus('denied');
          setError('Location permission denied.');
        } else {
          setStatus('error');
          setError('Could not get your location.');
        }
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 },
    );
  }, [trigger]);

  const refresh = () => setTrigger((t) => t + 1);

  return { location, status, error, refresh, setManual };
}
