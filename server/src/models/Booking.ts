import mongoose, { Document, Schema } from 'mongoose';
import { BOOKING_STATUS, BookingStatus } from '../constants';

export interface IPreOrderItem {
  foodItemId: string; name: string; quantity: number; price: number;
  variantId?: string; addOns?: { id: string; name: string; price: number }[];
  specialInstructions?: string;
}

export interface IBooking extends Document {
  _id: mongoose.Types.ObjectId;
  bookingNumber: string; userId: string; restaurantId: string; restaurantName: string;
  type: 'table' | 'food' | 'both'; status: BookingStatus;
  tableId?: string; tableNumber?: string; guestCount: number;
  reservationDate: Date; reservationTime: string;
  preOrderItems: IPreOrderItem[]; preOrderTotal: number;
  subtotal: number; tax: number; serviceCharge: number; total: number; currency: string;
  confirmedAt?: Date; checkedInAt?: Date; completedAt?: Date;
  cancelledAt?: Date; cancellationReason?: string; cancelledBy?: string;
  specialRequests?: string; paymentId?: string; paymentStatus: 'pending' | 'paid' | 'refunded';
  queuePosition?: number; estimatedWaitTime?: number; reminderSent: boolean; isReviewed: boolean;
  createdAt: Date; updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    bookingNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    restaurantId: { type: String, required: true, index: true },
    restaurantName: { type: String, required: true },
    type: { type: String, enum: ['table', 'food', 'both'], required: true },
    status: { type: String, enum: Object.values(BOOKING_STATUS), default: BOOKING_STATUS.PENDING, index: true },
    tableId: String, tableNumber: String,
    guestCount: { type: Number, required: true, min: 1 },
    reservationDate: { type: Date, required: true, index: true },
    reservationTime: { type: String, required: true },
    preOrderItems: [{ foodItemId: String, name: String, quantity: Number, price: Number, variantId: String, addOns: [{ id: String, name: String, price: Number }], specialInstructions: String }],
    preOrderTotal: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 }, tax: { type: Number, default: 0 },
    serviceCharge: { type: Number, default: 0 }, total: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    confirmedAt: Date, checkedInAt: Date, completedAt: Date, cancelledAt: Date,
    cancellationReason: String, cancelledBy: String, specialRequests: String,
    paymentId: String, paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
    queuePosition: Number, estimatedWaitTime: Number,
    reminderSent: { type: Boolean, default: false }, isReviewed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

BookingSchema.index({ restaurantId: 1, reservationDate: 1, status: 1 });
BookingSchema.index({ userId: 1, createdAt: -1 });
export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);
