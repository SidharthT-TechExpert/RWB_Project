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
  location:      UserLocation | null;
  status:        LocationStatus;
  error:         string | null;
  refresh:       () => void;
  setManual:     (display: string) => void;
  clearLocation: () => void;
}

const STORAGE_KEY = 'quickbite_user_location';

/* ─── Reverse geocoding via Multi-Source (BigDataCloud + OpenStreetMap Nominatim zoom=14) ─── */
async function reverseGeocode(lat: number, lon: number): Promise<UserLocation> {
  // 1. Try BigDataCloud API first (Clean locality & town names in India/Kerala)
  try {
    const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const bdcRes = await fetch(bdcUrl);
    if (bdcRes.ok) {
      const bdc = await bdcRes.json();
      const city = bdc.locality || bdc.city || bdc.principalSubdivisionDescription || '';
      const district = bdc.localityInfo?.administrative?.find(
        (a: any) => a.adminLevel === 6 || a.description?.includes('District')
      )?.name?.replace(/ District$/i, '') || '';
      const state = bdc.principalSubdivision || 'Kerala';
      const country = bdc.countryName || 'India';

      if (city && !city.toLowerCase().includes('thekkinezhath')) {
        const parts = [city, district && district !== city ? district : '', state].filter(Boolean);
        const display = parts.join(', ');
        return { city, state, country, display, lat, lon, isManual: false };
      }
    }
  } catch {}

  // 2. Fallback to OpenStreetMap Nominatim with zoom=14 (town/city scale)
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&zoom=14&format=json&addressdetails=1&accept-language=en`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'QuickBite-App/1.0 (contact@quickbite.app)' },
    });
    if (res.ok) {
      const json = await res.json();
      const addr = json.address || {};

      // Prioritize city -> town -> municipality -> village over micro-compounds
      const rawLocality =
        addr.city ||
        addr.town ||
        addr.municipality ||
        addr.village ||
        addr.county ||
        addr.state_district ||
        'Kerala';

      const locality = rawLocality.toLowerCase().includes('thekkinezhath')
        ? (addr.city || addr.town || addr.state_district || 'Kerala')
        : rawLocality;

      const cleanLocality = locality.replace(/ District$/i, '').trim();
      const district = (addr.state_district || addr.county || '').replace(/ District$/i, '').trim();
      const state = addr.state || addr.region || 'Kerala';
      const country = addr.country || 'India';

      const parts = [
        cleanLocality,
        district && district !== cleanLocality ? district : '',
        state,
      ].filter(Boolean);

      const display = parts.length > 0 ? parts.join(', ') : cleanLocality;

      return { city: cleanLocality, state, country, display, lat, lon, isManual: false };
    }
  } catch {}

  return { city: 'Kerala', state: 'Kerala', country: 'India', display: 'Kerala, India', lat, lon, isManual: false };
}

/* ─── Main hook ──────────────────────────────────────────────── */
export function useUserLocation(): UseUserLocationResult {
  const [location, setLocation] = useState<UserLocation | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && !saved.toLowerCase().includes('thekkinezhath')) {
          return {
            city: saved.split(',')[0].trim(),
            state: saved.split(',')[1]?.trim() || '',
            country: 'India',
            display: saved,
            isManual: true,
          };
        } else if (saved) {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {}
    }
    return null;
  });
  const [status,   setStatus  ] = useState<LocationStatus>(() => (location ? 'success' : 'idle'));
  const [error,    setError   ] = useState<string | null>(null);
  const [trigger,  setTrigger ] = useState(0);   // increment to re-fetch on user demand

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

  const clearLocation = () => {
    setLocation(null);
    setStatus('idle');
    setError(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

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
    // Only run GPS when explicitly requested by user (trigger > 0)
    if (trigger === 0) {
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

  return { location, status, error, refresh, setManual, clearLocation };
}
