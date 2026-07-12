import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/PaymentService';
import { sendSuccess, sendCreated, createLogger } from '@quickbite/shared';

const logger = createLogger('payment-controller');

export class PaymentController {
  async createRazorpayOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { amount, currency, bookingId, orderId } = req.body;
      const result = await paymentService.createRazorpayOrder(userId, amount, currency, bookingId, orderId);
      sendCreated(res, 'Razorpay order created', result);
    } catch (error) {
      next(error);
    }
  }

  async verifyRazorpayPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { paymentId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;
      const payment = await paymentService.verifyRazorpayPayment(
        paymentId, razorpayPaymentId, razorpayOrderId, razorpaySignature
      );
      sendSuccess(res, 'Payment verified', payment);
    } catch (error) {
      next(error);
    }
  }

  async createStripeIntent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { amount, currency, bookingId, orderId } = req.body;
      const result = await paymentService.createStripePaymentIntent(userId, amount, currency, bookingId, orderId);
      sendCreated(res, 'Stripe payment intent created', result);
    } catch (error) {
      next(error);
    }
  }

  async stripeWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const signature = req.headers['stripe-signature'] as string;
      await paymentService.handleStripeWebhook(req.body, signature);
      res.json({ received: true });
    } catch (error) {
      next(error);
    }
  }

  async processRefund(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { amount, reason } = req.body;
      const payment = await paymentService.processRefund(id, amount, reason);
      sendSuccess(res, 'Refund processed', payment);
    } catch (error) {
      next(error);
    }
  }

  async getMyPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { page, limit } = req.query;
      const result = await paymentService.getPaymentsByUser(userId, Number(page) || 1, Number(limit) || 20);
      sendSuccess(res, 'Payments retrieved', result.payments);
    } catch (error) {
      next(error);
    }
  }

  async getPaymentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const payment = await paymentService.getPaymentById(id);
      sendSuccess(res, 'Payment retrieved', payment);
    } catch (error) {
      next(error);
    }
  }
}

export const paymentController = new PaymentController();
