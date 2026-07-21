import { Restaurant } from '../models/Restaurant';
import { FoodItem } from '../models/FoodItem';
import { SearchHistory } from '../models/SearchHistory';
import { setCache, getCache, getRedisClient } from '../config/redis';
import { RESTAURANT_STATUS, CACHE_TTL } from '../constants';
import { logger } from '../config/logger';

export class SearchService {
  async searchAll(query: string, filters: { city?: string; cuisineTypes?: string[]; priceRange?: number[]; rating?: number; sortBy?: string; page?: number; limit?: number } = {}, userId?: string) {
    const cacheKey = `search:all:${query}:${JSON.stringify(filters)}`;
    const cached = await getCache(cacheKey);
    if (cached) return cached;

    const restaurantFilter: Record<string, unknown> = { status: RESTAURANT_STATUS.ACTIVE, $text: { $search: query } };
    if (filters.city) restaurantFilter['address.city'] = { $regex: filters.city, $options: 'i' };
    if (filters.cuisineTypes?.length) restaurantFilter.cuisineTypes = { $in: filters.cuisineTypes };
    if (filters.priceRange?.length) restaurantFilter.priceRange = { $in: filters.priceRange };
    if (filters.rating) restaurantFilter.averageRating = { $gte: filters.rating };

    const [restaurants, foodItems] = await Promise.all([
      Restaurant.find(restaurantFilter, { score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' } }).limit(20),
      FoodItem.find({ $text: { $search: query }, isAvailable: true }, { score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' } }).limit(20),
    ]);

    const cuisineSet = new Set<string>();
    restaurants.forEach((r) => r.cuisineTypes?.forEach((c: string) => cuisineSet.add(c)));

    const result = { restaurants, foodItems, cuisines: [...cuisineSet] };
    await setCache(cacheKey, result, CACHE_TTL.SHORT);

    SearchHistory.create({ userId, query, type: 'restaurant', resultsCount: restaurants.length }).catch(() => {});
    return result;
  }

  async getPopularSearches(limit = 10): Promise<string[]> {
    const cached = await getCache<string[]>('search:popular');
    if (cached) return cached;
    const results = await SearchHistory.aggregate([
      { $group: { _id: '$query', count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: limit },
      { $project: { _id: 0, query: '$_id' } },
    ]);
    const queries = results.map((r) => r.query);
    await setCache('search:popular', queries, CACHE_TTL.LONG);
    return queries;
  }

  async getRecentSearches(userId: string, limit = 10): Promise<string[]> {
    return SearchHistory.find({ userId }).sort({ createdAt: -1 }).limit(limit).distinct('query');
  }

  async clearSearchHistory(userId: string): Promise<void> {
    await SearchHistory.deleteMany({ userId });
  }

  async getSuggestions(query: string): Promise<string[]> {
    if (!query || query.length < 2) return [];
    const cached = await getCache<string[]>(`suggestions:${query}`);
    if (cached) return cached;
    const results = await SearchHistory.aggregate([
      { $match: { query: { $regex: `^${query}`, $options: 'i' } } },
      { $group: { _id: '$query', count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 8 },
      { $project: { _id: 0, query: '$_id' } },
    ]);
    const suggestions = results.map((r) => r.query);
    await setCache(`suggestions:${query}`, suggestions, CACHE_TTL.SHORT);
    return suggestions;
  }

  async trackSearchClick(query: string, resultId: string, resultType: string): Promise<void> {
    try {
      const redis = getRedisClient();
      await redis.zincrby('search:clicks', 1, `${resultType}:${resultId}`);
    } catch { /* non-critical */ }
    logger.info(`Search click tracked: ${query} -> ${resultType}:${resultId}`);
  }
}

export const searchService = new SearchService();
