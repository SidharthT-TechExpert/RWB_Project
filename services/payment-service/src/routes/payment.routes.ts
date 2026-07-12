import { Router } from 'express';
import express from 'express';
import { paymentController } from '../controllers/PaymentController';
import { authenticate, authorize, ROLES } from '@quickbite/shared';

const router = Router();

// Stripe webhook (raw body needed)
router.post(
  '/webhook/stripe',
  express.raw({ type: 'application/json' }),
  paymentController.stripeWebhook.bind(paymentController)
);

// Authenticated routes
router.post(
  '/razorpay/order',
  authenticate,
  paymentController.createRazorpayOrder.bind(paymentController)
);

router.post(
  '/razorpay/verify',
  authenticate,
  paymentController.verifyRazorpayPayment.bind(paymentController)
);

router.post(
  '/stripe/intent',
  authenticate,
  paymentController.createStripeIntent.bind(paymentController)
);

router.get(
  '/my',
  authenticate,
  paymentController.getMyPayments.bind(paymentController)
);

router.get(
  '/:id',
  authenticate,
  paymentController.getPaymentById.bind(paymentController)
);

// Admin routes
router.post(
  '/:id/refund',
  authenticate,
  authorize(ROLES.ADMIN),
  paymentController.processRefund.bind(paymentController)
);

export default router;
