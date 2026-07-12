// Load .env from monorepo root before anything else
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import app from './app';
import { connectDatabase, createRedisClient, createLogger, consumeEvent, EVENTS } from '@quickbite/shared';
import { analyticsService } from './services/AnalyticsService';

const logger = createLogger('analytics-service');
const PORT = parseInt(process.env.ANALYTICS_SERVICE_PORT || '3013');

const start = async () => {
  await connectDatabase(process.env.MONGODB_URI_ANALYTICS || 'mongodb://127.0.0.1:27017/quickbite_analytics');
  createRedisClient();

  // Subscribe to all events for analytics
  try {
    await consumeEvent('booking', EVENTS.BOOKING_CREATED, 'analytics.booking.created', async (data: unknown) => {
      const d = data as { userId: string; restaurantId: string; total: number; type: string };
      await analyticsService.track('booking.created', d, d.userId, d.restaurantId);
    });

    await consumeEvent('payment', EVENTS.PAYMENT_COMPLETED, 'analytics.payment.completed', async (data: unknown) => {
      const d = data as { userId: string; restaurantId?: string; amount: number };
      await analyticsService.track('payment.completed', d, d.userId, d.restaurantId);
    });

    await consumeEvent('order', EVENTS.ORDER_CREATED, 'analytics.order.created', async (data: unknown) => {
      const d = data as { userId: string; restaurantId: string; total: number };
      await analyticsService.track('order.created', d, d.userId, d.restaurantId);
    });
  } catch (err) {
    logger.warn('RabbitMQ not available, event tracking disabled');
  }

  const server = app.listen(PORT, () => logger.info(`📊 Analytics Service running on port ${PORT}`));
  process.on('SIGTERM', () => server.close(() => process.exit(0)));
  process.on('SIGINT', () => server.close(() => process.exit(0)));
};
start();
