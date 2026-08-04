import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';
import { logger } from '../config/logger';
import { HTTP_STATUS } from '../constants';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: err.message });
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: 'Invalid or expired token' });
    return;
  }

  // Mongo duplicate key
  if ((err as NodeJS.ErrnoException).code === '11000') {
    res.status(HTTP_STATUS.CONFLICT).json({ success: false, message: 'Duplicate entry' });
    return;
  }

  logger.error('Unhandled error:', err);
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
};

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'Route not found' });
};
