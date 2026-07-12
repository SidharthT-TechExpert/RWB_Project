import axios from 'axios';
import {
  setCache,
  getCache,
  getRedisClient,
  CACHE_TTL,
  createLogger,
} from '@quickbite/shared';
import { SearchHistory } from '../models/SearchHistory';

const logger = createLogger('search-service');
const RESTAURANT_URL = process.env.RESTAURANT_SERVICE_URL || 'http://localhost:3003';
const FOOD_URL = process.env.FOOD_SERVICE_URL || 'http://localhost:3004';

export interface SearchFilters {
  city?: string;
  cuisineTypes?: string[];
  priceRange?: number[];
  rating?: number;
  features?: string[];
  isVegetarian?: boolean;
  maxPrepTime?: number;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export class SearchService {
  async searchAll(
    query: string,
    filters: SearchFilters = {},
    userId?: string
  ): Promise<{
    restaurants: unknown[];
    foodItems: unknown[];
    cuisines: string[];
  }> {
    const cacheKey = `search:all:${query}:${JSON.stringify(filters)}`;
    const cached = await getCache<{ restaurants: unknown[]; foodItems: unknown[]; cuisines: string[] }>(cacheKey);
    if (cached) return cached;

    const [restaurantsRes, foodRes] = await Promise.allSettled([
      axios.get(`${RESTAURANT_URL}/api/v1/restaurants/search`, {
        params: { q: query, ...filters },
      }),
      axios.get(`${FOOD_URL}/api/v1/food/search`, {
        params: { q: query },
      }),
    ]);

    const restaurants = restaurantsRes.status === 'fulfilled' ? restaurantsRes.value.data.data : [];
    const foodItems = foodRes.status === 'fulfilled' ? foodRes.value.data.data : [];

    // Extract unique cuisines from restaurant results
    const cuisineSet = new Set<string>();
    if (Array.isArray(restaurants)) {
      restaurants.forEach((r: { cuisineTypes?: string[] }) => {
        r.cuisineTypes?.forEach((c: string) => cuisineSet.add(c));
      });
    }

    const result = {
      restaurants,
      foodItems,
      cuisines: [...cuisineSet],
    };

    await setCache(cacheKey, result, CACHE_TTL.SHORT);

    // Save search history (non-blocking)
    SearchHistory.create({
      userId,
      query,
      type: 'restaurant',
      resultsCount: Array.isArray(restaurants) ? restaurants.length : 0,
    }).catch(() => {});

    return result;
  }

  async searchRestaurants(query: string, filters: SearchFilters = {}) {
    try {
      const res = await axios.get(`${RESTAURANT_URL}/api/v1/restaurants/search`, {
        params: { q: query, ...filters },
      });
      return res.data.data;
    } catch {
      return [];
    }
  }

  async searchFood(query: string, restaurantId?: string, filters: SearchFilters = {}) {
    try {
      const res = await axios.get(`${FOOD_URL}/api/v1/food/search`, {
        params: { q: query, restaurantId, ...filters },
      });
      return res.data.data;
    } catch {
      return [];
    }
  }

  async getPopularSearches(limit = 10): Promise<string[]> {
    const cacheKey = 'search:popular';
    const cached = await getCache<string[]>(cacheKey);
    if (cached) return cached;

    const results = await SearchHistory.aggregate([
      { $group: { _id: '$query', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      { $project: { _id: 0, query: '$_id' } },
    ]);

    const queries = results.map((r) => r.query);
    await setCache(cacheKey, queries, CACHE_TTL.LONG);
    return queries;
  }

  async getRecentSearches(userId: string, limit = 10): Promise<string[]> {
    const history = await SearchHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .distinct('query');
    return history;
  }

  async clearSearchHistory(userId: string): Promise<void> {
    await SearchHistory.deleteMany({ userId });
  }

  async getSuggestions(query: string): Promise<string[]> {
    if (!query || query.length < 2) return [];

    const cacheKey = `suggestions:${query}`;
    const cached = await getCache<string[]>(cacheKey);
    if (cached) return cached;

    const results = await SearchHistory.aggregate([
      { $match: { query: { $regex: `^${query}`, $options: 'i' } } },
      { $group: { _id: '$query', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
      { $project: { _id: 0, query: '$_id' } },
    ]);

    const suggestions = results.map((r) => r.query);
    await setCache(cacheKey, suggestions, CACHE_TTL.SHORT);
    return suggestions;
  }

  async trackSearchClick(query: string, resultId: string, resultType: string): Promise<void> {
    const redis = getRedisClient();
    const key = `click:${resultType}:${resultId}`;
    await redis.zincrby('search:clicks', 1, key);
    logger.info(`Search click tracked: ${query} -> ${resultType}:${resultId}`);
  }
}

export const searchService = new SearchService();
