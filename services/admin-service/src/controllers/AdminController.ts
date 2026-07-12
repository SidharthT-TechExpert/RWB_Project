import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/AdminService';
import { sendSuccess, sendCreated } from '@quickbite/shared';

export class AdminController {
  async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await adminService.getDashboardStats();
      sendSuccess(res, 'Dashboard stats', stats);
    } catch (error) { next(error); }
  }

  async getPendingRestaurants(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = req.query;
      const result = await adminService.getPendingRestaurants(Number(page) || 1, Number(limit) || 20);
      sendSuccess(res, 'Pending restaurants', result);
    } catch (error) { next(error); }
  }

  async approveRestaurant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await adminService.approveRestaurant(req.params.id, req.user!.userId);
      sendSuccess(res, 'Restaurant approved');
    } catch (error) { next(error); }
  }

  async rejectRestaurant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await adminService.rejectRestaurant(req.params.id, req.user!.userId, req.body.reason);
      sendSuccess(res, 'Restaurant rejected');
    } catch (error) { next(error); }
  }

  async suspendRestaurant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await adminService.suspendRestaurant(req.params.id, req.user!.userId);
      sendSuccess(res, 'Restaurant suspended');
    } catch (error) { next(error); }
  }

  async createCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const coupon = await adminService.createCoupon(req.user!.userId, req.body);
      sendCreated(res, 'Coupon created', coupon);
    } catch (error) { next(error); }
  }

  async getCoupons(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, isActive } = req.query;
      const result = await adminService.getCoupons(Number(page) || 1, Number(limit) || 20, isActive !== undefined ? isActive === 'true' : undefined);
      sendSuccess(res, 'Coupons retrieved', result.coupons, 200, result.meta);
    } catch (error) { next(error); }
  }

  async updateCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const coupon = await adminService.updateCoupon(req.params.id, req.body);
      sendSuccess(res, 'Coupon updated', coupon);
    } catch (error) { next(error); }
  }

  async deleteCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await adminService.deleteCoupon(req.params.id);
      sendSuccess(res, 'Coupon deleted');
    } catch (error) { next(error); }
  }

  async validateCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code, restaurantId, orderAmount } = req.body;
      const result = await adminService.validateCoupon(code, req.user!.userId, restaurantId, orderAmount);
      sendSuccess(res, 'Coupon validated', result);
    } catch (error) { next(error); }
  }
}

export const adminController = new AdminController();
