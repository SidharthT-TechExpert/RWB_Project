import { Booking, IBooking, IPreOrderItem } from '../models/Booking';
import { Restaurant } from '../models/Restaurant';
import { NotFoundError, AuthorizationError, ValidationError, AppError } from '../errors';
import { BOOKING_STATUS } from '../constants';
import { getPaginationParams, buildPaginationMeta } from '../utils';
import { logger } from '../config/logger';

export class BookingService {
  private generateBookingNumber(): string {
    return `QB${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }

  private calculateTotal(items: IPreOrderItem[], taxPct: number, svcPct: number) {
    const preOrderTotal = items.reduce((sum, item) => {
      const addOnsTotal = (item.addOns || []).reduce((a, addon) => a + addon.price, 0);
      return sum + (item.price + addOnsTotal) * item.quantity;
    }, 0);
    const tax = (preOrderTotal * taxPct) / 100;
    const serviceCharge = (preOrderTotal * svcPct) / 100;
    return { preOrderTotal, tax, serviceCharge, total: preOrderTotal + tax + serviceCharge };
  }

  async createBooking(userId: string, data: {
    restaurantId: string;
    type: 'table' | 'food' | 'both';
    tableId?: string;
    guestCount: number;
    reservationDate: string;
    reservationTime: string;
    preOrderItems?: IPreOrderItem[];
    specialRequests?: string;
  }): Promise<IBooking> {
    const restaurant = await Restaurant.findById(data.restaurantId);
    if (!restaurant) throw new NotFoundError('Restaurant');

    if ((data.type === 'table' || data.type === 'both') && !restaurant.acceptsTableBooking)
      throw new ValidationError('This restaurant does not accept table bookings');
    if ((data.type === 'food' || data.type === 'both') && !restaurant.acceptsPreOrders)
      throw new ValidationError('This restaurant does not accept pre-orders');

    if (data.tableId) {
      const start = new Date(data.reservationDate);
      const end = new Date(data.reservationDate);
      end.setDate(end.getDate() + 1);
      const conflicting = await Booking.findOne({
        restaurantId: data.restaurantId,
        tableId: data.tableId,
        reservationDate: { $gte: start, $lt: end },
        reservationTime: data.reservationTime,
        status: { $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.CHECKED_IN] },
      });
      if (conflicting) throw new ValidationError('Selected table is not available at this time');
    }

    const preOrderItems = data.preOrderItems || [];
    const { preOrderTotal, tax, serviceCharge, total } = this.calculateTotal(
      preOrderItems, restaurant.taxPercentage, restaurant.serviceChargePercentage
    );

    const booking = await Booking.create({
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

    logger.info(`Booking created: ${booking.bookingNumber}`);
    return booking;
  }

  async confirmBooking(bookingId: string): Promise<IBooking> {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new NotFoundError('Booking');
    if (booking.status !== BOOKING_STATUS.PENDING)
      throw new AppError('Booking cannot be confirmed', 400);
    return Booking.findByIdAndUpdate(
      bookingId,
      { status: BOOKING_STATUS.CONFIRMED, confirmedAt: new Date() },
      { new: true }
    ) as Promise<IBooking>;
  }

  async checkIn(bookingId: string): Promise<IBooking> {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new NotFoundError('Booking');
    if (booking.status !== BOOKING_STATUS.CONFIRMED)
      throw new AppError('Booking must be confirmed before check-in', 400);
    return Booking.findByIdAndUpdate(
      bookingId,
      { status: BOOKING_STATUS.CHECKED_IN, checkedInAt: new Date() },
      { new: true }
    ) as Promise<IBooking>;
  }

  async completeBooking(bookingId: string): Promise<IBooking> {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new NotFoundError('Booking');
    return Booking.findByIdAndUpdate(
      bookingId,
      { status: BOOKING_STATUS.COMPLETED, completedAt: new Date() },
      { new: true }
    ) as Promise<IBooking>;
  }

  async cancelBooking(bookingId: string, userId: string, reason?: string): Promise<IBooking> {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new NotFoundError('Booking');
    if (booking.userId !== userId) throw new AuthorizationError();

    const cancellable = [BOOKING_STATUS.PENDING as string, BOOKING_STATUS.CONFIRMED as string];
    if (!cancellable.includes(booking.status))
      throw new AppError('Booking cannot be cancelled', 400);

    const bookingTime = new Date(booking.reservationDate);
    const [hours, minutes] = booking.reservationTime.split(':').map(Number);
    bookingTime.setHours(hours, minutes);
    if (bookingTime.getTime() - Date.now() < 30 * 60 * 1000)
      throw new AppError('Cancellation not allowed within 30 minutes of reservation', 400);

    return Booking.findByIdAndUpdate(
      bookingId,
      { status: BOOKING_STATUS.CANCELLED, cancelledAt: new Date(), cancellationReason: reason, cancelledBy: userId },
      { new: true }
    ) as Promise<IBooking>;
  }

  async getUserBookings(userId: string, page = 1, limit = 20) {
    const { skip } = getPaginationParams(page, limit);
    const [bookings, total] = await Promise.all([
      Booking.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Booking.countDocuments({ userId }),
    ]);
    return { bookings, meta: buildPaginationMeta(page, limit, total) };
  }

  async getRestaurantBookings(restaurantId: string, date?: string, status?: string, page = 1, limit = 20) {
    const { skip } = getPaginationParams(page, limit);
    const query: Record<string, unknown> = { restaurantId };
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      query.reservationDate = { $gte: start, $lt: end };
    }
    if (status) query.status = status;
    const [bookings, total] = await Promise.all([
      Booking.find(query).sort({ reservationDate: 1, reservationTime: 1 }).skip(skip).limit(limit),
      Booking.countDocuments(query),
    ]);
    return { bookings, meta: buildPaginationMeta(page, limit, total) };
  }

  async getBookingById(id: string, userId?: string): Promise<IBooking> {
    const booking = await Booking.findById(id);
    if (!booking) throw new NotFoundError('Booking');
    if (userId && booking.userId !== userId) throw new AuthorizationError();
    return booking;
  }

  async getBookingByNumber(bookingNumber: string): Promise<IBooking> {
    const booking = await Booking.findOne({ bookingNumber });
    if (!booking) throw new NotFoundError('Booking');
    return booking;
  }

  async getRestaurantStats(restaurantId: string, startDate: Date, endDate: Date) {
    const result = await Booking.aggregate([
      { $match: { restaurantId, createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          confirmed: { $sum: { $cond: [{ $eq: ['$status', BOOKING_STATUS.CONFIRMED] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', BOOKING_STATUS.COMPLETED] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', BOOKING_STATUS.CANCELLED] }, 1, 0] } },
          revenue: { $sum: { $cond: [{ $eq: ['$status', BOOKING_STATUS.COMPLETED] }, '$total', 0] } },
        },
      },
    ]);
    return result[0] || { total: 0, confirmed: 0, completed: 0, cancelled: 0, revenue: 0 };
  }
}

export const bookingService = new BookingService();
