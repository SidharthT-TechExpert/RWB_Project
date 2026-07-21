import { Response } from 'express';
import { HTTP_STATUS } from '../constants';

export interface PaginationMeta {
  page: number; limit: number; total: number;
  totalPages: number; hasNext: boolean; hasPrev: boolean;
}

export const sendSuccess = <T>(res: Response, message: string, data?: T, statusCode: number = HTTP_STATUS.OK, meta?: PaginationMeta): Response =>
  res.status(statusCode).json({ success: true, message, ...(data !== undefined && { data }), ...(meta && { meta }) });

export const sendCreated = <T>(res: Response, message: string, data?: T): Response =>
  res.status(HTTP_STATUS.CREATED).json({ success: true, message, ...(data !== undefined && { data }) });

export const sendError = (res: Response, message: string, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errors?: Record<string, string[]>): Response =>
  res.status(statusCode).json({ success: false, message, ...(errors && { errors }) });
