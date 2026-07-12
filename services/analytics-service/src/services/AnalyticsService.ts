import {
  setCache,
  getCache,
  CACHE_TTL,
  createLogger,
} from '@quickbite/shared';
import { AnalyticsEvent } from '../models/Event';

const logger = createLogger('analytics-service');

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export class AnalyticsService {
  async track(
    eventType: string,
    data: Record<string, unknown>,
    userId?: string,
    restaurantId?: string
  ): Promise<void> {
    await AnalyticsEvent.create({ eventType, userId, restaurantId, data });
  }

  async getRestaurantAnalytics(restaurantId: string, range: DateRange) {
    const cacheKey = `analytics:restaurant:${restaurantId}:${range.startDate.toISOString()}:${range.endDate.toISOString()}`;
    const cached = await getCache(cacheKey);
    if (cached) return cached;

    const [bookingStats, orderStats, revenueByDay, topFoods, peakHours] = await Promise.all([
      // Booking stats from events
      AnalyticsEvent.aggregate([
        {
          $match: {
            eventType: { $in: ['booking.created', 'booking.confirmed', 'booking.cancelled', 'booking.completed'] },
            restaurantId,
            timestamp: { $gte: range.startDate, $lte: range.endDate },
          },
        },
        { $group: { _id: '$eventType', count: { $sum: 1 } } },
      ]),

      // Order stats
      AnalyticsEvent.aggregate([
        {
          $match: {
            eventType: { $in: ['order.created', 'order.delivered', 'order.cancelled'] },
            restaurantId,
            timestamp: { $gte: range.startDate, $lte: range.endDate },
          },
        },
        { $group: { _id: '$eventType', count: { $sum: 1 }, revenue: { $sum: '$data.total' } } },
      ]),

      // Revenue by day
      AnalyticsEvent.aggregate([
        {
          $match: {
            eventType: 'payment.completed',
            restaurantId,
            timestamp: { $gte: range.startDate, $lte: range.endDate },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            revenue: { $sum: '$data.amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Top food items
      AnalyticsEvent.aggregate([
        {
          $match: {
            eventType: 'order.item.ordered',
            restaurantId,
            timestamp: { $gte: range.startDate, $lte: range.endDate },
          },
        },
        { $group: { _id: '$data.foodItemId', name: { $first: '$data.name' }, count: { $sum: '$data.quantity' } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // Peak hours
      AnalyticsEvent.aggregate([
        {
          $match: {
            eventType: 'booking.created',
            restaurantId,
            timestamp: { $gte: range.startDate, $lte: range.endDate },
          },
        },
        { $group: { _id: { $hour: '$timestamp' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const result = {
      bookingStats: Object.fromEntries(bookingStats.map((s) => [s._id.replace('.', '_'), s.count])),
      orderStats: Object.fromEntries(orderStats.map((s) => [s._id.replace('.', '_'), { count: s.count, revenue: s.revenue }])),
      revenueByDay,
      topFoods,
      peakHours,
    };

    await setCache(cacheKey, result, CACHE_TTL.MEDIUM);
    return result;
  }

  async getPlatformAnalytics(range: DateRange) {
    const cacheKey = `analytics:platform:${range.startDate.toISOString()}:${range.endDate.toISOString()}`;
    const cached = await getCache(cacheKey);
    if (cached) return cached;

    const [totalEvents, userGrowth, revenueStats, topRestaurants] = await Promise.all([
      AnalyticsEvent.countDocuments({ timestamp: { $gte: range.startDate, $lte: range.endDate } }),

      AnalyticsEvent.aggregate([
        {
          $match: {
            eventType: 'user.registered',
            timestamp: { $gte: range.startDate, $lte: range.endDate },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      AnalyticsEvent.aggregate([
        {
          $match: {
            eventType: 'payment.completed',
            timestamp: { $gte: range.startDate, $lte: range.endDate },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$data.amount' },
            totalTransactions: { $sum: 1 },
            avgOrderValue: { $avg: '$data.amount' },
          },
        },
      ]),

      AnalyticsEvent.aggregate([
        {
          $match: {
            eventType: 'booking.completed',
            timestamp: { $gte: range.startDate, $lte: range.endDate },
          },
        },
        { $group: { _id: '$restaurantId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const result = {
      totalEvents,
      userGrowth,
      revenueStats: revenueStats[0] || { totalRevenue: 0, totalTransactions: 0, avgOrderValue: 0 },
      topRestaurants,
    };

    await setCache(cacheKey, result, CACHE_TTL.MEDIUM);
    return result;
  }

  async getSalesReport(restaurantId: string, range: DateRange) {
    const dailyRevenue = await AnalyticsEvent.aggregate([
      {
        $match: {
          eventType: 'payment.completed',
          restaurantId,
          timestamp: { $gte: range.startDate, $lte: range.endDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          revenue: { $sum: '$data.amount' },
          bookings: { $sum: { $cond: [{ $eq: ['$data.type', 'booking'] }, 1, 0] } },
          orders: { $sum: { $cond: [{ $eq: ['$data.type', 'order'] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const totals = dailyRevenue.reduce(
      (acc, day) => ({
        totalRevenue: acc.totalRevenue + day.revenue,
        totalBookings: acc.totalBookings + day.bookings,
        totalOrders: acc.totalOrders + day.orders,
      }),
      { totalRevenue: 0, totalBookings: 0, totalOrders: 0 }
    );

    return { dailyRevenue, totals };
  }
}

export const analyticsService = new AnalyticsService();
