import axios from 'axios';
import {
  NotFoundError,
  AuthorizationError,
  ValidationError,
  AppError,
  BOOKING_STATUS,
  EVENTS,
  HTTP_STATUS,
  publishEvent,
  createLogger,
} from '@quickbite/shared';
import { BookingRepository } from '../repositories/BookingRepository';
import { IBooking, IPreOrderItem, BookingType } from '../models/Booking';

const logger = createLogger('booking-service');
const bookingRepo = new BookingRepository();

const RESTAURANT_SERVICE_URL =
  process.env.RESTAURANT_SERVICE_URL || 'http://localhost:3003';

export interface CreateBookingDTO {
  restaurantId: string;
  type: BookingType;
  tableId?: string;
  guestCount: number;
  reservationDate: string;
  reservationTime: string;
  preOrderItems?: IPreOrderItem[];
  specialRequests?: string;
}

export class BookingService {
  private generateBookingNumber(): string {
    const prefix = 'QB';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }

  private calculateTotal(
    preOrderItems: IPreOrderItem[],
    taxPercentage: number,
    serviceChargePercentage: number
  ) {
    const preOrderTotal = preOrderItems.reduce((sum, item) => {
      const addOnsTotal = (item.addOns || []).reduce((a, addon) => a + addon.price, 0);
      return sum + (item.price + addOnsTotal) * item.quantity;
    }, 0);

    const tax = (preOrderTotal * taxPercentage) / 100;
    const serviceCharge = (preOrderTotal * serviceChargePercentage) / 100;
    const total = preOrderTotal + tax + serviceCharge;

    return { preOrderTotal, tax, serviceCharge, total };
  }

  async createBooking(userId: string, data: CreateBookingDTO): Promise<IBooking> {
    // Fetch restaurant details
    let restaurant: {
      name: string;
      taxPercentage: number;
      serviceChargePercentage: number;
      acceptsPreOrders: boolean;
      acceptsTableBooking: boolean;
    };

    try {
      const response = await axios.get(
        `${RESTAURANT_SERVICE_URL}/api/v1/restaurants/${data.restaurantId}`
      );
      restaurant = response.data.data;
    } catch {
      throw new NotFoundError('Restaurant');
    }

    if (data.type === 'table' || data.type === 'both') {
      if (!restaurant.acceptsTableBooking) {
        throw new ValidationError('This restaurant does not accept table bookings');
      }
    }

    if (data.type === 'food' || data.type === 'both') {
      if (!restaurant.acceptsPreOrders) {
        throw new ValidationError('This restaurant does not accept pre-orders');
      }
    }

    // Check table availability
    if (data.tableId) {
      const isAvailable = await bookingRepo.checkTableAvailability(
        data.restaurantId,
        data.tableId,
        new Date(data.reservationDate),
        data.reservationTime
      );

      if (!isAvailable) {
        throw new ValidationError('Selected table is not available at this time');
      }
    }

    const preOrderItems = data.preOrderItems || [];
    const { preOrderTotal, tax, serviceCharge, total } = this.calculateTotal(
      preOrderItems,
      restaurant.taxPercentage,
      restaurant.serviceChargePercentage
    );

    const booking = await bookingRepo.create({
      bookingNumber: this.generateBookingNumber(),
      userId,
      restaurantId: data.restaurantId,
      restaurantName: restaurant.name,
      type: data.type,
      status: BOOKING_STATUS.PENDING,
      tableId: data.tableId,
      guestCount: data.guestCount,
      reservationDate: new Date(data.reservationDate),
      reservationTime: data.reservationTime,
      preOrderItems,
      preOrderTotal,
      subtotal: preOrderTotal,
      tax,
      serviceCharge,
      total,
      specialRequests: data.specialRequests,
    });

    // Publish event
    publishEvent('booking', EVENTS.BOOKING_CREATED, {
      bookingId: booking._id.toString(),
      bookingNumber: booking.bookingNumber,
      userId,
      restaurantId: data.restaurantId,
      total,
      type: data.type,
    }).catch((err) => logger.error('Failed to publish booking.created:', err));

    logger.info(`Booking created: ${booking.bookingNumber}`);
    return booking;
  }

  async confirmBooking(bookingId: string, restaurantOwnerId?: string): Promise<IBooking> {
    const booking = await bookingRepo.findById(bookingId);
    if (!booking) throw new NotFoundError('Booking');

    if (booking.status !== BOOKING_STATUS.PENDING) {
      throw new AppError('Booking cannot be confirmed', HTTP_STATUS.BAD_REQUEST);
    }

    const updated = await bookingRepo.update(bookingId, {
      status: BOOKING_STATUS.CONFIRMED,
      confirmedAt: new Date(),
    });

    publishEvent('booking', EVENTS.BOOKING_CONFIRMED, {
      bookingId,
      bookingNumber: booking.bookingNumber,
      userId: booking.userId,
      restaurantId: booking.restaurantId,
    }).catch((err) => logger.error('Failed to publish booking.confirmed:', err));

    return updated;
  }

  async checkIn(bookingId: string): Promise<IBooking> {
    const booking = await bookingRepo.findById(bookingId);
    if (!booking) throw new NotFoundError('Booking');

    if (booking.status !== BOOKING_STATUS.CONFIRMED) {
      throw new AppError('Booking must be confirmed before check-in', HTTP_STATUS.BAD_REQUEST);
    }

    return bookingRepo.update(bookingId, {
      status: BOOKING_STATUS.CHECKED_IN,
      checkedInAt: new Date(),
    });
  }

  async completeBooking(bookingId: string): Promise<IBooking> {
    const booking = await bookingRepo.findById(bookingId);
    if (!booking) throw new NotFoundError('Booking');

    return bookingRepo.update(bookingId, {
      status: BOOKING_STATUS.COMPLETED,
      completedAt: new Date(),
    });
  }

  async cancelBooking(
    bookingId: string,
    userId: string,
    reason?: string
  ): Promise<IBooking> {
    const booking = await bookingRepo.findById(bookingId);
    if (!booking) throw new NotFoundError('Booking');

    if (booking.userId !== userId) {
      throw new AuthorizationError();
    }

    const cancellableStatuses: string[] = [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED];
    if (!cancellableStatuses.includes(booking.status)) {
      throw new AppError('Booking cannot be cancelled', HTTP_STATUS.BAD_REQUEST);
    }

    // Check cancellation window (e.g., 30 min before)
    const now = new Date();
    const bookingTime = new Date(booking.reservationDate);
    const [hours, minutes] = booking.reservationTime.split(':').map(Number);
    bookingTime.setHours(hours, minutes);

    if (bookingTime.getTime() - now.getTime() < 30 * 60 * 1000) {
      throw new AppError(
        'Cancellation not allowed within 30 minutes of reservation',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const updated = await bookingRepo.update(bookingId, {
      status: BOOKING_STATUS.CANCELLED,
      cancelledAt: now,
      cancellationReason: reason,
      cancelledBy: userId,
    });

    publishEvent('booking', EVENTS.BOOKING_CANCELLED, {
      bookingId,
      bookingNumber: booking.bookingNumber,
      userId: booking.userId,
      restaurantId: booking.restaurantId,
      total: booking.total,
      paymentStatus: booking.paymentStatus,
    }).catch((err) => logger.error('Failed to publish booking.cancelled:', err));

    return updated;
  }

  async getUserBookings(userId: string, page?: number, limit?: number) {
    return bookingRepo.findByUserId(userId, page, limit);
  }

  async getRestaurantBookings(
    restaurantId: string,
    date?: string,
    status?: string,
    page?: number,
    limit?: number
  ) {
    return bookingRepo.findByRestaurantId(restaurantId, date, status, page, limit);
  }

  async getBookingById(id: string, userId?: string): Promise<IBooking> {
    const booking = await bookingRepo.findById(id);
    if (!booking) throw new NotFoundError('Booking');

    if (userId && booking.userId !== userId) {
      throw new AuthorizationError();
    }

    return booking;
  }

  async getBookingByNumber(bookingNumber: string): Promise<IBooking> {
    const booking = await bookingRepo.findByBookingNumber(bookingNumber);
    if (!booking) throw new NotFoundError('Booking');
    return booking;
  }

  async getRestaurantStats(restaurantId: string, startDate: Date, endDate: Date) {
    return bookingRepo.getRestaurantStats(restaurantId, startDate, endDate);
  }
}

export const bookingService = new BookingService();
