import { Router } from 'express';
import { bookingController } from '../controllers/BookingController';
import { authenticate, authorize } from '../middlewares/authenticate';
import { ROLES } from '../constants';

const router = Router();

router.post('/', authenticate, bookingController.create.bind(bookingController));
router.get('/my', authenticate, bookingController.getMyBookings.bind(bookingController));
router.get('/number/:bookingNumber', authenticate, bookingController.getByNumber.bind(bookingController));
router.get('/:id', authenticate, bookingController.getById.bind(bookingController));
router.patch('/:id/cancel', authenticate, bookingController.cancel.bind(bookingController));

router.get('/restaurant/:restaurantId', authenticate, authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN), bookingController.getRestaurantBookings.bind(bookingController));
router.patch('/:id/confirm', authenticate, authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN), bookingController.confirm.bind(bookingController));
router.patch('/:id/check-in', authenticate, authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN), bookingController.checkIn.bind(bookingController));
router.patch('/:id/complete', authenticate, authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN), bookingController.complete.bind(bookingController));
router.get('/restaurant/:restaurantId/stats', authenticate, authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN), bookingController.getStats.bind(bookingController));

export default router;
