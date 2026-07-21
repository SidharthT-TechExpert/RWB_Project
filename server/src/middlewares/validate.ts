import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { HTTP_STATUS } from '../constants';

export const validate = (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        error.errors.forEach((e) => {
          const key = e.path.join('.');
          if (!errors[key]) errors[key] = [];
          errors[key].push(e.message);
        });
        res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'Validation failed', errors });
        return;
      }
      next(error);
    }
  };
