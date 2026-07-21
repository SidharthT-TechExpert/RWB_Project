import mongoose, { Document, Schema } from 'mongoose';

export interface ICoupon extends Document {
  code: string; description: string; type: 'percentage' | 'fixed' | 'free_delivery';
  value: number; minOrderAmount: number; maxDiscount?: number;
  usageLimit: number; usedCount: number; perUserLimit: number;
  applicableRestaurants: string[]; validFrom: Date; validUntil: Date;
  isActive: boolean; createdBy: string; createdAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, index: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['percentage', 'fixed', 'free_delivery'], required: true },
    value: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0 }, maxDiscount: Number,
    usageLimit: { type: Number, default: 0 }, usedCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 }, applicableRestaurants: [String],
    validFrom: { type: Date, required: true }, validUntil: { type: Date, required: true },
    isActive: { type: Boolean, default: true }, createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

export const Coupon = mongoose.model<ICoupon>('Coupon', CouponSchema);
