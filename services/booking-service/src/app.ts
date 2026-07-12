import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { errorHandler, notFoundHandler } from '@quickbite/shared';
import bookingRoutes from './routes/booking.routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','), credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/health', (_req, res) => {
  res.json({ success: true, service: 'booking-service', timestamp: new Date().toISOString() });
});

app.use('/api/v1/bookings', bookingRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
