import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/PaymentService';
import { sendSuccess, sendCreated } from '../utils/response';

export class PaymentController {
  async createRazorpayOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { amount, currency, bookingId, orderId } = req.body;
      sendCreated(res, 'Razorpay order created', await paymentService.createRazorpayOrder(req.user!.userId, amount, currency, bookingId, orderId));
    } catch (error) { next(error); }
  }
  async verifyRazorpayPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { paymentId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;
      sendSuccess(res, 'Payment verified', await paymentService.verifyRazorpayPayment(paymentId, razorpayPaymentId, razorpayOrderId, razorpaySignature));
    } catch (error) { next(error); }
  }
  async createStripeIntent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { amount, currency, bookingId, orderId } = req.body;
      sendCreated(res, 'Stripe intent created', await paymentService.createStripePaymentIntent(req.user!.userId, amount, currency, bookingId, orderId));
    } catch (error) { next(error); }
  }
  async stripeWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await paymentService.handleStripeWebhook(req.body, req.headers['stripe-signature'] as string);
      res.json({ received: true });
    } catch (error) { next(error); }
  }
  async processRefund(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Refund processed', await paymentService.processRefund(req.params.id, req.body.amount, req.body.reason)); }
    catch (error) { next(error); }
  }
  async getMyPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Payments retrieved', (await paymentService.getPaymentsByUser(req.user!.userId, Number(req.query.page) || 1, Number(req.query.limit) || 20)).payments); }
    catch (error) { next(error); }
  }
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Payment retrieved', await paymentService.getPaymentById(req.params.id)); }
    catch (error) { next(error); }
  }
}

export const paymentController = new PaymentController();
