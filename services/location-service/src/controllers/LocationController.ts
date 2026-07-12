import { Request, Response, NextFunction } from 'express';
import { locationService } from '../services/LocationService';
import { sendSuccess } from '@quickbite/shared';

export class LocationController {
  async geocode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { address } = req.query;
      const coords = await locationService.geocode(address as string);
      sendSuccess(res, 'Geocode result', coords);
    } catch (error) { next(error); }
  }

  async reverseGeocode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { lat, lng } = req.query;
      const address = await locationService.reverseGeocode(Number(lat), Number(lng));
      sendSuccess(res, 'Address retrieved', { address });
    } catch (error) { next(error); }
  }

  async searchPlaces(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q, lat, lng } = req.query;
      const location = lat && lng ? { lat: Number(lat), lng: Number(lng) } : undefined;
      const places = await locationService.searchPlaces(q as string, location);
      sendSuccess(res, 'Places found', places);
    } catch (error) { next(error); }
  }

  async getDistanceMatrix(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { originLat, originLng, destinations } = req.body;
      const origin = { lat: Number(originLat), lng: Number(originLng) };
      const dests = JSON.parse(destinations);
      const results = await locationService.getDistanceMatrix(origin, dests);
      sendSuccess(res, 'Distance matrix', results);
    } catch (error) { next(error); }
  }

  async calculateDistance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { lat1, lng1, lat2, lng2 } = req.query;
      const distance = locationService.getHaversineDistance(
        { lat: Number(lat1), lng: Number(lng1) },
        { lat: Number(lat2), lng: Number(lng2) }
      );
      const eta = locationService.calculateETAMinutes(distance * 1000);
      sendSuccess(res, 'Distance calculated', { distance: `${distance.toFixed(2)} km`, eta: `${eta} mins` });
    } catch (error) { next(error); }
  }
}

export const locationController = new LocationController();
