import mongoose, { Document, Schema } from 'mongoose';

export interface IDailyOTPCount extends Document {
  date: string;
  count: number;
  updatedAt: Date;
}

const DailyOTPCountSchema = new Schema<IDailyOTPCount>(
  {
    date: { type: String, required: true, unique: true, index: true }, // Format: YYYY-MM-DD
    count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const DailyOTPCount = mongoose.model<IDailyOTPCount>('DailyOTPCount', DailyOTPCountSchema);
