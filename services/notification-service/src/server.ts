// Load .env from monorepo root before anything else
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import app from './app';
import { connectDatabase, connectRabbitMQ, createLogger, EVENTS } from '@quickbite/shared';
import { notificationService } from './services/NotificationService';

const logger = createLogger('notification-service');
const PORT = parseInt(process.env.NOTIFICATION_SERVICE_PORT || '3011');

const start = async () => {
  await connectDatabase(process.env.MONGODB_URI_NOTIFICATION || 'mongodb://127.0.0.1:27017/quickbite_notification');

  // Subscribe to events
  try {
    const { consumeEvent } = await import('@quickbite/shared');
    await consumeEvent('booking', EVENTS.BOOKING_CONFIRMED, 'notification.booking.confirmed', async (data: unknown) => {
      const d = data as { userId: string; bookingNumber: string };
      await notificationService.send({
        userId: d.userId,
        type: 'booking_confirmed',
        title: 'Booking Confirmed! 🎉',
        body: `Your booking ${d.bookingNumber} has been confirmed.`,
        channels: ['push', 'in_app'],
      });
    });
  } catch (err) {
    logger.warn('RabbitMQ not available, skipping event subscriptions');
  }

  const server = app.listen(PORT, () => logger.info(`🔔 Notification Service running on port ${PORT}`));
  process.on('SIGTERM', () => server.close(() => process.exit(0)));
  process.on('SIGINT', () => server.close(() => process.exit(0)));
};
start();
