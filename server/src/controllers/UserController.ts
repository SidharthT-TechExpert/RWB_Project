import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/UserService';
import { sendSuccess } from '../utils/response';

export class UserController {
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Profile retrieved', await userService.getProfile(req.user!.userId)); }
    catch (error) { next(error); }
  }
  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Profile updated', await userService.updateProfile(req.user!.userId, req.body)); }
    catch (error) { next(error); }
  }
  async addAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Address added', await userService.addAddress(req.user!.userId, req.body)); }
    catch (error) { next(error); }
  }
  async updateAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Address updated', await userService.updateAddress(req.user!.userId, req.params.addressId, req.body)); }
    catch (error) { next(error); }
  }
  async deleteAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Address deleted', await userService.deleteAddress(req.user!.userId, req.params.addressId)); }
    catch (error) { next(error); }
  }
  async toggleFavorite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await userService.toggleFavoriteRestaurant(req.user!.userId, req.params.restaurantId);
      sendSuccess(res, result.isFavorite ? 'Added to favorites' : 'Removed from favorites', result);
    } catch (error) { next(error); }
  }
  async getFavorites(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Favorites retrieved', await userService.getFavoriteRestaurants(req.user!.userId)); }
    catch (error) { next(error); }
  }
  async getWalletBalance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Wallet balance', { balance: await userService.getWalletBalance(req.user!.userId) }); }
    catch (error) { next(error); }
  }
  async updateNotificationPrefs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Notification preferences updated', await userService.updateNotificationPreferences(req.user!.userId, req.body)); }
    catch (error) { next(error); }
  }
}

export const userController = new UserController();
