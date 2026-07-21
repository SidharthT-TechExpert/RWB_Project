import { Router } from 'express';
import { restaurantController } from '../controllers/RestaurantController';
import { authenticate, authorize } from '../middlewares/authenticate';
import { ROLES } from '../constants';

const router = Router();

// Public
router.get('/', restaurantController.getAll.bind(restaurantController));
router.get('/featured', restaurantController.getFeatured.bind(restaurantController));
router.get('/nearby', restaurantController.getNearby.bind(restaurantController));
router.get('/search', restaurantController.search.bind(restaurantController));
router.get('/slug/:slug', restaurantController.getBySlug.bind(restaurantController));
router.get('/:id', restaurantController.getById.bind(restaurantController));

// Owner/Admin
router.post('/', authenticate, authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN), restaurantController.create.bind(restaurantController));
router.get('/owner/my-restaurants', authenticate, authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN), restaurantController.getMyRestaurants.bind(restaurantController));
router.put('/:id', authenticate, authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN), restaurantController.update.bind(restaurantController));
router.post('/:id/tables', authenticate, authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN), restaurantController.addTable.bind(restaurantController));

export default router;
