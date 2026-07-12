import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { errorHandler, notFoundHandler } from '@quickbite/shared';
import adminRoutes from './routes/admin.routes';

const app = express();
app.use(helmet());
app.use(cors({ origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','), credentials: true }));
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.get('/health', (_req, res) => res.json({ success: true, service: 'admin-service' }));
app.use('/api/v1/admin', adminRoutes);
app.use(notFoundHandler);
app.use(errorHandler);
export default app;
