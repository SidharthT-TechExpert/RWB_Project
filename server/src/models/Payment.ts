import mongoose, { Document, Schema } from 'mongoose';
import { PAYMENT_STATUS, PAYMENT_METHODS, PaymentStatus, PaymentMethod } from '../constants';

export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId;
  paymentNumber: string; userId: string; bookingId?: string; orderId?: string;
  amount: number; currency: string; method: PaymentMethod; status: PaymentStatus;
  provider: 'razorpay' | 'stripe' | 'internal';
  providerOrderId?: string; providerPaymentId?: string; providerSignature?: string;
  description?: string; metadata?: Record<string, unknown>;
  refundAmount?: number; refundReason?: string; refundedAt?: Date;
  failureReason?: string; invoiceUrl?: string;
  createdAt: Date; updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    paymentNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    bookingId: { type: String, index: true }, orderId: { type: String, index: true },
    amount: { type: Number, required: true, min: 0 }, currency: { type: String, default: 'INR' },
    method: { type: String, enum: Object.values(PAYMENT_METHODS), required: true },
    status: { type: String, enum: Object.values(PAYMENT_STATUS), default: PAYMENT_STATUS.PENDING },
    provider: { type: String, enum: ['razorpay', 'stripe', 'internal'], required: true },
    providerOrderId: String, providerPaymentId: String,
    providerSignature: { type: String, select: false },
    description: String, metadata: { type: Schema.Types.Mixed },
    refundAmount: Number, refundReason: String, refundedAt: Date, failureReason: String, invoiceUrl: String,
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
