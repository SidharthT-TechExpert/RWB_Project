// Load .env from monorepo root before anything else
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import app from './app';
import { connectDatabase, createRedisClient, createLogger } from '@quickbite/shared';

const logger = createLogger('auth-service');
const PORT = parseInt(process.env.AUTH_SERVICE_PORT || '3001');

const start = async () => {
  await connectDatabase(
    process.env.MONGODB_URI_AUTH || 'mongodb://127.0.0.1:27017/quickbite_auth'
  );

  createRedisClient();

  const server = app.listen(PORT, () => {
    logger.info(`🔐 Auth Service running on port ${PORT}`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received`);
    server.close(() => process.exit(0));
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    process.exit(1);
  });
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', reason);
    process.exit(1);
  });
};

start();
