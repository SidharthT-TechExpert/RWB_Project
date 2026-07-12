import mongoose, { Document, Schema } from 'mongoose';

export type OTPPurpose = 'login' | 'phone_verify' | 'email_verify' | 'password_reset';

export interface IOTP extends Document {
  identifier: string; // email or phone
  otp: string;
  purpose: OTPPurpose;
  attempts: number;
  isUsed: boolean;
  expiresAt: Date;
  createdAt: Date;
}

const OTPSchema = new Schema<IOTP>(
  {
    identifier: { type: String, required: true, index: true },
    otp: { type: String, required: true },
    purpose: {
      type: String,
      enum: ['login', 'phone_verify', 'email_verify', 'password_reset'],
      required: true,
    },
    attempts: { type: Number, default: 0, max: 5 },
    isUsed: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL index
  },
  { timestamps: true }
);

OTPSchema.index({ identifier: 1, purpose: 1 });

export const OTP = mongoose.model<IOTP>('OTP', OTPSchema);
