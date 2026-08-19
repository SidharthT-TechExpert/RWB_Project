import mongoose, { Document, Schema } from 'mongoose';

export type BankRequestStatus = 'pending' | 'approved' | 'rejected';

export interface IBankVerificationRequest extends Document {
  _id: mongoose.Types.ObjectId;
  restaurantId: string;
  ownerId: string;
  restaurantName: string;
  ownerName: string;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  branchName?: string;
  accountType: 'current' | 'savings';
  upiId?: string;
  payoutSchedule: 'daily' | 'weekly' | 'monthly';
  status: BankRequestStatus;
  adminNotes?: string;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BankVerificationRequestSchema = new Schema<IBankVerificationRequest>(
  {
    restaurantId: { type: String, required: true, index: true },
    ownerId: { type: String, required: true, index: true },
    restaurantName: { type: String, required: true },
    ownerName: { type: String, required: true },
    bankName: { type: String, required: true, trim: true },
    accountHolderName: { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true, trim: true },
    ifscCode: { type: String, required: true, trim: true, uppercase: true },
    branchName: { type: String, trim: true },
    accountType: { type: String, enum: ['current', 'savings'], default: 'current' },
    upiId: { type: String, trim: true },
    payoutSchedule: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    adminNotes: { type: String },
    rejectionReason: { type: String },
    reviewedBy: { type: String },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

BankVerificationRequestSchema.index({ restaurantId: 1, status: 1 });
BankVerificationRequestSchema.index({ createdAt: -1 });

export const BankVerificationRequest = mongoose.model<IBankVerificationRequest>(
  'BankVerificationRequest',
  BankVerificationRequestSchema
);
