import axios from 'axios';
import {
  setCache,
  getCache,
  CACHE_TTL,
  calculateDistance,
  createLogger,
} from '@quickbite/shared';

const logger = createLogger('location-service');
const MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';
const MAPS_BASE = 'https://maps.googleapis.com/maps/api';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface PlaceResult {
  placeId: string;
  name: string;
  address: string;
  location: Coordinates;
  types: string[];
}

export interface DistanceResult {
  distance: { text: string; value: number };
  duration: { text: string; value: number };
}

export class LocationService {
  async geocode(address: string): Promise<Coordinates | null> {
    const cacheKey = `geocode:${address}`;
    const cached = await getCache<Coordinates>(cacheKey);
    if (cached) return cached;

    try {
      const res = await axios.get(`${MAPS_BASE}/geocode/json`, {
        params: { address, key: MAPS_API_KEY },
      });

      if (res.data.status === 'OK' && res.data.results.length > 0) {
        const loc = res.data.results[0].geometry.location;
        const coords: Coordinates = { lat: loc.lat, lng: loc.lng };
        await setCache(cacheKey, coords, CACHE_TTL.VERY_LONG);
        return coords;
      }
      return null;
    } catch (err) {
      logger.error('Geocode failed:', err);
      return null;
    }
  }

  async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    const cacheKey = `reverse:${lat},${lng}`;
    const cached = await getCache<string>(cacheKey);
    if (cached) return cached;

    try {
      const res = await axios.get(`${MAPS_BASE}/geocode/json`, {
        params: { latlng: `${lat},${lng}`, key: MAPS_API_KEY },
      });

      if (res.data.status === 'OK' && res.data.results.length > 0) {
        const address: string = res.data.results[0].formatted_address;
        await setCache(cacheKey, address, CACHE_TTL.VERY_LONG);
        return address;
      }
      return null;
    } catch (err) {
      logger.error('Reverse geocode failed:', err);
      return null;
    }
  }

  async searchPlaces(query: string, location?: Coordinates): Promise<PlaceResult[]> {
    const cacheKey = `places:${query}:${location?.lat},${location?.lng}`;
    const cached = await getCache<PlaceResult[]>(cacheKey);
    if (cached) return cached;

    try {
      const params: Record<string, string> = {
        input: query,
        types: 'establishment',
        key: MAPS_API_KEY,
      };

      if (location) {
        params.location = `${location.lat},${location.lng}`;
        params.radius = '50000';
      }

      const res = await axios.get(`${MAPS_BASE}/place/autocomplete/json`, { params });

      const results: PlaceResult[] = res.data.predictions.map((p: {
        place_id: string;
        description: string;
        types?: string[];
      }) => ({
        placeId: p.place_id,
        name: p.description.split(',')[0],
        address: p.description,
        location: { lat: 0, lng: 0 },
        types: p.types || [],
      }));

      await setCache(cacheKey, results, CACHE_TTL.SHORT);
      return results;
    } catch (err) {
      logger.error('Places search failed:', err);
      return [];
    }
  }

  async getDistanceMatrix(
    origin: Coordinates,
    destinations: Coordinates[]
  ): Promise<DistanceResult[]> {
    if (!destinations.length) return [];

    const origStr = `${origin.lat},${origin.lng}`;
    const destStr = destinations.map((d) => `${d.lat},${d.lng}`).join('|');

    try {
      const res = await axios.get(`${MAPS_BASE}/distancematrix/json`, {
        params: {
          origins: origStr,
          destinations: destStr,
          units: 'metric',
          key: MAPS_API_KEY,
        },
      });

      if (res.data.status === 'OK') {
        return res.data.rows[0].elements.map((el: {
          distance: { text: string; value: number };
          duration: { text: string; value: number };
        }) => ({
          distance: el.distance,
          duration: el.duration,
        }));
      }
      return [];
    } catch (err) {
      logger.error('Distance matrix failed:', err);
      // Fallback to Haversine
      return destinations.map((dest) => {
        const km = calculateDistance(origin.lat, origin.lng, dest.lat, dest.lng);
        return {
          distance: { text: `${km.toFixed(1)} km`, value: Math.round(km * 1000) },
          duration: { text: `${Math.round(km * 3)} mins`, value: Math.round(km * 3 * 60) },
        };
      });
    }
  }

  calculateETAMinutes(distanceMeters: number, speedKmh = 30): number {
    const distanceKm = distanceMeters / 1000;
    return Math.ceil((distanceKm / speedKmh) * 60);
  }

  getHaversineDistance(from: Coordinates, to: Coordinates): number {
    return calculateDistance(from.lat, from.lng, to.lat, to.lng);
  }
}

export const locationService = new LocationService();
