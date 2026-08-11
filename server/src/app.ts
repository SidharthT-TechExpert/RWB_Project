import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import { globalRateLimiter, authRateLimiter } from './middlewares/rateLimiter';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import restaurantRoutes from './routes/restaurant.routes';
import foodRoutes from './routes/food.routes';
import bookingRoutes from './routes/booking.routes';
import orderRoutes from './routes/order.routes';
import paymentRoutes from './routes/payment.routes';
import reviewRoutes from './routes/review.routes';
import searchRoutes from './routes/search.routes';
import locationRoutes from './routes/location.routes';
import notificationRoutes from './routes/notification.routes';
import adminRoutes from './routes/admin.routes';
import analyticsRoutes from './routes/analytics.routes';
import branchRoutes from './routes/branch.routes';
import uploadRoutes from './routes/upload.routes';

const app = express();

// Trust first proxy (nginx)
app.set('trust proxy', 1);

// Security
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

// CORS
const defaultOrigins = 'http://localhost:3000,http://localhost:3001,http://localhost:3002,http://127.0.0.1:3000,http://127.0.0.1:3001';
const configuredOrigins = (process.env.CORS_ORIGIN || defaultOrigins).split(',').map((s) => s.trim());

// Derive the apex domain from FRONTEND_URL or CORS_ORIGIN so both apex + www are always allowed
const frontendUrl = process.env.FRONTEND_URL || '';
const apexMatch = frontendUrl.match(/^https?:\/\/(?:www\.)?([^/]+)/);
const apexDomain = apexMatch ? apexMatch[1] : null;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (!isProduction()) {
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }
    }

    // Always allow both apex and www variants of the configured domain
    if (apexDomain) {
      if (origin === `https://${apexDomain}` || origin === `https://www.${apexDomain}`) {
        return callback(null, true);
      }
    }

    if (configuredOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
}));

// Compression & parsing
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

import { isProduction } from './config/env';

// Logging
app.use(morgan(isProduction() ? 'combined' : 'dev'));

// Rate limiting
app.use(globalRateLimiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'QuickBite API is running', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// API info
app.get('/api/v1', (_req, res) => {
  res.json({ success: true, message: 'QuickBite API v1', docs: '/api/v1/docs' });
});

// Routes
app.use('/api/v1/auth', authRateLimiter, authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/restaurants', restaurantRoutes);
app.use('/api/v1/food', foodRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/location', locationRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/branches', branchRoutes);
app.use('/api/v1/upload', uploadRoutes);

// 404 & error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
