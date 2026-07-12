import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/NotificationService';
import { sendSuccess } from '@quickbite/shared';

export class NotificationController {
  async getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = req.query;
      const result = await notificationService.getNotifications(req.user!.userId, Number(page) || 1, Number(limit) || 20);
      sendSuccess(res, 'Notifications retrieved', result.notifications, 200, result.meta);
    } catch (error) { next(error); }
  }

  async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const count = await notificationService.getUnreadCount(req.user!.userId);
      sendSuccess(res, 'Unread count', { count });
    } catch (error) { next(error); }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await notificationService.markAsRead(req.params.id, req.user!.userId);
      sendSuccess(res, 'Marked as read');
    } catch (error) { next(error); }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await notificationService.markAllAsRead(req.user!.userId);
      sendSuccess(res, 'All notifications marked as read');
    } catch (error) { next(error); }
  }

  async registerDeviceToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, platform } = req.body;
      await notificationService.registerDeviceToken(req.user!.userId, token, platform);
      sendSuccess(res, 'Device token registered');
    } catch (error) { next(error); }
  }
}

export const notificationController = new NotificationController();
