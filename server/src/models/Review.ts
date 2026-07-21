import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  userId: string; userName: string; userAvatar?: string;
  restaurantId: string; bookingId?: string; orderId?: string;
  rating: number; title?: string; comment: string;
  photos: string[]; tags: string[];
  foodRatings: { foodItemId: string; name: string; rating: number }[];
  reply?: { text: string; repliedAt: Date };
  helpfulVotes: number; helpfulVotedBy: string[];
  isVerified: boolean; isReported: boolean; reportReason?: string; isHidden: boolean;
  createdAt: Date; updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true }, userAvatar: String,
    restaurantId: { type: String, required: true, index: true },
    bookingId: String, orderId: String,
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, maxlength: 100 },
    comment: { type: String, required: true, minlength: 10, maxlength: 1000 },
    photos: [String], tags: [String],
    foodRatings: [{ foodItemId: String, name: String, rating: { type: Number, min: 1, max: 5 } }],
    reply: { text: String, repliedAt: Date },
    helpfulVotes: { type: Number, default: 0 }, helpfulVotedBy: [String],
    isVerified: { type: Boolean, default: false }, isReported: { type: Boolean, default: false },
    reportReason: String, isHidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ReviewSchema.index({ restaurantId: 1, createdAt: -1 });
ReviewSchema.index({ userId: 1, restaurantId: 1 }, { unique: true });
export const Review = mongoose.model<IReview>('Review', ReviewSchema);
