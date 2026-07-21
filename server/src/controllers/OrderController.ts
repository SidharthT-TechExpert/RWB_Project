import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/OrderService';
import { sendSuccess, sendCreated } from '../utils/response';

export class OrderController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendCreated(res, 'Order created', await orderService.createOrder(req.user!.userId, req.body)); }
    catch (error) { next(error); }
  }
  async getMyOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await orderService.getUserOrders(req.user!.userId, Number(req.query.page) || 1, Number(req.query.limit) || 20);
      sendSuccess(res, 'Orders retrieved', result.orders, 200, result.meta);
    } catch (error) { next(error); }
  }
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Order retrieved', await orderService.getOrderById(req.params.id, req.user!.userId)); }
    catch (error) { next(error); }
  }
  async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Order cancelled', await orderService.cancelOrder(req.params.id, req.user!.userId, req.body.reason)); }
    catch (error) { next(error); }
  }
  async reorder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendCreated(res, 'Reorder created', await orderService.reorder(req.params.id, req.user!.userId)); }
    catch (error) { next(error); }
  }
  async getRestaurantOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await orderService.getRestaurantOrders(req.params.restaurantId, req.query.status as string, Number(req.query.page) || 1, Number(req.query.limit) || 20);
      sendSuccess(res, 'Orders retrieved', result.orders, 200, result.meta);
    } catch (error) { next(error); }
  }
  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Order status updated', await orderService.updateOrderStatus(req.params.id, req.body.status)); }
    catch (error) { next(error); }
  }
  async updateItemStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Item status updated', await orderService.updateItemStatus(req.params.id, req.params.itemId, req.body.status)); }
    catch (error) { next(error); }
  }
}

export const orderController = new OrderController();
