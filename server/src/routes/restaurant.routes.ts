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

// Owner/Admin/Manager
router.post('/', authenticate, authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN), restaurantController.create.bind(restaurantController));
router.get('/owner/my-restaurants', authenticate, authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN), restaurantController.getMyRestaurants.bind(restaurantController));
router.get('/owner/bank-details', authenticate, authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN), restaurantController.getBankDetails.bind(restaurantController));
router.post('/owner/bank-details/request', authenticate, authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN), restaurantController.submitBankRequest.bind(restaurantController));
router.put('/:id', authenticate, authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN, ROLES.BRANCH_MANAGER), restaurantController.update.bind(restaurantController));
router.post('/:id/tables', authenticate, authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN, ROLES.BRANCH_MANAGER), restaurantController.addTable.bind(restaurantController));
router.patch('/:id/tables/:tableNumber/availability', authenticate, authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN, ROLES.BRANCH_MANAGER), restaurantController.updateTableAvailability.bind(restaurantController));
router.patch('/:id/tables/:tableNumber', authenticate, authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN, ROLES.BRANCH_MANAGER), restaurantController.updateTable.bind(restaurantController));

export default router;
