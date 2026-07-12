import mongoose from 'mongoose';
import { createLogger } from '../logger';

const logger = createLogger('database');

export const connectDatabase = async (uri: string, dbName?: string): Promise<void> => {
  // Force IPv4 — replace localhost with 127.0.0.1 to avoid IPv6 resolution issues on Windows
  const resolvedUri = uri.replace('mongodb://localhost:', 'mongodb://127.0.0.1:');

  try {
    await mongoose.connect(resolvedUri, {
      dbName,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4
    });
    logger.info(`MongoDB connected: ${resolvedUri}`);
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
};

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});
