import { Router } from 'express';
import { adminController } from '../controllers/AdminController';
import { authenticate, authorize, ROLES } from '@quickbite/shared';

const router = Router();

// Coupon validation - open to authenticated users
router.post('/coupons/validate', authenticate, adminController.validateCoupon.bind(adminController));

// Admin-only routes
router.use(authenticate, authorize(ROLES.ADMIN));
router.get('/dashboard', adminController.getDashboard.bind(adminController));
router.get('/restaurants/pending', adminController.getPendingRestaurants.bind(adminController));
router.patch('/restaurants/:id/approve', adminController.approveRestaurant.bind(adminController));
router.patch('/restaurants/:id/reject', adminController.rejectRestaurant.bind(adminController));
router.patch('/restaurants/:id/suspend', adminController.suspendRestaurant.bind(adminController));
router.post('/coupons', adminController.createCoupon.bind(adminController));
router.get('/coupons', adminController.getCoupons.bind(adminController));
router.put('/coupons/:id', adminController.updateCoupon.bind(adminController));
router.delete('/coupons/:id', adminController.deleteCoupon.bind(adminController));

export default router;
