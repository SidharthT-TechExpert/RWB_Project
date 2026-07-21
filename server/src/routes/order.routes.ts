import { Router } from 'express';
import { orderController } from '../controllers/OrderController';
import { authenticate, authorize } from '../middlewares/authenticate';
import { ROLES } from '../constants';

const router = Router();

router.post('/', authenticate, orderController.create.bind(orderController));
router.get('/my', authenticate, orderController.getMyOrders.bind(orderController));
router.get('/:id', authenticate, orderController.getById.bind(orderController));
router.patch('/:id/cancel', authenticate, orderController.cancel.bind(orderController));
router.post('/:id/reorder', authenticate, orderController.reorder.bind(orderController));

router.get('/restaurant/:restaurantId', authenticate, authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN), orderController.getRestaurantOrders.bind(orderController));
router.patch('/:id/status', authenticate, authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN), orderController.updateStatus.bind(orderController));
router.patch('/:id/items/:itemId/status', authenticate, authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN), orderController.updateItemStatus.bind(orderController));

export default router;
