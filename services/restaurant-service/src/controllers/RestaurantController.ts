import { Request, Response, NextFunction } from 'express';
import { restaurantService } from '../services/RestaurantService';
import {
  sendSuccess,
  sendCreated,
  createLogger,
} from '@quickbite/shared';

const logger = createLogger('restaurant-controller');

export class RestaurantController {
  async createRestaurant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = req.user!.userId;
      const restaurant = await restaurantService.createRestaurant(ownerId, req.body);
      sendCreated(res, 'Restaurant created successfully. Pending approval.', restaurant);
    } catch (error) {
      next(error);
    }
  }

  async getRestaurants(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        city,
        cuisineTypes,
        priceRange,
        rating,
        features,
        sortBy,
        page,
        limit,
      } = req.query;

      const result = await restaurantService.getRestaurants({
        city: city as string,
        cuisineTypes: cuisineTypes ? String(cuisineTypes).split(',') : undefined,
        priceRange: priceRange ? String(priceRange).split(',').map(Number) : undefined,
        rating: rating ? Number(rating) : undefined,
        features: features ? String(features).split(',') : undefined,
        sortBy: sortBy as string,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      sendSuccess(res, 'Restaurants retrieved', result.restaurants, 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  async getRestaurantById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const restaurant = await restaurantService.getRestaurantById(id);
      sendSuccess(res, 'Restaurant retrieved', restaurant);
    } catch (error) {
      next(error);
    }
  }

  async getRestaurantBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const restaurant = await restaurantService.getRestaurantBySlug(slug);
      sendSuccess(res, 'Restaurant retrieved', restaurant);
    } catch (error) {
      next(error);
    }
  }

  async getNearbyRestaurants(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { lng, lat, radius, page, limit } = req.query;
      const result = await restaurantService.getNearbyRestaurants({
        longitude: Number(lng),
        latitude: Number(lat),
        radiusKm: radius ? Number(radius) : undefined,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });
      sendSuccess(res, 'Nearby restaurants retrieved', result.restaurants, 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  async getMyRestaurants(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = req.user!.userId;
      const { page, limit } = req.query;
      const result = await restaurantService.getMyRestaurants(
        ownerId,
        page ? Number(page) : undefined,
        limit ? Number(limit) : undefined
      );
      sendSuccess(res, 'Your restaurants retrieved', result.restaurants, 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  async updateRestaurant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const ownerId = req.user!.userId;
      const restaurant = await restaurantService.updateRestaurant(id, ownerId, req.body);
      sendSuccess(res, 'Restaurant updated', restaurant);
    } catch (error) {
      next(error);
    }
  }

  async updateOpeningHours(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const ownerId = req.user!.userId;
      const restaurant = await restaurantService.updateOpeningHours(id, ownerId, req.body.openingHours);
      sendSuccess(res, 'Opening hours updated', restaurant);
    } catch (error) {
      next(error);
    }
  }

  async addTable(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const ownerId = req.user!.userId;
      const restaurant = await restaurantService.addTable(id, ownerId, req.body);
      sendSuccess(res, 'Table added', restaurant);
    } catch (error) {
      next(error);
    }
  }

  async getFeaturedRestaurants(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { limit } = req.query;
      const restaurants = await restaurantService.getFeaturedRestaurants(
        limit ? Number(limit) : undefined
      );
      sendSuccess(res, 'Featured restaurants retrieved', restaurants);
    } catch (error) {
      next(error);
    }
  }

  async searchRestaurants(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q, page, limit } = req.query;
      const result = await restaurantService.searchRestaurants(
        q as string,
        page ? Number(page) : undefined,
        limit ? Number(limit) : undefined
      );
      sendSuccess(res, 'Search results', result.restaurants, 200, result.meta);
    } catch (error) {
      next(error);
    }
  }
}

export const restaurantController = new RestaurantController();
