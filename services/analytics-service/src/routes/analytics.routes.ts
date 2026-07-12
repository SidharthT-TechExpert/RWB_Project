import { Router } from 'express';
import { analyticsController } from '../controllers/AnalyticsController';
import { authenticate, authorize, ROLES, optionalAuthenticate } from '@quickbite/shared';

const router = Router();
router.post('/track', optionalAuthenticate, analyticsController.track.bind(analyticsController));
router.get('/restaurant/:restaurantId', authenticate, authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN), analyticsController.getRestaurantAnalytics.bind(analyticsController));
router.get('/restaurant/:restaurantId/sales', authenticate, authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN), analyticsController.getSalesReport.bind(analyticsController));
router.get('/platform', authenticate, authorize(ROLES.ADMIN), analyticsController.getPlatformAnalytics.bind(analyticsController));
export default router;
