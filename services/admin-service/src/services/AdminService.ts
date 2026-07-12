import axios from 'axios';
import {
  NotFoundError,
  AppError,
  HTTP_STATUS,
  createLogger,
  getPaginationParams,
  buildPaginationMeta,
} from '@quickbite/shared';
import { Coupon, ICoupon } from '../models/Coupon';

const logger = createLogger('admin-service');

const RESTAURANT_URL = process.env.RESTAURANT_SERVICE_URL || 'http://localhost:3003';
const AUTH_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

export class AdminService {
  // Restaurant management
  async getPendingRestaurants(page = 1, limit = 20) {
    const { skip } = getPaginationParams(page, limit);
    try {
      const res = await axios.get(`${RESTAURANT_URL}/api/v1/restaurants`, {
        params: { status: 'pending', page, limit },
      });
      return res.data;
    } catch {
      return { data: [], meta: buildPaginationMeta(page, limit, 0) };
    }
  }

  async approveRestaurant(restaurantId: string, adminId: string): Promise<void> {
    await axios.patch(`${RESTAURANT_URL}/api/v1/restaurants/${restaurantId}/approve`, {}, {
      headers: { 'x-admin-id': adminId },
    });
    logger.info(`Restaurant ${restaurantId} approved by admin ${adminId}`);
  }

  async rejectRestaurant(restaurantId: string, adminId: string, reason: string): Promise<void> {
    await axios.patch(`${RESTAURANT_URL}/api/v1/restaurants/${restaurantId}/reject`, { reason }, {
      headers: { 'x-admin-id': adminId },
    });
  }

  async suspendRestaurant(restaurantId: string, adminId: string): Promise<void> {
    await axios.patch(`${RESTAURANT_URL}/api/v1/restaurants/${restaurantId}/suspend`, {}, {
      headers: { 'x-admin-id': adminId },
    });
  }

  // Coupon management
  async createCoupon(adminId: string, data: Partial<ICoupon>): Promise<ICoupon> {
    const existing = await Coupon.findOne({ code: data.code });
    if (existing) throw new AppError('Coupon code already exists', HTTP_STATUS.CONFLICT);

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

  async validateCoupon(
    code: string,
    userId: string,
    restaurantId: string,
    orderAmount: number
  ): Promise<{ valid: boolean; discount: number; message?: string }> {
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return { valid: false, discount: 0, message: 'Invalid coupon code' };

    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return { valid: false, discount: 0, message: 'Coupon has expired' };
    }

    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, discount: 0, message: 'Coupon usage limit reached' };
    }

    if (orderAmount < coupon.minOrderAmount) {
      return {
        valid: false,
        discount: 0,
        message: `Minimum order amount is ₹${coupon.minOrderAmount}`,
      };
    }

    if (coupon.applicableRestaurants.length > 0 && !coupon.applicableRestaurants.includes(restaurantId)) {
      return { valid: false, discount: 0, message: 'Coupon not valid for this restaurant' };
    }

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (orderAmount * coupon.value) / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else if (coupon.type === 'fixed') {
      discount = coupon.value;
    }

    return { valid: true, discount: Math.min(discount, orderAmount) };
  }

  async getDashboardStats() {
    try {
      const [restaurantsRes] = await Promise.allSettled([
        axios.get(`${RESTAURANT_URL}/api/v1/restaurants`, { params: { limit: 1 } }),
      ]);

      return {
        totalRestaurants: restaurantsRes.status === 'fulfilled'
          ? restaurantsRes.value.data.meta?.total || 0
          : 0,
        activeCoupons: await Coupon.countDocuments({ isActive: true }),
        timestamp: new Date().toISOString(),
      };
    } catch {
      return { totalRestaurants: 0, activeCoupons: 0, timestamp: new Date().toISOString() };
    }
  }
}

export const adminService = new AdminService();
