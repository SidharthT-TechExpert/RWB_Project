// Load .env from monorepo root before anything else
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import app from './app';
import { connectDatabase, createRedisClient, createLogger } from '@quickbite/shared';

const logger = createLogger('booking-service');
const PORT = parseInt(process.env.BOOKING_SERVICE_PORT || '3005');

const start = async () => {
  await connectDatabase(
    process.env.MONGODB_URI_BOOKING || 'mongodb://127.0.0.1:27017/quickbite_booking'
  );
  createRedisClient();

  const server = app.listen(PORT, () => {
    logger.info(`📅 Booking Service running on port ${PORT}`);
  });

  const shutdown = (signal: string) => {
    logger.info(`${signal} received`);
    server.close(() => process.exit(0));
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

start();
