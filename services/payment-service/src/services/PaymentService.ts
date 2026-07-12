import Razorpay from 'razorpay';
import Stripe from 'stripe';
import crypto from 'crypto';
import {
  AppError,
  HTTP_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  EVENTS,
  publishEvent,
  createLogger,
} from '@quickbite/shared';
import { Payment, IPayment } from '../models/Payment';

const logger = createLogger('payment-service');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

const generatePaymentNumber = (): string => {
  return `PAY${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
};

export class PaymentService {
  async createRazorpayOrder(
    userId: string,
    amount: number,
    currency: string = 'INR',
    bookingId?: string,
    orderId?: string
  ): Promise<{ payment: IPayment; razorpayOrder: Record<string, unknown> }> {
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
      currency,
      receipt: `rcpt_${Date.now()}`,
    }) as unknown as Record<string, unknown>;

    const payment = await Payment.create({
      paymentNumber: generatePaymentNumber(),
      userId,
      bookingId,
      orderId,
      amount,
      currency,
      method: PAYMENT_METHODS.RAZORPAY,
      provider: 'razorpay',
      providerOrderId: razorpayOrder.id,
      description: bookingId ? `Booking ${bookingId}` : `Order ${orderId}`,
    });

    return { payment, razorpayOrder };
  }

  async verifyRazorpayPayment(
    paymentId: string,
    razorpayPaymentId: string,
    razorpayOrderId: string,
    razorpaySignature: string
  ): Promise<IPayment> {
    const payment = await Payment.findById(paymentId);
    if (!payment) throw new AppError('Payment not found', HTTP_STATUS.NOT_FOUND);

    // Verify signature
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      payment.status = PAYMENT_STATUS.FAILED;
      payment.failureReason = 'Invalid payment signature';
      await payment.save();
      throw new AppError('Payment verification failed', HTTP_STATUS.BAD_REQUEST);
    }

    payment.status = PAYMENT_STATUS.COMPLETED;
    payment.providerPaymentId = razorpayPaymentId;
    payment.providerSignature = razorpaySignature;
    await payment.save();

    publishEvent('payment', EVENTS.PAYMENT_COMPLETED, {
      paymentId: payment._id.toString(),
      userId: payment.userId,
      bookingId: payment.bookingId,
      orderId: payment.orderId,
      amount: payment.amount,
    }).catch((err) => logger.error('Failed to publish payment.completed:', err));

    logger.info(`Razorpay payment verified: ${payment.paymentNumber}`);
    return payment;
  }

  async createStripePaymentIntent(
    userId: string,
    amount: number,
    currency: string = 'usd',
    bookingId?: string,
    orderId?: string
  ): Promise<{ payment: IPayment; clientSecret: string }> {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // cents
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: { userId, bookingId: bookingId || '', orderId: orderId || '' },
    });

    const payment = await Payment.create({
      paymentNumber: generatePaymentNumber(),
      userId,
      bookingId,
      orderId,
      amount,
      currency,
      method: PAYMENT_METHODS.STRIPE,
      provider: 'stripe',
      providerOrderId: paymentIntent.id,
    });

    return { payment, clientSecret: paymentIntent.client_secret! };
  }

  async handleStripeWebhook(payload: Buffer, signature: string): Promise<void> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as Stripe.PaymentIntent;
      const payment = await Payment.findOne({ providerOrderId: intent.id });

      if (payment) {
        payment.status = PAYMENT_STATUS.COMPLETED;
        payment.providerPaymentId = intent.id;
        await payment.save();

        publishEvent('payment', EVENTS.PAYMENT_COMPLETED, {
          paymentId: payment._id.toString(),
          userId: payment.userId,
          bookingId: payment.bookingId,
          orderId: payment.orderId,
          amount: payment.amount,
        }).catch((err) => logger.error('Failed to publish payment.completed:', err));
      }
    }

    if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object as Stripe.PaymentIntent;
      await Payment.findOneAndUpdate(
        { providerOrderId: intent.id },
        {
          status: PAYMENT_STATUS.FAILED,
          failureReason: intent.last_payment_error?.message || 'Payment failed',
        }
      );
    }
  }

  async processRefund(
    paymentId: string,
    amount?: number,
    reason?: string
  ): Promise<IPayment> {
    const payment = await Payment.findById(paymentId);
    if (!payment) throw new AppError('Payment not found', HTTP_STATUS.NOT_FOUND);

    if (payment.status !== PAYMENT_STATUS.COMPLETED) {
      throw new AppError('Only completed payments can be refunded', HTTP_STATUS.BAD_REQUEST);
    }

    const refundAmount = amount || payment.amount;

    if (payment.provider === 'razorpay' && payment.providerPaymentId) {
      await razorpay.payments.refund(payment.providerPaymentId, {
        amount: Math.round(refundAmount * 100),
        notes: { reason: reason || 'Customer request' },
      });
    } else if (payment.provider === 'stripe' && payment.providerPaymentId) {
      await stripe.refunds.create({
        payment_intent: payment.providerOrderId!,
        amount: Math.round(refundAmount * 100),
        reason: 'requested_by_customer',
      });
    }

    payment.status = refundAmount === payment.amount
      ? PAYMENT_STATUS.REFUNDED
      : PAYMENT_STATUS.PARTIALLY_REFUNDED;
    payment.refundAmount = refundAmount;
    payment.refundReason = reason;
    payment.refundedAt = new Date();
    await payment.save();

    logger.info(`Refund processed: ${payment.paymentNumber}, amount: ${refundAmount}`);
    return payment;
  }

  async getPaymentsByUser(
    userId: string,
    page = 1,
    limit = 20
  ): Promise<{ payments: IPayment[]; total: number }> {
    const skip = (page - 1) * limit;
    const [payments, total] = await Promise.all([
      Payment.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Payment.countDocuments({ userId }),
    ]);
    return { payments, total };
  }

  async getPaymentById(id: string): Promise<IPayment> {
    const payment = await Payment.findById(id);
    if (!payment) throw new AppError('Payment not found', HTTP_STATUS.NOT_FOUND);
    return payment;
  }
}

export const paymentService = new PaymentService();
