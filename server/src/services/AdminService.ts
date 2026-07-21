import { Coupon, ICoupon } from '../models/Coupon';
import { Restaurant } from '../models/Restaurant';
import { User } from '../models/User';
import { Order } from '../models/Order';
import { Booking } from '../models/Booking';
import { restaurantService } from './RestaurantService';
import { NotFoundError, AppError } from '../errors';
import { RESTAURANT_STATUS } from '../constants';
import { getPaginationParams, buildPaginationMeta } from '../utils';
import { logger } from '../config/logger';

export class AdminService {
  async getDashboardStats() {
    const [totalUsers, totalRestaurants, pendingRestaurants, activeCoupons, totalOrders, totalBookings] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Restaurant.countDocuments({ status: RESTAURANT_STATUS.ACTIVE }),
      Restaurant.countDocuments({ status: RESTAURANT_STATUS.PENDING }),
      Coupon.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Booking.countDocuments(),
    ]);
    return { totalUsers, totalRestaurants, pendingRestaurants, activeCoupons, totalOrders, totalBookings, timestamp: new Date().toISOString() };
  }

  async getPendingRestaurants(page = 1, limit = 20) {
    const { skip } = getPaginationParams(page, limit);
    const [restaurants, total] = await Promise.all([
      Restaurant.find({ status: RESTAURANT_STATUS.PENDING }).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Restaurant.countDocuments({ status: RESTAURANT_STATUS.PENDING }),
    ]);
    return { restaurants, meta: buildPaginationMeta(page, limit, total) };
  }

  async approveRestaurant(restaurantId: string, adminId: string): Promise<void> {
    await restaurantService.approveRestaurant(restaurantId);
    logger.info(`Restaurant ${restaurantId} approved by admin ${adminId}`);
  }

  async rejectRestaurant(restaurantId: string, _adminId: string, reason: string): Promise<void> {
    await Restaurant.findByIdAndUpdate(restaurantId, { status: RESTAURANT_STATUS.REJECTED });
    logger.info(`Restaurant ${restaurantId} rejected. Reason: ${reason}`);
  }

  async suspendRestaurant(restaurantId: string, adminId: string): Promise<void> {
    await restaurantService.suspendRestaurant(restaurantId);
    logger.info(`Restaurant ${restaurantId} suspended by admin ${adminId}`);
  }

  async createCoupon(adminId: string, data: Partial<ICoupon>): Promise<ICoupon> {
    const existing = await Coupon.findOne({ code: data.code });
    if (existing) throw new AppError('Coupon code already exists', 409);
    return Coupon.create({ ...data, createdBy: adminId });
  }

  async getCoupons(page = 1, limit = 20, isActive?: boolean) {
    const { skip } = getPaginationParams(page, limit);
    const filter: Record<string, unknown> = {};
    if (isActive !== undefined) filter.isActive = isActive;
    const [coupons, total] = await Promise.all([
      Coupon.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Coupon.countDocuments(filter),
    ]);
    return { coupons, meta: buildPaginationMeta(page, limit, total) };
  }

  async updateCoupon(id: string, data: Partial<ICoupon>): Promise<ICoupon> {
    const coupon = await Coupon.findByIdAndUpdate(id, data, { new: true });
    if (!coupon) throw new NotFoundError('Coupon');
    return coupon;
  }

  async deleteCoupon(id: string): Promise<void> {
    await Coupon.findByIdAndDelete(id);
  }

  async validateCoupon(code: string, _userId: string, restaurantId: string, orderAmount: number): Promise<{ valid: boolean; discount: number; message?: string }> {
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return { valid: false, discount: 0, message: 'Invalid coupon code' };

    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil)
      return { valid: false, discount: 0, message: 'Coupon has expired' };
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit)
      return { valid: false, discount: 0, message: 'Coupon usage limit reached' };
    if (orderAmount < coupon.minOrderAmount)
      return { valid: false, discount: 0, message: `Minimum order amount is ₹${coupon.minOrderAmount}` };
    if (coupon.applicableRestaurants.length > 0 && !coupon.applicableRestaurants.includes(restaurantId))
      return { valid: false, discount: 0, message: 'Coupon not valid for this restaurant' };

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (orderAmount * coupon.value) / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else if (coupon.type === 'fixed') {
      discount = coupon.value;
    }
    return { valid: true, discount: Math.min(discount, orderAmount) };
  }
}

export const adminService = new AdminService();
