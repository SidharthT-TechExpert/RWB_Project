import {
  NotFoundError,
  AuthorizationError,
  AppError,
  ORDER_STATUS,
  EVENTS,
  HTTP_STATUS,
  publishEvent,
  getPaginationParams,
  buildPaginationMeta,
  createLogger,
} from '@quickbite/shared';
import { Order, IOrder, IOrderItem } from '../models/Order';

const logger = createLogger('order-service');

export interface CreateOrderDTO {
  restaurantId: string;
  restaurantName: string;
  bookingId?: string;
  items: Omit<IOrderItem, 'status'>[];
  tax: number;
  serviceCharge: number;
  discount?: number;
  currency?: string;
  specialInstructions?: string;
}

export class OrderService {
  private generateOrderNumber(): string {
    return `ORD${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }

  async createOrder(userId: string, data: CreateOrderDTO): Promise<IOrder> {
    const subtotal = data.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const total = subtotal + data.tax + data.serviceCharge - (data.discount || 0);

    const estimatedCompletionTime = new Date(Date.now() + 30 * 60 * 1000); // 30 min default

    const order = await Order.create({
      orderNumber: this.generateOrderNumber(),
      userId,
      restaurantId: data.restaurantId,
      restaurantName: data.restaurantName,
      bookingId: data.bookingId,
      items: data.items.map((item) => ({ ...item, status: 'pending' })),
      status: ORDER_STATUS.PENDING,
      subtotal,
      tax: data.tax,
      serviceCharge: data.serviceCharge,
      discount: data.discount || 0,
      total,
      currency: data.currency || 'INR',
      specialInstructions: data.specialInstructions,
      estimatedCompletionTime,
    });

    publishEvent('order', EVENTS.ORDER_CREATED, {
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      userId,
      restaurantId: data.restaurantId,
      total,
    }).catch((err) => logger.error('Failed to publish order.created:', err));

    logger.info(`Order created: ${order.orderNumber}`);
    return order;
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    restaurantId?: string
  ): Promise<IOrder> {
    const order = await Order.findById(orderId);
    if (!order) throw new NotFoundError('Order');
    if (restaurantId && order.restaurantId !== restaurantId) throw new AuthorizationError();

    const updates: Partial<IOrder> = { status };

    if (status === ORDER_STATUS.DELIVERED) {
      updates.actualCompletionTime = new Date();
    }
    if (status === ORDER_STATUS.CANCELLED) {
      updates.cancelledAt = new Date();
    }

    Object.assign(order, updates);
    await order.save();

    publishEvent('order', EVENTS.ORDER_STATUS_UPDATED, {
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      userId: order.userId,
      restaurantId: order.restaurantId,
      status,
    }).catch((err) => logger.error('Failed to publish order.status.updated:', err));

    return order;
  }

  async cancelOrder(orderId: string, userId: string, reason?: string): Promise<IOrder> {
    const order = await Order.findById(orderId);
    if (!order) throw new NotFoundError('Order');
    if (order.userId !== userId) throw new AuthorizationError();

    if ([ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED].includes(order.status)) {
      throw new AppError('Order cannot be cancelled', HTTP_STATUS.BAD_REQUEST);
    }

    return this.updateOrderStatus(orderId, ORDER_STATUS.CANCELLED);
  }

  async getOrderById(id: string, userId?: string): Promise<IOrder> {
    const order = await Order.findById(id);
    if (!order) throw new NotFoundError('Order');
    if (userId && order.userId !== userId) throw new AuthorizationError();
    return order;
  }

  async getUserOrders(userId: string, page = 1, limit = 20) {
    const { skip } = getPaginationParams(page, limit);
    const [orders, total] = await Promise.all([
      Order.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments({ userId }),
    ]);
    return { orders, meta: buildPaginationMeta(page, limit, total) };
  }

  async getRestaurantOrders(
    restaurantId: string,
    status?: string,
    page = 1,
    limit = 20
  ) {
    const { skip } = getPaginationParams(page, limit);
    const filter: Record<string, unknown> = { restaurantId };
    if (status) filter.status = status;

    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);
    return { orders, meta: buildPaginationMeta(page, limit, total) };
  }

  async reorder(originalOrderId: string, userId: string): Promise<IOrder> {
    const original = await Order.findById(originalOrderId);
    if (!original) throw new NotFoundError('Order');
    if (original.userId !== userId) throw new AuthorizationError();

    return this.createOrder(userId, {
      restaurantId: original.restaurantId,
      restaurantName: original.restaurantName,
      bookingId: undefined,
      items: original.items,
      tax: original.tax,
      serviceCharge: original.serviceCharge,
      discount: 0,
      currency: original.currency,
      specialInstructions: original.specialInstructions,
    });
  }

  async updateItemStatus(
    orderId: string,
    itemId: string,
    status: 'pending' | 'preparing' | 'ready'
  ): Promise<IOrder> {
    const order = await Order.findOneAndUpdate(
      { _id: orderId, 'items._id': itemId },
      { $set: { 'items.$.status': status } },
      { new: true }
    );
    if (!order) throw new NotFoundError('Order or item');
    return order;
  }
}

type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const orderService = new OrderService();
