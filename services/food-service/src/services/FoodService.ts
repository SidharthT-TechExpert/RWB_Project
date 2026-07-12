import {
  NotFoundError,
  AuthorizationError,
  generateSlug,
  setCache,
  getCache,
  deleteCache,
  CACHE_TTL,
  getPaginationParams,
  buildPaginationMeta,
  createLogger,
} from '@quickbite/shared';
import { FoodItem, IFoodItem } from '../models/FoodItem';
import { Category, ICategory } from '../models/Category';

const logger = createLogger('food-service');

export class FoodService {
  // Categories
  async createCategory(
    restaurantId: string,
    data: Partial<ICategory>
  ): Promise<ICategory> {
    const slug = generateSlug(data.name!);
    const existing = await Category.findOne({ restaurantId, slug });

    return Category.create({
      ...data,
      restaurantId,
      slug: existing ? `${slug}-${Date.now()}` : slug,
    });
  }

  async getCategoriesByRestaurant(restaurantId: string): Promise<ICategory[]> {
    const cacheKey = `categories:${restaurantId}`;
    const cached = await getCache<ICategory[]>(cacheKey);
    if (cached) return cached;

    const categories = await Category.find({ restaurantId, isActive: true })
      .sort({ displayOrder: 1, name: 1 });

    await setCache(cacheKey, categories, CACHE_TTL.MEDIUM);
    return categories;
  }

  async updateCategory(
    id: string,
    restaurantId: string,
    data: Partial<ICategory>
  ): Promise<ICategory> {
    const category = await Category.findOneAndUpdate(
      { _id: id, restaurantId },
      data,
      { new: true }
    );
    if (!category) throw new NotFoundError('Category');
    await deleteCache(`categories:${restaurantId}`);
    return category;
  }

  async deleteCategory(id: string, restaurantId: string): Promise<void> {
    await Category.findOneAndDelete({ _id: id, restaurantId });
    await deleteCache(`categories:${restaurantId}`);
  }

  // Food Items
  async createFoodItem(
    restaurantId: string,
    data: Partial<IFoodItem>
  ): Promise<IFoodItem> {
    const slug = generateSlug(data.name!);
    const existing = await FoodItem.findOne({ restaurantId, slug });

    const item = await FoodItem.create({
      ...data,
      restaurantId,
      slug: existing ? `${slug}-${Date.now()}` : slug,
    });

    await deleteCache(`menu:${restaurantId}`);
    return item;
  }

  async getMenuByRestaurant(restaurantId: string): Promise<{
    categories: ICategory[];
    items: IFoodItem[];
  }> {
    const cacheKey = `menu:${restaurantId}`;
    const cached = await getCache<{ categories: ICategory[]; items: IFoodItem[] }>(cacheKey);
    if (cached) return cached;

    const [categories, items] = await Promise.all([
      Category.find({ restaurantId, isActive: true }).sort({ displayOrder: 1 }),
      FoodItem.find({ restaurantId, isAvailable: true }).sort({ categoryId: 1, name: 1 }),
    ]);

    const result = { categories, items };
    await setCache(cacheKey, result, CACHE_TTL.MEDIUM);
    return result;
  }

  async getFoodItemById(id: string): Promise<IFoodItem> {
    const item = await FoodItem.findById(id);
    if (!item) throw new NotFoundError('Food item');
    return item;
  }

  async getFoodItemsByCategory(
    restaurantId: string,
    categoryId: string,
    page = 1,
    limit = 20
  ) {
    const { skip } = getPaginationParams(page, limit);
    const [items, total] = await Promise.all([
      FoodItem.find({ restaurantId, categoryId, isAvailable: true })
        .skip(skip)
        .limit(limit)
        .sort({ isPopular: -1, name: 1 }),
      FoodItem.countDocuments({ restaurantId, categoryId, isAvailable: true }),
    ]);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async updateFoodItem(
    id: string,
    restaurantId: string,
    data: Partial<IFoodItem>
  ): Promise<IFoodItem> {
    const item = await FoodItem.findOneAndUpdate(
      { _id: id, restaurantId },
      data,
      { new: true }
    );
    if (!item) throw new NotFoundError('Food item');
    await deleteCache(`menu:${restaurantId}`);
    return item;
  }

  async deleteFoodItem(id: string, restaurantId: string): Promise<void> {
    const item = await FoodItem.findOneAndDelete({ _id: id, restaurantId });
    if (!item) throw new NotFoundError('Food item');
    await deleteCache(`menu:${restaurantId}`);
  }

  async toggleAvailability(id: string, restaurantId: string): Promise<IFoodItem> {
    const item = await FoodItem.findOne({ _id: id, restaurantId });
    if (!item) throw new NotFoundError('Food item');
    item.isAvailable = !item.isAvailable;
    await item.save();
    await deleteCache(`menu:${restaurantId}`);
    return item;
  }

  async searchFoodItems(query: string, restaurantId?: string, page = 1, limit = 20) {
    const { skip } = getPaginationParams(page, limit);
    const filter: Record<string, unknown> = {
      $text: { $search: query },
      isAvailable: true,
    };
    if (restaurantId) filter.restaurantId = restaurantId;

    const [items, total] = await Promise.all([
      FoodItem.find(filter, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(limit),
      FoodItem.countDocuments(filter),
    ]);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async getPopularItems(restaurantId: string, limit = 10): Promise<IFoodItem[]> {
    return FoodItem.find({ restaurantId, isAvailable: true, isPopular: true })
      .sort({ totalOrders: -1 })
      .limit(limit);
  }
}

export const foodService = new FoodService();
