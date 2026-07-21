import mongoose, { Document, Schema } from 'mongoose';

export interface ISearchHistory extends Document {
  userId?: string; query: string; type: 'restaurant' | 'food' | 'cuisine';
  resultsCount: number; createdAt: Date;
}

const SearchHistorySchema = new Schema<ISearchHistory>(
  {
    userId: { type: String, index: true },
    query: { type: String, required: true, index: true },
    type: { type: String, enum: ['restaurant', 'food', 'cuisine'], default: 'restaurant' },
    resultsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

SearchHistorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 3600 });
export const SearchHistory = mongoose.model<ISearchHistory>('SearchHistory', SearchHistorySchema);
