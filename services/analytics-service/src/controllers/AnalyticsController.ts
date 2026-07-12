import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/AnalyticsService';
import { sendSuccess } from '@quickbite/shared';

const getDateRange = (startDate?: string, endDate?: string) => ({
  startDate: startDate ? new Date(startDate) : new Date(new Date().setDate(1)),
  endDate: endDate ? new Date(endDate) : new Date(),
});

export class AnalyticsController {
  async track(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { eventType, data, restaurantId } = req.body;
      await analyticsService.track(eventType, data, req.user?.userId, restaurantId);
      sendSuccess(res, 'Event tracked');
    } catch (error) { next(error); }
  }

  async getRestaurantAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { restaurantId } = req.params;
      const { startDate, endDate } = req.query;
      const range = getDateRange(startDate as string, endDate as string);
      const analytics = await analyticsService.getRestaurantAnalytics(restaurantId, range);
      sendSuccess(res, 'Restaurant analytics', analytics);
    } catch (error) { next(error); }
  }

  async getPlatformAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      const range = getDateRange(startDate as string, endDate as string);
      const analytics = await analyticsService.getPlatformAnalytics(range);
      sendSuccess(res, 'Platform analytics', analytics);
    } catch (error) { next(error); }
  }

  async getSalesReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { restaurantId } = req.params;
      const { startDate, endDate } = req.query;
      const range = getDateRange(startDate as string, endDate as string);
      const report = await analyticsService.getSalesReport(restaurantId, range);
      sendSuccess(res, 'Sales report', report);
    } catch (error) { next(error); }
  }
}

export const analyticsController = new AnalyticsController();
