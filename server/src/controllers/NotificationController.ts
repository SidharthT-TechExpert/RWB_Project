import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/NotificationService';
import { sendSuccess } from '../utils/response';

export class NotificationController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await notificationService.getNotifications(req.user!.userId, Number(req.query.page) || 1, Number(req.query.limit) || 20);
      sendSuccess(res, 'Notifications retrieved', result.notifications, 200, result.meta);
    } catch (error) { next(error); }
  }
  async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Unread count', { count: await notificationService.getUnreadCount(req.user!.userId) }); }
    catch (error) { next(error); }
  }
  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { await notificationService.markAsRead(req.params.id, req.user!.userId); sendSuccess(res, 'Marked as read'); }
    catch (error) { next(error); }
  }
  async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { await notificationService.markAllAsRead(req.user!.userId); sendSuccess(res, 'All marked as read'); }
    catch (error) { next(error); }
  }
  async registerDeviceToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { await notificationService.registerDeviceToken(req.user!.userId, req.body.token, req.body.platform); sendSuccess(res, 'Device token registered'); }
    catch (error) { next(error); }
  }
}

export const notificationController = new NotificationController();
