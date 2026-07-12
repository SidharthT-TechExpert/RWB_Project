import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { errorHandler, notFoundHandler } from '@quickbite/shared';
import userRoutes from './routes/user.routes';

const app = express();
app.use(helmet());
app.use(cors({ origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','), credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.get('/health', (_req, res) => res.json({ success: true, service: 'user-service' }));
app.use('/api/v1/users', userRoutes);
app.use(notFoundHandler);
app.use(errorHandler);
export default app;
