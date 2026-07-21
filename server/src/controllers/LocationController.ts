import { Request, Response, NextFunction } from 'express';
import { locationService } from '../services/LocationService';
import { sendSuccess } from '../utils/response';

export class LocationController {
  async geocode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Geocode result', await locationService.geocode(req.query.address as string)); }
    catch (error) { next(error); }
  }
  async reverseGeocode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Address retrieved', { address: await locationService.reverseGeocode(Number(req.query.lat), Number(req.query.lng)) }); }
    catch (error) { next(error); }
  }
  async searchPlaces(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q, lat, lng } = req.query;
      const location = lat && lng ? { lat: Number(lat), lng: Number(lng) } : undefined;
      sendSuccess(res, 'Places found', await locationService.searchPlaces(q as string, location));
    } catch (error) { next(error); }
  }
  async calculateDistance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { lat1, lng1, lat2, lng2 } = req.query;
      const distance = locationService.getHaversineDistance({ lat: Number(lat1), lng: Number(lng1) }, { lat: Number(lat2), lng: Number(lng2) });
      const eta = locationService.calculateETAMinutes(distance * 1000);
      sendSuccess(res, 'Distance calculated', { distance: `${distance.toFixed(2)} km`, eta: `${eta} mins` });
    } catch (error) { next(error); }
  }
}

export const locationController = new LocationController();
