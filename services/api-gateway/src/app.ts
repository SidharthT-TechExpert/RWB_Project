import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { errorHandler, notFoundHandler } from '@quickbite/shared';
import { globalRateLimiter } from './middlewares/rateLimiter';
import { requestLogger, requestIdMiddleware } from './middlewares/requestLogger';
import proxyRoutes from './routes/proxy';

const app = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS
app.use(cors({
  origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
}));

// Compression
app.use(compression());

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request ID & logging
app.use(requestIdMiddleware);
app.use(requestLogger);

// Rate limiting
app.use(globalRateLimiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API Gateway is running',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

// API info
app.get('/api/v1', (_req, res) => {
  res.json({
    success: true,
    message: 'QuickBite API v1',
    services: [
      'auth', 'users', 'restaurants', 'food', 'bookings',
      'orders', 'payments', 'reviews', 'search', 'location',
      'notifications', 'admin', 'analytics',
    ],
    docs: '/api/v1/docs',
  });
});

// Proxy routes
app.use(proxyRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

export default app;
