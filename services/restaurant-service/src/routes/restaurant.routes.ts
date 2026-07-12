import { Router } from 'express';
import { restaurantController } from '../controllers/RestaurantController';
import { authenticate, authorize, ROLES } from '@quickbite/shared';

const router = Router();

// Public routes
router.get('/', restaurantController.getRestaurants.bind(restaurantController));
router.get('/featured', restaurantController.getFeaturedRestaurants.bind(restaurantController));
router.get('/nearby', restaurantController.getNearbyRestaurants.bind(restaurantController));
router.get('/search', restaurantController.searchRestaurants.bind(restaurantController));
router.get('/slug/:slug', restaurantController.getRestaurantBySlug.bind(restaurantController));
router.get('/:id', restaurantController.getRestaurantById.bind(restaurantController));

// Protected routes (Restaurant Owner)
router.post(
  '/',
  authenticate,
  authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN),
  restaurantController.createRestaurant.bind(restaurantController)
);

router.get(
  '/owner/my-restaurants',
  authenticate,
  authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN),
  restaurantController.getMyRestaurants.bind(restaurantController)
);

router.put(
  '/:id',
  authenticate,
  authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN),
  restaurantController.updateRestaurant.bind(restaurantController)
);

router.put(
  '/:id/opening-hours',
  authenticate,
  authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN),
  restaurantController.updateOpeningHours.bind(restaurantController)
);

router.post(
  '/:id/tables',
  authenticate,
  authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN),
  restaurantController.addTable.bind(restaurantController)
);

export default router;
