import { Request, Response, NextFunction } from 'express';
import { bookingService } from '../services/BookingService';
import { sendSuccess, sendCreated, createLogger } from '@quickbite/shared';

const logger = createLogger('booking-controller');

export class BookingController {
  async createBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const booking = await bookingService.createBooking(userId, req.body);
      sendCreated(res, 'Booking created successfully', booking);
    } catch (error) {
      next(error);
    }
  }

  async getMyBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { page, limit } = req.query;
      const result = await bookingService.getUserBookings(
        userId,
        page ? Number(page) : undefined,
        limit ? Number(limit) : undefined
      );
      sendSuccess(res, 'Bookings retrieved', result.bookings, 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  async getBookingById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const booking = await bookingService.getBookingById(id, userId);
      sendSuccess(res, 'Booking retrieved', booking);
    } catch (error) {
      next(error);
    }
  }

  async getBookingByNumber(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bookingNumber } = req.params;
      const booking = await bookingService.getBookingByNumber(bookingNumber);
      sendSuccess(res, 'Booking retrieved', booking);
    } catch (error) {
      next(error);
    }
  }

  async cancelBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const { reason } = req.body;
      const booking = await bookingService.cancelBooking(id, userId, reason);
      sendSuccess(res, 'Booking cancelled', booking);
    } catch (error) {
      next(error);
    }
  }

  // Restaurant owner / admin routes
  async getRestaurantBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { restaurantId } = req.params;
      const { date, status, page, limit } = req.query;
      const result = await bookingService.getRestaurantBookings(
        restaurantId,
        date as string,
        status as string,
        page ? Number(page) : undefined,
        limit ? Number(limit) : undefined
      );
      sendSuccess(res, 'Restaurant bookings retrieved', result.bookings, 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  async confirmBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const booking = await bookingService.confirmBooking(id);
      sendSuccess(res, 'Booking confirmed', booking);
    } catch (error) {
      next(error);
    }
  }

  async checkIn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const booking = await bookingService.checkIn(id);
      sendSuccess(res, 'Checked in successfully', booking);
    } catch (error) {
      next(error);
    }
  }

  async completeBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const booking = await bookingService.completeBooking(id);
      sendSuccess(res, 'Booking completed', booking);
    } catch (error) {
      next(error);
    }
  }

  async getRestaurantStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { restaurantId } = req.params;
      const { startDate, endDate } = req.query;
      const stats = await bookingService.getRestaurantStats(
        restaurantId,
        startDate ? new Date(startDate as string) : new Date(new Date().setDate(1)),
        endDate ? new Date(endDate as string) : new Date()
      );
      sendSuccess(res, 'Stats retrieved', stats);
    } catch (error) {
      next(error);
    }
  }
}

export const bookingController = new BookingController();
