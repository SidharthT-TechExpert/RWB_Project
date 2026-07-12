import { Request, Response, NextFunction } from 'express';
import { foodService } from '../services/FoodService';
import { sendSuccess, sendCreated } from '@quickbite/shared';

export class FoodController {
  // Category handlers
  async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { restaurantId } = req.params;
      const category = await foodService.createCategory(restaurantId, req.body);
      sendCreated(res, 'Category created', category);
    } catch (error) { next(error); }
  }

  async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { restaurantId } = req.params;
      const categories = await foodService.getCategoriesByRestaurant(restaurantId);
      sendSuccess(res, 'Categories retrieved', categories);
    } catch (error) { next(error); }
  }

  async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { restaurantId, categoryId } = req.params;
      const category = await foodService.updateCategory(categoryId, restaurantId, req.body);
      sendSuccess(res, 'Category updated', category);
    } catch (error) { next(error); }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { restaurantId, categoryId } = req.params;
      await foodService.deleteCategory(categoryId, restaurantId);
      sendSuccess(res, 'Category deleted');
    } catch (error) { next(error); }
  }

  // Food item handlers
  async createFoodItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { restaurantId } = req.params;
      const item = await foodService.createFoodItem(restaurantId, req.body);
      sendCreated(res, 'Food item created', item);
    } catch (error) { next(error); }
  }

  async getMenu(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { restaurantId } = req.params;
      const menu = await foodService.getMenuByRestaurant(restaurantId);
      sendSuccess(res, 'Menu retrieved', menu);
    } catch (error) { next(error); }
  }

  async getFoodItemById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const item = await foodService.getFoodItemById(id);
      sendSuccess(res, 'Food item retrieved', item);
    } catch (error) { next(error); }
  }

  async getFoodItemsByCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { restaurantId, categoryId } = req.params;
      const { page, limit } = req.query;
      const result = await foodService.getFoodItemsByCategory(
        restaurantId, categoryId, Number(page) || 1, Number(limit) || 20
      );
      sendSuccess(res, 'Items retrieved', result.items, 200, result.meta);
    } catch (error) { next(error); }
  }

  async updateFoodItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { restaurantId, id } = req.params;
      const item = await foodService.updateFoodItem(id, restaurantId, req.body);
      sendSuccess(res, 'Food item updated', item);
    } catch (error) { next(error); }
  }

  async deleteFoodItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { restaurantId, id } = req.params;
      await foodService.deleteFoodItem(id, restaurantId);
      sendSuccess(res, 'Food item deleted');
    } catch (error) { next(error); }
  }

  async toggleAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { restaurantId, id } = req.params;
      const item = await foodService.toggleAvailability(id, restaurantId);
      sendSuccess(res, `Item ${item.isAvailable ? 'enabled' : 'disabled'}`, item);
    } catch (error) { next(error); }
  }

  async searchFoodItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q, restaurantId, page, limit } = req.query;
      const result = await foodService.searchFoodItems(
        q as string,
        restaurantId as string,
        Number(page) || 1,
        Number(limit) || 20
      );
      sendSuccess(res, 'Search results', result.items, 200, result.meta);
    } catch (error) { next(error); }
  }

  async getPopularItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { restaurantId } = req.params;
      const { limit } = req.query;
      const items = await foodService.getPopularItems(restaurantId, Number(limit) || 10);
      sendSuccess(res, 'Popular items retrieved', items);
    } catch (error) { next(error); }
  }
}

export const foodController = new FoodController();
