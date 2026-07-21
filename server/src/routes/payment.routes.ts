import { Router } from 'express';
import express from 'express';
import { paymentController } from '../controllers/PaymentController';
import { authenticate, authorize } from '../middlewares/authenticate';
import { ROLES } from '../constants';

const router = Router();

// Stripe webhook — raw body needed
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), paymentController.stripeWebhook.bind(paymentController));

router.post('/razorpay/order', authenticate, paymentController.createRazorpayOrder.bind(paymentController));
router.post('/razorpay/verify', authenticate, paymentController.verifyRazorpayPayment.bind(paymentController));
router.post('/stripe/intent', authenticate, paymentController.createStripeIntent.bind(paymentController));
router.get('/my', authenticate, paymentController.getMyPayments.bind(paymentController));
router.get('/:id', authenticate, paymentController.getById.bind(paymentController));
router.post('/:id/refund', authenticate, authorize(ROLES.ADMIN), paymentController.processRefund.bind(paymentController));

export default router;
