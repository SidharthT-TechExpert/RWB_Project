// Load .env from monorepo root before anything else
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import app from './app';
import { createRedisClient, createLogger } from '@quickbite/shared';

const logger = createLogger('location-service');
const PORT = parseInt(process.env.LOCATION_SERVICE_PORT || '3010');

const start = async () => {
  createRedisClient();
  const server = app.listen(PORT, () => logger.info(`📍 Location Service running on port ${PORT}`));
  process.on('SIGTERM', () => server.close(() => process.exit(0)));
  process.on('SIGINT', () => server.close(() => process.exit(0)));
};
start();
