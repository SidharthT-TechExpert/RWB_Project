import { Router } from 'express';
import { bookingController } from '../controllers/BookingController';
import { authenticate, authorize, ROLES } from '@quickbite/shared';

const router = Router();

// Customer routes
router.post(
  '/',
  authenticate,
  bookingController.createBooking.bind(bookingController)
);

router.get(
  '/my',
  authenticate,
  bookingController.getMyBookings.bind(bookingController)
);

router.get(
  '/number/:bookingNumber',
  authenticate,
  bookingController.getBookingByNumber.bind(bookingController)
);

router.get(
  '/:id',
  authenticate,
  bookingController.getBookingById.bind(bookingController)
);

router.patch(
  '/:id/cancel',
  authenticate,
  bookingController.cancelBooking.bind(bookingController)
);

// Restaurant owner routes
router.get(
  '/restaurant/:restaurantId',
  authenticate,
  authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN),
  bookingController.getRestaurantBookings.bind(bookingController)
);

router.patch(
  '/:id/confirm',
  authenticate,
  authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN),
  bookingController.confirmBooking.bind(bookingController)
);

router.patch(
  '/:id/check-in',
  authenticate,
  authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN),
  bookingController.checkIn.bind(bookingController)
);

router.patch(
  '/:id/complete',
  authenticate,
  authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN),
  bookingController.completeBooking.bind(bookingController)
);

router.get(
  '/restaurant/:restaurantId/stats',
  authenticate,
  authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN),
  bookingController.getRestaurantStats.bind(bookingController)
);

export default router;
