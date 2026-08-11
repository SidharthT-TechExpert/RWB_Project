import { useState, useEffect } from 'react';

/* ─── Types ───────────────────────────────────────────────────── */
export interface UserLocation {
  city: string;
  state: string;
  country: string;
  display: string;         // e.g. "Kozhikode, Kerala"
  lat: number;
  lon: number;
}

type LocationStatus = 'idle' | 'loading' | 'success' | 'error' | 'denied';

interface UseUserLocationResult {
  location:  UserLocation | null;
  status:    LocationStatus;
  error:     string | null;
  refresh:   () => void;
}

/* ─── Reverse geocoding via OpenStreetMap Nominatim ─────────── */
async function reverseGeocode(lat: number, lon: number): Promise<UserLocation> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`;
  const res  = await fetch(url, {
    headers: { 'User-Agent': 'QuickBite-App/1.0 (contact@quickbite.app)' },
  });
  if (!res.ok) throw new Error('Reverse geocoding failed');
  const json = await res.json();

  const addr = json.address || {};

  /*
   * Priority for city-level name (most → least specific at the right level):
   *  city            — large cities (Mumbai, Delhi, Bangalore…)
   *  town            — medium towns
   *  municipality    — municipality / nagar panchayat
   *  city_district   — city sub-district (Nominatim uses this in some countries)
   *  state_district  — revenue district (e.g. "Kozhikode") ← key for Indian addresses
   *  county          — county / taluk
   *  village         — last resort (can be a tiny hamlet)
   */
  const city =
    addr.city          ||
    addr.town          ||
    addr.municipality  ||
    addr.city_district ||
    addr.state_district||
    addr.county        ||
    addr.village       ||
    'Your City';

  // Clean up common suffixes like " District" for tidy display
  const cleanCity = city.replace(/ District$/i, '').trim();

  const state   = addr.state  || addr.region || '';
  const country = addr.country_code?.toUpperCase() || addr.country || '';

  const display = state ? `${cleanCity}, ${state}` : cleanCity;

  return { city: cleanCity, state, country, display, lat, lon };
}

/* ─── Main hook ──────────────────────────────────────────────── */
export function useUserLocation(): UseUserLocationResult {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [status,   setStatus  ] = useState<LocationStatus>('idle');
  const [error,    setError   ] = useState<string | null>(null);
  const [trigger,  setTrigger ] = useState(0);   // increment to re-fetch

  useEffect(() => {
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
        } catch {
          setStatus('error');
          setError('Could not determine your city. Please try again.');
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
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60_000 },
    );
  }, [trigger]);
  const refresh = () => setTrigger(t => t + 1);

  return { location, status, error, refresh };
}
