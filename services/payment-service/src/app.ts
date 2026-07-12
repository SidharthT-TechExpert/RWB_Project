import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { errorHandler, notFoundHandler } from '@quickbite/shared';
import paymentRoutes from './routes/payment.routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','), credentials: true }));

// Stripe needs raw body for webhook verification
app.use('/api/v1/payments/webhook/stripe', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/health', (_req, res) => {
  res.json({ success: true, service: 'payment-service', timestamp: new Date().toISOString() });
});

app.use('/api/v1/payments', paymentRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
