import mongoose, { Document, Schema } from 'mongoose';
import { BOOKING_STATUS, BookingStatus } from '@quickbite/shared';

export type BookingType = 'table' | 'food' | 'both';

export interface IPreOrderItem {
  foodItemId: string;
  name: string;
  quantity: number;
  price: number;
  variantId?: string;
  addOns?: { id: string; name: string; price: number }[];
  specialInstructions?: string;
}

export interface IBooking extends Document {
  _id: mongoose.Types.ObjectId;
  bookingNumber: string;
  userId: string;
  restaurantId: string;
  restaurantName: string;
  type: BookingType;
  status: BookingStatus;
  // Table reservation details
  tableId?: string;
  tableNumber?: string;
  guestCount: number;
  reservationDate: Date;
  reservationTime: string; // HH:mm
  // Pre-order details
  preOrderItems: IPreOrderItem[];
  preOrderTotal: number;
  // Pricing
  subtotal: number;
  tax: number;
  serviceCharge: number;
  total: number;
  currency: string;
  // Status timestamps
  confirmedAt?: Date;
  checkedInAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  cancelledBy?: string;
  // Special requests
  specialRequests?: string;
  // Payment
  paymentId?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  // Queue
  queuePosition?: number;
  estimatedWaitTime?: number; // minutes
  // Reminders
  reminderSent: boolean;
  // Review
  isReviewed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PreOrderItemSchema = new Schema<IPreOrderItem>({
  foodItemId: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  variantId: { type: String },
  addOns: [
    {
      id: String,
      name: String,
      price: Number,
    },
  ],
  specialInstructions: { type: String },
});

const BookingSchema = new Schema<IBooking>(
  {
    bookingNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    restaurantId: { type: String, required: true, index: true },
    restaurantName: { type: String, required: true },
    type: { type: String, enum: ['table', 'food', 'both'], required: true },
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.PENDING,
      index: true,
    },
    tableId: { type: String },
    tableNumber: { type: String },
    guestCount: { type: Number, required: true, min: 1 },
    reservationDate: { type: Date, required: true, index: true },
    reservationTime: { type: String, required: true },
    preOrderItems: [PreOrderItemSchema],
    preOrderTotal: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    serviceCharge: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    confirmedAt: { type: Date },
    checkedInAt: { type: Date },
    completedAt: { type: Date },
    cancelledAt: { type: Date },
    cancellationReason: { type: String },
    cancelledBy: { type: String },
    specialRequests: { type: String },
    paymentId: { type: String },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
    queuePosition: { type: Number },
    estimatedWaitTime: { type: Number },
    reminderSent: { type: Boolean, default: false },
    isReviewed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

BookingSchema.index({ restaurantId: 1, reservationDate: 1, status: 1 });
BookingSchema.index({ userId: 1, createdAt: -1 });

export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);
