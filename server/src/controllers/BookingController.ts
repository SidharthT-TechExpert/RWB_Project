import { Request, Response, NextFunction } from 'express';
import { bookingService } from '../services/BookingService';
import { sendSuccess, sendCreated } from '../utils/response';

export class BookingController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendCreated(res, 'Booking created', await bookingService.createBooking(req.user!.userId, req.body)); }
    catch (error) { next(error); }
  }
  async getMyBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await bookingService.getUserBookings(req.user!.userId, Number(req.query.page) || 1, Number(req.query.limit) || 20);
      sendSuccess(res, 'Bookings retrieved', result.bookings, 200, result.meta);
    } catch (error) { next(error); }
  }
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Booking retrieved', await bookingService.getBookingById(req.params.id, req.user!.userId)); }
    catch (error) { next(error); }
  }
  async getByNumber(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Booking retrieved', await bookingService.getBookingByNumber(req.params.bookingNumber)); }
    catch (error) { next(error); }
  }
  async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Booking cancelled', await bookingService.cancelBooking(req.params.id, req.user!.userId, req.body.reason)); }
    catch (error) { next(error); }
  }
  async getRestaurantBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { date, status, page, limit } = req.query;
      const result = await bookingService.getRestaurantBookings(req.params.restaurantId, date as string, status as string, Number(page) || 1, Number(limit) || 20);
      sendSuccess(res, 'Restaurant bookings', result.bookings, 200, result.meta);
    } catch (error) { next(error); }
  }
  async confirm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Booking confirmed', await bookingService.confirmBooking(req.params.id)); }
    catch (error) { next(error); }
  }
  async checkIn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Checked in', await bookingService.checkIn(req.params.id)); }
    catch (error) { next(error); }
  }
  async complete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Booking completed', await bookingService.completeBooking(req.params.id)); }
    catch (error) { next(error); }
  }
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      const stats = await bookingService.getRestaurantStats(req.params.restaurantId, startDate ? new Date(startDate as string) : new Date(new Date().setDate(1)), endDate ? new Date(endDate as string) : new Date());
      sendSuccess(res, 'Stats retrieved', stats);
    } catch (error) { next(error); }
  }
}

export const bookingController = new BookingController();
