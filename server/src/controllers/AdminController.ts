import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/AdminService';
import { bankVerificationService } from '../services/BankVerificationService';
import { sendSuccess, sendCreated } from '../utils/response';

export class AdminController {
  async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Dashboard stats', await adminService.getDashboardStats()); }
    catch (error) { next(error); }
  }
  async getPendingRestaurants(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminService.getPendingRestaurants(Number(req.query.page) || 1, Number(req.query.limit) || 20);
      sendSuccess(res, 'Pending restaurants', result.restaurants, 200, result.meta);
    } catch (error) { next(error); }
  }
  async approveRestaurant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { await adminService.approveRestaurant(req.params.id, req.user!.userId); sendSuccess(res, 'Restaurant approved'); }
    catch (error) { next(error); }
  }
  async rejectRestaurant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { await adminService.rejectRestaurant(req.params.id, req.user!.userId, req.body.reason); sendSuccess(res, 'Restaurant rejected'); }
    catch (error) { next(error); }
  }
  async suspendRestaurant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { await adminService.suspendRestaurant(req.params.id, req.user!.userId); sendSuccess(res, 'Restaurant suspended'); }
    catch (error) { next(error); }
  }
  async createCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendCreated(res, 'Coupon created', await adminService.createCoupon(req.user!.userId, req.body)); }
    catch (error) { next(error); }
  }
  async getCoupons(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, isActive } = req.query;
      const result = await adminService.getCoupons(Number(page) || 1, Number(limit) || 20, isActive !== undefined ? isActive === 'true' : undefined);
      sendSuccess(res, 'Coupons retrieved', result.coupons, 200, result.meta);
    } catch (error) { next(error); }
  }
  async updateCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Coupon updated', await adminService.updateCoupon(req.params.id, req.body)); }
    catch (error) { next(error); }
  }
  async deleteCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { await adminService.deleteCoupon(req.params.id); sendSuccess(res, 'Coupon deleted'); }
    catch (error) { next(error); }
  }
  async validateCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code, restaurantId, orderAmount } = req.body;
      sendSuccess(res, 'Coupon validated', await adminService.validateCoupon(code, req.user!.userId, restaurantId, orderAmount));
    } catch (error) { next(error); }
  }

  async getBankRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, page, limit } = req.query;
      const result = await bankVerificationService.getAdminBankRequests(
        status as string | undefined,
        Number(page) || 1,
        Number(limit) || 20
      );
      sendSuccess(res, 'Bank verification requests retrieved', result.requests, 200, result.meta);
    } catch (error) { next(error); }
  }

  async approveBankRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminId = req.user!.userId;
      const { id } = req.params;
      const { adminNotes } = req.body;
      const updated = await bankVerificationService.approveBankRequest(id, adminId, adminNotes);
      sendSuccess(res, 'Bank details approved and activated successfully', updated);
    } catch (error) { next(error); }
  }

  async rejectBankRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminId = req.user!.userId;
      const { id } = req.params;
      const { reason } = req.body;
      const updated = await bankVerificationService.rejectBankRequest(id, adminId, reason);
      sendSuccess(res, 'Bank verification request rejected', updated);
    } catch (error) { next(error); }
  }
}

export const adminController = new AdminController();
