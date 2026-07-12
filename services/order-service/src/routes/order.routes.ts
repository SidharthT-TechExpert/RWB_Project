import { Router } from 'express';
import { orderController } from '../controllers/OrderController';
import { authenticate, authorize, ROLES } from '@quickbite/shared';

const router = Router();

router.post('/', authenticate, orderController.createOrder.bind(orderController));
router.get('/my', authenticate, orderController.getMyOrders.bind(orderController));
router.get('/:id', authenticate, orderController.getOrderById.bind(orderController));
router.patch('/:id/cancel', authenticate, orderController.cancelOrder.bind(orderController));
router.post('/:id/reorder', authenticate, orderController.reorder.bind(orderController));

router.get('/restaurant/:restaurantId', authenticate, authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN), orderController.getRestaurantOrders.bind(orderController));
router.patch('/:id/status', authenticate, authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN), orderController.updateOrderStatus.bind(orderController));
router.patch('/:id/items/:itemId/status', authenticate, authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN), orderController.updateItemStatus.bind(orderController));

export default router;
