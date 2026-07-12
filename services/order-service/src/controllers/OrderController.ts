import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/OrderService';
import { sendSuccess, sendCreated, ROLES } from '@quickbite/shared';

export class OrderController {
  async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await orderService.createOrder(req.user!.userId, req.body);
      sendCreated(res, 'Order created', order);
    } catch (error) { next(error); }
  }

  async getMyOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = req.query;
      const result = await orderService.getUserOrders(req.user!.userId, Number(page) || 1, Number(limit) || 20);
      sendSuccess(res, 'Orders retrieved', result.orders, 200, result.meta);
    } catch (error) { next(error); }
  }

  async getOrderById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await orderService.getOrderById(req.params.id, req.user!.userId);
      sendSuccess(res, 'Order retrieved', order);
    } catch (error) { next(error); }
  }

  async cancelOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await orderService.cancelOrder(req.params.id, req.user!.userId, req.body.reason);
      sendSuccess(res, 'Order cancelled', order);
    } catch (error) { next(error); }
  }

  async reorder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await orderService.reorder(req.params.id, req.user!.userId);
      sendCreated(res, 'Reorder created', order);
    } catch (error) { next(error); }
  }

  async getRestaurantOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { restaurantId } = req.params;
      const { status, page, limit } = req.query;
      const result = await orderService.getRestaurantOrders(restaurantId, status as string, Number(page) || 1, Number(limit) || 20);
      sendSuccess(res, 'Orders retrieved', result.orders, 200, result.meta);
    } catch (error) { next(error); }
  }

  async updateOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const order = await orderService.updateOrderStatus(id, status);
      sendSuccess(res, 'Order status updated', order);
    } catch (error) { next(error); }
  }

  async updateItemStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, itemId } = req.params;
      const { status } = req.body;
      const order = await orderService.updateItemStatus(id, itemId, status);
      sendSuccess(res, 'Item status updated', order);
    } catch (error) { next(error); }
  }
}

export const orderController = new OrderController();
