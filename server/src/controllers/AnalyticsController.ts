import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/AnalyticsService';
import { sendSuccess } from '../utils/response';

const getRange = (startDate?: string, endDate?: string) => ({
  startDate: startDate ? new Date(startDate) : new Date(new Date().setDate(1)),
  endDate: endDate ? new Date(endDate) : new Date(),
});

export class AnalyticsController {
  async track(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await analyticsService.track(req.body.eventType, req.body.data, req.user?.userId, req.body.restaurantId);
      sendSuccess(res, 'Event tracked');
    } catch (error) { next(error); }
  }
  async getRestaurantAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Restaurant analytics', await analyticsService.getRestaurantAnalytics(req.params.restaurantId, getRange(req.query.startDate as string, req.query.endDate as string))); }
    catch (error) { next(error); }
  }
  async getSalesReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Sales report', await analyticsService.getSalesReport(req.params.restaurantId, getRange(req.query.startDate as string, req.query.endDate as string))); }
    catch (error) { next(error); }
  }
  async getPlatformAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Platform analytics', await analyticsService.getPlatformAnalytics(getRange(req.query.startDate as string, req.query.endDate as string))); }
    catch (error) { next(error); }
  }
}

export const analyticsController = new AnalyticsController();
