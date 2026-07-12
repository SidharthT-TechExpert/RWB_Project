import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import { createLogger } from '@quickbite/shared';

const logger = createLogger('api-gateway');

export const requestLogger = morgan(
  ':method :url :status :response-time ms - :res[content-length]',
  {
    stream: {
      write: (message: string) => logger.http(message.trim()),
    },
  }
);

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  req.headers['x-request-id'] = requestId as string;
  res.setHeader('x-request-id', requestId);
  next();
};
