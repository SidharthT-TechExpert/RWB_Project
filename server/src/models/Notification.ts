import mongoose, { Document, Schema } from 'mongoose';
import { NOTIFICATION_TYPES, NotificationType } from '../constants';

export interface INotification extends Document {
  userId: string; type: NotificationType; title: string; body: string;
  data?: Record<string, unknown>; isRead: boolean;
  channel: 'push' | 'email' | 'sms' | 'in_app';
  sentAt?: Date; readAt?: Date; createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: String, required: true, index: true },
    type: { type: String, enum: Object.values(NOTIFICATION_TYPES), required: true },
    title: { type: String, required: true }, body: { type: String, required: true },
    data: { type: Schema.Types.Mixed },
    isRead: { type: Boolean, default: false, index: true },
    channel: { type: String, enum: ['push', 'email', 'sms', 'in_app'], required: true },
    sentAt: Date, readAt: Date,
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, createdAt: -1 });
export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);

export interface IDeviceToken extends Document {
  userId: string; token: string; platform: 'ios' | 'android' | 'web'; isActive: boolean; createdAt: Date;
}

const DeviceTokenSchema = new Schema<IDeviceToken>(
  {
    userId: { type: String, required: true, index: true },
    token: { type: String, required: true, unique: true },
    platform: { type: String, enum: ['ios', 'android', 'web'], required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const DeviceToken = mongoose.model<IDeviceToken>('DeviceToken', DeviceTokenSchema);
