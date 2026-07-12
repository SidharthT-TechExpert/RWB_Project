// Load .env from monorepo root before anything else
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import app from './app';
import { connectDatabase, createLogger } from '@quickbite/shared';

const logger = createLogger('review-service');
const PORT = parseInt(process.env.REVIEW_SERVICE_PORT || '3008');

const start = async () => {
  await connectDatabase(process.env.MONGODB_URI_REVIEW || 'mongodb://127.0.0.1:27017/quickbite_review');
  const server = app.listen(PORT, () => logger.info(`⭐ Review Service running on port ${PORT}`));
  process.on('SIGTERM', () => server.close(() => process.exit(0)));
  process.on('SIGINT', () => server.close(() => process.exit(0)));
};
start();
