import { Request, Response, NextFunction } from 'express';
import { restaurantService } from '../services/RestaurantService';
import { sendSuccess, sendCreated } from '../utils/response';

export class RestaurantController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendCreated(res, 'Restaurant created. Pending approval.', await restaurantService.createRestaurant(req.user!.userId, req.body)); }
    catch (error) { next(error); }
  }
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, city, cuisineTypes, priceRange, rating, features, sortBy, page, limit } = req.query;
      const result = await restaurantService.getRestaurants({
        status: status as string,
        city: city as string,
        cuisineTypes: cuisineTypes ? String(cuisineTypes).split(',') : undefined,
        priceRange: priceRange ? String(priceRange).split(',').map(Number) : undefined,
        rating: rating ? Number(rating) : undefined,
        features: features ? String(features).split(',') : undefined,
        sortBy: sortBy as string, page: page ? Number(page) : undefined, limit: limit ? Number(limit) : undefined,
      });
      sendSuccess(res, 'Restaurants retrieved', result.restaurants, 200, result.meta);
    } catch (error) { next(error); }
  }
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Restaurant retrieved', await restaurantService.getRestaurantById(req.params.id)); }
    catch (error) { next(error); }
  }
  async getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Restaurant retrieved', await restaurantService.getRestaurantBySlug(req.params.slug)); }
    catch (error) { next(error); }
  }
  async getNearby(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { lng, lat, radius, page, limit } = req.query;
      const result = await restaurantService.getNearbyRestaurants({ longitude: Number(lng), latitude: Number(lat), radiusKm: radius ? Number(radius) : undefined, page: page ? Number(page) : undefined, limit: limit ? Number(limit) : undefined });
      sendSuccess(res, 'Nearby restaurants', result.restaurants, 200, result.meta);
    } catch (error) { next(error); }
  }
  async getMyRestaurants(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = req.query;
      const result = await restaurantService.getMyRestaurants(req.user!.userId, page ? Number(page) : undefined, limit ? Number(limit) : undefined);
      sendSuccess(res, 'Your restaurants', result.restaurants, 200, result.meta);
    } catch (error) { next(error); }
  }
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Restaurant updated', await restaurantService.updateRestaurant(req.params.id, req.user!.userId, req.body)); }
    catch (error) { next(error); }
  }
  async addTable(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, role } = req.user!;
      sendSuccess(res, 'Table added', await restaurantService.addTable(req.params.id, userId, req.body, role));
    }
    catch (error) { next(error); }
  }

  async updateTableAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, role } = req.user!;
      const { tableNumber } = req.params;
      const { isAvailable } = req.body;
      if (typeof isAvailable !== 'boolean') {
        res.status(400).json({ success: false, message: 'isAvailable must be a boolean' });
        return;
      }
      sendSuccess(
        res,
        isAvailable ? 'Table listed as available' : 'Table unlisted',
        await restaurantService.updateTableAvailability(req.params.id, tableNumber, isAvailable, role)
      );
    } catch (error) { next(error); }
  }
  async getFeatured(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Featured restaurants', await restaurantService.getFeaturedRestaurants(req.query.limit ? Number(req.query.limit) : undefined)); }
    catch (error) { next(error); }
  }
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q, page, limit } = req.query;
      const result = await restaurantService.searchRestaurants(q as string, page ? Number(page) : undefined, limit ? Number(limit) : undefined);
      sendSuccess(res, 'Search results', result.restaurants, 200, result.meta);
    } catch (error) { next(error); }
  }
}

export const restaurantController = new RestaurantController();
