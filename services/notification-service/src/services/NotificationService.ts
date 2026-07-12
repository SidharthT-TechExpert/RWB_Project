import admin from 'firebase-admin';
import nodemailer from 'nodemailer';
import {
  NOTIFICATION_TYPES,
  NotificationType,
  createLogger,
  getPaginationParams,
  buildPaginationMeta,
} from '@quickbite/shared';
import { Notification } from '../models/Notification';
import { DeviceToken } from '../models/DeviceToken';

const logger = createLogger('notification-service');

// Initialize Firebase Admin
let firebaseInitialized = false;
const initFirebase = () => {
  if (firebaseInitialized) return;
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
    firebaseInitialized = true;
  } catch (err) {
    logger.warn('Firebase initialization failed (push notifications disabled):', err);
  }
};

const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

export interface SendNotificationDTO {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  channels?: ('push' | 'email' | 'sms' | 'in_app')[];
  email?: string;
  phone?: string;
  fcmToken?: string;
}

export class NotificationService {
  async send(dto: SendNotificationDTO): Promise<void> {
    const channels = dto.channels || ['in_app'];

    await Promise.allSettled(
      channels.map(async (channel) => {
        try {
          await Notification.create({
            userId: dto.userId,
            type: dto.type,
            title: dto.title,
            body: dto.body,
            data: dto.data,
            isRead: false,
            channel,
            sentAt: new Date(),
          });

          if (channel === 'push') await this.sendPush(dto.userId, dto.title, dto.body, dto.data);
          if (channel === 'email' && dto.email) await this.sendEmail(dto.email, dto.title, dto.body);
        } catch (err) {
          logger.error(`Failed to send ${channel} notification to ${dto.userId}:`, err);
        }
      })
    );
  }

  private async sendPush(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, unknown>
  ): Promise<void> {
    initFirebase();
    if (!firebaseInitialized) return;

    const tokens = await DeviceToken.find({ userId, isActive: true }).select('token');
    if (!tokens.length) return;

    const tokenList = tokens.map((t) => t.token);
    const dataStringified = data
      ? Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)]))
      : {};

    const response = await admin.messaging().sendEachForMulticast({
      tokens: tokenList,
      notification: { title, body },
      data: dataStringified,
      android: { priority: 'high' },
      apns: { payload: { aps: { badge: 1, sound: 'default' } } },
    });

    // Remove invalid tokens
    response.responses.forEach(async (r, i) => {
      if (!r.success && r.error?.code === 'messaging/invalid-registration-token') {
        await DeviceToken.findOneAndUpdate({ token: tokenList[i] }, { isActive: false });
      }
    });
  }

  private async sendEmail(to: string, subject: string, text: string): Promise<void> {
    await emailTransporter.sendMail({
      from: `QuickBite <${process.env.EMAIL_FROM || 'noreply@quickbite.com'}>`,
      to,
      subject,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><p>${text}</p></div>`,
    });
  }

  async registerDeviceToken(userId: string, token: string, platform: 'ios' | 'android' | 'web'): Promise<void> {
    await DeviceToken.findOneAndUpdate(
      { token },
      { userId, token, platform, isActive: true },
      { upsert: true }
    );
  }

  async getNotifications(userId: string, page = 1, limit = 20) {
    const { skip } = getPaginationParams(page, limit);
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments({ userId }),
      Notification.countDocuments({ userId, isRead: false }),
    ]);
    return { notifications, meta: buildPaginationMeta(page, limit, total), unreadCount };
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true, readAt: new Date() }
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return Notification.countDocuments({ userId, isRead: false });
  }
}

export const notificationService = new NotificationService();
