import { Request, Response, NextFunction } from 'express';
import { foodService } from '../services/FoodService';
import { sendSuccess, sendCreated } from '../utils/response';

export class FoodController {
  async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendCreated(res, 'Category created', await foodService.createCategory(req.params.restaurantId, req.body)); }
    catch (error) { next(error); }
  }
  async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Categories retrieved', await foodService.getCategoriesByRestaurant(req.params.restaurantId)); }
    catch (error) { next(error); }
  }
  async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Category updated', await foodService.updateCategory(req.params.categoryId, req.params.restaurantId, req.body)); }
    catch (error) { next(error); }
  }
  async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { await foodService.deleteCategory(req.params.categoryId, req.params.restaurantId); sendSuccess(res, 'Category deleted'); }
    catch (error) { next(error); }
  }
  async createFoodItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendCreated(res, 'Food item created', await foodService.createFoodItem(req.params.restaurantId, req.body)); }
    catch (error) { next(error); }
  }
  async getMenu(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Menu retrieved', await foodService.getMenuByRestaurant(req.params.restaurantId)); }
    catch (error) { next(error); }
  }
  async getFoodItemById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Food item retrieved', await foodService.getFoodItemById(req.params.id)); }
    catch (error) { next(error); }
  }
  async getItemsByCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await foodService.getFoodItemsByCategory(req.params.restaurantId, req.params.categoryId, Number(req.query.page) || 1, Number(req.query.limit) || 20);
      sendSuccess(res, 'Items retrieved', result.items, 200, result.meta);
    } catch (error) { next(error); }
  }
  async updateFoodItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Food item updated', await foodService.updateFoodItem(req.params.id, req.params.restaurantId, req.body)); }
    catch (error) { next(error); }
  }
  async deleteFoodItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { await foodService.deleteFoodItem(req.params.id, req.params.restaurantId); sendSuccess(res, 'Food item deleted'); }
    catch (error) { next(error); }
  }
  async toggleAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await foodService.toggleAvailability(req.params.id, req.params.restaurantId);
      sendSuccess(res, `Item ${item.isAvailable ? 'enabled' : 'disabled'}`, item);
    } catch (error) { next(error); }
  }
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await foodService.searchFoodItems(req.query.q as string, req.query.restaurantId as string, Number(req.query.page) || 1, Number(req.query.limit) || 20);
      sendSuccess(res, 'Search results', result.items, 200, result.meta);
    } catch (error) { next(error); }
  }
  async getPopularItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Popular items', await foodService.getPopularItems(req.params.restaurantId, Number(req.query.limit) || 10)); }
    catch (error) { next(error); }
  }
}

export const foodController = new FoodController();
