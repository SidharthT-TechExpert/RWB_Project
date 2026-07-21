import { Router } from 'express';
import { foodController } from '../controllers/FoodController';
import { authenticate, authorize } from '../middlewares/authenticate';
import { ROLES } from '../constants';

const router = Router();

// Public
router.get('/search', foodController.search.bind(foodController));
router.get('/:restaurantId/menu', foodController.getMenu.bind(foodController));
router.get('/:restaurantId/categories', foodController.getCategories.bind(foodController));
router.get('/:restaurantId/popular', foodController.getPopularItems.bind(foodController));
router.get('/:restaurantId/categories/:categoryId/items', foodController.getItemsByCategory.bind(foodController));
router.get('/items/:id', foodController.getFoodItemById.bind(foodController));

// Owner/Admin
router.post('/:restaurantId/categories', authenticate, authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN), foodController.createCategory.bind(foodController));
router.put('/:restaurantId/categories/:categoryId', authenticate, authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN), foodController.updateCategory.bind(foodController));
router.delete('/:restaurantId/categories/:categoryId', authenticate, authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN), foodController.deleteCategory.bind(foodController));
router.post('/:restaurantId/items', authenticate, authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN), foodController.createFoodItem.bind(foodController));
router.put('/:restaurantId/items/:id', authenticate, authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN), foodController.updateFoodItem.bind(foodController));
router.delete('/:restaurantId/items/:id', authenticate, authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN), foodController.deleteFoodItem.bind(foodController));
router.patch('/:restaurantId/items/:id/toggle', authenticate, authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN), foodController.toggleAvailability.bind(foodController));

export default router;
