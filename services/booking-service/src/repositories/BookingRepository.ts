import { Booking, IBooking } from '../models/Booking';
import { NotFoundError, getPaginationParams, buildPaginationMeta, PaginationMeta, BOOKING_STATUS } from '@quickbite/shared';

export class BookingRepository {
  async create(data: Partial<IBooking>): Promise<IBooking> {
    return Booking.create(data);
  }

  async findById(id: string): Promise<IBooking | null> {
    return Booking.findById(id);
  }

  async findByBookingNumber(bookingNumber: string): Promise<IBooking | null> {
    return Booking.findOne({ bookingNumber });
  }

  async findByUserId(
    userId: string,
    page = 1,
    limit = 20
  ): Promise<{ bookings: IBooking[]; meta: PaginationMeta }> {
    const { skip } = getPaginationParams(page, limit);
    const [bookings, total] = await Promise.all([
      Booking.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Booking.countDocuments({ userId }),
    ]);
    return { bookings, meta: buildPaginationMeta(page, limit, total) };
  }

  async findByRestaurantId(
    restaurantId: string,
    date?: string,
    status?: string,
    page = 1,
    limit = 20
  ): Promise<{ bookings: IBooking[]; meta: PaginationMeta }> {
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

  async checkTableAvailability(
    restaurantId: string,
    tableId: string,
    date: Date,
    time: string
  ): Promise<boolean> {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);

    const conflictingBooking = await Booking.findOne({
      restaurantId,
      tableId,
      reservationDate: { $gte: start, $lt: end },
      reservationTime: time,
      status: {
        $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.CHECKED_IN],
      },
    });

    return !conflictingBooking;
  }

  async update(id: string, data: Partial<IBooking>): Promise<IBooking> {
    const booking = await Booking.findByIdAndUpdate(id, data, { new: true });
    if (!booking) throw new NotFoundError('Booking');
    return booking;
  }

  async getRestaurantStats(
    restaurantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    total: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    revenue: number;
  }> {
    const result = await Booking.aggregate([
      {
        $match: {
          restaurantId,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          confirmed: {
            $sum: { $cond: [{ $eq: ['$status', BOOKING_STATUS.CONFIRMED] }, 1, 0] },
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', BOOKING_STATUS.COMPLETED] }, 1, 0] },
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', BOOKING_STATUS.CANCELLED] }, 1, 0] },
          },
          revenue: {
            $sum: {
              $cond: [{ $eq: ['$status', BOOKING_STATUS.COMPLETED] }, '$total', 0],
            },
          },
        },
      },
    ]);

    return result[0] || { total: 0, confirmed: 0, completed: 0, cancelled: 0, revenue: 0 };
  }

  async getPendingReminders(): Promise<IBooking[]> {
    const reminderTime = new Date();
    reminderTime.setHours(reminderTime.getHours() + 2); // 2 hours before

    return Booking.find({
      status: BOOKING_STATUS.CONFIRMED,
      reminderSent: false,
      reservationDate: {
        $lte: reminderTime,
        $gte: new Date(),
      },
    });
  }
}
