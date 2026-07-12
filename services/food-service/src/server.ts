// Load .env from monorepo root before anything else
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import app from './app';
import { connectDatabase, createRedisClient, createLogger } from '@quickbite/shared';

const logger = createLogger('food-service');
const PORT = parseInt(process.env.FOOD_SERVICE_PORT || '3004');

const start = async () => {
  await connectDatabase(process.env.MONGODB_URI_FOOD || 'mongodb://127.0.0.1:27017/quickbite_food');
  createRedisClient();

  const server = app.listen(PORT, () => {
    logger.info(`🍱 Food Service running on port ${PORT}`);
  });

  process.on('SIGTERM', () => server.close(() => process.exit(0)));
  process.on('SIGINT', () => server.close(() => process.exit(0)));
};

start();
