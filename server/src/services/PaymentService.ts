import Razorpay from 'razorpay';
import Stripe from 'stripe';
import crypto from 'crypto';
import { Payment, IPayment } from '../models/Payment';
import { AppError } from '../errors';
import { PAYMENT_STATUS, PAYMENT_METHODS } from '../constants';
import { logger } from '../config/logger';

let _razorpay: Razorpay | null = null;
let _stripe: Stripe | null = null;

const getRazorpay = (): Razorpay => {
  if (!_razorpay) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) throw new AppError('Razorpay credentials not configured', 503);
    _razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return _razorpay;
};

const getStripe = (): Stripe => {
  if (!_stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) throw new AppError('Stripe credentials not configured', 503);
    _stripe = new Stripe(secretKey, { apiVersion: '2024-06-20' });
  }
  return _stripe;
};

const generatePaymentNumber = (): string =>
  `PAY${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

export class PaymentService {
  async createRazorpayOrder(userId: string, amount: number, currency = 'INR', bookingId?: string, orderId?: string) {
    const razorpayOrder = await getRazorpay().orders.create({
      amount: Math.round(amount * 100), currency, receipt: `rcpt_${Date.now()}`,
    }) as unknown as Record<string, unknown>;

    const payment = await Payment.create({
      paymentNumber: generatePaymentNumber(), userId, bookingId, orderId,
      amount, currency, method: PAYMENT_METHODS.RAZORPAY, provider: 'razorpay',
      providerOrderId: razorpayOrder.id,
      description: bookingId ? `Booking ${bookingId}` : `Order ${orderId}`,
    });
    return { payment, razorpayOrder };
  }

  async verifyRazorpayPayment(paymentId: string, razorpayPaymentId: string, razorpayOrderId: string, razorpaySignature: string): Promise<IPayment> {
    const payment = await Payment.findById(paymentId);
    if (!payment) throw new AppError('Payment not found', 404);

    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      payment.status = PAYMENT_STATUS.FAILED;
      payment.failureReason = 'Invalid payment signature';
      await payment.save();
      throw new AppError('Payment verification failed', 400);
    }

    payment.status = PAYMENT_STATUS.COMPLETED;
    payment.providerPaymentId = razorpayPaymentId;
    await payment.save();
    logger.info(`Razorpay payment verified: ${payment.paymentNumber}`);
    return payment;
  }

  async createStripePaymentIntent(userId: string, amount: number, currency = 'usd', bookingId?: string, orderId?: string) {
    const paymentIntent = await getStripe().paymentIntents.create({
      amount: Math.round(amount * 100), currency,
      automatic_payment_methods: { enabled: true },
      metadata: { userId, bookingId: bookingId || '', orderId: orderId || '' },
    });

    const payment = await Payment.create({
      paymentNumber: generatePaymentNumber(), userId, bookingId, orderId,
      amount, currency, method: PAYMENT_METHODS.STRIPE, provider: 'stripe',
      providerOrderId: paymentIntent.id,
    });
    return { payment, clientSecret: paymentIntent.client_secret! };
  }

  async handleStripeWebhook(payload: Buffer, signature: string): Promise<void> {
    const event = getStripe().webhooks.constructEvent(
      payload, signature, process.env.STRIPE_WEBHOOK_SECRET || ''
    );

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as Stripe.PaymentIntent;
      const payment = await Payment.findOne({ providerOrderId: intent.id });
      if (payment) {
        payment.status = PAYMENT_STATUS.COMPLETED;
        payment.providerPaymentId = intent.id;
        await payment.save();
      }
    }

    if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object as Stripe.PaymentIntent;
      await Payment.findOneAndUpdate(
        { providerOrderId: intent.id },
        { status: PAYMENT_STATUS.FAILED, failureReason: intent.last_payment_error?.message || 'Payment failed' }
      );
    }
  }

  async processRefund(paymentId: string, amount?: number, reason?: string): Promise<IPayment> {
    const payment = await Payment.findById(paymentId);
    if (!payment) throw new AppError('Payment not found', 404);
    if (payment.status !== PAYMENT_STATUS.COMPLETED)
      throw new AppError('Only completed payments can be refunded', 400);

    const refundAmount = amount || payment.amount;

    if (payment.provider === 'razorpay' && payment.providerPaymentId) {
      await getRazorpay().payments.refund(payment.providerPaymentId, {
        amount: Math.round(refundAmount * 100),
        notes: { reason: reason || 'Customer request' },
      });
    } else if (payment.provider === 'stripe' && payment.providerOrderId) {
      await getStripe().refunds.create({
        payment_intent: payment.providerOrderId,
        amount: Math.round(refundAmount * 100),
        reason: 'requested_by_customer',
      });
    }

    payment.status = refundAmount === payment.amount ? PAYMENT_STATUS.REFUNDED : PAYMENT_STATUS.PARTIALLY_REFUNDED;
    payment.refundAmount = refundAmount;
    payment.refundReason = reason;
    payment.refundedAt = new Date();
    await payment.save();
    logger.info(`Refund processed: ${payment.paymentNumber}`);
    return payment;
  }

  async getPaymentsByUser(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [payments, total] = await Promise.all([
      Payment.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Payment.countDocuments({ userId }),
    ]);
    return { payments, total };
  }

  async getPaymentById(id: string): Promise<IPayment> {
    const payment = await Payment.findById(id);
    if (!payment) throw new AppError('Payment not found', 404);
    return payment;
  }
}

export const paymentService = new PaymentService();
