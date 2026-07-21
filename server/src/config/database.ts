import mongoose from 'mongoose';
import { logger } from './logger';

export const connectDatabase = async (): Promise<void> => {
  const uri = (process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/quickbite')
    .replace('mongodb://localhost:', 'mongodb://127.0.0.1:');

  try {
    await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
    });
    logger.info(`MongoDB connected: ${uri}`);
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

mongoose.connection.on('error', (err) => logger.error('MongoDB error:', err));
mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
