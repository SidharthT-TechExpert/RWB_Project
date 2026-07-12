import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/UserService';
import { sendSuccess } from '@quickbite/shared';

export class UserController {
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await userService.getProfile(req.user!.userId);
      sendSuccess(res, 'Profile retrieved', profile);
    } catch (error) { next(error); }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await userService.updateProfile(req.user!.userId, req.body);
      sendSuccess(res, 'Profile updated', profile);
    } catch (error) { next(error); }
  }

  async addAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await userService.addAddress(req.user!.userId, req.body);
      sendSuccess(res, 'Address added', profile);
    } catch (error) { next(error); }
  }

  async updateAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await userService.updateAddress(req.user!.userId, req.params.addressId, req.body);
      sendSuccess(res, 'Address updated', profile);
    } catch (error) { next(error); }
  }

  async deleteAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await userService.deleteAddress(req.user!.userId, req.params.addressId);
      sendSuccess(res, 'Address deleted', profile);
    } catch (error) { next(error); }
  }

  async toggleFavoriteRestaurant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await userService.toggleFavoriteRestaurant(req.user!.userId, req.params.restaurantId);
      sendSuccess(res, result.isFavorite ? 'Added to favorites' : 'Removed from favorites', result);
    } catch (error) { next(error); }
  }

  async getFavorites(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const favorites = await userService.getFavoriteRestaurants(req.user!.userId);
      sendSuccess(res, 'Favorites retrieved', favorites);
    } catch (error) { next(error); }
  }

  async getWalletBalance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const balance = await userService.getWalletBalance(req.user!.userId);
      sendSuccess(res, 'Wallet balance', { balance });
    } catch (error) { next(error); }
  }

  async updateNotificationPreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await userService.updateNotificationPreferences(req.user!.userId, req.body);
      sendSuccess(res, 'Notification preferences updated', profile);
    } catch (error) { next(error); }
  }
}

export const userController = new UserController();
