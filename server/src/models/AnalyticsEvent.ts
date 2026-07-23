import mongoose, { Document, Schema } from 'mongoose';

export interface IAnalyticsEvent extends Document {
  eventType: string; userId?: string; restaurantId?: string;
  data: Record<string, unknown>; timestamp: Date;
}

const EventSchema = new Schema<IAnalyticsEvent>({
  eventType: { type: String, required: true, index: true },
  userId: { type: String, index: true },
  restaurantId: { type: String, index: true },
  data: { type: Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now },
});

EventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 3600 }); // 90-day TTL
export const AnalyticsEvent = mongoose.model<IAnalyticsEvent>('AnalyticsEvent', EventSchema);
