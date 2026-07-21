import mongoose, { Document, Schema } from 'mongoose';
import { ORDER_STATUS, OrderStatus } from '../constants';

export interface IOrderItem {
  foodItemId: string; name: string; quantity: number; unitPrice: number; totalPrice: number;
  variantId?: string; variantName?: string;
  addOns: { id: string; name: string; price: number }[];
  specialInstructions?: string; status: 'pending' | 'preparing' | 'ready';
}

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  orderNumber: string; userId: string; restaurantId: string; restaurantName: string;
  bookingId?: string; items: IOrderItem[]; status: OrderStatus;
  subtotal: number; tax: number; serviceCharge: number; discount: number; total: number; currency: string;
  paymentId?: string; paymentStatus: 'pending' | 'paid' | 'refunded';
  specialInstructions?: string; estimatedCompletionTime?: Date; actualCompletionTime?: Date;
  cancelledAt?: Date; cancellationReason?: string; kitchenNotes?: string; invoiceUrl?: string;
  isReorder: boolean; createdAt: Date; updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    restaurantId: { type: String, required: true, index: true },
    restaurantName: { type: String, required: true },
    bookingId: { type: String, index: true },
    items: [{ foodItemId: String, name: String, quantity: Number, unitPrice: Number, totalPrice: Number, variantId: String, variantName: String, addOns: [{ id: String, name: String, price: Number }], specialInstructions: String, status: { type: String, enum: ['pending', 'preparing', 'ready'], default: 'pending' } }],
    status: { type: String, enum: Object.values(ORDER_STATUS), default: ORDER_STATUS.PENDING, index: true },
    subtotal: { type: Number, required: true, min: 0 }, tax: { type: Number, default: 0 },
    serviceCharge: { type: Number, default: 0 }, discount: { type: Number, default: 0 },
    total: { type: Number, required: true, min: 0 }, currency: { type: String, default: 'INR' },
    paymentId: String, paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
    specialInstructions: String, estimatedCompletionTime: Date, actualCompletionTime: Date,
    cancelledAt: Date, cancellationReason: String, kitchenNotes: String, invoiceUrl: String,
    isReorder: { type: Boolean, default: false },
  },
  { timestamps: true }
);

OrderSchema.index({ restaurantId: 1, status: 1, createdAt: -1 });
OrderSchema.index({ userId: 1, createdAt: -1 });
export const Order = mongoose.model<IOrder>('Order', OrderSchema);
